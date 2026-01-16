# News Dashboard Terminal

A Bloomberg Terminal-style news monitoring dashboard. Dark mode by default, dense information display, real-time updates.

## Features

- **Top Ticker Bar**: S&P 500, NASDAQ, DOW, individual stocks, BTC, WTI Oil
- **Status Indicators**: Congress session status, Chicago weather alerts
- **Sports**: Upcoming games for Cubs, Bears, Bulls, Blackhawks, IU Football/Basketball
- **Wire Feed**: AP and Reuters rolling headlines
- **Headlines**: Multi-source feed (NYT, WSJ, Atlantic, Tribune, Block Club, The Onion)
- **Substacks**: Slow Boring, Noahpinion, BIG, and more
- **Twitter/X Sidebar**: Embedded timelines for @AP, @Reuters, @BNONews, @NWSChicago
- **Auto-refresh**: All data updates every 60 seconds
- **Theme Toggle**: Dark/Light mode with localStorage persistence
- **Offline Support**: localStorage caching for failed fetch fallback

## Files

```
news-dashboard/
├── index.html    # Main HTML structure
├── style.css     # Bloomberg Terminal aesthetic
├── app.js        # All JavaScript logic
└── README.md     # This file
```

## Local Development

```bash
# Using Python
cd news-dashboard
python -m http.server 8000

# Using Node.js
npx serve .

# Then open http://localhost:8000
```

## GitHub Pages Deployment

### 1. Push to GitHub

```bash
cd duncanheidkamp.com
git add news-dashboard/
git commit -m "Add news dashboard"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your repo Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` (or `master`)
4. Folder: `/ (root)` or `/docs` if you move files there
5. Click Save

Your dashboard will be live at:
`https://yourusername.github.io/duncanheidkamp.com/news-dashboard/`

### 3. Custom Subdomain Setup

To use `dashboard.duncanheidkamp.com`:

#### A. Add CNAME file
Create a file named `CNAME` (no extension) in the repo root:
```
dashboard.duncanheidkamp.com
```

#### B. Configure DNS
Add these DNS records at your domain registrar:

**Option 1: CNAME Record (Recommended)**
```
Type: CNAME
Name: dashboard
Value: yourusername.github.io
TTL: 3600
```

**Option 2: A Records (if CNAME not supported)**
```
Type: A
Name: dashboard
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
TTL: 3600
```

#### C. Enable HTTPS
1. Wait for DNS propagation (up to 48 hours)
2. Go to repo Settings → Pages
3. Check "Enforce HTTPS"

## Configuration

Edit `app.js` to customize:

### RSS Feeds
```javascript
RSS_FEEDS: {
    wire: [
        { name: 'AP', url: '...', source: 'ap' },
        // Add more wire services
    ],
    headlines: [
        // Add/remove news sources
    ],
    substacks: [
        // Add your favorite Substacks
    ]
}
```

### Stocks
```javascript
STOCKS: ['AAPL', 'MSFT', ...], // Add/remove symbols
```

### Sports Teams
```javascript
SPORTS: {
    cubs: { name: 'Cubs', sport: 'baseball', league: 'mlb', team: 'chc' },
    // Add teams using ESPN team IDs
}
```

### Refresh Interval
```javascript
REFRESH_INTERVAL: 60000, // Milliseconds (60s default)
```

## Data Sources

| Data | Source | Rate Limit |
|------|--------|------------|
| Stocks | Yahoo Finance | ~2000/day |
| RSS Feeds | Various via CORS proxy | Varies |
| Weather | NWS API | No limit |
| Sports | ESPN Public API | Unofficial |
| Congress | Heuristic (upgrade to ProPublica) | - |

## Known Limitations

1. **CORS Proxies**: RSS feeds use public CORS proxies which may have rate limits
2. **Stock Data**: Yahoo Finance unofficial API may change without notice
3. **Twitter Embeds**: Require Twitter's widget.js, may not load in some contexts
4. **Paywalled Content**: Some sources return limited data (WSJ, FT, Athletic)

## Troubleshooting

**Feeds not loading?**
- Check browser console for CORS errors
- Try a different CORS proxy in `CONFIG.CORS_PROXIES`
- Check if source RSS URL changed

**Stocks showing "---"?**
- Yahoo Finance may be rate limiting
- Cached data will show if available

**Page blank on refresh?**
- localStorage cache should prevent this
- Clear cache: `localStorage.clear()` in console

## License

MIT - Use freely, attribution appreciated.
