
import { Heart, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background border-t border-border py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Enhanced Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">E</span>
              </div>
              <span className="text-xl font-black text-foreground">Empirial Designs</span>
            </div>
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-6">
              Professional graphic design services that elevate your brand and captivate your audience. 
              Creating digital experiences that make lasting impressions.
            </p>
            <Button 
              onClick={scrollToTop} 
              className="gradient-primary text-primary-foreground font-bold hover:scale-105 smooth-transition elegant-shadow"
            >
              Back to Top
              <ArrowUp className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-black text-foreground mb-4 lg:mb-6 text-lg lg:text-xl">Services</h3>
            <ul className="space-y-3">
              <li><a href="#services" className="text-muted-foreground hover:text-foreground smooth-transition text-base lg:text-lg font-medium">Landing Pages</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-foreground smooth-transition text-base lg:text-lg font-medium">E-Commerce Websites</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-foreground smooth-transition text-base lg:text-lg font-medium">Poster Designs</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-foreground smooth-transition text-base lg:text-lg font-medium">Custom Solutions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-foreground mb-4 lg:mb-6 text-lg lg:text-xl">Contact</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground text-base lg:text-lg break-all">(+27) 79-862-9246</li>
              <li className="text-muted-foreground text-base lg:text-lg break-all">hello@empirialdesigns.com</li>
              <li className="text-muted-foreground text-base lg:text-lg">South Africa</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 lg:mt-16 pt-6 lg:pt-8 text-center">
          <p className="text-muted-foreground flex items-center justify-center text-base lg:text-lg flex-wrap">
            Made with <Heart className="w-5 h-5 text-red-500 mx-2" /> by Empirial Designs © 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
