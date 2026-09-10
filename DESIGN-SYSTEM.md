# OSIRIS visual system

The sole production stylesheet is `css/osiris-v2.css`. Historical CSS files are neither linked nor published. The visual direction is a restrained editorial studio website: real project screenshots, clear Croatian language, Ink navigation and heroes, Paper information sections, Soft Blue process sections, and blue calls to action.

## Type and layout

- Local Libre Baskerville for headings, Instrument Sans for body and controls; retain Latin Extended fonts for Croatian.
- Headings carry light tracking (about -0.008em). Baskerville has generous sidebearings and heavier negative tracking crowds it.
- The Instrument Sans width axis (font-stretch 75% to 100%) is the technical voice: stat numerals, process numerals, frame labels and capability codes run condensed around 78 to 82 percent. It is the same font file, so it costs no extra download.
- Homepage H1: 40–80px. Internal H1: 36–64px. H2: 30–48px. H3: 22–28px.
- Headings use approximately 1.12–1.15 line height and restrained tracking. Do not impose narrow global character limits.
- Body: 16–18px, line height 1.6, readable measure up to 65 characters.
- Container maximum: 1280px. Mobile gutters: 20px. Section spacing: 56px mobile, 64px tablet, up to 96px desktop.
- Breakpoints: 640, 960, 1200px. CSS and navigation JavaScript share 60rem for desktop navigation.
- Mobile heroes and process rows are content-sized. Project previews are three columns on desktop and one on mobile/tablet; case studies use two desktop columns and one final split case.

## Radius and elevation

Radius comes from `--radius-control` (.25rem), `--radius-panel` (.5rem), `--radius-card` (.75rem), `--radius-sheet` (1rem) and `--radius-pill`. Elevation comes from `--shadow-1` through `--shadow-3` on light surfaces and `--shadow-ink` on dark ones. Do not introduce ad hoc radii or shadows; extend the scale instead.

## Atmosphere

Surfaces are layered, not flat fills. Every `.section` and the proof rail paint two decorative pseudo-elements between the surface colour and the content: `::before` carries `--section-art` (a blueprint grid from `--grid-dark`/`--grid-brand` at `--grid-size`, plus a radial glow) and `::after` carries `--grain` at `--grain-opacity`. Both are `inset:0` and `z-index:-1`, so neither can create scrollable overflow. The footer repeats the ink treatment and adds a gradient hairline along its top edge.

The grain is an inline SVG `feTurbulence` data URI. It must never contain a literal hash: the CSS contract rejects hex colours below the reset layer, so the filter reference is encoded as `%23`.

## Motion

One system, all of it optional. `--ease-out`, `--ease-spring` and `--dur-1`..`--dur-3` are the vocabulary.

- The homepage hero animates on load in pure CSS with staggered `animation-delay`: copy rises, then the two project tiles settle.
- Scroll reveals are progressive. The markup ships visible; `setupReveals()` in `js/app.js` adds `.js-reveal` to the root, which is the only thing that arms the hidden start state, then an IntersectionObserver adds `.is-revealed`. Without JavaScript, without IntersectionObserver, or under reduced motion, nothing is ever hidden. Never invert this by hiding in CSS and showing in JS.
- Hover choreography: cards lift and their screenshots scale slightly, the `.arrow` glyph slides, and the service rows draw a rule across. All of it stays inside the hover-capable fine-pointer guard.
- The header gains a translucent ink background and a scroll-progress bar once scrolled. Alpha stays at .9 or higher so white text keeps its contrast over any surface behind it.
- Cross document navigation uses `@view-transition {navigation: auto}`, declared outside the cascade layers. Chromium fades between documents, every other engine simply navigates, and reduced motion disables the root transition explicitly because the global `animation:none` rule does not reach view transition pseudo elements.

## Spacing scale

Every gap, padding and margin comes from `--space-1` through `--space-10`, a 4px grid running 4, 8, 12, 16, 20, 24, 32, 40, 48 and 64px. Ad hoc literals such as `.65rem` or `1.05rem` are not permitted; snap to the nearest step instead. Fluid values stay in `clamp()` but take their endpoints from the same scale. Small body copy and control labels use `--step--1` rather than a repeated `.875rem`.

Editorial grids align to the top so media never floats in the middle of a taller text column; only `.editorial-grid--cta` and `.inner-hero__grid` stay centred. The proof rail stacks its figure above its label at every width, keeping one label baseline across all three cells. Footer bottom padding clears the fixed chat launcher.

## Palette and component surfaces

Ink `#05070B`, Navy `#0B1120`, Tech Blue `#3F5EA2`, Deep Blue `#263F73`, Soft Blue `#DCE8FF`, Paper `#F5F7FA`, White `#FFFFFF`. Dark text `#0F172A`, secondary text `#475569`, field border `#64748B`.

Project screenshots sit in browser chrome. The `.frame` component pairs a hairline bar (three dots plus a condensed label) with a `16/10` media box using `object-fit: cover` and `object-position: center top`, so screenshots fill the frame from their own top edge instead of letterboxing. The bar label is always the project title, never the host: two live URLs contain hyphens and `body.innerText` must stay free of them. The label must not use `overflow:hidden` with `white-space:nowrap`, because a truncated label reports a scrollWidth larger than its clientWidth and the layout test rejects that whether or not it is clipped.

