# Cubs Opening Day 2026 Countdown

A live countdown timer to Chicago Cubs Opening Day 2026, styled in Cubs blue and red.

## How to Run

Open `index.html` in any browser. No build step, no dependencies, no server needed.

```
open index.html   # macOS
```

Or just double-click the file in Finder.

## What It Does

- Counts down days / hours / minutes / seconds to Cubs Opening Day 2026
- Ticks live via `setInterval`
- Shows a "Play Ball!" message once the target time passes
- Displays the target date and time (CT) below the countdown

## Assumed Date

**April 2, 2026 at 1:20 PM CT** — estimated Opening Day. MLB hadn't published the 2026 full schedule at build time. To update the date, change `OPENING_DAY` in the `<script>` block of `index.html`.

## Styling

- Cubs blue (`#0E3386`) background with pinstripe texture
- Cubs red (`#CC3433`) accents
- Ivy green bottom bar (Wrigley nod)
- Georgia serif font — classic ballpark feel
- Mobile-first layout
