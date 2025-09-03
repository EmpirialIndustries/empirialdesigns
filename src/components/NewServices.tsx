import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Globe, Image } from 'lucide-react';

const NewServices = () => {
  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const services = [
    {
      icon: Globe,
      title: "Landing Page Website",
      price: "R1,499.99",
      popular: true,
      description: "Custom responsive landing page designed to convert visitors into customers.",
      features: [
        "1 responsive page (hero, features, social proof, FAQ, contact)",
        "SEO basics & analytics setup",
        "1 round of revisions included",
        "Delivery in 5–7 days",
        "Mobile-optimized design"
      ],
      addons: "Add-ons: copywriting, extra sections, email capture, blog, CMS",
      cta: "Start Your Website"
    },
    {
      icon: Image,
      title: "Poster / Social Design",
      price: "R249.99",
      popular: false,
      description: "Professional marketing materials that capture attention and drive results.",
      features: [
        "Print-ready PDF + web formats",
        "PNG/JPG optimized files",
        "Source file on request",
        "2 concepts + 2 revisions",
        "48–72h delivery"
      ],
      addons: "Add-ons: additional concepts, rush delivery, brand guidelines",
      cta: "Order a Design"
    }
  ];

  return (
    <section id="services" className="py-16 md:py-24 scroll-mt-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Services & <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Clear, upfront pricing with no hidden fees. Choose the service that fits your needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
          {services.map((service, index) => (
            <Card key={index} className={`relative elegant-shadow smooth-transition hover:elegant-glow w-full ${service.popular ? 'ring-2 ring-primary' : ''}`}>
              {service.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4 px-4 lg:px-6">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <div className="text-3xl font-bold text-primary">{service.price}</div>
                <CardDescription className="mt-2">{service.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 px-4 lg:px-6">
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">{service.addons}</p>
                </div>
              </CardContent>
              
              <CardFooter className="px-4 lg:px-6">
                <Button 
                  onClick={openWhatsApp}
                  className="w-full"
                  size="lg"
                  variant={service.popular ? "default" : "outline"}
                >
                  {service.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewServices;