import { DollarSign, PenTool, Rocket, CheckCircle, Target, Zap } from 'lucide-react';
const About = () => {
  const workflowSteps = [{
    step: "01",
    icon: DollarSign,
    title: "20% Deposit & Planning",
    description: "Secure your project with a 20% deposit. We discuss your vision, requirements, and establish project timeline and milestones.",
    color: "text-white"
  }, {
    step: "02",
    icon: PenTool,
    title: "Wireframe & Design",
    description: "We create detailed wireframes and design mockups for your approval, ensuring every element aligns with your brand vision.",
    color: "text-white"
  }, {
    step: "03",
    icon: Rocket,
    title: "Development & Launch",
    description: "Full development begins with regular updates. Upon completion, we launch your website and provide ongoing support.",
    color: "text-white"
  }];
  const values = [{
    icon: Target,
    title: 'Precision & Quality',
    description: 'Every pixel matters. We ensure meticulous attention to detail in every project.'
  }, {
    icon: Zap,
    title: 'Speed & Efficiency',
    description: 'Fast turnaround times without ever compromising on the quality of our work.'
  }];
  return <section id="about" className="py-24 bg-white/95 backdrop-blur-lg relative overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-black rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-gray-800 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-600 rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="text-black">OUR</span>{' '}
            <span className="text-gradient">WORKFLOW</span>
          </h2>
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-black flex-1 max-w-32"></div>
            <p className="text-xl text-black font-black mx-8 tracking-[0.3em]">
              DEVELOPMENT PROCESS
            </p>
            <div className="h-px bg-black flex-1 max-w-32"></div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {workflowSteps.map((step, index) => <div key={step.step} className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-3xl p-10 text-center hover:border-white/40 transition-all duration-500 group hover:scale-105 elegant-shadow animate-fade-in" style={{
          animationDelay: `${index * 0.2}s`
        }}>
              <div className="text-6xl font-black text-white/20 mb-4">{step.step}</div>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 elegant-shadow">
                <step.icon className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
              <p className="text-white/80 text-lg leading-relaxed">{step.description}</p>
            </div>)}
        </div>

        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-black mb-8">
            Why Choose Empirial Designs?
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20">
          {/* Enhanced Content */}
          <div className="animate-fade-in">
            <h3 className="text-3xl font-black text-black mb-8 md:text-3xl text-center">Crafting Digital Excellence With Every Design </h3>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed text-center">
              At Empirial Designs, we believe that great design is more than just aesthetics—it's about 
              creating meaningful connections between brands and their audiences. Our passion for innovation 
              and attention to detail drives us to deliver exceptional digital experiences.
            </p>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              From stunning landing pages to comprehensive e-commerce solutions and eye-catching poster designs, 
              we combine creativity with strategy to help your business stand out in today's competitive market.
            </p>
            
            {/* Enhanced Key Points */}
            <div className="space-y-6">
              {['Original, creative designs tailored to your brand', 'Fast turnaround times without compromising quality', 'Responsive designs that work on all devices', 'Ongoing support and maintenance'].map((point, index) => <div key={index} className="flex items-start group">
                  <CheckCircle className="w-6 h-6 text-black mt-1 mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-600 text-lg font-medium text-center">{point}</span>
                </div>)}
            </div>
          </div>

          {/* Enhanced Values Section */}
          <div className="grid grid-cols-1 gap-8 animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            {values.map((value, index) => <div key={value.title} className="bg-black/5 backdrop-blur-lg border border-black/10 rounded-3xl p-10 hover:border-black/30 transition-all duration-500 group elegant-shadow">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-black text-black mb-4">{value.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{value.description}</p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default About;