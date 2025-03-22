'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProjects, requestAutoFix, checkProjectCompliance, logComplianceFix } from '@/lib/supabase';
import { getSystemPromptForComplianceCheck } from '@/lib/openrouter';
import ChatComponent from '@/components/detail/ChatComponent';
import { MfaCheck } from '@/lib/types';

export default function MfaFixPage({ params: ParamsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(ParamsPromise);
    const { token } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFixing, setIsFixing] = useState(false);
    const [mfaDetails, setMfaDetails] = useState<MfaCheck>();
    const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);

    useEffect(() => {
        const getProject = async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                const projects = await fetchProjects(token);
                const foundProject = projects.find(p => p.id === params.id);
                if (foundProject) {
                    const complianceCheck = await checkProjectCompliance(token, foundProject, false);
                    setIsMfaEnabled(complianceCheck.status.mfa.enabled);
                    if (complianceCheck.status.mfa.data) {
                        setMfaDetails(complianceCheck.status.mfa.data);
                    }
                } else {
                    setError('Project not found');
                }
                if (!foundProject) {
                    setError('Project not found');
                } else {
                    setProject(foundProject);
                }
            } catch (err) {
                setError(`Failed to load project: ${(err as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };

        getProject();
    }, [token, params]);

    const handleAutoFix = async () => {
        if (!token || !project) return;

        try {
            setIsFixing(true);
            setFixResult(null);

            const result = await requestAutoFix(token, project.id, 'mfa');

            setFixResult(result);
        } catch (err) {
            setError(`Auto-fix failed: ${(err as Error).message}`);
        } finally {
            setIsFixing(false);
        }
    };

    const handleChatAssistance = () => {
        logComplianceFix(project.id, 'mfa', 'ai_assistance');
        setShowChat(true);
    };

    if (isLoading) {
        return (
            <div className="p-6 w-7xl animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Multi-Factor Authentication (MFA)</h2>
                <p className="text-gray-600">
                    Enable MFA to add an extra layer of security for user accounts in {project?.name}.
                </p>
            </div>

            {isMfaEnabled ? (
                <div className="mb-6 bg-green-50 p-6 rounded-md border border-green-200 text-center">
                    <svg className="h-12 w-12 text-green-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-green-800 mb-2">MFA Is Already Enabled</h3>
                    <p className="text-green-700 mb-4">
                        Great job! Multi-Factor Authentication is already properly configured for this project.
                    </p>
                    <p className="text-green-700 text-sm">
                        If you wish to make any changes to your MFA configuration, you can do so directly from the Supabase dashboard.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6 bg-yellow-50 p-4 rounded-md">
                        <h3 className="font-medium text-yellow-800 mb-2">Why is MFA Important?</h3>
                        <p className="text-yellow-700">
                            Multi-Factor Authentication greatly enhances account security by requiring a second verification
                            step beyond just a password. This significantly reduces the risk of unauthorized access even if
                            passwords are compromised.
                        </p>
                    </div>

                    {mfaDetails && mfaDetails.users && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Users Missing MFA</h3>
                            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                MFA Enabled
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mfaDetails.users.map((user: any) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Auto-Fix Solution</h3>
                            <p className="text-gray-600 mb-4">
                                Let us attempt to automatically configure MFA for all users in your project.
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
                                Chat with our AI assistant for help with configuring MFA for your Supabase project.
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
                                    checkType="mfa"
                                    systemPrompt={getSystemPromptForComplianceCheck('mfa', project)}
                                    initialMessage="Hi! I need help configuring MFA for my Supabase project. What are the steps to implement this for all users?"
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
                        <a href="https://supabase.com/docs/guides/auth/auth-mfa" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Supabase MFA Documentation
                        </a>
                    </li>
                    <li>
                        <a href="https://supabase.com/docs/reference/javascript/auth-mfa-enroll" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            MFA Enrollment API Reference
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}