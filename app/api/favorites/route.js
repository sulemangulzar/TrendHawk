import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { userId, productId } = await request.json();

        if (!userId || !productId) {
            return NextResponse.json(
                { error: 'Missing userId or productId' },
                { status: 400 }
            );
        }

        // Add to favorites
        const { data, error } = await supabase
            .from('favorites')
            .insert({ user_id: userId, product_id: productId })
            .select()
            .single();

        if (error) {
            // Check if already favorited
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Product already in favorites' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, favorite: data });
    } catch (error) {
        console.error('Add favorite error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { userId, productId } = await request.json();

        if (!userId || !productId) {
            return NextResponse.json(
                { error: 'Missing userId or productId' },
                { status: 400 }
            );
        }

        // Remove from favorites
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove favorite error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Get user's favorites with product details
        const { data, error } = await supabase
            .from('favorites')
            .select(`
        id,
        created_at,
        products (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ favorites: data });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
