import { Globe, Image } from 'lucide-react';
import ServiceCard from './services/ServiceCard';

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
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Clear, upfront pricing with no hidden fees. Choose the service that fits your needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              service={service} 
              onGetStarted={openWhatsApp} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewServices;