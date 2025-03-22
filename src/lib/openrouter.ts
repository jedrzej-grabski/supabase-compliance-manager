export async function sendChatMessage(
    messages: string[],
    model: string = 'meta-llama/llama-3.3-70b-instruct:free'
): Promise<string> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OpenRouter API key is missing');
        }


        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`OpenRouter API error: ${response.status} ${errorData?.error || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error sending chat message to OpenRouter:', error);
        throw error;
    }
}

export function getSystemPromptForComplianceCheck(
    checkType: 'mfa' | 'rls' | 'pitr',
    projectDetails: any
): string {
    const basePrompt = `You are a Supabase compliance expert assistant. Keep your answers short and concise. You are helping with a Supabase project named "${projectDetails.name}" (ID: ${projectDetails.id}).`;

    switch (checkType) {
        case 'mfa':
            return `${basePrompt} The project currently doesn't have Multi-Factor Authentication (MFA) enabled for user accounts, which poses a security risk. Provide step-by-step guidance on how to enable and configure MFA in Supabase, including code examples if relevant.`;

        case 'rls':
            return `${basePrompt} The project doesn't have Row Level Security (RLS) fully enabled on all tables, which poses a data security risk. Explain the importance of RLS and provide detailed guidance on implementing RLS policies for Supabase tables, including SQL examples for common scenarios.`;

        case 'pitr':
            return `${basePrompt} The project doesn't have Point-in-Time Recovery (PITR) enabled, which means database recovery options are limited in case of data loss. Explain the benefits of PITR and provide guidance on enabling this feature in the Supabase dashboard, including considerations for cost and performance.`;

        default:
            return basePrompt;
    }
}