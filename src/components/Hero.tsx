
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Quality Badge */}
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3 mb-8 animate-scale-in">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">100% ORIGINAL</span>
            <span className="text-xs text-muted-foreground">GRAPHIC DESIGNER</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in">
            <span className="block text-foreground">EMPIRIAL</span>
            <span className="block text-gradient">DESIGNS</span>
          </h1>

          {/* Subheading */}
          <div className="flex items-center justify-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-px bg-primary flex-1 max-w-32"></div>
            <p className="text-xl md:text-2xl font-light text-muted-foreground mx-6">
              HOW CAN I HELP YOU?
            </p>
            <div className="h-px bg-primary flex-1 max-w-32"></div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Transform your vision into stunning digital experiences. Professional graphic design services 
            that elevate your brand and captivate your audience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="gradient-primary text-primary-foreground font-semibold px-8 py-4 text-lg group"
            >
              View Our Services
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
            >
              Get In Touch
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
