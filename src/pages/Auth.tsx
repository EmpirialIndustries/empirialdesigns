import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
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

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: "Guest Session Started",
        description: "Welcome! You can now explore the AI Builder. Your progress is saved temporarily.",
      });
      navigate('/templates');
    } catch (error: any) {
      console.error('Guest Auth error:', error);
      toast({
        title: "Error",
        description: "Could not start guest session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col">
      {/* Tiny top header matching Aura Build */}
      <header className="h-16 flex items-center px-6 w-full">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-2xl font-bold tracking-tighter text-white/90">
            A
          </div>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center p-4 pb-20">
        <div className="w-full max-w-[400px] bg-[#111] border border-[#222] rounded-[24px] p-8">
          <div className="text-center mb-10">
            <div className="text-4xl font-bold tracking-tighter text-white/90 mb-4 mx-auto flex justify-center">
              <div className="w-10 h-10 border-[2px] border-white/20 border-t-white/80 rounded-sm rotate-45 transform" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isSignUp ? 'Sign up for Aura' : 'Sign in to Aura'}
            </h1>
            <p className="text-sm text-white/50">
              {isSignUp
                ? 'Sign up to access your account and use all features'
                : 'Sign in to access your account and use all features'
              }
            </p>
          </div>

          <Button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full h-14 bg-white text-black hover:bg-white/90 mb-4 font-semibold rounded-xl text-lg transition-transform hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {loading ? 'Loading...' : 'Try the Builder (Guest Mode)'}
          </Button>

          <div className="relative mb-6 mt-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span className="bg-[#111] px-4">Or sign in to save work permanently</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-12 bg-transparent border-[#333] hover:bg-[#222] text-white mb-6 font-medium rounded-xl transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#333]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111] px-2 text-white/40">OR</span>
            </div>
          </div>

          <div className="flex bg-[#0A0A0A] p-1 rounded-xl mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-sm font-medium h-9 rounded-lg transition-colors ${!isSignUp ? 'bg-[#222] text-white' : 'text-white/50 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-sm font-medium h-9 rounded-lg transition-colors ${isSignUp ? 'bg-[#222] text-white' : 'text-white/50 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 mb-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 font-normal">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-transparent border-[#333] text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80 font-normal">Password</Label>
                {!isSignUp && <a href="#" className="text-xs text-white/50 hover:text-white">Forgot password?</a>}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-transparent border-[#333] text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 rounded-lg"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-white/80 font-normal">Site Name (optional)</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder="e.g. my-portfolio-site"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="h-11 bg-transparent border-[#333] text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/30 rounded-lg"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-white font-semibold bg-[#222] border border-[#333] hover:bg-[#333] hover:border-[#444] rounded-lg mt-2 transition-all"
              disabled={loading}
            >
              {loading ? 'Working...' : isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
