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
  coverTreatment?: "logo" | "screen";
  presentation?: "logo-guide" | "storefront-study";
  status?: string;
  gallery: { src: string; alt: string; contain?: boolean }[];
  role: string;
  tools: string;
  details: { heading: string; copy: string }[];
}

export const projects: Project[] = [
  {
    id: "foolycooly",
    title: "FOOLY COOLY",
    kind: "Fashion storefront & identity",
    role: "Visual identity, interface design & development",
    tools: "Next.js, React, TypeScript & SVG motion",
    status: "Prototype",
    presentation: "storefront-study",
    coverTreatment: "screen",
    summary: "An experimental fashion storefront built around the FLCL identity. A moving wordmark, a quiet product grid, and a browsing experience that adapts from desktop to mobile.",
    cover: "/images/portfolio/foolycooly/collection-desktop.webp",
    gallery: [
      { src: "/images/portfolio/foolycooly/collection-desktop.webp", alt: "FOOLY COOLY desktop storefront with the FLCL mark, category sidebar, and four-column product grid" },
      { src: "/images/portfolio/foolycooly/flcl.svg", alt: "Original black FLCL mark with the small FOOLY COOLY wordmark below", contain: true },
      { src: "/images/portfolio/foolycooly/product-detail.webp", alt: "FOOLY COOLY product dialog showing a leather jacket, price, sizes, and add-to-cart control" },
      { src: "/images/portfolio/foolycooly/collection-mobile.webp", alt: "FOOLY COOLY mobile storefront with compact navigation above a two-column product grid" },
    ],
    details: [],
  },
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
    id: "thvgger", title: "Thvgger", kind: "Personal identity, print & web", role: "Identity design, art direction & web development", tools: "Logo system, stationery, Next.js, React, TypeScript & Motion",
    summary: "A personal identity built around a striped isometric cube, carried through logo variations, stationery studies, and this website. One visual system across print and the web.",
    cover: "/images/portfolio/identity-laptop.webp",
    gallery: [
      { src: "/images/portfolio/identity-laptop.webp", alt: "Thvgger identity on a laptop in a dark sculptural setting" },
      { src: "/images/thvgger images/thvggerlogo.png", alt: "Primary striped isometric cube mark", contain: true },
      { src: "/images/thvgger images/thvggerlogostrokeonly.png", alt: "Outline variation of the Thvgger cube", contain: true },
      { src: "/images/thvgger images/thvggerlogosecondary.jpg", alt: "Secondary arrangement of the Thvgger identity", contain: true },
      { src: "/images/portfolio/digital-home.webp", alt: "Thvgger wordmark on a clean white digital canvas", contain: true },
      { src: "/images/thvgger images/thvggerlogolight.png", alt: "Light version of the Thvgger identity", contain: true },
      { src: "/images/portfolio/print-1.webp", alt: "First Thvgger stationery mockup" },
      { src: "/images/portfolio/print-2.webp", alt: "Second Thvgger stationery composition" },
      { src: "/images/portfolio/print-3.webp", alt: "Third Thvgger print layout" },
      { src: "/images/portfolio/print-4.webp", alt: "Fourth Thvgger card mockup" },
    ],
    details: [
      { heading: "The identity", copy: "Give my own design and development work a recognizable signature. The cube brings three faces into one shape; its repeated stripes read as both a solid form and a graphic pattern. A primary mark, an outline variation, and alternative arrangements explore the same geometry at different scales." },
      { heading: "A digital home", copy: "The identity becomes an interactive object on this website. A spacious opening leads into selected projects, a personal introduction, and a contact invitation. Dedicated project pages and simple navigation give the work room to speak." },
      { heading: "In print", copy: "Stationery, cards, and print mockups take the same mark off screen. These personal studies explore scale, negative space, and the balance between the cube, typography, and empty space. Black and white keep those choices visible." },
      { heading: "The build", copy: "Built with Next.js, React, TypeScript, and Motion. Responsive layouts, clear keyboard focus, and motion that respects the visitor's preferences carry the identity into a usable digital experience." },
    ],
  },
];
