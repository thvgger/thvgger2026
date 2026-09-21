import Button from "@/components/Button";

export interface CubePatternSectionProps {
  id?: string;
  className?: string;
}

export default function CubePatternSection({
  id = "work",
  className = "",
}: CubePatternSectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full min-h-[70vh] bg-black text-white flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16 ${className}`.trim()}
    >
      {/* Eyebrow Label — Top Left */}
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider leading-snug max-w-[280px] text-white">
        Developer, designer and everything in between.
      </p>

      {/* Manifesto Statement + CTA directly underneath */}
      <div className="flex flex-col items-start max-w-5xl sm:ml-auto mt-12 sm:mt-16 gap-8 sm:gap-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[52px] font-bold italic leading-[1.12] tracking-tight text-white">
          I build digital experiences rooted in design, code, and craft
          — driven by the belief that the best work comes from obsessing
          over every detail.
        </h2>


        <Button href="#projects" variant="dark" size="md">
          DIG DEEPER
        </Button>
      </div>
    </section>
  );
}
