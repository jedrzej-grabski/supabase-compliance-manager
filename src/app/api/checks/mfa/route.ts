import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { StatusCodes } from 'http-status-codes';


export async function POST(request: Request) {
    try {
        const { url, serviceKey } = await request.json();

        const supabaseClient = createClient(url, serviceKey);

        const { data: users, error } = await supabaseClient.auth.admin.listUsers();

        if (error) {
            console.error("Error while fetching users");
            NextResponse.json({ error: 'Failed to fetch users.' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
        }

        const usersWithMfaStatus = users.users.map(user => ({
            id: user.id,
            email: user.email,
            mfaEnabled: user.factors && user.factors.length > 0,
            createdAt: user.created_at
        }));

        const allUsersWithMfaEnabled = usersWithMfaStatus.every(user => user.mfaEnabled);

        return NextResponse.json({
            passing: allUsersWithMfaEnabled,
            users: usersWithMfaStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("MFA check failed with error: ", error);
        return NextResponse.json({ error: 'Server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }
}