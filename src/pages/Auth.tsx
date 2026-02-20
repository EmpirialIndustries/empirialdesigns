import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ArrowLeft, LucideIcon } from 'lucide-react';
const IconArrowLeft = ArrowLeft as any;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create initial repo entry with deploy URL if site name provided
        if (user && siteName.trim()) {
          const cleanName = siteName.trim().replace(/[^a-z0-9-]/gi, '');
          const deployUrl = `https://${cleanName}.netlify.app`;

          await setDoc(doc(db, 'user_repos', `${user.uid}_${cleanName}`), {
            user_id: user.uid,
            repo_name: cleanName,
            repo_owner: email.split('@')[0],
            repo_url: deployUrl,
            deploy_url: deployUrl,
            created_at: new Date().toISOString()
          });
        }

        toast({
          title: "Success!",
          description: "Account created successfully.",
        });
        navigate('/repos');
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        navigate('/repos');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') message = 'Invalid email or password';

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-foreground/70 hover:text-foreground"
          onClick={() => navigate('/')}
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-8 elegant-shadow">
          <div className="text-center mb-8">
            <img
              src="/lovable-uploads/94f51cc3-f695-4449-8dc0-01c2e5cced2f.png"
              alt="Empirial Designs Logo"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gradient mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? 'Sign up to access your AI assistant'
                : 'Sign in to continue to your AI assistant'
              }
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name (optional)</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder="e.g. my-portfolio-site"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Will be used as: https://{siteName.trim().replace(/[^a-z0-9-]/gi, '') || 'your-site'}.netlify.app
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-full elegant-shadow"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
