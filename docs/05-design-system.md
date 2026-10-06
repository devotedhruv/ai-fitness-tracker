# 05 - Design System Specification

## 1. Design Philosophy
- **Minimalist & Focused**: Ample whitespace, low visual clutter, one primary action per screen.
- **Single Accent Color**: High-contrast energetic Orange (`#FF7A00` dark / `#F26B00` light) reserved strictly for primary actions, active states, key numbers, progress rings, and map paths.
- **Ergonomics**: Minimum 48px tap targets on all interactive elements. Max 2 taps to start any workout or run.
- **WCAG AA Compliance**: High-contrast text on all surfaces. Accessible color contrast ratios tested.

## 2. Color Tokens

### Dark Mode (Black + Orange)
| Token | Hex Value | Usage |
|---|---|---|
| `background` | `#0A0A0A` | Screen base background |
| `surface` | `#141414` | Cards, list items, modal sheets |
| `surfaceElevated` | `#1E1E1E` | Floating headers, elevated cards |
| `border` | `#2A2A2A` | Dividers, subtle borders |
| `textPrimary` | `#F5F5F5` | Headings, primary text |
| `textSecondary` | `#A3A3A3` | Captions, labels, timestamps |
| `accent` | `#FF7A00` | Primary buttons, active tabs, PR badges, map routes |
| `accentPressed` | `#E56A00` | Button active/pressed states |
| `onAccent` | `#0A0A0A` | Text on top of accent buttons |
| `success` | `#22C55E` | Completed set checkmark, streak flame |
| `error` | `#EF4444` | Validation errors, delete action |

### Light Mode (Warm Cream + Orange)
| Token | Hex Value | Usage |
|---|---|---|
| `background` | `#FFF8EC` | Screen base background |
| `surface` | `#FFFFFF` | Cards, list items, modal sheets |
| `surfaceElevated` | `#FFF1DB` | Highlighted cards, chips |
| `border` | `#EADFCB` | Dividers, card borders |
| `textPrimary` | `#1A1A1A` | Headings, primary text |
| `textSecondary` | `#6B6459` | Captions, labels, timestamps |
| `accent` | `#F26B00` | Primary buttons, active tabs, map routes |
| `accentPressed` | `#D95F00` | Button active/pressed states |
| `onAccent` | `#FFFFFF` | Text on top of accent buttons |
| `success` | `#16A34A` | Completed set checkmark |
| `error` | `#DC2626` | Validation errors |

## 3. Typography
- Font Family: Inter / System Font.
- `headingLarge`: 28px, Bold (700), line height 34px
- `headingMedium`: 20px, Semi-Bold (600), line height 26px
- `body`: 16px, Regular (400), line height 22px
- `bodyBold`: 16px, Semi-Bold (600), line height 22px
- `caption`: 13px, Regular (400), line height 18px
- `metric`: 36px, Bold (700) monospace tabular figures for timers and live paces.

## 4. Reusable Component Library
1. **Button**: Primary (accent fill), Secondary (surface fill + border), Ghost, Danger.
2. **Card**: Surface fill, 14px border radius, subtle border.
3. **Input**: Clear border, accessible focus ring, error feedback.
4. **Chip**: Selectable filter pills for muscle groups and equipment.
5. **TabBar**: 4-tab bottom navigation with accent indicator.
6. **StatTile**: Compact key-value tile with secondary label and bold metric.
7. **BottomSheet**: Draggable modal for quick actions and rest timer.
8. **EmptyState**: Clean icon + message + call-to-action button.
9. **SkeletonLoader**: Shimmer placeholder matching card geometry.
