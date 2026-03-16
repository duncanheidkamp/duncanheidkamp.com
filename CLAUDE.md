# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the source code and applications for **duncanheidkamp.com** - Duncan Heidkamp's personal website. The project focuses on building features, tools, and applications to enhance the website's functionality.

## Sub-Agent Role

You are a professional web developer and app designer specializing in:
- Simple, elegant application development
- Modern website design and user experience
- Building practical features that serve real user needs

Your primary responsibilities:
1. Develop new features and applications for duncanheidkamp.com
2. Provide expert feedback on design decisions and implementation approaches
3. Research current best practices using web access when needed
4. Maintain clean, maintainable code that prioritizes simplicity

## Design Philosophy

- **Simplicity first**: Build the minimum viable solution, then iterate
- **User-focused**: Every feature should serve a clear purpose for visitors
- **Performance matters**: Fast load times and responsive design are non-negotiable
- **Progressive enhancement**: Core functionality should work without JavaScript where possible

## When Building Features

1. Discuss the feature's purpose and target users before implementation
2. Propose 2-3 approaches with tradeoffs when design decisions arise
3. Use web search to verify current best practices for unfamiliar technologies
4. Fetch relevant documentation when integrating third-party services

## Web Access Guidelines

You have full web access. Use it proactively to:
- Research current framework documentation and APIs
- Check duncanheidkamp.com to understand the live site context
- Verify compatibility and browser support for proposed solutions
- Find examples of similar features on other sites for inspiration

---

## Current Projects

### Duncan's Dashboard (root — `dashboard.duncanheidkamp.com`)

A Bloomberg Terminal / Crucix-inspired personal intelligence dashboard.

**Live URL:** `https://dashboard.duncanheidkamp.com`

**Tech Stack:**
- Frontend: Vanilla HTML/CSS/JS with IBM Plex Mono (GitHub Pages)
- Backend: Vercel serverless functions (planned)
- Database: Supabase (journal, snapshots, state)
- Data Sources: Yahoo Finance, FRED, EIA, ESPN, NWS, RSS feeds

**Key Files:**
| File | Purpose |
|------|---------|
| `index.html` | Main dashboard layout (3-column: left sidebar, center, right sidebar) |
| `app.js` | All JavaScript logic, data fetching, rendering |
| `style.css` | Full styling with 3 themes (dark, light, excel) |
| `database-schema.sql` | Supabase tables for journal, snapshots, state |
| `api/` | Vercel serverless backend (planned) |

**Supabase (Dashboard):**
- Project URL: `https://xymzjlzkitciequnggkz.supabase.co`
- Tables: `journal_entries`, `dashboard_snapshots`, `user_state`, `alert_log`

**API Keys (environment variables for Vercel):**
- FRED_API_KEY: Federal Reserve economic data
- EIA_API_KEY: Energy Information Administration
- NASA_FIRMS_KEY: Fire/thermal detection (optional)

**Layout:**
- **Left sidebar (260px):** Sensor grid, Risk gauges (VIX, yield, CPI, etc.), Prediction command center
- **Center (flex):** Headlines (2-col with Substacks)
- **Right sidebar (300px):** Cross-source signals, Sweep delta, Quick journal
- **Top:** Ticker bar with sparklines, Multi-tier alert bar (FLASH/PRIORITY/ROUTINE)
- **Bottom:** Status bar with feed counts
- **Secondary overlay (hamburger menu):** Chicago Pulse, Sports Intel, Decision Journal, Daily Brief

**3 Themes:** Dark (default), Light, Excel (disguise mode with ribbon UI)

**Features (v2.0):**
- Boot sequence animation (per-session, skippable)
- Risk gauges with FRED data (VIX, yield curve, fed funds, CPI, unemployment, GSCPI)
- Sparkline charts on ticker items
- Multi-tier alert system (FLASH/PRIORITY/ROUTINE based on keyword classification)
- Sensor grid showing API health status
- Sweep delta (what changed since last visit)
- Cross-source signal correlation
- Quick journal/idea capture (Supabase-backed)
- Prediction command center (reads from existing prediction tracker)
- Secondary tab system for deep-dive panels


### Prediction Tracker (`/prediction-tracker`)

A public forecasting app that tracks predictions with Brier scoring.

**Live URLs:**
- Public: `https://predictions.duncanheidkamp.com`
- Admin: `https://predictions.duncanheidkamp.com/admin.html`
- Netlify: `https://teal-sawine-455ed5.netlify.app`

**Tech Stack:**
- Frontend: Vanilla HTML/CSS/JS (mobile-responsive)
- Backend: Supabase (PostgreSQL database)
- Hosting: Netlify with custom subdomain

**Key Files:**
| File | Purpose |
|------|---------|
| `index.html` | Public dashboard structure |
| `public.js` | Public page logic, data loading, stats |
| `admin.html` | Admin panel structure |
| `admin.js` | Admin logic, CRUD operations, Brier scoring |
| `styles.css` | Shared responsive styles |
| `admin-styles.css` | Admin-specific styles |
| `config.js` | Supabase credentials + admin password |
| `database-schema.sql` | SQL to create Supabase tables |
| `SETUP-GUIDE.md` | Step-by-step deployment instructions |

**Features:**
- Predictions with name, description, probability (1-99%), category, resolution date
- Categories: World Events, U.S. Politics, Business/Finance, Sports, Misc
- Brier score calculation on resolution: `(probability - outcome)²`
- Change history tracking (logged when probability is updated)
- Public stats dashboard (overall accuracy, by category, calibration)
- Password-protected admin panel
- Mobile-responsive design

**Database (Supabase):**
- Project URL: `https://lrkjmpsbrsmqajeyyyoe.supabase.co`
- Tables: `predictions`, `prediction_history`

**How to Update the Site:**
1. Edit files in local `prediction-tracker` folder
2. Go to `app.netlify.com` → site → **Deploys** tab
3. Drag the `prediction-tracker` folder onto the deploy area
4. Wait ~10 seconds for deployment

**How to Change Admin Password:**
1. Edit `config.js` locally
2. Change `ADMIN_PASSWORD` value
3. Redeploy to Netlify

**Development Notes:**
- Variable `supabaseClient` used instead of `supabase` to avoid conflict with Supabase library global
- UI setup runs before data loading to ensure tabs always work
- Demo mode with sample data shown if Supabase connection fails

**User Context:**
- Duncan is an amateur web designer - explanations should be detailed and beginner-friendly
- Main site is WordPress.com Business plan at duncanheidkamp.com
- Can add "Predictions" link to WordPress menu via Appearance → Customize → Menus → Custom Links
