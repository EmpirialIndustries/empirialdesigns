import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ServiceCardProps {
  service: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    price: string;
    popular: boolean;
    description: string;
    features: string[];
    addons: string;
    cta: string;
  };
  onGetStarted: () => void;
}

const ServiceCard = ({ service, onGetStarted }: ServiceCardProps) => {
  return (
    <Card className={`relative elegant-shadow smooth-transition hover:elegant-glow w-full ${service.popular ? 'ring-2 ring-primary' : ''}`}>
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
          {service.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
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
          onClick={onGetStarted}
          className="w-full"
          size="lg"
          variant={service.popular ? "default" : "outline"}
        >
          {service.cta}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;