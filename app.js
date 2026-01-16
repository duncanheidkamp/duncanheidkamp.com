/**
 * ============================================
 * NEWS DASHBOARD - TERMINAL STYLE
 * Main Application Logic
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // Refresh interval in milliseconds
    REFRESH_INTERVAL: 60000,

    // Finnhub API key (free at finnhub.io)
    FINNHUB_API_KEY: 'd5l7fp9r01qgqufkp040d5l7fp9r01qgqufkp04g',

    // Instapaper credentials (for auto-save)
    // Leave INSTAPAPER_USERNAME empty to disable
    INSTAPAPER_USERNAME: 'duncan.heidkamp@gmail.com',
    INSTAPAPER_PASSWORD: 'dc062400',

    // CORS Proxy options (try multiple if one fails)
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],

    // RSS Feed Sources
    RSS_FEEDS: {
        // Headlines - includes wire services and major publications
        headlines: [
            { name: 'AP', url: 'https://feedx.net/rss/ap.xml', source: 'ap' },
            { name: 'Reuters', url: 'https://feedx.net/rss/reuters.xml', source: 'reuters' },
            { name: 'Drudge', url: 'https://feedpress.me/drudgereportfeed', source: 'drudge' },
            { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'nyt' },
            { name: 'WSJ', url: 'https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness', source: 'wsj' },
            { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'bloomberg' },
            { name: 'Money Stuff', url: 'https://www.bloomberg.com/opinion/authors/ARbTQlRLRjE/matthew-s-levine.rss', source: 'moneystuff' },
            { name: 'Atlantic', url: 'https://www.theatlantic.com/feed/all/', source: 'atlantic' },
            { name: 'Tribune', url: 'https://www.chicagotribune.com/arcio/rss/', source: 'tribune' },
            { name: 'Block Club', url: 'https://blockclubchicago.org/feed/', source: 'blockclub' },
            { name: 'Onion', url: 'https://theonion.com/feed/', source: 'onion' }
        ],
        // Reading panel feeds
        reading: {
            instapaper: 'https://instapaper.com/rss/8194512/enei3iXcVSKeLjHiSxpzTLR8Ta4',
            goodreads: 'https://www.goodreads.com/review/list_rss/56452115?key=SX0ZapaytFucPK03UJVw9dBSCdmxUZPWoWlYlJbdZUHKf-4s&shelf=currently-reading'
        },
        // Substacks
        substacks: [
            { name: 'Slow Boring', author: 'Matt Yglesias', url: 'https://www.slowboring.com/feed', source: 'substack' },
            { name: 'Noahpinion', author: 'Noah Smith', url: 'https://www.noahpinion.blog/feed', source: 'substack' },
            { name: 'BIG', author: 'Matt Stoller', url: 'https://www.thebignewsletter.com/feed', source: 'substack' },
            { name: 'Very Serious', author: 'Josh Barro', url: 'https://www.joshbarro.com/feed', source: 'substack' },
            { name: 'I Might Be Wrong', author: 'Jeff Maurer', url: 'https://www.imightbewrong.org/feed', source: 'substack' },
            { name: "Kyla's Newsletter", author: 'Kyla Scanlon', url: 'https://kyla.substack.com/feed', source: 'substack' },
            { name: 'The Argument', author: 'Jerusalem Demsas', url: 'https://www.theargumentmag.com/feed', source: 'substack' },
            { name: 'Silver Bulletin', author: 'Nate Silver', url: 'https://www.natesilver.net/feed', source: 'substack' },
            { name: 'A City That Works', author: 'Conor Durkin', url: 'https://citythatworks.substack.com/feed', source: 'substack' }
        ]
    },

    // Stock symbols to track
    STOCKS: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'DIS', 'T'],

    // Index ETF proxies (Finnhub doesn't support index symbols directly)
    INDICES: {
        sp500: { symbol: 'SPY', label: 'S&P' },      // SPY tracks S&P 500
        nasdaq: { symbol: 'QQQ', label: 'NASDAQ' },  // QQQ tracks NASDAQ-100
        dow: { symbol: 'DIA', label: 'DOW' }         // DIA tracks Dow Jones
    },

    // Crypto symbols for Finnhub (exchange:pair format)
    CRYPTO: {
        btc: { symbol: 'BINANCE:BTCUSDT', label: 'BTC' }
    },

    // Sports teams (ESPN team IDs)
    SPORTS: {
        cubs: { name: 'Cubs', sport: 'baseball', league: 'mlb', team: 'chc', abbrev: 'CHC' },
        bears: { name: 'Bears', sport: 'football', league: 'nfl', team: 'chi', abbrev: 'CHI' },
        bulls: { name: 'Bulls', sport: 'basketball', league: 'nba', team: 'chi', abbrev: 'CHI' },
        blackhawks: { name: 'Hawks', sport: 'hockey', league: 'nhl', team: 'chi', abbrev: 'CHI' },
        iuFootball: { name: 'IU FB', sport: 'football', league: 'college-football', team: '84', abbrev: 'IU' },
        iuBasketball: { name: 'IU BB', sport: 'basketball', league: 'mens-college-basketball', team: '84', abbrev: 'IU' }
    },

    // Weather (Chicago)
    WEATHER_ZONE: 'ILZ014', // Chicago zone

    // Twitter accounts
    TWITTER_ACCOUNTS: ['AP', 'Reuters', 'BNONews', 'NWSChicago']
};

// ============================================
// STATE
// ============================================

const State = {
    theme: localStorage.getItem('dashboard-theme') || 'dark',
    lastUpdate: null,
    feedsLoaded: 0,
    feedsTotal: 0,
    errors: 0,
    cache: JSON.parse(localStorage.getItem('dashboard-cache') || '{}'),
    currentProxy: 0,
    // Daily accumulation
    todayDate: new Date().toDateString(),
    dailyHeadlines: JSON.parse(localStorage.getItem('daily-headlines') || '[]'),
    dailySubstacks: JSON.parse(localStorage.getItem('daily-substacks') || '[]'),
    readItems: JSON.parse(localStorage.getItem('read-items') || '{}')
};

// Check if it's a new day and reset accumulated items
function checkDailyReset() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily-date');

    if (storedDate !== today) {
        // New day - reset everything
        State.dailyHeadlines = [];
        State.dailySubstacks = [];
        State.readItems = {};
        State.todayDate = today;
        localStorage.setItem('daily-date', today);
        localStorage.setItem('daily-headlines', '[]');
        localStorage.setItem('daily-substacks', '[]');
        localStorage.setItem('read-items', '{}');
        console.log('New day detected - resetting daily feeds');
    }
}

// Mark an item as read and save to Instapaper
function markAsRead(itemId, url, title) {
    State.readItems[itemId] = true;
    localStorage.setItem('read-items', JSON.stringify(State.readItems));

    // Update the UI
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
        element.classList.add('read');
    }

    // Save to Instapaper if configured
    if (CONFIG.INSTAPAPER_USERNAME && url) {
        saveToInstapaper(url, title);
    }
}

// Save article to Instapaper
async function saveToInstapaper(url, title) {
    try {
        const params = new URLSearchParams({
            username: CONFIG.INSTAPAPER_USERNAME,
            password: CONFIG.INSTAPAPER_PASSWORD || '',
            url: url,
            title: title || ''
        });

        // Use CORS proxy to reach Instapaper API
        const proxyUrl = CONFIG.CORS_PROXIES[0] + encodeURIComponent(
            `https://www.instapaper.com/api/add?${params.toString()}`
        );

        const response = await fetch(proxyUrl, { method: 'GET' });

        if (response.ok) {
            console.log('Saved to Instapaper:', title || url);
            showInstapaperNotification('Saved to Instapaper');
        } else {
            console.warn('Instapaper save failed:', response.status);
            showInstapaperNotification('Instapaper save failed', true);
        }
    } catch (e) {
        console.warn('Instapaper error:', e);
        // Fallback: open Instapaper in background tab
        const instapaperUrl = `https://www.instapaper.com/hello2?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`;
        window.open(instapaperUrl, '_blank', 'width=500,height=350');
    }
}

// Show brief notification for Instapaper saves
function showInstapaperNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `instapaper-notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Generate unique ID for an item
function getItemId(item) {
    return btoa(encodeURIComponent(item.title + item.link)).slice(0, 32);
}

// ============================================
// UTILITIES
// ============================================

/**
 * Format time as HH:MM
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

/**
 * Format time with seconds
 */
