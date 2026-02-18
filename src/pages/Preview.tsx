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
  Code2
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
import { doc, getDoc } from 'firebase/firestore';

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack
} from "@codesandbox/sandpack-react";

const FIREBASE_FUNCTION_URL = "https://us-central1-empirialdesigns.cloudfunctions.net";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  commitUrl?: string;
}

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
    if (!repo || !user) return;
    setLoadingFiles(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${FIREBASE_FUNCTION_URL}/getRepoTree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          owner: repo.repo_owner,
          repo: repo.repo_name,
        }),
      });

      if (!response.ok) throw new Error('Failed to load project files');
      const data = await response.json();

      setFiles(data.files);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({ title: "Error", description: "Failed to load project files.", variant: "destructive" });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
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

  if (!user || !repo) return null;

  return (
    <div className="h-screen flex bg-background">
      {/* Chat Sidebar */}
      <div className="w-96 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/repos')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h2 className="font-bold text-lg truncate">{repo.repo_name}</h2>
            <p className="text-sm text-muted-foreground truncate">{repo.repo_owner}</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && <Loader2 className="animate-spin h-6 w-6 text-primary mx-auto" />}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Make it purple..." className="flex-1 rounded-full" disabled={loading} />
            <Button type="submit" size="icon" className="rounded-full" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Preview Area (Sandpack) */}
      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background z-10">
          <h1 className="text-sm font-semibold flex items-center gap-2">
            Live Preview
            {loadingFiles && <Loader2 className="h-3 w-3 animate-spin" />}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant={showCode ? "secondary" : "ghost"} size="sm" onClick={() => setShowCode(!showCode)}>
              <Code2 className="h-4 w-4 mr-2" /> Code
            </Button>
          </div>
        </div>

        {loadingFiles && !files ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading project files...</span>
          </div>
        ) : files ? (
          <SandpackProvider
            files={files}
            template="react"
            theme="dark"
            options={{
              externalResources: ["https://cdn.tailwindcss.com"] // Essential for styling to work
            }}
          >
            <SandpackLayout style={{ height: "calc(100vh - 3.5rem)", border: "none" }}>
              {showCode && <SandpackCodeEditor style={{ height: "100%" }} />}
              <SandpackPreview
                style={{ height: "100%" }}
                showNavigator={true}
                showRefreshButton={true}
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
          <div className="flex-1 flex items-center justify-center text-destructive">
            Failed to load files.
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
