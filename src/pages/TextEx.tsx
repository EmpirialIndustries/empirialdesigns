import { useState } from 'react';
import { Upload, FileText, Download, Copy, CheckCircle, AlertCircle, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useToast } from '@/components/ui/use-toast';

const TextEx = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }
    setFile(selectedFile);
    setExtractedText('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const extractText = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate text extraction process
    const steps = [20, 40, 60, 80, 100];
    for (let i = 0; i < steps.length; i++) {
      setTimeout(() => {
        setProgress(steps[i]);
      }, (i + 1) * 500);
    }

    // Mock extracted text after 3 seconds
    setTimeout(() => {
      const mockText = `EXTRACTED TEXT FROM: ${file.name}

This is a sample of extracted text from your PDF document. In a real implementation, this would contain the actual text content from your PDF file.

Key Features of TextEx:
• Advanced OCR technology for scanned documents
• Maintains formatting and structure
• Supports multiple languages
• Batch processing capabilities
• High accuracy text recognition

The extracted text would appear here, preserving the original formatting and structure as much as possible. This includes paragraphs, bullet points, and other text elements from your PDF document.

For production use, this tool would integrate with professional PDF processing APIs to provide accurate text extraction from any PDF document, including scanned images and complex layouts.`;

      setExtractedText(mockText);
      setIsProcessing(false);
      toast({
        title: "Text Extraction Complete!",
        description: "Your PDF text has been successfully extracted."
      });
    }, 2500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard."
    });
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-semibold">PDF TEXT EXTRACTION</span>
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

          {/* N8N Workflow Visualization */}
          <Card className="mb-12 bg-white/80 backdrop-blur-lg border border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Automated Workflow Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-1">Manual Trigger</h3>
                  <p className="text-sm text-gray-600">Click 'Execute' to start</p>
                </div>
                
                <div className="hidden md:block w-8 h-px bg-gray-300"></div>
                <div className="md:hidden h-8 w-px bg-gray-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Read Binary File</h3>
                  <p className="text-sm text-gray-600">Load PDF from /data/pdf.pdf</p>
                </div>
                
                <div className="hidden md:block w-8 h-px bg-gray-300"></div>
                <div className="md:hidden h-8 w-px bg-gray-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Read PDF</h3>
                  <p className="text-sm text-gray-600">Extract text content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Tool */}
          <Card className="bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <FileText className="w-7 h-7" />
                PDF Text Extractor
              </CardTitle>
              <p className="text-muted-foreground">Upload a PDF file to extract its text content</p>
            </CardHeader>
            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : file 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  {file ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                      <div>
                        <p className="font-semibold text-green-700">{file.name}</p>
                        <p className="text-sm text-green-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-gray-600"
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF files up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-input"
                      />
                      <label htmlFor="file-input">
                        <Button variant="outline" className="cursor-pointer">
                          Select PDF File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                {/* Extract Button */}
                <div className="text-center">
                  <Button 
                    onClick={extractText}
                    disabled={!file || isProcessing}
                    className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-bold"
                  >
                    {isProcessing ? 'Extracting...' : 'Extract Text'}
                  </Button>
                </div>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Extraction Progress</span>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-3" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-medium">
                        {progress < 20 ? 'Reading PDF file...' :
                         progress < 40 ? 'Analyzing document structure...' :
                         progress < 60 ? 'Processing text content...' :
                         progress < 80 ? 'Formatting extracted text...' :
                         progress < 100 ? 'Finalizing extraction...' :
                         'Complete! Text ready for use.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {extractedText && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Extracted Text</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadText}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="preview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">Formatted Preview</TabsTrigger>
                        <TabsTrigger value="raw">Raw Text</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preview" className="space-y-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="prose max-w-none">
                              {extractedText.split('\n').map((line, index) => (
                                <p key={index} className="mb-2 leading-relaxed">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="raw" className="space-y-4">
                        <Textarea
                          value={extractedText}
                          onChange={(e) => setExtractedText(e.target.value)}
                          className="min-h-[400px] font-mono text-sm"
                          placeholder="Extracted text will appear here..."
                        />
                      </TabsContent>
                    </Tabs>

                    {/* Professional Services CTA */}
                    <Card className="bg-gradient-to-r from-black to-gray-800 text-white border-0">
                      <CardContent className="p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">Need Custom Text Processing Solutions?</h3>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                          Our team can build custom text extraction and processing workflows for your business. 
                          From automated document processing to AI-powered content analysis.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            onClick={openWhatsApp}
                            className="bg-white text-black hover:bg-gray-100 font-bold px-6 py-3"
                          >
                            Get Custom Solution
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-white text-white hover:bg-white hover:text-black px-6 py-3"
                          >
                            View Automation Services
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center border-0 bg-white/60 backdrop-blur hover:bg-white/80 transition-all duration-300">
              <CardContent className="p-6">
                <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-bold mb-2 text-lg">Accurate Extraction</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Advanced OCR technology ensures high accuracy text extraction from any PDF
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/60 backdrop-blur hover:bg-white/80 transition-all duration-300">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-bold mb-2 text-lg">Lightning Fast</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Process documents in seconds with our optimized extraction engine
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 bg-white/60 backdrop-blur hover:bg-white/80 transition-all duration-300">
              <CardContent className="p-6">
                <Target className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-bold mb-2 text-lg">Format Preservation</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Maintains original formatting and structure for better readability
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TextEx;