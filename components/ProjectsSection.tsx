"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";

export interface ProjectItem {
  id: string;
  title: string;
  year: string;
  image: string;
  width: number;
  height: number;
  aspectClass?: string;
  flexClass?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: "dunkin-pumpkin-spice",
    title: "DUNKIN PUMPKIN SPICE",
    year: "2026",
    image: "/images/projects/dunkin-pumpkin-spice.png",
    width: 378,
    height: 378,
    flexClass: "lg:w-[28.5%]",
  },
  {
    id: "ampm",
    title: "AMPM",
    year: "2026",
    image: "/images/projects/ampm.png",
    width: 265,
    height: 265,
    flexClass: "lg:w-[20%]",
  },
  {
    id: "elephant-valley",
    title: "ELEPHANT VALLEY",
    year: "2026",
    image: "/images/projects/elephant-valley.png",
    width: 659,
    height: 526,
    flexClass: "lg:w-[49.5%]",
  },
];

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export interface ProjectsSectionProps {
  id?: string;
  className?: string;
}

export default function ProjectsSection({
  id = "projects",
  className = "",
}: ProjectsSectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full bg-black text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 overflow-hidden ${className}`.trim()}
    >
      <div id="work" className="absolute -top-16 pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[108px] xl:text-[128px] font-bold tracking-[-0.045em] leading-[0.88] uppercase text-white select-none">
            WORKS
          </h2>
        </motion.div>

        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-5">
          {PROJECTS.map((project, index) => (
            <motion.article
              key={project.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className={`w-full flex flex-col group cursor-pointer ${project.flexClass || ""}`}
            >
              <div className="relative w-full overflow-hidden bg-[#111111]">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={project.width}
                  height={project.height}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  priority={index === 0}
                />
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-[13px] font-bold tracking-tight text-white uppercase select-none">
                <span>{project.title}</span>
                <span className="font-semibold text-white/90">{project.year}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
