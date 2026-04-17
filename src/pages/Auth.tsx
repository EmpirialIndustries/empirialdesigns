import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Sparkles, User, Lock, Mail } from 'lucide-react';

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
        toast({ title: "Welcome back!", description: "Mock credentials recognized. Using local session." });
        setLoading(false);
        navigate('/dashboard');
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
            user_id: user.uid, repo_name: cleanName, repo_owner: email.split('@')[0],
            repo_url: deployUrl, deploy_url: deployUrl, created_at: new Date().toISOString()
          });
        }
        toast({ title: "Success!", description: "Account created successfully." });
        navigate('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "You've successfully signed in." });
        navigate('/dashboard');
      }
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') message = 'Email already in use';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') message = 'Invalid email or password';
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('empirial_mock_login', 'true');
      toast({ title: "Mock Login Successful", description: "Welcome! You are using a temporary session." });
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  const handleMockIdentify = () => {
    setEmail('demo@empirial.com');
    setPassword('demo1234');
    toast({ title: "Mock Credentials Loaded", description: "Ready to test login flow." });
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans flex flex-col relative overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient glows matching ChatInterface */}
      <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-indigo-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Minimal header */}
      <header className="h-14 flex items-center px-5 w-full relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <IconSparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white/70">Aura Build</span>
        </div>
      </header>

      <div className="flex-1 flex justify-center items-center p-4 pb-20 relative z-10">
        <div className="w-full max-w-[400px] bg-[#050505]/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-1.5 tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-xs text-white/40">
              {isSignUp ? 'Sign up to access your workspace' : 'Sign in to access your workspace'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-black/40 p-1 rounded-lg mb-6 border border-white/5">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-xs font-medium h-8 rounded-md transition-all duration-200 ${!isSignUp ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-xs font-medium h-8 rounded-md transition-all duration-200 ${isSignUp ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3 mb-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Email</Label>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-3 gap-2 focus-within:border-white/20 transition-colors duration-200">
                <IconMail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <Input
                  id="email" type="email" placeholder="name@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-10 border-0 bg-transparent text-white text-sm placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-semibold text-white/30">Password</Label>
                {!isSignUp && <a href="#" className="text-[10px] font-medium text-indigo-400/70 hover:text-indigo-300 transition-colors duration-200">Forgot?</a>}
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-3 gap-2 focus-within:border-white/20 transition-colors duration-200">
                <IconLock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="h-10 border-0 bg-transparent text-white text-sm placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
            </div>

            {/* Workspace Name (sign up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="siteName" className="text-[10px] uppercase tracking-widest font-semibold text-white/30 ml-1">Workspace Name</Label>
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-3 gap-2 focus-within:border-white/20 transition-colors duration-200">
                  <IconUser className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <Input
                    id="siteName" type="text" placeholder="my-cool-site (optional)"
                    value={siteName} onChange={(e) => setSiteName(e.target.value)}
                    className="h-10 border-0 bg-transparent text-white text-sm placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full h-10 text-sm font-semibold bg-white text-black hover:bg-gray-200 border-0 rounded-xl mt-3 transition-colors duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest text-white/20">
              <span className="bg-[#050505] px-3">or</span>
            </div>
          </div>

          {/* Secondary actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGuestLogin} disabled={loading} variant="outline"
              className="w-full h-9 bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs font-medium rounded-xl transition-colors duration-200"
            >
              🚀 Instant Mock Login
            </Button>
            <Button
              onClick={handleMockIdentify} variant="ghost" type="button"
              className="w-full h-9 hover:bg-white/5 text-white/30 hover:text-white/50 text-xs font-medium rounded-xl transition-colors duration-200"
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
