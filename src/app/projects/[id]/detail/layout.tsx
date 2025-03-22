'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function FixLayout({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const pathname = usePathname();

    if (!token) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-yellow-50 p-4 rounded-md mb-4">
                    <p className="text-yellow-700">Please log in to access this page.</p>
                    <Link
                        href="/"
                        className="mt-2 inline-block text-sm text-yellow-700 underline"
                    >
                        Return to login
                    </Link>
                </div>
            </div>
        );
    }


    const pathParts = pathname.split('/');
    const projectId = pathParts[2];
    const checkType = pathParts[4];

    const isCheckActive = (type: string) => checkType === type;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            <nav className="mb-6">
                <ul className="flex border-b">
                    <li className={`mr-1 ${isCheckActive('mfa') ? 'border-b-2 border-blue-500' : ''}`}>
                        <Link
                            href={`/projects/${projectId}/detail/mfa`}
                            className={`inline-block py-2 px-4 ${isCheckActive('mfa')
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-600 hover:text-blue-500'}`}
                        >
                            MFA Security
                        </Link>
                    </li>
                    <li className={`mr-1 ${isCheckActive('rls') ? 'border-b-2 border-blue-500' : ''}`}>
                        <Link
                            href={`/projects/${projectId}/detail/rls`}
                            className={`inline-block py-2 px-4 ${isCheckActive('rls')
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-600 hover:text-blue-500'}`}
                        >
                            Row-Level Security
                        </Link>
                    </li>
                    <li className={`mr-1 ${isCheckActive('pitr') ? 'border-b-2 border-blue-500' : ''}`}>
                        <Link
                            href={`/projects/${projectId}/detail/pitr`}
                            className={`inline-block py-2 px-4 ${isCheckActive('pitr')
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-600 hover:text-blue-500'}`}
                        >
                            Point-in-Time Recovery
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="bg-white rounded-lg shadow">
                {children}
            </div>
        </div>
    );
}