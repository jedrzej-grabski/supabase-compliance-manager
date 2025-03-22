import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const resolvedParams = await params;
    const token = request.headers.get('x-supabase-token');
    const projectId = resolvedParams.id;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized. No token provided.' },
            { status: 401 }
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

        const tablesWithRlsPromises = tablesData.map(async (table: { schemaname: string; tablename: string }) => {
            const rlsQuery = `
            SELECT rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename = '${table.tablename}'
            LIMIT 1;
            `;

            const rlsResponse = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: rlsQuery }),
            });

            if (!rlsResponse.ok) {
                const errorData = await rlsResponse.json().catch(() => null);
                throw new Error(`Failed to fetch RLS for table ${table.tablename}: ${JSON.stringify(errorData)}`);
            }

            const rlsData = await rlsResponse.json();
            return { ...table, rowsecurity: rlsData[0]?.rowsecurity };
        });

        const tablesWithRls = await Promise.all(tablesWithRlsPromises);
        const passing = tablesWithRls.every(table => table.rowsecurity === true);
        const data = {
            passing,
            tables: tablesWithRls,
        };
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error proxying request to Supabase:', error);
        return NextResponse.json(
            { error: 'Failed to fetch postgres config', message: (error as Error).message },
            { status: 500 }
        );
    }
}