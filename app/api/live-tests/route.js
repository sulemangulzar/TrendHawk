import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/live-tests - Fetch user's active tests
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: tests, error } = await supabase
            .from('live_tests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate recommendations for each test
        const testsWithRecommendations = tests.map(test => {
            const daysLive = Math.floor((new Date() - new Date(test.start_date)) / (1000 * 60 * 60 * 24));
            const avgProfitPerSale = 30; // Configurable
            const estimatedRevenue = test.sales_count * avgProfitPerSale;
            const breakEven = estimatedRevenue >= test.money_spent;

            let recommendation = 'continue';
            let recommendationReason = 'Keep monitoring';

            // Rule 1: Kill if no sales after 14 days
            if (daysLive >= 14 && test.sales_count === 0) {
                recommendation = 'kill';
                recommendationReason = 'No sales after 14 days';
            }
            // Rule 2: Kill if spending too much without profit
            else if (test.money_spent > 500 && !breakEven) {
                recommendation = 'kill';
                recommendationReason = 'Cost exceeds margin threshold';
            }
            // Rule 3: Scale if profitable
            else if (breakEven && test.sales_count >= 5) {
                recommendation = 'scale';
                recommendationReason = 'Profitable trend detected';
            }
            // Rule 4: Warning if close to failure
            else if (daysLive >= 10 && test.sales_count < 2) {
                recommendation = 'pause';
                recommendationReason = 'Low sales velocity - consider pausing';
            }

            return {
                ...test,
                days_live: daysLive,
                break_even: breakEven,
                recommendation,
                recommendation_reason: recommendationReason,
                estimated_revenue: estimatedRevenue
            };
        });

        return NextResponse.json({
            success: true,
            tests: testsWithRecommendations
        });
    } catch (error) {
        console.error('Error fetching live tests:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/live-tests - Create new live test
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, productName, productUrl, productId } = body;

        if (!userId || !productName) {
            return NextResponse.json({ error: 'User ID and product name required' }, { status: 400 });
        }

        const { data: test, error } = await supabase
            .from('live_tests')
            .insert({
                user_id: userId,
                product_id: productId || null,
                product_name: productName,
                product_url: productUrl || null,
                start_date: new Date().toISOString().split('T')[0],
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            test
        });
    } catch (error) {
        console.error('Error creating live test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/live-tests - Update live test
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { testId, userId, moneySpent, salesCount, status } = body;

        if (!testId || !userId) {
            return NextResponse.json({ error: 'Test ID and User ID required' }, { status: 400 });
        }

        const updateData = {};
        if (moneySpent !== undefined) updateData.money_spent = moneySpent;
        if (salesCount !== undefined) updateData.sales_count = salesCount;
        if (status) updateData.status = status;
        updateData.updated_at = new Date().toISOString();

        const { data: test, error } = await supabase
            .from('live_tests')
            .update(updateData)
            .eq('id', testId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            test
        });
    } catch (error) {
        console.error('Error updating live test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
