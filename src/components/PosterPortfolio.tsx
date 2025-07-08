import { Star, ZoomIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PosterPortfolio = () => {
  const posterItems = [
    {
      id: 1,
      title: 'Event Poster - Music Festival',
      category: 'Event Marketing',
      description: 'Vibrant music festival poster with bold typography and dynamic color scheme.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop',
      tags: ['Music', 'Festival', 'Event']
    },
    {
      id: 2,
      title: 'Business Conference',
      category: 'Corporate Event',
      description: 'Professional conference poster with clean design and corporate branding.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=800&fit=crop',
      tags: ['Business', 'Conference', 'Corporate']
    },
    {
      id: 3,
      title: 'Restaurant Promotion',
      category: 'Food & Beverage',
      description: 'Appetizing food poster featuring mouth-watering imagery and special offers.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=800&fit=crop',
      tags: ['Food', 'Restaurant', 'Promotion']
    },
    {
      id: 4,
      title: 'Fitness Challenge',
      category: 'Health & Fitness',
      description: 'Motivational fitness poster with energetic design and inspiring messaging.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
      tags: ['Fitness', 'Health', 'Motivation']
    },
    {
      id: 5,
      title: 'Art Exhibition',
      category: 'Culture & Arts',
      description: 'Elegant art exhibition poster showcasing creativity and cultural sophistication.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=800&fit=crop',
      tags: ['Art', 'Exhibition', 'Culture']
    },
    {
      id: 6,
      title: 'Tech Conference',
      category: 'Technology',
      description: 'Modern tech conference poster with futuristic design and digital elements.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop',
      tags: ['Technology', 'Conference', 'Innovation']
    }
  ];

  const categories = ['All', 'Event Marketing', 'Corporate Event', 'Food & Beverage', 'Health & Fitness', 'Culture & Arts', 'Technology'];

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
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-gradient">POSTER</span>{' '}
            <span className="text-foreground">PORTFOLIO</span>
          </h2>
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