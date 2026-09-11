# Design — OSIRIS

## Purpose and Authority

This file is the single source of truth for the project's visual direction, interface design, and written voice. It applies to the entire repository and to every page, component, asset, interaction, and piece of copy.

When implementation details, existing styles, generated output, screenshots, or prior conventions conflict with this document, follow this document. Do not recreate deleted Markdown guidance or introduce a competing design brief elsewhere.

## Anti-Slop Declaration

The project must feel authored, specific, and culturally grounded. It must not resemble a generic SaaS landing page assembled from familiar templates. Every design choice should reinforce a restrained tech-editorial identity with the character of an independent Zagreb studio.

## Core Creative Direction

### Desired Tone

The experience should be:

- Editorial rather than promotional.
- Precise, composed, and intentional.
- Visually cool and disciplined, but warm and tactile in use.
- Confident without sounding inflated or self-congratulatory.
- Recognizable as a Zagreb studio with character, not an anonymous global software brand.

Use restraint, strong hierarchy, purposeful spacing, and sharp typography. Warmth should come from material detail, rhythm, language, and carefully chosen contrast—not from playful decoration or exaggerated friendliness.

### Signature Hook

The interface must contain one memorable, repeatable visual idea:

> An oversized serif display typeface, paired with monospace labels that resemble system messages, technical annotations, or geographic coordinates.

This combination is the project's defining device. It should create a distinctive tech-editorial atmosphere and provide continuity across pages without becoming a gimmick.

#### Display Typography

- Use a characterful serif for major display text and key statements.
- On desktop, primary display type should be genuinely oversized—approximately `120px` or larger when the viewport and content allow it.
- Scale typography responsively while preserving impact, tension, and clear hierarchy on smaller screens.
- Favor deliberate line breaks, strong editorial composition, and expressive proportions.
- Do not use oversized type indiscriminately. Reserve it for the most important idea on a page.

#### Monospace Labels

- Use monospace text for metadata, navigation markers, section identifiers, timestamps, coordinates, status messages, technical captions, and compact calls to action.
- Labels may borrow the visual language of system output, operational interfaces, or location data.
- Keep labels concise, functional, and typographically controlled.
- Use consistent conventions for casing, separators, numbering, brackets, and alignment.
- Monospace labels must support information architecture rather than serve as random decoration.

## Explicitly Rejected Patterns

Do not use or imitate the following:

- Generic SaaS aesthetics or startup-template composition.
- Indigo or purple gradients, especially as default backgrounds or hero treatments.
- Inter as the primary project typeface.
- Three equal feature cards arranged in a predictable row.
- A centered hero with a headline, supporting paragraph, and generic call-to-action buttons.
- Glassmorphism, frosted translucent panels, decorative blur, or floating glass cards.
- Emoji used as interface, feature, or section icons.
- Empty marketing language such as “Empower your business,” “Unlock your potential,” “Seamless solutions,” or similarly interchangeable claims.

Avoid close substitutes that reproduce the same effect under a different name. Changing a purple gradient to blue, or replacing three cards with four, does not solve the underlying problem.

## Layout Principles

- Prefer editorial composition, asymmetric balance, deliberate offsets, and varied pacing.
- Build hierarchy through scale, position, whitespace, rules, and typographic contrast.
- Let content determine the layout; do not force every section into the same container-and-card pattern.
- Use grids as underlying structure, not as visibly repetitive templates.
- Favor strong sectional transitions and a clear reading sequence.
- Allow selected elements to touch edges, span columns, or break the grid when the gesture is intentional.
- Keep interfaces usable and legible. Distinctiveness must not compromise navigation, accessibility, or responsive behavior.

## Color, Surface, and Material

- Use a controlled, purposeful palette with strong contrast and restrained accents.
- Prefer solid fields, paper-like or tactile surfaces, crisp rules, and subtle material cues.
- Avoid decoration that exists only to make the interface feel “modern.”
- Gradients are not a default visual tool. If one is ever necessary, it must be justified by content and must not drift toward the rejected indigo/purple SaaS look.
- Shadows, rounding, and transparency should be minimal and functional.

## Components and Interaction

- Components should feel designed for this project rather than imported unchanged from a generic UI kit.
- Avoid excessive card containers. Use grouping, spacing, dividers, and typography before adding boxes.
- Calls to action should be direct and specific, with labels that describe the actual result.
- Interactions should be calm, fast, and precise. Motion should clarify state, hierarchy, or navigation.
- Avoid ornamental animation, floating effects, and hover behavior that competes with the content.
- Maintain visible focus states, keyboard support, readable contrast, and reduced-motion behavior.

