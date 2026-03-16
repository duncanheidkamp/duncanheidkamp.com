import { predictionsSupa } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { data: predictions, error } = await predictionsSupa
            .from('predictions')
            .select('*')
            .order('resolution_date', { ascending: true });

        if (error) throw error;

        const open = predictions.filter(p => !p.resolved);
        const resolved = predictions.filter(p => p.resolved);
        const brierScores = resolved.filter(p => p.brier_score != null).map(p => p.brier_score);
        const avgBrier = brierScores.length > 0
            ? brierScores.reduce((a, b) => a + b, 0) / brierScores.length
            : null;

        const nextResolution = open.length > 0 ? open[0].resolution_date : null;

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.status(200).json({
            predictions,
            stats: {
                total: predictions.length,
                open: open.length,
                resolved: resolved.length,
                avgBrier,
                nextResolution
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
