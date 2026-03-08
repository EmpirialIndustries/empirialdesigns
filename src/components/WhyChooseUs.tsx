import { motion } from 'framer-motion';
import { Target, Zap, Palette, Headphones } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SectionHeader from './common/SectionHeader';

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
        <SectionHeader
          title="Why Choose"
          highlight="Empirial Designs"
          description="We combine creativity with strategic thinking to deliver designs that don't just look good—they work."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
            >
              <Card className="text-center elegant-shadow transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/40 w-full h-full bg-card/50 backdrop-blur-sm group">
                <CardHeader className="pb-4 px-4 lg:px-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    <benefit.icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:-rotate-12" />
                  </div>
                  <CardTitle className="text-lg relative z-10">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 lg:px-6 relative z-10">
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;