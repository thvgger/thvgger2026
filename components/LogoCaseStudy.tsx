import Image from "next/image";
import type { ReactNode } from "react";
import type { Project } from "@/lib/portfolio";
import { studioSpace } from "@/lib/studio-space";

type LogoName = keyof typeof studioSpace.assets;

function Logo({ name, alt = "", className = "", eager = false }: {
  name: LogoName;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  return <Image src={`/images/portfolio/studio-space/${name}.svg`} {...studioSpace.assets[name]} alt={alt} className={`identity-logo ${className}`} unoptimized loading={eager ? "eager" : "lazy"} />;
}

const chapters = [
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "symbol", label: "Symbol" },
  { id: "favicon", label: "Favicon" },
  { id: "colour", label: "Colour" },
  { id: "in-use", label: "In use" },
  { id: "clear-space", label: "Clear space" },
];

function ChapterHeading({ title, children }: { title: string; children: ReactNode }) {
  return <div className="identity-chapter-heading"><h2>{title}</h2><p>{children}</p></div>;
}

export default function LogoCaseStudy({ project }: { project: Pick<Project, "role" | "tools" | "status"> }) {
  return (
    <div className="identity-study">
      <figure className="identity-family identity-dark">
        <div className="identity-family-main"><Logo name="horizontal-white" alt="Studio Space: slanted white lettering with an angular pink symbol between the words" eager /></div>
        <div className="identity-family-variants">
          <div><Logo name="horizontal-white" eager /><span>Primary wordmark</span></div>
          <div><Logo name="stacked-white" eager /><span>Secondary wordmark</span></div>
          <div><Logo name="symbol-pink" eager /><span>Compact symbol</span></div>
        </div>
        <figcaption>One identity. Room for every format.</figcaption>
      </figure>

      <div className="identity-introduction">
        <dl className="project-facts">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Focus</dt><dd>{project.tools}</dd></div>
          <div><dt>Status</dt><dd>{project.status}</dd></div>
        </dl>
        <div className="identity-intro-copy">
          <h2>A logo that adapts.</h2>
          <p>The slanted lettering gives Studio Space its momentum. The pink symbol gives it a signature. Together, they form a system that can stretch across a wide header, fit a compact layout, or reduce to a single recognisable shape.</p>
          <p>This exploration brings those variations together and looks at how they work at different sizes, on different backgrounds, and in everyday digital spaces.</p>
        </div>
      </div>

      <nav className="identity-contents" aria-label="Explore the Studio Space identity">
        <span>Explore the system</span>
        <div>{chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.label}</a>)}</div>
      </nav>

      <section id="primary" className="identity-chapter">
        <ChapterHeading title="The primary wordmark.">The full name in one line. This is the main expression of the identity, with enough width to let the lettering and symbol sit comfortably together.</ChapterHeading>
        <figure>
          <div className="identity-board identity-light identity-primary-board"><Logo name="horizontal-ink" alt="Primary Studio Space wordmark in black and pink on a light background" /></div>
          <figcaption>For wide spaces: website headers, banners, and horizontal layouts.</figcaption>
        </figure>
      </section>

      <section id="secondary" className="identity-chapter">
        <ChapterHeading title="A more compact shape.">Stacking the words keeps the full name visible while changing the footprint. The same lettering and symbol fit naturally into narrower compositions.</ChapterHeading>
        <figure>
          <div className="identity-split">
            <div className="identity-board identity-dark identity-stacked-board"><Logo name="stacked-white" alt="Stacked Studio Space wordmark in white and pink on black" /></div>
            <div className="identity-board identity-light identity-stacked-board"><Logo name="stacked-ink" alt="Stacked Studio Space wordmark in black and pink on a light background" /></div>
          </div>
          <figcaption>The secondary wordmark, with light and dark treatments.</figcaption>
        </figure>
      </section>

      <section id="symbol" className="identity-chapter">
        <ChapterHeading title="The smallest signature.">The pink symbol can stand on its own when space is limited. Pair it with the full name when introducing the identity, then let the shape carry familiar, compact placements.</ChapterHeading>
        <figure>
          <div className="identity-symbol-board identity-dark">
            <Logo name="symbol-pink" alt="Studio Space’s angular pink symbol, isolated from the lettering" className="identity-symbol-large" />
            <div className="identity-signature"><div className="identity-avatar"><Logo name="symbol-pink" /></div><div><p>Studio Space</p><span>Compact signature</span></div></div>
          </div>
          <figcaption>A distinct silhouette for avatars, small signatures, and compact corners.</figcaption>
        </figure>
      </section>

      <section id="favicon" className="identity-chapter">
        <ChapterHeading title="Down to a browser tab.">At tiny sizes, the wordmark gives way to the symbol. A simple silhouette keeps the identity recognisable without squeezing detailed lettering into a few pixels.</ChapterHeading>
        <figure>
          <div className="identity-board identity-light identity-favicon-board">
            <div className="identity-browser-preview">
              <div className="identity-browser-tab"><Logo name="symbol-pink" /><span>Studio Space</span><span aria-hidden="true">×</span></div>
              <div className="identity-browser-bar"><span aria-hidden="true">←</span><span aria-hidden="true">→</span><span className="identity-browser-address">Studio Space / Home</span></div>
            </div>
            <div className="identity-favicon-sizes">
              {[16, 32, 48].map(size => <div key={size}><div className="identity-icon-sample"><Logo name="symbol-pink" className={`identity-icon-${size}`} alt={`Studio Space symbol at ${size} pixels`} /></div><span>{size} px</span></div>)}
            </div>
          </div>
          <figcaption>Actual-size previews at 16, 32, and 48 pixels.</figcaption>
        </figure>
      </section>

      <section id="colour" className="identity-chapter">
        <ChapterHeading title="Contrast comes first.">The pink stays consistent. The lettering switches between black and white to suit the background, with a white-only version for a pink field.</ChapterHeading>
        <figure>
          <div className="identity-colour-grid">
            <div className="identity-colour-treatment identity-light"><Logo name="horizontal-ink" alt="Black and pink logo on a light field" /><span>On light</span></div>
            <div className="identity-colour-treatment identity-dark"><Logo name="horizontal-white" alt="White and pink logo on a black field" /><span>On dark</span></div>
            <div className="identity-colour-treatment identity-pink"><Logo name="horizontal-mono-white" alt="All-white logo on the identity’s pink field" /><span>On pink</span></div>
          </div>
          <figcaption className="identity-palette"><span>Ink <b>#080808</b></span><span>Pink <b>#F20D5E</b></span><span>Light <b>#F6F4EE</b></span></figcaption>
        </figure>
      </section>

      <section id="in-use" className="identity-chapter">
        <ChapterHeading title="Choose by the space.">A wide header uses the primary wordmark. A compact footer uses the stacked version. The surrounding layout decides which variation has room to work.</ChapterHeading>
        <figure>
          <div className="identity-placement-board identity-light">
            <div className="identity-header-example identity-dark"><Logo name="horizontal-white" alt="Primary wordmark in a website header example" /><div aria-hidden="true"><span>Work</span><span>About</span><span>Contact</span></div></div>
            <div className="identity-placement-space"><span>Space for the work.</span></div>
            <div className="identity-footer-example"><Logo name="stacked-ink" alt="Stacked wordmark in a compact website footer example" /><span>Compact footer</span></div>
          </div>
          <figcaption>Illustrative website placements. Wide at the top, compact at the bottom.</figcaption>
        </figure>
      </section>

      <section id="clear-space" className="identity-chapter">
        <ChapterHeading title="Give the logo room.">Use the height of the pink symbol as a starting unit, x. Leave at least that much space on every side, so nearby text and images never crowd the mark.</ChapterHeading>
        <figure>
          <div className="identity-board identity-light identity-clear-board">
            <div className="identity-clear-boundary"><span className="identity-clear-x identity-clear-x-top" aria-hidden="true">x</span><span className="identity-clear-x identity-clear-x-left" aria-hidden="true">x</span><Logo name="horizontal-ink" alt="Studio Space wordmark with a dashed boundary showing clear space of one symbol-height on every side" /></div>
          </div>
          <figcaption>Clear space scales with the mark.</figcaption>
        </figure>
        <ul className="identity-rules"><li>Keep the original proportions.</li><li>Keep the pink consistent.</li><li>Use solid marks at small sizes.</li></ul>
      </section>

      <figure className="identity-display identity-dark"><Logo name="outlined-display" alt="Large outlined Studio Space wordmark with the original pink symbol" /><figcaption>The outline treatment, reserved for larger displays.</figcaption></figure>
      <p className="identity-source">An identity exploration by Thvgger. <a href={studioSpace.source} target="_blank" rel="noopener noreferrer">View the Figma file <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></p>
    </div>
  );
}
