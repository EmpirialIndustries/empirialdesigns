import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openWhatsApp = () => {
    window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-16 md:py-24 scroll-mt-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let's Start Your <span className="text-gradient">Project</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to take your business to the next level? Fill out the form below or reach out directly via WhatsApp.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <Card className="elegant-shadow h-fit">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Choose your preferred way to connect with us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 smooth-transition hover:bg-card/80">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-muted-foreground">Quick response guaranteed</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm text-muted-foreground">hello@empirialdesigns.co.za</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Location</div>
                    <div className="text-sm text-muted-foreground">South Africa</div>
                  </div>
                </div>

                <Button 
                  onClick={openWhatsApp}
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="elegant-shadow">
              <CardHeader>
                <CardTitle>Project Brief</CardTitle>
                <CardDescription>
                  Tell us about your project and we'll provide a custom quote within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" placeholder="Your full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone/WhatsApp</Label>
                      <Input id="phone" placeholder="+27 XX XXX XXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Type *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="landing-page">Landing Page Website</SelectItem>
                          <SelectItem value="poster-design">Poster/Social Design</SelectItem>
                          <SelectItem value="logo-design">Logo Design</SelectItem>
                          <SelectItem value="custom-quote">Custom Quote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-500">Under R500</SelectItem>
                          <SelectItem value="500-1500">R500 - R1,500</SelectItem>
                          <SelectItem value="1500-5000">R1,500 - R5,000</SelectItem>
                          <SelectItem value="5000-plus">R5,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Preferred Deadline</Label>
                      <Input id="deadline" type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brief">Project Brief *</Label>
                    <Textarea 
                      id="brief" 
                      placeholder="Tell us about your project, goals, target audience, and any specific requirements..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Project Brief
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;