## Writing and Content Voice

- Write with clarity, specificity, and editorial discipline.
- Prefer concrete nouns and active verbs over broad claims and fashionable jargon.
- Keep headlines sharp and memorable, not motivational or inflated.
- Use short supporting copy that adds information rather than repeating the headline.
- Sound knowledgeable and locally grounded without relying on clichés about Zagreb or Croatia.
- Do not use generic startup language, filler testimonials, or claims that could belong to any company.

## Responsive Behavior

- Preserve the serif-display and monospace-label relationship at every breakpoint.
- Reduce display size deliberately rather than collapsing the design into a conventional mobile template.
- Recompose asymmetric layouts for narrow screens while maintaining a clear reading order.
- Prevent oversized text from causing accidental clipping, unreadable line lengths, or horizontal scrolling.
- Ensure touch targets, navigation, and interactive states remain practical on mobile devices.

## Implementation Decision Test

Before accepting a design or implementation choice, verify that it passes all of the following questions:

1. Does it feel authored for this project rather than borrowed from a SaaS template?
2. Does it support the editorial, precise, cool-but-tactile tone?
3. Does it reinforce the oversized-serif and monospace-system-label signature?
4. Is the copy concrete and free of empty marketing language?
5. Is the composition distinctive without harming usability or accessibility?
6. Would a viewer plausibly remember one clear visual idea after leaving the page?

If the answer to any question is no, revise the work before considering it complete.

## Definition of Done

A page or feature is complete only when:

- It follows this document across desktop and mobile layouts.
- It contains no prohibited visual or copy patterns.
- Its hierarchy is clear without relying on generic card grids.
- Its main display moment and supporting monospace language feel intentional.
- Its copy is specific to the actual product, studio, service, or context.
- Accessibility, interaction states, and responsive behavior have been checked.
- The final result has one memorable hook and reads as a coherent part of the same Zagreb studio identity.

## Locked Hallmark System

### Genre and theme

- Genre: editorial.
- Internal theme name: Zagreb Dossier · Night.
- Vibe: night dossier, paper evidence, Zagreb editorial.
- Theme axes: dark paper / roman serif / warm amber accent.
- The surface is chosen, never inherited. The site does not follow the operating system's
  light or dark preference; each route declares its own `color-scheme`.

### Surface rule

The dossier is dark; the evidence is on paper. Wherever real project screenshots or
long-form reading occur, the surface returns to warm vellum. This is functional before it is
decorative: light-interface screenshots read as damage when they float on a dark field.

- Dark routes: home, services, contact, business landing, not found.
- Vellum routes: projects, about, privacy.
- Vellum interludes inside dark routes: the homepage work section and the landing proof panorama.
- Three dark depths carry the page so no single navy does all the work: base, raised band,
  and a deepest band reserved for emphasis and the colophon.
- Accent splits by surface. Amber signals on navy; cobalt survives on vellum. The original
  cobalt identity relocates rather than disappears, and the warm-against-cool tension is what
  keeps the dark from going flat.
- Vellum is a token remap, not a second stylesheet. Components inherit the surface they sit on.

### Macrostructure family

- Homepage: Marquee Hero with an H1 `xxl`, left-biased, and one rule below.
- Services: Conversational FAQ with an H2 Split Diptych opener at a 7/5 ratio and a proof column.
- Projects: Portfolio Grid with five deliberately uneven placements and no filters.
- About and privacy: Long Document with a narrow reading measure and inline headings.
- Contact: Stat-Led with a tabular display figure and qualifier below.
- Web pages for businesses: Narrative Workflow with vertical `1.0–4.0` stages and line connectors.
- Not found: Index-First with the error number followed by a ruled route index.

### Shared components

- Navigation: N6 Newspaper Masthead. Issue line above a large centred wordmark, ruled route row below, document-flow positioning, and a mobile disclosure labelled `Izbornik`.
- Footer: Ft4 Dense Colophon. One compact monospace information block; no category columns or social icon strip.
- Calls to action: rectangular outline for primary actions; underlined typographic links for secondary actions.
- Project media: semantic figures with real screenshots, one hairline image boundary, and external captions. No simulated browser or device chrome.
- Chat: a vertical edge tab at `75rem` and wider; mobile-menu and pre-footer entry points below that width; native dialog at every size.

