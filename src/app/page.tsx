"use client";

import TokenInput from '@/components/auth/TokenInput';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        }
    }, [token, router]);

    return (
        <div className="py-10">
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h2 className="text-3xl font-extrabold sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-blue-400 to-green-400">
                    Supabase Compliance Dashboard
                </h2>
                <p className="mt-4 text-lg text-tra">
                    Monitor and fix the compliance of all your Supabase projects in one place.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/2 bg-gradient-to-br from-blue-800 via-blue-400 to-green-400 p-8 text-white">
                            <h3 className="text-xl font-bold mb-4">Compliance Monitoring Made Easy</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Check Multi-Factor Authentication (MFA) status</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Verify Row-Level Security (RLS) enforcement</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Ensure Point-in-Time Recovery (PITR) is active</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>AI-powered assistance for security issues</span>
                                </li>
                            </ul>
                            <div className="mt-6 text-sm">
                                <p>
                                    All data stays in your browser. We never store your API token on our servers.
                                </p>
                            </div>
                        </div>
                        <div className="md:w-1/2 p-8">
                            <TokenInput />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}