function formatTimeFull(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Format relative time
 */
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Fetch with CORS proxy fallback
 */
async function fetchWithProxy(url) {
    // Try rss2json first (most reliable for RSS)
    try {
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetch(rss2jsonUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
                // Convert rss2json format to XML-like structure for parsing
                return convertRss2JsonToXml(data);
            }
        }
    } catch (e) {
        console.warn('rss2json failed:', e.message);
    }

    // Fallback to CORS proxies
    const proxies = CONFIG.CORS_PROXIES;
    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxyUrl = proxies[(State.currentProxy + i) % proxies.length] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (response.ok) {
                State.currentProxy = (State.currentProxy + i) % proxies.length;
                return await response.text();
            }
        } catch (e) {
            console.warn(`Proxy ${i} failed for ${url}:`, e.message);
        }
    }
    throw new Error('All proxies failed');
}

/**
 * Convert rss2json response to simple XML for parser compatibility
 */
function convertRss2JsonToXml(data) {
    const items = data.items.map(item => `
        <item>
            <title><![CDATA[${item.title || ''}]]></title>
            <link>${item.link || ''}</link>
            <pubDate>${item.pubDate || ''}</pubDate>
        </item>
    `).join('');

    return `<?xml version="1.0"?><rss><channel>${items}</channel></rss>`;
}

/**
 * Parse RSS XML to items
 */
function parseRSS(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        throw new Error('Invalid RSS feed');
    }

    const items = [];
    const entries = doc.querySelectorAll('item, entry');

    entries.forEach(entry => {
        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const link = entry.querySelector('link')?.textContent?.trim() ||
                     entry.querySelector('link')?.getAttribute('href') || '';
        const pubDate = entry.querySelector('pubDate, published, updated')?.textContent || '';

        if (title) {
            items.push({
                title: decodeHTMLEntities(title),
                link: link,
                date: pubDate ? new Date(pubDate) : new Date()
            });
        }
    });

    return items;
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Save cache to localStorage
 */