### Drafting layer

The technical character comes from measurement marks, not from a technology costume. Every
mark is a real border or box drawn with `--color-tick`; none is a pattern, a glow, or an
image, and none is placed over a screenshot.

- Plate captions read as dimension lines: a hairline end tick closes each end of the
  measured span. The ticks are absolutely positioned so they stay out of the caption's
  flex flow and inside the figure's box.
- Ruled rows carry a graduation at the left end, so a rule reads as a scale rather than a
  divider. The tick always hangs from the row's own rule: below it when the row is ruled at
  its end, inside it when the row is ruled at its start.
- Numbers that report a measurement use `font-variant-numeric: tabular-nums`.
- `--color-tick` is a single mid lightness that reads on both navy and vellum. One pencil,
  both papers.
- Marks are earned, not sprinkled. Routes without figures or specification rows carry none;
  the route index is exempt because its `::after` already carries a direction arrow, and two
  marks in one place would be noise.
- Forbidden in this layer, permanently: neon, glow, scanlines, circuit or grid patterns,
  simulated terminals, and simulated browser, device, or editor chrome.

### Typography

- Display: Libre Baskerville 400, roman.
- Body: Instrument Sans 400–700.
- Mono: IBM Plex Mono 400–500.
- Homepage display: `clamp(3.25rem, 10vw, 9rem)`.
- Long display: `clamp(3.25rem, 8.2vw, 8.5rem)`.
- Body measure: 45–70 characters, anchored at `65ch`; body text never below `16px`.
- Display type is optically aligned, not box-aligned. Each large display heading carries a
  left offset equal to the negated left sidebearing of its opening letter, measured at
  `144px` and stored in em as `--optical-*`. The glyph edge, not the text box, meets the
  rules and the text below. Add a measured token when a route opens on a new letter.
- Body copy hyphenates automatically for Croatian, bounded by `hyphenate-limit-chars: 8 4 3`.
  Monospace labels never hyphenate; they are data, not prose.

### Spacing and shape

- All layout spacing uses the 4-point scale in `tokens.css`.
- Sections use different rhythms: compact `3rem`, reading `4–6rem`, and editorial pause `8rem`.
- Controls use 2px radii; other functional surfaces may use up to 6px.
- Shadows are absent except for separation of the native chat dialog.

### Motion and microinteractions

- Page arrival: opacity only, 180ms.
- Menu: opacity plus a short vertical transform, 180ms.
- Chat dialog: opacity and scale, 280ms entrance and 150ms exit.
- Focus indicators are instant and never animated.
- Form validation begins on blur and revalidates on input only after a field has been touched.
- Reduced motion removes spatial animation and completes state changes within 150ms.
- No universal reveals, parallax, bounce, spring, celebratory success toast, or ornamental animation.

### Page allowances

- Real project screenshots may appear only where they prove a claim or show published work.
- The homepage fold is typography-only and contains no call to action.
- Legal content receives no promotional section.
- The accent stays a small signal for focus, active navigation, rules, and link underlines; it never becomes a large page surface. Amber holds that role on navy, cobalt on vellum.

## Exports

`tokens.css` at the repository root is the live source of truth. These mappings are portable copies for other toolchains.

### CSS custom properties

