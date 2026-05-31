# AdminHeader

Top navigation bar for the admin panel. Handles search, notifications, theme toggle, and user menu.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | `object` | ✅ | Auth user object — `{ name, role, email }` |
| `initials` | `string` | ✅ | Two-letter initials derived from `user.name` (computed in `AdminHome`) |
| `searchQuery` | `string` | ✅ | Controlled input value for the search field |
| `notifications` | `array` | | Full notification list (used for count/debug if needed) |
| `unreadCount` | `number` | ✅ | Count of unread notifications — shows red dot on bell |
| `isDark` | `boolean` | ✅ | Current dark mode state |
| `onSearchChange` | `fn` | ✅ | Called with `string` on every keystroke |
| `onSearchSubmit` | `fn` | ✅ | Called on form submit — prevents default, handles search submission |
| `onNotificationsOpen` | `fn` | | Called when bell is clicked — marks all as read in `AdminHome` |
| `onDarkToggle` | `fn` | | Toggles dark mode via `useThemeStore` |
| `onLanding` | `fn` | ✅ | Navigates to public FAQ landing page (`/`) |
| `onLogout` | `fn` | ✅ | Logs out admin, clears auth store, navigates to `/` |
| `onProfileSettings` | `fn` | ✅ | Switches `currentAdminView` to `'adminProfile'` |

## Layout

```
[ Search form (max-w-[420px]) ] [ FAQ View button ] [ Bell (unread dot) ] [ Dark toggle ] [ Avatar + Menu ]
```

## Search

Submitting the form (Enter / button click) calls `onSearchSubmit` — `AdminHome` uses this to switch to the `queriesManagement` view and pass `searchQuery` to filter that view.

## Notifications Bell

- Shows a filled red dot (`h-2 w-2 bg-red-500`) when `unreadCount > 0`
- Clicking calls `onNotificationsOpen?.()` — parent handles `markAllAdminNotificationsRead()`

## Dark Mode Toggle

- Shows `Sun` icon when `isDark` is true (indicating light mode is active)
- Shows `Moon` icon when `isDark` is false (indicating dark mode is active)

## User Menu (Headless UI Menu)

Dropdown with:
- **Profile Settings** — triggers `onProfileSettings` (switches view)
- **Logout** — triggers `onLogout`

Menu items use `data-focus` attribute for Headless UI focus styling.

## Dependencies

- `@headlessui/react` — `Menu`, `MenuButton`, `MenuItems`, `MenuItem`
- `lucide-react` — `Bell`, `LogOut`, `Moon`, `Search`, `Settings`, `Sun`