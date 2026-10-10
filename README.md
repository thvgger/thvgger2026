# Thvgger

A personal design and development portfolio built with Next.js, React, TypeScript, and Motion. A scrolling monochrome homepage introduces the Thvgger wordmark, interactive cube, selected work, and design practice. Separate pages cover the work, about, and contact.

The homepage opens with a large rotating cube that shrinks and moves into the wordmark as the name enters. The header cube stays hidden while the hero cube is visible, then pops in from above as visitors scroll past it. Returning to the hero hides the header cube again. The intro settles when visitors interact, respects reduced motion, and finishes without JavaScript. Browser scrollbar chrome is hidden; wheel, touch, keyboard, and anchor scrolling remain native.

## Local development

Run `npm run dev` and open http://localhost:3000.

Run `npm run lint` and `npm run build` to check the project.

## Pages

- `/` — an introduction, selected projects, expandable capability notes, and contact invitation.
- `/work` — a selection of design and development work.
- `/work/foolycooly` — a fashion storefront and identity case study with desktop, product-detail, and mobile views.
- `/work/studio-space` — a visual identity case study covering logo variations and usage.
- `/work/thvgger` — the personal identity, website, and print studies in one project. The former `/work/identity`, `/work/portfolio`, and `/work/print` URLs redirect here.
- `/about` — design and development introduction.
- `/contact` — email link and copy action.
- `/playground` — a Coming soon placeholder.

## Content

Project content, gallery assets, and contact details live in `lib/portfolio.ts`. Home features FOOLY COOLY and Studio Space. Work includes one Thvgger project combining the personal identity, this website, and related print studies, with all their gallery assets. Studio Space is marked as work in progress; no client relationship or results are claimed. Template brand examples are not displayed.

The Thvgger project includes a silent recording of the homepage intro at `public/videos/thvgger/intro.mp4`, with a poster in `public/images/portfolio/thvgger`. The native video player has playback controls, plays inline, and loads the video when requested.

FOOLY COOLY is presented by `components/StorefrontCaseStudy.tsx`. Its original FLCL vector and actual interface captures live in `public/images/portfolio/foolycooly`. The case study describes the animated identity, collection, product selection, and mobile layout. It labels the project as a prototype and credits sample product photography from Stüssy and Fear of God references. Source: https://github.com/thvgger/foolycooly.

Studio Space uses original vector components exported through Figma Console from https://www.figma.com/design/LkrxXceEnwhOXx0RpYMpDk/j-l?node-id=48-158. The complete SVGs live in `public/images/portfolio/studio-space`; dimensions and the source link are in `lib/studio-space.ts`. `components/LogoCaseStudy.tsx` presents the artwork with responsive text, colour examples, actual-size favicon previews, and clear-space guidance. The presentation takes its structure from the user's Quaandry logo-variation reference without reproducing that site's artwork.

The email uses the reserved placeholder `hello@thvgger.example`. Replace it with your real address before publishing. GitHub links point to https://github.com/thvgger.

The visual direction is documented in `DESIGN.md`. Keyboard controls have visible focus and effects respect reduced-motion preferences.

Set NEXT_PUBLIC_SITE_URL to your deployed origin when publishing so social preview URLs resolve to the live site.
