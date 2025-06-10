
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
      popular: false
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce',
      subtitle: 'WEBSITE',
      price: 'R2,499.99',
      originalPrice: 'R3,999.99',
      description: 'Complete e-commerce solutions with payment integration, inventory management, and user-friendly shopping experiences.',
      features: ['Payment Integration', 'Inventory Management', 'User Dashboard', 'Order Tracking'],
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

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-gradient">WHAT WE OFFER</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Professional design services tailored to your business needs. From web design to print media, 
            we create visual experiences that drive results and exceed expectations.
          </p>
        </div>

        {/* Enhanced Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className={`bg-card/60 backdrop-blur-lg border-border hover:border-primary/50 transition-all duration-500 group animate-fade-in overflow-hidden relative ${
                service.popular ? 'ring-2 ring-primary/50 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-bold tracking-wider">
                  MOST POPULAR
                </div>
              )}
              
              <CardContent className="p-10">
                {/* Enhanced Service Icon */}
                <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <service.icon className="w-10 h-10 text-primary-foreground" />
                </div>

                {/* Service Title */}
                <div className="mb-6">
                  <h3 className="text-3xl font-black text-foreground mb-2">{service.title}</h3>
                  <p className="text-gradient font-bold text-lg tracking-wider">{service.subtitle}</p>
                </div>

                {/* Enhanced Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-foreground">{service.price}</span>
                    <span className="text-lg text-muted-foreground line-through">{service.originalPrice}</span>
                  </div>
                  <p className="text-sm text-primary font-semibold mt-1">Save up to 40%</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                  {service.description}
                </p>

                {/* Enhanced Features */}
                <ul className="space-y-3 mb-10">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Enhanced CTA Button */}
                <Button 
                  className="w-full gradient-primary text-primary-foreground font-bold text-lg py-6 group-hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
