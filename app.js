/**
 * ============================================
 * DUNCAN'S DASHBOARD v2.0
 * Personal Intelligence Terminal
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    REFRESH_INTERVAL: 60000,
    BACKEND_URL: '', // Set to your Vercel backend URL when deployed, e.g. 'https://duncans-dashboard-api.vercel.app'

    // Supabase (new dashboard project)
    SUPABASE_URL: 'https://xymzjlzkitciequnggkz.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bXpqbHpraXRjaWVxdW5nZ2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjkzNDEsImV4cCI6MjA4OTIwNTM0MX0.b_lq6LU-SnUYxS-vVs8Z8rKzvcO_8Z6iyv2E8f4w0uI',

    // Supabase (existing prediction tracker)
    PREDICTIONS_SUPABASE_URL: 'https://lrkjmpsbrsmqajeyyyoe.supabase.co',
    PREDICTIONS_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxya2ptcHNicnNtcWFqZXl5eW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MjIzMzYsImV4cCI6MjA4Mzk5ODMzNn0.3KY0yuqaCShgk3GjYmxAsO5Vw6qXy0gbk2BKB56WUDU',

    // CORS Proxy options
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],

    // RSS Feed Sources
    RSS_FEEDS: {
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

    STOCKS: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'DIS', 'T'],

    INDICES: {
        sp500: '^GSPC',
        nasdaq: '^IXIC',
        dow: '^DJI'
    },

    SPORTS: {
        cubs: { name: 'Cubs', sport: 'baseball', league: 'mlb', team: 'chc', abbrev: 'CHC' },
        bears: { name: 'Bears', sport: 'football', league: 'nfl', team: 'chi', abbrev: 'CHI' },
        bulls: { name: 'Bulls', sport: 'basketball', league: 'nba', team: 'chi', abbrev: 'CHI' },
        blackhawks: { name: 'Hawks', sport: 'hockey', league: 'nhl', team: 'chi', abbrev: 'CHI' },
        iuFootball: { name: 'IU FB', sport: 'football', league: 'college-football', team: '84', abbrev: 'IU' },
        iuBasketball: { name: 'IU BB', sport: 'basketball', league: 'mens-college-basketball', team: '84', abbrev: 'IU' }
    },

    WEATHER_ZONE: 'ILZ014',

    // Alert tier thresholds
    ALERT_KEYWORDS_FLASH: ['BREAKING', 'URGENT', 'FLASH', 'EMERGENCY'],
    ALERT_KEYWORDS_PRIORITY: ['DEVELOPING', 'UPDATE', 'ALERT'],

    // Risk gauge thresholds
    RISK_THRESHOLDS: {
        vix: { low: 15, mid: 20, high: 25, extreme: 30 },
        yield: { inverted: 0, low: 0.5, normal: 1.0 },
        unemployment: { low: 4, mid: 5, high: 6 }
    }
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
    todayDate: new Date().toDateString(),
    dailyHeadlines: JSON.parse(localStorage.getItem('daily-headlines') || '[]'),
    dailySubstacks: JSON.parse(localStorage.getItem('daily-substacks') || '[]'),
    readItems: JSON.parse(localStorage.getItem('read-items') || '{}'),
    // New v2 state
    riskGauges: {},
    signals: [],
    sweepDelta: null,
    lastSeen: localStorage.getItem('last-seen') || null,
    predictions: null,
    bootComplete: sessionStorage.getItem('boot-complete') === 'true',
    secondaryOpen: false,
    sensorStatus: {}
};

// ============================================
// BOOT SEQUENCE
// ============================================

const BOOT_LINES = [
    { text: 'MARKET FEEDS', status: 'pending' },
    { text: 'RSS SOURCES (11)', status: 'pending' },
    { text: 'FRED INDICATORS', status: 'pending' },
    { text: 'ENERGY DATA', status: 'pending' },
    { text: 'WEATHER SERVICE', status: 'pending' },
    { text: 'SPORTS FEED', status: 'pending' },
    { text: 'PREDICTIONS DB', status: 'pending' },
    { text: 'SWEEP DELTA COMPUTING...', status: 'info' }
];

let bootLineIndex = 0;
let bootTimeout = null;

function initBoot() {
    if (State.bootComplete) {
        document.getElementById('boot-overlay').classList.add('hidden');
        initDashboard();
        return;
    }

    const log = document.getElementById('boot-log');
    log.innerHTML = '';
    bootLineIndex = 0;
    showNextBootLine();
}

function showNextBootLine() {
    if (bootLineIndex >= BOOT_LINES.length) {
        // Final line
        const log = document.getElementById('boot-log');
        const final = document.createElement('div');
        final.className = 'boot-log-line';
        final.innerHTML = '<span class="info">TERMINAL ACTIVE</span>';
        final.style.animationDelay = '0.1s';
        log.appendChild(final);

        bootTimeout = setTimeout(() => completeBoot(), 800);
        return;
    }

    const line = BOOT_LINES[bootLineIndex];
    const log = document.getElementById('boot-log');
    const el = document.createElement('div');
    el.className = 'boot-log-line';

    const statusClass = line.status === 'info' ? 'info' : 'ok';
    const prefix = line.status === 'info' ? '[--]' : '[OK]';
    el.innerHTML = `<span class="${statusClass}">${prefix}</span> ${line.text}`;

    log.appendChild(el);
    bootLineIndex++;

    bootTimeout = setTimeout(() => showNextBootLine(), 200);
}

function skipBoot() {
    if (bootTimeout) clearTimeout(bootTimeout);
    completeBoot();
}

function completeBoot() {
    const overlay = document.getElementById('boot-overlay');
    overlay.classList.add('fade-out');
    sessionStorage.setItem('boot-complete', 'true');
    State.bootComplete = true;

    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 600);

    initDashboard();
}

// ============================================
// DASHBOARD INITIALIZATION
// ============================================

function initDashboard() {
    initTheme();
    initClock();
    initSecondaryNav();
    initPredictionInput();
    checkDailyReset();
    updateAll();
    setInterval(updateAll, CONFIG.REFRESH_INTERVAL);
}

function updateAll() {
    State.feedsLoaded = 0;
    State.feedsTotal = 0;
    State.errors = 0;

    // Count expected feeds
    State.feedsTotal = CONFIG.RSS_FEEDS.headlines.length + CONFIG.RSS_FEEDS.substacks.length + 5; // +5 for stocks, weather, congress, sports, backend

    // Client-side fetches
    fetchStockData();
    fetchHeadlinesFeed();
    fetchSubstacksFeed();
    fetchAlertBar();
    fetchWeatherAlerts();
    fetchCongressStatus();
    fetchSportsData();

    // Backend fetches (if backend configured)
    if (CONFIG.BACKEND_URL) {
        fetchRiskGauges();
        fetchSweepDelta();
        fetchPredictions();
    } else {
        // Fallback: direct API calls for risk gauges
        fetchRiskGaugesDirect();
        renderSweepDeltaLocal();
        fetchPredictionsDirect();
    }

    // Update signals
    computeSignals();

    // Update timestamps
    State.lastUpdate = new Date();
    document.getElementById('last-updated').textContent = `Updated: ${formatTime(State.lastUpdate)}`;
    document.getElementById('sweep-time').textContent = `Last sweep: ${formatTime(State.lastUpdate)}`;

    // Update Excel elements
    updateExcelTime();
}

// ============================================
// UTILITIES
// ============================================

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatTimeFull(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

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

async function fetchWithProxy(url) {
    // Try rss2json first
    try {
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetch(rss2jsonUrl);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && data.items) {
                return convertRss2JsonToXml(data);
            }
        }
    } catch (e) {
        console.warn('rss2json failed:', e.message);
    }

    // Fallback to CORS proxies
    for (let i = 0; i < CONFIG.CORS_PROXIES.length; i++) {
        try {
            const proxyUrl = CONFIG.CORS_PROXIES[(State.currentProxy + i) % CONFIG.CORS_PROXIES.length] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (response.ok) {
                State.currentProxy = (State.currentProxy + i) % CONFIG.CORS_PROXIES.length;
                return await response.text();
            }
        } catch (e) {
            console.warn(`Proxy ${i} failed for ${url}:`, e.message);
        }
    }
    throw new Error('All proxies failed');
}

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

function parseRSS(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid RSS feed');

    const items = [];
    doc.querySelectorAll('item, entry').forEach(entry => {
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

function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function saveCache() {
    try {
        localStorage.setItem('dashboard-cache', JSON.stringify(State.cache));
    } catch (e) {
        console.warn('Failed to save cache:', e);
    }
}

function updateFeedStatus(loaded, total, error = false) {
    if (loaded !== undefined) State.feedsLoaded = loaded;
    if (total !== undefined) State.feedsTotal = total;
    if (error) State.errors++;

    document.getElementById('feeds-loaded').textContent = State.feedsLoaded;
    document.getElementById('feeds-total').textContent = State.feedsTotal;
    document.getElementById('errors-count').textContent = `Errors: ${State.errors}`;

    const statusEl = document.getElementById('connection-status');
    if (State.errors > State.feedsTotal / 2) {
        statusEl.textContent = '\u25CF DEGRADED';
        statusEl.className = 'status-error';
    } else {
        statusEl.textContent = '\u25CF CONNECTED';
        statusEl.className = 'status-ok';
    }

    // Update sensor grid
    updateSensorGrid();
}

function getItemId(item) {
    return btoa(encodeURIComponent(item.title + item.link)).slice(0, 32);
}

function checkDailyReset() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('daily-date');
    if (storedDate !== today) {
        State.dailyHeadlines = [];
        State.dailySubstacks = [];
        State.readItems = {};
        State.todayDate = today;
        localStorage.setItem('daily-date', today);
        localStorage.setItem('daily-headlines', '[]');
        localStorage.setItem('daily-substacks', '[]');
        localStorage.setItem('read-items', '{}');
    }
}

function markAsRead(itemId, url, title) {
    State.readItems[itemId] = true;
    localStorage.setItem('read-items', JSON.stringify(State.readItems));
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    if (element) element.classList.add('read');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================
// CLOCK
// ============================================

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    document.getElementById('clock').textContent = formatTimeFull(new Date());
    const excelClock = document.getElementById('excel-clock');
    if (excelClock) excelClock.textContent = formatTimeFull(new Date());
}

// ============================================
// THEME TOGGLE (3 themes)
// ============================================

const THEMES = ['dark', 'light', 'excel'];
const THEME_ICONS = { dark: '\u2600', light: '\u25D0', excel: '\u25A6' };

function initTheme() {
    if (!THEMES.includes(State.theme)) State.theme = 'dark';
    document.documentElement.setAttribute('data-theme', State.theme);
    updateThemeButton();
    initExcelUI();
}

function toggleTheme() {
    const nextIndex = (THEMES.indexOf(State.theme) + 1) % THEMES.length;
    State.theme = THEMES[nextIndex];
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('dashboard-theme', State.theme);
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    btn.textContent = THEME_ICONS[State.theme] || '\u25D0';
}

// ============================================
// EXCEL UI
// ============================================

function initExcelUI() {
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

function updateExcelStocks(quoteMap) {
    const updates = [
        { id: 'excel-sp500', symbol: '^GSPC', label: 'S&P' },
        { id: 'excel-dow', symbol: '^DJI', label: 'DOW' },
        { id: 'excel-btc', symbol: 'BTC-USD', label: 'BTC' }
    ];
    updates.forEach(({ id, symbol, label }) => {
        const quote = quoteMap[symbol];
        const el = document.getElementById(id);
        if (!el || !quote) return;
        const change = getQuoteChange(quote);
        const pos = change >= 0;
        el.className = `ribbon-btn ${pos ? 'stock-positive' : 'stock-negative'}`;
        el.innerHTML = `<span class="ribbon-btn-icon" style="color: ${pos ? '#006600' : '#cc0000'};">${pos ? '\u25B2' : '\u25BC'}</span><span>${label} ${formatPercent(change)}</span>`;
    });
}

function updateExcelStatus(congress, weather) {
    if (congress) {
        const el = document.getElementById('excel-congress');
        if (el) {
            const isSession = congress.includes('SESSION');
            el.innerHTML = `<span class="ribbon-btn-icon">\u{1F3DB}\uFE0F</span><span style="color: ${isSession ? '#006600' : '#666'};">${congress}</span>`;
        }
    }
    if (weather) {
        const el = document.getElementById('excel-weather');
        if (el) {
            const hasAlert = !weather.includes('NO ALERT');
            el.innerHTML = `<span class="ribbon-btn-icon">${hasAlert ? '\u26A0\uFE0F' : '\u{1F324}\uFE0F'}</span><span style="color: ${hasAlert ? '#cc0000' : '#666'};">${weather}</span>`;
        }
    }
}

function updateExcelTime() {
    const el = document.getElementById('excel-updated');
    if (el) el.textContent = `Updated: ${formatTime(new Date())}`;
}

// ============================================
// SPARKLINES
// ============================================

function renderSparkline(svgId, values, direction) {
    const svg = document.getElementById(svgId);
    if (!svg || !values || values.length < 2) return;

    const w = 40, h = 14;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 2) - 1;
        return `${x},${y}`;
    }).join(' ');

    svg.innerHTML = `<polyline points="${points}" />`;
    svg.className.baseVal = `sparkline ${direction}`;
}

function renderGaugeSparkline(gaugeId, values) {
    const gauge = document.getElementById(gaugeId);
    if (!gauge) return;
    const svg = gauge.querySelector('.gauge-sparkline');
    if (!svg || !values || values.length < 2) return;

    const w = svg.clientWidth || 220;
    const h = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 2) - 1;
        return `${x},${y}`;
    }).join(' ');

    svg.innerHTML = `<polyline points="${points}" />`;
}

// ============================================
// STOCK DATA
// ============================================

async function fetchStockData() {
    try {
        const symbols = [...Object.values(CONFIG.INDICES), ...CONFIG.STOCKS, 'BTC-USD', 'CL=F'];
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;

        try {
            const data = await fetchWithProxy(url);
            const json = JSON.parse(data);
            if (json.quoteResponse && json.quoteResponse.result) {
                processStockData(json.quoteResponse.result);
                State.cache.stocks = { data: json.quoteResponse.result, timestamp: Date.now() };
                saveCache();
                updateSensor('markets', 'ok', symbols.length);
                return;
            }
        } catch (e) {
            console.warn('Yahoo Finance failed:', e);
        }

        if (State.cache.stocks) {
            processStockData(State.cache.stocks.data);
            updateSensor('markets', 'warn', 'cached');
        }
    } catch (e) {
        console.error('Stock data fetch failed:', e);
        updateSensor('markets', 'error', 'ERR');
        updateFeedStatus(undefined, undefined, true);
    }
}

function processStockData(quotes) {
    const quoteMap = {};
    quotes.forEach(q => { quoteMap[q.symbol] = q; });

    // Update indices with sparkline data
    updateTickerItem('sp500', quoteMap['^GSPC']);
    updateTickerItem('nasdaq', quoteMap['^IXIC']);
    updateTickerItem('dow', quoteMap['^DJI']);
    updateTickerItem('btc', quoteMap['BTC-USD']);
    updateTickerItem('oil', quoteMap['CL=F']);

    // Store sparkline history
    storeSparklineHistory(quoteMap);

    // Individual stocks
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

    updateExcelStocks(quoteMap);
    State.feedsLoaded++;
    updateFeedStatus();
}

function storeSparklineHistory(quoteMap) {
    // Store price history for sparklines in localStorage
    const history = JSON.parse(localStorage.getItem('sparkline-history') || '{}');
    const now = Date.now();

    const trackSymbols = { sp500: '^GSPC', nasdaq: '^IXIC', dow: '^DJI', btc: 'BTC-USD', oil: 'CL=F' };

    Object.entries(trackSymbols).forEach(([key, symbol]) => {
        const quote = quoteMap[symbol];
        if (!quote) return;
        const price = getQuotePrice(quote);
        if (!price) return;

        if (!history[key]) history[key] = [];
        history[key].push({ t: now, v: price });
        // Keep last 30 data points
        if (history[key].length > 30) history[key] = history[key].slice(-30);

        const values = history[key].map(p => p.v);
        const change = getQuoteChange(quote);
        const direction = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        renderSparkline(`spark-${key}`, values, direction);
    });

    localStorage.setItem('sparkline-history', JSON.stringify(history));
}

function updateTickerItem(id, quote) {
    const el = document.getElementById(id);
    if (!el || !quote) return;
    const valueEl = el.querySelector('.ticker-value');
    const changeEl = el.querySelector('.ticker-change');
    const price = getQuotePrice(quote);
    const change = getQuoteChange(quote);
    if (valueEl) valueEl.textContent = formatPrice(price);
    if (changeEl) {
        changeEl.textContent = formatPercent(change);
        changeEl.className = `ticker-change ${getChangeClass(change)}`;
    }
}

function getQuotePrice(quote) {
    return quote.regularMarketPrice || quote.postMarketPrice || quote.preMarketPrice || quote.regularMarketPreviousClose || null;
}

function getQuoteChange(quote) {
    if (quote.regularMarketChangePercent != null) return quote.regularMarketChangePercent;
    if (quote.postMarketChangePercent != null) return quote.postMarketChangePercent;
    if (quote.preMarketChangePercent != null) return quote.preMarketChangePercent;
    return 0;
}

function formatPrice(price) {
    if (!price) return '---';
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(pct) {
    if (pct == null) return '--%';
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

function getChangeClass(pct) {
    if (pct > 0) return 'positive';
    if (pct < 0) return 'negative';
    return 'neutral';
}

// ============================================
// HEADLINES FEED
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
            const limit = feed.source === 'drudge' ? 20 : 5;
            newItems = newItems.concat(items.slice(0, limit));
            feedsLoaded++;
        } catch (e) {
            console.warn(`Headlines feed ${feed.name} failed:`, e);
            updateFeedStatus(undefined, undefined, true);
        }
    }

    const existingIds = new Set(State.dailyHeadlines.map(item => item.id));
    newItems.forEach(item => {
        if (!existingIds.has(item.id)) State.dailyHeadlines.push(item);
    });

    State.dailyHeadlines.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('daily-headlines', JSON.stringify(State.dailyHeadlines));

    renderHeadlinesFeed(container, State.dailyHeadlines);
    State.feedsLoaded += feedsLoaded;
    updateSensor('feeds', feedsLoaded > 0 ? 'ok' : 'error', feedsLoaded);
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
// SUBSTACKS FEED
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

    const existingIds = new Set(State.dailySubstacks.map(item => item.id));
    newItems.forEach(item => {
        if (!existingIds.has(item.id)) State.dailySubstacks.push(item);
    });

    State.dailySubstacks.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('daily-substacks', JSON.stringify(State.dailySubstacks));

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
// MULTI-TIER ALERT BAR
// ============================================

async function fetchAlertBar() {
    try {
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
            } catch (e) { /* skip */ }
        }

        allItems.sort((a, b) => b.date - a.date);
        const topItems = allItems.slice(0, 10);

        if (topItems.length > 0) {
            classifyAndRenderAlerts(topItems);
            State.cache.alerts = { items: topItems, timestamp: Date.now() };
            saveCache();
        }
    } catch (e) {
        if (State.cache.alerts?.items) {
            classifyAndRenderAlerts(State.cache.alerts.items);
        }
    }
}

