export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const services = {};

    // Check FRED
    try {
        const r = await fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=1`);
        services.fred = r.ok;
    } catch { services.fred = false; }

    // Check EIA
    try {
        const r = await fetch(`https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${process.env.EIA_API_KEY}&frequency=daily&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1`);
        services.eia = r.ok;
    } catch { services.eia = false; }

    // Check Supabase
    try {
        const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/user_state?select=id&limit=1`, {
            headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY }
        });
        services.supabase = r.ok;
    } catch { services.supabase = false; }

    // Check Predictions Supabase
    try {
        const r = await fetch(`${process.env.SUPABASE_PREDICTIONS_URL}/rest/v1/predictions?select=id&limit=1`, {
            headers: { 'apikey': process.env.SUPABASE_PREDICTIONS_KEY }
        });
        services.predictions = r.ok;
    } catch { services.predictions = false; }

    const allOk = Object.values(services).every(Boolean);
    const someOk = Object.values(services).some(Boolean);

    res.status(200).json({
        status: allOk ? 'ok' : someOk ? 'degraded' : 'down',
        services,
        timestamp: new Date().toISOString()
    });
}
