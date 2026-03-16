const SERIES = {
    wti: { id: 'PET.RWTC.D', name: 'WTI Crude' },
    brent: { id: 'PET.RBRTE.D', name: 'Brent Crude' },
    natgas: { id: 'NG.RNGWHHD.D', name: 'Natural Gas' }
};

async function fetchEiaSeries(seriesId, apiKey) {
    const url = `https://api.eia.gov/v2/seriesid/${seriesId}?api_key=${apiKey}&num=30`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`EIA ${seriesId}: ${response.status}`);
    const data = await response.json();

    const points = (data.response?.data || [])
        .filter(d => d.value != null)
        .map(d => ({ date: d.period, value: parseFloat(d.value) }))
        .reverse();

    if (points.length === 0) return null;

    const latest = points[points.length - 1].value;
    const previous = points.length > 1 ? points[points.length - 2].value : latest;
    const history = points.map(p => p.value);

    return {
        value: latest,
        change: latest - previous,
        changePercent: ((latest - previous) / previous) * 100,
        history
    };
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'EIA_API_KEY not configured' });

    const energy = {};

    await Promise.allSettled(
        Object.entries(SERIES).map(async ([key, series]) => {
            try {
                const data = await fetchEiaSeries(series.id, apiKey);
                if (data) energy[key] = { ...data, name: series.name };
            } catch (e) {
                console.warn(`Failed to fetch ${key}:`, e.message);
            }
        })
    );

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    res.status(200).json({ energy, timestamp: new Date().toISOString() });
}