function classifyAndRenderAlerts(items) {
    const bar = document.getElementById('alert-bar');
    const badge = document.getElementById('alert-tier-badge');
    const headline = document.getElementById('alert-headline');

    // Classify tier based on keywords
    let tier = 'routine';
    for (const item of items) {
        const upper = item.title.toUpperCase();
        if (CONFIG.ALERT_KEYWORDS_FLASH.some(k => upper.includes(k))) {
            tier = 'flash';
            break;
        }
        if (CONFIG.ALERT_KEYWORDS_PRIORITY.some(k => upper.includes(k))) {
            tier = 'priority';
        }
    }

    // Apply tier styling
    bar.className = `tier-${tier}`;
    badge.textContent = tier.toUpperCase();

    // Render scrolling ticker
    const tickerContent = items.map(item =>
        `<span class="ticker-headline"><a href="${item.link}" target="_blank">${item.title}</a></span>`
    ).join('<span class="ticker-separator">\u2022\u2022\u2022</span>');

    headline.innerHTML = `
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
            weatherText = data.features[0].properties.event.toUpperCase();
            alertEl.textContent = weatherText;
            alertEl.className = 'status-value alert';
        } else {
            alertEl.textContent = weatherText;
            alertEl.className = 'status-value ok';
        }

        updateExcelStatus(null, weatherText);
        updateSensor('weather', 'ok', data.features?.length || 0);
        State.cache.weather = { data, timestamp: Date.now() };
        saveCache();
    } catch (e) {
        const alertEl = document.getElementById('weather-alert').querySelector('.status-value');
        alertEl.textContent = 'UNAVAILABLE';
        alertEl.className = 'status-value';
        updateSensor('weather', 'error', 'ERR');
    }
}

// ============================================
// CONGRESS STATUS
// ============================================

function fetchCongressStatus() {
    const statusEl = document.getElementById('congress-status').querySelector('.status-value');
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours = hour >= 9 && hour <= 18;

    let congressText;
    if (isWeekday && isBusinessHours) {
        congressText = 'IN SESSION';
        statusEl.className = 'status-value session';
    } else {
        congressText = 'IN RECESS';
        statusEl.className = 'status-value recess';
    }
    statusEl.textContent = congressText;
    updateExcelStatus(congressText, null);
}

// ============================================
// SPORTS DATA
// ============================================

async function fetchSportsData() {
    const container = document.getElementById('sports-ticker');
    container.innerHTML = '';
    let sportsLoaded = 0;

    for (const [key, team] of Object.entries(CONFIG.SPORTS)) {
        try {
            const url = `https://site.api.espn.com/apis/site/v2/sports/${team.sport}/${team.league}/teams/${team.team}/schedule`;
            const response = await fetch(url);
            const data = await response.json();

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
                const gameDate = new Date(nextGame.date);
                const opponent = nextGame.name || 'TBD';
                const shortOpp = opponent.replace(team.name, '').replace(' at ', 'vs ').replace(' vs ', 'vs ').trim().split(' ').slice(0, 2).join(' ');

                const item = document.createElement('span');
                item.className = 'sport-item';
                item.innerHTML = `
                    <span class="sport-team">${team.abbrev}</span>
                    <span class="sport-opponent">${shortOpp}</span>
                    <span class="sport-date">${formatRelativeTime(gameDate)}</span>
                `;
                container.appendChild(item);
                sportsLoaded++;
            }
        } catch (e) {
            console.warn(`Sports ${team.name} failed:`, e);
        }
    }

    updateSensor('sports', sportsLoaded > 0 ? 'ok' : 'warn', sportsLoaded);
}

