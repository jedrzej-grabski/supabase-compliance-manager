import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';

export async function GET(
    request: NextRequest,
    { params: promisedParams }: { params: Promise<{ id: string }> }
) {
    const params = await promisedParams;
    const token = request.headers.get('x-supabase-token');
    const projectId = params.id;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. No token provided.' },
            { status: StatusCodes.UNAUTHORIZED }
        );
    }

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/backups`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { error: 'Failed to fetch postgres config', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error proxying request to Supabase:', error);
        return NextResponse.json(
            { error: 'Failed to fetch postgres config', message: (error as Error).message },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
