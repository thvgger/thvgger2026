export const site = {
  name: "Thvgger",
  email: "hello@thvgger.site",
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
  video?: { src: string; poster: string; width: number; height: number; title: string; caption: string };
  gallery: { src: string; alt: string; contain?: boolean; chapter?: string; caption?: string; background?: "dark" }[];
  role: string;
  tools: string;
  details: { id: string; label: string; heading: string; copy: string }[];
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
    video: {
      src: "/videos/thvgger/intro.mp4",
      poster: "/images/portfolio/thvgger/intro-poster.webp",
      width: 1280,
      height: 720,
      title: "Homepage intro",
      caption: "The cube turns, shrinks into place, and the Thvgger name and introduction appear.",
    },
    summary: "A personal identity built around a striped isometric cube, carried through logo variations, stationery studies, and this website. One visual system across print and the web.",
    cover: "/images/portfolio/identity-laptop.webp",
    gallery: [
      { src: "/images/portfolio/identity-laptop.webp", alt: "Thvgger identity on a laptop in a dark sculptural setting" },
      { src: "/images/thvgger images/thvggerlogo.png", alt: "Primary striped isometric cube mark", contain: true, chapter: "identity", caption: "The primary mark: three faces built from repeated stripes." },
      { src: "/images/thvgger images/thvggerlogostrokeonly.png", alt: "Outline variation of the Thvgger cube", contain: true, chapter: "identity", caption: "The same geometry, expressed as an outline." },
      { src: "/images/thvgger images/thvggerlogosecondary.jpg", alt: "Secondary arrangement of the Thvgger identity", contain: true, chapter: "identity", caption: "An alternative arrangement of the cube and name." },
      { src: "/images/portfolio/digital-home.webp", alt: "Thvgger wordmark on a clean white digital canvas", contain: true, chapter: "website", caption: "The cube and wordmark share a simple horizontal composition." },
      { src: "/images/thvgger images/thvggerlogolight.png", alt: "Light version of the Thvgger identity", contain: true, chapter: "identity", background: "dark", caption: "A light treatment carries the mark onto a dark field." },
      { src: "/images/portfolio/print-1.webp", alt: "First Thvgger stationery mockup", chapter: "print", caption: "The identity carried into a stationery study." },
      { src: "/images/portfolio/print-2.webp", alt: "Second Thvgger stationery composition", chapter: "print", caption: "A second composition exploring scale and spacing." },
      { src: "/images/portfolio/print-3.webp", alt: "Third Thvgger print layout", chapter: "print", caption: "The mark and typography arranged for print." },
      { src: "/images/portfolio/print-4.webp", alt: "Fourth Thvgger card mockup", chapter: "print", caption: "A card study brings the same visual language to a smaller format." },
    ],
    details: [
      { id: "identity", label: "Identity", heading: "One shape. Several expressions.", copy: "The cube gives my design and development work a recognisable signature. Its stripes describe three faces while leaving open space between them, so the mark reads as both an object and a pattern. The solid, outline, secondary, and light treatments keep that geometry consistent as the composition changes." },
      { id: "website", label: "Website", heading: "An identity you can move.", copy: "The website turns the cube into something visitors can manipulate. Its opening introduces the mark before making room for the name and selected work. Inter and a monochrome canvas keep the surrounding interface quiet. Built with Next.js, React, TypeScript, and Motion, it preserves keyboard navigation and settles the animation for reduced motion." },
      { id: "print", label: "Print", heading: "The same mark, off screen.", copy: "These personal stationery and card studies test the identity without movement. Changing the scale and placement of the cube creates different compositions; black and white keep the relationship between mark, type, and empty space visible. The repeated geometry connects the printed pieces to the website." },
    ],
  },
];
