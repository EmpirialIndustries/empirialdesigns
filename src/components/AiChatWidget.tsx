import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2, Bot, LucideIcon } from 'lucide-react';
// Temporary fix for type mismatch
const IconBot = Bot as any;
const IconX = X as any;
const IconSend = Send as any;
const IconLoader2 = Loader2 as any;
const IconMessageCircle = MessageCircle as any;
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Placeholder URL - User needs to replace this
const DEFAULT_WEBHOOK_URL = 'http://localhost:5678/webhook-test/ai-website-editor'; // TODO: Replace with actual n8n webhook URL

export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m the Empirial AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simple Mock for demo without backend
      if (userMessage.content.toLowerCase().includes('mock') || userMessage.content.toLowerCase().includes('trial')) {
        const assistantId = (Date.now() + 1).toString();
        const initialMessage: Message = {
          id: assistantId,
          role: 'assistant',
          content: 'Initializing generation pipeline...',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, initialMessage]);

        // Step 1: Deepseek
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...' } : m));

        // Step 2: GPT-4o
        await new Promise(resolve => setTimeout(resolve, 3000));
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts...' } : m));

        // Step 3: Claude
        await new Promise(resolve => setTimeout(resolve, 3000));
        const finalContent = '🧠 **DeepSeek Coder V2** is generating the raw HTML/React structural blocks...\n\n🏎️ **GPT-4o** is now refining the UI, aligning layouts...\n\n🎨 **Claude 3.5 Sonnet** added marketing copy and polished the final presentation!';
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: finalContent } : m));

        setIsLoading(false);
        return;
      }

      // In a real scenario, you might want to proxy this through your backend to avoid CORS or hide the URL
      // For now, we'll try calling it directly.

      const response = await fetch(DEFAULT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: 'session-' + Date.now(), // Simple session ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Assuming n8n returns { output: "response text" } or similar. 
      // Adjust based on your actual n8n workflow response structure.
      const assistantMessageContent = data.output || data.message || data.text || "I received your message, but I'm not sure how to respond yet.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessageContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to connect to the assistant. Please try again later.",
        variant: "destructive",
      });

      // Add a local error message so the user knows
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={cn(
          "mb-4 w-[350px] sm:w-[400px] shadow-2xl transition-all duration-300 pointer-events-auto",
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none hidden"
        )}
      >
        <Card className="border-[#333] bg-[#0A0A0A] overflow-hidden rounded-2xl">
          <CardHeader className="p-4 border-b border-[#222] flex flex-row items-center justify-between space-y-0 bg-[#111]">
            <div className="flex items-center gap-2">
              <IconBot className="h-5 w-5 text-white/80" />
              <CardTitle className="text-sm font-bold tracking-wide text-white/90">Aura AI</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white/50 hover:text-white hover:bg-[#222]"
              onClick={() => setIsOpen(false)}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4 text-white">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm",
                      message.role === "user"
                        ? "ml-auto bg-[#2A2A2A] text-white/90 border border-[#444]"
                        : "bg-[#111] border border-[#222] text-white/80"
                    )}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 text-sm bg-[#111] border border-[#222]">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t border-[#222] bg-[#111]">
            <form
              onSubmit={handleSendMessage}
              className="flex w-full items-center space-x-2"
            >
              <Input
                placeholder="Ask Aura AI..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#1A1A1A] border-[#333] text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30 rounded-xl"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="bg-white text-black hover:bg-white/90 rounded-xl shrink-0">
                {isLoading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-2xl pointer-events-auto animate-in zoom-in duration-300 hover:scale-105 bg-white text-black hover:bg-white/90 border border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <IconX className="h-6 w-6" />
        ) : (
          <IconMessageCircle className="h-6 w-6" />
        )}
        <span className="sr-only">Toggle AI Chat</span>
      </Button>
    </div>
  );
};