// ============================================
// SENSOR GRID
// ============================================

function updateSensor(name, status, value) {
    State.sensorStatus[name] = { status, value };
    const item = document.querySelector(`[data-sensor="${name}"]`);
    if (!item) return;

    const dot = item.querySelector('.sensor-dot');
    const valueEl = item.querySelector('.sensor-value');

    dot.className = `sensor-dot ${status}`;
    if (value !== undefined) valueEl.textContent = value;
}

function updateSensorGrid() {
    // Update feeds sensor with loaded count
    const feedCount = State.feedsLoaded;
    const feedStatus = State.errors === 0 ? 'ok' : State.errors < State.feedsTotal / 2 ? 'warn' : 'error';
    updateSensor('feeds', feedStatus, `${feedCount}/${State.feedsTotal}`);
}

// ============================================
// RISK GAUGES (Direct FRED API fallback)
// ============================================

async function fetchRiskGaugesDirect() {
    // FRED API calls routed through CORS proxy
    const FRED_KEY = '85bb3257d36338da2d0ad8aa14609f3b';
    const series = {
        vix: 'VIXCLS',
        yield: 'T10Y2Y',
        fedfunds: 'FEDFUNDS',
        cpi: 'CPIAUCSL',
        unemployment: 'UNRATE',
        gscpi: 'GSCPI'
    };

    for (const [key, seriesId] of Object.entries(series)) {
        try {
            const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=30`;
            // Use CORS proxy since FRED doesn't allow browser CORS
            let data = null;
            for (const proxy of CONFIG.CORS_PROXIES) {
                try {
                    const response = await fetch(proxy + encodeURIComponent(fredUrl));
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) { continue; }
            }
            if (!data) throw new Error('All proxies failed');

            if (data.observations && data.observations.length > 0) {
                const values = data.observations
                    .filter(o => o.value !== '.')
                    .map(o => parseFloat(o.value))
                    .reverse();

                let latest = values[values.length - 1];

                // CPI: compute YoY % change from raw index
                if (key === 'cpi' && values.length >= 13) {
                    const currentCPI = values[values.length - 1];
                    const yearAgoCPI = values[values.length - 13]; // 12 months ago
                    latest = ((currentCPI - yearAgoCPI) / yearAgoCPI) * 100;
                } else if (key === 'cpi' && values.length >= 2) {
                    // Fallback: approximate with available data
                    const currentCPI = values[values.length - 1];
                    const oldCPI = values[0];
                    const months = values.length - 1;
                    latest = ((currentCPI - oldCPI) / oldCPI) * 100 * (12 / months);
                }

                State.riskGauges[key] = { value: latest, history: key === 'cpi' ? values : values };
                renderGauge(key, latest, values);
            }
        } catch (e) {
            console.warn(`FRED ${key} failed:`, e);
        }
    }

    updateSensor('fred', Object.keys(State.riskGauges).length > 0 ? 'ok' : 'error',
        Object.keys(State.riskGauges).length);
}

async function fetchRiskGauges() {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/market/indicators`);
        const data = await response.json();
        if (data.indicators) {
            Object.entries(data.indicators).forEach(([key, info]) => {
                State.riskGauges[key] = info;
                renderGauge(key, info.value, info.history);
            });
            updateSensor('fred', 'ok', Object.keys(data.indicators).length);
        }
    } catch (e) {
        console.warn('Backend indicators failed, trying direct:', e);
        fetchRiskGaugesDirect();
    }
}

