
import { ExternalLink, Globe, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
    }
  ];

  const landingPages = portfolioItems.filter(item => item.type === 'landing');

  const PortfolioCard = ({ item }) => (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20 hover:border-white/40 transition-all duration-500 group overflow-hidden elegant-shadow min-w-0 flex-shrink-0">
      <div className="aspect-video overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <CardContent className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center">
            <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-black text-white">{item.title}</h3>
            <p className="text-white/60 font-medium text-sm">{item.company}</p>
          </div>
        </div>
        
        <p className="text-sm text-white/40 mb-2 flex items-center gap-2">
          <span>📍</span> {item.location}
        </p>
        
        <p className="text-white/80 mb-6 leading-relaxed text-sm lg:text-base">
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
    <section id="portfolio" className="py-16 lg:py-24 bg-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-gray-300 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 lg:mb-8">
            <span className="text-white">OUR</span>{' '}
            <span className="text-gradient-white">PORTFOLIO</span>
          </h2>
          <div className="flex items-center justify-center mb-6 lg:mb-8">
            <div className="h-px bg-white flex-1 max-w-32"></div>
            <p className="text-lg lg:text-xl text-white font-black mx-6 lg:mx-8 tracking-[0.3em]">
              RECENT PROJECTS
            </p>
            <div className="h-px bg-white flex-1 max-w-32"></div>
          </div>
          <p className="text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Explore our recent work showcasing innovative web solutions for South African businesses. 
            From stunning landing pages to comprehensive e-commerce platforms.
          </p>
        </div>

        {/* Landing Pages Section */}
        <div className="mb-16 lg:mb-20">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-8 lg:mb-12 text-center">
            Landing Page Websites
          </h3>
          
          <div className="relative">
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {landingPages.map((item, index) => (
                  <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                      <PortfolioCard item={item} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-white text-black hover:bg-white/90" />
              <CarouselNext className="hidden md:flex -right-12 bg-white text-black hover:bg-white/90" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
