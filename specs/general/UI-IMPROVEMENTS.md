# UI/UX Improvements

## Scrolling homepage revision, 7 October 2026

The latest homepage expands the minimal opening into a normal scrolling introduction. It adds a clear role statement, an anchor to selected work, two offset image previews linking to project pages, a personal introduction, native expandable capability notes, and a circular contact link. Work, About, Contact, individual projects, and the Playground placeholder retain their own URLs.

The design preserves the monochrome palette, Inter wordmark, and interactive cube. Image hover responses, rotating capability toggles, and the contact-link treatment add restrained playfulness. The new content uses the user's own work and describes identity, interface, and development interests without invented clients or credentials.

Verification: production build, TypeScript, and ESLint passed. Browser checks passed for layout and scroll navigation at 320, 375, 390, 768, and 1440 pixels. Desktop mouse-wheel scrolling and emulated touch scrolling both moved the page. Expandable notes work with Enter, Space, and click. Project, Work, About, and Contact links open their dedicated routes. The mobile menu restores focus and scroll position when dismissed. Reduced motion disables ornamental animation and smooth anchor scrolling. Both project images loaded, meaningful content rendered on the server, and no runtime exceptions were observed. Desktop and mobile screenshots were inspected. This is not a complete assistive-technology or performance audit.

## Earlier minimal multi-page revision, superseded

The user's latest direction replaces the earlier one-page implementation with a cleaner portfolio inspired by the typography, navigation, and spacing of https://www.paulkalkbrenner.net/. Home shows the Thvgger cube, wordmark, and one link to the work. Work, About, Contact, and Playground have separate URLs. Each personal project has a dedicated page with images, role, focus, and short design notes. Playground is a Coming soon placeholder.

The shared layout uses white backgrounds, small navigation, generous space, and subtle interaction. Dense editorial panels, project dialogs, About texture, and active playground experiments are removed. The user's own identity, print studies, GitHub account, and authorized email placeholder remain the content.

Verification: production build, TypeScript, and application ESLint passed. Browser checks covered every page and project at 320, 375, 768, and 1440 pixels, with additional desktop and 390px screenshots inspected. No horizontal overflow or runtime exceptions were observed. Project links, next/back navigation, mobile-menu opening, Escape and focus restoration, email copying, cube keyboard interaction, reduced motion, and unknown-project 404 handling passed. This is not a complete assistive-technology or performance audit.

## Earlier one-page implementation, superseded

The portfolio has been completed in its existing monochrome identity. The current version adds a clear hero introduction, a compact manually browsable work showcase, project detail dialogs, a quieter About section, a cube/type playground, and a contact section. Music-template content and named-brand examples are removed from the displayed portfolio. Featured work consists of the personal identity, this website, and related print studies.

GitHub points to https://github.com/thvgger. The email is the user-authorized reserved placeholder hello@thvgger.example; replace it in lib/portfolio.ts before publishing. Set NEXT_PUBLIC_SITE_URL to the deployed origin for live social preview URLs.

Verification: production build and TypeScript passed; application ESLint passed; browser checks passed for project selection, galleries, dialog focus/Escape/centering, cube keyboard control, editable type, canvas inversion, email copying, mobile menu, section anchors, GitHub link, reduced motion, and generated social preview. No horizontal overflow was found at 320, 375, 390, 768, or 1440 pixels. No runtime exceptions were observed during those checks. Screenshots were inspected on desktop and mobile; this is not a full assistive-technology or performance audit.

The original review below records the starting state.

## Summary

Reviewed the local Thvgger portfolio through its source and a rendered Edge preview at 1440 x 900, 390 x 844, and 375 x 667. The monochrome palette, custom isometric logo, large wordmark, and split project layout give it a distinct visual identity. The largest opportunities are clearer positioning, complete navigation, evidence of project ownership, and a usable path to contact.

This is a review of the current working tree, including existing uncommitted changes. No application code was changed. Browser observations are from development mode; production performance was not measured. Keyboard and screen-reader findings below are based on source inspection rather than a complete assistive-technology audit.

## Critical Issues

### Issue: Contact has no destination
**Current State:** The header links to #contact, but that section is absent. The page has no email link or contact form.
**Problem:** An interested visitor cannot take the obvious next step.
**Recommendation:** Add a closing contact section with an email link, a clear invitation to collaborate, and relevant professional profiles. Wire the header to it.
**Impact:** Makes enquiries possible directly from the portfolio.
**Implementation Notes:** Low complexity for a mailto link; use the owner's actual contact details.

### Issue: Project actions promise unavailable content
**Current State:** Every primary project action uses href="#". The secondary button says STREAM followed by the current title, but calls the next-project handler.
**Problem:** Visitors cannot inspect the work in depth, and button labels do not describe their actions.
**Recommendation:** Link each project to a real case study or live deliverable. Rename the secondary button to Next project if it continues to advance the archive.
**Impact:** Removes dead ends and makes the work independently assessable.
**Implementation Notes:** Relabeling is low complexity; preparing meaningful case studies requires content work.

## High Priority Improvements

### Issue: The hero establishes the name without explaining the offer
**Current State:** The opening screen is dominated by the logo and Thvgger wordmark. The small footer line mentions designing and building; the explicit role appears in About.
**Problem:** New visitors must explore to learn what the owner does and whether the work is relevant to them.
**Recommendation:** Keep the wordmark and add a concise role statement nearby, such as "Designer & developer building brand identities and interactive websites." Add View selected work and Contact me links with real destinations. Adapt the wording to the work the owner wants to attract.
**Impact:** Gives visitors a useful first impression while preserving the visual identity.
**Implementation Notes:** Low complexity.

