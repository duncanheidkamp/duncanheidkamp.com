# Plan: Cubs Opening Day 2026 Countdown Timer

## What
A single-page countdown timer to the Chicago Cubs' Opening Day 2026, styled with Cubs colors and identity.

## Target Date
**April 2, 2026** — assumed Opening Day for Cubs 2026 (Thursday, typical MLB opener day).
MLB announced the 2026 schedule after my knowledge cutoff, so April 2 is a reasonable assumption.
The date is a constant in the JS, easy to update if wrong.

## Stack
Plain HTML + CSS + vanilla JS. No build step, no dependencies, no npm.
Opens directly in a browser.

## Layout
- Cubs "C" logo / wordmark text at top
- Big countdown display: Days / Hours / Minutes / Seconds
- Ticking live via setInterval
- Cubs color palette: blue (#0E3386), red (#CC3433), white
- Maybe a subtle Wrigley Field vibe — brick, ivy green as accent
- Mobile-first, centered layout

## Files
- `index.html` — single self-contained file (CSS + JS inlined)
- `README.md` — brief description and run instructions
- `SUMMARY.md` — post-build notes

## Assumptions
- Opening Day = April 2, 2026 at 1:20 PM CT (standard Cubs home opener time)
- No external API needed — pure client-side timer
- If the date has passed, show "Play Ball!" message instead of countdown
