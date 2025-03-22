import axios from 'axios';
import { ApiKey, MfaCheck, SecurityCheckResult, SupabaseProject } from './types';

export async function fetchProjects(token: string): Promise<SupabaseProject[]> {
    try {
        const response = await axios.get('/api/projects', {
            headers: {
                'x-supabase-token': token,
            },
        });
        response.data = response.data.map((project: SupabaseProject) => ({
            ...project,
            url: `https://${project.id}.supabase.co`,
        }));
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
}


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


export async function checkProjectSecurity(
    token: string,
    project: SupabaseProject,
    log: boolean = false,
): Promise<SecurityCheckResult> {
    const result: SecurityCheckResult = {
        projectId: project.id,
        status: {
            mfa: {
                enabled: false,
                data: null,
            },
            rls: {
                enabled: false,
                data: null,
            },
            pitr: {
                enabled: false,
                data: null,
            },
            loading: false,
            error: null
        },
    };

    return result;
}