function renderGauge(key, value, history) {
    const gauge = document.getElementById(`gauge-${key}`);
    if (!gauge) return;

    const valueEl = gauge.querySelector('.gauge-value');
    const barFill = gauge.querySelector('.gauge-bar-fill');

    // Format value
    let displayValue = value.toFixed(2);
    let barPercent = 0;
    let barClass = 'low';
    let valueClass = '';

    switch (key) {
        case 'vix':
            displayValue = value.toFixed(1);
            barPercent = Math.min((value / 40) * 100, 100);
            if (value >= 30) { barClass = 'extreme'; valueClass = 'danger'; }
            else if (value >= 25) { barClass = 'high'; valueClass = 'danger'; }
            else if (value >= 20) { barClass = 'mid'; valueClass = 'elevated'; }
            else { barClass = 'low'; valueClass = 'safe'; }
            break;
        case 'yield':
            displayValue = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
            barPercent = Math.min(Math.abs(value) / 3 * 100, 100);
            if (value < 0) { barClass = 'extreme'; valueClass = 'inverted'; }
            else if (value < 0.5) { barClass = 'mid'; valueClass = 'elevated'; }
            else { barClass = 'low'; valueClass = 'safe'; }
            break;
        case 'fedfunds':
            displayValue = `${value.toFixed(2)}%`;
            barPercent = Math.min((value / 8) * 100, 100);
            barClass = value > 5 ? 'high' : value > 3 ? 'mid' : 'low';
            break;
        case 'cpi':
            displayValue = `${value.toFixed(1)}%`;
            barPercent = Math.min((value / 10) * 100, 100);
            barClass = value > 5 ? 'extreme' : value > 3 ? 'mid' : 'low';
            break;
        case 'unemployment':
            displayValue = `${value.toFixed(1)}%`;
            barPercent = Math.min((value / 10) * 100, 100);
            barClass = value > 6 ? 'high' : value > 5 ? 'mid' : 'low';
            break;
        case 'gscpi':
            displayValue = value.toFixed(2);
            barPercent = Math.min(Math.abs(value) / 4 * 100, 100);
            barClass = value > 2 ? 'extreme' : value > 1 ? 'high' : value > 0 ? 'mid' : 'low';
            break;
    }

    valueEl.textContent = displayValue;
    if (valueClass) valueEl.className = `gauge-value ${valueClass}`;
    barFill.style.width = `${barPercent}%`;
    barFill.className = `gauge-bar-fill ${barClass}`;

    // Render sparkline if history available
    if (history && history.length > 1) {
        renderGaugeSparkline(`gauge-${key}`, history);
    }
}

