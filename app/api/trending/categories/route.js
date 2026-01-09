import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';


export async function GET(request) {
    try {
        // Get distinct categories from trending products
        const { data, error } = await supabase
            .from('trending_products')
            .select('category')
            .order('category');

        if (error) throw error;

        // Get unique categories
        const categories = [...new Set(data.map(item => item.category))];

        return Response.json({
            success: true,
            categories: ['All', ...categories]
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
