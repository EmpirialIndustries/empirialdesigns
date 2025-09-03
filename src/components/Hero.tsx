import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Websites & Graphics that win customers.
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8 px-4">
            Custom landing pages and marketing designs for South African businesses—fast, original, and conversion-focused.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 max-w-md mx-auto sm:max-w-none">
            <Button 
              size="lg" 
              onClick={openWhatsApp}
              className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-8 py-4 w-full sm:w-auto min-w-[200px]"
            >
              Get a Free Quote
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection('portfolio')}
              className="border-white text-white hover:bg-white hover:text-black font-semibold text-lg px-8 py-4 w-full sm:w-auto min-w-[200px]"
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