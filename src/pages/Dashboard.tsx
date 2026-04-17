import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, query, where,
  orderBy, serverTimestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Mic, ChevronDown, Loader2, ArrowUp,
  Github, FolderOpen, ExternalLink, X, Lock, ChevronDown as ScrollHint,
} from 'lucide-react';
import { LovableSidebar } from '@/components/LovableSidebar';
import { getSavedApiKey } from '@/lib/claude';

import BakeryImg from '@/assets/Bakery.webp';
import CoffeeImg from '@/assets/Coffee.webp';
import FoodImg from '@/assets/Food.webp';
import DBAImg from '@/assets/DBA.webp';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
interface Project {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */
const TEMPLATES: Template[] = [
  {
    id: 'bakery',
    name: 'Artisan Bakery',
    description: 'Warm, inviting site for bakeries & cafes with menu gallery and contact form.',
    image: BakeryImg,
    category: 'Food & Beverage',
    price: null,
  },
  {
    id: 'coffee',
    name: 'Coffee Shop',
    description: 'Modern aesthetic for coffee shops with drink menu, events & blog.',
    image: CoffeeImg,
    category: 'Food & Beverage',
    price: null,
  },
  {
    id: 'restaurant',
    name: 'Gourmet Restaurant',
    description: 'Elegant site with reservation system, chef profiles & photo gallery.',
    image: FoodImg,
    category: 'Food & Beverage',
    price: 79,
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    description: 'Professional layout with service tracking, quote requests & fleet showcase.',
    image: DBAImg,
    category: 'Business',
    price: 99,
  },
];

const TEMPLATE_PROMPTS: Record<string, string> = {
  bakery: 'Build a warm artisan bakery website with a hero section, menu gallery, about us, and contact form. Use earthy tones, cream and brown colors.',
  coffee: 'Build a modern coffee shop website with a hero, drink menu grid, events calendar section, and newsletter signup. Dark roast aesthetic.',
  restaurant: 'Build an elegant gourmet restaurant website with a full-screen hero, reservation form, chef profiles section, and photo gallery. Upscale and refined.',
  logistics: 'Build a professional logistics and delivery company website with a hero, services grid, tracking CTA, quote request form, and trust badges.',
};

const RECENT_KEY = 'empirial_recent_projects';
function getRecentIds(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function pushRecentId(id: string) {
  const ids = getRecentIds().filter((x) => x !== id);
  ids.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 10)));
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'recent' | 'templates'>('projects');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [githubOpen, setGithubOpen] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [importing, setImporting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ---- Auth ---- */
  useEffect(() => {
    const isMock = localStorage.getItem('empirial_mock_login') === 'true';
    if (isMock) {
      setUser({ uid: 'mock-123', email: 'demo@empirial.com', displayName: 'Empirial' } as unknown as User);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else navigate('/auth');
    });
    return () => unsub();
  }, [navigate]);

  /* ---- Auto-grow textarea ---- */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  /* ---- Load projects ---- */
  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoadingProjects(true);
    try {
      if (user.uid === 'mock-123') {
        const mockProjects: Project[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('project-')) {
            try {
              const raw = sessionStorage.getItem(key);
              if (raw) {
                const p = JSON.parse(raw);
                mockProjects.push({ id: p.id, title: p.title, prompt: p.prompt, createdAt: '' });
              }
            } catch {}
          }
        }
        setProjects(mockProjects);
      } else {
        const q = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );
        const snap = await getDocs(q);
        setProjects(snap.docs.map((d) => ({
          id: d.id,
          title: d.data().title || 'Untitled',
          prompt: d.data().prompt || '',
          createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString() || '',
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const recentProjects = getRecentIds()
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean) as Project[];

  const openProject = (id: string) => {
    pushRecentId(id);
    navigate(`/builder/${id}`);
  };

  /* ---- Submit prompt ---- */
  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    if (!getSavedApiKey()) {
      toast({ title: 'API key missing', description: 'Click the ⚙️ gear icon in the sidebar to add your Anthropic API key.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const title = prompt.trim().slice(0, 48) + (prompt.trim().length > 48 ? '…' : '');
      const isMock = user?.uid === 'mock-123';
      let projectId: string;
      if (isMock) {
        projectId = `mock-${Date.now()}`;
        sessionStorage.setItem(`project-${projectId}`, JSON.stringify({ id: projectId, userId: 'mock-123', title, prompt: prompt.trim(), files: null }));
      } else {
        const ref = await addDoc(collection(db, 'projects'), { userId: user!.uid, title, prompt: prompt.trim(), files: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        projectId = ref.id;
      }
      pushRecentId(projectId);
      navigate(`/builder/${projectId}`);
    } catch (err: any) {
      toast({ title: 'Failed to create project', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  /* ---- Use template ---- */
  const handleUseTemplate = async (template: Template) => {
    if (!getSavedApiKey()) {
      toast({ title: 'API key missing', description: 'Add your Anthropic API key via the ⚙️ gear icon.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const templatePrompt = TEMPLATE_PROMPTS[template.id] || `Build a ${template.name} website.`;
      const isMock = user?.uid === 'mock-123';
      let projectId: string;
      if (isMock) {
        projectId = `mock-${Date.now()}`;
        sessionStorage.setItem(`project-${projectId}`, JSON.stringify({ id: projectId, userId: 'mock-123', title: template.name, prompt: templatePrompt, files: null }));
      } else {
        const ref = await addDoc(collection(db, 'projects'), { userId: user!.uid, title: template.name, prompt: templatePrompt, files: null, templateId: template.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        projectId = ref.id;
      }
      pushRecentId(projectId);
      navigate(`/builder/${projectId}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  /* ---- GitHub import ---- */
  const handleGithubImport = async () => {
    if (!githubUrl.trim()) return;
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) { toast({ title: 'Invalid URL', description: 'Paste a valid GitHub repo URL.', variant: 'destructive' }); return; }
    const [, owner, repoRaw] = match;
    const repo = repoRaw.replace(/\.git$/, '');
    const title = `${owner}/${repo}`;
    const githubPrompt = `I'm importing the GitHub repository ${owner}/${repo} (${githubUrl}). Help me understand and edit this codebase. Start by generating a clean version of its main page or entry point based on the repo name.`;
    setImporting(true);
    try {
      const isMock = user?.uid === 'mock-123';
      let projectId: string;
      if (isMock) {
        projectId = `mock-${Date.now()}`;
        sessionStorage.setItem(`project-${projectId}`, JSON.stringify({ id: projectId, userId: 'mock-123', title, prompt: githubPrompt, githubUrl, files: null }));
      } else {
        const ref = await addDoc(collection(db, 'projects'), { userId: user!.uid, title, prompt: githubPrompt, githubUrl, files: null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        projectId = ref.id;
      }
      pushRecentId(projectId);
      setGithubOpen(false);
      setGithubUrl('');
      navigate(`/builder/${projectId}`);
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';

  if (!user) return null;

  /* ---- Tab content ---- */
  const tabContent = {
    projects: (
      loadingProjects ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-[14px] text-gray-400 font-medium">No projects yet</p>
          <p className="text-[12px] text-gray-300 mt-1">Describe something in the prompt above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="text-left bg-white rounded-2xl border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center mb-3">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors leading-tight">{p.title}</p>
              {p.createdAt && <p className="text-[10px] text-gray-300 mt-1">{p.createdAt}</p>}
            </button>
          ))}
        </div>
      )
    ),

    recent: (
      recentProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-gray-400 font-medium">Nothing viewed yet</p>
          <p className="text-[12px] text-gray-300 mt-1">Projects you open will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recentProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="text-left bg-white rounded-2xl border border-gray-100 p-4 hover:border-pink-200 hover:shadow-md transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-50 to-orange-100 flex items-center justify-center mb-3">
                <FolderOpen className="w-4 h-4 text-pink-400" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-colors leading-tight">{p.title}</p>
              {p.createdAt && <p className="text-[10px] text-gray-300 mt-1">{p.createdAt}</p>}
            </button>
          ))}
        </div>
      )
    ),

    templates: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl transition-all duration-300">
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${t.price === null ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-black'}`}>
                {t.price === null ? 'Free' : `$${t.price}`}
              </span>
              <span className="absolute bottom-3 left-3 text-[10px] font-medium text-white/70 uppercase tracking-wider">{t.category}</span>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-[13px] font-semibold text-gray-900 mb-1">{t.name}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{t.description}</p>
            </div>

            {/* Action */}
            <div className="px-4 pb-4">
              {t.price === null ? (
                <button
                  onClick={() => handleUseTemplate(t)}
                  disabled={loading}
                  className="w-full py-2 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                >
                  Use template
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(t)}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50"
                  >
                    Buy & Use — ${t.price}
                  </button>
                  <button className="py-2 px-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-300 transition-colors" title="Preview (coming soon)">
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <>
      {/* Outer shell — sidebar sticky, right side scrolls */}
      <div className="flex h-screen overflow-hidden bg-white font-sans text-gray-900">

        {/* Sticky sidebar */}
        <LovableSidebar userEmail={user.email} />

        {/* Scrollable right column */}
        <div className="flex-1 overflow-y-auto">

          {/* ── HERO SECTION (full viewport height) ── */}
          <div className="relative min-h-screen flex flex-col overflow-hidden">

            {/* Mesh gradient — contained to hero */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-white" />
              <div className="absolute top-[-30%] right-[-10%] w-[80%] h-[90%] rounded-full bg-[#5b8cff] opacity-[0.85] blur-[120px]" />
              <div className="absolute bottom-[-20%] left-[-20%] w-[90%] h-[95%] rounded-full bg-[#ff1493] opacity-[0.85] blur-[130px]" />
              <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[50%] rounded-full bg-[#ff6bca] opacity-[0.7] blur-[100px]" />
              <div className="absolute top-[30%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#8c52ff] opacity-[0.5] blur-[110px]" />
            </div>

            {/* Prompt centred in hero */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
              <div className="w-full max-w-[700px] flex flex-col items-center">
                <h1 className="text-[28px] md:text-[36px] font-semibold text-gray-900 text-center mb-8 tracking-tight">
                  Got an idea, <span className="capitalize">{displayName}</span>?
                </h1>

                {/* Prompt box */}
                <div className="w-full bg-[#f8f7f4] rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 flex flex-col transition-shadow focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-white/40">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to build…"
                    rows={1}
                    className="w-full bg-transparent resize-none outline-none text-gray-700 text-[15px] placeholder:text-gray-400 min-h-[44px] max-h-40 overflow-y-auto px-2 pt-2"
                  />
                  <div className="flex items-center justify-between mt-3 px-1">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGithubOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Import GitHub
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Build <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 transition-colors">
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || loading}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#7a7775] hover:bg-[#63615f] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all ml-1 shadow-sm active:scale-95"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll hint */}
            <button
              onClick={scrollToContent}
              className="relative z-10 mx-auto mb-8 flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors group"
            >
              <span className="text-[11px] font-medium uppercase tracking-widest">Projects & Templates</span>
              <ScrollHint className="w-4 h-4 animate-bounce" />
            </button>
          </div>

          {/* ── CONTENT SECTION (scrolls below hero) ── */}
          <div ref={contentRef} className="bg-[#fafaf9] border-t border-gray-100 min-h-screen px-6 md:px-10 py-8">

            {/* Tab bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {(['projects', 'recent', 'templates'] as const).map((tab) => {
                  const labels = { projects: 'My projects', recent: 'Recently viewed', templates: 'Templates' };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                        activeTab === tab
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      {labels[tab]}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setGithubOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-[12px] font-medium text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                Import from GitHub
              </button>
            </div>

            {/* Active tab content */}
            {tabContent[activeTab]}
          </div>
        </div>
      </div>

      {/* GitHub Import Modal */}
      {githubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setGithubOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <button
              onClick={() => setGithubOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Import from GitHub</h2>
                <p className="text-[12px] text-gray-400">Paste a public repo URL to start editing with AI</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGithubImport(); }}
                placeholder="https://github.com/username/repo"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400"
                autoFocus
              />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <ExternalLink className="w-3 h-3" />
                Only public repositories are supported
              </div>
              <button
                onClick={handleGithubImport}
                disabled={!githubUrl.trim() || importing}
                className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                  : <><Github className="w-4 h-4" /> Import & Open Builder</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
