# Trybe · Design guide

Read this before building or styling any UI. It covers typography, colors, themes, spacing, components, icons, layout, and copy. `AGENTS.md` covers the stack, architecture, and product rules.

The Figma file is the source of truth for how things look. When this file and Figma disagree, ask before picking one.

## Figma

- File: `https://www.figma.com/design/yR5GCWiMt5l1xueLRZGW6o/Trybe` (file key `yR5GCWiMt5l1xueLRZGW6o`)
- Pages:
  - **App Logo v1**: logo and app icon
  - **Prototype v1 · Mobile**: 390px wide screens, sections 01 to 10, plus a Components board at the bottom
  - **Prototype v1 · Desktop**: 1440px wide screens, sections 01 to 09, plus the Desktop Sidebar component
  - **Icons**: every icon component used in the app
  - **Photo library**: placeholder photos (AI-generated, for the prototype only, not for production)
- Variables: **Trybe Colors** (modes: Standard / High contrast) aliases into **Theme** (modes: Light / Dark). Text styles are named `Display/XL`, `Title/M`, `Body/S Bold`, and so on.
- If the Figma MCP is available, read the frame you're building with `get_design_context` before writing the component.

## Typography

| Role | Font | Weights | Tailwind | Used for |
|---|---|---|---|---|
| Display | **Lilita One** | 400 (only weight) | `font-display` | Screen titles, big headings, the TRYBE wordmark feel |
| Everything else | **Nunito** | 400, 600, 700, 800 | `font-sans` (default) | Body, labels, buttons, captions |

Both are loaded with `next/font/google` in `src/app/layout.tsx` as `--font-lilita` and `--font-nunito`, and mapped to `font-display` and `font-sans` in `src/app/globals.css`. Nunito is the default, so most text needs no font class.

Never use Inter, Geist, or a system font as the main face. Lilita One is for headings only. Never set body text, buttons, or anything below 20px in it.

### Type scale

| Token (Tailwind) | Size / line height | Font + weight | Figma style |
|---|---|---|---|
| `text-display-xl` | 40 / 44 | Lilita One | Display/XL |
| `text-display-l` | 28 / 32 | Lilita One | Display/L (screen titles like "Explore", "Trades") |
| `text-display-m` | 22 / 26 | Lilita One | Display/M (section and modal titles) |
| `text-title-m` | 17 / 22 | Nunito 800 | Title/M (card headings, top bar titles) |
| `text-body-m` | 15 / 21 | Nunito 400 or 700 | Body/M, Body/M Bold (buttons use 700) |
| `text-body-s` | 13 / 18 | Nunito 400 or 700 | Body/S, Body/S Bold (chips, list items) |
| `text-label-s` | 12 / 16 | Nunito 600 | Label/S (field labels, section labels in caps) |
| `text-caption` | 11 / 14 | Nunito 400 (800 for pills) | Caption (meta text, timestamps, pills) |

Section labels above groups ("YOU GET", "THEME", "PRIVACY & SAFETY") are `text-label-s`, uppercase, `text-ink-400` or `text-ink-600`.

## Colors and themes

These token names match the Figma variables.

Colors are CSS variables in `src/app/globals.css`, exposed to Tailwind with `@theme inline` (for example `--color-brand-plum: var(--brand-plum);`). **Never hardcode a hex value in a component.** Use the Tailwind classes (`bg-brand-plum`, `text-ink-600`, `border-line`) so every color switches with the theme.

There are **two independent switches** on `<html>`:

- `data-theme="light" | "dark"`: the user picks Light, Dark, or Auto. Auto follows `prefers-color-scheme`.
- `data-contrast="high"`: a separate on/off switch that works with either light or dark. Default it to on when `prefers-contrast: more`.

So there are 4 combinations, and every screen must work in all of them. Don't use Tailwind's `dark:` variant for colors, since the variables already handle it. Set the attributes in an inline script in `<head>` before first paint, so there's no flash of the wrong theme. Save the choice in `localStorage` (key `trybe-appearance`), and later in the user's profile settings.

Dark mode is still listed as an open decision in `AGENTS.md`. The dark values below are ready, but confirm before shipping the theme switcher.

