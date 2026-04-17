import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Send, FileCode, GitCommit, Loader2, File, X, Target, Crosshair, Eye, Plus, Mic, ArrowRight, ChevronDown, Globe, LayoutTemplate, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useConversations } from "@/hooks/useConversations";

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

const GenerateWebsite = () => {
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
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-create first conversation if none exists
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

  // Visual Inspector Logic
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
      !el.closest('.visual-inspector-overlay') &&
      !el.closest('.visual-inspector-controls')
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
        !c.startsWith('text-') &&
        !c.startsWith('bg-') &&
        !c.startsWith('p-') &&
        !c.startsWith('m-') &&
        !c.startsWith('w-') &&
        !c.startsWith('h-') &&
        !c.startsWith('flex') &&
        !c.startsWith('grid')
      );
      description = meaningfulClasses.join(' ') || elementInfo.tag;
    } else {
      description = `${elementInfo.tag} element`;
    }

    if (elementInfo.text) {
      description += ` ("${elementInfo.text}")`;
    }

    setSelectedComponent(description);
    setInspectorActive(false);
    toast({
      title: "Element selected",
      description: `Selected: ${description}`,
    });
  }, [inspectorActive, hoveredElement, getElementInfo, toast]);

  useEffect(() => {
    if (!inspectorActive) {
      setHoveredElement(null);
      return;
    }

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
      toast({
        title: "No conversation",
        description: "Please start a new conversation first.",
        variant: "destructive",
      });
      return;
    }

    // Build context message if files or component are selected
    let contextMessage = input;
    const contextParts: string[] = [];

    if (selectedFiles.length > 0) {
      contextParts.push(`Files to edit: ${selectedFiles.join(', ')}`);
    }
    if (selectedComponent) {
      contextParts.push(`Component/Section to edit: ${selectedComponent}`);
    }

    if (contextParts.length > 0) {
      contextMessage = `Context: ${contextParts.join(' | ')}\n\nRequest: ${input}`;
    }

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

    // Save user message
    await saveMessage(userMessage);

    try {
      // Handle mock/trial requests
      if (input.toLowerCase().includes('mock') || input.toLowerCase().includes('trial')) {
        const assistantId = (Date.now() + 1).toString();

        const initialMessage: Message = {
          id: assistantId,
          role: 'assistant',
          content: 'Initializing generation pipeline...',
          timestamp: new Date(),
          toolCalls: [],
        };

        setMessages((prev) => [...prev, initialMessage]);

        // Step 1: Deepseek
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...' } : m));

        // Step 2: GPT-4o
        await new Promise(resolve => setTimeout(resolve, 3000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...' } : m));

        // Step 3: Claude
        await new Promise(resolve => setTimeout(resolve, 3000));
        const finalContent = '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts, and standardizing components...\n\n🎨 **Claude 3.5 Sonnet** added marketing copy and polished the final visual presentation!\n\n*(Multi-model generation complete)*';

        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m));

        await saveMessage({
          role: 'assistant',
          content: finalContent,
        });

        setLoading(false);
        return;
      }

      const CHAT_URL = `/api/ai-chat`;
      const accessToken = await auth.currentUser?.getIdToken();
      if (!accessToken) throw new Error('Not authenticated');

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
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

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let streamDone = false;
      const toolCalls: ToolCall[] = [];
      let commitUrl = '';

      // Create initial assistant message
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        toolCalls: [],
      };
      setMessages(prev => [...prev, assistantMessage]);

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
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle tool calls
            if (parsed.type === 'tool_call') {
              const toolCall: ToolCall = {
                id: parsed.id || `tool_${Date.now()}`,
                name: parsed.name,
                status: parsed.status || 'running',
                input: parsed.input,
                output: parsed.output,
              };
              toolCalls.push(toolCall);
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, toolCalls: [...(m.toolCalls || []), toolCall] } : m
              ));
            }

            // Handle commit URL
            if (parsed.type === 'commit') {
              commitUrl = parsed.url;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, commitUrl } : m
              ));
            }

            // Handle regular content
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save complete assistant message
      await saveMessage({
        role: 'assistant',
        content: assistantContent,
        toolCalls,
        commitUrl: commitUrl || undefined,
      });

      setLoading(false);

      if (commitUrl) {
        toast({
          title: "Code committed!",
          description: "Your changes have been pushed to GitHub",
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      {/* Visual Inspector Overlay */}
      {inspectorActive && (
        <>
          <div
            className="fixed inset-0 bg-primary/5 backdrop-blur-[1px] z-[9998]"
            style={{ pointerEvents: 'none' }}
          />

          {hoveredElement && (
            <div
              style={highlightStyle}
              className="border-2 border-primary bg-primary/10 z-[9999] rounded"
            />
          )}

          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-background border-2 border-primary rounded-full px-6 py-3 shadow-2xl">
            <Eye className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium">Click any element to select it</span>
            {hoveredElement && (
              <Badge variant="secondary" className="ml-2">
                {getElementInfo(hoveredElement).component || getElementInfo(hoveredElement).tag}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setInspectorActive(false)}
              className="h-8 w-8 rounded-full ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <div className="min-h-screen flex w-full bg-[#030303] text-white overflow-hidden relative selection:bg-indigo-500/30">
        {/* Ambient Mesh Backgrounds */}
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

        {/* Split UI Layout */}
        <div className="flex-1 flex min-w-0 relative z-10">
          
          {/* LEFT PANE: Chat Area (35%) */}
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
                  <div className="text-center py-8">
                    <h2 className="text-lg font-bold text-white/90 mb-2">Workspace Ready</h2>
                    <p className="text-sm text-white/40">
                      {repo
                        ? "Describe the component you want to build."
                        : "Connect a repository to start building."}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white shadow-indigo-500/10 border border-white/10'
                            : 'bg-white/5 border border-white/10 text-white/90 shadow-xl'
                        }`}
                      >
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
                                    const inline = !match;
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        style={vscDarkPlus as any}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ fontSize: '11px', borderRadius: '0.5rem' }}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            {message.commitUrl && (
                              <div className="pt-3 border-t border-white/10">
                                <a
                                  href={message.commitUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-[11px] text-indigo-400 hover:text-indigo-300"
                                >
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
                    <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
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
                      {/* Dropdown Items exactly as before */}
                      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Files</div>
                      {repoFiles.filter(f => f.type === 'file').map(f => (
                        <DropdownMenuItem key={f.path} onClick={() => setSelectedFiles(p => p.includes(f.path) ? p.filter(x => x !== f.path) : [...p, f.path])} className="cursor-pointer text-xs">
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

          {/* RIGHT PANE: Dashboard Stage (65%) */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">

            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-[#f0ede8] pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[65%] h-[65%] rounded-full bg-[#93c5fd] opacity-70 blur-[100px]" />
              <div className="absolute top-[5%] left-[20%] w-[55%] h-[50%] rounded-full bg-white opacity-55 blur-[80px]" />
              <div className="absolute top-[15%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[#a78bfa] opacity-60 blur-[100px]" />
              <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[55%] rounded-full bg-[#f472b6] opacity-75 blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[5%] w-[50%] h-[50%] rounded-full bg-[#ec4899] opacity-65 blur-[90px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">

              {/* Hero + Prompt */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12 pb-6 min-h-[60%]">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-8 tracking-tight">
                  Ready to build,{' '}
                  <span className="capitalize">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Empirial'}
                  </span>?
                </h1>

                {/* Prompt Box */}
                <div className="w-full max-w-[580px] bg-[#f5f1eb] rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] p-5">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask Aura to build..."
                    rows={2}
                    className="w-full bg-transparent resize-none outline-none text-gray-800 text-[15px] placeholder:text-gray-400 leading-relaxed max-h-36 overflow-y-auto"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/60 hover:bg-white/80 border border-black/10 text-sm font-medium text-gray-700 transition-colors">
                        Build <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-md active:scale-95"
                      >
                        {loading
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <ArrowRight className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Panel */}
              <div className="mx-4 mb-4 bg-white/75 backdrop-blur-xl rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Tabs */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
                    {(['My projects', 'Recently viewed', 'Templates'] as const).map((label) => (
                      <button
                        key={label}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          label === 'My projects'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
                    Browse all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Project Grid */}
                <div className="p-4 grid grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* New project */}
                  <button className="group flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                    </div>
                    <span className="text-[11px] font-medium text-gray-400 group-hover:text-indigo-500 transition-colors">New project</span>
                  </button>

                  {[
                    { name: 'Portfolio Site', age: '2h ago', Icon: Globe },
                    { name: 'Bakery Redesign', age: 'Yesterday', Icon: LayoutTemplate },
                    { name: 'Coffee Shop', age: '3 days ago', Icon: Clock },
                  ].map(({ name, age, Icon }) => (
                    <button
                      key={name}
                      onClick={() => setCurrentConversationId(currentConversationId)}
                      className="group flex flex-col rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden text-left bg-white"
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
                        <Icon className="absolute bottom-2 right-2 w-5 h-5 text-indigo-300 opacity-60" />
                      </div>
                      <div className="px-3 py-2">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{age}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GenerateWebsite;
