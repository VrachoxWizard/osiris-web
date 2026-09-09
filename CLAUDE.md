# CLAUDE.md

Guidance for AI coding agents working in this repository.

## What this project is

The OSIRIS studio website: a static, multi-page Croatian site with no framework, no database and no production JavaScript dependencies. The only runtime dependency is Node.js 22 or newer. Everything under `devDependencies` exists for testing.

The site is deployed from `dist/`, which is generated and git-ignored. Never edit `dist/` by hand; edit the sources and rebuild.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dev dependencies |
| `npm run dev` | Live renderer on http://localhost:4173 |
| `npm run preview` | Serve the built `dist/` on the same port |
| `npm run build` | Run `check`, then generate `dist/` |
| `npm run check` | Static contract validation plus `node --check` on every script |
| `npm run test:chromium` | Build, then Playwright in Chromium only (fast loop) |
| `npm test` | Build, then Playwright in Chromium, Firefox and WebKit |

Playwright serves the **built** site from `dist/` on port 4174, not the live renderer. Run `npm run build` after changing templates, CSS or JS or the tests will silently exercise stale markup. `npm test` already does this for you.

First-time browser setup: `npx playwright install chromium firefox webkit`.

## Architecture

Shared page furniture is generated at request time and at build time by the same renderer, so development and production never drift.

- `scripts/render-page.mjs` injects the header, footer, service cards, project cards and the chat widget into marked mount points. Page-specific prose lives in the HTML templates.
- `scripts/build-static.mjs` writes `dist/` and copies the asset allowlist. Adding or removing a file under `media/` means editing its copy list.
- `scripts/validate-site.mjs` enforces the static contract described below.
- `js/content.js` holds the business name, contact details, studio facts, all five projects and the Formspree ID. The renderer HTML-escapes everything it injects.
- `server.mjs` serves the live renderer, or `dist/` with `--built`.
- `api/chat-handler.mjs` is the serverless `POST /api/chat` endpoint; `api/chat.js` is the Vercel entry point.

Routes: `/`, `/usluge/`, `/projekti/`, `/o-nama/`, `/kontakt/`, `/web-stranice-za-poduzeca/`, `/privatnost/`. Anything else renders `404.html` with a 404 status.

## Hard constraints

`scripts/validate-site.mjs` and `tests/site.spec.mjs` encode a strict contract. All of it passes today and must keep passing.

**CSS** — `css/osiris-v2.css` is the sole production stylesheet; historical CSS files are neither linked nor published.

- No `!important` and no `transition: all`.
- No literal hex colours below the `@layer reset` boundary. New colours go in the token layer; `rgb()` with alpha is fine anywhere.
- Every `var()` must reference a declared custom property.
- The contrast pairs listed in the validator stay at 4.5:1 or better.
- Every gap, padding and margin comes from `--space-1` through `--space-10` (a 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px). Do not introduce ad hoc literals such as `.65rem`; snap to the nearest step. Fluid values stay in `clamp()` but take their endpoints from the same scale.
- Small text uses `--step--1` rather than a repeated `.875rem`.

**Markup** — exactly one `h1` and one `main` per page, no skipped heading levels, no duplicate IDs, every `href="#..."` and every `aria-labelledby`/`aria-describedby` target must resolve, every `img` needs `alt`, `width`, `height` and `decoding="async"`, every responsive `source` with `w` descriptors needs `sizes`, and every `target="_blank"` needs `rel="noopener"`.

**Copy** — no `-`, `–` or `—` anywhere in visible body text, on any page, in any language. A test asserts this against `body.innerText`. Use a colon or a comma instead.

**Layout** — no element overflow at any of 17 widths from 320 to 1920, and `documentElement.scrollWidth <= innerWidth` at all of them.

**Accessibility** — zero axe violations under `wcag2a`, `wcag2aa`, `wcag21aa` and `wcag22aa` on all eight routes at 375px and 1440px. Watch for controls whose visible label is hidden at some breakpoint: they need an `aria-label`.

**Progressive enhancement** — navigation, forms, projects and the footer ship in rendered HTML. JavaScript only enhances. The mobile menu works as a native `details` element without JavaScript, and both forms keep their native POST and native validation as the fallback.

## Forms

Both forms share one field set and one Formspree destination. The field names are part of the contract: `name`, `email`, `websiteStatus`, `primaryGoal`, `websiteUrl`, `company`, `message`, `_gotcha`, four UTM parameters and `pageUrl`.

Tests intercept all `https://formspree.io/**` traffic, so no real enquiry is ever sent. When writing tests, scope contact-form selectors to `[data-contact-form]`; a bare `locator('form')` also matches the chat form and fails Playwright's strict mode.

## Chat widget

Three files must stay in step: `chatWidget()` in `scripts/render-page.mjs`, `js/chat.js`, and the `.osiris-chat*` block in `css/osiris-v2.css`.

- Desktop is a floating panel anchored above the launcher. Below 40rem it becomes a modal bottom sheet with a scrim, `aria-modal`, a Tab trap, inert header, main and footer, and a locked body scroll. A `matchMedia` listener unwinds all of it when the viewport grows.
- The message list carries `min-height: 0`. Do not reintroduce a `min-height` floor; that was the cause of the composer being clipped on phones.
- The conversation and open state persist in `sessionStorage` under `osiris-chat`, because this is a multi-page site and every navigation is a fresh document.
- `OPENROUTER_API_KEY` must exist in a local `.env` (see `.env.example`) and in Vercel project settings. The key stays server-side; the client posts only the message history.
- Tests must intercept `**/api/chat` so no real model request is made.

`DESIGN-SYSTEM.md` is the authoritative visual contract, including the chat rules above. Read it before changing anything visual, and update it when the contract itself changes.

## Conventions

- Croatian for all user-facing copy. English only in code, comments and internal docs.
- The stylesheet is written in dense single-line rule style inside `@layer tokens, reset, base, layout, components, pages, utilities`. Match it rather than reformatting.
- Comment only to record a constraint the code cannot express, such as why a `min-height` must stay zero. Do not narrate what a line does.
- Only the principal hero image is high priority; everything below the fold is lazy loaded.
- Decorative stock photography is not used inside content sections. Supporting figures are real project screenshots, and no project repeats on a single page.

## Do not touch without being asked

- `DESIGN-ENHANCEMENTS.md`, `DESIGN-POLISH.md`, `DESIGN-TRANSFORMATION.md` and `css/osiris.css` are project history, superseded by `DESIGN-SYSTEM.md` and `css/osiris-v2.css`.
- `.superdesign/` is an ignored local design workspace whose drafts use an obsolete visual system.
- `OUTREACH-EMAILS.md` is a separate campaign, unrelated to the contact form.
- `mvukusic67@gmail.com` and the business name are owner-confirmed. Do not add a street address or other business details without confirmation.
- `media/archive/` and the unlinked laboratory video stay disconnected.

## Before you finish

1. `npm run build` — the static contract and syntax checks.
2. `npm test` — all three engines. Expect 56 passed and 1 skipped; the skip is Firefox mobile emulation, which Playwright does not support.
3. Update `DESIGN-SYSTEM.md` if you changed the visual contract, and `MEDIA-CREDITS.md` if you added, removed or stopped publishing an image.