| Token | Use | Light | Dark | Light + HC | Dark + HC |
|---|---|---|---|---|---|
| `brand-plum` | Primary buttons, links, active tab, selected chip | #674390 | #C7A6F2 | #4A2370 | #DCC6FF |
| `brand-plum-dark` | Button shadow, text on lavender | #4A2E6B | #E7DAFB | #2A1240 | #F4ECFF |
| `brand-lavender` | Welcome screen, profile cover | #C49CF2 | #3A2B52 | #B98AF0 | #4B3570 |
| `brand-lavender-soft` | Secondary buttons, highlights, unread rows, info notes | #F1E7FD | #2D2340 | #EADCFB | #2A1F3D |
| `brand-cream` | **Page background** | #FFF9F2 | #17131D | #FFFFFF | #000000 |
| `brand-box` | Cardboard accent from the logo | #F5B76A | #D9A15E | #E8A04C | #F5C27F |
| `brand-box-dark` | Box accent text and icons | #C38442 | #E8B97F | #7A4A12 | #FFD39A |
| `brand-box-soft` | Photo and thumbnail placeholders | #FDEBD3 | #3A2E22 | #FBE3C2 | #3D2E1A |
| `brand-blush` | Curious Mingming badge (use at 50%) | #FCB4BF | #B5707E | #F49AAA | #E89AA8 |
| `ink-900` | Headings and body text | #2B2433 | #F3EEF8 | #120B18 | #FFFFFF |
| `ink-600` | Secondary text | #5E5669 | #B8AFC4 | #3A3044 | #E6DFEE |
| `ink-400` | Placeholders, captions, inactive icons, off switches | #756D82 | #9890A4 | #5A5066 | #C4BAD0 |
| `line` | Borders and dividers | #ECE4F2 | #352D40 | #6E6679 | #A39BAE |
| `surface-white` | Cards, inputs, sheets, nav bars | #FFFFFF | #221C2A | #FFFFFF | #121014 |
| `status-success` / `-soft` | Completed, verified, safety tips | #23764A / #E2F4EA | #6BCB97 / #1E3328 | #1F6B42 / #D3EFDF | #8BE0B0 / #12301F |
| `status-warning` / `-soft` | Pending, counter offer, cash notes | #9A5D08 / #FCF0DC | #E8AE5C / #3A2E1C | #8A5300 / #FAE6C2 | #FFC870 / #3A2A10 |
| `status-danger` | Report, block, cancel, errors | #C94A4A | #F07A7A | #A32626 | #FF9A9A |
| `overlay-scrim` | Behind sheets and modals, always at 45% (`bg-overlay-scrim/45`) | #120B18 | #120B18 | #000000 | #000000 |

Rules:
- Page background is `bg-brand-cream`. Cards and inputs sit on it as `bg-surface-white`. Don't use pure `#FFFFFF` or `#000000` directly.
- Text on a `brand-plum` button is `text-surface-white` in light mode. In dark mode plum turns light lavender, so the label must flip to a dark color. Check the dark preview frames in Figma (section "Theme · Dark").
- Every text pair passes WCAG AA (4.5:1) in all 4 modes. If you add a new color pair, check it.
- User photos never change with the theme.

## Spacing, radius, shadows

- Spacing is on a 2px grid, mostly multiples of 4. Common values: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 40.
- **Mobile**: screen side padding 16px, gaps between blocks 14 to 18px.
- **Desktop**: main area padding 28px top, 40px sides.

| Token | Value | Used on |
|---|---|---|
| `rounded-chip` | 999px | Chips, pills, badges, switches, avatars |
| `rounded-input` | 14px | Inputs, search bar, text areas |
| `rounded-button` | 14px | Buttons |
| `rounded-card` | 16px | Cards, tool rows, list groups |
| `rounded-photo` | 18px | Post photos |
| `rounded-sheet` | 28px | Mobile bottom sheets (top corners only), desktop modals |
| 12px | | Icon buttons, small thumbnails, nav items |

| Shadow | Value | Used on |
|---|---|---|
| `shadow-button` | `0 3px 0 0` plum-dark | Primary button (solid "pressed" edge, no blur) |
| `shadow-button-danger` | `0 3px 0 0 #8C3333` | Red Submit report button |
| `shadow-modal` | `0 20px 60px` ink at 25% | Desktop modals |
| `shadow-dropdown` | `0 12px 40px` ink at 18% | Dropdowns, notification panel |

Cards use a 1.5px `border-line` border instead of a shadow.

## Layout and breakpoints

- Design widths: **390px** (mobile) and **1440px** (desktop). Build mobile first.
- Breakpoint `lg` = **1024px**: below it, show the mobile layout with the bottom nav. At 1024px and up, show the desktop layout with the left sidebar.
- **Mobile shell**: content, then a fixed bottom nav (86px tall including the safe area).
- **Desktop shell**: 256px left sidebar (white, right border) plus a main area.
- **Feed** is a masonry grid: 2 columns on mobile (10px gap), 5 columns on desktop (16px gap). Cards alternate tall and short photos.
- **Desktop Trades** is 3 panels: conversation list (340px), thread (fills), trade details (320px).
- **Overlays**: on mobile they're bottom sheets (top radius 28, a 40×5 handle, scrim behind). On desktop the same content is a centered modal (540 to 820px wide, radius 28, padding 28) or a dropdown (300px wide, radius 18).
- Respect `env(safe-area-inset-bottom)` on the bottom nav and sheet footers.

