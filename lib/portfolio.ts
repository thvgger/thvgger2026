export const site = {
  name: "Thvgger",
  // Replace this reserved example address with your real email before publishing.
  email: "hello@thvgger.example",
  github: "https://github.com/thvgger",
};

export interface Project {
  id: string;
  title: string;
  kind: string;
  summary: string;
  cover: string;
  coverTreatment?: "logo";
  presentation?: "logo-guide";
  status?: string;
  gallery: { src: string; alt: string; contain?: boolean }[];
  role: string;
  tools: string;
  details: { heading: string; copy: string }[];
}

export const projects: Project[] = [
  {
    id: "studio-space",
    title: "Studio Space",
    kind: "Visual identity exploration",
    role: "Identity design",
    tools: "Wordmarks, symbol, colour & applications",
    status: "In progress",
    presentation: "logo-guide",
    coverTreatment: "logo",
    summary: "An identity in motion: slanted lettering, a sharp pink symbol, and a family of marks that adapts from a full wordmark to a browser tab. A work in progress.",
    cover: "/images/portfolio/studio-space/horizontal-white.svg",
    gallery: [{ src: "/images/portfolio/studio-space/horizontal-white.svg", alt: "Studio Space wordmark in white with its angular pink symbol", contain: true }],
    details: [],
  },
  {
    id: "identity", title: "Thvgger identity", kind: "Personal brand identity", role: "Identity design & art direction", tools: "Logo system, typography, applications",
    summary: "A personal identity built around a striped isometric cube. One simple structure, with room to play across print and the web.",
    cover: "/images/portfolio/identity-laptop.webp",
    gallery: [
      { src: "/images/portfolio/identity-laptop.webp", alt: "Thvgger identity on a laptop in a dark sculptural setting" },
      { src: "/images/thvgger images/thvggerlogo.png", alt: "Primary striped isometric cube mark", contain: true },
      { src: "/images/thvgger images/thvggerlogostrokeonly.png", alt: "Outline variation of the Thvgger cube", contain: true },
      { src: "/images/thvgger images/thvggerlogosecondary.jpg", alt: "Secondary arrangement of the Thvgger identity", contain: true },
    ],
    details: [
      { heading: "The idea", copy: "Give my own work a recognizable signature. The cube brings three faces into one shape; its repeated stripes make the mark readable as both a solid form and a graphic pattern." },
      { heading: "The system", copy: "A primary mark, an outline variation, and alternative arrangements explore how the same geometry behaves at different scales. A restrained palette lets the silhouette do the work." },
      { heading: "In use", copy: "The identity extends into laptop and stationery mockups, and becomes an interactive object on this site. A self-initiated identity for my design and development work." },
    ],
  },
  {
    id: "portfolio", title: "A digital home", kind: "Personal website", role: "Interface design & development", tools: "Next.js, React, TypeScript, Motion",
    summary: "A personal website for design and development work. A scrolling introduction, separate project pages, and room for the work to speak.",
    cover: "/images/portfolio/digital-home.webp",
    gallery: [
      { src: "/images/portfolio/digital-home.webp", alt: "Thvgger wordmark on a clean white digital canvas", contain: true },
      { src: "/images/thvgger images/thvggerlogolight.png", alt: "Light version of the Thvgger identity", contain: true },
    ],
    details: [
      { heading: "The intention", copy: "Build a home for my design and development work that feels like the identity itself: clear, considered, and easy to explore." },
      { heading: "The experience", copy: "A spacious opening leads into selected projects, a personal introduction, and a contact invitation. A dedicated work index opens individual project pages. Simple navigation connects Work, About, Contact, and a space reserved for future experiments." },
      { heading: "The build", copy: "Built with Next.js, React, and TypeScript. Responsive layouts, clear keyboard focus, and motion that respects the visitor's preferences keep the experience comfortable across devices." },
    ],
  },
  {
    id: "print", title: "Identity in print", kind: "Personal print studies", role: "Layout & visual exploration", tools: "Stationery mockups, composition, contrast",
    summary: "Taking the same mark off screen. A series of stationery studies exploring scale, negative space, and black against white.",
    cover: "/images/portfolio/print-1.webp",
    gallery: [
      { src: "/images/portfolio/print-1.webp", alt: "First Thvgger stationery mockup" },
      { src: "/images/portfolio/print-2.webp", alt: "Second Thvgger stationery composition" },
      { src: "/images/portfolio/print-3.webp", alt: "Third Thvgger print layout" },
      { src: "/images/portfolio/print-4.webp", alt: "Fourth Thvgger card mockup" },
    ],
    details: [
      { heading: "The study", copy: "Explore how the personal identity holds together in a physical setting. These are mockup studies, using the same cube and wordmark in different compositions." },
      { heading: "The details", copy: "The layouts shift the balance between the mark, the type, and the empty space around them. Black and white keep those choices visible." },
      { heading: "Part of the identity", copy: "These personal studies extend the Thvgger identity through stationery, cards, and print layouts." },
    ],
  },
];
