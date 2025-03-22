import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: NextRequest) {
    const token = request.headers.get('x-supabase-token');


    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. No token provided.' },
            { status: StatusCodes.UNAUTHORIZED }
        );
    }


    try {
        const response = await fetch('https://api.supabase.com/v1/projects', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error proxying request to Supabase:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}