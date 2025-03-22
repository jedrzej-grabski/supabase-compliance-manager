"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProjectList from '@/components/dashboard/ProjectList';

export default function Dashboard() {
    const { token, logout } = useAuth();
    const router = useRouter();


    useEffect(() => {
        if (!token) {
            router.push('/');
        }
    }, [token, router]);

    if (!token) {
        return null;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor and fix compliance across your Supabase projects
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-lg border border-blue-100">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-blue-800">Compliance Analysis</h3>
                        <div className="mt-2 text-blue-700">
                            <p className="text-sm">
                                This dashboard checks your projects for compliance with industry standards, regulations, and internal policies to ensure they meet all necessary requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ProjectList />

            <div className="mt-8 p-4 bg-white rounded-lg shadow border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Security Information
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Your Supabase PAT token is stored locally in your browser and is never sent to our servers.
                    All API requests to Supabase are made through our secure proxy.
                    For each compliance issue detected, you can choose between an automatic fix or AI-assisted guidance.
                </p>
            </div>
        </div>
    );
}