## Components

Build these once in `src/components/ui/` and reuse them. Names match the Figma components.

- **Button**: `variant: "primary" | "secondary" | "ghost" | "danger"`. Padding 14px × 22px, `rounded-button`, `text-body-m font-bold`. Primary is plum with a white label and `shadow-button`. Secondary is `bg-brand-lavender-soft text-brand-plum`. Ghost is `bg-surface-white border-[1.5px] border-line text-ink-900`. Danger is `bg-status-danger` with white text. Full width inside forms and sheet footers.
- **Chip**: `selected` boolean. Padding 8px × 14px, `rounded-chip`, `text-body-s font-bold`. Default is white with a line border and `text-ink-600`. Selected is plum with white text. Used for hobbies, filters, categories, and rating tags.
- **Input**: label (`text-label-s text-ink-600`) above a 52px field. White, line border 1.5px, `rounded-input`, 16px side padding. Placeholder `text-ink-400`, value `text-ink-900`. Text areas use the same look.
- **PostCard**: photo (`rounded-photo`, tall ≈ 3:4 or short ≈ 1:1), an optional "Up for trade" pill at the photo's top left (white pill, swap icon + `text-caption font-extrabold text-brand-plum`), title `text-body-s font-bold`, author row (20px avatar, `@handle` in `text-caption text-ink-600`, heart icon on the right).
- **ToolRow**: white card with a line border, `rounded-card`, 56px thumbnail (radius 12). Name `text-body-m font-bold`, meta `text-caption text-ink-600` ("Good condition · Wheels & kilns"), "Looking for: …" in `text-caption font-bold text-brand-plum`. Status pill on the right: **Trade** (lavender-soft / plum) or **Inspo** (line / ink-600).
- **StatusPill**: `text-caption font-extrabold`, padding 4px × 10px, `rounded-chip`. Pending is warning-soft / warning. Accepted is lavender-soft / plum. Completed is success-soft / success. Declined is line / ink-600.
- **LevelBadge**: pill with the custom paw at 13px plus the level name in `text-caption font-extrabold`, padding 3px × 9px. The level comes from completed trades. Use `src/components/badges/LevelBadge.tsx` and `src/components/badges/levels.ts`, which hold the names, thresholds and colors.

  | Level | Name | Trades | Background | Paw | Label |
  |---|---|---|---|---|---|
  | 1 | Curious Mingming | 0 | `brand-blush` at 50% | `brand-plum` | `ink-900` |
  | 2 | Box Peeker | 1+ | `brand-box-soft` | `brand-box-dark` | `ink-900` |
  | 3 | Alley Cat | 5+ | `brand-lavender-soft` | `brand-plum` | `ink-900` |
  | 4 | Top Cat | 15+ | `brand-lavender-soft` + 1.5px inner `brand-plum` ring | `brand-plum` | `brand-plum` |
  | 5 | Nine Lives | 30+ | `brand-plum` | `surface-white` | `surface-white` |

  Badges only ever go up, and they always show the text (never the paw alone). Keep Curious Mingming at 50% blush. At full strength, its label fails contrast in dark mode.
- **BottomNav** (mobile): 5 slots: Feed, Explore, a center **+** button (52×52, radius 18, plum, white plus icon, `shadow-button`), Trades, Profile. The active tab is a plum filled icon plus a `font-extrabold` caption. Inactive tabs are an `ink-400` outline icon plus a regular caption.
- **Sidebar** (desktop): logo, nav items (11px × 12px padding, radius 12). The active item gets a lavender-soft background and plum extrabold text. Then a full-width New post button, a "Trade safely" card at the bottom, and the account row.
- **Sheet / Modal / Dropdown**: one overlay system that renders as a bottom sheet below `lg` and as a modal or dropdown at `lg` and up. The scrim closes it. Trap focus while open and close on Escape.
- **Switch**: 46×28 track, 22px knob. On is plum, off is `ink-400`. **Radio**: 22px circle. **Checkbox**: 22px with radius 7. Checked states are plum with a white check.
- **OfferCard** (in chat): white card with a 2px `brand-lavender` border, swap icon + label in `text-label-s text-brand-plum`, terms in bold. A received counter offer shows Accept / Counter / Decline buttons.

## Icons

- Use **Phosphor Icons**: `@phosphor-icons/react`. Don't use Lucide, Heroicons, or emoji as icons.
- Default weight is **`bold`**. Use **`fill`** for active and selected states only: the active nav tab, the active sidebar item, the active Settings item.
- Sizes: 20px by default, 16 to 18px inline with small text, 22 to 24px in nav bars. Color comes from `currentColor`, so set it with text classes.
- The one custom icon is the **paw** in the level badge. Export `Icon/paw` from the Figma **Icons** page as SVG and save it as `src/components/icons/Paw.tsx`, using `currentColor`.

