import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import AboutFounder from '@/components/AboutFounder';
import NewServices from '@/components/NewServices';
import Workflow from '@/components/Workflow';
import WhyChooseUs from '@/components/WhyChooseUs';
import PortfolioGrid from '@/components/PortfolioGrid';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import BlogTeasers from '@/components/BlogTeasers';
import PrimaryCTA from '@/components/PrimaryCTA';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import AdUnit from '@/components/AdUnit';

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <a href="#main" className="skip-to-content">Skip to content</a>
      <Navigation />
      <main id="main">
        <Hero />
        <TrustBar />
        <AboutFounder />
        <AdUnit />
        <NewServices />
        <Workflow />
        <WhyChooseUs />
        <PortfolioGrid />
        <Testimonials />
        <FAQ />
        <BlogTeasers />
        <PrimaryCTA />
        <ContactForm />
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;
