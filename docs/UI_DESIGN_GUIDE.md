# Civic Clarity — A Reusable UI Design Guide

> A product-agnostic playbook for interfaces that should feel **institutional, exact, calm, and trustworthy** — without copying any brand's colors, logo, or wording.
>
> Distilled from the frontend design system of this repository's public-service portal (Next.js + Tailwind CSS v4). The rules below are framework-neutral; the code recipes use Tailwind because that is the reference implementation.

**Status:** Documentation only. No runtime dependency.
**Use it for:** new products, side projects, dashboards, portals, or any UI that needs the same "public institution, modern execution" feel.
**Do not copy:** brand name, logo, exact copy, exact palette, illustrations.
**Do copy:** hierarchy, spacing rhythm, contrast strategy, component anatomy, motion restraint, accessibility behavior.

---

## Contents

1. [Read this first](#1-read-this-first)
2. [The design thesis](#2-the-design-thesis)
3. [Design tokens](#3-design-tokens)
4. [Typography](#4-typography)
5. [Color usage](#5-color-usage)
6. [Layout and page shells](#6-layout-and-page-shells)
7. [Component specifications](#7-component-specifications)
8. [Signature motifs](#8-signature-motifs)
9. [Motion](#9-motion)
10. [Accessibility and responsiveness](#10-accessibility-and-responsiveness)
11. [Content and tone](#11-content-and-tone)
12. [Implementation recipe](#12-implementation-recipe)
13. [Do / Don't cheat sheet](#13-do--dont-cheat-sheet)
14. [Porting checklist](#14-porting-checklist)
15. [Appendix A — Reference values from the source UI](#15-appendix-a--reference-values-from-the-source-ui)

---

## 1. Read this first

### 1.1 What "look and feel" means here

When people say an interface "feels like" this reference, they are reacting to six things, in this order:

| Quality | What produces it |
|---|---|
| **Institutional calm** | White canvas, true-grey neutrals, generous whitespace, almost no saturation outside one accent |
| **Precision** | Small corner radii, 1px hairline borders, tiny shadows, tight but readable type |
| **Editorial hierarchy** | Weight and size do the ranking; color does not |
| **One signal color** | A single saturated accent reserved for emphasis, state, and direction |
| **Quiet confidence** | Near-black primary actions instead of loud colored buttons |
| **Restrained motion** | Short interaction transitions and one-shot entrances; nothing loops or bounces |

If you change the accent hue, the font, the logo, and every word, the UI should still feel the same. That is the test of whether you followed this guide rather than copied a skin.

### 1.2 Keep vs. replace

| Keep (structure) | Replace (identity) |
|---|---|
| White canvas + neutral ink ramp | The accent hue (orange, blue, teal, etc.) |
| One accent used sparingly | Logo, emblem, favicon |
| Near-black primary buttons | Product name and all copy |
| Small radii (2–8px) | Display font (optional) |
| 1px hairline borders + minimal shadows | Imagery, illustrations, icon style (keep stroke weight consistent) |
| Uppercase micro-labels and eyebrow labels | Locale and terminology |
| Type hierarchy via weight/size/tracking | Exact spacing if your density target differs — but keep the ratio |
| Two-shell model (public vs. operator) | Navigation labels and information architecture |
| Motion durations/easing/one-shot rule | Optional decorative motifs |

### 1.3 The ten rules (if you remember nothing else)

1. **White canvas, ink text, one accent.**
2. **Primary actions are near-black, not accent-colored.**
3. **The accent is a marker, not a surface** — eyebrows, active nav, badges, icon tiles, focus, tiny chips.
4. **Small radii, hairline borders, almost no shadow.**
5. **Hierarchy comes from weight, size, case, and tracking — not color.**
6. **Every section starts with a small uppercase eyebrow label.**
7. **Space in a 4px rhythm; sections breathe at 48–64px vertical padding.**
8. **Motion: 150ms interactions, one-shot 600ms entrances, reduced-motion safe.**
9. **Two shells: editorial public pages and a dense, sidebar-driven operator app.**
10. **Every interactive element has a visible focus state and an accessible label.**

### 1.4 Conventions used in this guide

- **"Ink"** = the neutral ramp (true grey, no blue cast).
- **"Accent"** = your single brand/action color. The reference uses a warm, high-chroma orange, but any one saturated hue works. Pick it once and keep it.
- **"Primary button"** = the near-black CTA.
- **"Accent button"** = the solid accent-colored CTA, used sparingly.
- Sizes are CSS pixels at a 100% root font size. Many values are given as a range because the reference is responsive.
- Tailwind class recipes are illustrative: keep the values, rename the tokens to fit your project.

---

## 2. The design thesis

### 2.1 Mood

**Calm, exact, civic, legible, accountable, quietly confident.**

The interface should read like a well-designed government service — not a startup landing page. It is warm enough to be human, restrained enough to be trusted with personal data and official decisions.

**Anti-mood:** neon dashboards, glassmorphism, heavy gradients, giant pills, floating cards with blurry shadows, playful bounce animations, multiple accent colors, hype-driven copy.

### 2.2 The six principles

#### Principle 1 — Clarity before decoration

Every visual element must either improve comprehension or support an action. If it does neither, remove it. Decoration is allowed only where it reinforces meaning (a dot grid behind a hero, an icon inside a status chip).

**In practice:** no background photography behind text, no ornamental dividers, no gradient text, no icon beside every heading.

#### Principle 2 — One voice of color

One saturated accent. Neutrals carry roughly 90% of the interface. The accent appears in small, intentional moments.

**In practice:** if a screen looks colorful from a distance, you have used too much accent.

#### Principle 3 — Near-black authority

Primary CTAs are near-black (`ink-950`), not the accent. The accent is reserved for direction (arrows), state (active nav), and emphasis (eyebrows, badges).

**Why:** a colored CTA on every card turns the page into a sales pitch. Black CTAs read as "official action"; the accent then feels meaningful rather than decorative.

**In practice:** one black primary action per view. A solid accent button may sit beside it only when the hierarchy is genuinely two-tier.

#### Principle 4 — Hairline structure

Edges are defined by 1px low-contrast borders, small radii, and a barely visible shadow. Cards sit on the page; they do not float above it.

**In practice:** avoid `shadow-lg`/`shadow-2xl` on content cards, avoid `rounded-2xl` on everything, avoid thick colored borders.

#### Principle 5 — Editorial hierarchy

Rank information with size, weight, case, and letter-spacing. Do not use color to rank content. A heading is dark because it is a heading, not because it is "important".

**In practice:** extrabold tight headings, bold section titles, semibold card titles, regular body, small uppercase labels. One accent eyebrow per section.

#### Principle 6 — Calm motion

Motion explains change; it never entertains. Hover states are quick, entrances are one-shot, nothing loops.

**In practice:** no infinite shimmer, no parallax, no springy buttons, no auto-playing carousels.

### 2.3 The signature inversion (read this twice)

> **Most design systems use the accent color for the primary CTA. This one does not.**
>
> The primary CTA is near-black. The accent is used *around* it — a small accent arrow chip inside the black button, accent eyebrow labels, accent active navigation, accent icon tiles, accent focus rings, and tinted accent backgrounds at 5–10% opacity.
>
> This single inversion is what makes the UI feel governmental and composed rather than promotional.

---

## 3. Design tokens

### 3.1 Token layers

Organize tokens in three layers. Components may only consume layer 2 and 3.

1. **Primitive** — raw scales: `ink-50…950`, `accent-50…950`, `success-*`, `warning-*`, `danger-*`, font families, radius scale, spacing scale.
2. **Semantic** — purpose aliases: `--color-canvas`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`, `--color-success`, etc.
3. **Component** — optional aliases: `--button-primary-bg`, `--badge-success-bg`. Keep this layer small; most components can use semantic tokens.

### 3.2 Neutral ramp ("ink")

Use a **true grey** ramp (R, G, and B close together). Avoid blue-cast "slate" neutrals if you want the institutional paper-and-ink feel. If your brand is cool, a slight cool cast is acceptable — but stay consistent across every neutral.

| Token | Role | Reference value |
|---|---|---|
| `ink-50` | App background wash, tinted panels | `#fafafa` |
| `ink-100` | Subtle fills, secondary buttons, chips | `#f4f4f5` |
| `ink-200` | Borders, dividers, hover borders | `#e4e4e7` |
| `ink-300` | Stronger borders, disabled edges | `#d4d4d8` |
| `ink-400` | Placeholder text, disabled icons | `#a1a1aa` |
| `ink-500` | Secondary text, helper copy | `#71717a` |
| `ink-600` | Body copy, inactive nav | `#52525b` |
| `ink-700` | Strong body, form labels | `#3f3f46` |
| `ink-800` | Secondary headings, dark surfaces | `#27272a` |
| `ink-900` | Primary text on light, dark buttons | `#18181b` |
| `ink-950` | Display headings, primary CTA, near-black | `#09090b` |

### 3.3 Accent ramp

Build a full 50→950 ramp from one hue. The **600** step is the signature: maximum usable chroma, used for emphasis. The **700** step is for text on tinted backgrounds. The **50** step is for tinted surfaces. The **200** step is for tinted borders.

| Token | Role |
|---|---|
| `accent-50` | Tinted surface: active nav, badge background, hero wash, icon tiles |
| `accent-100` | Tinted hover surface, selection background |
| `accent-200` | Tinted border on chips/cards |
| `accent-300` | Hover borders on feature cards |
| `accent-400` | Accent on dark surfaces, chart highlight |
| `accent-500` | Hover state for solid accent buttons |
| `accent-600` | **Signature**: solid accent buttons, focus rings, small arrow chips, eyebrow accents |
| `accent-700` | Accent text on white/tinted surfaces; eyebrow text; links |
| `accent-800` | Pressed accent text |
| `accent-900` | Accent text on very light tints (rare) |
| `accent-950` | Deep accent shadows/illustration (rare) |

**Hue guidance:** warm accents (orange, amber, vermilion) feel civic and urgent; cool accents (blue, teal, indigo) feel administrative and calm. Both work. Do not mix two accents.

### 3.4 Semantic colors

Semantic colors are separate from the accent. Use them only for meaning, never for decoration.

| Meaning | Ramp | Tinted surface formula |
|---|---|---|
| Success / resolved / approved | emerald | `bg-emerald-50 border-emerald-200 text-emerald-700` |
| Warning / pending / at risk | amber | `bg-amber-50 border-amber-200 text-amber-700` |
| Danger / overdue / rejected | rose | `bg-rose-50 border-rose-200 text-rose-700` |
| Information / neutral guidance | accent | `bg-accent-50 border-accent-200 text-accent-700` |
| Neutral / no state | ink | `bg-ink-100 border-ink-200 text-ink-700` |

**Rule:** a badge is a tinted surface + a 1px same-hue border + 700-level text. Never a saturated 600 background with white text except for a rare, high-emphasis chip.

### 3.5 Radius scale

Small radii are a core part of the feel. Halve the radii you would normally use.

| Token | Value | Use |
|---|---|---|
| `xs` | 1px | Almost nothing; hairline accents |
| `sm` | 2px | Badges, chips, tiny controls, nav links |
| `md` | 3–4px | Buttons, inputs, cards, panels, tabs |
| `lg` | 4–6px | Feature cards, content panels |
| `xl` | 6–8px | Large CTA panels, modals, toasts |
| `2xl` | 8–12px | Rare large containers only |

**Rules:** buttons and inputs use `md`; cards use `md`–`lg`; badges use `sm`; modals use `md`–`xl`. Never use fully rounded pills except for avatars, dots, and circular arrow chips.

### 3.6 Spacing rhythm

Use a 4px base scale. Stick to a small set of values:

| Context | Values |
|---|---|
| Inline gaps | 4, 6, 8, 10, 12px |
| Component padding | 12, 16, 20, 24px |
| Grid gaps | 12, 16, 24, 32px |
| Section vertical padding | 48px mobile → 64px desktop |
| Page gutters | 16px mobile → 24px tablet → 32px desktop |
| Form field spacing | 16–20px between fields |

**Rule:** if a gap is not on the scale, it is probably wrong. Use `gap-3`/`gap-4` rather than custom margins.

### 3.7 Sizing and containers

| Element | Size |
|---|---|
| Top header height | 56px |
| Button heights | 34px (sm), 40px (md), 44px (lg) |
| Input heights | 48px mobile, 40px desktop |
| Icon tiles | 32px or 40px square |
| Sidebar width | 256px expanded, 64px icon rail |
| Marketing container | 1280px max |
| Hero text block | 768px max |
| Prose block | 640–672px max |
| Dashboard content | 1152px max |
| Modal width | 896px max (large), 640px (medium), 480px (small) |
| Toast width | 384px max, `min(24rem, calc(100vw - 2rem))` |

### 3.8 Elevation

Borders do the structural work. Shadows are barely visible and only communicate interactivity or overlay.

| Level | Shadow | Use |
|---|---|---|
| Flat | none | Page sections, tinted panels |
| Resting card | `shadow-2xs` / `shadow-xs` | Cards, inputs, static buttons |
| Hover card | `shadow-sm` | Interactive cards only |
| Overlay | `shadow-lg` | Toasts |
| Modal | `shadow-xl` | Dialogs |

Never put a large shadow on a white card on a white page "for depth". The hairline border is the depth.

### 3.9 Motion tokens

| Token | Value | Use |
|---|---|---|
| `motion-fast` | 150ms | Color, border, background, icon transitions |
| `motion-base` | 200ms | Shadow transitions |
| `motion-reveal` | 600ms | One-shot entrance and scroll reveal |
| `ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances and reveals |
| `press-scale` | `0.99` | Button active press |

### 3.10 Optional density calibration

The reference sets the root font size to **120%** so every rem-based size scales up together, producing a slightly larger, more legible UI. This is a legitimate global density control, but use it deliberately:

- It scales spacing, type, and controls simultaneously.
- Test at 100%, 110%, and 120% before shipping.
- Do not combine it with arbitrary per-component scale hacks.
- If your design already has a comfortable density, keep 100%.

### 3.11 Token implementation

```css
/* globals.css — primitive tokens + theme mapping (Tailwind v4 style) */
@import "tailwindcss";

:root {
  /* Neutral ramp: true grey, no blue cast */
  --ink-50: #fafafa;
  --ink-100: #f4f4f5;
  --ink-200: #e4e4e7;
  --ink-300: #d4d4d8;
  --ink-400: #a1a1aa;
  --ink-500: #71717a;
  --ink-600: #52525b;
  --ink-700: #3f3f46;
  --ink-800: #27272a;
  --ink-900: #18181b;
  --ink-950: #09090b;

  /* Accent ramp: replace with your single hue; keep the 50→950 shape.
     The values below are the reference warm accent, shown for concreteness. */
  --accent-50: #fff7ed;
  --accent-100: #ffedd5;
  --accent-200: #fed7aa;
  --accent-300: #fdba74;
  --accent-400: #fb923c;
  --accent-500: #ff6f00;
  --accent-600: #ff5500;
  --accent-700: #e04800;
  --accent-800: #b33600;
  --accent-900: #802600;
  --accent-950: #4a1400;

  /* Geometry */
  --radius-xs: 1px;
  --radius-sm: 2px;
  --radius-md: 3px;
  --radius-lg: 4px;
  --radius-xl: 6px;
  --radius-2xl: 8px;

  /* Motion */
  --motion-fast: 150ms;
  --motion-base: 200ms;
  --motion-reveal: 600ms;
  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);

  /* Optional: global density */
  font-size: 100%; /* reference uses 120% */
}

@theme inline {
  --color-background: #ffffff;
  --color-foreground: var(--ink-900);

  --color-ink-50: var(--ink-50);
  --color-ink-100: var(--ink-100);
  --color-ink-200: var(--ink-200);
  --color-ink-300: var(--ink-300);
  --color-ink-400: var(--ink-400);
  --color-ink-500: var(--ink-500);
  --color-ink-600: var(--ink-600);
  --color-ink-700: var(--ink-700);
  --color-ink-800: var(--ink-800);
  --color-ink-900: var(--ink-900);
  --color-ink-950: var(--ink-950);

  --color-accent-50: var(--accent-50);
  --color-accent-100: var(--accent-100);
  --color-accent-200: var(--accent-200);
  --color-accent-300: var(--accent-300);
  --color-accent-400: var(--accent-400);
  --color-accent-500: var(--accent-500);
  --color-accent-600: var(--accent-600);
  --color-accent-700: var(--accent-700);
  --color-accent-800: var(--accent-800);
  --color-accent-900: var(--accent-900);
  --color-accent-950: var(--accent-950);

  --font-sans: var(--font-ui), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-mono: var(--font-code), ui-monospace, monospace;

  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  --animate-fade-up: fade-up var(--motion-reveal) var(--ease-out-soft) both;
}

body {
  background: #ffffff;
  color: var(--ink-900);
}
```

**Governance:** components should use semantic or accent/ink aliases, not raw hex values. If a new color is needed, add a token and document its role. Delete unused variants instead of leaving dead tokens.

**Checkpoint**
- [ ] Accent ramp has 11 steps and one signature 600.
- [ ] Neutrals are true grey and consistent in temperature.
- [ ] Radius scale never exceeds 12px on standard components.
- [ ] Shadow policy is written down and followed.
- [ ] No component file contains a raw hex color.

---

## 4. Typography

### 4.1 Families

- **UI sans:** one neutral, contemporary sans. Geist, Inter, Söhne, or the system UI stack all work. Avoid playful geometric faces, rounded terminals, and boutique serifs for body text.
- **Mono:** one mono for identifiers, reference numbers, step numbers, timestamps, and tabular numerals. Geist Mono, JetBrains Mono, IBM Plex Mono.
- **Display (optional):** only for the wordmark or a hero, never for UI labels. If in doubt, use the UI sans at a heavier weight.

The reference uses Geist Sans with system fallbacks and Geist Mono for IDs and numbered steps.

### 4.2 Type scale

| Role | Size | Weight | Tracking | Line-height | Color |
|---|---|---|---|---|---|
| Hero / display | 30–48px | 800 (extrabold) | tight | 1.1–1.2 | `ink-950` |
| Page title | 24–30px | 700 (bold) | tight | 1.2 | `ink-950` |
| Section title | 22–30px | 700 | tight | 1.25 | `ink-950` |
| Card / panel title | 16px | 700 | tight | 1.3 | `ink-950` |
| Sub-card title | 14px | 700 | normal | 1.4 | `ink-950` |
| Body | 14–16px | 400 | normal | 1.5–1.7 | `ink-600`–`ink-700` |
| Body strong | 14px | 600 | normal | 1.5 | `ink-800` |
| Button label | 12–14px | 500–700 | normal | 1 | white / `ink-800` |
| Supporting text | 12px | 400–500 | normal | 1.5 | `ink-500` |
| Micro-label | 10–12px | 600–700 | `tracking-wider`; uppercase | 1.2 | `ink-500`–`ink-700` |
| Eyebrow | 11–12px | 700 | `tracking-wider`; uppercase | 1.2 | `accent-700` |
| Mono chip | 11–12px | 600–700 | normal | 1 | `accent-700` on `accent-50` |

### 4.3 Typography rules

1. **Headings are never accent-colored.** They are near-black. Accent belongs to the eyebrow, not the title.
2. **Eyebrow pattern:** uppercase, 11–12px, bold, wide tracking, accent-700. One per section, directly above the title.
3. **Micro-label pattern:** uppercase, 11–12px, semibold, wide tracking, ink-500–700. Used for field labels, metadata headings, and column labels.
4. **Sentence case** for everything except eyebrow/micro labels and proper nouns.
5. **Never all-caps body text.** Uppercase is a label device only.
6. **Weight range 400–800.** Do not use 300 or 900; the contrast between body and heading should come from two to three steps, not a jump to black.
7. **Tight tracking on large headings** (`tracking-tight`), normal tracking for body, wide tracking for uppercase labels.
8. **Limit prose width** to 60–75 characters per line (`max-w-xl`/`max-w-2xl`).
9. **Numerals:** use mono and tabular figures for IDs, step numbers, money, and table values. Do not use mono for prose.
10. **Link text is a verb or a noun phrase, never "click here".**

### 4.4 Responsive type

- Hero: 30px mobile → 48px desktop.
- Page/section title: 22–24px → 30px.
- Body: 14px → 16px on large screens.
- Supporting text stays 12px; never shrink below 11px.
- Line-height increases with size; keep body at 1.5–1.7.

**Checkpoint**
- [ ] Three weights maximum per screen (plus mono).
- [ ] One eyebrow above each major section.
- [ ] Field labels are uppercase micro-labels, not sentence-case.
- [ ] No heading uses the accent color.
- [ ] Numeric identifiers use mono.

---

## 5. Color usage

### 5.1 The proportion rule

Approximate visual weight of a finished screen:

- **~85–90%** white / near-white / ink tints.
- **~8–12%** ink text, borders, dark buttons.
- **~2–5%** accent.

If you squint and the screen looks strongly colored, reduce accent usage.

### 5.2 Where the accent is allowed

- Section eyebrow labels.
- Active navigation background (`accent-50`) and text (`accent-700`).
- Small solid accent moments: arrow chip inside a black CTA, a single accent button, a tiny role chip.
- Icon tiles: `accent-50` background with `accent-700` icon.
- Badge tints: `accent-50` background, `accent-200` border, `accent-700` text.
- Focus rings.
- Links and "label →" micro-links on hover.
- Chart primary series.
- Selection background.
- Thin accent borders on hovered feature cards.

### 5.3 Where the accent is forbidden

- Large background areas (full-bleed accent sections, accent page headers).
- Body copy or headings.
- All buttons at once.
- Multiple hues competing for attention.
- Gradients across content.
- Status badges that should be semantic (success/warning/danger).
- Decorative blobs, glows, or shadows.

### 5.4 The tinted-surface formula

For any tinted chip, badge, alert, or active state:

```text
background: <hue>-50
border:     1px solid <hue>-200
text:       <hue>-700
```

Hover: background `<hue>-100`. Pressed: `<hue>-200`. On dark surfaces, invert to `<hue>-400` text and a low-opacity `<hue>-500` background.

### 5.5 State mapping

| State family | Color | Example use |
|---|---|---|
| Success / completed / resolved | emerald | "Resolved" badge, completion toast |
| Active / new / awaiting attention | accent | "Open" badge, new submission |
| Pending / in progress / medium risk | amber | "In progress", medium priority, SLA at risk |
| Danger / overdue / high priority / error | rose | "Overdue", high priority, error alert |
| Neutral / unknown / default | ink or outline | Default status, archived, low priority |

Pair every color with a label or icon. Never rely on color alone.

### 5.6 Active navigation formula

```text
active:   bg-accent-50 text-accent-700
inactive: text-ink-600
hover:    bg-ink-100/70 text-ink-950
```

The active state is a tint, not a filled accent bar. This keeps navigation quiet and lets the content lead.

### 5.7 Focus rings

- Default interactive controls: `focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white`.
- Black primary buttons: ring in `ink-500` instead of accent so the ring does not fight the button.
- Inputs: `focus:border-accent-700` plus a 3px `accent-700/20` ring.
- Never remove focus outlines without an equally visible replacement.

### 5.8 Contrast

- Body text: at least 4.5:1 against its background.
- Large text (18px+ bold): at least 3:1.
- UI boundaries and icons: at least 3:1.
- Hairline borders may be lower contrast because they are decorative, but interactive boundaries must remain perceivable.
- Orange accents on white often fail 4.5:1 for small text. Use the 700 step for text, reserve 600 for fills and rings.

### 5.9 Dark mode (optional)

The reference is light-only. If you add dark mode, preserve the same hierarchy:

```text
canvas:      ink-950
surface:     ink-900
elevated:    ink-800
border:      ink-800
text:        ink-50 / ink-100
muted text:  ink-400
accent:      accent-400 for text/icons, accent-500 for fills
```

Do not simply invert the light palette; keep one accent and preserve the 90/10 neutral ratio.

**Checkpoint**
- [ ] Accent appears in fewer than ~5% of the screen.
- [ ] No accent headings or body copy.
- [ ] Every badge uses the tinted-surface formula.
- [ ] Every focus state is visible.
- [ ] Semantic colors are used only for meaning.
- [ ] Contrast passes for body text and interactive boundaries.

---

## 6. Layout and page shells

### 6.1 Two shells, one language

The reference switches chrome based on who is using the product. Adopt this model when you have both public and operational audiences.

| | Public shell | Operator shell |
|---|---|---|
| Audience | Visitors, customers, citizens | Staff, agents, admins |
| Chrome | Sticky top header + footer | Sticky left sidebar, no top header |
| Navigation | 3–5 horizontal links | 4–8 vertical role-scoped links |
| Density | Editorial, generous | Denser, task-focused |
| Footer | Full editorial footer | None, or a minimal strip |
| Width | Marketing container 1280px | Dashboard container 1152px |

Both shells use the same tokens, the same card language, and the same type hierarchy. This is what makes the product feel coherent.

### 6.2 Public page anatomy

1. **Hero** — centered, max 768px, one clear headline, one supporting sentence, one black primary CTA, one outline secondary CTA, a trust row.
2. **Section sequence** — each section separated by a hairline border and alternating white / `ink-50/40` washes.
3. **Section header** — eyebrow → title → supporting sentence, left-aligned, max 640–768px.
4. **Content** — cards, steps, categories, data, or a split layout.
5. **Footer** — brand, link columns, contact, accountability strip.

### 6.3 Hero recipe

- Background: subtle linear gradient from `accent-50/60` to white, plus a faint dot grid.
- Dot grid: `radial-gradient(circle at 1px 1px, <accent at ~12% opacity> 1px, transparent 0)`, 24px spacing, `opacity-40`.
- Logo/emblem: 64–80px, centered, with a slight drop shadow.
- Title: 30px → 48–56px, extrabold, tight tracking, max 2 lines.
- Subtitle: 16px → 18px, `ink-600`, max 2–3 lines.
- Actions: black primary with an accent arrow chip + outline secondary; centered, wrap on mobile.
- Trust row: 3 short items with 15px icons, separated by a top border, `ink-500` text, icon colors: success/emerald, accent, ink.
- Entrance: staggered fade-up, 80ms increments.

### 6.4 Section rhythm

```text
section padding:  48px mobile → 64px desktop
section border:   border-b border-ink-100
alternation:      white → ink-50/40 → white
container:        max-w-7xl (1280px) + px-4 sm:px-6 lg:px-8
header gap:       32px between section header and content
card gap:         16px mobile → 24px desktop
```

Do not add shadows to separate sections. Use borders and background washes.

### 6.5 Grid recipes

| Content | Mobile | Tablet | Desktop |
|---|---|---|---|
| Feature/category cards | 1 col | 2 cols | 3 cols |
| KPI/stat cards | 1 col | 2 cols | 4 cols |
| Two-column text + panel | 1 col | 1 col | 1.1fr / 0.9fr |
| Footer | 1 col | 2 cols | 12-col grid (4/2/3/3) |
| Detail dialog body | 1 col | 1 col | 2 cols |
| Sidebar + content | icon rail + content | rail + content | 256px + content |

### 6.6 Breakpoints

Use mobile-first breakpoints. What changes at each:

| Breakpoint | Changes |
|---|---|
| < 640px | Single column, icon rail sidebar, 48px inputs, hamburger + drawer, 16px gutters |
| ≥ 640px | Cards go 2-up, larger titles, full sidebar labels, 40px inputs |
| ≥ 768px | Horizontal nav appears, hamburger disappears, 3-up grids begin |
| ≥ 1024px | 3–4 column grids, split layouts, modals go 2-column, page gutters 32px |
| ≥ 1280px | Wide marketing grid; no further structural change |

### 6.7 Operator page anatomy

- Page background: `ink-50/30`.
- Header block: eyebrow (accent), 30px bold title, 14px subtitle, bottom border.
- KPI strip: 4 stat cards directly under the header.
- Toolbar: filters, search, exports — placed above the data surface.
- Content: cards, tables, queues, charts in the same hairline card language.
- Actions: primary black; secondary outline; destructive rose.
- Density: tighter than public pages, but keep 16–24px padding and clear grouping.

### 6.8 Mobile rules

- Minimum supported width: 320px.
- Text inputs are 48px tall with 16px text to avoid iOS zoom.
- Sticky header 56px; drawer slides from top with 150ms.
- Sidebar collapses to a 64px icon rail below 640px.
- No horizontal data tables; use stacked cards or a scrollable region with a clear affordance.
- Buttons go full-width only in drawers, forms, and CTA panels — not in toolbars.
- Keep tap targets at least 44px.

**Checkpoint**
- [ ] Public and operator shells both exist and share the same visual language.
- [ ] Sections alternate white and a light ink wash, separated by 1px borders.
- [ ] Every section starts with an eyebrow → title → subtitle block.
- [ ] Mobile at 320px has no horizontal scroll.
- [ ] Inputs are 48px/16px on mobile.
- [ ] Sidebar collapses to an icon rail.

---

## 7. Component specifications

Each component below lists anatomy, dimensions, states, and a Tailwind recipe. Keep the shape and behavior; rename tokens as needed.

### 7.1 Button

**Anatomy:** inline-flex, centered, 8px gap, optional 14–16px icon, label.
**Base:** `rounded-md`, `font-medium`, `transition-all duration-150`, `focus-visible:ring-2 ring-offset-2`, `disabled:opacity-50 disabled:cursor-not-allowed`, `active:scale-[0.99]`.
**Sizes:** `sm` 34px high / 12px text / 12px padding; `md` 40px / 14px / 16px; `lg` 44px / 14px semibold / 20px.
**Shadow:** `shadow-xs` for solid buttons, `shadow-2xs` for outline.

| Variant | Recipe | Use |
|---|---|---|
| **Primary** | `bg-ink-950 text-white hover:bg-ink-800 active:bg-ink-950 focus-visible:ring-ink-500` | The single main action |
| **Accent** | `bg-accent-600 text-white hover:bg-accent-500 active:bg-accent-700 focus-visible:ring-accent-500` | Secondary high-emphasis action, sparingly |
| **Secondary** | `bg-ink-100 text-ink-800 hover:bg-ink-200/80 active:bg-ink-200 focus-visible:ring-ink-400` | Quiet action beside primary |
| **Outline** | `border border-ink-200 bg-white text-ink-800 shadow-2xs hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 focus-visible:ring-accent-600` | Alternative action, toolbars |
| **Ghost** | `text-accent-700 hover:bg-accent-50 active:bg-accent-100 focus-visible:ring-accent-600` | Inline/link-like actions |
| **Dark** | `bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950` | Dark surfaces |

**Do:** one primary button per view; pair icon + label with `gap-2`; use a small circular accent chip for a directional arrow inside a black CTA.
**Don't:** use accent for every button; use pill shapes; put two filled buttons side by side at equal emphasis; use low-contrast disabled styles without explanation.

### 7.2 Icon button and micro-link

- **Icon button:** 32–36px square, `rounded-sm`/`rounded-md`, icon 15–18px, `text-ink-600`, hover `bg-ink-100 text-ink-950`, focus ring.
- **Micro-link:** 12px bold, `text-accent-700`, with a trailing 12px arrow; underline on hover. Used for "open", "view all", "continue".
- **Text link:** `text-accent-700 underline underline-offset-2`; hover to `accent-800`.

### 7.3 Card

**Anatomy:** optional header (title + subtitle + action) with a bottom border, body, optional footer.
**Specs:** `rounded-md`, `border border-ink-200/80`, white, `shadow-xs`, hover `shadow-sm` only if interactive. Header `px-4 py-3.5 sm:px-6 sm:py-4.5`. Body `px-4 py-4 sm:px-6 sm:py-5`.
**Title:** 16px semibold, tight tracking, `ink-900`. **Subtitle:** 12px normal, `ink-500`.

```tsx
// Card
<div className="rounded-md border border-ink-200/80 bg-white shadow-xs transition-shadow duration-200 hover:shadow-sm">
  <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-4 py-3.5 sm:px-6 sm:py-4.5">
    <div>
      <h2 className="text-base font-semibold tracking-tight text-ink-900">{title}</h2>
      <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>
    </div>
    {action}
  </div>
  <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
</div>
```

**Do:** let the border define the card; use one level of nesting at most; align card heights in a row.
**Don't:** stack cards inside cards; use giant radii; give static cards a hover lift.

### 7.4 Badge and status chip

**Specs:** `rounded-sm`, `px-2.5 py-0.5`, 11–12px, medium weight, `tracking-wide`, optional 11–12px leading icon.
**Formula:** `bg-<hue>-50 border border-<hue>-200/70 text-<hue>-700`.

| Tone | Recipe |
|---|---|
| Accent | `bg-accent-50 text-accent-700 border-accent-200/70` |
| Dark | `bg-ink-900 text-white border-ink-900` |
| Grey | `bg-ink-100 text-ink-700 border-ink-200/60` |
| Outline | `border-ink-200 text-ink-700 bg-white shadow-2xs` |
| Success | `bg-emerald-50 text-emerald-700 border-emerald-200/70` |
| Warning | `bg-amber-50 text-amber-700 border-amber-200/70` |
| Danger | `bg-rose-50 text-rose-700 border-rose-200/70` |

**Status mapping:** resolved/closed → success; open/submitted → accent; assigned/in-progress → warning; overdue/high → danger; archived/unknown → outline.

**Do:** keep labels to 1–3 words; pair color with text; use a leading icon for SLA-critical states.
**Don't:** use saturated backgrounds for status; encode priority and status in the same chip; use more than ~6 badge tones.

### 7.5 Form fields

**Label:** 12px, semibold, uppercase, `tracking-wider`, `ink-700`; required asterisk in `accent-700`.
**Control base:** `w-full rounded-md border border-ink-200 bg-white px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs transition-all duration-150 hover:border-ink-300 focus:border-accent-700 focus:outline-none focus:ring-3 focus:ring-accent-700/20 disabled:bg-ink-50 disabled:text-ink-400`.
**Heights:** 48px mobile, 40px desktop.
**Hint:** 12px, `ink-500`, 6–8px below. **Error:** 12px, medium, `red-600`.

```tsx
<label className="block">
  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-700 sm:mb-1.5">
    {label}{required && <span className="text-accent-700"> *</span>}
  </span>
  {control}
  {hint && !error && <span className="mt-2 block text-xs text-ink-500 sm:mt-1.5">{hint}</span>}
  {error && <span className="mt-2 block text-xs font-medium text-red-600 sm:mt-1.5">{error}</span>}
</label>
```

**Do:** validate on blur and submit; place errors next to the field; keep labels above controls; use `autocomplete` and correct input types.
**Don't:** use placeholder as a label; validate on every keystroke; use 14px text on mobile; put errors only in a toast.

### 7.6 Alert

**Specs:** `rounded-md border px-4 py-3 text-xs leading-relaxed`, optional 16px icon.
**Tones:**
- Info: `border-accent-200/80 bg-accent-50/70 text-accent-900 font-medium`
- Success: `border-emerald-200 bg-emerald-50 text-emerald-900 font-medium`
- Warning: `border-amber-200 bg-amber-50 text-amber-900 font-medium`
- Error: `border-rose-200 bg-rose-50 text-rose-900 font-medium` with `role="alert"`.

Use inline alerts for persistent context; use toasts for transient confirmations. Never both for the same event.

### 7.7 Toast

**Placement:** fixed top-right, `top-4 right-4`, `z-[100]`, width `min(24rem, calc(100vw - 2rem))`, `flex-col gap-2`.
**Specs:** white card, `rounded-lg`, `border border-ink-200`, `shadow-lg`, `p-4`, 18px tone icon, 14px semibold title, 12px message, 32px dismiss icon.
**Behavior:** auto-dismiss 4.5s; cap at 4 visible; `aria-live="polite"`; error toasts use `role="alert"`; pause dismissal on hover/focus is optional but recommended.

### 7.8 Empty state

**Specs:** dashed `border-ink-200`, white, `rounded-md`, `px-6 py-12`, centered; 40px icon tile (`bg-ink-50 text-ink-400`), 14px semibold title, 12px hint, optional action.
**Rule:** an empty state must explain what the area is and what to do next — never just "No data".

### 7.9 Spinner and loading

**Specs:** 16px ring, 2px border, `border-ink-200` with `border-t-accent-700`, spinning; 12px `ink-500` label; `role="status"`.
**Rule:** never show an unlabeled spinner for more than a moment; pair it with what is loading. Do not block the whole page for a partial load.

### 7.10 Dialog / modal

**Anatomy:** overlay → centered panel → header → body → optional footer.
**Overlay:** `fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 sm:p-6`; optional `backdrop-blur-xs`.
**Panel:** `my-4 w-full max-w-4xl rounded-md border border-ink-200 bg-white shadow-xl`.
**Header:** `flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4`; a mono ID chip, status/priority chips, title (18px bold), close button (32px, `ink-400`, hover `ink-100`).
**Body:** `grid gap-6 px-6 py-5 lg:grid-cols-2`; left column details + evidence + map; right column actions + history; sections separated by 20px and micro-labels.
**Behavior:** Escape closes; overlay click closes; focus is trapped; initial focus lands inside; focus returns to the trigger; body scroll is locked; destructive actions require confirmation.
**Mobile:** panel fills width with 8–16px margins; body stacks; actions become sticky at the bottom.

### 7.11 Tabs / segmented control

**Specs:** container `flex gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1 w-fit`; tab `flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors`; active `bg-white text-accent-700 shadow-xs border border-ink-200/50`; inactive `text-ink-600 hover:text-ink-950`.
**Behavior:** `role="tablist"`, `aria-selected`, arrow-key navigation, one active tab only. Scroll horizontally on narrow screens.

### 7.12 Header and navigation

**Specs:** `sticky top-0 z-40`, 56px high, `border-b border-ink-200/80 bg-white/95 backdrop-blur-md`, `px-4 sm:px-6 lg:px-8`.
**Brand:** 32px logo + 16px extrabold wordmark; an optional 12px descriptor hides on mobile.
**Links:** 14px medium, `rounded-sm px-3 py-1.5`; active `bg-accent-50 text-accent-700`; inactive `text-ink-600`; hover `bg-ink-100/70 text-ink-950`.
**Controls:** 32px language select, notification icon button, role chip, ghost sign-in/sign-out.
**Mobile:** 20px hamburger; drawer `border-t border-ink-200 bg-white px-4 pt-3 pb-5 shadow-lg`, slide-in 150ms; close on route change.

### 7.13 Sidebar (operator shell)

**Specs:** `sticky top-0 h-screen w-16 sm:w-64 shrink-0 border-r border-ink-200 bg-white`; brand block 56px with bottom border.
**Nav:** `flex flex-col gap-1 p-2 sm:p-3`; item `flex items-center justify-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium sm:justify-start`; active `bg-accent-50 text-accent-700`; inactive `text-ink-600 hover:bg-ink-100/70 hover:text-ink-950`; icons 18px.
**Footer:** email 12px, role chip 9–10px bold uppercase with accent tint, sign-out button `bg-ink-100 rounded-md py-2 text-xs font-semibold`.
**Mobile:** hide labels, keep icons, 64px rail; keep the sign-out icon.

### 7.14 Footer

**Specs:** `border-t border-ink-100 bg-white`; main grid `grid gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8`.
**Columns:** brand 4/12 (24px logo, 14px bold wordmark, 11px semibold tagline, 12px about); quick links 2/12; services 3/12; contact 3/12.
**Column headings:** 12px semibold uppercase wide tracking `ink-700`. Links 12px `ink-500`, hover accent underline.
**Bottom strip:** `border-t border-ink-100 py-6 text-center`; accountability sentence 12px (`ink-500` with a strong label) and copyright 12px `ink-400`.

### 7.15 KPI / stat card

**Anatomy:** label row (11px uppercase semibold `ink-600` + 16px `ink-400` icon), value (24px bold tight `ink-950`), hint (11px `ink-500`).
**Tone:** default `border-ink-200/80`; success `border-emerald-200/80 bg-emerald-50/20`; danger `border-rose-200/80 bg-rose-50/20`; warning `border-amber-200/80 bg-amber-50/20`.
**Grid:** 1 / 2 / 4 columns. Keep values numeric and labels short.

### 7.16 Data surface (queue/list)

- Toolbar above the list: search input, selects (32–40px), page size, export buttons.
- Row card: mono ID chip, status/priority chips, 14px semibold title, 11px metadata, right-side SLA chip and chevron.
- Hover: `bg-ink-50`; selected: `border-accent-300 bg-accent-50/20`.
- Separators between rows instead of zebra striping.
- Pagination: outline buttons, 12px labels; always show "x–y of z".
- Empty state with explanation; loading state with labeled spinner.
- Keep 8–12 rows visible at 1080p; do not create a spreadsheet.

### 7.17 Analytics surfaces

- Charts live inside cards with a header (title, subtitle, action).
- Primary series: accent 600; comparison: `ink-300`; success/danger only for health metrics.
- Grid lines `ink-100`; axes 10–11px `ink-500`; legends 11px; no 3D, no gradients on bars.
- Limit to 4 hues per chart; use direct labels instead of legends where possible.
- KPI strip above charts; chart height 240–320px; allow horizontal scroll rather than shrinking labels.
- Export as CSV/PNG is a first-class action, placed in the page toolbar.

### 7.18 Map surfaces

- Embed the map inside a card with `rounded-md overflow-hidden`; height 320–480px.
- Active pins accent; passive pins `ink-500`; overdue/danger pins rose.
- Cluster badges: small white chip with a 1px border and accent text.
- Always pair the map with a list or summary; never make geography the only way to find data.
- Provide keyboard-accessible alternatives for map-only information.

**Checkpoint**
- [ ] Buttons: exactly one primary per view; all states covered.
- [ ] Cards: hairline border, small radius, no heavy shadow.
- [ ] Badges: tint formula, 1–3 words, semantic mapping.
- [ ] Fields: uppercase labels, 48px/16px mobile, inline errors.
- [ ] Toasts: top-right, capped, accessible.
- [ ] Modals: Escape/overlay close, focus trapped, scroll locked.
- [ ] Data surfaces: readable at a glance, not a spreadsheet.

---

## 8. Signature motifs

These repeated details are what make the UI recognizable. Use them consistently across public and operator surfaces.

1. **The eyebrow → title → subtitle triad**
   12px uppercase accent eyebrow, 24–30px bold near-black title, 14px muted supporting sentence. Every major section.

2. **Numbered mono steps**
   Steps shown as `01`, `02`, `03` in a small mono tile (`bg-ink-100 rounded-md text-xs font-bold`), occasionally accent-colored on the number itself. Instantly reads as "process".

3. **Primary CTA with an accent arrow chip**
   Black button, label, then a 20px circular `bg-accent-600` chip containing a 13px white arrow. A small, memorable signature.

4. **Icon tiles**
   32–40px square, `rounded-md`, tinted background (`accent-50` or `ink-50`), 16–20px icon. Used on features, categories, and empty states.

5. **Tinted active navigation**
   Active nav is `accent-50` background + `accent-700` text, never a solid accent bar. Quiet, legible, consistent.

6. **Hairline cards on white**
   White surface, 1px `ink-200/80` border, 3–4px radius, tiny shadow. Repeated everywhere from marketing cards to admin panels.

7. **Dot-grid hero**
   Soft accent wash + 24px dot grid behind the hero only. It adds texture without competing with the message.

8. **Actor / role chips**
   9–10px bold uppercase, tinted, with a 1–2px radius. Used to label who acts: citizen, staff, resolver, system. They serialize process ownership at a glance.

9. **The accountability strip**
   A centered footer sentence that names responsibility, followed by a muted copyright line. It signals institutional transparency.

10. **"Label →" micro-links**
    Small bold accent text with a trailing arrow, turning into an underline on hover. Used for secondary paths without adding another button.

**Rule:** motifs repeat. A motif used once is decoration; used five times, it becomes the brand.

---

## 9. Motion

### 9.1 Motion budget

| Interaction | Duration | Easing |
|---|---|---|
| Hover color/border | 150ms | ease-out |
| Shadow change | 200ms | ease-out |
| Press | 100ms + scale 0.99 | ease-out |
| Drawer open | 150ms | ease-out |
| Toast enter | 150–200ms | ease-out |
| Hero entrance | 600ms | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Scroll reveal | 600ms | same |

### 9.2 Entrance pattern

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
```

Apply `animation: fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both` to hero elements with staggered delays of 80ms, 160ms, and 320ms. Do not stagger more than four elements; do not animate every card in a grid.

### 9.3 Scroll reveal pattern

The wrapper starts at `data-reveal="pending"` (opacity 0, translateY 16px), turns to `"visible"` when it enters the viewport, transitions once, then disconnects. Threshold 0.15, rootMargin `0px 0px -8% 0px`.

```css
[data-reveal="pending"] { opacity: 0; transform: translateY(16px); }

[data-reveal="visible"] {
  opacity: 1;
  transform: none;
  transition: opacity 600ms var(--ease-out-soft), transform 600ms var(--ease-out-soft);
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-up { animation: none; }
  [data-reveal="pending"], [data-reveal="visible"] {
    opacity: 1; transform: none; transition: none;
  }
}

@media (scripting: none) {
  [data-reveal="pending"] { opacity: 1; transform: none; }
}
```

### 9.4 Motion rules

- One-shot only; no loops, shimmers, or pulsing indicators.
- No bounce, elastic, or spring physics.
- No parallax, animated gradients, or auto-playing carousels.
- Do not animate data tables, charts, or form validation.
- Content must never depend on JavaScript to become visible.
- Respect `prefers-reduced-motion` everywhere.
- Motion should never delay access to an action.

**Checkpoint**
- [ ] Reduced-motion users see all content immediately.
- [ ] No-JS users see all content immediately.
- [ ] Entrances are one-shot and under 600ms.
- [ ] No interaction transition exceeds 200ms except entrances.
- [ ] Nothing loops.

---

## 10. Accessibility and responsiveness

### 10.1 Non-negotiables

- **Focus:** every interactive element has a visible focus state. Use `focus-visible` rings; never `outline: none` without a replacement.
- **Semantics:** buttons are buttons, links are links, forms have labels, dialogs use `role="dialog"` + `aria-modal="true"`, tabs use `role="tablist"` + `aria-selected`.
- **State:** use `aria-current="page"` for active navigation, `aria-expanded` for drawers, `aria-live="polite"` for toasts, `role="alert"` for errors.
- **Labels:** icon-only buttons need `aria-label` + `title`; inputs need visible labels (placeholders are not labels).
- **Contrast:** body 4.5:1, large text 3:1, interactive boundaries 3:1.
- **Touch targets:** minimum 44×44px.
- **Mobile text:** 16px minimum inside inputs; 48px control height.
- **Keyboard:** Escape closes dialogs; focus is trapped in dialogs; tab order matches visual order; no keyboard traps outside dialogs.
- **Motion:** honor `prefers-reduced-motion`; avoid flashing content.
- **Color independence:** every status has a label or icon in addition to color.

### 10.2 Responsive matrix

Test every template at:

| Width | Focus |
|---|---|
| 320px | Single column, no overflow, 48px inputs, stacked actions |
| 375px | Mobile keyboard open, drawer behavior |
| 640px | 2-up grids, sidebar labels appear |
| 768px | Horizontal nav, 3-up grids |
| 1024px | Split layouts, 2-column dialogs, sidebar rail |
| 1280px | Wide grids, max-width containers |
| 1440px+ | No stretched text blocks; containers stay capped |

### 10.3 Localization readiness

- Use i18n keys from day one; no hardcoded strings in components.
- Allow ~30% text expansion for translations; avoid fixed-height buttons and chips.
- Keep language selectors in the header (public) and sidebar/account area (operator).
- Support RTL by using logical properties (`margin-inline`, `padding-inline`) where practical.
- Format dates, numbers, and currency with the user's locale.
- Do not bake text into images.

### 10.4 Accessibility checklist

- [ ] All controls reachable and operable by keyboard.
- [ ] Focus visible on every control in every state.
- [ ] Dialog focus trap + Escape + focus return.
- [ ] Toasts announced; errors use `role="alert"`.
- [ ] Contrast checked in both normal and hover states.
- [ ] 200% zoom does not clip content.
- [ ] Reduced-motion mode leaves all content visible.
- [ ] No information conveyed by color alone.
- [ ] Screen-reader labels on icons, maps, charts, and images.

---

## 11. Content and tone

### 11.1 Voice

**Plain, direct, calm, accountable.**

- Say what the user can do, in the order they need it.
- Use verbs first: "Register a complaint", "Track status", "Review assignment".
- Prefer short sentences and concrete nouns.
- Explain the process without marketing language.
- Use "you" sparingly; official interfaces often address the user directly but impersonally.
- Avoid exclamation marks, hype words ("revolutionary", "seamless", "AI-powered magic"), and anthropomorphic claims about AI.

### 11.2 Patterns

| Context | Pattern |
|---|---|
| Primary CTA | Verb + object ("Submit request", "Open workspace") |
| Secondary CTA | Verb + object, quieter ("View all", "Export CSV") |
| Section title | Noun phrase, 2–6 words |
| Eyebrow | Short category label ("Process", "Categories", "Transparency") |
| Field label | Noun, uppercase, no punctuation |
| Helper text | One sentence explaining why or what format |
| Error | What happened + what to do next, no blame |
| Empty state | What this area is + the next action |
| Confirmation | State the outcome, not "Success!" |
| Destructive action | Name the object and the consequence |

### 11.3 Trust markers

Place 2–4 short trust statements near the first major action. Pair each with a small icon. Examples of *types* of claims (write your own):

- Human oversight on consequential actions.
- Data protection / privacy.
- Location or identity verification.
- Audit trail / traceability.
- Response-time expectation.

Do not claim capabilities the system does not have. In decision-support products, always distinguish **recommendation** from **decision**.

### 11.4 AI / uncertainty language

If the product uses AI:

- Label outputs as *suggestions*, *estimates*, or *recommendations*; never as final decisions.
- Keep confidence scores and internal routing out of end-user surfaces; show them only to operators who can act on them.
- State uncertainty plainly when it matters ("Could not verify — needs review").
- Never fabricate certainty to make the UI feel smarter.
- Give humans an explicit override, approval, or dismissal path.

### 11.5 Avoid

- "Click here", "Learn more" as the only label.
- Jargon in primary navigation.
- Multiple names for the same object.
- Marketing adjectives in operational screens.
- Blaming users in errors.
- Generic success toasts ("Success!") without the outcome.

---

## 12. Implementation recipe

### 12.1 Suggested structure

```text
src/
  styles/
    tokens.css          # primitive + semantic tokens
    globals.css         # reset, base, motion primitives
  components/
    ui/                 # primitives: Button, Card, Badge, Field, Alert, Toast, EmptyState, Spinner, Reveal
    layout/             # PublicShell (header + footer), OperatorShell (sidebar)
    charts/             # chart wrappers in Card
    ...
  features/             # domain components built from primitives only
```

### 12.2 Build order

1. **Tokens** — ink ramp, accent ramp, semantic colors, radii, shadows, motion.
2. **Base** — body background, text color, selection, focus-visible defaults.
3. **Typography** — families, scale, eyebrow/micro-label classes.
4. **Primitives** — Button, Card, Badge, Field, Alert, Toast, EmptyState, Spinner.
5. **Shells** — public header/footer; operator sidebar; page containers.
6. **Page templates** — hero, section header, KPI strip, toolbar, detail dialog.
7. **Data surfaces** — queue rows, charts, maps, exports.
8. **Motion and fallbacks** — entrance, reveal, reduced motion, no-JS.
9. **Accessibility and responsive pass** — keyboard, contrast, 320px, zoom.
10. **Prune** — remove unused variants and one-off styles.

### 12.3 Component recipes

**Button**

```tsx
const variants = {
  primary: "bg-ink-950 text-white shadow-xs hover:bg-ink-800 active:bg-ink-950 focus-visible:ring-ink-500",
  accent: "bg-accent-600 text-white shadow-xs hover:bg-accent-500 active:bg-accent-700 focus-visible:ring-accent-500",
  secondary: "bg-ink-100 text-ink-800 hover:bg-ink-200/80 active:bg-ink-200 focus-visible:ring-ink-400",
  outline: "border border-ink-200 bg-white text-ink-800 shadow-2xs hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 focus-visible:ring-accent-600",
  ghost: "text-accent-700 hover:bg-accent-50 active:bg-accent-100 focus-visible:ring-accent-600",
};

const sizes = {
  sm: "h-8.5 px-3 text-xs font-medium",   // 34px
  md: "h-10 px-4 text-sm font-medium",    // 40px
  lg: "h-11 px-5 text-sm font-semibold",  // 44px
};

// Base:
// inline-flex items-center justify-center gap-2 rounded-md font-medium
// transition-all duration-150 focus-visible:outline-none focus-visible:ring-2
// focus-visible:ring-offset-2 focus-visible:ring-offset-white
// disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]
```

**Badge**

```tsx
const tones = {
  accent: "bg-accent-50 text-accent-700 border border-accent-200/70",
  dark: "bg-ink-900 text-white border border-ink-900",
  grey: "bg-ink-100 text-ink-700 border border-ink-200/60",
  outline: "border border-ink-200 text-ink-700 bg-white shadow-2xs",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200/70",
  warning: "bg-amber-50 text-amber-700 border border-amber-200/70",
  danger: "bg-rose-50 text-rose-700 border border-rose-200/70",
};
// Base: inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium tracking-wide
```

**Icon tile**

```tsx
// 32px / 40px square, tinted, small radius
<span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent-700">
  <Icon size={20} />
</span>
```

**Section header**

```tsx
<div className="max-w-2xl">
  <p className="text-xs font-bold uppercase tracking-wider text-accent-700">{eyebrow}</p>
  <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">{title}</h2>
  <p className="mt-2 text-sm text-ink-600">{subtitle}</p>
</div>
```

**Global selection**

```css
body {
  background: #ffffff;
  color: var(--ink-900);
}
::selection {
  background: var(--accent-100);
  color: var(--accent-900);
}
```

### 12.4 Quality gates before merging

- [ ] Tokens only; no raw colors in component files.
- [ ] One primary button per view.
- [ ] Every component has hover, focus, active, disabled, and error states where applicable.
- [ ] Keyboard-only pass through every flow.
- [ ] 320px, 768px, 1280px visual pass.
- [ ] Reduced-motion pass; no-JS pass for public pages.
- [ ] Contrast check for text and interactive boundaries.
- [ ] No unused component variants.
- [ ] Docs updated with any new tokens or exceptions.

---

## 13. Do / Don't cheat sheet

| Do | Don't |
|---|---|
| White canvas with a true-grey ink ramp | Blue-cast greys, tinted page backgrounds |
| One saturated accent | Two or three "brand" colors competing |
| Near-black primary CTA | Accent-colored primary CTA |
| Accent eyebrows, active nav, icon tiles | Accent headings, body copy, large surfaces |
| 2–4px radii on controls and cards | 16–24px radii on everything |
| 1px hairline borders | Thick borders, divider shadows |
| `shadow-2xs`/`xs` on cards | `shadow-lg`/`2xl` on content |
| Uppercase 11–12px micro-labels | All-caps body text |
| Weight/size hierarchy | Color-coded hierarchy |
| 48px section padding | 24px section padding everywhere |
| Buttons 34/40/44px | Oversized 56px marketing buttons in app screens |
| Dark text on light tints | White text on saturated badges |
| Semantic colors for meaning | Semantic colors for decoration |
| One-shot 600ms entrances | Looping animation, bounce, parallax |
| Tinted active nav | Solid accent nav bar |
| Mono for IDs and steps | Mono for prose |
| Inline field errors | Errors only in toasts |
| 16px inputs on mobile | 14px inputs that trigger iOS zoom |
| 44px touch targets | 28px icon buttons in mobile flows |
| One black + one outline action | Two filled buttons at equal emphasis |
| Empty states with next steps | "No data" dead ends |
| Explicit human override paths | AI presented as the final decision-maker |

---

## 14. Porting checklist

Use this to apply the system to a different product. Each step has a done criterion.

1. **Choose the shell model.** Decide whether you need public + operator shells, only one, or a third (e.g., customer portal). *Done when one shell is documented and the others are explicitly out of scope.*
2. **Pick the accent.** Choose one hue with a 50→950 ramp and a signature 600. *Done when text at 700 passes contrast on white and on the 50 tint.*
3. **Lock the neutral ramp.** Use true grey or a consistently cool/warm grey. *Done when no component introduces a second neutral temperature.*
4. **Define geometry.** Set radii (sm 2, md 3–4, lg 4–6, xl 6–8), border width 1px, and the shadow policy. *Done when every component references the scale.*
5. **Load two fonts.** One UI sans (400–800 weights) and one mono. *Done when font files are self-hosted or loaded with `display: swap` and fallbacks.*
6. **Write the type scale.** Map roles to size/weight/tracking/line-height/color. *Done when a developer can build a page header without asking which weight to use.*
7. **Build eight primitives.** Button, Card, Badge, Field, Alert, Toast, EmptyState, Spinner. *Done when each has all states and an accessibility check.*
8. **Build the public shell.** Sticky header, section rhythm, editorial footer. *Done when a blank page looks finished.*
9. **Build the operator shell.** Sidebar, page header, KPI strip, toolbar, data cards. *Done when a staff page feels denser but visually identical in language.*
10. **Apply the motif set.** Eyebrows, numbered steps, icon tiles, black CTA + accent chip, accountability strip. *Done when at least five motifs repeat across three screens.*
11. **Add motion and fallbacks.** Entrance + reveal + reduced-motion + no-JS. *Done when content is visible with JavaScript disabled.*
12. **Run the accessibility pass.** Keyboard, focus, contrast, 200% zoom, 320px, screen reader labels. *Done when the checklist in §10.4 is green.*
13. **Run a visual consistency pass.** One primary per view, no raw colors, no unused variants. *Done when a new contributor can point every element to a token or a rule.*
14. **Document deviations.** If you intentionally break a rule, write it down with the reason. *Done when the exceptions list is current.*

---

## 15. Appendix A — Reference values from the source UI

These values reproduce the reference feel. **Replace the accent ramp with your brand; keep the neutral, radius, spacing, and behavior relationships.**

### A.1 Color

```text
Canvas:          #ffffff
Primary text:    #18181b (ink-900)
Display text:    #09090b (ink-950)
Selection:       accent-100 background / accent-900 text

Ink ramp:
50  #fafafa    100 #f4f4f5    200 #e4e4e7    300 #d4d4d8
400 #a1a1aa    500 #71717a    600 #52525b    700 #3f3f46
800 #27272a    900 #18181b    950 #09090b

Reference accent ramp (warm orange — replace):
50  #fff7ed    100 #ffedd5    200 #fed7aa    300 #fdba74
400 #fb923c    500 #ff6f00    600 #ff5500    700 #e04800
800 #b33600    900 #802600    950 #4a1400
```

### A.2 Geometry

```text
Radius: xs 1px, sm 2px, md 3px, lg 4px, xl 6px, 2xl 8px
Borders: 1px; card border ink-200 at ~80% opacity
Shadows: cards shadow-xs, inputs/buttons shadow-2xs, hover shadow-sm,
         toasts shadow-lg, modals shadow-xl
```

### A.3 Typography

```text
UI:   Geist Sans (fallback system-ui, -apple-system, Segoe UI, Roboto, Arial)
Mono: Geist Mono (fallback ui-monospace)
Root font-size: 120% (optional density calibration)
Hero: 30px → 48–56px, extrabold, tracking-tight
Section title: 24px → 30px, bold, tracking-tight
Card title: 16px semibold
Body: 14px → 16px, ink-600
Micro-label: 11–12px, semibold, uppercase, tracking-wider
Eyebrow: 11–12px, bold, uppercase, tracking-wider, accent-700
```

### A.4 Layout

```text
Header: 56px, sticky, white/95 + backdrop blur, border-b
Public container: 1280px
Hero text: 768px
Prose: 640–672px
Operator container: 1152px
Modal: 896px max
Sidebar: 256px expanded / 64px rail
Section padding: 48px → 64px
Page gutters: 16 / 24 / 32px
```

### A.5 Component sizes

```text
Buttons: 34 / 40 / 44px high; radii md; gap 8px
Inputs: 48px mobile / 40px desktop; radius md; px 14px
Badges: radius sm; px 10px; py 2px; text 11–12px
Icon tiles: 32 / 40px square; radius md; icon 16–20px
Toast: top-right; width min(24rem, 100vw - 2rem); shadow-lg
Dialog: overlay ink-950/50; panel radius md; header px 24 py 16;
        body px 24 py 20; two columns at lg
```

### A.6 Motion

```text
Interaction: 150ms
Shadow: 200ms
Entrance/reveal: 600ms cubic-bezier(0.22, 1, 0.36, 1)
Press: scale 0.99
Reveal: 16px rise, threshold 0.15, rootMargin -8%
Entrance: 14px rise, stagger 80 / 160 / 320ms, one-shot
```

---

*End of guide. If you add a rule, add the reason. If you break a rule, document the exception. Consistency is the brand.*
