import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(
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
        const tablesQuery = `
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `;

        const tablesResponse = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: tablesQuery }),
        });

        if (!tablesResponse.ok) {
            const errorData = await tablesResponse.json().catch(() => null);
            return NextResponse.json(
                { error: 'Failed to fetch tables', details: errorData },
                { status: tablesResponse.status }
            );
        }

        const tablesData = await tablesResponse.json();

        const rlsPromises = tablesData.map(async (table: { schemaname: string; tablename: string }) => {
            const enableRlsQuery = `
        ALTER TABLE ${table.schemaname}.${table.tablename}
        ENABLE ROW LEVEL SECURITY;
      `;

            const rlsResponse = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: enableRlsQuery }),
            });

            if (!rlsResponse.ok) {
                const errorData = await rlsResponse.json().catch(() => null);
                throw new Error(`Failed to enable RLS for table ${table.tablename}: ${JSON.stringify(errorData)}`);
            }

            return { table: table.tablename, status: 'RLS enabled' };
        });

        const rlsResults = await Promise.all(rlsPromises);
        return NextResponse.json({ success: true, results: rlsResults, message: 'RLS auto-fix applied successfully.' });
    } catch (error) {
        console.error('Error with RLS auto-fix:', error);
        return NextResponse.json(
            { error: 'Failed to auto-fix RLS', message: (error as Error).message },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}