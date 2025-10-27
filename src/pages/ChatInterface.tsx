import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, LogOut, Menu } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Repo {
  id: string;
  repo_owner: string;
  repo_name: string;
  github_token: string | null;
}

const ChatInterface = () => {
  const [user, setUser] = useState<User | null>(null);
  const [repo, setRepo] = useState<Repo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication and load repo
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user's repository
        const { data: repoData, error } = await supabase
          .from('user_repos')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && repoData) {
          setRepo(repoData);
          
          // Show initial greeting
          setMessages([{
            id: 'initial',
            role: 'assistant',
            content: "Hi there! 👋\nMy name is Empirial. How can I assist you today?\n\nI can help you with your GitHub repository and make code changes for you!",
            timestamp: new Date(),
          }]);
        }
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate('/');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

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
      const CHAT_URL = `https://vfysnkkzesbovtnmoccb.supabase.co/functions/v1/ai-chat`;
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeXNua2t6ZXNib3Z0bm1vY2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzg2NjcsImV4cCI6MjA2NzcxNDY2N30.a7oWYYvQtQtyiRX4bSFEOsqJyEbmOiP_3V3EKFXxMKk`,
        },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })).filter(m => m.role !== 'assistant' || m.content), { role: 'user', content: input }],
          repoOwner: repo?.repo_owner,
          repoName: repo?.repo_name,
          repoId: repo?.id,
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

      // Create initial assistant message
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

      setLoading(false);
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
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/20 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <img 
            src="/lovable-uploads/94f51cc3-f695-4449-8dc0-01c2e5cced2f.png" 
            alt="Empirial Designs Logo" 
            className="h-8 w-auto"
          />
        </div>
        
        <div className="flex-1 p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-full"
            onClick={() => setMessages([])}
          >
            New Chat
          </Button>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <div className="text-sm text-muted-foreground px-3">
            {user.email}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gradient">Empirial AI Assistant</h1>
              {repo && (
                <p className="text-xs text-muted-foreground">
                  Connected to: {repo.repo_owner}/{repo.repo_name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gradient mb-4">
                  Welcome to Empirial AI
                </h2>
                <p className="text-muted-foreground">
                  {repo 
                    ? "I'm ready to help with your repository!" 
                    : "Please connect a repository to get started."}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground elegant-shadow'
                        : 'bg-muted/50 border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-6 py-4 bg-muted/50 border border-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-12 rounded-full"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-full elegant-shadow"
                disabled={loading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
