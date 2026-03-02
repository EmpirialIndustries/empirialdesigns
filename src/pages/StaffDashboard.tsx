import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Key, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiKeys = [
    {
        provider: 'DeepSeek Coder V2',
        role: 'Primary Generator (Raw HTML/React)',
        tokensUsed: '4,250,100',
        limit: '10,000,000',
        status: 'Healthy',
        progress: 42
    },
    {
        provider: 'OpenAI GPT-4o',
        role: 'UI Refining & Layout Adjustments',
        tokensUsed: '1,890,500',
        limit: '5,000,000',
        status: 'Healthy',
        progress: 37
    },
    {
        provider: 'Anthropic Claude 3.5 Sonnet',
        role: 'Marketing Copy & Final Polish',
        tokensUsed: '3,100,200',
        limit: '5,000,000',
        status: 'Warning',
        progress: 62
    }
];

const StaffDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans font-inter flex flex-col items-center">
            <header className="h-16 border-b border-[#222] bg-[#000000] flex items-center justify-between px-6 w-full sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-xl font-bold tracking-tight text-white/90">
                        Staff Admin Portal
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-500">System Online</span>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">API Token Usage Overview</h1>
                    <p className="text-white/50">Monitor token consumption across the custom multi-model pipeline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="bg-[#111] border-[#222]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Total Tokens MTD</CardTitle>
                            <Activity className="h-4 w-4 text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">9,240,800</div>
                            <p className="text-xs text-white/40 mt-1">+12.5% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#222]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Avg Gen Time</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">4.2s</div>
                            <p className="text-xs text-white/40 mt-1">DeepSeek V2 Pipeline</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#222]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-white/70">Active Sessions</CardTitle>
                            <Key className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">124</div>
                            <p className="text-xs text-white/40 mt-1">Concurrent connections</p>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-semibold mb-4 border-b border-[#222] pb-2 text-white/90">Model Pipeline Keys</h2>
                <div className="space-y-4">
                    {apiKeys.map((key) => (
                        <Card key={key.provider} className="bg-[#0A0A0A] border-[#222]">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white">{key.provider}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${key.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                            }`}>
                                            {key.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/50">{key.role}</p>
                                </div>

                                <div className="flex-[2] flex flex-col gap-2">
                                    <div className="flex justify-between text-xs text-white/70">
                                        <span>{key.tokensUsed} tokens used</span>
                                        <span>{key.limit} limit</span>
                                    </div>
                                    <div className="w-full bg-[#222] rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-500 ${key.progress > 60 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${key.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] text-white hover:bg-[#222]">Rotatate Key</Button>
                                    <Button variant="ghost" size="icon" className="text-white/50 hover:text-white"><AlertCircle className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StaffDashboard;
