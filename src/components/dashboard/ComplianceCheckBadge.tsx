import React from 'react';
import Link from 'next/link';

interface ComplianceCheckBadgeProps {
    enabled: boolean;
    label: string;
    loading?: boolean;
    projectId?: string;
    checkType?: 'mfa' | 'rls' | 'pitr';
}

export default function ComplianceCheckBadge({
    enabled,
    label,
    loading = false,
    projectId,
    checkType
}: ComplianceCheckBadgeProps) {
    if (loading) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
            </span>
        );
    }

    if (enabled) {
        return (
            <div className="flex flex-col space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                    </svg>
                    {label} Enabled
                </span>

                <div className="flex space-x-2 mt-1">
                    <Link
                        href={`/projects/${projectId}/detail/${checkType}`}
                        className="inline-flex justify-center w-full items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        View Details
                    </Link>
                </div>
            </div >
        );
    }


    if (!enabled && projectId && checkType) {
        return (
            <div className="flex flex-col space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                    </svg>
                    {label} Disabled
                </span>

                <div className="flex space-x-2 mt-1">
                    <Link
                        href={`/projects/${projectId}/detail/${checkType}`}
                        className="inline-flex justify-center w-full items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        View Solutions
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
            </svg>
            {label} Disabled
        </span>
    );
}