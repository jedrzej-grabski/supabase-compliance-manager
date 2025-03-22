import React, { useState, useEffect } from 'react';
import { SupabaseProject, ProjectComplianceStatus } from '@/lib/types';
import { checkProjectCompliance } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ComplianceCheckBadge from './ComplianceCheckBadge';

interface ProjectComplianceStatusProps {
    project: SupabaseProject;
}

export default function ProjectComplianceStatusComponent({ project }: ProjectComplianceStatusProps) {
    const { token } = useAuth();
    const [complianceStatus, setComplianceStatus] = useState<ProjectComplianceStatus>({
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
    },);

    useEffect(() => {
        const checkCompliance = async () => {
            if (!token) return;

            try {
                setComplianceStatus(prev => ({ ...prev, loading: true, error: null }));
                const result = await checkProjectCompliance(token, project, true);
                setComplianceStatus(result.status);
            } catch (error) {
                setComplianceStatus(prev => ({
                    ...prev,
                    loading: false,
                    error: `Failed to check compliance: ${(error as Error).message}`
                }));
            }
        };

        checkCompliance();
    }, [project, token]);

    if (complianceStatus.error) {
        return (
            <div className="mt-2 text-sm text-red-600">
                Error: {complianceStatus.error}
            </div>
        );
    }

    return (
        <div className="mt-2 flex flex-wrap gap-4">
            <ComplianceCheckBadge
                enabled={complianceStatus.mfa.enabled}
                label="MFA"
                loading={complianceStatus.loading}
                projectId={project.id}
                checkType="mfa"
            />
            <ComplianceCheckBadge
                enabled={complianceStatus.rls.enabled}
                label="RLS"
                loading={complianceStatus.loading}
                projectId={project.id}
                checkType="rls"
            />
            <ComplianceCheckBadge
                enabled={complianceStatus.pitr.enabled}
                label="PITR"
                loading={complianceStatus.loading}
                projectId={project.id}
                checkType="pitr"
            />
        </div>
    );
}