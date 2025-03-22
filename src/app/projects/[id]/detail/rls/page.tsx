'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProjects, requestAutoFix, fetchRlsCheck } from '@/lib/supabase';
import { getSystemPromptForSecurityCheck } from '@/lib/openrouter';
import ChatComponent from '@/components/detail/ChatComponent';

export default function RlsFixPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const { token } = useAuth();
    const params = React.use(paramsPromise);
    const [project, setProject] = useState<any>(null);
    const [rlsDetails, setRlsDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFixing, setIsFixing] = useState(false);
    const [fixResult, setFixResult] = useState({ attempted: false, success: false, message: '' });
    const [showChat, setShowChat] = useState(false);
    const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);

    useEffect(() => {
        const getProjectAndRls = async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                const projects = await fetchProjects(token);
                const foundProject = projects.find(p => p.id === params.id);

                if (!foundProject) {
                    setError('Project not found');
                } else {
                    setProject(foundProject);
                    const rlsData = await fetchRlsCheck(token, foundProject.id);
                    setRlsDetails(rlsData);
                    setIsSecurityEnabled(rlsData.passing);
                }
            } catch (err) {
                setError(`Failed to load project: ${(err as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };

        getProjectAndRls();
    }, [token, params.id, fixResult.success]);


    const handleAutoFix = async () => {
        if (!token || !project) return;

        try {
            setIsFixing(true);
            setFixResult({ attempted: true, success: false, message: '' });
            const result = await requestAutoFix(token, project.id, 'rls');
            setFixResult({ attempted: true, success: result.success, message: result.message });
        } catch (err) {
            setError(`Auto-fix failed: ${(err as Error).message}`);
        } finally {
            setIsFixing(false);
        }
    };

    const handleChatAssistance = () => {
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
                <h2 className="text-2xl font-bold mb-2">Row-Level Security (RLS)</h2>
                <p className="text-gray-600">
                    Enable RLS to control access to your database tables in {project?.name}.
                </p>
            </div>

            {isSecurityEnabled ? (
                <div className="mb-6 bg-green-50 p-6 rounded-md border border-green-200 text-center">
                    <svg className="h-12 w-12 text-green-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-green-800 mb-2">Row-Level Security Is Already Enabled</h3>
                    <p className="text-green-700 mb-4">
                        Great job! RLS is properly configured across all tables in this project.
                    </p>
                    <p className="text-green-700 text-sm">
                        If you wish to make changes to your RLS policies, you can do so through the Supabase dashboard or SQL editor.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6 bg-yellow-50 p-4 rounded-md">
                        <h3 className="font-medium text-yellow-800 mb-2">Why is RLS Important?</h3>
                        <p className="text-yellow-700">
                            Row-Level Security ensures that users can only access the specific database rows they're
                            authorized to view or modify. Without RLS, your data is vulnerable to unauthorized access
                            when using client-side applications with Supabase.
                        </p>
                    </div>

                    {rlsDetails && rlsDetails.tables && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Tables Missing RLS</h3>
                            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Table Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rlsDetails.tables.map((table: any) => (
                                            <tr key={table.tablename}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {table.tablename}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${table.rowsecurity ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {table.rowsecurity ? 'RLS Enabled' : 'RLS Disabled'}
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
                                Let us attempt to automatically enable RLS on all tables with default deny policies.
                            </p>
                            <button
                                onClick={handleAutoFix}
                                disabled={isFixing}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isFixing ? 'Applying Fix...' : 'Apply Auto-Fix'}
                            </button>

                            {fixResult.attempted && (
                                <div className={`mt-4 p-3 rounded-md ${fixResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {fixResult.message}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium mb-3">Get AI Assistance</h3>
                            <p className="text-gray-600 mb-4">
                                Chat with our AI assistant for help with configuring RLS for your Supabase tables.
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
                                    checkType="rls"
                                    systemPrompt={getSystemPromptForSecurityCheck('rls', project)}
                                    initialMessage="I need help setting up Row-Level Security for my Supabase tables. Can you explain how to create basic RLS policies and implement them effectively?"
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
                        <a href="https://supabase.com/docs/guides/auth/row-level-security" target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Supabase RLS Documentation
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}