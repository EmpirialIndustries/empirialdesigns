import ContactInfo from './contact/ContactInfo';
import ProjectForm from './contact/ProjectForm';

const ContactForm = () => {
  return (
    <section id="contact" className="py-16 md:py-24 scroll-mt-nav">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let's Start Your <span className="text-gradient">Project</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Ready to take your business to the next level? Fill out the form below or reach out directly via WhatsApp.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 px-4">
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>
          <div className="lg:col-span-2">
            <ProjectForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;