
import { Award, Users, Clock, CheckCircle } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Happy Clients', value: '150+' },
    { icon: Award, label: 'Projects Completed', value: '300+' },
    { icon: Clock, label: 'Years Experience', value: '5+' },
    { icon: CheckCircle, label: 'Success Rate', value: '98%' }
  ];

  return (
    <section id="about" className="py-20 gradient-bg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="text-foreground">ABOUT</span>{' '}
            <span className="text-gradient">EMPIRIAL DESIGNS</span>
          </h2>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-primary flex-1 max-w-24"></div>
            <p className="text-lg text-primary font-semibold mx-6 tracking-wider">
              GRAPHIC DESIGNER
            </p>
            <div className="h-px bg-primary flex-1 max-w-24"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Crafting Digital Excellence Since 2022
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              At Empirial Designs, we believe that great design is more than just aesthetics—it's about 
              creating meaningful connections between brands and their audiences. Our passion for innovation 
              and attention to detail drives us to deliver exceptional digital experiences.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              From stunning landing pages to comprehensive e-commerce solutions and eye-catching poster designs, 
              we combine creativity with strategy to help your business stand out in today's competitive market.
            </p>
            
            {/* Key Points */}
            <div className="space-y-4">
              {[
                'Original, creative designs tailored to your brand',
                'Fast turnaround times without compromising quality',
                'Responsive designs that work on all devices',
                'Ongoing support and maintenance'
              ].map((point, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="bg-card/30 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-black text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
