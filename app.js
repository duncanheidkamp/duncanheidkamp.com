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
        // Wire feeds - using rss2json API for reliability
        wire: [
            { name: 'AP', url: 'https://feedx.net/rss/ap.xml', source: 'ap' },
            { name: 'Reuters', url: 'https://feedx.net/rss/reuters.xml', source: 'reuters' }
        ],
        // Major publications
        headlines: [
            { name: 'Drudge', url: 'https://feedpress.me/drudgereportfeed', source: 'drudge' },
            { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'nyt' },
            { name: 'WSJ', url: 'https://feeds.wsj.com/rss/RSSWorldNews.xml', source: 'wsj' },
            { name: 'Atlantic', url: 'https://www.theatlantic.com/feed/all/', source: 'atlantic' },
            { name: 'Tribune', url: 'https://www.chicagotribune.com/arcio/rss/', source: 'tribune' },
            { name: 'Block Club', url: 'https://blockclubchicago.org/feed/', source: 'blockclub' },
            { name: 'Onion', url: 'https://theonion.com/feed/', source: 'onion' }
        ],
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

    // Index symbols
    INDICES: {
        sp500: '^GSPC',
        nasdaq: '^IXIC',
        dow: '^DJI'
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
    const sp500 = quoteMap['^GSPC'];
    if (sp500) {
        const el = document.getElementById('excel-sp500');
        if (el) {
            const change = getQuoteChange(sp500);
            const isPositive = change >= 0;
            el.className = `ribbon-btn ${isPositive ? 'stock-positive' : 'stock-negative'}`;
            el.innerHTML = `
                <span class="ribbon-btn-icon" style="color: ${isPositive ? '#006600' : '#cc0000'};">${isPositive ? '▲' : '▼'}</span>
                <span>S&P ${formatPercent(change)}</span>
            `;
        }
    }

    // Update DOW in ribbon
    const dow = quoteMap['^DJI'];
    if (dow) {
        const el = document.getElementById('excel-dow');
        if (el) {
            const change = getQuoteChange(dow);
            const isPositive = change >= 0;
            el.className = `ribbon-btn ${isPositive ? 'stock-positive' : 'stock-negative'}`;
            el.innerHTML = `
                <span class="ribbon-btn-icon" style="color: ${isPositive ? '#006600' : '#cc0000'};">${isPositive ? '▲' : '▼'}</span>
                <span>DOW ${formatPercent(change)}</span>
            `;
        }
    }

    // Update BTC in ribbon
    const btc = quoteMap['BTC-USD'];
    if (btc) {
        const el = document.getElementById('excel-btc');
        if (el) {
            const change = getQuoteChange(btc);
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
// STOCK DATA
// ============================================

async function fetchStockData() {
    try {
        // Using Yahoo Finance via a free API proxy
        const symbols = [...Object.values(CONFIG.INDICES), ...CONFIG.STOCKS, 'BTC-USD', 'CL=F'];
        const symbolStr = symbols.join(',');

        // Try Yahoo Finance query
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`;

        try {
            const data = await fetchWithProxy(url);
            const json = JSON.parse(data);

            if (json.quoteResponse && json.quoteResponse.result) {
                processStockData(json.quoteResponse.result);
                State.cache.stocks = { data: json.quoteResponse.result, timestamp: Date.now() };
                saveCache();
                return;
            }
        } catch (e) {
            console.warn('Yahoo Finance failed:', e);
        }

        // Fallback to cached data
        if (State.cache.stocks) {
            processStockData(State.cache.stocks.data);
        }
    } catch (e) {
        console.error('Stock data fetch failed:', e);
        updateFeedStatus(undefined, undefined, true);
    }
}

function processStockData(quotes) {
    const quoteMap = {};
    quotes.forEach(q => {
        quoteMap[q.symbol] = q;
    });

    // Update indices
    updateTickerItem('sp500', quoteMap['^GSPC']);
    updateTickerItem('nasdaq', quoteMap['^IXIC']);
    updateTickerItem('dow', quoteMap['^DJI']);

    // Update BTC and Oil
    updateTickerItem('btc', quoteMap['BTC-USD']);
    updateTickerItem('oil', quoteMap['CL=F']);

    // Update individual stocks
    const stocksContainer = document.getElementById('stocks-ticker');
    stocksContainer.innerHTML = '';

    CONFIG.STOCKS.forEach(symbol => {
        const quote = quoteMap[symbol];
        if (quote) {
            const price = getQuotePrice(quote);
            const change = getQuoteChange(quote);
            const item = document.createElement('span');
            item.className = 'ticker-item';
            item.innerHTML = `
                <span class="ticker-label">${symbol}</span>
                <span class="ticker-value">${formatPrice(price)}</span>
                <span class="ticker-change ${getChangeClass(change)}">${formatPercent(change)}</span>
            `;
            stocksContainer.appendChild(item);
        }
    });

    // Update Excel ribbon stocks
    updateExcelStocks(quoteMap);
}

function updateTickerItem(id, quote) {
    const el = document.getElementById(id);
    if (!el || !quote) return;

    const valueEl = el.querySelector('.ticker-value');
    const changeEl = el.querySelector('.ticker-change');

    // Get price with fallbacks for off-hours
    const price = getQuotePrice(quote);
    const change = getQuoteChange(quote);

    if (valueEl) valueEl.textContent = formatPrice(price);
    if (changeEl) {
        changeEl.textContent = formatPercent(change);
        changeEl.className = `ticker-change ${getChangeClass(change)}`;
    }
}

/**
 * Get the best available price from a quote
 * Falls back through: regularMarket -> postMarket -> preMarket -> previousClose
 */
function getQuotePrice(quote) {
    if (quote.regularMarketPrice) return quote.regularMarketPrice;
    if (quote.postMarketPrice) return quote.postMarketPrice;
    if (quote.preMarketPrice) return quote.preMarketPrice;
    if (quote.regularMarketPreviousClose) return quote.regularMarketPreviousClose;
    return null;
}

/**
 * Get the best available change percentage from a quote
 */
function getQuoteChange(quote) {
    if (quote.regularMarketChangePercent !== undefined && quote.regularMarketChangePercent !== null) {
        return quote.regularMarketChangePercent;
    }
    if (quote.postMarketChangePercent !== undefined) return quote.postMarketChangePercent;
    if (quote.preMarketChangePercent !== undefined) return quote.preMarketChangePercent;
    return 0;
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
// WIRE FEED
// ============================================

async function fetchWireFeed() {
    const container = document.getElementById('wire-feed');
    let allItems = [];
    let feedsLoaded = 0;

    for (const feed of CONFIG.RSS_FEEDS.wire) {
        try {
            const xml = await fetchWithProxy(feed.url);
            const items = parseRSS(xml);
            items.forEach(item => {
                item.source = feed.source;
                item.sourceName = feed.name;
            });
            allItems = allItems.concat(items);
            feedsLoaded++;
        } catch (e) {
            console.warn(`Wire feed ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    // Sort by date
    allItems.sort((a, b) => b.date - a.date);

    // Cache
    if (allItems.length > 0) {
        State.cache.wire = { items: allItems.slice(0, 20), timestamp: Date.now() };
        saveCache();
    } else if (State.cache.wire) {
        allItems = State.cache.wire.items;
    }

    // Render
    renderWireFeed(container, allItems.slice(0, 20));
    State.feedsLoaded += feedsLoaded;
    updateFeedStatus();
}

function renderWireFeed(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<div class="feed-unavailable">WIRE FEED UNAVAILABLE</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="feed-item">
            <a href="${item.link}" target="_blank" rel="noopener">
                <span class="feed-time">${formatTime(item.date)}</span>
                <span class="feed-headline">${item.title}</span>
            </a>
        </div>
    `).join('');
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
    State.feedsTotal = CONFIG.RSS_FEEDS.wire.length +
                       CONFIG.RSS_FEEDS.headlines.length +
                       CONFIG.RSS_FEEDS.substacks.length + 3; // +3 for breaking, stocks, weather
    State.errors = 0;

    updateFeedStatus(0, State.feedsTotal);

    // Parallel fetch
    await Promise.allSettled([
        fetchStockData(),
        fetchWireFeed(),
        fetchHeadlinesFeed(),
        fetchSubstacksFeed(),
        fetchBreakingNews(),
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