### Issue: Project descriptions do not establish the owner's contribution
**Current State:** Brand projects have polished campaign summaries but no visible role, collaborators, process, or results. The category field exists in the project data but is not displayed.
**Problem:** Visitors cannot tell what the owner personally designed or built, or how to assess the project's success.
**Recommendation:** Feature three or four strongest projects with a brief, precise role, key decisions, process images, and a verifiable result. For collaborative work, state the owner's contribution and credit collaborators. Label personal concepts and practice work clearly when applicable. Include a live link or repository when relevant to a development project.
**Impact:** Gives potential clients and employers evidence they can use to judge fit.
**Implementation Notes:** Medium complexity, primarily editorial. Do not invent performance figures or client relationships.

### Issue: The archive is difficult to scan
**Current State:** Eight projects occupy a 1040vh sticky section, with one project visible at a time. The first project cycles through eleven images automatically every 2.5 seconds. Scrollbars are hidden globally.
**Problem:** Visitors have little overview of the available work, and an image can change while they inspect it.
**Recommendation:** Add a compact project index or thumbnail grid with direct links. Consider a normal stacked layout on phones. Provide manual gallery controls and a pause option, or make the identity gallery manual. Keep the current split presentation where it serves the work.
**Impact:** Makes relevant projects quicker to find and allows deliberate viewing.
**Implementation Notes:** Medium complexity. Verify scroll and button navigation remain consistent after any archive changes.

### Issue: Playground has no matching section
**Current State:** Work and About have valid anchors. Playground links to #playground, which is absent.
**Problem:** One of the main navigation choices does nothing useful.
**Recommendation:** Add a small experiments section if there is content to show; otherwise remove that navigation item until it is ready.
**Impact:** Keeps navigation trustworthy.
**Implementation Notes:** Low complexity to remove the link.

## Medium Priority Enhancements

### Issue: Small text and controls reduce usability
**Current State:** Hero helper text is around 11.5px, the About button is around 9px, and archive arrows measure 32 x 32px. The About texture is visually busy behind the copy. The inspected phone widths had no horizontal overflow and retained the first project's action bar.
**Problem:** Small text requires more effort to read, small arrows are harder to tap, and the texture competes with text.
**Recommendation:** Increase important body copy toward 16px and action labels toward 13-14px. Enlarge arrow hit areas toward 44 x 44px. Reduce the texture intensity or use a quieter surface behind the About copy. Check every project's description on short phone screens because the mobile panel uses a fixed height and clips overflow.
**Impact:** Improves readability and touch use without changing the site's identity.
**Implementation Notes:** Low to medium complexity. The first project fit the two phone sizes checked; clipping of other projects has not been established.

### Issue: Keyboard and reduced-motion support need attention
**Current State:** Shared links and buttons remove focus outlines without providing replacement focus styles. The equalizer uses a clickable div and the interactive logo uses an SVG without keyboard control semantics. The mobile overlay lacks explicit focus management and Escape handling. There is no explicit reduced-motion handling for the intro, periodic spins, galleries, or smooth scrolling.
**Problem:** Keyboard users can lose their position or be unable to operate controls, and motion-sensitive visitors cannot opt out of the animation-heavy presentation.
**Recommendation:** Add visible focus-visible styles, use semantic buttons for clickable controls, expose the sound state with aria-pressed, and implement menu focus management, Escape dismissal, and focus restoration. Respect prefers-reduced-motion in both CSS and JavaScript, with the hero content available immediately in that mode.
**Impact:** Makes the same experience usable with more input methods and motion preferences.
**Implementation Notes:** Medium complexity. Verify with keyboard navigation and reduced-motion emulation.

### Issue: Search description describes a different offering
**Current State:** The title is only Thvgger, and the description says "Explore music, new releases, and live performances by Thvgger." No custom social preview image is configured in the reviewed layout.
**Problem:** Search snippets and shared links may fail to describe the design/development portfolio.
**Recommendation:** Use a title such as "Thvgger | Designer & Developer," a description grounded in the owner's services, and a branded social preview image. If music remains part of the intended offering, explain how it relates to the portfolio in the visible content as well.
**Impact:** Gives visitors accurate context before they arrive.
**Implementation Notes:** Low complexity; follow the installed Next.js metadata documentation.

## Low Priority Suggestions

- Rename Available as to Deliverables and DIG DEEPER to View selected work for clearer labels.
- Replace the broad About statement with a short personal introduction: specialties, preferred project types, and relevant background. Add availability or location only if useful and accurate.
- The audio display says Now playing while Sound OFF is the initial state. Make the status agree with playback and describe the synthesized ambient audio accurately.
- Consider restoring a subtle scrollbar so visitors can see their position in the long archive.
- Use a more consistent heading weight and sentence case for supporting text; reserve uppercase for short labels.

## Positive Observations

- The custom isometric logo is memorable and fits the restrained visual system.
- The large wordmark and generous whitespace give the opening screen a deliberate composition.
- The image/editorial split creates clear hierarchy in the work section.
- The project counter and previous/next controls provide useful orientation.
- The narrow layouts inspected stayed within the viewport, and the first project's action bar remained visible at both phone heights.
- Sound is off by default, so visitors choose whether to enable it.

## Recommended Order

1. Complete the contact destination and repair project actions and Playground navigation.
2. Add a clear hero introduction and three strong, attributable case studies.
3. Provide a project overview and manual control over image galleries.
4. Improve typography, touch targets, keyboard navigation, and reduced-motion behavior.
5. Update search and social-sharing metadata.
