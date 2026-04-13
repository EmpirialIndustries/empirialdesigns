import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, CheckCircle2, ArrowLeft, LayoutTemplate, Search } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Import Template Images
import BakeryImg from '@/assets/Bakery.webp';
import CoffeeImg from '@/assets/Coffee.webp';
import FoodImg from '@/assets/Food.webp';
import DBAImg from '@/assets/DBA.webp';

const IconSparkles = Sparkles as any;
const IconLoader2 = Loader2 as any;
const IconCheckCircle2 = CheckCircle2 as any;
const IconArrowLeft = ArrowLeft as any;
const IconLayoutTemplate = LayoutTemplate as any;
const IconSearch = Search as any;

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: 'template_bakery',
    name: 'Artisan Bakery',
    description: 'A warm and inviting website for bakeries and cafes.',
    image: BakeryImg,
    category: 'Food & Beverage',
    features: ['Menu Gallery', 'Online Ordering', 'About Us', 'Contact Form']
  },
  {
    id: 'template_coffee',
    name: 'Coffee Shop / Barista',
    description: 'Modern aesthetic for coffee shops and roasteries.',
    image: CoffeeImg,
    category: 'Food & Beverage',
    features: ['Drink Menu', 'Location Finder', 'Events', 'Blog']
  },
  {
    id: 'template_food',
    name: 'Gourmet Restaurant',
    description: 'Elegant design for high-end dining experiences.',
    image: FoodImg,
    category: 'Food & Beverage',
    features: ['Reservation System', 'Chef Profiles', 'Gallery', 'Reviews']
  },
  {
    id: 'template_dba',
    name: 'Logistics & Delivery',
    description: 'Professional layout for logistics and delivery services.',
    image: DBAImg,
    category: 'Business',
    features: ['Service Tracking', 'Quote Request', 'Fleet Showcase', 'Partners']
  }
];

