import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ArrowLeft, Sparkles, User, Lock, Mail } from 'lucide-react';
const IconSparkles = Sparkles as any;
const IconUser = User as any;
const IconLock = Lock as any;
const IconMail = Mail as any;

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

    if (email === 'demo@empirial.com') {
      setTimeout(() => {
        localStorage.setItem('empirial_mock_login', 'true');
        toast({
          title: "Welcome back!",
          description: "Mock credentials recognized. Using local session.",
        });
        setLoading(false);
        navigate('/chat');
      }, 800);
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

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
        navigate('/chat');
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });

        navigate('/chat');
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
    setTimeout(() => {
      localStorage.setItem('empirial_mock_login', 'true');
      toast({
        title: "Mock Login Successful",
        description: "Welcome! You are using a temporary session to explore the platform.",
      });
      setLoading(false);
      navigate('/chat');
    }, 800);
  };

  const handleMockIdentify = () => {
    setEmail('demo@empirial.com');
    setPassword('demo1234');
    toast({
      title: "Mock Credentials Loaded",
      description: "Ready to test login flow.",
    });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      {/* Premium Ambient Backgrounds */}
      <div className="absolute top-[0%] left-[-20%] w-[70%] h-[70%] bg-indigo-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Tiny top header matching Aura Build */}
      <header className="h-16 flex items-center px-6 w-full relative z-10">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-3xl font-bold tracking-tighter text-white/90">
            A
          </div>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center p-4 pb-20 relative z-10">
        {/* Glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[32px] blur-2xl opacity-10" />
        
        <div className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[28px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all">
          <div className="text-center mb-10">
            <div className="text-4xl font-bold tracking-tighter text-white mb-6 mx-auto flex justify-center">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <IconSparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-white/50">
              {isSignUp
                ? 'Sign up to access your workspace'
                : 'Sign in to access your workspace'
              }
            </p>
          </div>

          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 backdrop-blur-md">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-sm font-semibold h-10 rounded-xl transition-all duration-300 ${!isSignUp ? 'bg-white/10 text-white shadow-md' : 'text-white/50 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-sm font-semibold h-10 rounded-xl transition-all duration-300 ${isSignUp ? 'bg-white/10 text-white shadow-md' : 'text-white/50 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 mb-6">
            <div className="space-y-2 relative">
              <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wider font-semibold ml-1">Email</Label>
              <div className="relative">
                <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-11 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-white/70 text-xs uppercase tracking-wider font-semibold">Password</Label>
                {!isSignUp && <a href="#" className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>}
              </div>
              <div className="relative">
                <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-11 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-xl transition-all"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2 relative">
                <Label htmlFor="siteName" className="text-white/70 text-xs uppercase tracking-wider font-semibold ml-1">Workspace Name</Label>
                <div className="relative">
                  <IconUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="siteName"
                    type="text"
                    placeholder="my-cool-site (optional)"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="h-12 pl-11 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-xl transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 rounded-xl mt-4 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span className="bg-[#030303] px-4 rounded-full border border-white/10">Testing & Demo</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGuestLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
            >
              🚀 Instant Mock Login (Guest)
            </Button>

            <Button
              onClick={handleMockIdentify}
              variant="ghost"
              className="w-full h-11 hover:bg-white/5 text-white/50 hover:text-white font-medium rounded-xl transition-all text-sm"
              type="button"
            >
              Auto-fill Demo Credentials
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
