import axios from 'axios';
import { MfaCheck } from './types';

export async function fetchMfaCheck(url: string, serviceKey: string): Promise<MfaCheck> {
    try {
        const response = await axios.post(`/api/checks/mfa`, { url, serviceKey });
        return response.data;
    } catch (error) {
        console.error('Error fetching MFA check:', error);
        throw error;
    }
}

export async function fetchProjectApiKeys(token: string, projectId: string): Promise<ApiKey[]> {
    try {
        const response = await axios.get(`/api/projects/${projectId}/api-keys`, {
            headers: {
                'x-supabase-token': token,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching API keys for project ${projectId}:`, error);
        throw error;
    }
}