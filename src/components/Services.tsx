
import { Globe, ShoppingCart, Image, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Services = () => {
  const services = [
    {
      icon: Globe,
      title: 'Landing Page',
      subtitle: 'WEBSITE',
      price: 'R1,499.99',
      originalPrice: 'R2,499.99',
      description: 'Professional landing pages that convert visitors into customers. Responsive design, fast loading, and optimized for all devices.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile-First Approach'],
      popular: true
    },
    {
      icon: Image,
      title: 'Poster',
      subtitle: 'DESIGNS',
      price: 'R249.99',
      originalPrice: 'R399.99',
      description: 'Eye-catching poster designs for events, promotions, and marketing campaigns. High-quality graphics that make an impact.',
      features: ['High Resolution', 'Print Ready', 'Multiple Formats', 'Unlimited Revisions'],
      popular: false
    }
  ];

  const handleGetStarted = () => {
    window.open('https://wa.me/message/MMS5VDEZUHSBK1', '_blank');
  };

  return (
    <section id="services" className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-black rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gray-800 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 lg:mb-8">
            <span className="text-gradient">WHAT WE OFFER</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional design services tailored to your business needs. From web design to print media, 
            we create visual experiences that drive results and exceed expectations.
          </p>
        </div>

        {/* Enhanced Services Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto justify-center items-stretch">
          {services.map((service, index) => (
            <div key={service.title} className="relative flex-1 max-w-md mx-auto lg:mx-0">
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-black text-white px-4 lg:px-6 py-2 rounded-full text-sm font-bold tracking-wider whitespace-nowrap">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <Card 
                className={`bg-white/80 backdrop-blur-lg elegant-border hover:border-black/30 transition-all duration-500 group animate-fade-in overflow-hidden relative elegant-shadow h-full ${
                  service.popular ? 'ring-2 ring-black/20 mt-4' : ''
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <CardContent className="p-6 sm:p-8 lg:p-10 h-full flex flex-col">
                  {/* Enhanced Service Icon */}
                  <div className="w-16 h-16 lg:w-20 lg:h-20 gradient-primary rounded-3xl flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 elegant-shadow mx-auto lg:mx-0">
                    <service.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>

                  {/* Service Title */}
                  <div className="mb-6 text-center lg:text-left">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground mb-2">{service.title}</h3>
                    <p className="text-gradient font-bold text-base lg:text-lg tracking-wider">{service.subtitle}</p>
                  </div>

                  {/* Enhanced Price */}
                  <div className="mb-6 lg:mb-8 text-center lg:text-left">
                    <div className="flex items-baseline gap-3 flex-wrap justify-center lg:justify-start">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{service.price}</span>
                      <span className="text-base lg:text-lg text-muted-foreground line-through">{service.originalPrice}</span>
                    </div>
                    <p className="text-sm text-black font-semibold mt-1">Save up to 40%</p>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 lg:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg flex-grow text-center lg:text-left">
                    {service.description}
                  </p>

                  {/* Enhanced Features */}
                  <ul className="space-y-3 mb-8 lg:mb-10">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-muted-foreground justify-center lg:justify-start">
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-black mr-3 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Enhanced CTA Button */}
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full gradient-primary text-white font-bold text-base lg:text-lg py-4 lg:py-6 group-hover:scale-105 transition-all duration-300 elegant-shadow mt-auto"
                  >
                    Get Started
                    <ArrowRight className="ml-3 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
