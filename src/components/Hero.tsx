
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section id="home" className="min-h-screen gradient-bg flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, hsl(var(--primary)) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Enhanced Quality Badge */}
          <div className="inline-flex items-center gap-3 bg-card/60 backdrop-blur-lg border border-border/50 rounded-full px-8 py-4 mb-12 animate-scale-in shadow-2xl">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black text-foreground tracking-wider">100% ORIGINAL</span>
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-semibold tracking-wider">GRAPHIC DESIGNER</span>
          </div>

          {/* Enhanced Main Heading */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 animate-fade-in leading-none">
            <span className="block text-foreground tracking-tight">EMPIRIAL</span>
            <span className="block text-gradient tracking-tight relative">
              DESIGNS
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
            </span>
          </h1>

          {/* Enhanced Subheading */}
          <div className="flex items-center justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-px bg-gradient-primary flex-1 max-w-40"></div>
            <p className="text-2xl md:text-3xl font-light text-muted-foreground mx-8 tracking-[0.2em]">
              HOW CAN I HELP YOU?
            </p>
            <div className="h-px bg-gradient-primary flex-1 max-w-40"></div>
          </div>

          {/* Enhanced Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed animate-fade-in font-light" style={{ animationDelay: '0.4s' }}>
            Transform your vision into stunning digital experiences. Professional graphic design services 
            that elevate your brand and captivate your audience with unmatched creativity.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="gradient-primary text-primary-foreground font-bold px-12 py-6 text-xl group hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              View Our Services
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-12 py-6 text-xl hover:scale-105 transition-all duration-300 font-bold"
            >
              Get In Touch
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
