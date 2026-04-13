import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Send, FileCode, GitCommit, Loader2, File, X, Target, Crosshair,
  Eye, Monitor, Smartphone, Code2, Play, Download, ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useConversations } from '@/hooks/useConversations';

interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  input?: any;
  output?: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  commitUrl?: string;
}

interface Repo {
  id: string;
  repo_owner: string;
  repo_name: string;
  github_token: string | null;
}

interface FileItem {
  type: 'file' | 'dir';
  path: string;
  name: string;
  size?: number;
}

const ChatInterface = () => {
  const [user, setUser] = useState<User | null>(null);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [repoFiles, setRepoFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [inspectorActive, setInspectorActive] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentConversationId,
    messages,
    setMessages,
    setCurrentConversationId,
    createConversation,
    saveMessage,
    deleteConversation,
  } = useConversations((user as any)?.uid ?? (user as any)?.id, repo?.id);

  useEffect(() => {
    const isMock = localStorage.getItem('empirial_mock_login') === 'true';
    if (isMock) {
      setUser({ uid: 'mock-123', email: 'demo@empirial.com' } as unknown as User);
      setRepo({ id: 'mock-repo', repo_owner: 'demo', repo_name: 'test-site', github_token: null });
      setRepoFiles([
        { type: 'file', path: 'index.html', name: 'index.html', size: 1024 },
        { type: 'file', path: 'src/App.tsx', name: 'App.tsx', size: 2048 },
        { type: 'file', path: 'src/styles/main.css', name: 'main.css', size: 512 },
        { type: 'file', path: 'src/components/Hero.tsx', name: 'Hero.tsx', size: 1200 },
        { type: 'dir', path: 'src/components', name: 'components' },
      ]);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser(firebaseUser);
      else navigate('/auth');
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (user && conversations.length === 0 && !currentConversationId) {
      createConversation();
    }
  }, [user, conversations, currentConversationId]);

  const handleSignOut = async () => {
    localStorage.removeItem('empirial_mock_login');
    try { await signOut(auth); } catch (_) {}
    toast({ title: 'Signed out', description: "You've been successfully signed out." });
    navigate('/auth');
  };

  const handleNewConversation = async () => {
    await createConversation();
  };

  // Visual Inspector
  const getElementInfo = useCallback((element: HTMLElement) => {
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList);
    const id = element.id || undefined;
    const text = element.textContent?.slice(0, 50) || undefined;
    let component = element.getAttribute('data-component');
    if (!component) {
      const componentClasses = classes.find(c =>
        c.includes('Hero') || c.includes('Navigation') || c.includes('Footer') ||
        c.includes('Sidebar') || c.includes('Contact') || c.includes('About') ||
        c.includes('Services') || c.includes('Portfolio') || c.includes('Testimonials') ||
        c.includes('Pricing') || c.includes('FAQ') || c.includes('Blog') || c.includes('CTA')
      );
      component = componentClasses;
    }
    return { tag, classes, id, text, component };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!inspectorActive) return;
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const targetElement = elements.find(el =>
      !el.closest('.visual-inspector-overlay') && !el.closest('.visual-inspector-controls')
    ) as HTMLElement;
    if (!targetElement || targetElement === hoveredElement) return;
    setHoveredElement(targetElement);
    const rect = targetElement.getBoundingClientRect();
    setHighlightStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      pointerEvents: 'none',
      transition: 'all 0.1s ease',
    });
  }, [inspectorActive, hoveredElement]);

  const handleInspectorClick = useCallback((e: MouseEvent) => {
    if (!inspectorActive || !hoveredElement) return;
    e.preventDefault();
    e.stopPropagation();
    const elementInfo = getElementInfo(hoveredElement);
    let description = '';
    if (elementInfo.component) {
      description = elementInfo.component;
    } else if (elementInfo.id) {
      description = `#${elementInfo.id}`;
    } else if (elementInfo.classes.length > 0) {
      const meaningfulClasses = elementInfo.classes.filter(c =>
        !c.startsWith('text-') && !c.startsWith('bg-') && !c.startsWith('p-') &&
        !c.startsWith('m-') && !c.startsWith('w-') && !c.startsWith('h-') &&
        !c.startsWith('flex') && !c.startsWith('grid')
      );
      description = meaningfulClasses.join(' ') || elementInfo.tag;
    } else {
      description = `${elementInfo.tag} element`;
    }
    if (elementInfo.text) description += ` ("${elementInfo.text}")`;
    setSelectedComponent(description);
    setInspectorActive(false);
    toast({ title: 'Element selected', description: `Selected: ${description}` });
  }, [inspectorActive, hoveredElement, getElementInfo, toast]);

  useEffect(() => {
    if (!inspectorActive) { setHoveredElement(null); return; }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleInspectorClick, true);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleInspectorClick, true);
    };
  }, [inspectorActive, handleMouseMove, handleInspectorClick]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!currentConversationId) {
      toast({ title: 'No conversation', description: 'Please start a new conversation first.', variant: 'destructive' });
      return;
    }

    let contextMessage = input;
    const contextParts: string[] = [];
    if (selectedFiles.length > 0) contextParts.push(`Files to edit: ${selectedFiles.join(', ')}`);
    if (selectedComponent) contextParts.push(`Component/Section to edit: ${selectedComponent}`);
    if (contextParts.length > 0) contextMessage = `Context: ${contextParts.join(' | ')}\n\nRequest: ${input}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFiles([]);
    setSelectedComponent('');
    setLoading(true);
    await saveMessage(userMessage);

    try {
      // Mock/trial mode
      if (input.toLowerCase().includes('mock') || input.toLowerCase().includes('trial')) {
        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: 'Initializing generation pipeline...', timestamp: new Date(), toolCalls: [] }]);
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...' } : m));
        await new Promise(r => setTimeout(r, 3000));
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...' } : m));
        await new Promise(r => setTimeout(r, 3000));
        const finalContent = '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...\n\n🎨 **Claude 3.5 Sonnet** added marketing copy and polished the final visual presentation!\n\n*(Multi-model generation complete)*';
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m));
        await saveMessage({ role: 'assistant', content: finalContent });
        setLoading(false);
        return;
      }

      const CHAT_URL = `/api/ai-chat`;
      const accessToken = await auth.currentUser?.getIdToken();
      if (!accessToken) throw new Error('Not authenticated');

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.role !== 'assistant' || m.content), { role: 'user', content: contextMessage }],
          repoOwner: repo?.repo_owner,
          repoName: repo?.repo_name,
          repoId: repo?.id,
          selectedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let streamDone = false;
      const toolCalls: ToolCall[] = [];
      let commitUrl = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), toolCalls: [] }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === 'tool_call') {
              const toolCall: ToolCall = {
                id: parsed.id || `tool_${Date.now()}`,
                name: parsed.name,
                status: parsed.status || 'running',
                input: parsed.input,
                output: parsed.output,
              };
              toolCalls.push(toolCall);
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] } : m));
            }
            if (parsed.type === 'commit') {
              commitUrl = parsed.url;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, commitUrl } : m));
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
            }
          } catch (_) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      await saveMessage({ role: 'assistant', content: assistantContent, toolCalls, commitUrl: commitUrl || undefined });
      setLoading(false);
      if (commitUrl) toast({ title: 'Code committed!', description: 'Your changes have been pushed to GitHub' });
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to get AI response', variant: 'destructive' });
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      {/* Visual Inspector Overlay */}
      {inspectorActive && (
        <>
          <div className="fixed inset-0 bg-primary/5 backdrop-blur-[1px] z-[9998]" style={{ pointerEvents: 'none' }} />
          {hoveredElement && (
            <div style={highlightStyle} className="border-2 border-primary bg-primary/10 z-[9999] rounded" />
          )}
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-background border-2 border-primary rounded-full px-6 py-3 shadow-2xl visual-inspector-controls">
            <Eye className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">Click any element to select it</span>
            {hoveredElement && (
              <Badge variant="secondary" className="ml-2">
                {getElementInfo(hoveredElement).component || getElementInfo(hoveredElement).tag}
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setInspectorActive(false)} className="h-8 w-8 rounded-full ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <div className="min-h-screen flex w-full bg-[#030303] text-white overflow-hidden relative selection:bg-indigo-500/30">
        {/* Ambient backgrounds */}
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <AppSidebar
          user={user}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={setCurrentConversationId}
          onDeleteConversation={deleteConversation}
          onSignOut={handleSignOut}
        />

        <div className="flex-1 flex min-w-0 relative z-10">

          {/* LEFT PANE — Chat (400px) */}
          <div className="w-[400px] xl:w-[450px] flex flex-col bg-[#050505]/60 backdrop-blur-3xl border-r border-white/10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">

            {/* Header */}
            <div className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-white/70 hover:text-white" />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white/90">Aura AI</h1>
                  {repo && (
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">
                      {repo.repo_owner}/{repo.repo_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-white/90 mb-1">Workspace Ready</h2>
                    <p className="text-sm text-white/40 max-w-[200px] mx-auto">
                      {repo ? 'Describe the change you want to make.' : 'Connect a repository to start building.'}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[90%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white shadow-indigo-500/10 border border-white/10'
                          : 'bg-white/5 border border-white/10 text-white/90 shadow-xl'
                      }`}>
                        {message.role === 'user' ? (
                          <p className="text-[13px] whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="space-y-3">
                            {message.toolCalls && message.toolCalls.length > 0 && (
                              <div className="space-y-1 pb-3 border-b border-white/10">
                                {message.toolCalls.map((tool) => (
                                  <div key={tool.id} className="flex items-center gap-2 text-[11px] text-white/50">
                                    {tool.status === 'running' && <Loader2 className="h-3 w-3 animate-spin text-white/40" />}
                                    {tool.status === 'complete' && <FileCode className="h-3 w-3 text-white/60" />}
                                    {tool.status === 'error' && <FileCode className="h-3 w-3 text-red-500" />}
                                    <span className="font-medium">{tool.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  code: ({ node, className, children, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return match ? (
                                      <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div" customStyle={{ fontSize: '11px', borderRadius: '0.5rem' }}>
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>{children}</code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            {message.commitUrl && (
                              <div className="pt-3 border-t border-white/10">
                                <a href={message.commitUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300">
                                  <GitCommit className="h-3 w-3" />
                                  View commit
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="rounded-2xl px-5 py-3 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                      <div className="flex gap-1.5 items-center h-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 shrink-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent">
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl p-3 shadow-2xl focus-within:bg-white/[0.05] transition-all duration-300">
                {(selectedFiles.length > 0 || selectedComponent) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedFiles.map((file) => (
                      <Badge key={file} variant="secondary" className="gap-1 bg-black/40 text-[10px] text-white/70 border border-white/10">
                        <File className="h-2.5 w-2.5" />
                        {file.split('/').pop()}
                        <X className="h-2.5 w-2.5 cursor-pointer hover:text-white" onClick={() => setSelectedFiles(prev => prev.filter(f => f !== file))} />
                      </Badge>
                    ))}
                    {selectedComponent && (
                      <Badge variant="default" className="gap-1 bg-white text-black text-[10px] border-0">
                        <Target className="h-2.5 w-2.5" />
                        {selectedComponent}
                        <X className="h-2.5 w-2.5 cursor-pointer hover:text-black/70" onClick={() => setSelectedComponent('')} />
                      </Badge>
                    )}
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0 text-white/40 hover:text-white hover:bg-white/5" disabled={loading || loadingFiles} type="button">
                        {loadingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-2xl border-white/10">
                      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Files</div>
                      {repoFiles.filter(f => f.type === 'file').map(f => (
                        <DropdownMenuItem
                          key={f.path}
                          onClick={() => setSelectedFiles(p => p.includes(f.path) ? p.filter(x => x !== f.path) : [...p, f.path])}
                          className="cursor-pointer text-xs"
                        >
                          <File className="h-3 w-3 mr-2 opacity-50" /> {f.path}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0 text-white/40 hover:text-white hover:bg-white/5" onClick={() => setInspectorActive(true)} title="Inspector" type="button">
                    <Crosshair className="h-4 w-4" />
                  </Button>

                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message the Builder..."
                    className="flex-1 h-10 border-0 bg-transparent text-sm text-white placeholder:text-white/30 focus-visible:ring-0 px-2"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-white text-black hover:bg-gray-200 shrink-0 font-bold shadow-lg transition-transform active:scale-95" disabled={loading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT PANE — Stage (remaining space) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#020202] relative z-10">

            {/* Stage Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0A0A0A]/40 backdrop-blur-md">
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setPreviewMode('preview')}
                  className={`flex items-center gap-1.5 px-4 py-1 rounded-md text-xs font-semibold transition-all ${previewMode === 'preview' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
                >
                  <Play className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => setPreviewMode('code')}
                  className={`flex items-center gap-1.5 px-4 py-1 rounded-md text-xs font-semibold transition-all ${previewMode === 'code' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Code
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`px-2.5 py-1 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
                    title="Desktop"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`px-2.5 py-1 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white'}`}
                    title="Mobile"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 rounded-md ml-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  Deploy
                </Button>
              </div>
            </div>

            {/* Stage Content */}
            <div className="flex-1 overflow-hidden p-4 md:p-8 flex flex-col items-center justify-center bg-[#050505]/40 relative">
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${deviceMode === 'desktop' ? 'w-full h-full' : 'w-[375px] h-full max-h-[812px]'} bg-[#111] rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col`}>
                {previewMode === 'preview' ? (
                  <div className="w-full h-full flex flex-col bg-white relative">
                    {/* Fake Browser Chrome */}
                    <div className="w-full h-10 bg-[#f8f9fa] border-b border-[#e9ecef] flex items-center px-4 shrink-0 justify-between">
                      <div className="flex gap-1.5 w-16">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="flex-1 max-w-sm bg-white border border-[#e9ecef] px-4 py-1 rounded-md text-[11px] text-gray-500 font-medium text-center shadow-sm truncate flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" /> localhost:3000
                      </div>
                      <div className="w-16" />
                    </div>
                    {/* Preview Placeholder */}
                    <div className="flex-1 w-full bg-white flex items-center justify-center flex-col gap-6 p-8 overflow-y-auto relative">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                      <Target className="w-12 h-12 text-indigo-500/20 animate-pulse relative z-10" />
                      <div className="text-center space-y-1 relative z-10">
                        <p className="text-sm font-semibold text-gray-700">Preview Engine Active</p>
                        <p className="text-xs text-gray-400">Describe what you want to build on the left</p>
                      </div>
                      <div className="w-full max-w-md space-y-4 mt-6 relative z-10">
                        <div className="h-40 bg-gray-100 rounded-xl animate-pulse w-full border border-gray-200" />
                        <div className="flex gap-4">
                          <div className="h-24 bg-gray-100 rounded-lg w-1/2 animate-pulse border border-gray-200" />
                          <div className="h-24 bg-gray-100 rounded-lg w-1/2 animate-pulse border border-gray-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1e1e1e] relative">
                    <ScrollArea className="h-full w-full">
                      <SyntaxHighlighter style={vscDarkPlus as any} language="tsx" PreTag="div" customStyle={{ margin: 0, padding: '2rem', background: 'transparent', fontSize: '13px' }}>
                        {`// Your generated code will appear here\nimport React from 'react';\n\nexport default function GeneratedApp() {\n  return (\n    <div className="min-h-screen bg-white">\n      {/* Chat with the AI on the left to build your site */}\n    </div>\n  );\n}`}
                      </SyntaxHighlighter>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatInterface;
