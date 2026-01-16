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

    // CORS Proxy options (try multiple if one fails)
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],

    // RSS Feed Sources
    RSS_FEEDS: {
        // Wire feeds
        wire: [
            { name: 'AP', url: 'https://rsshub.app/apnews/topics/apf-topnews', source: 'ap' },
            { name: 'Reuters', url: 'https://rsshub.app/reuters/world', source: 'reuters' }
        ],
        // Major publications
        headlines: [
            { name: 'NYT', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'nyt' },
            { name: 'WSJ', url: 'https://feeds.a]wsj.com/rss/RSSWorldNews.xml', source: 'wsj' },
            { name: 'Atlantic', url: 'https://www.theatlantic.com/feed/all/', source: 'atlantic' },
            { name: 'Tribune', url: 'https://www.chicagotribune.com/arcio/rss/', source: 'tribune' },
            { name: 'Block Club', url: 'https://blockclubchicago.org/feed/', source: 'blockclub' },
            { name: 'Onion', url: 'https://www.theonion.com/rss', source: 'onion' }
        ],
        // Substacks
        substacks: [
            { name: 'Slow Boring', author: 'Matt Yglesias', url: 'https://www.slowboring.com/feed', source: 'substack' },
            { name: 'Noahpinion', author: 'Noah Smith', url: 'https://www.noahpinion.blog/feed', source: 'substack' },
            { name: 'BIG', author: 'Matt Stoller', url: 'https://www.thebignewsletter.com/feed', source: 'substack' },
            { name: 'Very Serious', author: 'Josh Barro', url: 'https://www.joshbarro.com/feed', source: 'substack' },
            { name: 'I Might Be Wrong', author: 'Kyla Scanlon', url: 'https://kyla.substack.com/feed', source: 'substack' }
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
        cubs: { name: 'Cubs', sport: 'baseball', league: 'mlb', team: 'chc' },
        bears: { name: 'Bears', sport: 'football', league: 'nfl', team: 'chi' },
        bulls: { name: 'Bulls', sport: 'basketball', league: 'nba', team: 'chi' },
        blackhawks: { name: 'Hawks', sport: 'hockey', league: 'nhl', team: 'chi' },
        iuFootball: { name: 'IU FB', sport: 'football', league: 'college-football', team: '84' },
        iuBasketball: { name: 'IU BB', sport: 'basketball', league: 'mens-college-basketball', team: '84' }
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
    currentProxy: 0
};

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
    const proxies = CONFIG.CORS_PROXIES;

    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxyUrl = proxies[(State.currentProxy + i) % proxies.length] + encodeURIComponent(url);
            const response = await fetch(proxyUrl, { timeout: 10000 });
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
// THEME TOGGLE
// ============================================

function initTheme() {
    document.documentElement.setAttribute('data-theme', State.theme);
    updateThemeButton();
}

function toggleTheme() {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('dashboard-theme', State.theme);
    updateThemeButton();
}

function updateThemeButton() {
    document.getElementById('theme-toggle').textContent = State.theme === 'dark' ? '☀' : '◐';
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
            const item = document.createElement('span');
            item.className = 'ticker-item';
            item.innerHTML = `
                <span class="ticker-label">${symbol}</span>
                <span class="ticker-value">${formatPrice(quote.regularMarketPrice)}</span>
                <span class="ticker-change ${getChangeClass(quote.regularMarketChangePercent)}">${formatPercent(quote.regularMarketChangePercent)}</span>
            `;
            stocksContainer.appendChild(item);
        }
    });
}

