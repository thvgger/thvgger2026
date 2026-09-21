"use client";

import { motion, type Variants } from "motion/react";
import Button from "@/components/Button";

export interface AboutSectionProps {
  id?: string;
  className?: string;
}

const STATEMENT =
  "I build digital experiences rooted in design, code, and craft — driven by the belief that the best work comes from obsessing over every detail.";

const words = STATEMENT.split(" ");

const statementContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.08,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function AboutSection({
  id = "about",
  className = "",
}: AboutSectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full min-h-[45vh] bg-black text-white flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 sm:py-10 lg:py-12 ${className}`.trim()}
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-snug max-w-[280px] text-white"
      >
        Developer, designer and everything in between.
      </motion.p>

      <div className="flex flex-col items-start max-w-5xl sm:ml-auto mt-8 sm:mt-10 gap-6 sm:gap-8">
        <motion.h2
          variants={statementContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[52px] font-bold italic leading-[1.12] tracking-tight text-white"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className="inline-block mr-[0.26em] last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        <Button href="#projects" variant="dark" size="md">
          DIG DEEPER
        </Button>
      </div>
    </section>
  );
}
