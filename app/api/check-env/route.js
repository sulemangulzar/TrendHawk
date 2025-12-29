import { NextResponse } from 'next/server';

export async function GET() {
    const checks = {
        supabase_url: {
            exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            value: process.env.NEXT_PUBLIC_SUPABASE_URL ?
                `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` :
                'NOT SET',
            status: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'
        },
        anon_key: {
            exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?
                `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` :
                'NOT SET',
            status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'
        },
        service_key: {
            exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            value: process.env.SUPABASE_SERVICE_ROLE_KEY ?
                `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` :
                'NOT SET',
            status: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
        },
        app_url: {
            exists: !!process.env.NEXT_PUBLIC_APP_URL,
            value: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
            status: process.env.NEXT_PUBLIC_APP_URL ? '✅' : '❌'
        }
    };

    const allGood = Object.values(checks).every(check => check.exists);

    return NextResponse.json({
        status: allGood ? 'All environment variables loaded ✅' : 'Some variables missing ❌',
        checks,
        instructions: !allGood ? [
            '1. Make sure .env.local file exists in the frontend directory',
            '2. Check that variable names match exactly (case-sensitive)',
            '3. No quotes around values',
            '4. No spaces around = sign',
            '5. Restart dev server after changes (Ctrl+C then npm run dev)'
        ] : []
    }, { status: allGood ? 200 : 500 });
}
