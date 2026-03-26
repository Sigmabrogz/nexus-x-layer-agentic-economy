import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        inferences = inferences.slice(0, 20);
        return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
