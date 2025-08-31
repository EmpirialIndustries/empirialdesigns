import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Filter } from 'lucide-react';

const PortfolioGrid = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Landing Pages', 'Logos', 'Posters', 'Social'];

  const portfolioItems = [
    {
      id: 1,
      title: "Empirial iPhones Store",
      category: "Landing Pages",
      image: "/lovable-uploads/3ef58336-c932-47cd-8a1c-0e07ea8c80d4.png",
      url: "/empirial-iphones",
      description: "E-commerce landing page for premium iPhone sales with conversion-focused design."
    },
    {
      id: 2,
      title: "Elite Sneakers Collection",
      category: "Landing Pages", 
      image: "/lovable-uploads/b3b81645-c461-448a-83e2-237dc3110495.png",
      url: "/elite-sneakers",
      description: "Modern sneaker store with product showcase and seamless checkout flow."
    },
    {
      id: 3,
      title: "Trading EA Store",
      category: "Landing Pages",
      image: "/lovable-uploads/9c27a6d7-0a94-4176-a3f2-a0dc987cbc54.png", 
      url: "/trading-ea-store",
      description: "Professional trading tools platform with trust-building elements."
    },
    {
      id: 4,
      title: "Restaurant Poster",
      category: "Posters",
      image: "/lovable-uploads/22d9c514-b27e-4c39-839f-cac29355479e.png",
      url: "#",
      description: "Eye-catching restaurant promotional poster with bold typography."
    },
    {
      id: 5,
      title: "Event Poster Design",
      category: "Posters",
      image: "/lovable-uploads/8f876b0e-769b-491f-a69f-66d9c471ffd0.png",
      url: "#",
      description: "Event marketing poster with vibrant colors and clear messaging."
    },
    {
      id: 6,
      title: "Social Media Graphics",
      category: "Social",
      image: "/lovable-uploads/feffd106-e239-4344-93f0-ebb963e8fc96.png",
      url: "#",
      description: "Instagram and Facebook post designs for brand consistency."
    }
  ];

  const filteredItems = activeFilter === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <section id="portfolio" className="py-16 md:py-24 scroll-mt-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Portfolio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real projects that delivered real results for our clients across South Africa.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(category)}
              className="smooth-transition"
            >
              <Filter className="w-4 h-4 mr-2" />
              {category}
            </Button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-card rounded-lg overflow-hidden elegant-shadow smooth-transition hover:elegant-glow"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover smooth-transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary smooth-transition">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground smooth-transition"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Project
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PortfolioGrid;