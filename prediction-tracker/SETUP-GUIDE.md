# Prediction Tracker Setup Guide

This guide walks you through setting up your prediction tracker step-by-step. You don't need any coding experience - just follow along carefully.

**Time needed:** About 30-45 minutes

---

## What You'll Set Up

1. **Supabase** - A free database that stores your predictions (so they sync across devices)
2. **Netlify** - A free web host that puts your app on the internet
3. **Subdomain** - `predictions.duncanheidkamp.com` pointing to your app

---

## Step 1: Create a Supabase Account

Supabase is where your predictions will be stored. It's free for small projects.

### 1.1 Sign Up

1. Open your browser and go to: **https://supabase.com**
2. Click the **"Start your project"** button (green button, top right)
3. Click **"Sign up with GitHub"** (easiest) or use email
   - If using GitHub: Click "Authorize Supabase"
   - If using email: Enter your email, create a password, then check your email for verification link

### 1.2 Create a New Project

1. After signing in, click **"New Project"**
2. Fill in the form:
   - **Organization:** Select your organization (or create one if prompted)
   - **Project name:** `prediction-tracker`
   - **Database password:** Create a strong password
     - **IMPORTANT:** Write this password down somewhere safe! You won't need it for this setup, but you might need it later.
   - **Region:** Choose the one closest to you (e.g., "East US" if you're on the East Coast)
3. Click **"Create new project"**
4. **Wait 2-3 minutes** while Supabase sets up your database (you'll see a loading screen)

---

## Step 2: Create the Database Tables

Now we'll create the tables that store your predictions.

### 2.1 Open the SQL Editor

1. In your Supabase dashboard, look at the left sidebar
2. Click **"SQL Editor"** (it has a `>_` icon)
3. Click **"New query"** (top left, blue button)

### 2.2 Run the Database Setup

1. Open the file `database-schema.sql` from your prediction-tracker folder
2. **Copy ALL the text** from that file (Ctrl+A to select all, then Ctrl+C to copy)
3. Go back to your Supabase browser tab
4. **Paste** the text into the SQL Editor (Ctrl+V)
5. Click the **"Run"** button (or press Ctrl+Enter)
6. You should see: **"Success. No rows returned"**
   - This means it worked! The tables are created.

### 2.3 Verify It Worked

1. Click **"Table Editor"** in the left sidebar
2. You should see two tables listed:
   - `predictions`
   - `prediction_history`
3. If you see both, your database is ready!

---

## Step 3: Get Your Supabase Keys

You need two pieces of information from Supabase to connect your app.

### 3.1 Find Your Keys

1. Click **"Project Settings"** in the left sidebar (gear icon at the bottom)
2. Click **"API"** in the settings menu
3. You'll see a page with your project information

### 3.2 Copy Your Keys

You need these two values:

**1. Project URL**
- Look for "Project URL"
- It looks like: `https://abcdefghijk.supabase.co`
- Click the **copy button** next to it

**2. Anon Public Key**
- Look for "Project API keys"
- Find the one labeled **"anon public"**
- It's a long string starting with `eyJ...`
- Click the **copy button** next to it

**Keep this browser tab open** - you'll need to copy these values in the next step.

---

## Step 4: Configure Your App

Now you'll add your Supabase keys to your app.

### 4.1 Open config.js

1. Go to your `prediction-tracker` folder on your computer
2. Find the file called `config.js`
3. **Right-click** on it and choose **"Open with"** → **"Notepad"** (or any text editor)

### 4.2 Add Your Supabase Keys

1. Find this line (around line 19):
   ```
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   ```
2. Replace `YOUR_SUPABASE_URL` with your actual Project URL from Supabase
   - Make sure to keep the quotes!
   - Example: `const SUPABASE_URL = 'https://abcdefghijk.supabase.co';`

3. Find this line (around line 20):
   ```
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
   ```
4. Replace `YOUR_ANON_KEY` with your actual anon public key from Supabase
   - Example: `const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';`

### 4.3 Set Your Admin Password

1. Find this line (around line 24):
   ```
   const ADMIN_PASSWORD = 'CHANGE_THIS_PASSWORD';
   ```
2. Replace `CHANGE_THIS_PASSWORD` with a password you'll remember
   - This is what you'll use to log into the admin page
   - Make it at least 8 characters
   - Example: `const ADMIN_PASSWORD = 'MySecretPassword123';`

### 4.4 Save the File

1. Press **Ctrl+S** to save
2. Close Notepad

---

## Step 5: Test Locally

Before putting it online, let's make sure it works on your computer.

### 5.1 Test the Public Page

1. Go to your `prediction-tracker` folder
2. **Double-click** on `index.html`
3. It should open in your web browser
4. You should see "Duncan's Predictions" with tabs for Active, Resolved, Stats, and About
5. If you see "Demo Mode" at the top, that's OK for now - it means Supabase connection is working but there's no data yet

### 5.2 Test the Admin Page

1. Go back to your `prediction-tracker` folder
2. **Double-click** on `admin.html`
3. You should see a login screen
4. Enter the password you set in step 4.3
5. You should see the Admin Panel with tabs for Add New, Manage, and Resolve

### 5.3 Add a Test Prediction

1. In the Admin Panel, make sure you're on the "Add New" tab
2. Fill in:
   - **Name:** Test Prediction
   - **Description:** This is a test
   - **Probability:** 50
   - **Category:** Misc
   - **Resolution Date:** Pick any future date
3. Click "Add Prediction"
4. You should see "Prediction added successfully!"

### 5.4 Verify It Saved

1. Go back to Supabase in your browser
2. Click "Table Editor" in the left sidebar
3. Click on the "predictions" table
4. You should see your test prediction in the table!

If you see it, everything is working. Now let's put it online!

---

## Step 6: Deploy to Netlify

Netlify will host your app on the internet for free.

### 6.1 Create a Netlify Account

1. Go to: **https://app.netlify.com**
2. Click **"Sign up"**
3. Click **"Sign up with GitHub"** (or email)
4. Authorize Netlify if prompted

### 6.2 Deploy Your App

**Option A: Drag and Drop (Easiest)**

1. Go to: **https://app.netlify.com/drop**
2. Open your `prediction-tracker` folder in File Explorer
3. **Drag the entire folder** onto the Netlify page (where it says "Drag and drop your site")
4. Wait for the upload (10-30 seconds)
5. You'll get a URL like: `random-name-123456.netlify.app`

**Option B: Through Netlify Dashboard**

1. On Netlify, click **"Add new site"** → **"Deploy manually"**
2. Drag your `prediction-tracker` folder to the upload area
3. Wait for deployment

### 6.3 Test Your Live Site

1. Click on the URL Netlify gave you (e.g., `random-name-123456.netlify.app`)
2. Your public prediction tracker should appear!
3. Try `your-url.netlify.app/admin.html` to access the admin page

---

## Step 7: Set Up Your Subdomain (Optional but Recommended)

Make your tracker accessible at `predictions.duncanheidkamp.com`.

### 7.1 Get Your Netlify Site Name

1. In Netlify, click **"Site configuration"** (or "Site settings")
2. Under "Site information", you'll see your site name
3. You can click **"Change site name"** to pick something memorable (e.g., `duncan-predictions`)

### 7.2 Add Custom Domain in Netlify

1. In Netlify, go to **"Domain management"** (in Site settings)
2. Click **"Add a domain"**
3. Enter: `predictions.duncanheidkamp.com`
4. Click **"Verify"** then **"Add domain"**
5. Netlify will show you DNS settings - **keep this page open**

### 7.3 Update DNS at Your Domain Provider

Since you have WordPress.com Business, your DNS is likely managed by WordPress or your domain registrar.

**If your domain is registered with WordPress.com:**

1. Go to your WordPress.com dashboard
2. Go to **Upgrades** → **Domains**
3. Click on `duncanheidkamp.com`
4. Click **"DNS Records"** or **"Name Servers"**
5. Add a new **CNAME record**:
   - **Name/Host:** `predictions`
   - **Points to/Value:** Your Netlify site URL (e.g., `duncan-predictions.netlify.app`)
   - **TTL:** Leave default or set to 3600
6. Save the record

**If your domain is registered elsewhere (GoDaddy, Namecheap, etc.):**

1. Log into your domain registrar
2. Find DNS settings for `duncanheidkamp.com`
3. Add a **CNAME record**:
   - **Host:** `predictions`
   - **Points to:** Your Netlify site URL (without https://)
   - **TTL:** 3600 (or leave default)

### 7.4 Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to take effect
- Usually it's within 30 minutes
- You can check if it's working by visiting `predictions.duncanheidkamp.com`

### 7.5 Enable HTTPS

1. Go back to Netlify → Domain management
2. Scroll down to **"HTTPS"**
3. Click **"Verify DNS configuration"**
4. Once verified, click **"Provision certificate"**
5. Wait a few minutes for the SSL certificate

---

## You're Done! 🎉

Your prediction tracker is now live at:
- **Public view:** `predictions.duncanheidkamp.com`
- **Admin page:** `predictions.duncanheidkamp.com/admin.html`

### What to Do Next

1. **Delete the test prediction** you created earlier (in Admin → Manage)
2. **Add your first real prediction!**
3. **Link to it from your main site** - add a menu item in WordPress pointing to your predictions subdomain

---

## Troubleshooting

### "Demo Mode" message on public page
- Your Supabase URL or key in `config.js` is incorrect
- Double-check you copied them correctly (no extra spaces)

### Can't log into admin
- Make sure your password in `config.js` is at least 8 characters
- Password is case-sensitive

### Predictions not saving
- Check Supabase dashboard → Table Editor to see if rows appear
- Look at browser console (F12 → Console tab) for error messages

### Subdomain not working
- DNS changes can take up to 48 hours
- Make sure you added a CNAME record, not an A record
- The CNAME should point to `your-site.netlify.app` (without https://)

### Need to update the site?
1. Make changes to your local files
2. In Netlify, go to **Deploys**
3. Drag your updated `prediction-tracker` folder to the deploy area
4. Your site will update in seconds

---

## Files Reference

| File | Purpose |
|------|---------|
| `index.html` | Public dashboard - what visitors see |
| `admin.html` | Admin page - where you add/edit predictions |
| `styles.css` | Visual styling (shared by both pages) |
| `admin-styles.css` | Extra styles for admin page only |
| `config.js` | Your Supabase keys and admin password |
| `public.js` | Code for the public page |
| `admin.js` | Code for the admin page |
| `database-schema.sql` | SQL to create database tables |

---

## Need Help?

If you get stuck, you can:
1. Re-read the relevant step carefully
2. Check the Troubleshooting section above
3. Ask me for help with the specific error you're seeing
