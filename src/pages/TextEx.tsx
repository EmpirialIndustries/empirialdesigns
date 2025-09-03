import { useState } from 'react';
import { Upload, FileText, Download, Zap, CheckCircle, AlertCircle, Eye, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

interface ExtractedText {
  content: string;
  wordCount: number;
  pageCount: number;
  fileName: string;
}

const TextEx = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<ExtractedText | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file);
        setExtractedText(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file only.",
          variant: "destructive"
        });
      }
    }
  };

  const handleExtraction = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate extraction process
    const intervals = [25, 50, 75, 100];
    for (let i = 0; i < intervals.length; i++) {
      setTimeout(() => {
        setProgress(intervals[i]);
      }, (i + 1) * 600);
    }

    // Mock extraction results after 3 seconds
    setTimeout(() => {
      const mockText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`;

      const mockResult: ExtractedText = {
        content: mockText,
        wordCount: mockText.split(' ').length,
        pageCount: Math.floor(Math.random() * 10) + 1,
        fileName: selectedFile.name
      };

      setExtractedText(mockResult);
      setIsProcessing(false);
      toast({
        title: "Extraction Complete!",
        description: `Successfully extracted text from ${selectedFile.name}`
      });
    }, 2500);
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText.content);
      toast({
        title: "Copied!",
        description: "Text has been copied to clipboard."
      });
    }
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${extractedText.fileName.replace('.pdf', '')}_extracted.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearResults = () => {
    setExtractedText(null);
    setSelectedFile(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-semibold">PDF TEXT EXTRACTOR</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-gradient">TEXT</span>{' '}
              <span className="text-foreground">EXTRACTOR</span>
            </h1>
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-black flex-1 max-w-32"></div>
              <p className="text-lg lg:text-xl text-foreground font-black mx-6 lg:mx-8 tracking-[0.3em]">
                PDF TO TEXT
              </p>
              <div className="h-px bg-black flex-1 max-w-32"></div>
            </div>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Extract text from PDF documents instantly. Upload your PDF and get clean, 
              formatted text that you can copy, edit, or download.
            </p>
          </div>

          {/* Extraction Tool */}
          <Card className="bg-white/60 backdrop-blur-lg border border-gray-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                PDF Text Extraction Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isProcessing}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedFile ? selectedFile.name : 'Upload PDF File'}
                    </h3>
                    <p className="text-gray-500">
                      {selectedFile ? 'File ready for extraction' : 'Click to browse or drag and drop your PDF file here'}
                    </p>
                    {selectedFile && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        File Selected
                      </Badge>
                    )}
                  </label>
                </div>

                {/* Extract Button */}
                <div className="text-center">
                  <Button 
                    onClick={handleExtraction}
                    disabled={isProcessing || !selectedFile}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-bold"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-5 h-5 mr-2 animate-pulse" />
                        Extracting Text...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        Extract Text
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-4">
                    <Progress value={progress} className="w-full h-3" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {progress < 25 ? 'Reading PDF file...' :
                         progress < 50 ? 'Processing document structure...' :
                         progress < 75 ? 'Extracting text content...' :
                         progress < 100 ? 'Formatting output...' :
                         'Finalizing extraction...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {extractedText && (
                  <div className="mt-8 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-blue-600">{extractedText.pageCount}</div>
                          <div className="text-sm text-blue-600">Pages</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4 text-center">
                          <Eye className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold text-green-600">{extractedText.wordCount}</div>
                          <div className="text-sm text-green-600">Words</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold text-purple-600">100%</div>
                          <div className="text-sm text-purple-600">Extracted</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Text Content */}
                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="raw">Raw Text</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preview" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Extracted Text Preview</span>
                              <Badge variant="outline">{extractedText.fileName}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {extractedText.content}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="raw" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Raw Text Output</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={extractedText.content}
                              readOnly
                              className="min-h-96 font-mono text-sm"
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={copyToClipboard}
                        className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button 
                        onClick={downloadText}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download TXT
                      </Button>
                      <Button 
                        onClick={clearResults}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
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
                <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-bold mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-600">Extract text from PDFs in seconds with our optimized processing</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/40 backdrop-blur">
              <CardContent className="p-6">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold mb-2">High Accuracy</h3>
                <p className="text-sm text-gray-600">Advanced OCR technology ensures accurate text extraction</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/40 backdrop-blur">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-bold mb-2">Multiple Formats</h3>
                <p className="text-sm text-gray-600">Export as TXT, copy to clipboard, or view formatted preview</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-r from-black to-gray-800 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Custom PDF Processing?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Looking for bulk processing, OCR for scanned documents, or custom text extraction solutions? 
                Our team can build tailored PDF processing tools for your business needs.
              </p>
              <Button 
                onClick={openWhatsApp}
                className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-3"
              >
                Get Custom Solution
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TextEx;