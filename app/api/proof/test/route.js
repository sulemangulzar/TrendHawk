import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ 
        message: 'Proof API routes are working!',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request) {
    try {
        const body = await request.json();
        return NextResponse.json({ 
            message: 'Proof API POST is working!',
            received: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({ 
            error: error.message 
        }, { status: 400 });
    }
}
