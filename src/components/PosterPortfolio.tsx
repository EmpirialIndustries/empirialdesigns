import { Star, ZoomIn, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PosterPortfolio = () => {
  const posterItems = [
    {
      id: 1,
      title: 'Frank Freight World - Truck Rental',
      category: 'Business',
      description: 'Professional truck rental advertisement featuring bold yellow branding and comprehensive service details.',
      image: '/lovable-uploads/d07e4413-7fb3-4990-84d0-93630a872628.png',
      tags: ['Transport', 'Business', 'Advertising']
    },
    {
      id: 2,
      title: 'Sneaker Fest 2024',
      category: 'Event',
      description: 'Dynamic event poster for annual sneaker festival featuring vibrant graphics and artist lineup.',
      image: '/lovable-uploads/b3b81645-c461-448a-83e2-237dc3110495.png',
      tags: ['Event', 'Music', 'Festival']
    },
    {
      id: 3,
      title: 'Venom Ultra Sniper 1.4',
      category: 'Technology',
      description: 'Trading bot advertisement with futuristic design and detailed feature breakdown.',
      image: '/lovable-uploads/9c27a6d7-0a94-4176-a3f2-a0dc987cbc54.png',
      tags: ['Trading', 'Technology', 'Finance']
    },
    {
      id: 4,
      title: 'TTFX Traders Package',
      category: 'Education',
      description: 'Professional trading course poster featuring clean design and comprehensive package details.',
      image: '/lovable-uploads/22d9c514-b27e-4c39-839f-cac29355479e.png',
      tags: ['Education', 'Trading', 'Finance']
    },
    {
      id: 5,
      title: 'Empirial Designs Logo',
      category: 'Branding',
      description: 'Clean and minimalist logo design showcasing professional graphic design identity.',
      image: '/lovable-uploads/8f876b0e-769b-491f-a69f-66d9c471ffd0.png',
      tags: ['Logo', 'Branding', 'Minimalist']
    },
    {
      id: 6,
      title: 'Chess Tournament',
      category: 'Event',
      description: 'Elegant chess tournament poster with sophisticated black and white design aesthetic.',
      image: '/lovable-uploads/feffd106-e239-4344-93f0-ebb963e8fc96.png',
      tags: ['Chess', 'Tournament', 'Elegant']
    },
    {
      id: 7,
      title: 'Truck Hire Service',
      category: 'Business',
      description: 'Modern truck rental service advertisement with clear pricing and contact information.',
      image: '/lovable-uploads/3ef58336-c932-47cd-8a1c-0e07ea8c80d4.png',
      tags: ['Transport', 'Business', 'Service']
    },
    {
      id: 8,
      title: 'Truck Rental - Tortliner',
      category: 'Business',
      description: 'Professional truck rental poster featuring multiple vehicle options and service benefits.',
      image: '/lovable-uploads/98b58ad9-141b-46b5-9f3e-0f4a40632f60.png',
      tags: ['Transport', 'Rental', 'Professional']
    }
  ];

  const categories = ['All', 'Business', 'Event', 'Technology', 'Education', 'Branding'];

  const PosterCard = ({ item }) => (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-500 group overflow-hidden elegant-shadow">
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            className="bg-white text-black font-bold hover:bg-white/90 transition-all duration-300"
            size="sm"
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            View Full Size
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-black text-white mb-1">{item.title}</h3>
          <p className="text-white/60 font-medium text-sm">{item.category}</p>
        </div>
        
        <p className="text-white/80 mb-4 leading-relaxed text-sm">
          {item.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag, index) => (
            <div key={index} className="flex items-center gap-1 text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
              <Star className="w-2 h-2 text-white fill-white" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="poster-portfolio" className="py-24 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-black rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gray-800 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1"></div>
            <div className="text-center">
              <h2 className="text-5xl md:text-7xl font-black mb-8">
                <span className="text-gradient">POSTER</span>{' '}
                <span className="text-foreground">PORTFOLIO</span>
              </h2>
            </div>
            <div className="flex-1 flex justify-end gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white"
                onClick={() => window.open('https://wa.me/message/MMS5VDEZUHSBK1', '_blank')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Work
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="text-black hover:text-primary"
                onClick={() => window.open('https://www.tiktok.com/@empirialdesigns?_t=ZM-8xuIhnsCDHK&_r=1', '_blank')}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                TikTok
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-black flex-1 max-w-32"></div>
            <p className="text-xl text-foreground font-black mx-8 tracking-[0.3em]">
              DESIGN SHOWCASE
            </p>
            <div className="h-px bg-black flex-1 max-w-32"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our creative poster designs for events, marketing campaigns, and promotional materials. 
            Each design crafted to capture attention and communicate your message effectively.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="bg-white/80 backdrop-blur-lg border border-black/20 hover:bg-black hover:text-white transition-all duration-300"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Poster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posterItems.map((item, index) => (
            <div key={item.id} className="animate-fade-in" style={{animationDelay: `${index * 0.15}s`}}>
              <PosterCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PosterPortfolio;