function saveCache() {
    try {
        localStorage.setItem('dashboard-cache', JSON.stringify(State.cache));
    } catch (e) {
        console.warn('Failed to save cache:', e);
    }
}

/**
 * Update feed counter
 */
function updateFeedStatus(loaded, total, error = false) {
    if (loaded !== undefined) State.feedsLoaded = loaded;
    if (total !== undefined) State.feedsTotal = total;
    if (error) State.errors++;

    document.getElementById('feeds-loaded').textContent = State.feedsLoaded;
    document.getElementById('feeds-total').textContent = State.feedsTotal;
    document.getElementById('errors-count').textContent = `Errors: ${State.errors}`;

    const statusEl = document.getElementById('connection-status');
    if (State.errors > State.feedsTotal / 2) {
        statusEl.textContent = '● DEGRADED';
        statusEl.className = 'status-error';
    } else {
        statusEl.textContent = '● CONNECTED';
        statusEl.className = 'status-ok';
    }
}

// ============================================
// CLOCK
// ============================================

function updateClock() {
    document.getElementById('clock').textContent = formatTimeFull(new Date());
}

// ============================================
// THEME TOGGLE (3 themes: dark, light, excel)
// ============================================

const THEMES = ['dark', 'light', 'excel'];
const THEME_ICONS = { dark: '☀', light: '◐', excel: '▦' };
const THEME_LABELS = { dark: 'Dark', light: 'Light', excel: 'Excel' };

function initTheme() {
    // Ensure theme is valid
    if (!THEMES.includes(State.theme)) {
        State.theme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', State.theme);
    updateThemeButton();
    initExcelUI();
}

function toggleTheme() {
    const currentIndex = THEMES.indexOf(State.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    State.theme = THEMES[nextIndex];
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('dashboard-theme', State.theme);
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    btn.textContent = THEME_ICONS[State.theme] || '◐';
    btn.title = `Current: ${THEME_LABELS[State.theme]} (click to change)`;
}

// ============================================
// EXCEL UI FUNCTIONS
// ============================================

function initExcelUI() {
    // Update Excel clock
    updateExcelClock();
    setInterval(updateExcelClock, 1000);

    // Set up hover events to update formula bar
    document.addEventListener('mouseover', (e) => {
        const feedItem = e.target.closest('.feed-item, .substack-item');
        if (feedItem && State.theme === 'excel') {
            const headline = feedItem.querySelector('.feed-headline, .substack-title');
            if (headline) {
                document.getElementById('formula-text').textContent = headline.textContent;
            }
        }
    });
}

function updateExcelClock() {
    const clockEl = document.getElementById('excel-clock');
    if (clockEl) {
        clockEl.textContent = formatTimeFull(new Date());
    }
}

function updateExcelStocks(quoteMap) {
    // Update S&P in ribbon
    const sp500 = quoteMap['sp500'];
    if (sp500) {
        const el = document.getElementById('excel-sp500');
        if (el) {
            const change = sp500.changePercent || 0;
            const isPositive = change >= 0;
            el.className = `ribbon-btn ${isPositive ? 'stock-positive' : 'stock-negative'}`;
            el.innerHTML = `
                <span class="ribbon-btn-icon" style="color: ${isPositive ? '#006600' : '#cc0000'};">${isPositive ? '▲' : '▼'}</span>
                <span>S&P ${formatPercent(change)}</span>
            `;
        }
    }

    // Update DOW in ribbon
    const dow = quoteMap['dow'];
    if (dow) {
        const el = document.getElementById('excel-dow');
        if (el) {
            const change = dow.changePercent || 0;
            const isPositive = change >= 0;
            el.className = `ribbon-btn ${isPositive ? 'stock-positive' : 'stock-negative'}`;
            el.innerHTML = `
                <span class="ribbon-btn-icon" style="color: ${isPositive ? '#006600' : '#cc0000'};">${isPositive ? '▲' : '▼'}</span>
                <span>DOW ${formatPercent(change)}</span>
            `;
        }
    }

    // Update BTC in ribbon
    const btc = quoteMap['btc'];
    if (btc) {
        const el = document.getElementById('excel-btc');
        if (el) {
            const change = btc.changePercent || 0;
            const isPositive = change >= 0;
            el.className = `ribbon-btn ${isPositive ? 'stock-positive' : 'stock-negative'}`;
            el.innerHTML = `
                <span class="ribbon-btn-icon" style="color: ${isPositive ? '#006600' : '#cc0000'};">${isPositive ? '▲' : '▼'}</span>
                <span>BTC ${formatPercent(change)}</span>
            `;
        }
    }
}

function updateExcelStatus(congress, weather) {
    // Update congress status in ribbon
    const congressEl = document.getElementById('excel-congress');
    if (congressEl && congress) {
        const isSession = congress.includes('SESSION');
        congressEl.innerHTML = `
            <span class="ribbon-btn-icon">🏛️</span>
            <span style="color: ${isSession ? '#006600' : '#666'};">${congress}</span>
        `;
    }

    // Update weather in ribbon
    const weatherEl = document.getElementById('excel-weather');
    if (weatherEl && weather) {
        const hasAlert = !weather.includes('NO ALERT');
        weatherEl.innerHTML = `
            <span class="ribbon-btn-icon">${hasAlert ? '⚠️' : '🌤️'}</span>
            <span style="color: ${hasAlert ? '#cc0000' : '#666'};">${weather}</span>
        `;
    }
}

function updateExcelTime() {
    const el = document.getElementById('excel-updated');
    if (el) {
        el.textContent = `Updated: ${formatTime(new Date())}`;
    }
}

// ============================================
// STOCK DATA (Finnhub API)
// ============================================

async function fetchStockData() {
    if (!CONFIG.FINNHUB_API_KEY) {
        console.warn('Finnhub API key not configured - stocks will not load');
        showStockError('Add Finnhub API key to CONFIG');
        return;
    }

    try {
        // Build list of all symbols to fetch
        const symbolsToFetch = [
            ...Object.entries(CONFIG.INDICES).map(([key, val]) => ({ key, symbol: val.symbol, type: 'index' })),
            ...CONFIG.STOCKS.map(symbol => ({ key: symbol, symbol, type: 'stock' })),
            { key: 'btc', symbol: CONFIG.CRYPTO.btc.symbol, type: 'crypto' }
        ];

        // Fetch all quotes in parallel
        const results = await Promise.all(
            symbolsToFetch.map(item => fetchFinnhubQuote(item.symbol, item.key, item.type))
        );

        // Build quote map from results
        const quoteMap = {};
        results.forEach(result => {
            if (result && result.key) {
                quoteMap[result.key] = result;
            }
        });

        // Process and display
        processStockData(quoteMap);

        // Cache results
        State.cache.stocks = { data: quoteMap, timestamp: Date.now() };
        saveCache();

    } catch (e) {
        console.error('Stock data fetch failed:', e);
        updateFeedStatus(undefined, undefined, true);

        // Fallback to cached data
        if (State.cache.stocks) {
            processStockData(State.cache.stocks.data);
        }
    }
}

/**
 * Fetch a single quote from Finnhub
 */
async function fetchFinnhubQuote(symbol, key, type) {
    try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${CONFIG.FINNHUB_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Finnhub returns: c=current, d=change, dp=percent change, pc=previous close
        if (data && data.c) {
            return {
                key: key,
                symbol: symbol,
                type: type,
                price: data.c,
                change: data.d,
                changePercent: data.dp,
                previousClose: data.pc
            };
        }
        return null;
    } catch (e) {
        console.warn(`Finnhub quote failed for ${symbol}:`, e.message);
        return null;
    }
}

function showStockError(message) {
    // Update index displays with error
    ['sp500', 'nasdaq', 'dow', 'btc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const valueEl = el.querySelector('.ticker-value');
            const changeEl = el.querySelector('.ticker-change');
            if (valueEl) valueEl.textContent = '---';
            if (changeEl) {
                changeEl.textContent = 'API Key Required';
                changeEl.className = 'ticker-change neutral';
            }
        }
    });

    const stocksContainer = document.getElementById('stocks-ticker');
    if (stocksContainer) {
        stocksContainer.innerHTML = `<span class="ticker-error">${message}</span>`;
    }
}

