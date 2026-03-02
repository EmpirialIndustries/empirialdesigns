import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  LogOut,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  Crosshair,
  FolderOpen,
  X,
  FileCode,
  Loader2,
  Check,
  Code2,
  Plus,
  Mic,
  ArrowUp,
  Monitor,
  Share2,
  Github,
  Globe,
  Settings,
  ChevronDown,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack
} from "@codesandbox/sandpack-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FIREBASE_FUNCTION_URL = "https://us-central1-empirialdesigns.cloudfunctions.net";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  commitUrl?: string;
}

// Default files for new projects
const DEFAULT_FILES = {
  '/App.js': { code: `export default function App() {\n  return (\n    <div className="min-h-screen bg-[#000] text-white flex items-center justify-center font-sans">\n      <div className="text-center space-y-4 max-w-lg mx-auto p-8 border border-[#222] rounded-2xl bg-[#0a0a0a]">\n        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Welcome to Empirial AI</h1>\n        <p className="text-white/60">Your blank canvas is ready. Prompt the AI below to start building your custom interface.</p>\n      </div>\n    </div>\n  );\n}` },
  '/index.js': { code: `import React, { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\nconst root = createRoot(document.getElementById("root"));\nroot.render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);` },
  '/public/index.html': { code: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Empirial Preview</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>` },
};

// Component to handle auto-saving files to Firestore
const DebouncedSave = ({ repoId }: { repoId: string }) => {
  const { sandpack } = useSandpack();

  useEffect(() => {
    if (!sandpack.files || Object.keys(sandpack.files).length === 0) return;

    const timeout = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'user_repos', repoId), {
          vfs: sandpack.files,
          last_updated: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to auto-save to cloud:", err);
      }
    }, 2500); // 2.5 second debounce

    return () => clearTimeout(timeout);
  }, [sandpack.files, repoId]);

  return null;
};

interface Repo {
  id: string;
  repo_owner: string;
  repo_name: string;
  repo_url: string;
  deploy_url?: string;
  created_at: string;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
}

const Preview = () => {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Core state
  const [user, setUser] = useState<User | null>(null);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Sandpack state
  const [files, setFiles] = useState<any>(null); // Sandpack files object
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Inspector state (Simplified for Sandpack overlay if needed, or disabled for now)
  const [showCode, setShowCode] = useState(false);

  // Auth and repo loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (repoId) loadRepo(repoId);
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate, repoId]);

  const loadRepo = async (id: string) => {
    try {
      const docRef = doc(db, 'user_repos', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setRepo({
          id: docSnap.id,
          repo_owner: data.repo_owner,
          repo_name: data.repo_name,
          repo_url: data.repo_url,
          deploy_url: data.deploy_url,
          created_at: data.created_at
        });
      } else {
        toast({ title: "Error", description: "Repository not found", variant: "destructive" });
        navigate('/repos');
      }
    } catch (error) {
      console.error("Error loading repo:", error);
      navigate('/repos');
    }
  };

  // Load files for Sandpack
  useEffect(() => {
    if (repo && !files && user) {
      loadRepoFiles();
    }
  }, [repo, user]);

  const loadRepoFiles = async () => {
    if (!repoId) return;
    setLoadingFiles(true);

    try {
      const docRef = doc(db, 'user_repos', repoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // If a Virtual File System structure exists, use it. Otherwise use defaults.
        if (data.vfs && Object.keys(data.vfs).length > 0) {
          setFiles(data.vfs);
        } else {
          setFiles(DEFAULT_FILES);
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast({ title: "Error", description: "Failed to load project files.", variant: "destructive" });
      setFiles(DEFAULT_FILES);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleExportZip = async () => {
    if (!files || !repo) return;
    try {
      setLoading(true);
      toast({ title: "Zipping project...", description: "Preparing your files for download." });

      const zip = new JSZip();

      // Add existing sandpack files
      Object.entries(files).forEach(([path, fileObj]: [string, any]) => {
        const zipPath = path.startsWith('/') ? path.substring(1) : path;
        zip.file(zipPath, fileObj.code);
      });

      // Scaffold a basic package.json if it doesn't exist to make it runnable locally
      if (!files['/package.json']) {
        const packageJson = {
          name: repo.repo_name || "empirial-export",
          version: "1.0.0",
          private: true,
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1",
            "lucide-react": "latest"
          },
          scripts: {
            "start": "react-scripts start",
            "build": "react-scripts build"
          }
        };
        zip.file('package.json', JSON.stringify(packageJson, null, 2));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${repo.repo_name || 'project'}.zip`);

      toast({
        title: "Export Successful!",
        description: "Your customized code has been downloaded.",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: "Could not generate ZIP file.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !repo || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Mock / Trial handler logic - multi model step
      if (input.toLowerCase().includes('mock') || input.toLowerCase().includes('trial')) {
        const assistantId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, {
          id: assistantId,
          role: 'assistant',
          content: 'Initializing generation pipeline...',
          timestamp: new Date(),
        }]);

        // Step 1: Deepseek
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...' } : m));

        // Step 2: GPT-4o
        await new Promise(resolve => setTimeout(resolve, 3000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...' } : m));

        // Step 3: Claude
        await new Promise(resolve => setTimeout(resolve, 3000));
        const finalContent = '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...\n\n🎨 **Claude 3.5 Sonnet** added marketing copy and polished the final visual presentation!\n\n*(Preview updated successfully)*';

        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m));

        // Push a mock update to Sandpack
        if (files) {
          const newFiles = { ...files };
          newFiles['/App.js'] = { code: `export default function App() {\n  return (\n    <div className="min-h-screen bg-[#000] text-white flex items-center justify-center font-sans">\n      <div className="text-center space-y-4 max-w-lg mx-auto p-8 border border-[#222] rounded-2xl bg-[#0a0a0a]">\n        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Generated by Empire AI</h1>\n        <p className="text-white/60">This layout was structured by DeepSeek, refined by GPT-4o, and narrated by Claude. Your custom multi-model pipeline works beautifully.</p>\n      </div>\n    </div>\n  );\n}` };
          setFiles(newFiles);
        }

        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const response = await fetch(`${FIREBASE_FUNCTION_URL}/aiChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          repoOwner: repo.repo_owner,
          repoName: repo.repo_name,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let streamDone = false;

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                ));
              }
            } catch (e) { }
          }
        }
      }

      // Apply changes to Sandpack locally
      applyAiChangesToSandpack(assistantContent);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyAiChangesToSandpack = (aiContent: string) => {
    // Regex to find <file path="...">...</file> blocks
    const fileRegex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
    const newFiles = { ...files };
    let match;
    let changesCount = 0;

    while ((match = fileRegex.exec(aiContent)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();

      // Ensure keys match Sandpack format (root absolute paths)
      const distinctPath = path.startsWith('/') ? path : '/' + path;
      newFiles[distinctPath] = { code: content };
      changesCount++;
    }

    if (changesCount > 0) {
      setFiles(newFiles);
      toast({ title: "Preview Updated", description: `Applied changes to ${changesCount} files.` });
    }
  };

  return (
    <div className="h-screen flex bg-[#000000] text-white font-sans overflow-hidden font-inter">
      {/* Chat Sidebar (Left) */}
      <div className="w-[400px] border-r border-[#222] bg-[#0A0A0A] flex flex-col relative z-20 shrink-0">

        {/* Sidebar Header */}
        <div className="h-14 px-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 py-1 px-2 rounded-md transition-colors">
            <div className="w-5 h-5 rounded overflow-hidden bg-indigo-500/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            </div>
            <span className="font-medium text-sm text-white/90 truncate max-w-[150px]">
              {repo.repo_name}
            </span>
            <ChevronDown className="h-3 w-3 text-white/50" />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-white/10 text-white/50 hover:text-white" onClick={() => navigate('/repos')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-white/10 text-white/50 hover:text-white cursor-not-allowed">
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-white/10 text-white/50 hover:text-white cursor-not-allowed">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Message List */}
        <ScrollArea className="flex-1 p-4 pb-0">
          <div className="space-y-6 pb-4">
            {messages.length === 0 && (
              <div className="text-white/40 text-sm py-4">
                <p>Previewing last saved version</p>
                <p className="mt-2">— Modify the Contact form to call `.netlify/functions/send-email`</p>
                <p>— Set up environment variables in Netlify</p>
                <p>— This will send emails directly to info@...</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                    ? 'bg-[#2A2A2A] text-white/90 rounded-br-sm'
                    : 'bg-transparent text-white/80 border border-[#222]'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-transparent border border-[#222] flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/50">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent shrink-0">

          {/* Quick Prompts */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            <button className="whitespace-nowrap rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] px-3 py-1.5 text-xs text-white/70 transition-colors">
              Check the address updates
            </button>
            <button className="whitespace-nowrap rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] px-3 py-1.5 text-xs text-white/70 transition-colors">
              Add second location to map
            </button>
          </div>

          {/* Credits Panel */}
          <div className="flex items-center justify-between bg-[#111] border border-[#222] rounded-xl p-3 mb-3">
            <span className="text-xs text-white/60 font-medium">0.70 credits remaining</span>
            <Button size="sm" className="h-7 cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs px-3 font-medium">
              Add credits
            </Button>
          </div>

          {/* Main Input Box */}
          <div className="bg-[#151515] border border-[#2A2A2A] focus-within:border-[#444] rounded-xl p-3 flex flex-col gap-3 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Empirial AI..."
              className="w-full bg-transparent resize-none outline-none text-sm text-white placeholder:text-white/30 h-[40px] max-h-[150px]"
              disabled={loading}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="h-6 w-6 flex items-center justify-center rounded-full bg-[#2A2A2A] hover:bg-[#333] text-white/60 transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-1.5 h-6 px-2.5 rounded-md hover:bg-[#2A2A2A] text-white/50 text-xs font-medium transition-colors">
                  <Crosshair className="h-3 w-3" />
                  Visual edits
                </button>
                <div className="w-[1px] h-3 bg-[#333]" />
                <button className="h-6 px-2.5 rounded-md hover:bg-[#2A2A2A] text-white/50 text-xs font-medium transition-colors">
                  Plan
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#2A2A2A] text-white/50 transition-colors">
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowUp className="h-4 w-4 font-bold" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Preview Area (Right) */}
      <div className="flex-1 flex flex-col relative z-10 bg-[#0F0F0F]">

        {/* Top bar (Like a browser tab / tools) */}
        <div className="h-14 px-4 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between shrink-0">

          <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-md border border-[#222]">
            <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-sm bg-[#2A2A2A] text-white hover:bg-[#333] shadow-sm">
              <Monitor className="h-3.5 w-3.5 mr-1.5" /> Preview
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCode(!showCode)} className="h-7 px-2.5 rounded-sm text-white/50 hover:text-white hover:bg-[#333]">
              <Code2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 rounded-sm text-white/50 hover:text-white hover:bg-[#333]">
              <Globe className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 rounded-sm text-white/50 hover:text-white hover:bg-[#333]">
              <span className="mb-1">...</span>
            </Button>
          </div>

          <div className="flex-1 max-w-[400px] mx-4">
            <div className="flex items-center gap-2 h-8 px-3 rounded-md bg-[#111] border border-[#222] w-full text-xs text-white/50">
              <Monitor className="h-3 w-3" />
              <span className="flex-1 font-mono">/</span>
              <RefreshCw className="h-3 w-3 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full border border-[#333] text-white hover:bg-[#222]">
              <Share2 className="h-3.5 w-3.5 mr-2" /> Share
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-[#333] text-white hover:bg-[#222]">
              <Github className="h-4 w-4" />
            </Button>
            {/* Gradient Upgrade Button */}
            <Button size="sm" className="h-8 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 font-medium tracking-wide">
              <Zap className="h-3.5 w-3.5 mr-1.5 fill-current" /> Upgrade
            </Button>
            <Button size="sm" onClick={handleExportZip} className="h-8 px-4 rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white font-medium transition-colors">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Code (ZIP)
            </Button>
            <Button size="sm" className="h-8 px-4 rounded-full bg-white hover:bg-white/90 text-black border-0 font-bold transition-transform hover:scale-105">
              Publish
            </Button>
          </div>

        </div>

        {/* Browser Area / Sandpack */}
        <div className="flex-1 relative overflow-hidden bg-[#151515] p-2">
          <div className="w-full h-full rounded-xl overflow-hidden border border-[#222] shadow-2xl relative bg-white">
            {loadingFiles && !files ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F0F] z-50">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-white/50 text-sm font-medium tracking-wide">Initializing Builder Environment...</span>
                </div>
              </div>
            ) : files ? (
              <SandpackProvider
                files={files}
                template="react"
                theme="dark"
                options={{
                  externalResources: ["https://cdn.tailwindcss.com"]
                }}
              >
                {repoId && <DebouncedSave repoId={repoId} />}
                <SandpackLayout style={{ height: "100%", border: "none", borderRadius: 0, backgroundColor: 'transparent' }}>
                  {showCode && <SandpackCodeEditor style={{ height: "100%" }} />}
                  <SandpackPreview
                    style={{ height: "100%" }}
                    showNavigator={false}
                    showRefreshButton={false}
                  />
                </SandpackLayout>
              </SandpackProvider>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F0F] text-red-400 z-50">
                Failed to load files. Try refreshing the page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
