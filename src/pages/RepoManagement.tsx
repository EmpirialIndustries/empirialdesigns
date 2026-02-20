import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ExternalLink, LogOut, FolderGit2, Sparkles, Loader2, ArrowUp, LucideIcon, Search, CheckCircle2, Eye, ArrowLeft, ShoppingCart } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';

// Import Template Images
import BakeryImg from '@/assets/Bakery.webp';
import CoffeeImg from '@/assets/Coffee.webp';
import FoodImg from '@/assets/Food.webp';
import DBAImg from '@/assets/DBA.webp';

const IconPlus = Plus as any;
const IconTrash2 = Trash2 as any;
const IconExternalLink = ExternalLink as any;
const IconFolderGit2 = FolderGit2 as any;
const IconSparkles = Sparkles as any;
const IconLoader2 = Loader2 as any;
const IconArrowUp = ArrowUp as any;
const IconSearch = Search as any;
const IconCheckCircle2 = CheckCircle2 as any;
const IconEye = Eye as any;
const IconArrowLeft = ArrowLeft as any;
const IconShoppingCart = ShoppingCart as any;

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

interface Repo {
  id: string;
  repo_owner: string;
  repo_name: string;
  repo_url: string;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  price: number;
}

const templates: Template[] = [
  {
    id: 'template_bakery',
    name: 'Artisan Bakery',
    description: 'A warm and inviting website for bakeries and cafes. Features a menu gallery, online ordering system, and beautiful hero sections.',
    image: BakeryImg,
    category: 'Food & Beverage',
    features: ['Menu Gallery', 'Online Ordering', 'About Us', 'Contact Form', 'Mobile Responsive', 'SEO Optimized'],
    price: 49
  },
  {
    id: 'template_coffee',
    name: 'Coffee Shop / Barista',
    description: 'Modern aesthetic for coffee shops and roasteries. Includes location finder, event calendar, and a blog for coffee lovers.',
    image: CoffeeImg,
    category: 'Food & Beverage',
    features: ['Drink Menu', 'Location Finder', 'Events Calendar', 'Blog Section', 'Newsletter Signup', 'Social Media Integration'],
    price: 49
  },
  {
    id: 'template_food',
    name: 'Gourmet Restaurant',
    description: 'Elegant design for high-end dining experiences. Comes with a reservation system, chef profiles, and a stunning photo gallery.',
    image: FoodImg,
    category: 'Food & Beverage',
    features: ['Reservation System', 'Chef Profiles', 'Photo Gallery', 'Customer Reviews', 'Menu Management', 'Dark Mode'],
    price: 79
  },
  {
    id: 'template_dba',
    name: 'Logistics & Delivery',
    description: 'Professional layout for logistics and delivery services. Features service tracking, quote requests, and fleet showcasing.',
    image: DBAImg,
    category: 'Business',
    features: ['Service Tracking', 'Quote Request Form', 'Fleet Showcase', 'Partner Logos', 'Service Area Map', 'Trust Badges'],
    price: 99
  }
];

const RepoManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');

  // Template Creation & Viewing State
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadRepos(currentUser.uid);
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadRepos = async (userId: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'user_repos'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedRepos: Repo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedRepos.push({
          id: doc.id,
          repo_owner: data.repo_owner,
          repo_name: data.repo_name,
          repo_url: data.repo_url,
          created_at: data.created_at,
        });
      });

      setRepos(loadedRepos);
    } catch (error: any) {
      console.error('Error loading repos:', error);
      if (error.code === 'failed-precondition') {
        toast({
          title: "Setup Required",
          description: "Firestore index creation required. Check console.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRepo = async () => {
    if (!repoUrl.trim() || !user) return;

    setLoading(true);
    try {
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL');
      }

      const [, owner, name] = match;
      const cleanName = name.replace(/\.git$/, '');
      const repoId = `${user.uid}_${cleanName}`;

      // Direct Firestore Write
      await setDoc(doc(db, 'user_repos', repoId), {
        user_id: user.uid,
        repo_url: `https://github.com/${owner}/${cleanName}`,
        repo_owner: owner,
        repo_name: cleanName,
        created_at: new Date().toISOString(),
        template_type: 'custom'
      });

      toast({
        title: "Success",
        description: "Repository added successfully",
      });

      setDialogOpen(false);
      setRepoUrl('');
      loadRepos(user.uid);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add repository",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepo = async (repoId: string) => {
    setRepoToDelete(repoId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!repoToDelete) return;

    setLoading(true);
    try {
      // Direct Firestore Delete
      await deleteDoc(doc(db, 'user_repos', repoToDelete));

      toast({
        title: "Success",
        description: "Repository removed successfully",
      });

      if (user) await loadRepos(user.uid);
    } catch (error: any) {
      console.error('Failed to delete repo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete repository",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setRepoToDelete(null);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/generate', { state: { initialPrompt: prompt } });
    }
  };

  const handleViewTemplate = (template: Template) => {
    setViewingTemplate(template);
  };

  const handleBuyNow = (template: Template) => {
    setSelectedTemplate(template);
    setNewProjectName(template.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000));
    setCreateDialogOpen(true);
  };

  const handleCreateFromTemplate = async () => {
    if (!user || !selectedTemplate || !newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work

      const repoId = `${user.uid}_${newProjectName}`;

      await setDoc(doc(db, 'user_repos', repoId), {
        user_id: user.uid,
        repo_url: `https://github.com/empirial-templates/${selectedTemplate.id}`,
        repo_owner: 'empirial-templates',
        repo_name: newProjectName,
        created_at: new Date().toISOString(),
        template_id: selectedTemplate.id,
        status: 'ready'
      });

      toast({
        title: "Purchase Successful! 🎉",
        description: `You have successfully purchased and created a project from ${selectedTemplate.name}.`,
      });

      setCreateDialogOpen(false);
      setViewingTemplate(null);
      setActiveTab('projects');
      loadRepos(user.uid);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process purchase/creation",
        variant: "destructive"
      });
    } finally {
      setCreatingProject(false);
    }
  };


  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
      <DashboardSidebar userEmail={user.email} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-[#020617]/50 to-[#020617] pointer-events-none z-0" />

        <div className="flex-1 overflow-y-auto z-10 p-8">
          <div className="max-w-6xl mx-auto space-y-10">

            {/* Hero / Prompt Section - Only show when NOT viewing a template detail */}
            {!viewingTemplate && (
              <div className="text-center space-y-8 pt-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 pb-2">
                  Let's build something
                </h1>

                <div className="max-w-2xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
                  <form onSubmit={handlePromptSubmit} className="relative flex items-center bg-[#0f172a] rounded-xl border border-white/10 shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask Empirial to create a SaaS landing page..."
                      className="h-14 border-0 bg-transparent text-lg px-6 focus-visible:ring-0 placeholder:text-white/30"
                    />
                    <div className="pr-2">
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!prompt.trim()}
                        className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <IconArrowUp className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Content Section with Tabs - Hide tabs when viewing details */}
            <div className="space-y-6">

              {/* Tabs / Header - Only show if NO template is being viewed */}
              {!viewingTemplate && (
                <div className="flex items-center gap-6 border-b border-white/5 pb-1">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`text-lg font-medium pb-3 border-b-2 transition-all ${activeTab === 'projects'
                      ? 'text-white border-indigo-500'
                      : 'text-white/40 border-transparent hover:text-white/60'
                      }`}
                  >
                    Previous Projects
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className={`text-lg font-medium pb-3 border-b-2 transition-all ${activeTab === 'templates'
                      ? 'text-white border-indigo-500'
                      : 'text-white/40 border-transparent hover:text-white/60'
                      }`}
                  >
                    Templates
                  </button>
                  <div className="flex-1" />
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hidden md:flex">
                        <IconPlus className="h-3.5 w-3.5 mr-2" />
                        Import Repo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1e293b] border-white/10 text-white sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Import GitHub Repository</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="repo-url">Repository URL</Label>
                          <Input
                            id="repo-url"
                            placeholder="https://github.com/username/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            className="bg-black/20 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">Cancel</Button>
                        <Button onClick={handleAddRepo} disabled={loading || !repoUrl.trim()} className="bg-indigo-600 hover:bg-indigo-700">Import</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* VISIBLE WHEN NOT VIEWING DETAILS */}
              {!viewingTemplate && (
                <>
                  {/* PROJECTS VIEW */}
                  {activeTab === 'projects' && (
                    <div className="animate-fade-in">
                      {loading && repos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <IconLoader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
                          <p className="text-white/40">Loading projects...</p>
                        </div>
                      ) : repos.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IconFolderGit2 className="h-8 w-8 text-white/20" />
                          </div>
                          <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
                          <p className="text-white/40 mb-6 max-w-sm mx-auto">
                            Start by choosing a template or asking the AI to build something for you.
                          </p>
                          <Button onClick={() => setActiveTab('templates')} className="bg-indigo-600 hover:bg-indigo-700">
                            Browse Templates
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {repos.map((repo) => (
                            <div
                              key={repo.id}
                              className="group bg-[#1e293b]/50 border border-white/5 hover:border-white/10 rounded-xl p-5 hover:bg-[#1e293b] transition-all cursor-pointer relative overflow-hidden"
                              onClick={() => navigate(`/preview/${repo.id}`)}
                            >
                              <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                    <IconFolderGit2 className="h-5 w-5" />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRepo(repo.id); }}
                                    className="text-white/20 hover:text-red-400 hover:bg-red-400/10 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <IconTrash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-indigo-200 transition-colors">{repo.repo_name}</h3>
                                <p className="text-xs text-white/40 mb-4">Edited {new Date(repo.created_at).toLocaleDateString()}</p>

                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#0f172a] flex items-center justify-center text-[8px] font-bold">L</div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs bg-white/5 hover:bg-white/10 text-white/70"
                                      onClick={(e) => { e.stopPropagation(); window.open(repo.repo_url, '_blank'); }}
                                    >
                                      <IconExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEMPLATES VIEW (Gallery) */}
                  {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className="group bg-[#1e293b]/40 border-white/5 hover:border-indigo-500/40 hover:bg-[#1e293b] transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/5 ring-1 ring-white/5 flex flex-col"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent opacity-60 z-10" />
                            <img
                              src={template.image}
                              alt={template.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[2px]">
                              <Button
                                onClick={() => handleViewTemplate(template)}
                                className="bg-white text-black hover:bg-white/90 rounded-full font-bold"
                              >
                                <IconEye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-white text-base font-semibold group-hover:text-indigo-300 transition-colors">{template.name}</CardTitle>
                              <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">${template.price}</span>
                            </div>
                            <CardDescription className="text-white/40 text-xs line-clamp-2 mt-1">{template.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="p-4 pt-2 mt-auto">
                            <Button
                              className="w-full bg-white/5 hover:bg-indigo-600 text-white/70 hover:text-white border border-white/5 transition-all"
                              onClick={() => handleViewTemplate(template)}
                            >
                              View
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TEMPLATE DETAILS VIEW */}
              {viewingTemplate && (
                <div className="animate-fade-in max-w-4xl mx-auto">
                  <Button
                    variant="ghost"
                    className="mb-6 hover:bg-white/5 -ml-4 text-white/60 hover:text-white"
                    onClick={() => setViewingTemplate(null)}
                  >
                    <IconArrowLeft className="h-5 w-5 mr-2" />
                    Back to Templates
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Left Column: Image */}
                    <div className="space-y-4">
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1e293b] shadow-2xl relative aspect-[4/5] md:aspect-square">
                        <img
                          src={viewingTemplate.image}
                          alt={viewingTemplate.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent opacity-20" />
                      </div>
                    </div>

                    {/* Right Column: Info & Actions */}
                    <div className="flex flex-col h-full space-y-6 md:pt-4">
                      <div>
                        <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold mb-4">
                          PREMIUM TEMPLATE
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{viewingTemplate.name}</h1>
                        <div className="text-2xl font-bold text-emerald-400 mb-4">${viewingTemplate.price}</div>
                        <p className="text-white/60 text-lg leading-relaxed">{viewingTemplate.description}</p>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Features</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {viewingTemplate.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-white/80 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                              <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <IconCheckCircle2 className="h-4 w-4 text-emerald-500" />
                              </div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-auto grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setViewingTemplate(null)}
                          className="border-white/10 bg-transparent text-white hover:bg-white/5 h-14 text-lg"
                        >
                          Go Back
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => handleBuyNow(viewingTemplate)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg shadow-lg shadow-indigo-600/20"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create From Template Dialog (Triggered by "Buy Now") */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogContent className="bg-[#1e293b] border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Purchase & Create</DialogTitle>
                  <DialogDescription className="text-white/60">
                    You're about to use the <b>{selectedTemplate?.name}</b> template.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-indigo-300 font-medium">Template Price</span>
                    <span className="text-xl font-bold text-white">${selectedTemplate?.price}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-project-name">Project Name</Label>
                    <Input
                      id="new-project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="bg-black/20 border-white/10 text-white"
                      placeholder="my-awesome-site"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} className="hover:bg-white/5">Cancel</Button>
                  <Button
                    onClick={handleCreateFromTemplate}
                    disabled={creatingProject || !newProjectName.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {creatingProject ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Confirm Purchase & Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ... other dialogs (Delete, Import) ... */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="bg-[#1e293b] border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Repository?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    This will remove "{repos.find(r => r.id === repoToDelete)?.repo_name}" from your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRepoToDelete(null)} className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 border-0">
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RepoManagement;
