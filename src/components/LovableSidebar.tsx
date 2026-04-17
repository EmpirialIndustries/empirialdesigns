import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home, Search, Book, Plug, Grid, Star, Gift, Zap,
  ChevronDown, MessageCircle, Settings, Check, Eye, EyeOff,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getSavedApiKey, saveApiKey } from '@/lib/claude';

interface LovableSidebarProps {
  userEmail?: string | null;
}

export const LovableSidebar = ({ userEmail }: LovableSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getSavedApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasKey = !!getSavedApiKey();

  const handleSaveKey = () => {
    saveApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('empirial_mock_login');
    await signOut(auth).catch(() => {});
    navigate('/');
  };

  const isHome = location.pathname === '/dashboard';

  return (
    <>
      <div className="w-64 h-screen flex-shrink-0 bg-[#fefdfb] border-r border-[#ece0db]/60 flex flex-col sticky top-0 shadow-[2px_0_10px_rgba(0,0,0,0.01)] text-[#333]">

        {/* Brand / Selector */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            {/* Logo icon */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-300 rounded-[5px] scale-[0.8] shadow-sm transform -rotate-12" />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[5px] scale-[0.8] shadow-sm transform rotate-12 opacity-80" />
            </div>
            <span className="font-semibold text-[13px] tracking-tight">
              {userEmail?.split('@')[0] || 'Empirial'}'s Workspace
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 scrollbar-hide">

          {/* Main Nav */}
          <div className="space-y-0.5">
            <Button
              variant="ghost"
              className={`w-full justify-start h-8 px-2 text-[13px] font-medium transition-colors ${
                isHome
                  ? 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
              onClick={() => navigate('/dashboard')}
            >
              <Home className="w-4 h-4 mr-3 text-gray-500" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-between h-8 px-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100/60">
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-3 opacity-60" />
                Search
              </div>
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-semibold tracking-wider">Ctrl K</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100/60">
              <Book className="w-4 h-4 mr-3 opacity-60" />
              Resources
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100/60">
              <Plug className="w-4 h-4 mr-3 opacity-60" />
              Connectors
            </Button>
          </div>

          {/* Projects section */}
          <div>
            <div className="px-2 mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Projects</p>
            </div>
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                onClick={() => navigate('/dashboard')}
              >
                <Grid className="w-4 h-4 mr-3 opacity-60" />
                All projects
              </Button>
              <Button variant="ghost" className="w-full justify-start h-8 px-2 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100/60">
                <Star className="w-4 h-4 mr-3 opacity-60" />
                Starred
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Cards & Profile */}
        <div className="px-3 pb-3 space-y-3">
          {/* Share Card */}
          <div className="bg-[#f9f8f6] rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 hover:shadow-md transition-all flex items-start justify-between">
            <div>
              <p className="text-[12px] font-semibold text-gray-800">Share Empirial</p>
              <p className="text-[10px] text-gray-500 mt-0.5">100 credits per paid referral</p>
            </div>
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 mt-1">
              <Gift className="w-3.5 h-3.5 text-gray-600" />
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="bg-[#f9f8f6] rounded-xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 hover:shadow-md transition-all flex items-start justify-between group">
            <div>
              <p className="text-[12px] font-semibold text-gray-800">Upgrade to Pro</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Unlock more features</p>
            </div>
            <div className="bg-indigo-50 group-hover:bg-indigo-100 transition-colors rounded-full p-1.5 mt-1 border border-indigo-100">
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            </div>
          </div>

          {/* User Profile Row */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#8c6A5D] flex items-center justify-center text-xs font-semibold text-white">
                {userEmail?.[0]?.toUpperCase() || 'E'}
              </div>
              <span className="text-[12px] text-gray-600 truncate max-w-[100px]">
                {userEmail?.split('@')[0] || 'User'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Notifications */}
              <div className="relative p-1 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4 text-gray-500 hover:text-gray-800" />
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>

              {/* Settings / API Key */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="relative p-1 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                title="API Key Settings"
              >
                <Settings className="w-4 h-4 text-gray-500 hover:text-gray-800" />
                {hasKey && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-[15px]">API Key Settings</DialogTitle>
            <DialogDescription className="text-gray-500 text-[13px]">
              Paste your Anthropic API key. It's stored only in your browser.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full h-10 px-3 pr-10 rounded-xl border border-gray-200 text-[13px] text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <a
                href="https://console.anthropic.com/account/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-500 hover:underline"
              >
                Get your API key →
              </a>
              <button
                onClick={handleSaveKey}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 hover:bg-gray-700 text-white'
                }`}
              >
                {saved ? (
                  <><Check className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  'Save key'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
