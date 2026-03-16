import { supabase } from '../../lib/supabase.js';

const THRESHOLDS = {
    vix: { notable: 1.5, significant: 3 },
    wti: { notable: 2, significant: 5 },    // percent
    yield: { notable: 0.1, significant: 0.25 }
};

function computeDiff(oldSnap, newSnap) {
    const changes = [];

    // Compare indicators
    const oldInd = oldSnap.indicators || {};
    const newInd = newSnap.indicators || {};

    for (const [key, newData] of Object.entries(newInd)) {
        const oldData = oldInd[key];
        if (!oldData) {
            changes.push({ type: 'new', category: 'market', text: `${key.toUpperCase()} now reporting: ${newData.value.toFixed(2)}` });
            continue;
        }

        const diff = newData.value - oldData.value;
        const pctDiff = (diff / oldData.value) * 100;
        const threshold = THRESHOLDS[key];

        let severity = null;
        if (threshold) {
            const absChange = key === 'wti' ? Math.abs(pctDiff) : Math.abs(diff);
            if (absChange >= threshold.significant) severity = 'significant';
            else if (absChange >= threshold.notable) severity = 'notable';
        }

        if (severity || Math.abs(pctDiff) > 1) {
            changes.push({
                type: diff > 0 ? 'up' : 'down',
                category: 'market',
                text: `${key.toUpperCase()} ${diff > 0 ? '+' : ''}${diff.toFixed(2)} (${pctDiff > 0 ? '+' : ''}${pctDiff.toFixed(1)}%)`,
                severity: severity || 'minor',
                value: `${diff > 0 ? '+' : ''}${diff.toFixed(2)}`
            });
        }
    }

    // Compare energy
    const oldEnergy = oldSnap.energy || {};
    const newEnergy = newSnap.energy || {};

    for (const [key, newData] of Object.entries(newEnergy)) {
        const oldData = oldEnergy[key];
        if (!oldData) continue;

        const pctDiff = ((newData.value - oldData.value) / oldData.value) * 100;
        if (Math.abs(pctDiff) > 1) {
            changes.push({
                type: pctDiff > 0 ? 'up' : 'down',
                category: 'energy',
                text: `${newData.name} ${pctDiff > 0 ? '+' : ''}${pctDiff.toFixed(1)}%`,
                value: `$${newData.value.toFixed(2)}`
            });
        }
    }

    const ups = changes.filter(c => c.type === 'up').length;
    const downs = changes.filter(c => c.type === 'down').length;
    const critical = changes.filter(c => c.severity === 'significant').length;
    const direction = ups > downs ? 'risk-on' : downs > ups ? 'risk-off' : 'mixed';

    return { changes, summary: { total: changes.length, critical, direction } };
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    const since = req.query.since || new Date(Date.now() - 6 * 3600000).toISOString();

    try {
        // Get snapshot closest to 'since'
        const { data: oldSnaps } = await supabase
            .from('dashboard_snapshots')
            .select('snapshot_data, created_at')
            .lte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(1);

        // Get latest snapshot
        const { data: newSnaps } = await supabase
            .from('dashboard_snapshots')
            .select('snapshot_data, created_at')
            .order('created_at', { ascending: false })
            .limit(1);

        if (!oldSnaps?.length || !newSnaps?.length) {
            return res.status(200).json({
                changes: [],
                summary: { total: 0, critical: 0, direction: 'mixed' },
                since,
                current_timestamp: new Date().toISOString()
            });
        }

        const delta = computeDiff(oldSnaps[0].snapshot_data, newSnaps[0].snapshot_data);

        res.status(200).json({
            ...delta,
            since: oldSnaps[0].created_at,
            current_timestamp: newSnaps[0].created_at
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
