import { Shield, Clock, Users, Award } from 'lucide-react';

const TrustBar = () => {
  const trustItems = [
    { icon: Shield, text: "100% Original Work" },
    { icon: Users, text: "Trusted by SA Brands" },
    { icon: Clock, text: "Fast Turnaround" },
    { icon: Award, text: "Ongoing Support" }
  ];

  // Duplicate items to create a seamless infinite loop
  const marqueeItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems];

  return (
    <section className="py-8 border-b border-border overflow-hidden bg-background">
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <div className="flex w-full overflow-hidden [--duration:40s] [--gap:3rem]">
          <div className="flex w-max animate-marquee items-center justify-around gap-[var(--gap)]">
            {marqueeItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground whitespace-nowrap min-w-max">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium uppercase tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient fades for smooth edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background dark:from-background"></div>
      </div>
    </section>
  );
};

export default TrustBar;