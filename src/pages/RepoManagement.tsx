import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ExternalLink, LogOut, FolderGit2, Sparkles } from 'lucide-react';
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

const RepoManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
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
      // Firestore index might be needed for compound queries
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

      // Direct Firestore Write (replacing manage-repo Edge Function for now)
      await setDoc(doc(db, 'user_repos', repoId), {
        user_id: user.uid,
        repo_url: `https://github.com/${owner}/${cleanName}`,
        repo_owner: owner,
        repo_name: cleanName,
        created_at: new Date().toISOString(),
        template_type: 'custom' // Defaulting for manually added
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
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setRepoToDelete(null);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/lovable-uploads/94f51cc3-f695-4449-8dc0-01c2e5cced2f.png"
              alt="Empirial Designs Logo"
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold text-gradient">Repository Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Repositories</h2>
            <p className="text-muted-foreground">Manage and edit your GitHub repositories</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="default"
              onClick={() => navigate('/generate')}
              className="rounded-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Website
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add GitHub Repository</DialogTitle>
                  <DialogDescription>
                    Enter the URL of your GitHub repository to start editing it with AI
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo-url">Repository URL</Label>
                    <Input
                      id="repo-url"
                      placeholder="https://github.com/username/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRepo} disabled={loading || !repoUrl.trim()}>
                    Add Repository
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loading && repos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading repositories...</p>
            </div>
          ) : repos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No repositories yet</h3>
                <p className="text-muted-foreground mb-6">Add your first GitHub repository to get started</p>
                <Button onClick={() => setDialogOpen(true)} className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo) => (
                <Card key={repo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="truncate">{repo.repo_name}</CardTitle>
                    <CardDescription className="truncate">{repo.repo_owner}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-full"
                        onClick={() => navigate(`/preview/${repo.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(repo.repo_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRepo(repo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this repository from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRepoToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RepoManagement;
