# Rogāre — Design System & UI Guide

Single source of truth for **visual design** in the frontend. For architectural
conventions (component patterns, state, routing, services) see [CONTEXT.md](../CONTEXT.md);
for the file map see [FILESTRUCTURE.md](./FILESTRUCTURE.md).

App: **Rogāre** — an internship FAQ / Q&A platform. Warm, editorial, document-like
aesthetic. Serif display headings over a clean sans body, with a single brown
brand accent.

---

## 1. Design Principles

- **Editorial, not corporate.** Playfair Display headings give an articulate,
  document-like feel; Inter keeps the body clean and legible.
- **One accent, used sparingly.** Brown `#8c6a40` is the only brand color. Black
  is the primary action color. Avoid introducing new hues outside the token set.
- **Semantic tokens, never raw hex (in markup).** Components consume CSS-variable
  tokens via Tailwind utilities (`bg-bg-card`, `text-text-primary`). This is what
  makes dark mode work — see §3.
- **Quiet surfaces, soft depth.** Cards use `1px` borders + subtle hover shadow
  rather than heavy drop shadows. Rounded corners throughout (`rounded-lg` /
  `rounded-xl`).
- **Restraint in motion.** `transition` on hover/active states only; no elaborate
  animation.

---

## 2. Color Tokens

Defined in [src/index.css](./src/index.css) under `@theme` (light) and `.dark`
(dark override). **Always use the Tailwind utility, not the hex.**

| Token (utility)        | Light      | Dark       | Use |
|------------------------|------------|------------|-----|
| `bg-bg-primary`        | `#f3f4f6`  | `#121418`  | Page background |
| `bg-bg-secondary`      | `#ffffff`  | `#1a1d23`  | Raised surfaces / panels |
| `bg-bg-tertiary`       | `#edeeef`  | `#22262e`  | Insets, subtle fills |
| `bg-bg-card`           | `#ffffff`  | `#1e2128`  | Cards |
| `text-text-primary`    | `#191c1d`  | `#e8eaed`  | Headings, primary text |
| `text-text-secondary`  | `#444748`  | `#9aa0a6`  | Body text |
| `text-text-muted`      | `#747878`  | `#6b7280`  | Meta, captions, labels |
| `border-border`        | `#c4c7c7`  | `#3c4043`  | Default borders |
| `border-border-light`  | `#e5e7eb`  | `#2d3139`  | Hairline dividers |
| `bg-brand` / `text-brand` | `#8c6a40` | `#a0876a` | **Brand accent** — active states, accents |
| `…-brand-hover`        | `#7a5c35`  | `#8c7355`  | Brand hover |
| `bg-hover-bg`          | `#edeeef`  | `#2a2e38`  | Row/item hover |
| `…-danger`             | `#dc2626`  | `#f87171`  | Errors, destructive |
| `…-success`            | `#16a34a`  | `#4ade80`  | Success, resolved |
| `…-info`               | `#2563eb`  | `#60a5fa`  | Informational |
| `…-warning`            | `#b45309`  | `#fbbf24`  | Warnings |

> ⚠ **The dark palette is a signed-off, locked design.** Do not drift the dark
> swatches without sign-off — every dark surface derives from them.

**Status colors** (live in [pages/user/constants.js](./src/pages/user/constants.js)
`STATUS_CONFIG`): Active `#8c6a40`, In Progress `#4b5563`, Resolved `#16a34a`.
Tags use a deterministic 8-color palette via `styleForTag(tag)` (hash → palette
index), so a given tag string always renders the same color.

---

## 3. Dark Mode

- Driven by a **`.dark` class** toggled on `<body>` and the layout wrapper.
- The class swaps the same `--color-*` vars, so every utility (`bg-bg-card`,
  `text-text-primary`, …) re-resolves automatically. **No per-component dark:
  variants needed** for tokenized colors.
- Preference lives in [useThemeStore](./src/store/useThemeStore.js) (Zustand,
  persisted to `localStorage` key `rogare-theme`), shared across user + admin.
- Tailwind v4 dark variant is registered in index.css:
  `@custom-variant dark (&:where(.dark, .dark *))` — use `dark:` only for things
  that can't be expressed as a token swap.

---

## 4. Typography

Fonts loaded via Google Fonts in [index.css](./src/index.css).

| Role | Family | How |
|------|--------|-----|
| Display / headings | **Playfair Display** (serif) | `font-display` class |
| Body / UI | **Inter** (sans) | default (`--font-sans`) |

**Type scale** (match across the app — pixel values, not Tailwind steps):

| Size | Use |
|------|-----|
| `text-[18px]` | Card titles / section headings (`font-display font-semibold`) |
| `text-[15px]` | Sub-headings |
| `text-[14px]` | Primary buttons |
| `text-[13px]` | Body text, secondary buttons |
| `text-[12px]` | Meta, counts, inline actions |
| `text-[10px]`–`text-[11px]` | Tags, labels, ALL-CAPS captions |

Body copy uses comfortable line height (`leading-6`). Headings are
`font-semibold`; rely on the serif for character, not heavy weights.

---

## 5. Shape, Spacing & Elevation

