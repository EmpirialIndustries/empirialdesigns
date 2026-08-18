import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';

export type CoverflowProject = {
  title: string;
  category: string;
  type: string;
  image: string;
  url?: string;
};

const getVisibleOffset = (index: number, activeIndex: number, length: number) => {
  let offset = index - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
};

export default function PortfolioCoverflow({ projects }: { projects: CoverflowProject[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [projects]);

  if (!activeProject) return null;

  const move = (direction: 1 | -1) => setActiveIndex((current) => (current + direction + projects.length) % projects.length);

  return (
    <div className="mx-auto max-w-[1440px] overflow-hidden px-3 sm:px-6">
      <div className="relative h-[360px] sm:h-[440px] lg:h-[500px]" aria-label="Portfolio gallery">
        {projects.map((project, index) => {
          const offset = getVisibleOffset(index, activeIndex, projects.length);
          const distance = Math.abs(offset);
          const isActive = offset === 0;
          const isVisible = distance <= 2;
          return <button key={project.title} type="button" aria-label={`Show ${project.title}`} aria-current={isActive ? 'true' : undefined} onClick={() => setActiveIndex(index)} className="absolute left-1/2 top-4 h-[292px] w-[218px] -translate-x-1/2 overflow-hidden rounded-[20px] border border-white/10 bg-[#11111a] shadow-2xl transition-[transform,opacity,filter] duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b56cff] sm:top-5 sm:h-[360px] sm:w-[270px] sm:rounded-[26px] lg:h-[410px] lg:w-[308px]" style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none', zIndex: 10 - distance, transform: `translateX(calc(-50% + ${offset * (typeof window === 'undefined' ? 180 : window.innerWidth < 640 ? 122 : window.innerWidth < 1024 ? 205 : 245)}px)) scale(${isActive ? 1 : distance === 1 ? 0.9 : 0.8})`, filter: isActive ? 'none' : 'brightness(.72) saturate(.78)' }}>
            <img src={project.image} alt="" className="h-full w-full object-cover" />
            <span className={`absolute inset-0 bg-gradient-to-t from-[#050508]/80 via-transparent to-transparent transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`} />
            <span className={`absolute inset-x-0 bottom-0 p-4 text-left transition-opacity sm:p-5 ${isActive ? 'opacity-100' : 'opacity-0'}`}><span className="block text-base font-semibold text-white sm:text-lg">{project.title}</span><span className="mt-1 block text-xs text-white/60">{project.category}</span></span>
          </button>;
        })}
      </div>
      <div className="mt-2 flex flex-col items-center gap-5 text-center sm:mt-0"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b56cff]">{activeProject.category}</p><p className="mt-2 text-sm text-white/50">{activeProject.type}</p>{activeProject.url && <a href={activeProject.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-[#c997ff]">Visit project <ExternalLink className="h-3.5 w-3.5" /></a>}</div><div className="flex items-center gap-3"><button type="button" onClick={() => move(-1)} aria-label="Previous project" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/75 transition hover:border-[#b56cff] hover:bg-[#8138ff]/15 hover:text-white"><ArrowLeft className="h-4 w-4" /></button><span className="min-w-12 text-xs tabular-nums text-white/40">{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span><button type="button" onClick={() => move(1)} aria-label="Next project" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/75 transition hover:border-[#b56cff] hover:bg-[#8138ff]/15 hover:text-white"><ArrowRight className="h-4 w-4" /></button></div></div>
    </div>
  );
}
