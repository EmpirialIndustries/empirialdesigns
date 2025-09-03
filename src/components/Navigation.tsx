
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      // Route navigation
      navigate(href);
    } else if (href.startsWith('#')) {
      // Section scrolling - only if on homepage
      if (location.pathname === '/') {
        scrollToSection(href);
      } else {
        // Navigate to homepage first, then scroll
        navigate('/');
        setTimeout(() => {
          scrollToSection(href);
        }, 100);
      }
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'WebAudit', href: '/seo-audit' }
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 sm:px-8 py-4 elegant-shadow">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg sm:text-xl">E</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-black">Empirial</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="text-black hover:text-gray-600 transition-colors duration-300 font-semibold text-base xl:text-lg relative group px-3 py-2 rounded-full hover:bg-white/20"
              >
                {item.name}
              </button>
            ))}
            <Button 
              className="bg-black text-white font-bold px-6 py-3 text-base xl:text-lg hover:bg-gray-800 transition-all duration-300 rounded-full elegant-shadow border border-black/20"
              onClick={openWhatsApp}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-12 w-12 rounded-full hover:bg-white/20"
            >
              {isOpen ? <X className="h-6 w-6 text-black" /> : <Menu className="h-6 w-6 text-black" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-6 pt-6 border-t border-white/20 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsOpen(false);
                  }}
                  className="text-black hover:text-gray-600 transition-colors duration-300 font-semibold text-lg px-4 py-3 rounded-full hover:bg-white/20 text-left w-full"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4">
                <Button 
                  className="w-full bg-black text-white font-bold text-lg py-3 rounded-full elegant-shadow"
                  onClick={openWhatsApp}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
