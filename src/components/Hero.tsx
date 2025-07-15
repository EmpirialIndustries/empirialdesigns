import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const openWhatsApp = () => {
  window.open('https://wa.me/message/MMS5VDEZUHSBK1', '_blank');
};
const Hero = () => {
  return <section id="home" className="min-h-screen bg-white/95 backdrop-blur-lg flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-96 h-96 bg-black rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gray-800 rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-600 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }}></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="w-full h-full" style={{
        backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0,0,0,0.1) 2px, transparent 0)`,
        backgroundSize: '50px 50px'
      }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32">
        <div className="text-center max-w-6xl mx-auto">
          {/* Enhanced Quality Badge */}
          <div className="inline-flex items-center gap-3 bg-black/10 backdrop-blur-lg border border-black/20 rounded-full px-8 py-4 mb-12 animate-scale-in elegant-shadow">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black text-black tracking-wider">100% ORIGINAL</span>
            <Sparkles className="w-5 h-5 text-black" />
            <span className="text-sm text-gray-600 font-semibold tracking-wider">GRAPHIC DESIGNER</span>
          </div>

          {/* Enhanced Main Heading */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 animate-fade-in leading-none">
            <span className="block text-black tracking-tight">EMPIRIAL</span>
            <span className="block text-gradient tracking-tight relative">
              DESIGNS
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-black/10 rounded-full animate-ping"></div>
            </span>
          </h1>

          {/* Enhanced Subheading */}
          <div className="flex items-center justify-center mb-12 animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <div className="h-px bg-black flex-1 max-w-40"></div>
            <p className="text-2xl md:text-3xl font-light text-gray-700 mx-8 tracking-[0.2em]">
              HOW CAN I HELP YOU?
            </p>
            <div className="h-px bg-black flex-1 max-w-40"></div>
          </div>

          {/* Enhanced Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in font-light" style={{
          animationDelay: '0.4s'
        }}>
            Transform your vision into stunning digital experiences. Professional graphic design services 
            that elevate your brand and captivate your audience with unmatched creativity.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{
          animationDelay: '0.6s'
        }}>
            <Button 
              size="lg" 
              className="bg-black text-white font-bold px-12 py-6 text-xl group hover:scale-105 transition-all duration-300 elegant-shadow rounded-full"
              onClick={() => scrollToSection('services')}
            >
              View Our Services
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-black text-black hover:bg-black hover:text-white px-12 py-6 text-xl hover:scale-105 transition-all duration-300 font-bold rounded-full"
              onClick={openWhatsApp}
            >
              Get In Touch
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;