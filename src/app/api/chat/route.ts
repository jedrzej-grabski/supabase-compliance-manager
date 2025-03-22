import { NextRequest, NextResponse } from 'next/server';
import { sendChatMessage } from '@/lib/openrouter';


export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        const assistantResponse = await sendChatMessage(messages);

        return NextResponse.json({
            message: assistantResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message', message: (error as Error).message },
            { status: 500 }
        );
    }
}