# OSIRIS visual system

The live site has one authoritative stylesheet: `css/osiris-v2.css`. Older OSIRIS stylesheets are retained only as historical references and must not be linked from a page.

## Direction

- Polished cinematic/editorial tone with a controlled light–dark rhythm.
- Dark surfaces are reserved for navigation, heroes, project media, the footer, and one proof section per page.
- Informational content uses Paper; explanatory/process content uses Soft Blue.
- Real project work is the primary visual proof. Generated or stock people must never represent the OSIRIS team or a client.

## Core tokens

| Role | Value |
| --- | --- |
| Cinematic ink | `#05070B` |
| Navy | `#0B1120` |
| Tech Blue | `#3F5EA2` |
| Deep Blue | `#263F73` |
| Soft Blue | `#DCE8FF` |
| Paper | `#F5F7FA` |
| Light text | `#FFFFFF` |
| Dark text | `#0F172A` |
| Secondary dark text | `#475569` |

All opaque text/background pairs used by the system are checked at a minimum contrast ratio of 4.5:1 by `npm run check`. New hex colours belong in the token layer; literal hex colours are rejected elsewhere.

## Typography

- Libre Baskerville, weights 400 and 700: hero and editorial headings.
- Instrument Sans variable, weights 400–700: body, navigation, labels, buttons, and form copy.
- Both families are loaded locally as WOFF2 with Latin and Latin Extended subsets.
- Body copy uses a fluid 16–18 px scale and a maximum readable measure of 68 characters.

## Layout

- Maximum content width: 1280 px.
- Breakpoints: 640 px, 960 px, and 1200 px.
- JavaScript and CSS share the desktop query `(min-width: 60rem)`.
- Section rhythm: approximately 96 px desktop, 64 px tablet, and 56 px mobile.
- Internal heroes are capped at 75 svh; only the homepage hero occupies a full viewport.

## Media and interaction

- Project imagery uses AVIF, WebP, and PNG fallback sources at 480, 800, 1200, and 1920 px.
- The homepage poster uses dedicated 960, 1600, and 1920 px AVIF/WebP sources.
- Every content image has dimensions, descriptive alternative text, and asynchronous decoding.
- Reduced-motion mode removes motion and instantaneously handles scrolling.
- A hero video may be restored only with approved WebM and MP4 sources that show relevant OSIRIS work; mobile, reduced-motion, and save-data modes remain poster-only.

## Quality gate

Run `npm run check` before publication. It validates all seven routes, local assets, heading structure, shared form fields, responsive image metadata, external-link safety, CSS layers, token usage, contrast pairs, undefined variables, and banned `!important` or `transition: all` declarations.
