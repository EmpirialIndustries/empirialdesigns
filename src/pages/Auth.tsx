import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "Check your email to confirm your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        navigate('/chat');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
          <ArrowLeft className="mr-2 h-4 w-4" />
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

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-full elegant-shadow"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
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
