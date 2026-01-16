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