- **Radius:** `rounded-lg` (buttons, inputs, small surfaces), `rounded-xl` (cards),
  `rounded` (tags).
- **Borders:** `1px` `border-border`; hairlines use `border-border-light`.
- **Elevation:** prefer border + `hover:shadow-sm` over large shadows. Cards lift
  on hover by switching border to `border-brand`.
- **Card padding:** `p-5` typical.
- **Vertical rhythm:** `mb-4` between cards; `gap-2`/`gap-5` for inline clusters.
- **Icon-button hit area:** keep min sizes generous (e.g. upvote is `60×60`).

---

## 6. Iconography

From **lucide-react**. Keep **`strokeWidth={1.8}`** for UI icons (`2` for the
emphasized upvote chevron). Common sizes: `h-3.5 w-3.5` inline, `h-6 w-6` prominent.

| Icon | Usage | Icon | Usage |
|------|-------|------|-------|
| `ChevronUp` | Upvote | `Bell` / `BellRing` | Notifications |
| `MessageCircle` | Comment / reply count | `Sun` / `Moon` | Dark-mode toggle |
| `Reply` | Reply / view action | `PanelLeft` / `PanelLeftClose` | Sidebar collapse |
| `Flag` | Report | `TrendingUp` | FAQ categories |
| `Search` | Search modal | `LinkIcon` | Contributions |
| `CheckCircle` / `Clock` | Status indicators | `LogOut` / `Settings` | User menu |

---

## 7. Shared Components

Live in [src/components/](./src/components/), one folder per component, direct
imports (no barrel `index`). Each complex/shared one carries a `README.md`.

| Component | Purpose | Key props |
|-----------|---------|-----------|
| `Button` | All buttons | `variant` (`primary` \| `secondary` \| `ghost`), `onClick`, `className` |
| `Input` | Text inputs | `type`, `value`, `onChange`, `placeholder`, `className` |
| `Select` | Dropdown | `options`, `value`, `onChange`, `placeholder` |
| `Modal` | Dialog overlay | `isOpen`, `onClose`, `position` (`center` \| `top-right`), `title` |
| `NotificationModal` | Notifications panel | — |
| `Footer` | Site-wide footer | — |

### Button variants ([Button.tsx](./src/components/Button/Button.tsx))

Built on Headless UI + `tailwind-merge` (so `className` overrides cleanly).
Shared base: `inline-flex items-center justify-center font-medium transition`
plus a focus ring (`focus:ring-2 focus:ring-text-primary focus:ring-offset-2`).

- **primary** — `bg-black text-white`, `min-h-11`, `rounded-lg`, `text-[14px]`,
  hover `#2e3132`. The default call-to-action.
- **secondary** — bordered, `bg-bg-card`, `min-h-9`, `text-[13px]`; hover darkens
  border + text.
- **ghost** — text-only `text-text-muted`, hover → `text-text-primary`.

> Note: primary action color is **black**, not brand brown. Brown is reserved for
> accents/active states (active upvote, active nav, status). Keep that distinction.

---

## 8. Component Recipes

**Card** (see [QuestionCard.tsx](./src/pages/user/components/QuestionCard/QuestionCard.tsx)):
```
rounded-xl border border-border bg-bg-card p-5 transition hover:border-brand hover:shadow-sm
```

**Tag / chip:**
```
rounded bg-black px-2 py-0.5 text-[10px] font-semibold capitalize text-white
```

**Meta line:** `text-[12px] text-text-muted`, with the author name promoted to
`text-text-primary`.

**Inline action (reply/count/status):**
```
flex items-center gap-1.5 text-[12px] font-medium text-text-secondary
```

**Active/toggle state:** swap background to `#8c6a40` (brand) with white text;
inactive uses a neutral gray. (Upvote button is the canonical example.)

---

## 9. Layout & Navigation

- **SPA, no URL churn:** within the user section, switching tabs or opening a
  question detail does **not** change the URL — views swap inline. Routes are
  defined in [routes/index.jsx](./src/routes/index.jsx); auth-gated views use
  `ProtectedRoute`.
- **Layout → page communication** via React Router `useOutletContext` (Outlet
  context); parent→child via props; child→parent via callbacks.
- User and admin each have their own layout, header, and collapsible left pane.

---

## 10. Feedback & Content

- **Toasts:** use `notifyError()` / `notifySuccess()` from `lib/notify.js`. Never
  `window.alert`.
- **Raw HTML:** `dangerouslySetInnerHTML` is allowed **only** for trusted,
  DB-sourced content (e.g. FAQ answers, question descriptions). Never for user
  free-text without sanitizing.

---

## 11. Do / Don't

**Do**
- Use semantic tokens (`bg-bg-card`, `text-text-primary`) so dark mode just works.
- Match the established pixel type scale and `strokeWidth={1.8}` icons.
- Use `Button`/`Input`/`Select`/`Modal` rather than re-rolling primitives.
- Keep brown for accents, black for primary actions.

**Don't**
- Hard-code colors in markup when a token exists (the few `style={{…}}` hexes in
  legacy cards are being migrated — don't add more).
- Introduce new fonts, hues, or shadow scales without sign-off.
- Drift the locked dark palette.
- Add `index` barrel files for single-component folders.
</content>
</invoke>
