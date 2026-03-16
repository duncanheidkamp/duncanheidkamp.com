import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET: return latest snapshot
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('dashboard_snapshots')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return res.status(404).json({ error: 'No snapshots found' });
        return res.status(200).json(data);
    }

    // POST: create new snapshot (called by cron)
    if (req.method === 'POST') {
        try {
            // Fetch current data from our own API endpoints
            const baseUrl = `https://${req.headers.host}`;

            const [indicatorsRes, energyRes] = await Promise.allSettled([
                fetch(`${baseUrl}/api/market/indicators`).then(r => r.json()),
                fetch(`${baseUrl}/api/market/energy`).then(r => r.json())
            ]);

            const snapshotData = {
                indicators: indicatorsRes.status === 'fulfilled' ? indicatorsRes.value.indicators : {},
                energy: energyRes.status === 'fulfilled' ? energyRes.value.energy : {},
                timestamp: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('dashboard_snapshots')
                .insert({ snapshot_data: snapshotData })
                .select()
                .single();

            if (error) throw error;

            // Cleanup old snapshots (keep 48 hours)
            const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
            await supabase
                .from('dashboard_snapshots')
                .delete()
                .lt('created_at', cutoff);

            return res.status(201).json({ id: data.id, created_at: data.created_at });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