| Use | Phosphor |
|---|---|
| Feed / home | `House` |
| Explore / search | `MagnifyingGlass` |
| New post | `Plus` |
| Trades / chat | `ChatCircle` |
| Profile | `User` |
| Trade / swap | `ArrowsLeftRight` |
| Settings | `GearSix` |
| Filters | `SlidersHorizontal` |
| Back / next | `CaretLeft` / `CaretRight` |
| More menu | `DotsThree` |
| Safety | `ShieldCheck` |
| Report | `Flag` |
| Block | `Prohibit` |
| Location | `MapPin` |
| Notifications | `Bell` |
| Saved | `BookmarkSimple` |
| Cash top-up | `Money` |
| Tool / package | `Package` |
| Send message | `PaperPlaneTilt` |
| Appearance / contrast | `Palette` / `CircleHalf` |

The full set (46 icons) is on the Figma Icons page, named `Icon/<phosphor-name>`.

## Images

- Use `next/image` everywhere, with set aspect-ratio boxes so the layout doesn't jump.
- Every post photo needs alt text. Default to the post title, and let users edit it.
- Up to 6 photos per post, 10 MB each. Compress and resize on the client before upload. Uploads follow the architecture rules in `AGENTS.md`.
- Empty or loading photos use a `bg-brand-box-soft` block with a faded camera icon, the same as the prototype.
- The photos in the Figma Photo library are AI placeholders. Don't ship them as real listings.

### Brand art (Storm, the logo)

- Export brand art from Figma with a **transparent background**: hide the frame fill before exporting. A baked-in background shows up as a box as soon as the theme changes (cream in dark mode, lavender on a white card).
- Keep the SVG export in `public/brand/` as the source, and use a PNG generated from it in the app. The SVGs are too heavy to serve.
- File names are kebab-case: `storm-icon.svg` → `storm-icon.png`. No spaces or capitals.
- Keep text out of brand images, since baked-in text can't follow the theme. `storm-logo.png` is Storm plus the wordmark only. The tagline is real text in `src/components/auth/BrandLogo.tsx`.
- Put any background in CSS behind the image (`bg-brand-lavender`), never in the file. The app icons in `src/app/icon.tsx` and `src/app/apple-icon.tsx` add the lavender tile themselves.
- When you replace a precached image, bump the cache name in `public/sw.js` so installed apps pick up the new file.

## Motion

- Keep it small and quick: 200 to 300ms, ease-out.
- Sheets slide up, modals and dropdowns fade and scale from 98%, and switching tabs cross-fades.
- Respect `prefers-reduced-motion`: no slide or scale, opacity changes only.

## Accessibility

- WCAG AA in all 4 theme combinations. High contrast must be a real option in Settings › Appearance, not only an OS setting.
- Tap targets are at least 44×44px. Icon buttons are drawn at 40px, so give them a bigger hit area.
- Visible focus ring on everything clickable: 2px `brand-plum` outline with a 2px offset (`focus-visible` only).
- Status is never color alone. Pills and badges always have text.
- Every input has a real `<label>`. Errors appear in text below the field, not only as a red border.
- Sheets and modals trap focus, close on Escape, and return focus to the button that opened them.

## Copy and voice

- Friendly, casual, and short. Talk to the user as "you". Use contractions.
- Prefer plain words over jargon. Say "Make an offer," not "Initiate trade request."
- **Money**: show it as `PHP 1,500` to match Figma. If you switch to the ₱ sign, check that Nunito renders it.
- **Location**: only ever show a user's **city**. Never show a street, coordinates, or distance from an exact spot. Distances are measured from the city.
- **Payments**: Trybe never handles money. Any screen involving cash must say it's paid in person at the meetup. Never imply in-app payments or buyer protection.
- **Safety copy** appears before meetups (the checklist), in chats ("Keep the chat on Trybe and never send money ahead of the meetup"), and when a message asks for contact info.
- Sample data in the prototype: the signed-in user is **Storm (@stormi)**, Quezon City. Others include @kiln.and.co, @filmbyjo, and @mika.makes.

## PWA

- `src/app/manifest.ts` with `name: "Trybe"`, `theme_color: "#674390"`, `background_color: "#FFF9F2"`, and `display: "standalone"`.
- Icons come from the **App Icon** group on the Figma "App Logo v1" page, exported at 192px and 512px, plus a maskable version with padding.

## Don'ts

- Don't hardcode colors, font sizes, or radii that already exist as tokens.
- Don't use the `dark:` variant for colors. The CSS variables handle themes.
- Don't add new colors, fonts, or icon sets without updating Figma and this file.
- Don't use Lilita One for body text, buttons, or small labels.
- Don't show exact locations, and don't build anything that looks like in-app payment.