const GenerateWebsite = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [repoName, setRepoName] = useState('');
  const [step, setStep] = useState<'gallery' | 'details' | 'creating'>('gallery');

  const location = useLocation();

  useEffect(() => {
    const isMock = localStorage.getItem('empirial_mock_login') === 'true';
    if (isMock) {
      setUser({ uid: 'mock-123', email: 'demo@empirial.com' } as User);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFastCreate = async (template: Template) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setStep('creating');
    setSelectedTemplate(template);

    try {
      const generatedRepoName = template.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      const repoId = `${user.uid}_${generatedRepoName}`;

      // Create Firestore Entry
      await setDoc(doc(db, 'user_repos', repoId), {
        user_id: user.uid,
        repo_url: `https://github.com/empirial-templates/${template.id}`, // Mock URL
        repo_owner: 'empirial-templates',
        repo_name: generatedRepoName,
        created_at: new Date().toISOString(),
        template_id: template.id,
        status: 'ready'
      });

      toast({
        title: "Builder ready",
        description: `Opening customized environment for ${template.name}...`,
      });

      navigate(`/preview/${repoId}`);

    } catch (error: any) {
      console.error("Creation error:", error);
      toast({
        title: "Error",
        description: "Failed to open project. Please try again.",
        variant: "destructive"
      });
      setStep('gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Legacy support if needed
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans font-inter flex flex-col items-center relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background ambient radial gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Aura Build exactly matching Nav Header */}
      <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 w-full sticky top-0 z-50">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-2xl font-bold tracking-tighter text-white/90">
              A
            </div>
          </div>

          {/* Main Nav - matching screenshot */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-wider text-white/50 uppercase">
            <a href="#" className="hover:text-white transition-colors">Create</a>
            <a href="#" className="text-white">Templates</a>
            <a href="#" className="hover:text-white transition-colors">Components</a>
            <a href="#" className="hover:text-white transition-colors">Assets</a>
            <a href="#" className="hover:text-white transition-colors">Skills</a>
            <a href="#" className="hover:text-white transition-colors">Learn</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggler */}
          <div className="flex items-center bg-[#111] rounded-full p-1 border border-[#222]">
            <button className="h-6 w-7 flex items-center justify-center rounded-full text-white/50 hover:text-white text-[10px] transition-colors">☀️</button>
            <button className="h-6 w-7 flex items-center justify-center rounded-full bg-white/10 text-white text-[10px] shadow-sm ring-1 ring-white/20">💻</button>
            <button className="h-6 w-7 flex items-center justify-center rounded-full text-white/50 hover:text-white text-[10px] transition-colors">🌙</button>
          </div>
          {/* User Profile */}
          <div className="h-8 w-8 rounded-full bg-[#5C7CFA] text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            {user?.email?.charAt(0).toUpperCase() || 'E'}
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1200px] mx-auto p-6 md:p-10">
        {/* Header Section for Gallery/Details */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
              {step === 'gallery' ? 'Browse Templates' : 'Configure Project'}
            </h1>
            <p className="text-white/40 text-sm">
              {step === 'gallery' ? 'Choose a starting point for your new website' : `Setting up: ${selectedTemplate?.name}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {step === 'gallery' ? (
              <div className="relative w-64 hidden md:block">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 pl-9 text-sm text-white focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg h-10 transition-colors hover:bg-white/10"
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('gallery')}
                className="bg-[#111] border-[#222] text-white hover:bg-[#222]"
              >
                <IconArrowLeft className="h-4 w-4 mr-2" /> Back to templates
              </Button>
            )}
          </div>
        </div>

        {/* Gallery View */}
        {step === 'gallery' && (
          <div className="relative z-10 w-full mt-4">
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
              {['Web', 'Mobile', 'Animation', 'Login', 'Sidebar', 'Onboarding', 'Grid', 'Payment', '3D', 'Paid Templates'].map((tag) => (
                <button
                  key={tag}
                  className={`flex-shrink-0 rounded-full border px-5 py-2 text-xs font-semibold transition-all duration-300 ${tag === 'Web'
                      ? 'bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : tag === 'Paid Templates'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group relative rounded-2xl p-[1px] overflow-hidden bg-gradient-to-b from-white/10 to-white/5 hover:from-indigo-500/60 hover:to-purple-500/60 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.3)]"
                  onClick={() => handleFastCreate(template)}
                >
                  <Card className="h-full bg-black/40 backdrop-blur-2xl border-0 flex flex-col group-hover:bg-black/20 transition-all duration-500">
                    <div className="relative aspect-[4/3] overflow-hidden p-3 pb-0 rounded-t-xl">
                      <div className="w-full h-full rounded-lg overflow-hidden relative bg-[#151515]">
                        <img
                          src={template.image}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-[2px]">
                          <Button className="rounded-full bg-white text-black hover:bg-indigo-50 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-400">
                            Select Template
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardHeader className="p-5">
                      <CardTitle className="text-base font-bold text-white/90 tracking-tight">{template.name}</CardTitle>
                      <CardDescription className="text-xs text-white/50 mt-1.5 line-clamp-2">{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Step */}
        {step === 'details' && selectedTemplate && (
          <div className="max-w-2xl mx-auto animate-fade-in relative z-10 w-full mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20" />
            <Card className="relative bg-white/5 backdrop-blur-2xl border-white/10 text-white overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="aspect-video w-full overflow-hidden relative">
                <img src={selectedTemplate.image} alt={selectedTemplate.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                  <p className="text-white/60">{selectedTemplate.category}</p>
                </div>
              </div>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="repoName" className="text-white/80">Project Name</Label>
                  <Input
                    id="repoName"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g., My Awesome Site"
                    className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                  />
                  <p className="text-xs text-white/40">This will be used as your repository name.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white/80">Included Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white/60">
                        <IconCheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep('gallery')}
                  className="text-white/60 hover:text-white hover:bg-white/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={loading || !repoName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Loading / Creating State Overlay */}
        {step === 'creating' && (
          <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <IconSparkles className="h-16 w-16 text-white relative z-10 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-2">Setting up your {selectedTemplate?.name}</h2>
            <p className="text-white/50">Cloning template structures and initializing database...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateWebsite;
