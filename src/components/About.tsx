
import { Award, Users, Clock, CheckCircle, Target, Zap } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Happy Clients', value: '150+', color: 'text-black' },
    { icon: Award, label: 'Projects Completed', value: '300+', color: 'text-black' },
    { icon: Clock, label: 'Years Experience', value: '5+', color: 'text-black' },
    { icon: CheckCircle, label: 'Success Rate', value: '98%', color: 'text-black' }
  ];

  const values = [
    {
      icon: Target,
      title: 'Precision & Quality',
      description: 'Every pixel matters. We ensure meticulous attention to detail in every project.'
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Fast turnaround times without ever compromising on the quality of our work.'
    }
  ];

  return (
    <section id="about" className="py-24 gradient-bg relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-black rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-gray-800 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-600 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-foreground">ABOUT</span>{' '}
            <span className="text-gradient">EMPIRIAL DESIGNS</span>
          </h2>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-black flex-1 max-w-32"></div>
            <p className="text-xl text-black font-black mx-8 tracking-[0.3em]">
              GRAPHIC DESIGNER
            </p>
            <div className="h-px bg-black flex-1 max-w-32"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          {/* Enhanced Content */}
          <div className="animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-black text-foreground mb-8">
              Crafting Digital Excellence Since 2022
            </h3>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              At Empirial Designs, we believe that great design is more than just aesthetics—it's about 
              creating meaningful connections between brands and their audiences. Our passion for innovation 
              and attention to detail drives us to deliver exceptional digital experiences.
            </p>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              From stunning landing pages to comprehensive e-commerce solutions and eye-catching poster designs, 
              we combine creativity with strategy to help your business stand out in today's competitive market.
            </p>
            
            {/* Enhanced Key Points */}
            <div className="space-y-6">
              {[
                'Original, creative designs tailored to your brand',
                'Fast turnaround times without compromising quality',
                'Responsive designs that work on all devices',
                'Ongoing support and maintenance'
              ].map((point, index) => (
                <div key={index} className="flex items-start group">
                  <CheckCircle className="w-6 h-6 text-black mt-1 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground text-lg font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="bg-white/60 backdrop-blur-lg elegant-border rounded-3xl p-8 text-center hover:border-black/30 transition-all duration-500 group hover:scale-105 elegant-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 elegant-shadow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-black text-foreground mb-3">{stat.value}</div>
                <div className="text-muted-foreground font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {values.map((value, index) => (
            <div 
              key={value.title}
              className="bg-white/60 backdrop-blur-lg elegant-border rounded-3xl p-10 hover:border-black/30 transition-all duration-500 group elegant-shadow"
            >
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-black text-foreground mb-4">{value.title}</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