function processStockData(quoteMap) {
    // Update indices (using ETF proxies)
    updateTickerItem('sp500', quoteMap['sp500'], CONFIG.INDICES.sp500.label);
    updateTickerItem('nasdaq', quoteMap['nasdaq'], CONFIG.INDICES.nasdaq.label);
    updateTickerItem('dow', quoteMap['dow'], CONFIG.INDICES.dow.label);

    // Update BTC
    updateTickerItem('btc', quoteMap['btc'], 'BTC');

    // Oil - skip for now (Finnhub doesn't have commodities on free tier)
    const oilEl = document.getElementById('oil');
    if (oilEl) {
        oilEl.querySelector('.ticker-value').textContent = '---';
        oilEl.querySelector('.ticker-change').textContent = 'N/A';
    }

    // Update individual stocks
    const stocksContainer = document.getElementById('stocks-ticker');
    stocksContainer.innerHTML = '';

    CONFIG.STOCKS.forEach(symbol => {
        const quote = quoteMap[symbol];
        if (quote) {
            const item = document.createElement('span');
            item.className = 'ticker-item';
            item.innerHTML = `
                <span class="ticker-label">${symbol}</span>
                <span class="ticker-value">${formatPrice(quote.price)}</span>
                <span class="ticker-change ${getChangeClass(quote.changePercent)}">${formatPercent(quote.changePercent)}</span>
            `;
            stocksContainer.appendChild(item);
        }
    });

    // Update Excel ribbon stocks
    updateExcelStocks(quoteMap);
}

function updateTickerItem(id, quote, label) {
    const el = document.getElementById(id);
    if (!el || !quote) return;

    const valueEl = el.querySelector('.ticker-value');
    const changeEl = el.querySelector('.ticker-change');

    if (valueEl) valueEl.textContent = formatPrice(quote.price);
    if (changeEl) {
        changeEl.textContent = formatPercent(quote.changePercent);
        changeEl.className = `ticker-change ${getChangeClass(quote.changePercent)}`;
    }
}

