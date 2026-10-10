import Image from "next/image";
import type { Project } from "@/lib/portfolio";
import UnderlineLink from "@/components/UnderlineLink";

const assetPath = "/images/portfolio/foolycooly";
const chapters = [
  { id: "identity", label: "Identity" },
  { id: "collection", label: "Collection" },
  { id: "product", label: "Product details" },
  { id: "mobile", label: "Mobile" },
];

export default function StorefrontCaseStudy({ project }: { project: Pick<Project, "role" | "tools" | "status"> }) {
  return (
    <div className="storefront-study">
      <figure className="storefront-screen storefront-lead">
        <Image src={`${assetPath}/collection-desktop.webp`} width={1440} height={1000} alt="FOOLY COOLY desktop storefront: the FLCL identity and category navigation beside a four-column clothing and footwear collection" loading="eager" sizes="(max-width: 1320px) 94vw, 1240px" />
        <figcaption>The collection, with space for the pieces to lead.</figcaption>
      </figure>

      <div className="identity-introduction">
        <dl className="project-facts">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Built with</dt><dd>{project.tools}</dd></div>
          <div><dt>Status</dt><dd>{project.status}</dd></div>
        </dl>
        <div className="identity-intro-copy">
          <h2>A name in motion. A quiet storefront.</h2>
          <p>FOOLY COOLY brings identity design and web development together. The full name compresses into FLCL while the collection stays visible. A restrained interface gives the clothing, footwear, and accessories room to carry the page.</p>
          <p>This is a storefront experiment with working search, filters, product details, and a demo cart. It explores the browsing experience before a real catalog and checkout.</p>
        </div>
      </div>

      <nav className="identity-contents" aria-label="Explore the FOOLY COOLY project">
        <span>Explore the project</span>
        <div>{chapters.map(chapter => <UnderlineLink key={chapter.id} href={`#${chapter.id}`}>{chapter.label}</UnderlineLink>)}</div>
      </nav>

      <section id="identity" className="identity-chapter">
        <div className="identity-chapter-heading">
          <h2>Full name. Same identity.</h2>
          <p>The original vector outlines anchor the project. On entry, FOOLY COOLY contracts into FLCL; hovering or focusing the mark opens the name again. The lettering keeps its proportions, and reduced motion shows the settled identity.</p>
        </div>
        <figure>
          <div className="storefront-logo-board">
            <Image src={`${assetPath}/flcl.svg`} width={924} height={487} alt="Original FLCL identity in black, with the small FOOLY COOLY name underneath" className="storefront-logo" unoptimized />
          </div>
          <figcaption>The complete original lockup. The compact header uses the main mark.</figcaption>
        </figure>
      </section>

      <section id="collection" className="identity-chapter">
        <div className="identity-chapter-heading">
          <h2>Let the collection speak.</h2>
          <p>A fixed category sidebar sits beside four columns of product photography. Compact Manrope type, a monochrome palette, and generous spacing keep the collection clear. Search, size filters, and sorting help narrow the selection without leaving the page.</p>
        </div>
        <figure className="storefront-screen">
          <Image src={`${assetPath}/collection-desktop.webp`} width={1440} height={1000} alt="Desktop collection showing clothing and footwear, with Search, Filter, and Cart controls above" sizes="(max-width: 1320px) 94vw, 1240px" />
          <figcaption>Front and alternate product views, with size previews on desktop hover and keyboard focus.</figcaption>
        </figure>
      </section>

      <section id="product" className="identity-chapter">
        <div className="identity-chapter-heading">
          <h2>A closer look at each piece.</h2>
          <p>A product opens in a native dialog with its photograph, price, colour, and available sizes. Selecting a size adds the piece to a demo cart, where quantities, removal, and the subtotal make the browsing flow tangible.</p>
        </div>
        <figure className="storefront-screen">
          <Image src={`${assetPath}/product-detail.webp`} width={1440} height={1000} alt="Leather jacket product details in the FOOLY COOLY storefront, with a size picker and cart action" sizes="(max-width: 1320px) 94vw, 1240px" />
          <figcaption>Product selection and a sample cart. Checkout is outside this prototype.</figcaption>
        </figure>
      </section>

      <section id="mobile" className="identity-chapter storefront-mobile-section">
        <div className="identity-chapter-heading">
          <h2>The same collection, closer to hand.</h2>
          <p>On a smaller screen, the grid becomes two columns and the controls share one header. Visitors swipe between product photographs. Menu, search, filters, and cart use the page body, returning to the collection with its scroll position preserved.</p>
        </div>
        <figure>
          <div className="storefront-mobile-board">
            <Image src={`${assetPath}/collection-mobile.webp`} width={390} height={844} alt="Mobile FOOLY COOLY collection with the FLCL mark and Search, Filter, Cart, and Menu controls over two columns of products" className="storefront-mobile-image" sizes="(max-width: 480px) 78vw, 390px" />
          </div>
          <figcaption>The actual mobile layout, captured at 390 pixels wide.</figcaption>
        </figure>
      </section>

      <div className="storefront-source">
        <p>A personal storefront prototype by Thvgger. Sample product photography comes from Stüssy and Fear of God references; it illustrates the interface and is not an original FOOLY COOLY catalog.</p>
        <UnderlineLink href="https://github.com/thvgger/foolycooly" external aria-label="View the FOOLY COOLY source on GitHub (opens in a new tab)">View source on GitHub</UnderlineLink>
      </div>
    </div>
  );
}
