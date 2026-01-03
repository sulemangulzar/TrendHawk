import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get('category');
        const verdict = searchParams.get('verdict');
        const source = searchParams.get('source');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '100');

        let query = supabase
            .from('trending_products')
            .select('*')
            .order('trend_score', { ascending: false })
            .limit(limit);

        // Filter by category if provided
        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        // Filter by verdict if provided
        if (verdict && verdict !== 'All') {
            query = query.eq('verdict', verdict);
        }

        // Filter by source if provided
        if (source && source !== 'All') {
            query = query.eq('source', source);
        }

        // Search by name if search term provided
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Only get products from the last 48 hours (not expired)
        query = query.gt('expires_at', new Date().toISOString());

        const { data, error } = await query;

        if (error) throw error;

        return Response.json({
            success: true,
            products: data || [],
            count: data?.length || 0
        });

    } catch (error) {
        console.error('Error fetching trending products:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
