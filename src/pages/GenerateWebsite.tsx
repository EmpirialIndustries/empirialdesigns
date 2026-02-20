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

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setRepoName(template.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000));
    setStep('details');
  };

  const handleCreateProject = async () => {
    if (!user || !selectedTemplate) return;
    if (!repoName.trim()) {
      toast({
        title: "Required",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStep('creating');

    try {
      // Simulate "AI Generation" / Database Pull
      // In a real scenario, this would trigger a cloud function to clone the template

      await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay

      const repoId = `${user.uid}_${repoName}`;

      // Create Firestore Entry
      await setDoc(doc(db, 'user_repos', repoId), {
        user_id: user.uid,
        repo_url: `https://github.com/empirial-templates/${selectedTemplate.id}`, // Mock URL
        repo_owner: 'empirial-templates',
        repo_name: repoName,
        created_at: new Date().toISOString(),
        template_id: selectedTemplate.id,
        status: 'ready'
      });

      toast({
        title: "Project Created! 🎉",
        description: `Your project based on ${selectedTemplate.name} is ready.`,
      });

      navigate(`/preview/${repoId}`);

    } catch (error: any) {
      console.error("Creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step === 'gallery' ? navigate('/repos') : setStep('gallery')}
              className="rounded-full hover:bg-white/10 text-white"
            >
              <IconArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {step === 'gallery' ? 'Template Gallery' : 'Configure Project'}
              </h1>
              <p className="text-white/40">
                {step === 'gallery' ? 'Choose a starting point for your new website' : `Setting up: ${selectedTemplate?.name}`}
              </p>
            </div>
          </div>

          {step === 'gallery' && (
            <div className="relative w-64 hidden md:block">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-white/30 rounded-full focus-visible:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Gallery View */}
        {step === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group bg-[#1e293b]/50 border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 z-10" />
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-medium text-white/90 mb-2 inline-block border border-white/10">
                      {template.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-[2px]">
                    <Button className="rounded-full bg-white text-indigo-950 hover:bg-white/90 font-semibold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Use Template
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-white/50 line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Configuration Step */}
        {step === 'details' && selectedTemplate && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card className="bg-[#1e293b] border-white/10 text-white overflow-hidden">
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
