'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProjects, requestAutoFix, fetchPitrCheck, logComplianceFix } from '@/lib/supabase';
import { getSystemPromptForComplianceCheck } from '@/lib/openrouter';
import ChatComponent from '@/components/detail/ChatComponent';
import { PitrCheck, SupabaseProject } from '@/lib/types';

export default function PitrFixPage({ params: ParamsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(ParamsPromise);
    const { token } = useAuth();
    const [project, setProject] = useState<SupabaseProject>({} as SupabaseProject);
    const [pitrDetails, setPitrDetails] = useState<PitrCheck>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [isPitrEnabled, setIsPitrEnabled] = useState(false);

    useEffect(() => {
        const getProjectAndPitr = async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                const projects = await fetchProjects(token);
                const foundProject = projects.find(p => p.id === params.id);

                const pitrCheck = await fetchPitrCheck(token, params.id);
                setIsPitrEnabled(pitrCheck.pitr_enabled);

                if (!foundProject) {
                    setError('Project not found');
                } else {
                    setProject(foundProject);
                    const pitrData = await fetchPitrCheck(token, foundProject.id);
                    setPitrDetails(pitrData);
                }
            } catch (err) {
                setError(`Failed to load project: ${(err as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };

        getProjectAndPitr();
    }, [token, params.id]);


    const handleAutoFix = async () => {
        if (!token || !project) return;

        try {
            setFixResult(null);

            const result = await requestAutoFix(token, project.id, 'pitr');
            setFixResult(result);
        } catch (err) {
            setError(`Auto-fix failed: ${(err as Error).message}`);
        }
    };

    const handleChatAssistance = () => {
        logComplianceFix(project.id, 'pitr', 'ai_assistance');
        setShowChat(true);
    };

    if (isLoading) {
        return (
            <div className="p-6 w-7xl animate-pulse">
                <div className="h-6 bg-gray-200 rounded w- mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4 mt-6"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 p-4 rounded-md text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    const formatBackupDate = (timestamp: number) => {
        if (!timestamp) return 'Not available';
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Point-in-Time Recovery (PITR)</h2>
                <p className="text-gray-600">
                    Enable PITR to add advanced database recovery capabilities for {project?.name}.
                </p>
            </div>

            {isPitrEnabled ? (
                <div className="mb-6 bg-green-50 p-6 rounded-md border border-green-200 text-center">
                    <svg className="h-12 w-12 text-green-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-green-800 mb-2">Point-in-Time Recovery Is Already Enabled</h3>
                    <p className="text-green-700 mb-4">
                        Great job! PITR is already enabled for this project, providing advanced data recovery capabilities.
                    </p>
                    <p className="text-green-700 text-sm">
                        You can manage and utilize PITR features through your Supabase dashboard if needed.
                    </p>

                    {pitrDetails && pitrDetails.physical_backup_data && (
                        <div className="mt-4 p-4 bg-white rounded-md text-left">
                            <h4 className="font-medium text-gray-800 mb-2">Backup Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Latest Backup</p>
                                    <p className="text-sm font-medium">
                                        {formatBackupDate(pitrDetails.physical_backup_data.latest_physical_backup_date_unix)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Earliest Recovery Point</p>
                                    <p className="text-sm font-medium">
                                        {formatBackupDate(pitrDetails.physical_backup_data.earliest_physical_backup_date_unix)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-6 bg-yellow-50 p-4 rounded-md">
                        <h3 className="font-medium text-yellow-800 mb-2">Why is PITR Important?</h3>
                        <p className="text-yellow-700">
                            Point-in-Time Recovery allows you to restore your database to any specific point in time within
                            the recovery window. This is critical for recovering from accidental data deletion, corruption,
                            or other data disasters beyond what regular backups can address.
                        </p>
                    </div>

                    {pitrDetails && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Backup Status</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">PITR Status</p>
                                        <p className="font-medium">{pitrDetails.pitr_enabled ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Region</p>
                                        <p className="font-medium">{pitrDetails.region || 'Not available'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Latest Backup</p>
                                        <p className="font-medium">
                                            {pitrDetails.physical_backup_data ?
                                                formatBackupDate(pitrDetails.physical_backup_data.latest_physical_backup_date_unix) :
                                                'Not available'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Earliest Recovery Point</p>
                                        <p className="font-medium">
                                            {pitrDetails.physical_backup_data ?
                                                formatBackupDate(pitrDetails.physical_backup_data.earliest_physical_backup_date_unix) :
                                                'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Auto-Fix Solution</h3>
                            <p className="text-gray-600 mb-4">
                                Let us attempt to automatically enable PointInTime Recovery for your project.
                            </p>
                            <button
                                onClick={handleAutoFix}
                                disabled={true}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                            >
                                {'Currently we have no auto-fixes available for this issue.'}
                            </button>

                            {fixResult && (
                                <div className={`mt-4 p-3 rounded-md ${fixResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {fixResult.message}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Get AI Assistance</h3>
                            <p className="text-gray-600 mb-4">
                                Chat with our AI assistant for help with configuring PITR for your Supabase project.
                            </p>
                            {!showChat ? (
                                <button
                                    onClick={handleChatAssistance}
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    Talk to AI Assistant
                                </button>
                            ) : (
                                <ChatComponent
                                    checkType="pitr"
                                    systemPrompt={getSystemPromptForComplianceCheck('pitr', project)}
                                    initialMessage="I'd like to enable Point-in-Time Recovery for my Supabase project. What are the costs involved and how do I configure it properly?"
                                />
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Documentation Resources</h3>
                <ul className="list-disc list-inside text-blue-600">
                    <li>
                        <a href="https://supabase.com/docs/guides/platform/backups" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Supabase Backups Documentation
                        </a>
                    </li>
                    <li>
                        <a href="https://supabase.com/blog/postgres-point-in-time-recovery" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Point in Time Recovery Guide
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
