export interface MfaCheck {
    passing: boolean;
    users: Array<{
        id: string;
        email: string;
        mfaEnabled: boolean;
    }>;
}

export interface SupabaseProject {
    id: string;
    url: string;
    name: string;
    organization_id: string;
    region: string;
    created_at: string;
}

export interface ComplianceCheckResult {
    projectId: string;
    status: ProjectComplianceStatus;
}

export interface ProjectComplianceStatus {
    mfa: {
        enabled: boolean;
        data: MfaCheck | null;
    };
    rls: {
        enabled: boolean;
        data: RlsCheck | null;
    };
    pitr: {
        enabled: boolean;
        data: PitrCheck | null;
    };
    loading: boolean;
    error: string | null;
}

export interface RlsCheck {
    passing: boolean;
    tables: Table[];
}

export interface Table {
    schemaname: string;
    tablename: string;
    rowsecurity: boolean;
}

export interface MfaCheck {
    passing: boolean;
    users: User[];
}

export interface User {
    id: string;
    email: string;
    mfaEnabled: boolean;
}


export interface PitrCheck {
    region: string;
    pitr_enabled: boolean;
    walg_enabled: boolean;
    backups: {
        status: string;
        is_physical_backup: boolean;
        inserted_at: string;
    }[];
    physical_backup_data: {
        earliest_physical_backup_date_unix: number;
        latest_physical_backup_date_unix: number;
    } | null;
}

export interface ApiKey {
    name: string;
    api_key: string;
};

export interface AIAssistantMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}


export type ComplianceFixAction = 'ai_assistance' | 'autofix';

export interface ComplianceFixLog {
    id?: string;
    project_id: string;
    check_type: 'mfa' | 'rls' | 'pitr';
    action_type: ComplianceFixAction;
    timestamp: string;
}

export interface ComplianceCheckLog {
    id?: string;
    project_id: string;
    check_type: 'mfa' | 'rls' | 'pitr';
    status: boolean;
    timestamp: string;
}
