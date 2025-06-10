
import { Pen, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Pen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EMPIRIAL DESIGNS</span>
            </div>
            <p className="text-muted-foreground">
              Professional graphic design services that elevate your brand and captivate your audience.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Landing Pages</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">E-Commerce Websites</a></li>
              <li><a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Poster Designs</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Custom Solutions</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">(+27) 79-862-9246</li>
              <li className="text-muted-foreground">hello@empirialdesigns.com</li>
              <li className="text-muted-foreground">South Africa</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground flex items-center justify-center">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by Empirial Designs © 2024
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
