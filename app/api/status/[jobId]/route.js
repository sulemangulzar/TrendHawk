import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, context) {
    try {
        const { jobId } = await context.params;

        // Get job status
        const { data: job, error: jobError } = await supabase
            .from('search_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // If completed, get products
        if (job.status === 'completed') {
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (productsError) {
                throw new Error(`Failed to fetch products: ${productsError.message}`);
            }

            return NextResponse.json({
                status: 'completed',
                products,
                job,
            });
        }

        // Return job status
        return NextResponse.json({
            status: job.status,
            error_message: job.error_message,
            job,
        });
    } catch (error) {
        console.error('Status API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
