const SERIES = {
    vix: 'VIXCLS',
    yield: 'T10Y2Y',
    fedfunds: 'FEDFUNDS',
    cpi: 'CPIAUCSL',
    unemployment: 'UNRATE',
    gscpi: 'GSCPI'
};

async function fetchFredSeries(seriesId, apiKey) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=30`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED ${seriesId}: ${response.status}`);
    const data = await response.json();

    const observations = (data.observations || [])
        .filter(o => o.value !== '.')
        .map(o => ({ date: o.date, value: parseFloat(o.value) }))
        .reverse();

    if (observations.length === 0) return null;

    const latest = observations[observations.length - 1].value;
    const previous = observations.length > 1 ? observations[observations.length - 2].value : latest;
    const history = observations.map(o => o.value);

    return { value: latest, change: latest - previous, history };
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'FRED_API_KEY not configured' });

    const indicators = {};

    await Promise.allSettled(
        Object.entries(SERIES).map(async ([key, seriesId]) => {
            try {
                const data = await fetchFredSeries(seriesId, apiKey);
                if (data) {
                    // CPI: compute YoY % change
                    if (key === 'cpi' && data.history.length >= 13) {
                        const current = data.history[data.history.length - 1];
                        const yearAgo = data.history[data.history.length - 13];
                        data.value = ((current - yearAgo) / yearAgo) * 100;
                        data.change = data.value - ((data.history[data.history.length - 2] - yearAgo) / yearAgo) * 100;
                    }
                    indicators[key] = data;
                }
            } catch (e) {
                console.warn(`Failed to fetch ${key}:`, e.message);
            }
        })
    );

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json({ indicators, timestamp: new Date().toISOString() });
}
