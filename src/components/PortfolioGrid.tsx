import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import PortfolioCard from './portfolio/PortfolioCard';

const PortfolioGrid = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Landing Pages', 'Logos', 'Posters', 'Social'];

  const portfolioItems = [
    {
      id: 1,
      title: "Mphela Industries",
      category: "Landing Pages",
      image: "/lovable-uploads/3ef58336-c932-47cd-8a1c-0e07ea8c80d4.png",
      url: "https://mphelaindsutriespty.netlify.app",
      description: "Professional industrial services website with modern design and clear messaging."
    },
    {
      id: 2,
      title: "SKCC Legal Services",
      category: "Landing Pages", 
      image: "/lovable-uploads/b3b81645-c461-448a-83e2-237dc3110495.png",
      url: "https://skcc.netlify.app/",
      description: "Legal services firm website with trust-building elements and professional layout."
    },
    {
      id: 3,
      title: "Ytshika Attorneys",
      category: "Landing Pages",
      image: "/lovable-uploads/a09ff793-260b-40e3-9294-de5fbc351529.png", 
      url: "https://ytshikaattorneys.co.za",
      description: "Attorney firm website with comprehensive legal services showcase."
    },
    {
      id: 4,
      title: "Empirial Attorney",
      category: "Landing Pages",
      image: "/lovable-uploads/0738d373-2742-4c8e-8182-17a0cc933634.png",
      url: "https://empirialattorney.netlify.app",
      description: "Modern legal practice website with client-focused design approach."
    },
    {
      id: 5,
      title: "Empirial Spa", 
      category: "Landing Pages",
      image: "/lovable-uploads/98b58ad9-141b-46b5-9f3e-0f4a40632f60.png",
      url: "https://empirialspa.netlify.app/",
      description: "Luxury spa website with elegant design and booking functionality."
    },
    {
      id: 6,
      title: "Empirial Designs",
      category: "Landing Pages",
      image: "/lovable-uploads/d07e4413-7fb3-4990-84d0-93630a872628.png",
      url: "https://empirialdesigns.netlify.app",
      description: "Design agency portfolio showcasing creative services and client work."
    },
    {
      id: 7,
      title: "Restaurant Poster",
      category: "Posters",
      image: "/lovable-uploads/22d9c514-b27e-4c39-839f-cac29355479e.png",
      url: "#",
      description: "Eye-catching restaurant promotional poster with bold typography."
    },
    {
      id: 8,
      title: "Event Poster Design",
      category: "Posters",
      image: "/lovable-uploads/8f876b0e-769b-491f-a69f-66d9c471ffd0.png",
      url: "#",
      description: "Event marketing poster with vibrant colors and clear messaging."
    },
    {
      id: 9,
      title: "Brand Logo Design",
      category: "Logos",
      image: "/lovable-uploads/feffd106-e239-4344-93f0-ebb963e8fc96.png",
      url: "#",
      description: "Professional logo design with modern typography and clean aesthetics."
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Real projects that delivered real results for our clients across South Africa.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-12 px-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              size="sm" 
              onClick={() => setActiveFilter(category)}
              className="smooth-transition text-xs lg:text-sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4">
          {filteredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
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