function formatPrice(price) {
    if (!price) return '---';
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(pct) {
    if (pct === undefined || pct === null) return '--%';
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
}

function getChangeClass(pct) {
    if (pct > 0) return 'positive';
    if (pct < 0) return 'negative';
    return 'neutral';
}

// ============================================
// READING PANEL (Instapaper + Goodreads)
// ============================================

async function fetchReadingPanel() {
    const container = document.getElementById('reading-feed');

    // Fetch both feeds in parallel
    const [instapaperItems, goodreadsItems] = await Promise.all([
        fetchInstapaperFeed(),
        fetchGoodreadsFeed()
    ]);

    // Render the combined panel
    renderReadingPanel(container, goodreadsItems, instapaperItems);
    State.feedsLoaded += 2;
    updateFeedStatus();
}

async function fetchInstapaperFeed() {
    try {
        const xml = await fetchWithProxy(CONFIG.RSS_FEEDS.reading.instapaper);
        const items = parseRSS(xml);

        // Cache
        State.cache.instapaper = { items: items.slice(0, 15), timestamp: Date.now() };
        saveCache();

        return items.slice(0, 15);
    } catch (e) {
        console.warn('Instapaper feed failed:', e);
        updateFeedStatus(undefined, undefined, true);

        // Return cached data if available
        if (State.cache.instapaper) {
            return State.cache.instapaper.items;
        }
        return [];
    }
}

async function fetchGoodreadsFeed() {
    try {
        // Goodreads needs full XML to get cover images and all books
        // Skip rss2json (which strips fields) and use CORS proxies directly
        const xml = await fetchGoodreadsDirectly(CONFIG.RSS_FEEDS.reading.goodreads);
        const items = parseGoodreadsRSS(xml);

        // Cache
        State.cache.goodreads = { items: items, timestamp: Date.now() };
        saveCache();

        return items;
    } catch (e) {
        console.warn('Goodreads feed failed:', e);
        updateFeedStatus(undefined, undefined, true);

        // Return cached data if available
        if (State.cache.goodreads) {
            return State.cache.goodreads.items;
        }
        return [];
    }
}

/**
 * Fetch Goodreads RSS directly via CORS proxy (bypassing rss2json which strips fields)
 */
async function fetchGoodreadsDirectly(url) {
    const proxies = CONFIG.CORS_PROXIES;
    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxyUrl = proxies[i] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (response.ok) {
                return await response.text();
            }
        } catch (e) {
            console.warn(`Goodreads proxy ${i} failed:`, e.message);
        }
    }
    throw new Error('All proxies failed for Goodreads');
}

/**
 * Parse Goodreads RSS which has different structure
 */
function parseGoodreadsRSS(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const items = [];
    const entries = doc.querySelectorAll('item');

    entries.forEach(entry => {
        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const link = entry.querySelector('link')?.textContent?.trim() || '';
        const author = entry.querySelector('author_name')?.textContent?.trim() || '';

        // Get book cover from dedicated fields (prefer larger images)
        let coverUrl = entry.querySelector('book_large_image_url')?.textContent?.trim() ||
                       entry.querySelector('book_medium_image_url')?.textContent?.trim() ||
                       entry.querySelector('book_image_url')?.textContent?.trim() ||
                       entry.querySelector('book_small_image_url')?.textContent?.trim();

        // Fallback: try to extract from description HTML if direct fields are empty
        if (!coverUrl) {
            const description = entry.querySelector('description')?.textContent || '';
            const coverMatch = description.match(/src="([^"]+)"/);
            coverUrl = coverMatch ? coverMatch[1] : null;
        }

        if (title) {
            items.push({
                title: decodeHTMLEntities(title),
                author: decodeHTMLEntities(author),
                link: link,
                coverUrl: coverUrl
            });
        }
    });

    return items;
}

function renderReadingPanel(container, books, articles) {
    let html = '';

    // Currently Reading section
    html += '<div class="reading-section">';
    html += '<div class="reading-section-header">📚 CURRENTLY READING</div>';

    if (books.length === 0) {
        html += '<div class="reading-empty">No books currently reading</div>';
    } else {
        html += books.map(book => `
            <div class="book-item">
                <a href="${book.link}" target="_blank" rel="noopener">
                    ${book.coverUrl ? `<img class="book-cover" src="${book.coverUrl}" alt="${book.title}" onerror="this.style.display='none'">` : '<div class="book-cover-placeholder">📖</div>'}
                    <div class="book-info">
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">by ${book.author}</div>
                    </div>
                </a>
            </div>
        `).join('');
    }
    html += '</div>';

    // Saved Articles section
    html += '<div class="reading-section">';
    html += `<div class="reading-section-header">📑 SAVED ARTICLES (${articles.length})</div>`;

    if (articles.length === 0) {
        html += '<div class="reading-empty">No saved articles</div>';
    } else {
        html += articles.map(article => `
            <div class="feed-item saved-article">
                <a href="${article.link}" target="_blank" rel="noopener">
                    <span class="feed-time">${formatRelativeTime(article.date)}</span>
                    <span class="feed-headline">${article.title}</span>
                </a>
            </div>
        `).join('');
    }
    html += '</div>';

    container.innerHTML = html;
}

