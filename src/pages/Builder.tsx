import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { githubLight } from '@codesandbox/sandpack-themes';
import {
  ArrowLeft, Send, Loader2, Download, RefreshCw,
  Monitor, Code2, Play, ChevronDown, Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { LovableSidebar } from '@/components/LovableSidebar';
import {
  callClaude, parseFiles, serializeVfs, getSavedApiKey,
  type ClaudeMessage,
} from '@/lib/claude';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface Project {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  files: Record<string, string> | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Default starter files shown while generating
const LOADING_FILES: Record<string, string> = {
  '/App.js': `export default function App() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'sans-serif', background:'#f5f5f5' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:36, marginBottom:12 }}>✨</div>
        <p style={{ color:'#666', fontSize:14 }}>Generating your app…</p>
      </div>
    </div>
  );
}`,
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

const Builder = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<Record<string, string>>(LOADING_FILES);
  const [chatHistory, setChatHistory] = useState<ClaudeMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [projectLoaded, setProjectLoaded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMock = useRef(false);

  /* ---------------------------------------------------------------- */
  /* Auth                                                               */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const mock = localStorage.getItem('empirial_mock_login') === 'true';
    isMock.current = mock;
    if (mock) {
      setUser({ uid: 'mock-123', email: 'demo@empirial.com', displayName: 'Empirial' } as unknown as User);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else navigate('/auth');
    });
    return () => unsub();
  }, [navigate]);

  /* ---------------------------------------------------------------- */
  /* Load project                                                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!user || !projectId || projectLoaded) return;

    const load = async () => {
      try {
        let proj: Project | null = null;

        if (isMock.current) {
          const raw = sessionStorage.getItem(`project-${projectId}`);
          if (raw) proj = JSON.parse(raw);
        } else {
          const snap = await getDoc(doc(db, 'projects', projectId));
          if (snap.exists()) {
            proj = { id: snap.id, ...snap.data() } as Project;
          }
        }

        if (!proj) {
          toast({ title: 'Project not found', variant: 'destructive' });
          navigate('/dashboard');
          return;
        }

        setProject(proj);
        setProjectLoaded(true);

        if (proj.files && Object.keys(proj.files).length > 0) {
          // Already generated — load saved VFS
          setFiles(proj.files);
          setChatHistory([
            { role: 'user', content: proj.prompt },
            { role: 'assistant', content: `I've loaded your existing project. What would you like to change?` },
          ]);
          setMessages([
            { id: '1', role: 'assistant', content: `Welcome back! Your project **"${proj.title}"** is loaded. What would you like to change?` },
          ]);
        } else {
          // First load — generate from prompt
          setMessages([
            { id: '1', role: 'assistant', content: `✨ Generating **"${proj.title}"** from your prompt…` },
          ]);
          await generateFromPrompt(proj);
        }
      } catch (err: any) {
        console.error(err);
        toast({ title: 'Error loading project', description: err.message, variant: 'destructive' });
      }
    };

    load();
  }, [user, projectId, projectLoaded]);

  /* ---------------------------------------------------------------- */
  /* Auto-scroll chat                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  /* ---------------------------------------------------------------- */
  /* Initial generation                                                 */
  /* ---------------------------------------------------------------- */
  const generateFromPrompt = async (proj: Project) => {
    const apiKey = getSavedApiKey();
    if (!apiKey) {
      setMessages([{
        id: 'no-key',
        role: 'assistant',
        content: '⚠️ No API key set. Click the **⚙️ gear icon** in the sidebar to add your Anthropic key, then refresh.',
      }]);
      return;
    }

    setGenerating(true);

    try {
      const userMsg: ClaudeMessage = {
        role: 'user',
        content: `Build me a complete React web app: ${proj.prompt}`,
      };

      const response = await callClaude(apiKey, [userMsg]);
      const parsedFiles = parseFiles(response);

      if (Object.keys(parsedFiles).length === 0) {
        throw new Error('Claude didn\'t return any files. Try rephrasing your prompt.');
      }

      setFiles(parsedFiles);
      setChatHistory([userMsg, { role: 'assistant', content: response }]);

      const successMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Your app is ready! I generated ${Object.keys(parsedFiles).length} file${Object.keys(parsedFiles).length !== 1 ? 's' : ''}:\n\n${Object.keys(parsedFiles).map(f => `- \`${f}\``).join('\n')}\n\nWhat would you like to change?`,
      };
      setMessages([successMsg]);

      // Save to Firestore / sessionStorage
      await saveFiles(proj.id, parsedFiles);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: 'gen-err',
        role: 'assistant',
        content: `❌ Generation failed: ${err.message}`,
      };
      setMessages([errMsg]);
    } finally {
      setGenerating(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Save VFS                                                           */
  /* ---------------------------------------------------------------- */
  const saveFiles = async (pid: string, vfs: Record<string, string>) => {
    try {
      if (isMock.current) {
        const raw = sessionStorage.getItem(`project-${pid}`);
        const proj = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(`project-${pid}`, JSON.stringify({ ...proj, files: vfs }));
      } else {
        await updateDoc(doc(db, 'projects', pid), {
          files: vfs,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Debounced auto-save when files change
  useEffect(() => {
    if (!project || !projectLoaded || files === LOADING_FILES) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveFiles(project.id, files);
    }, 2500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [files, project, projectLoaded]);

  /* ---------------------------------------------------------------- */
  /* Chat send                                                          */
  /* ---------------------------------------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || chatLoading || generating || !project) return;

    const apiKey = getSavedApiKey();
    if (!apiKey) {
      toast({ title: 'API key missing', description: 'Add your key via the gear icon.', variant: 'destructive' });
      return;
    }

    const userText = input.trim();
    setInput('');
    setChatLoading(true);

    const userChatMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages((prev) => [...prev, userChatMsg]);

    try {
      // Build context: include current VFS in the next user message
      const contextMsg = `Here are the current project files:\n\n${serializeVfs(files)}\n\nUser request: ${userText}`;

      const newClaudeHistory: ClaudeMessage[] = [
        ...chatHistory,
        { role: 'user', content: contextMsg },
      ];

      const response = await callClaude(apiKey, newClaudeHistory);
      const parsedFiles = parseFiles(response);

      if (Object.keys(parsedFiles).length > 0) {
        // Merge new files into VFS (preserving any files Claude didn't touch)
        setFiles((prev) => ({ ...prev, ...parsedFiles }));
      }

      // Update Claude history (use simple user text, not the full context, to keep tokens down)
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: response },
      ]);

      const assistantChatMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: Object.keys(parsedFiles).length > 0
          ? `Done! Updated ${Object.keys(parsedFiles).length} file${Object.keys(parsedFiles).length !== 1 ? 's' : ''}. Anything else?`
          : response,
      };
      setMessages((prev) => [...prev, assistantChatMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `❌ Error: ${err.message}`,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------------------------------------------------------------- */
  /* Export ZIP                                                         */
  /* ---------------------------------------------------------------- */
  const handleExport = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([path, content]) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      zip.file(cleanPath, content);
    });
    // Add a minimal index.html
    zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project?.title || 'App'}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${project?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'project'}.zip`);

    toast({ title: 'Downloaded!', description: 'Your project ZIP is saved.' });
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                             */
  /* ---------------------------------------------------------------- */
  if (!user) return null;

  // Sandpack needs at least /App.js
  const sandpackFiles = Object.fromEntries(
    Object.entries(files).map(([path, code]) => [path, { code }])
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <LovableSidebar userEmail={user?.email} />

      {/* Main split pane */}
      <div className="flex-1 flex min-w-0">

        {/* ── LEFT: Chat Pane ── */}
        <div className="w-[380px] shrink-0 flex flex-col bg-[#0a0a0a] border-r border-white/10">

          {/* Header */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90 truncate">
                {project?.title || 'Loading…'}
              </p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Aura AI</p>
            </div>
            {(generating || chatLoading) && (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-white/50">Starting up…</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-white/8 border border-white/10 text-white/85'
                }`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {(chatLoading) && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/10">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 shrink-0 border-t border-white/10">
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a change…"
                disabled={generating || chatLoading}
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none px-2 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatLoading || generating}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sandpack Stage ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f5]">

          {/* Stage Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 bg-white shrink-0">
            {/* Preview / Code toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Play className="w-3 h-3" /> Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Code2 className="w-3 h-3" /> Code
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => project && generateFromPrompt(project)}
                disabled={generating || chatLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export ZIP
              </button>
              <div className="h-4 w-px bg-gray-200" />
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
                Deploy
              </button>
            </div>
          </div>

          {/* Sandpack */}
          <div className="flex-1 overflow-hidden">
            <SandpackProvider
              key={JSON.stringify(Object.keys(files))} // re-init when file list changes
              template="react"
              theme={viewMode === 'code' ? githubLight : undefined}
              files={sandpackFiles}
              options={{
                visibleFiles: Object.keys(files) as any,
                activeFile: '/App.js',
                externalResources: [],
              }}
            >
              {viewMode === 'preview' ? (
                <SandpackPreview
                  style={{ height: '100%', border: 'none' }}
                  showNavigator={false}
                  showRefreshButton
                />
              ) : (
                <div className="flex h-full">
                  <div className="w-48 border-r border-gray-200 overflow-auto bg-white">
                    <SandpackFileExplorer />
                  </div>
                  <div className="flex-1 overflow-auto">
                    <SandpackCodeEditor
                      style={{ height: '100%' }}
                      showTabs
                      showLineNumbers
                      showInlineErrors
                      wrapContent
                    />
                  </div>
                </div>
              )}
            </SandpackProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
