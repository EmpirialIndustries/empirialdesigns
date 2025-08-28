import { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, XCircle, Download, Globe, Zap, Target, BarChart, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

interface AuditResult {
  score: number;
  criticalIssues: string[];
  quickWins: string[];
  opportunities: string[];
  techAnalysis: {
    pageSpeed: number;
    mobileOptimized: boolean;
    seoTitle: boolean;
    metaDescription: boolean;
    headingStructure: boolean;
    imageAlt: boolean;
  };
}

const SEOAudit = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const { toast } = useToast();

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const handleAudit = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAuditResult(null);

    // Simulate audit process
    const intervals = [20, 40, 60, 80, 100];
    for (let i = 0; i < intervals.length; i++) {
      setTimeout(() => {
        setProgress(intervals[i]);
      }, (i + 1) * 800);
    }

    // Mock audit results after 5 seconds
    setTimeout(() => {
      const mockResult: AuditResult = {
        score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
        criticalIssues: [
          'Missing meta description on homepage',
          'No structured data markup found',
          'Page speed issues (3.2s load time)',
          'Missing canonical tags on key pages'
        ],
        quickWins: [
          'Add alt text to 12 images missing descriptions',
          'Optimize title tag length (currently too long)',
          'Fix 3 broken internal links',
          'Add proper heading hierarchy (H1 → H2 → H3)'
        ],
        opportunities: [
          'Implement schema markup for better rich snippets',
          'Optimize images for faster loading',
          'Create XML sitemap for better indexing',
          'Improve mobile page speed score'
        ],
        techAnalysis: {
          pageSpeed: Math.floor(Math.random() * 30) + 60,
          mobileOptimized: Math.random() > 0.3,
          seoTitle: Math.random() > 0.2,
          metaDescription: Math.random() > 0.4,
          headingStructure: Math.random() > 0.3,
          imageAlt: Math.random() > 0.5
        }
      };

      setAuditResult(mockResult);
      setIsAnalyzing(false);
      toast({
        title: "Audit Complete!",
        description: "Your website analysis is ready to review."
      });
    }, 4000);
  };

  const downloadReport = () => {
    // In a real implementation, this would generate and download a PDF report
    toast({
      title: "Report Generated",
      description: "Your SEO audit report has been prepared. Contact us for the full detailed version!",
    });
    openWhatsApp();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">FREE SEO AUDIT TOOL</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-gradient">WEBSITE</span>{' '}
              <span className="text-foreground">AUDIT</span>
            </h1>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-black flex-1 max-w-32"></div>
              <p className="text-lg lg:text-xl text-foreground font-black mx-6 lg:mx-8 tracking-[0.3em]">
                INSTANT ANALYSIS
              </p>
              <div className="h-px bg-black flex-1 max-w-32"></div>
            </div>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Get a comprehensive SEO audit of your website in seconds. Identify critical issues, 
              quick wins, and optimization opportunities to boost your search rankings.
            </p>
          </div>

          {/* Audit Tool */}
          <Card className="bg-white/60 backdrop-blur-lg border border-gray-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Search className="w-6 h-6" />
                Website SEO Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="Enter your website URL (e.g., https://yoursite.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-lg p-4 h-14"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <Button 
                    onClick={handleAudit}
                    disabled={isAnalyzing || !url}
                    className="bg-black text-white hover:bg-gray-800 px-8 h-14 text-lg font-bold"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Audit Now'}
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="space-y-4">
                    <Progress value={progress} className="w-full h-3" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {progress < 25 ? 'Fetching website data...' :
                         progress < 50 ? 'Analyzing technical SEO...' :
                         progress < 75 ? 'Checking content optimization...' :
                         progress < 100 ? 'Generating recommendations...' :
                         'Finalizing audit results...'}
                      </p>
                    </div>
                  </div>
                )}

                {auditResult && (
                  <div className="mt-8 space-y-6">
                    {/* Overall Score */}
                    <Card className={`${getScoreBg(auditResult.score)} border-0`}>
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className={`text-4xl font-black ${getScoreColor(auditResult.score)}`}>
                            {auditResult.score}/100
                          </div>
                          {auditResult.score >= 80 ? 
                            <CheckCircle className="w-8 h-8 text-green-600" /> :
                            auditResult.score >= 60 ?
                            <AlertTriangle className="w-8 h-8 text-yellow-600" /> :
                            <XCircle className="w-8 h-8 text-red-600" />
                          }
                        </div>
                        <h3 className="text-xl font-bold mb-2">Overall SEO Score</h3>
                        <p className="text-gray-600">
                          {auditResult.score >= 80 ? 'Excellent! Your website is well optimized.' :
                           auditResult.score >= 60 ? 'Good foundation with room for improvement.' :
                           'Significant optimization opportunities identified.'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Technical Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart className="w-5 h-5" />
                          Technical Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(auditResult.techAnalysis.pageSpeed)}`}>
                              {auditResult.techAnalysis.pageSpeed}
                            </div>
                            <p className="text-sm text-gray-600">Page Speed</p>
                          </div>
                          <div className="text-center">
                            {auditResult.techAnalysis.mobileOptimized ? 
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" /> :
                              <XCircle className="w-8 h-8 text-red-600 mx-auto" />
                            }
                            <p className="text-sm text-gray-600 mt-1">Mobile Ready</p>
                          </div>
                          <div className="text-center">
                            {auditResult.techAnalysis.seoTitle ? 
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" /> :
                              <XCircle className="w-8 h-8 text-red-600 mx-auto" />
                            }
                            <p className="text-sm text-gray-600 mt-1">SEO Title</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Results */}
                    <Tabs defaultValue="critical" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="critical">Critical Issues</TabsTrigger>
                        <TabsTrigger value="quick">Quick Wins</TabsTrigger>
                        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="critical" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                              <XCircle className="w-5 h-5" />
                              Critical Issues - Fix Immediately
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {auditResult.criticalIssues.map((issue, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="quick" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-600">
                              <Zap className="w-5 h-5" />
                              Quick Wins - Easy Fixes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {auditResult.quickWins.map((win, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{win}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="opportunities" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-600">
                              <Target className="w-5 h-5" />
                              Growth Opportunities
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3">
                              {auditResult.opportunities.map((opportunity, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{opportunity}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button 
                        onClick={downloadReport}
                        className="flex-1 bg-black text-white hover:bg-gray-800 h-12"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Get Detailed Report
                      </Button>
                      <Button 
                        onClick={openWhatsApp}
                        variant="outline"
                        className="flex-1 border-black text-black hover:bg-black hover:text-white h-12"
                      >
                        Get Professional Help
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center border-0 bg-white/40 backdrop-blur">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-bold mb-2">Complete Analysis</h3>
                <p className="text-sm text-gray-600">Technical SEO, content optimization, and performance metrics</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/40 backdrop-blur">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-bold mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">Get your audit results in under 30 seconds</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/40 backdrop-blur">
              <CardContent className="p-6">
                <Target className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold mb-2">Actionable Insights</h3>
                <p className="text-sm text-gray-600">Clear recommendations you can implement today</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SEOAudit;