function updateTickerItem(id, quote) {
    const el = document.getElementById(id);
    if (!el || !quote) return;

    const valueEl = el.querySelector('.ticker-value');
    const changeEl = el.querySelector('.ticker-change');

    if (valueEl) valueEl.textContent = formatPrice(quote.regularMarketPrice);
    if (changeEl) {
        changeEl.textContent = formatPercent(quote.regularMarketChangePercent);
        changeEl.className = `ticker-change ${getChangeClass(quote.regularMarketChangePercent)}`;
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
// HEADLINES FEED
// ============================================

async function fetchHeadlinesFeed() {
    const container = document.getElementById('headlines-feed');
    let allItems = [];
    let feedsLoaded = 0;

    for (const feed of CONFIG.RSS_FEEDS.headlines) {
        try {
            const xml = await fetchWithProxy(feed.url);
            const items = parseRSS(xml);
            items.forEach(item => {
                item.source = feed.source;
                item.sourceName = feed.name;
            });
            allItems = allItems.concat(items.slice(0, 5)); // Limit per source
            feedsLoaded++;
        } catch (e) {
            console.warn(`Headlines feed ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    // Sort by date
    allItems.sort((a, b) => b.date - a.date);

    // Cache
    if (allItems.length > 0) {
        State.cache.headlines = { items: allItems.slice(0, 25), timestamp: Date.now() };
        saveCache();
    } else if (State.cache.headlines) {
        allItems = State.cache.headlines.items;
    }

    // Render
    renderHeadlinesFeed(container, allItems.slice(0, 25));
    State.feedsLoaded += feedsLoaded;
    updateFeedStatus();
}

function renderHeadlinesFeed(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<div class="feed-unavailable">HEADLINES UNAVAILABLE</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="feed-item">
            <a href="${item.link}" target="_blank" rel="noopener">
                <span class="feed-source source-${item.source}">${item.sourceName}</span>
                <span class="feed-headline">${item.title}</span>
            </a>
        </div>
    `).join('');
}

// ============================================
// SUBSTACKS FEED
// ============================================

async function fetchSubstacksFeed() {
    const container = document.getElementById('substacks-feed');
    let allItems = [];
    let feedsLoaded = 0;

    for (const feed of CONFIG.RSS_FEEDS.substacks) {
        try {
            const xml = await fetchWithProxy(feed.url);
            const items = parseRSS(xml);
            items.forEach(item => {
                item.source = feed.source;
                item.sourceName = feed.name;
                item.author = feed.author;
            });
            allItems = allItems.concat(items.slice(0, 3)); // Limit per source
            feedsLoaded++;
        } catch (e) {
            console.warn(`Substack ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    // Sort by date
    allItems.sort((a, b) => b.date - a.date);

    // Cache
    if (allItems.length > 0) {
        State.cache.substacks = { items: allItems.slice(0, 15), timestamp: Date.now() };
        saveCache();
    } else if (State.cache.substacks) {
        allItems = State.cache.substacks.items;
    }

    // Render
    renderSubstacksFeed(container, allItems.slice(0, 15));
    State.feedsLoaded += feedsLoaded;
    updateFeedStatus();
}

function renderSubstacksFeed(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<div class="feed-unavailable">SUBSTACKS UNAVAILABLE</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="substack-item">
            <a href="${item.link}" target="_blank" rel="noopener">
                <div class="substack-meta">
                    <span class="substack-author">${item.author}</span>
                    <span class="substack-date">${formatRelativeTime(item.date)}</span>
                </div>
                <div class="substack-title">${item.title}</div>
            </a>
        </div>
    `).join('');
}

// ============================================
// BREAKING NEWS
// ============================================

async function fetchBreakingNews() {
    try {
        // Use AP top news
        const url = 'https://rsshub.app/apnews/topics/apf-topnews';
        const xml = await fetchWithProxy(url);
        const items = parseRSS(xml);

        if (items.length > 0) {
            const top = items[0];
            document.getElementById('breaking-headline').innerHTML =
                `<a href="${top.link}" target="_blank">${top.title}</a>`;

            State.cache.breaking = { item: top, timestamp: Date.now() };
            saveCache();
        }
    } catch (e) {
        console.warn('Breaking news failed:', e);
        if (State.cache.breaking) {
            const top = State.cache.breaking.item;
            document.getElementById('breaking-headline').innerHTML =
                `<a href="${top.link}" target="_blank">${top.title}</a>`;
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

        if (data.features && data.features.length > 0) {
            const alert = data.features[0].properties;
            alertEl.textContent = alert.event.toUpperCase();
            alertEl.className = 'status-value alert';
        } else {
            alertEl.textContent = 'NO ALERTS';
            alertEl.className = 'status-value ok';
        }

        State.cache.weather = { data: data, timestamp: Date.now() };
        saveCache();
    } catch (e) {
        console.warn('Weather fetch failed:', e);
        const alertEl = document.getElementById('weather-alert').querySelector('.status-value');
        alertEl.textContent = 'UNAVAILABLE';
        alertEl.className = 'status-value';
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

        // For demo purposes, use a simple rule
        // In production, use ProPublica API: https://api.propublica.org/congress/v1/
        if (isWeekday && isBusinessHours) {
            statusEl.textContent = 'IN SESSION';
            statusEl.className = 'status-value session';
        } else {
            statusEl.textContent = 'IN RECESS';
            statusEl.className = 'status-value recess';
        }
    } catch (e) {
        statusEl.textContent = 'UNKNOWN';
        statusEl.className = 'status-value';
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
                const opponent = nextGame.competitions?.[0]?.competitors?.find(c => c.team.abbreviation !== team.team.toUpperCase());
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

    console.log('Refresh complete');
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('News Dashboard initializing...');

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
