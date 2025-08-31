import { Target, Zap, Palette, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: Target,
      title: "Precision & Quality",
      description: "Every pixel matters. We craft designs with meticulous attention to detail and brand consistency."
    },
    {
      icon: Zap,
      title: "Speed & Efficiency", 
      description: "Fast turnaround without compromising quality. Most projects delivered within 5-7 days."
    },
    {
      icon: Palette,
      title: "Brand-Consistent Design",
      description: "Designs that align perfectly with your brand identity and speak to your target audience."
    },
    {
      icon: Headphones,
      title: "Responsive Support",
      description: "Direct communication via WhatsApp. Quick responses and ongoing support after delivery."
    }
  ];

  return (
    <section className="py-16 md:py-24 scroll-mt-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-gradient">Empirial Designs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine creativity with strategic thinking to deliver designs that don't just look good—they work.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center elegant-shadow smooth-transition hover:elegant-glow">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;