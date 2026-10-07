# Thvgger

A personal design and development portfolio built with Next.js, React, TypeScript, and Motion. A scrolling monochrome homepage introduces the Thvgger wordmark, interactive cube, selected work, and design practice. Separate pages cover the work, about, and contact.

## Local development

Run `npm run dev` and open http://localhost:3000.

Run `npm run lint` and `npm run build` to check the project.

## Pages

- `/` — an introduction, selected projects, expandable capability notes, and contact invitation.
- `/work` — a selection of personal projects.
- `/work/identity`, `/work/portfolio`, `/work/print` — individual project pages.
- `/about` — design and development introduction.
- `/contact` — email link and copy action.
- `/playground` — a Coming soon placeholder.

## Content

Project content, gallery assets, and contact details live in `lib/portfolio.ts`. The featured work is self-initiated: the Thvgger identity, this website, and print studies from the same identity system. Template brand examples are not displayed.

The email uses the reserved placeholder `hello@thvgger.example`. Replace it with your real address before publishing. GitHub links point to https://github.com/thvgger.

The visual direction is documented in `DESIGN.md`. Keyboard controls have visible focus and effects respect reduced-motion preferences.

Set NEXT_PUBLIC_SITE_URL to your deployed origin when publishing so social preview URLs resolve to the live site.
