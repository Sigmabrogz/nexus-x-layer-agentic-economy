import { NextResponse } from 'next/server';

// In-memory store for hackathon purposes (clears on restart)
let inferences: any[] = [];

export async function GET() {
    return NextResponse.json({ inferences });
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        inferences.unshift({
            ...data,
            time: new Date().toISOString()
        });
        // Keep only last 20
        inferences = inferences.slice(0, 20);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
