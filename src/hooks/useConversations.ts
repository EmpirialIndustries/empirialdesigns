import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  repo_id?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: any[];
  commitUrl?: string;
}

export const useConversations = (userId: string | undefined, _repoId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Seed example conversations when user is available
  useEffect(() => {
    if (!userId) return;
    const seed: Conversation[] = [
      { id: 'conv-1', title: 'Example Portfolio Site', updated_at: new Date().toISOString() },
      { id: 'conv-2', title: 'Bakery Redesign', updated_at: new Date(Date.now() - 86400000).toISOString() },
    ];
    setConversations(seed);
    if (!currentConversationId) setCurrentConversationId('conv-1');
  }, [userId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    setLoading(true);
    setTimeout(() => {
      if (currentConversationId === 'conv-1') {
        setMessages([
          { id: 'msg-1', role: 'user', content: 'Create a modern portfolio website for me.', timestamp: new Date(Date.now() - 60000) },
          { id: 'msg-2', role: 'assistant', content: 'I have successfully generated a responsive portfolio layout. What color scheme would you prefer?', timestamp: new Date(Date.now() - 30000) },
        ]);
      } else if (currentConversationId === 'conv-2') {
        setMessages([
          { id: 'msg-3', role: 'user', content: 'I need a bakery website with a menu.', timestamp: new Date(Date.now() - 86400000) },
          { id: 'msg-4', role: 'assistant', content: 'Sure, here is the new artisan bakery layout.', timestamp: new Date(Date.now() - 86300000) },
        ]);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, 300);
  }, [currentConversationId]);

  const createConversation = async () => {
    if (!userId) return null;
    const newId = `conv-${Date.now()}`;
    setConversations(prev => [{ id: newId, title: 'New Conversation', updated_at: new Date().toISOString() }, ...prev]);
    setCurrentConversationId(newId);
    setMessages([]);
    toast({ title: 'New conversation started', description: 'Start chatting to build your website!' });
    return newId;
  };

  const saveMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    // Messages are managed in component state; nothing to persist
    void message;
  };

  const deleteConversation = async (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    toast({ title: 'Conversation deleted' });
  };

  const updateConversationTitle = async (id: string, title: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  return {
    conversations,
    currentConversationId,
    messages,
    loading,
    setMessages,
    setCurrentConversationId,
    createConversation,
    saveMessage,
    deleteConversation,
    updateConversationTitle,
  };
};
