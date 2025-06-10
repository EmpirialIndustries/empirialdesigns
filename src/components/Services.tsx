
import { Globe, ShoppingCart, Image, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Services = () => {
  const services = [
    {
      icon: Globe,
      title: 'Landing Page',
      subtitle: 'WEBSITE',
      price: 'R1,499.99',
      description: 'Professional landing pages that convert visitors into customers. Responsive design, fast loading, and optimized for all devices.',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile-First Approach']
    },
    {
      icon: ShoppingCart,
      title: 'E-Commerce',
      subtitle: 'WEBSITE',
      price: 'R2,499.99',
      description: 'Complete e-commerce solutions with payment integration, inventory management, and user-friendly shopping experiences.',
      features: ['Payment Integration', 'Inventory Management', 'User Dashboard', 'Order Tracking']
    },
    {
      icon: Image,
      title: 'Poster',
      subtitle: 'DESIGNS',
      price: 'R249.99',
      description: 'Eye-catching poster designs for events, promotions, and marketing campaigns. High-quality graphics that make an impact.',
      features: ['High Resolution', 'Print Ready', 'Multiple Formats', 'Unlimited Revisions']
    }
  ];

  return (
    <section id="services" className="py-20 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-gradient">WHAT WE OFFER</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional design services tailored to your business needs. From web design to print media, 
            we create visual experiences that drive results.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                {/* Service Icon */}
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                {/* Service Title */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{service.title}</h3>
                  <p className="text-gradient font-semibold text-sm tracking-wider">{service.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-black text-foreground">{service.price}</span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className="w-full gradient-primary text-primary-foreground font-semibold group-hover:scale-105 transition-transform duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
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
