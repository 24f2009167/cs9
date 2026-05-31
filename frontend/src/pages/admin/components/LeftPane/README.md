# AdminLeftPane

Left sidebar navigation for the admin panel. Shows project branding at top, nav items, and an admin workspace badge at the bottom.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentView` | `string` | ✅ | The active view id — highlights the corresponding nav button |
| `onNavigate` | `fn` | ✅ | Called with view `id` string when a nav item is clicked |

## Navigation Items

Items are defined as a static array — order matters for display:

| `id` | Label | Icon |
|------|-------|------|
| `dashboard` | Dashboard | `LayoutGrid` |
| `queriesManagement` | Queries | `MessageSquare` |
| `sparkLeaderboard` | Spark | `Zap` |
| `faqManagement` | FAQ | `Settings` |

Clicking any item calls `onNavigate(id)` — `AdminHome` uses this to set `currentAdminView`.

## Branding Header

Top section reads from `__PROJECT_NAME__` and `__PROJECT_TAGLINE__` globals (injected at build time). Clicking it navigates to the `dashboard` view.

## Active State

The active nav item gets:
- `border-r-2 border-[#8c6a40]` (right border accent)
- `bg-[#8c6a40]/10` (tinted background)
- `font-semibold text-[#8c6a40]` (brand color text)

Non-active items: `text-[#444748]` with hover `hover:bg-[#8c6a40]/10 hover:text-[#8c6a40]`.

## Responsive

Hidden on mobile (`hidden md:flex`). The mobile equivalent is not in this component — likely handled by an overlay or bottom nav not yet implemented.