Surface components define their own text, muted text, link, border, focus, and button tokens. A white form nested in a blue section must reset every relevant token, including the blue submit button and dark focus ring. Breadcrumbs inherit local surface colors. New colors belong in the token layer.

## Recurring detail motifs

Four details repeat across the site and should be reused rather than reinvented:

- **Leading rule.** Section eyebrows, content stack eyebrows, editorial grid eyebrows and footer labels all sit in a flex row behind a short hairline drawn with `::before` at 45 percent opacity.
- **Accent tab.** A short two pixel rule in `--link` sits over the top border of process steps, founder cards and offer cards, and draws across on hover for the homepage service rows.
- **Subordinate note.** The supporting paragraph in `.section-heading` carries a top hairline and `text-wrap: pretty`, so the two column heading reads as a heading plus a note rather than two equal columns of text.
- **Condensed technical voice.** Eyebrows, labels, stat and process numerals, frame labels and the footer baseline all run condensed. Baskerville stays the display voice.

Form controls use `--radius-panel`, a hover border shift, and a focus glow alongside the existing focus outline. The select drops its native arrow for `--select-chevron`, a data URI held in the token layer because a data URI cannot resolve `var()` and literal colours do not belong below the reset layer.

## Interaction and accessibility

- Deliver complete navigation, forms, projects and footer in rendered HTML; JavaScript only enhances them.
- Native mobile details navigation remains available without JavaScript. The enhanced overlay scrolls independently, traps keyboard focus, makes page content inert, closes with Escape, and resets at desktop widths.
- Native fragments preserve history. Main has tabindex -1 for the skip link.
- Controls have visible labels and 52px height; standalone links aim for at least 44px. Inline prose links retain normal line flow.
- Form errors use explicit descriptions; status messages are persistent live regions. Native POST and validation remain the fallback.
- Hover styles apply only to hover-capable fine pointers; reduced-motion mode uses instant scrolling and no transitions.
- Avoid clipping text or focus outlines. Crop only in dedicated media containers.

## Chat widget

The widget lives in three places that must stay in step: `chatWidget()` in `scripts/render-page.mjs`, `js/chat.js`, and the `.osiris-chat*` block in `css/osiris-v2.css`.

- Radius follows the shared scale: `--radius-sheet` on the panel, `--radius-card` on bubbles, the intro and the composer, `--radius-pill` on the launcher, the icon buttons and the chips. Elevation is `--shadow-ink`. The entrance uses `--ease-out` and must not overshoot: a spring that scales past 1 would push the full-width mobile sheet past the viewport and fail the horizontal overflow assertion.
- On the two pages that already carry the enquiry form (contact and landing) the launcher shows only its mark, so it never floats over a form field.
- Desktop is a floating panel anchored above the launcher, which collapses to its mark while open. Below 40rem the panel becomes a modal bottom sheet: full width, pinned to the bottom edge, with a scrim, `aria-modal`, a Tab trap, inert header, main and footer, and a locked body scroll. The `matchMedia` listener unwinds all of it when the viewport grows.
- The message list carries `min-height:0` so the composer, the AI disclosure and the analysis link are never clipped. Do not reintroduce a `min-height` floor on it.
- The conversation and the open state persist in `sessionStorage` under `osiris-chat`, because this is a multi-page site. "Novi razgovor" clears both and is disabled while there is nothing to clear.
- Every reply carries an AI disclosure under the composer. A failed request keeps the visitor's text and offers a retry chip instead of silently dropping it. Auto-scroll only follows the newest message when the reader is already near the bottom.
- The chat root joins `main` and the footer in the inert list used by the mobile menu, so the launcher is unreachable behind the open overlay.

## Media

The homepage hero is a bespoke composition, not photography: two project tiles staggered over the ink field, overlapped with a negative margin so the stack keeps an honest height, and rotated no more than about 3 degrees with padding reserved to absorb the bounding growth. The tiles are Tina Sport Pia and ATASOL, the two projects the rest of the homepage does not use, so all five projects appear once and none repeats. The former Pexels hero is no longer linked or published and its files are dropped from the build allowlist.

Use supplied artwork and real project screenshots. Preserve 16:9 project sources and AVIF/WebP with accurate sizes. Captions sit below the media. Only the principal hero image is high priority; below-fold content is lazy loaded. The stock hero image is illustrative, not an OSIRIS team portrait. The unrelated laboratory video remains disconnected.

Decorative stock photography is not used inside content sections. Project screenshots belong in project and services contexts; the homepage About section uses the capability cards from `founderProfiles` rather than a client screenshot. The homepage services section pairs its list with a typographic capability panel built from `serviceTracks[].includes`, not a screenshot, which is what frees ATASOL for the hero.

## Maintenance and validation

Shared components are generated in `scripts/render-page.mjs` using `js/content.js`; page-specific text remains in the HTML templates. Both development serving and production building use the same renderer. Browser tests validate actual nested surfaces, keyboard paths and responsive layouts in addition to static checks. Do not describe automated checks as complete accessibility conformance or field performance measurement.

Before future Superdesign canvas work, refresh its ignored context from this file and the current renderer/templates. Historical canvas drafts use an obsolete visual system and must not overwrite this implementation.
