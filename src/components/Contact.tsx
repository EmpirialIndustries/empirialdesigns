
import { MessageSquare, Facebook, Instagram, Linkedin, Phone, Mail, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const openWhatsApp = () => {
  window.open('https://wa.me/message/6ZHJUVYQDOH3O1', '_blank');
};

const Contact = () => {
  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      handle: '(+27)79-862-9246',
      url: 'https://wa.me/message/6ZHJUVYQDOH3O1',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      handle: '@Empirial Designs',
      url: '#',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      handle: '@Empirial Designs',
      url: '#',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      handle: '@Lufuno Mphela',
      url: '#',
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10'
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '(+27) 79-862-9246',
      color: 'text-green-500'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@empirialdesigns.com',
      color: 'text-blue-500'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'South Africa',
      color: 'text-purple-500'
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-foreground">GET IN</span>{' '}
            <span className="text-gradient">TOUCH</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to bring your vision to life? Let's discuss your project and create something amazing together.
            Your success story starts with a single message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Enhanced Contact Information */}
          <div className="animate-fade-in">
            <h3 className="text-3xl font-black text-foreground mb-12">Let's Start a Conversation</h3>
            
            {/* Enhanced Contact Details */}
            <div className="space-y-8 mb-16">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center group hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mr-6 group-hover:rotate-6 transition-transform duration-300 shadow-xl">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-lg text-muted-foreground font-semibold">{item.label}</div>
                    <div className="text-foreground font-black text-xl">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Social Links */}
            <div>
              <h4 className="text-2xl font-black text-foreground mb-8">Connect With Us</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {socialLinks.map((social) => (
                  <Card 
                    key={social.name} 
                    className="bg-card/60 backdrop-blur-lg border-border hover:border-primary/50 transition-all duration-500 group cursor-pointer hover:scale-105"
                    onClick={() => window.open(social.url, '_blank')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${social.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <social.icon className={`w-7 h-7 ${social.color}`} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-foreground">{social.name}</div>
                          <div className="text-muted-foreground font-medium">{social.handle}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="bg-card/60 backdrop-blur-lg border-border h-full hover:border-primary/50 transition-all duration-500">
              <CardContent className="p-12 h-full flex flex-col justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 hover:scale-110 hover:rotate-6 transition-all duration-500 shadow-2xl">
                    <Send className="w-12 h-12 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-foreground mb-6">
                    Ready to Start Your Project?
                  </h3>
                  
                  <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
                    Get a free consultation and quote for your design project. We'll discuss your requirements 
                    and provide you with a detailed proposal tailored to your needs and budget.
                  </p>
                  
                  <div className="space-y-6">
                    <Button 
                      size="lg" 
                      className="w-full gradient-primary text-primary-foreground font-bold text-lg py-6 hover:scale-105 transition-all duration-300 shadow-xl"
                      onClick={openWhatsApp}
                    >
                      Get Free Quote
                      <MessageSquare className="ml-3 h-5 w-5" />
                    </Button>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-lg py-6 hover:scale-105 transition-all duration-300"
                      onClick={openWhatsApp}
                    >
                      Schedule a Call
                      <Phone className="ml-3 h-5 w-5" />
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
