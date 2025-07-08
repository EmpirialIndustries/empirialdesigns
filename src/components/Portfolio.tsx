
import { ExternalLink, Globe, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Portfolio = () => {
  const portfolioItems = [
    // Landing Pages
    {
      id: 1,
      type: 'landing',
      icon: Globe,
      title: 'Empirial Attorney',
      company: 'Legal Services',
      location: 'Professional Law Firm',
      description: 'Professional law firm website with "Justice. Integrity. Excellence." theme. Features practice areas, attorney profiles, and consultation booking system.',
      features: ['Professional Design', 'Consultation Booking', 'Practice Areas', 'Attorney Profiles'],
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
      url: 'https://empirialattorney.netlify.app'
    },
    {
      id: 2,
      type: 'landing',
      icon: Globe,
      title: 'SKCC Cycling Club',
      company: 'Community Organization',
      location: 'Cycling Community',
      description: 'Community cycling organization website featuring tour countdown, events calendar, and member registration system.',
      features: ['Event Calendar', 'Tour Countdown', 'Member Registration', 'Community Features'],
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      url: 'https://skcc.netlify.app'
    },
    {
      id: 3,
      type: 'landing',
      icon: Globe,
      title: 'Empirial Spa & Wellness',
      company: 'Wellness Center',
      location: 'Spa & Wellness',
      description: 'Luxury spa and wellness sanctuary website with booking system, service catalog, and tranquil design aesthetic.',
      features: ['Online Booking', 'Service Catalog', 'Wellness Programs', 'Luxury Design'],
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
      url: 'https://empirialspa.netlify.app'
    },
    // E-Commerce Sites
    {
      id: 4,
      type: 'ecommerce',
      icon: ShoppingCart,
      title: 'Empirial iPhones',
      company: 'Mobile Technology',
      location: 'Electronics Store',
      description: 'Premium iPhone and mobile device e-commerce store with detailed product specifications, secure checkout, and customer support.',
      features: ['Product Catalog', 'Secure Checkout', 'Customer Support', 'Device Specifications'],
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
      url: 'https://empirialiphones.netlify.app'
    },
    {
      id: 5,
      type: 'ecommerce',
      icon: ShoppingCart,
      title: 'Elite Sneakers',
      company: 'Fashion Retail',
      location: 'Sneaker Store',
      description: 'Modern sneaker e-commerce platform featuring premium brands, size selection, and authenticated products with fast shipping.',
      features: ['Brand Filtering', 'Size Selection', 'Authentication', 'Fast Shipping'],
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
      url: '/elite-sneakers'
    },
    {
      id: 6,
      type: 'ecommerce',
      icon: ShoppingCart,
      title: 'Trading EA Store',
      company: 'Digital Products',
      location: 'Trading Solutions',
      description: 'Digital trading Expert Advisor marketplace with instant downloads, license management, and performance statistics.',
      features: ['Instant Download', 'License Management', 'Performance Stats', 'Trading Analytics'],
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
      url: '/trading-ea-store'
    }
  ];

  const landingPages = portfolioItems.filter(item => item.type === 'landing');
  const ecommercePages = portfolioItems.filter(item => item.type === 'ecommerce');

  const PortfolioCard = ({ item }) => (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-500 group overflow-hidden elegant-shadow">
      <div className="aspect-video overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <item.icon className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{item.title}</h3>
            <p className="text-white/60 font-medium">{item.company}</p>
          </div>
        </div>
        
        <p className="text-sm text-white/40 mb-2 flex items-center gap-2">
          <span>📍</span> {item.location}
        </p>
        
        <p className="text-white/80 mb-6 leading-relaxed">
          {item.description}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-6">
          {item.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-white/70">
              <Star className="w-3 h-3 text-white fill-white" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full bg-white text-black font-bold hover:bg-white/90 transition-all duration-300"
          onClick={() => window.open(item.url, '_blank')}
        >
          View Project
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <section id="portfolio" className="py-24 bg-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-gray-300 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-white">OUR</span>{' '}
            <span className="text-gradient-white">PORTFOLIO</span>
          </h2>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-white flex-1 max-w-32"></div>
            <p className="text-xl text-white font-black mx-8 tracking-[0.3em]">
              RECENT PROJECTS
            </p>
            <div className="h-px bg-white flex-1 max-w-32"></div>
          </div>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Explore our recent work showcasing innovative web solutions for South African businesses. 
            From stunning landing pages to comprehensive e-commerce platforms.
          </p>
        </div>

        {/* Landing Pages Section */}
        <div className="mb-20">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
            Landing Page Websites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {landingPages.map((item, index) => (
              <div key={item.id} className="animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <PortfolioCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* E-commerce Section */}
        <div>
          <h3 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">
            E-Commerce Websites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ecommercePages.map((item, index) => (
              <div key={item.id} className="animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <PortfolioCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
