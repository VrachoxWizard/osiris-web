# OSIRIS visual system

The sole production stylesheet is `css/osiris-v2.css`. Historical CSS files are neither linked nor published. The visual direction is a restrained editorial studio website: real project screenshots, clear Croatian language, Ink navigation and heroes, Paper information sections, Soft Blue process sections, and blue calls to action.

## Type and layout

- Local Libre Baskerville for headings, Instrument Sans for body and controls; retain Latin Extended fonts for Croatian.
- Homepage H1: 40–80px. Internal H1: 36–64px. H2: 30–48px. H3: 22–28px.
- Headings use approximately 1.12–1.15 line height and restrained tracking. Do not impose narrow global character limits.
- Body: 16–18px, line height 1.6, readable measure up to 65 characters.
- Container maximum: 1280px. Mobile gutters: 20px. Section spacing: 56px mobile, 64px tablet, up to 96px desktop.
- Breakpoints: 640, 960, 1200px. CSS and navigation JavaScript share 60rem for desktop navigation.
- Mobile heroes and process rows are content-sized. Project previews are three columns on desktop and one on mobile/tablet; case studies use two desktop columns and one final split case.

## Palette and component surfaces

Ink `#05070B`, Navy `#0B1120`, Tech Blue `#3F5EA2`, Deep Blue `#263F73`, Soft Blue `#DCE8FF`, Paper `#F5F7FA`, White `#FFFFFF`. Dark text `#0F172A`, secondary text `#475569`, field border `#64748B`.

Surface components define their own text, muted text, link, border, focus, and button tokens. A white form nested in a blue section must reset every relevant token, including the blue submit button and dark focus ring. Breadcrumbs inherit local surface colors. New colors belong in the token layer.

## Interaction and accessibility

- Deliver complete navigation, forms, projects and footer in rendered HTML; JavaScript only enhances them.
- Native mobile details navigation remains available without JavaScript. The enhanced overlay scrolls independently, traps keyboard focus, makes page content inert, closes with Escape, and resets at desktop widths.
- Native fragments preserve history. Main has tabindex -1 for the skip link.
- Controls have visible labels and 52px height; standalone links aim for at least 44px. Inline prose links retain normal line flow.
- Form errors use explicit descriptions; status messages are persistent live regions. Native POST and validation remain the fallback.
- Hover styles apply only to hover-capable fine pointers; reduced-motion mode uses instant scrolling and no transitions.
- Avoid clipping text or focus outlines. Crop only in dedicated media containers.

## Media

Use supplied artwork and real project screenshots. Preserve 16:9 project images and AVIF/WebP sources with accurate sizes. Captions sit below the media. Only the principal hero image is high priority; below-fold content is lazy loaded. The stock hero image is illustrative, not an OSIRIS team portrait. The unrelated laboratory video remains disconnected.

## Maintenance and validation

Shared components are generated in `scripts/render-page.mjs` using `js/content.js`; page-specific text remains in the HTML templates. Both development serving and production building use the same renderer. Browser tests validate actual nested surfaces, keyboard paths and responsive layouts in addition to static checks. Do not describe automated checks as complete accessibility conformance or field performance measurement.

Before future Superdesign canvas work, refresh its ignored context from this file and the current renderer/templates. Historical canvas drafts use an obsolete visual system and must not overwrite this implementation.
