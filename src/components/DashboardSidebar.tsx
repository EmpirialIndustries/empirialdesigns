import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, FolderGit2, Settings, LogOut, Plus, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

// Fix for Lucide icon types if needed
const IconHome = Home as any;
const IconFolderGit2 = FolderGit2 as any;
const IconSettings = Settings as any;
const IconLogOut = LogOut as any;
const IconPlus = Plus as any;
const IconSparkles = Sparkles as any;

interface DashboardSidebarProps {
    userEmail?: string | null;
}

export const DashboardSidebar = ({ userEmail }: DashboardSidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut(auth);
        navigate('/');
    };

    const menuItems = [
        { icon: IconHome, label: 'Home', path: '/repos' },
        { icon: IconFolderGit2, label: 'All Projects', path: '/repos?view=all' },
        // { icon: IconSettings, label: 'Settings', path: '/settings' }, // Placeholder for now
    ];

    return (
        <div className="w-64 h-screen flex-shrink-0 bg-[#020617] border-r border-white/5 flex flex-col sticky top-0">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <img
                        src="/lovable-uploads/LOGO_Empirial_Designs-removebg-preview.png"
                        alt="Logo"
                        className="w-5 h-5 object-contain opacity-90"
                    />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Empirial</span>
            </div>

            {/* Upload/New Project - replicating top action button */}
            <div className="px-4 mb-6">
                <Button
                    onClick={() => navigate('/generate')}
                    className="w-full justify-start gap-2 bg-white/5 hover:bg-white/10 text-white/90 border border-white/5 h-10 rounded-lg transition-all group"
                >
                    <IconPlus className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                    <span className="font-medium text-sm">New Project</span>
                </Button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-2 space-y-1">
                {menuItems.map((item) => (
                    <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "w-full justify-start gap-3 h-10 rounded-lg px-3 transition-all",
                            (location.pathname === item.path.split('?')[0] && !location.search) || (location.search && item.path.includes(location.search))
                                ? "bg-white/10 text-white font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn("w-4 h-4", (location.pathname === item.path) ? "text-indigo-400" : "opacity-70")} />
                        {item.label}
                    </Button>
                ))}
            </div>

            {/* Status/Credits Placeholder */}
            <div className="px-4 pb-4">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <IconSparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-indigo-300">Pro Plan</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-[70%] h-full rounded-full" />
                    </div>
                    <p className="text-[10px] text-white/40">70% credits remaining</p>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {userEmail?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{userEmail?.split('@')[0]}</span>
                            <span className="text-[10px] text-white/40 truncate">{userEmail}</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        className="h-8 w-8 text-white/30 hover:text-white/80 hover:bg-transparent"
                    >
                        <IconLogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