// ============================================
// SWEEP DELTA (Local fallback)
// ============================================

function renderSweepDeltaLocal() {
    const list = document.getElementById('sweep-delta-list');
    const summary = document.getElementById('sweep-summary');
    const directionEl = document.getElementById('delta-direction');

    // Compare with last seen state
    const lastState = JSON.parse(localStorage.getItem('last-dashboard-state') || '{}');
    const changes = [];

    // Check headline count changes
    const lastHeadlineCount = lastState.headlineCount || 0;
    const newHeadlines = State.dailyHeadlines.length - lastHeadlineCount;
    if (newHeadlines > 0) {
        changes.push({ type: 'new', text: `${newHeadlines} new headlines`, category: 'news' });
    }

    // Check substack changes
    const lastSubstackCount = lastState.substackCount || 0;
    const newSubstacks = State.dailySubstacks.length - lastSubstackCount;
    if (newSubstacks > 0) {
        changes.push({ type: 'new', text: `${newSubstacks} new substack posts`, category: 'news' });
    }

    // Check market changes from cache
    if (State.cache.stocks?.data && lastState.stockPrices) {
        State.cache.stocks.data.forEach(quote => {
            const lastPrice = lastState.stockPrices[quote.symbol];
            if (lastPrice) {
                const change = ((getQuotePrice(quote) - lastPrice) / lastPrice * 100);
                if (Math.abs(change) > 2) {
                    changes.push({
                        type: change > 0 ? 'up' : 'down',
                        text: `${quote.symbol} moved ${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
                        category: 'market',
                        value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
                    });
                }
            }
        });
    }

    // Determine direction
    const ups = changes.filter(c => c.type === 'up').length;
    const downs = changes.filter(c => c.type === 'down').length;
    let direction = 'mixed';
    if (ups > downs) direction = 'risk-on';
    else if (downs > ups) direction = 'risk-off';

    directionEl.textContent = direction === 'risk-on' ? '\u2191 RISK-ON' : direction === 'risk-off' ? '\u2193 RISK-OFF' : '\u2194 MIXED';
    directionEl.className = `delta-direction ${direction}`;

    const lastSeenText = State.lastSeen ? formatRelativeTime(new Date(State.lastSeen)) + ' ago' : 'first visit';
    summary.innerHTML = `<span class="sweep-summary-text">${changes.length} changes since ${lastSeenText}</span>`;

    if (changes.length === 0) {
        list.innerHTML = '<div class="loading-indicator" style="font-style: normal;">No significant changes detected</div>';
    } else {
        list.innerHTML = changes.map(c => {
            const arrow = c.type === 'up' ? '\u25B2' : c.type === 'down' ? '\u25BC' : '\u25C6';
            const arrowClass = c.type === 'up' ? 'up' : c.type === 'down' ? 'down' : 'new';
            return `
                <div class="delta-item">
                    <span class="delta-arrow ${arrowClass}">${arrow}</span>
                    <span class="delta-text">${c.text}</span>
                    ${c.value ? `<span class="delta-value">${c.value}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    // Save current state for next comparison
    const currentState = {
        headlineCount: State.dailyHeadlines.length,
        substackCount: State.dailySubstacks.length,
        stockPrices: {},
        timestamp: Date.now()
    };
    if (State.cache.stocks?.data) {
        State.cache.stocks.data.forEach(q => {
            currentState.stockPrices[q.symbol] = getQuotePrice(q);
        });
    }
    localStorage.setItem('last-dashboard-state', JSON.stringify(currentState));
    State.lastSeen = new Date().toISOString();
    localStorage.setItem('last-seen', State.lastSeen);
}

async function fetchSweepDelta() {
    try {
        const since = State.lastSeen || new Date(Date.now() - 6 * 3600000).toISOString();
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/sweep/delta?since=${since}`);
        const data = await response.json();
        // TODO: render backend delta
    } catch (e) {
        renderSweepDeltaLocal();
    }
}

// ============================================
// CROSS-SOURCE SIGNALS
// ============================================

function computeSignals() {
    const signals = [];

    // Market signals
    if (State.riskGauges.vix?.value > 25) {
        signals.push({ badge: 'market', text: `VIX elevated at ${State.riskGauges.vix.value.toFixed(1)} - market stress detected` });
    }
    if (State.riskGauges.yield?.value < 0) {
        signals.push({ badge: 'market', text: `Yield curve inverted (${State.riskGauges.yield.value.toFixed(2)}%) - recession signal` });
    }

    // Weather signals
    const weatherVal = document.getElementById('weather-alert')?.querySelector('.status-value');
    if (weatherVal && weatherVal.classList.contains('alert')) {
        signals.push({ badge: 'weather', text: `Chicago weather alert: ${weatherVal.textContent}` });
    }

    // News volume signal
    if (State.dailyHeadlines.length > 100) {
        signals.push({ badge: 'news', text: `High news volume: ${State.dailyHeadlines.length} headlines today` });
    }

    // Prediction signals
    if (State.predictions?.upcoming?.length > 0) {
        const soon = State.predictions.upcoming.filter(p => {
            const days = (new Date(p.resolution_date) - new Date()) / (1000 * 60 * 60 * 24);
            return days < 7;
        });
        if (soon.length > 0) {
            signals.push({ badge: 'prediction', text: `${soon.length} prediction(s) resolving within 7 days` });
        }
    }

    State.signals = signals;
    renderSignals(signals);
}

function renderSignals(signals) {
    const feed = document.getElementById('signals-feed');
    const count = document.getElementById('signal-count');
    count.textContent = signals.length;

    if (signals.length === 0) {
        feed.innerHTML = '<div class="loading-indicator" style="font-style: normal;">All systems nominal</div>';
        return;
    }

    feed.innerHTML = signals.map(s => `
        <div class="signal-item">
            <span class="signal-badge ${s.badge}">${s.badge.toUpperCase()}</span>
            <span class="signal-text">${s.text}</span>
        </div>
    `).join('');
}

// ============================================
// PREDICTIONS (Direct Supabase fallback)
// ============================================

async function fetchPredictionsDirect() {
    if (!CONFIG.PREDICTIONS_SUPABASE_URL || !CONFIG.PREDICTIONS_SUPABASE_KEY) {
        updateSensor('predictions', 'warn', 'N/A');
        renderPredictionsPlaceholder();
        return;
    }

    try {
        const response = await fetch(
            `${CONFIG.PREDICTIONS_SUPABASE_URL}/rest/v1/predictions?select=*&order=resolution_date.asc`,
            {
                headers: {
                    'apikey': CONFIG.PREDICTIONS_SUPABASE_KEY,
                    'Authorization': `Bearer ${CONFIG.PREDICTIONS_SUPABASE_KEY}`
                }
            }
        );
        const predictions = await response.json();
        processPredictions(predictions);
    } catch (e) {
        console.warn('Predictions fetch failed:', e);
        updateSensor('predictions', 'error', 'ERR');
        renderPredictionsPlaceholder();
    }
}

async function fetchPredictions() {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/predictions/proxy`);
        const data = await response.json();
        processPredictions(data.predictions);
    } catch (e) {
        fetchPredictionsDirect();
    }
}

function processPredictions(predictions) {
    if (!predictions || !Array.isArray(predictions)) {
        renderPredictionsPlaceholder();
        return;
    }

    const now = new Date();
    const open = predictions.filter(p => !p.resolved);
    const resolved = predictions.filter(p => p.resolved);
    const brierScores = resolved.filter(p => p.brier_score != null).map(p => p.brier_score);
    const avgBrier = brierScores.length > 0 ? (brierScores.reduce((a, b) => a + b, 0) / brierScores.length) : null;

    // Find next resolution date
    const upcoming = open.sort((a, b) => new Date(a.resolution_date) - new Date(b.resolution_date));
    const nextDue = upcoming.length > 0 ? new Date(upcoming[0].resolution_date) : null;

    State.predictions = { open, resolved, avgBrier, upcoming };

    document.getElementById('pred-open').textContent = open.length;
    document.getElementById('pred-resolved').textContent = resolved.length;
    document.getElementById('pred-brier').textContent = avgBrier != null ? avgBrier.toFixed(3) : 'N/A';
    document.getElementById('pred-next').textContent = nextDue ? formatRelativeTime(nextDue) : 'N/A';

    // Render upcoming predictions
    const container = document.getElementById('predictions-upcoming');
    container.innerHTML = upcoming.slice(0, 5).map(p => `
        <div class="prediction-upcoming-item">
            <span class="prediction-name">${p.name || p.title || 'Untitled'}</span>
            <span class="prediction-prob">${p.probability}%</span>
            <span class="prediction-due">${formatRelativeTime(new Date(p.resolution_date))}</span>
        </div>
    `).join('');

    updateSensor('predictions', 'ok', open.length);
}

function renderPredictionsPlaceholder() {
    document.getElementById('pred-open').textContent = '--';
    document.getElementById('pred-resolved').textContent = '--';
    document.getElementById('pred-brier').textContent = '--';
    document.getElementById('pred-next').textContent = '--';
    document.getElementById('predictions-upcoming').innerHTML =
        '<div class="loading-indicator" style="font-style: normal; padding: 8px;">Connect prediction tracker to view</div>';
}

// ============================================
// PREDICTION INPUT
// ============================================

function initPredictionInput() {
    const nameInput = document.getElementById('pred-input-name');
    if (nameInput) {
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                submitPrediction();
            }
        });
    }
    // Default the date input to 30 days from now
    const dateInput = document.getElementById('pred-input-date');
    if (dateInput && !dateInput.value) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        dateInput.value = d.toISOString().split('T')[0];
    }
}

async function submitPrediction() {
    const name = document.getElementById('pred-input-name').value.trim();
    const description = document.getElementById('pred-input-desc').value.trim();
    const probability = parseInt(document.getElementById('pred-input-prob').value);
    const resolution_date = document.getElementById('pred-input-date').value;
    const category = document.getElementById('pred-input-category').value;

    if (!name) { showNotification('Prediction name is required', 'error'); return; }
    if (!probability || probability < 1 || probability > 99) { showNotification('Probability must be 1-99%', 'error'); return; }
    if (!resolution_date) { showNotification('Resolution date is required', 'error'); return; }

    const prediction = {
        name,
        description: description || name,
        probability,
        category,
        resolution_date
    };

    const btn = document.getElementById('pred-submit');
    btn.textContent = '...';
    btn.disabled = true;

    try {
        const response = await fetch(`${CONFIG.PREDICTIONS_SUPABASE_URL}/rest/v1/predictions`, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.PREDICTIONS_SUPABASE_KEY,
                'Authorization': `Bearer ${CONFIG.PREDICTIONS_SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(prediction)
        });

        if (response.ok) {
            // Clear inputs
            document.getElementById('pred-input-name').value = '';
            document.getElementById('pred-input-desc').value = '';
            document.getElementById('pred-input-prob').value = '';
            document.getElementById('pred-input-category').value = 'misc';
            // Reset date to 30 days out
            const d = new Date();
            d.setDate(d.getDate() + 30);
            document.getElementById('pred-input-date').value = d.toISOString().split('T')[0];

            showNotification('Prediction added!', 'success');
            // Refresh predictions display
            fetchPredictionsDirect();
        } else {
            const err = await response.json();
            showNotification(`Failed: ${err.message || 'Unknown error'}`, 'error');
        }
    } catch (e) {
        showNotification(`Error: ${e.message}`, 'error');
    } finally {
        btn.textContent = 'ADD';
        btn.disabled = false;
    }
}

// ============================================
// SECONDARY OVERLAY NAVIGATION
// ============================================

function initSecondaryNav() {
    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', toggleSecondary);

    // Tab switching
    document.querySelectorAll('.secondary-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (!tab) return;

            // Update active button
            document.querySelectorAll('.secondary-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show correct tab
            document.querySelectorAll('.secondary-tab').forEach(t => t.classList.add('hidden'));
            const target = document.getElementById(`tab-${tab}`);
            if (target) target.classList.remove('hidden');
        });
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && State.secondaryOpen) closeSecondary();
    });
}

function toggleSecondary() {
    if (State.secondaryOpen) {
        closeSecondary();
    } else {
        openSecondary();
    }
}

function openSecondary() {
    document.getElementById('secondary-overlay').classList.remove('hidden');
    State.secondaryOpen = true;
}

function closeSecondary() {
    document.getElementById('secondary-overlay').classList.add('hidden');
    State.secondaryOpen = false;
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initBoot();
});
