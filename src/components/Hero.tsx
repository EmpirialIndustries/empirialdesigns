import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.png';

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const openWhatsApp = () => {
  window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
};

const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/40"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight animate-fade-in">
            Websites & Graphics that win customers.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-300 mb-8">
            Custom landing pages and marketing designs for South African businesses—fast, original, and conversion-focused.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-500">
            <Button 
              size="lg" 
              onClick={openWhatsApp}
              className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-8 py-4"
            >
              Get a Free Quote
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => scrollToSection('portfolio')}
              className="border-white text-white hover:bg-white hover:text-black font-semibold text-lg px-8 py-4"
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