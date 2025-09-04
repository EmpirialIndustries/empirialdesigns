import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background to-muted">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
      
      {/* Floating Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-40 opacity-10 rotate-12 hidden lg:block">
          <img src="/lovable-uploads/Website Design Poster.png" alt="" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="absolute bottom-20 right-10 w-28 h-36 opacity-10 -rotate-12 hidden lg:block">
          <img src="/lovable-uploads/Genesis & Her Nails (2).png" alt="" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="absolute top-1/2 right-20 w-24 h-32 opacity-10 rotate-6 hidden xl:block">
          <img src="/lovable-uploads/Gudani Driving School.png" alt="" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-6 tracking-tight leading-tight">
            Websites & Graphics that win customers.
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8 px-4">
            Custom landing pages and marketing designs for South African businesses—fast, original, and conversion-focused.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 max-w-md mx-auto sm:max-w-none">
            <Button 
              size="lg" 
              onClick={openWhatsApp}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-4 w-full sm:w-auto min-w-[200px] elegant-shadow"
            >
              Get a Free Quote
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection('portfolio')}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4 w-full sm:w-auto min-w-[200px]"
            >
              View Work
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;