// ============================================
// HEADLINES FEED (Daily Accumulation)
// ============================================

async function fetchHeadlinesFeed() {
    const container = document.getElementById('headlines-feed');
    let newItems = [];
    let feedsLoaded = 0;

    for (const feed of CONFIG.RSS_FEEDS.headlines) {
        try {
            const xml = await fetchWithProxy(feed.url);
            const items = parseRSS(xml);
            items.forEach(item => {
                item.source = feed.source;
                item.sourceName = feed.name;
                item.id = getItemId(item);
            });
            // Drudge has more links, pull more from it
            const limit = feed.source === 'drudge' ? 20 : 5;
            newItems = newItems.concat(items.slice(0, limit));
            feedsLoaded++;
        } catch (e) {
            console.warn(`Headlines feed ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    // Merge with existing daily headlines (avoid duplicates)
    const existingIds = new Set(State.dailyHeadlines.map(item => item.id));
    newItems.forEach(item => {
        if (!existingIds.has(item.id)) {
            State.dailyHeadlines.push(item);
        }
    });

    // Sort by date (newest first)
    State.dailyHeadlines.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save to localStorage
    localStorage.setItem('daily-headlines', JSON.stringify(State.dailyHeadlines));

    // Render
    renderHeadlinesFeed(container, State.dailyHeadlines);
    State.feedsLoaded += feedsLoaded;
    updateFeedStatus();
}

function renderHeadlinesFeed(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<div class="feed-unavailable">HEADLINES UNAVAILABLE</div>';
        return;
    }

    const unreadCount = items.filter(item => !State.readItems[item.id]).length;

    container.innerHTML = `
        <div class="feed-stats">
            <span class="unread-count">${unreadCount} unread</span>
            <span class="total-count">${items.length} total today</span>
        </div>
    ` + items.map(item => {
        const isRead = State.readItems[item.id];
        const escapedTitle = item.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const escapedLink = item.link.replace(/'/g, "\\'");
        return `
            <div class="feed-item ${isRead ? 'read' : ''}" data-item-id="${item.id}">
                <a href="${item.link}" target="_blank" rel="noopener" onclick="markAsRead('${item.id}', '${escapedLink}', '${escapedTitle}')">
                    <span class="feed-source source-${item.source}">${item.sourceName}</span>
                    <span class="feed-headline">${item.title}</span>
                    <span class="feed-time">${formatRelativeTime(new Date(item.date))}</span>
                </a>
            </div>
        `;
    }).join('');
}

// ============================================
// SUBSTACKS FEED (Daily Accumulation)
// ============================================

async function fetchSubstacksFeed() {
    const container = document.getElementById('substacks-feed');
    let newItems = [];
    let feedsLoaded = 0;

    for (const feed of CONFIG.RSS_FEEDS.substacks) {
        try {
            const xml = await fetchWithProxy(feed.url);
            const items = parseRSS(xml);
            items.forEach(item => {
                item.source = feed.source;
                item.sourceName = feed.name;
                item.author = feed.author;
                item.id = getItemId(item);
            });
            newItems = newItems.concat(items.slice(0, 3));
            feedsLoaded++;
        } catch (e) {
            console.warn(`Substack ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    // Merge with existing daily substacks (avoid duplicates)
    const existingIds = new Set(State.dailySubstacks.map(item => item.id));
    newItems.forEach(item => {
        if (!existingIds.has(item.id)) {
            State.dailySubstacks.push(item);
        }
    });

    // Sort by date (newest first)
    State.dailySubstacks.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save to localStorage
    localStorage.setItem('daily-substacks', JSON.stringify(State.dailySubstacks));

    // Render
    renderSubstacksFeed(container, State.dailySubstacks);
    State.feedsLoaded += feedsLoaded;
    updateFeedStatus();
}

function renderSubstacksFeed(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<div class="feed-unavailable">SUBSTACKS UNAVAILABLE</div>';
        return;
    }

    const unreadCount = items.filter(item => !State.readItems[item.id]).length;

    container.innerHTML = `
        <div class="feed-stats">
            <span class="unread-count">${unreadCount} unread</span>
            <span class="total-count">${items.length} total today</span>
        </div>
    ` + items.map(item => {
        const isRead = State.readItems[item.id];
        const escapedTitle = item.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const escapedLink = item.link.replace(/'/g, "\\'");
        return `
            <div class="substack-item ${isRead ? 'read' : ''}" data-item-id="${item.id}">
                <a href="${item.link}" target="_blank" rel="noopener" onclick="markAsRead('${item.id}', '${escapedLink}', '${escapedTitle}')">
                    <div class="substack-meta">
                        <span class="substack-author">${item.author}</span>
                        <span class="substack-date">${formatRelativeTime(new Date(item.date))}</span>
                    </div>
                    <div class="substack-title">${item.title}</div>
                </a>
            </div>
        `;
    }).join('');
}

// ============================================
// BREAKING NEWS (Scrolling Ticker)
// ============================================

async function fetchBreakingNews() {
    try {
        // Fetch from multiple sources for variety
        const sources = [
            'https://feeds.npr.org/1001/rss.xml',
            'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
        ];

        let allItems = [];

        for (const url of sources) {
            try {
                const xml = await fetchWithProxy(url);
                const items = parseRSS(xml);
                allItems = allItems.concat(items.slice(0, 5));
            } catch (e) {
                console.warn('Breaking news source failed:', url, e);
            }
        }

        // Sort by date and take top 10
        allItems.sort((a, b) => b.date - a.date);
        const topItems = allItems.slice(0, 10);

        if (topItems.length > 0) {
            renderBreakingTicker(topItems);
            State.cache.breaking = { items: topItems, timestamp: Date.now() };
            saveCache();
        }
    } catch (e) {
        console.warn('Breaking news failed:', e);
        if (State.cache.breaking && State.cache.breaking.items) {
            renderBreakingTicker(State.cache.breaking.items);
        } else {
            document.getElementById('breaking-headline').textContent = 'Breaking news unavailable';
        }
    }
}

function renderBreakingTicker(items) {
    const container = document.getElementById('breaking-headline');

    // Create scrolling content with all headlines
    const tickerContent = items.map(item =>
        `<span class="ticker-headline"><a href="${item.link}" target="_blank">${item.title}</a></span>`
    ).join('<span class="ticker-separator">•••</span>');

    // Duplicate for seamless loop
    container.innerHTML = `
        <div class="ticker-scroll">
            <div class="ticker-content">${tickerContent}</div>
            <div class="ticker-content">${tickerContent}</div>
        </div>
    `;
}

// ============================================
// FLAG STATUS (Half-Staff Check)
// ============================================

async function fetchFlagStatus() {
    const statusEl = document.getElementById('flag-status')?.querySelector('.status-value');
    if (!statusEl) return;

    try {
        // Fetch from halfstaff.org RSS feed for Illinois
        const rssUrl = 'https://halfstaff.org/rss/illinois';
        const xml = await fetchWithProxy(rssUrl);

        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const items = doc.querySelectorAll('item');

        if (items.length > 0) {
            const latestItem = items[0];
            const title = latestItem.querySelector('title')?.textContent || '';
            const pubDate = latestItem.querySelector('pubDate')?.textContent || '';

            // Check if the half-staff order is currently active
            const orderDate = new Date(pubDate);
            const now = new Date();
            const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);

            // Half-staff orders typically last a few days to a couple weeks
            // Check if order is recent (within 30 days) - we'll show it as potentially active
            if (daysDiff <= 30) {
                // Extract reason from title (usually format: "Half-Staff for [Reason]")
                let reason = title.replace(/half-?staff\s*(for|:)?\s*/i, '').trim();
                if (reason.length > 30) {
                    reason = reason.substring(0, 27) + '...';
                }

                statusEl.textContent = `HALF-STAFF`;
                statusEl.className = 'status-value alert';
                statusEl.title = title; // Full reason on hover

                // Cache the result
                State.cache.flagStatus = {
                    halfStaff: true,
                    reason: title,
                    timestamp: Date.now()
                };
                saveCache();
                return;
            }
        }

        // No active half-staff order
        statusEl.textContent = 'FULL-STAFF';
        statusEl.className = 'status-value ok';
        statusEl.title = 'Flag is at full-staff';

        State.cache.flagStatus = { halfStaff: false, timestamp: Date.now() };
        saveCache();

    } catch (e) {
        console.warn('Flag status fetch failed:', e);

        // Try fallback: check cache
        if (State.cache.flagStatus) {
            if (State.cache.flagStatus.halfStaff) {
                statusEl.textContent = 'HALF-STAFF';
                statusEl.className = 'status-value alert';
                statusEl.title = State.cache.flagStatus.reason || 'Half-staff order in effect';
            } else {
                statusEl.textContent = 'FULL-STAFF';
                statusEl.className = 'status-value ok';
            }
        } else {
            statusEl.textContent = 'UNKNOWN';
            statusEl.className = 'status-value';
        }
    }
}

// ============================================
// WEATHER ALERTS
// ============================================

async function fetchWeatherAlerts() {
    try {
        const response = await fetch('https://api.weather.gov/alerts/active?zone=ILZ014');
        const data = await response.json();

        const alertEl = document.getElementById('weather-alert').querySelector('.status-value');
        let weatherText = 'NO ALERTS';

        if (data.features && data.features.length > 0) {
            const alert = data.features[0].properties;
            weatherText = alert.event.toUpperCase();
            alertEl.textContent = weatherText;
            alertEl.className = 'status-value alert';
        } else {
            alertEl.textContent = weatherText;
            alertEl.className = 'status-value ok';
        }

        // Update Excel ribbon
        updateExcelStatus(null, weatherText);

        State.cache.weather = { data: data, timestamp: Date.now() };
        saveCache();
    } catch (e) {
        console.warn('Weather fetch failed:', e);
        const alertEl = document.getElementById('weather-alert').querySelector('.status-value');
        alertEl.textContent = 'UNAVAILABLE';
        alertEl.className = 'status-value';
        updateExcelStatus(null, 'UNAVAILABLE');
    }
}

// ============================================
// CONGRESS STATUS
// ============================================

async function fetchCongressStatus() {
    const statusEl = document.getElementById('congress-status').querySelector('.status-value');

    try {
        // ProPublica Congress API or fallback to schedule-based logic
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // Simple heuristic: Congress typically in session Tue-Thu, sometimes Mon/Fri
        // More accurate would require actual API access
        const isWeekday = day >= 1 && day <= 5;
        const isBusinessHours = hour >= 9 && hour <= 18;

        let congressText;
        // For demo purposes, use a simple rule
        // In production, use ProPublica API: https://api.propublica.org/congress/v1/
        if (isWeekday && isBusinessHours) {
            congressText = 'IN SESSION';
            statusEl.textContent = congressText;
            statusEl.className = 'status-value session';
        } else {
            congressText = 'IN RECESS';
            statusEl.textContent = congressText;
            statusEl.className = 'status-value recess';
        }

        // Update Excel ribbon
        updateExcelStatus(congressText, null);
    } catch (e) {
        statusEl.textContent = 'UNKNOWN';
        statusEl.className = 'status-value';
        updateExcelStatus('UNKNOWN', null);
    }
}

// ============================================
// SPORTS DATA
// ============================================

async function fetchSportsData() {
    const container = document.getElementById('sports-ticker');
    container.innerHTML = '';

    for (const [key, team] of Object.entries(CONFIG.SPORTS)) {
        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.team}/schedule`;
            const response = await fetch(url);
            const data = await response.json();

            // Find next upcoming game
            const now = new Date();
            let nextGame = null;

            if (data.events) {
                for (const event of data.events) {
                    const gameDate = new Date(event.date);
                    if (gameDate > now) {
                        nextGame = event;
                        break;
                    }
                }
            }

            if (nextGame) {
                // Find opponent by comparing against team abbreviation
                const opponent = nextGame.competitions?.[0]?.competitors?.find(c =>
                    c.team.abbreviation.toUpperCase() !== team.abbrev.toUpperCase()
                );
                const gameDate = new Date(nextGame.date);

                const item = document.createElement('span');
                item.className = 'sport-item';
                item.innerHTML = `
                    <span class="sport-team">${team.name}</span>
                    <span class="sport-opponent">vs ${opponent?.team?.abbreviation || 'TBD'}</span>
                    <span class="sport-date">${gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                `;
                container.appendChild(item);
            }
        } catch (e) {
            console.warn(`Sports data for ${team.name} failed:`, e);
        }
    }

    if (container.children.length === 0) {
        container.innerHTML = '<span class="text-muted">No upcoming games</span>';
    }
}

// ============================================
// TWITTER EMBEDS
// ============================================

function initTwitterTabs() {
    const tabs = document.querySelectorAll('.twitter-tab');
    const container = document.getElementById('twitter-container');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const account = tab.dataset.account;
            container.innerHTML = `
                <div class="twitter-placeholder">
                    <p>Loading @${account}...</p>
                    <p><a href="https://twitter.com/${account}" target="_blank">View on X/Twitter →</a></p>
                </div>
            `;

            // Load Twitter timeline widget
            loadTwitterTimeline(account);
        });
    });
}

function loadTwitterTimeline(account) {
    const container = document.getElementById('twitter-container');
    const height = window.innerHeight - 150; // Full viewport minus header elements

    // Create Twitter timeline embed
    container.innerHTML = `
        <a class="twitter-timeline"
           data-theme="${State.theme}"
           data-chrome="noheader nofooter noborders transparent"
           data-height="${height}"
           href="https://twitter.com/${account}">
            Loading @${account}...
        </a>
    `;

    // Load Twitter widget script
    if (window.twttr) {
        window.twttr.widgets.load(container);
    } else {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
    }
}

// ============================================
// MAIN UPDATE LOOP
// ============================================

async function updateAll() {
    console.log('Refreshing all data...');

    State.feedsLoaded = 0;
    State.feedsTotal = CONFIG.RSS_FEEDS.headlines.length +
                       CONFIG.RSS_FEEDS.substacks.length + 6; // +2 reading, +1 breaking, +1 stocks, +1 flag, +1 weather
    State.errors = 0;

    updateFeedStatus(0, State.feedsTotal);

    // Parallel fetch
    await Promise.allSettled([
        fetchStockData(),
        fetchReadingPanel(),
        fetchHeadlinesFeed(),
        fetchSubstacksFeed(),
        fetchBreakingNews(),
        fetchFlagStatus(),
        fetchWeatherAlerts(),
        fetchCongressStatus(),
        fetchSportsData()
    ]);

    // Update last updated time
    State.lastUpdate = new Date();
    document.getElementById('last-updated').textContent = `Updated: ${formatTime(State.lastUpdate)}`;

    // Update Excel ribbon time
    updateExcelTime();

    console.log('Refresh complete');
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('News Dashboard initializing...');

    // Check if it's a new day (reset accumulated items at midnight)
    checkDailyReset();

    // Initialize theme
    initTheme();

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Initialize Twitter tabs
    initTwitterTabs();

    // Initial data load
    await updateAll();

    // Set up auto-refresh
    setInterval(updateAll, CONFIG.REFRESH_INTERVAL);

    console.log('News Dashboard ready');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