```css
:root {
  --color-paper: oklch(20% 0.028 252);
  --color-paper-2: oklch(26% 0.02 244);
  --color-paper-3: oklch(13% 0.03 258);
  --color-paper-3-ink: oklch(94% 0.014 88);
  --color-ink: oklch(94% 0.014 88);
  --color-ink-2: oklch(82% 0.016 88);
  --color-muted: oklch(70% 0.014 88);
  --color-rule: oklch(40% 0.02 248);
  --color-accent: oklch(80% 0.14 85);
  --color-accent-ink: oklch(16% 0.028 252);
  --color-focus-paper: oklch(86% 0.15 92);
  --color-focus-ink: oklch(43% 0.2 258);
  --color-vellum-paper: oklch(95.5% 0.013 88);
  --color-vellum-paper-2: oklch(91% 0.018 88);
  --color-vellum-ink: oklch(17% 0.028 252);
  --color-vellum-ink-2: oklch(34% 0.03 252);
  --color-vellum-muted: oklch(44% 0.024 252);
  --color-vellum-rule: oklch(72% 0.018 250);
  --color-vellum-accent: oklch(45% 0.18 258);
  --color-vellum-accent-ink: oklch(95.5% 0.013 88);
  --font-display: "Libre Baskerville", Georgia, serif;
  --font-body: "Instrument Sans", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "Courier New", monospace;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-32: 8rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(20% 0.028 252);
  --color-paper-2: oklch(26% 0.02 244);
  --color-paper-3: oklch(13% 0.03 258);
  --color-ink: oklch(94% 0.014 88);
  --color-ink-2: oklch(82% 0.016 88);
  --color-muted: oklch(70% 0.014 88);
  --color-rule: oklch(40% 0.02 248);
  --color-accent: oklch(80% 0.14 85);
  --color-vellum-paper: oklch(95.5% 0.013 88);
  --color-vellum-ink: oklch(17% 0.028 252);
  --color-vellum-accent: oklch(45% 0.18 258);
  --font-display: "Libre Baskerville", Georgia, serif;
  --font-body: "Instrument Sans", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "Courier New", monospace;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  --spacing-24: 6rem;
  --spacing-32: 8rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(20% 0.028 252)", "$type": "color" },
    "paper-2": { "$value": "oklch(26% 0.02 244)", "$type": "color" },
    "paper-3": { "$value": "oklch(13% 0.03 258)", "$type": "color" },
    "paper-3-ink": { "$value": "oklch(94% 0.014 88)", "$type": "color" },
    "ink": { "$value": "oklch(94% 0.014 88)", "$type": "color" },
    "ink-2": { "$value": "oklch(82% 0.016 88)", "$type": "color" },
    "muted": { "$value": "oklch(70% 0.014 88)", "$type": "color" },
    "rule": { "$value": "oklch(40% 0.02 248)", "$type": "color" },
    "accent": { "$value": "oklch(80% 0.14 85)", "$type": "color" },
    "accent-ink": { "$value": "oklch(16% 0.028 252)", "$type": "color" },
    "focus-paper": { "$value": "oklch(86% 0.15 92)", "$type": "color" },
    "focus-ink": { "$value": "oklch(43% 0.2 258)", "$type": "color" },
    "vellum-paper": { "$value": "oklch(95.5% 0.013 88)", "$type": "color" },
    "vellum-paper-2": { "$value": "oklch(91% 0.018 88)", "$type": "color" },
    "vellum-ink": { "$value": "oklch(17% 0.028 252)", "$type": "color" },
    "vellum-ink-2": { "$value": "oklch(34% 0.03 252)", "$type": "color" },
    "vellum-muted": { "$value": "oklch(44% 0.024 252)", "$type": "color" },
    "vellum-rule": { "$value": "oklch(72% 0.018 250)", "$type": "color" },
    "vellum-accent": { "$value": "oklch(45% 0.18 258)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Libre Baskerville, Georgia, serif", "$type": "fontFamily" },
    "body": { "$value": "Instrument Sans, Arial, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "IBM Plex Mono, Courier New, monospace", "$type": "fontFamily" }
  },
  "space": {
    "1": { "$value": "0.25rem", "$type": "dimension" },
    "2": { "$value": "0.5rem", "$type": "dimension" },
    "3": { "$value": "0.75rem", "$type": "dimension" },
    "4": { "$value": "1rem", "$type": "dimension" },
    "6": { "$value": "1.5rem", "$type": "dimension" },
    "8": { "$value": "2rem", "$type": "dimension" },
    "12": { "$value": "3rem", "$type": "dimension" },
    "16": { "$value": "4rem", "$type": "dimension" },
    "24": { "$value": "6rem", "$type": "dimension" },
    "32": { "$value": "8rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 20% 0.028 252;
  --foreground: 94% 0.014 88;
  --card: 26% 0.02 244;
  --card-foreground: 94% 0.014 88;
  --popover: 26% 0.02 244;
  --popover-foreground: 94% 0.014 88;
  --primary: 80% 0.14 85;
  --primary-foreground: 16% 0.028 252;
  --secondary: 26% 0.02 244;
  --secondary-foreground: 82% 0.016 88;
  --muted: 40% 0.02 248;
  --muted-foreground: 70% 0.014 88;
  --accent: 80% 0.14 85;
  --accent-foreground: 16% 0.028 252;
  --destructive: 82% 0.12 25;
  --destructive-foreground: 29% 0.065 25;
  --border: 40% 0.02 248;
  --input: 40% 0.02 248;
  --ring: 86% 0.15 92;
  --radius: 2px;
}
```
