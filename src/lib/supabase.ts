import axios from 'axios';
import { ApiKey, MfaCheck, PitrCheck, RlsCheck, ComplianceCheckResult, SupabaseProject, SecurityFixLog, SecurityFixAction } from './types';
import { createClient } from '@supabase/supabase-js';

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

export async function fetchMfaCheck(url: string, serviceKey: string): Promise<MfaCheck> {
    try {
        const response = await axios.post(`/api/checks/mfa`, { url, serviceKey });
        return response.data;
    } catch (error) {
        console.error('Error fetching MFA check:', error);
        throw error;
    }
}

export async function fetchRlsCheck(token: string, projectId: string): Promise<RlsCheck> {
    try {
        const response = await axios.get(`/api/projects/${projectId}/checks/rls`, {
            headers: {
                'x-supabase-token': token,
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching postgres config for project ${projectId}:`, error);
        throw error;
    }
}

export async function fetchPitrCheck(token: string, projectId: string): Promise<PitrCheck> {
    try {
        const response = await axios.get(`/api/projects/${projectId}/checks/pitr`, {
            headers: {
                'x-supabase-token': token,
            },
        });
        console.log('PITR response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching postgres config for project ${projectId}:`, error);
        throw error;
    }
}



export async function checkProjectCompliance(
    token: string,
    project: SupabaseProject,
    log: boolean = false,
): Promise<ComplianceCheckResult> {
    const result: ComplianceCheckResult = {
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

    try {
        const apiKeys = await fetchProjectApiKeys(token, project.id);
        const serviceKey = apiKeys.find((key) => key.name === 'service_role');

        if (!serviceKey) {
            result.status.error = 'Service role key not found';
            return result;
        }

        const backupConfig = await fetchPitrCheck(token, project.id);
        result.status.pitr.enabled = backupConfig.pitr_enabled;
        result.status.pitr.data = backupConfig


        const mfaCheck = await fetchMfaCheck(project.url, serviceKey.api_key);
        result.status.mfa.enabled = mfaCheck.passing;
        result.status.mfa.data = mfaCheck;


        const rlsCheck = await fetchRlsCheck(token, project.id);
        result.status.rls.enabled = rlsCheck.passing;
        result.status.rls.data = rlsCheck;

        if (log) {
            console.log('Logging security check results');
            await logSecurityCheck('mfa', project.id, result.status.mfa.enabled);
            await logSecurityCheck('rls', project.id, result.status.rls.enabled);
            await logSecurityCheck('pitr', project.id, result.status.pitr.enabled);
        }


        return result;

    } catch (error) {
        console.error(`Error checking security for project ${project.id}:`, error);
        result.status.error = `Failed to check security: ${(error as Error).message}`;
        return result;
    }
}

export async function requestAutoFix(
    token: string,
    projectId: string,
    fixType: 'mfa' | 'rls' | 'pitr'
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await axios.post(`/api/projects/${projectId}/fixes/${fixType}`, null, {
            headers: {
                'x-supabase-token': token,
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error requesting auto-fix for ${fixType} on project ${projectId}:`, error);
        throw error;
    }
}


let loggingClient: any = null;

function getLoggingClient() {
    if (!loggingClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_LOGGING_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_LOGGING_KEY;

        if (supabaseUrl && supabaseKey) {
            loggingClient = createClient(supabaseUrl, supabaseKey);
        }
    }
    return loggingClient;
}

export async function logSecurityCheck(
    checkType: 'mfa' | 'rls' | 'pitr',
    projectId: string,
    status: boolean
): Promise<void> {
    const client = getLoggingClient();
    if (!client) return;

    try {
        const logEntry: SecurityCheckLog = {
            project_id: projectId,
            check_type: checkType,
            status,
            timestamp: new Date().toISOString(),
        };

        await client.from('security_checks').insert(logEntry);
    } catch (error) {
        console.error('Error logging security check:', error);
    }
}

export async function logSecurityFix(
    projectId: string,
    checkType: 'mfa' | 'rls' | 'pitr',
    actionType: SecurityFixAction
): Promise<void> {
    const client = getLoggingClient();
    if (!client) return;

    try {
        const logEntry: SecurityFixLog = {
            project_id: projectId,
            check_type: checkType,
            action_type: actionType,
            timestamp: new Date().toISOString(),
        };
        console.log('Logging security fix:', logEntry);
        await client.from('security_fixes').insert(logEntry);
    } catch (error) {
        console.error('Error logging security fix:', error);
    }
}