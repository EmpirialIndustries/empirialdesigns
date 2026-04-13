import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Mic, ChevronDown, ArrowRight, Loader2,
  Globe, LayoutTemplate, Clock,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  thumbnail?: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Portfolio Site', updatedAt: '2 hours ago' },
  { id: 'p2', name: 'Bakery Redesign', updatedAt: 'Yesterday' },
  { id: 'p3', name: 'Coffee Shop', updatedAt: '3 days ago' },
];

type Tab = 'my-projects' | 'recently-viewed' | 'templates';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('my-projects');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const isMock = localStorage.getItem('empirial_mock_login') === 'true';
    if (isMock) {
      setUser({ uid: 'mock-123', email: 'demo@empirial.com', displayName: 'Empirial' } as unknown as User);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser(firebaseUser);
      else navigate('/auth');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    // Pass the prompt to chat via state so ChatInterface can pre-fill it
    navigate('/chat', { state: { initialPrompt: prompt } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-[#f0ede8]">

      {/* ── Mesh Gradient Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Blue top-left */}
        <div className="absolute top-[-15%] left-[-10%] w-[65%] h-[65%] rounded-full bg-[#93c5fd] opacity-70 blur-[100px]" />
        {/* White center bloom */}
        <div className="absolute top-[5%] left-[25%] w-[50%] h-[45%] rounded-full bg-white opacity-60 blur-[80px]" />
        {/* Purple mid */}
        <div className="absolute top-[20%] right-[-5%] w-[45%] h-[55%] rounded-full bg-[#a78bfa] opacity-60 blur-[100px]" />
        {/* Hot pink bottom */}
        <div className="absolute bottom-[5%] left-[-5%] w-[60%] h-[55%] rounded-full bg-[#f472b6] opacity-75 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#ec4899] opacity-65 blur-[90px]" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* Spacer + Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8 min-h-[70vh]">

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 text-center mb-10 tracking-tight">
            Ready to build,{' '}
            <span className="capitalize">{displayName}</span>?
          </h1>

          {/* Prompt Box */}
          <div className="w-full max-w-[720px] bg-[#f5f1eb] rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] p-5">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aura to build..."
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-gray-800 text-[15px] placeholder:text-gray-400 leading-relaxed max-h-40 overflow-y-auto"
            />

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-4">
              {/* Left: attach */}
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                <Plus className="w-5 h-5" />
              </button>

              {/* Right: actions */}
              <div className="flex items-center gap-2">
                {/* Build dropdown */}
                <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/60 hover:bg-white/80 border border-black/8 text-sm font-medium text-gray-700 transition-colors">
                  Build
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {/* Mic */}
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                  <Mic className="w-4.5 h-4.5" />
                </button>

                {/* Send */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || loading}
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

        {/* ── Projects Panel ── */}
        <div className="mx-4 mb-4 md:mx-8 md:mb-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
              {([
                { key: 'my-projects', label: 'My projects' },
                { key: 'recently-viewed', label: 'Recently viewed' },
                { key: 'templates', label: 'Templates' },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              Browse all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'my-projects' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* New project card */}
                <button
                  onClick={() => navigate('/generate')}
                  className="group flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all gap-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-indigo-500 transition-colors">New project</span>
                </button>

                {/* Project cards */}
                {MOCK_PROJECTS.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate('/chat')}
                    className="group flex flex-col rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden text-left bg-white"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
                      <Globe className="absolute bottom-3 right-3 w-6 h-6 text-indigo-300 opacity-60" />
                    </div>
                    {/* Info */}
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{project.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{project.updatedAt}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'recently-viewed' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {MOCK_PROJECTS.slice(0, 2).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate('/chat')}
                    className="group flex flex-col rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden text-left bg-white"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 relative overflow-hidden">
                      <Clock className="absolute bottom-3 right-3 w-6 h-6 text-blue-300 opacity-60" />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{project.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{project.updatedAt}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {['Artisan Bakery', 'Coffee Shop', 'Restaurant', 'Logistics'].map((name) => (
                  <button
                    key={name}
                    onClick={() => navigate('/generate')}
                    className="group flex flex-col rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden text-left bg-white"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 relative overflow-hidden">
                      <LayoutTemplate className="absolute bottom-3 right-3 w-6 h-6 text-rose-300 opacity-60" />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Template</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
