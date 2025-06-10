
import { MessageSquare, Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Contact = () => {
  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      handle: '(+27)79-862-9246',
      url: 'https://wa.me/27798629246',
      color: 'text-green-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      handle: '@Empirial Designs',
      url: '#',
      color: 'text-blue-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      handle: '@Empirial Designs',
      url: '#',
      color: 'text-pink-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      handle: '@Lufuno Mphela',
      url: '#',
      color: 'text-blue-600'
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '(+27) 79-862-9246'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@empirialdesigns.com'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'South Africa'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-foreground">GET IN</span>{' '}
            <span className="text-gradient">TOUCH</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to bring your vision to life? Let's discuss your project and create something amazing together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="animate-fade-in">
            <h3 className="text-2xl font-bold text-foreground mb-8">Let's Start a Conversation</h3>
            
            {/* Contact Details */}
            <div className="space-y-6 mb-12">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mr-4">
                    <item.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className="text-foreground font-semibold">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Connect With Us</h4>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social) => (
                  <Card 
                    key={social.name} 
                    className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${social.color} bg-current/10`}>
                          <social.icon className={`w-5 h-5 ${social.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{social.name}</div>
                          <div className="text-xs text-muted-foreground">{social.handle}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-card/50 backdrop-blur-sm border-border h-full">
              <CardContent className="p-8 h-full flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Ready to Start Your Project?
                  </h3>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Get a free consultation and quote for your design project. We'll discuss your requirements 
                    and provide you with a detailed proposal tailored to your needs.
                  </p>
                  
                  <div className="space-y-4">
                    <Button 
                      size="lg" 
                      className="w-full gradient-primary text-primary-foreground font-semibold"
                    >
                      Get Free Quote
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Schedule a Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
