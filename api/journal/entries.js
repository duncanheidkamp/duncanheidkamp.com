import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ entries: data });
    }

    if (req.method === 'POST') {
        const { content, category, tags } = req.body;
        if (!content) return res.status(400).json({ error: 'content is required' });

        const { data, error } = await supabase
            .from('journal_entries')
            .insert({ content, category: category || 'idea', tags: tags || [] })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ entry: data });
    }

    if (req.method === 'DELETE') {
        const id = req.query.id;
        if (!id) return res.status(400).json({ error: 'id is required' });

        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ deleted: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
