import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      company: "Bloom Boutique",
      avatar: "/lovable-uploads/0c9f4011-c9e0-44db-bc92-15905a48b3c4.png",
      rating: 5,
      text: "Empirial Designs transformed our online presence completely. The landing page they created increased our conversions by 40% in just two months."
    },
    {
      id: 2,
      name: "Michael Botha",
      company: "TechStart SA",
      avatar: "/lovable-uploads/98b58ad9-141b-46b5-9f3e-0f4a40632f60.png", 
      rating: 5,
      text: "Professional, fast, and exactly what we needed. The team understood our vision immediately and delivered beyond expectations."
    },
    {
      id: 3,
      name: "Priya Patel",
      company: "Spice Route Restaurant",
      avatar: "/lovable-uploads/d07e4413-7fb3-4990-84d0-93630a872628.png",
      rating: 5,
      text: "The poster designs they created for our restaurant are absolutely stunning. We've received so many compliments from customers."
    },
    {
      id: 4,
      name: "James Mthembu",
      company: "Urban Fitness",
      avatar: "/lovable-uploads/0c9f4011-c9e0-44db-bc92-15905a48b3c4.png",
      rating: 5,
      text: "Quick turnaround, excellent communication, and results that speak for themselves. Highly recommend for any business in SA."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. See what our satisfied clients have to say about working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="elegant-shadow smooth-transition hover:elegant-glow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;