import { useState, useEffect } from 'react';
import { fetchProjects } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { SupabaseProject } from '@/lib/types';
import ProjectComplianceStatus from './ProjectComplianceStatus';

export default function ProjectList() {
    const [projects, setProjects] = useState<SupabaseProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();

    useEffect(() => {
        if (!token) {
            return;
        }

        const getProjects = async () => {
            try {
                setIsLoading(true);
                const data = await fetchProjects(token);
                setProjects(data);
                setError('');
            } catch (err: any) {
                setError('Failed to fetch projects. Please check your token.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        getProjects();
    }, [token]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="animate-pulse h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="divide-y divide-gray-200">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="px-4 py-5 sm:px-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="flex space-x-3">
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-5 rounded-lg mb-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <button
                            onClick={logout}
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Return to login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No Projects Found</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            No projects found. Create a project in your Supabase dashboard first.
                        </p>
                        <a
                            href="https://supabase.com/dashboard/projects"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            Go to Supabase Dashboard
                            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Your Supabase Projects
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Compliance status for all your Supabase projects
                </p>
            </div>
            <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                    <li key={project.id} className="px-4 py-5 sm:px-6 hover:bg-gray-200 transition duration-150">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-green-500 rounded-full h-2.5 w-2.5 mr-2"></div>
                                    <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>

                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-500">PROJECT ID</p>
                                    <p className="text-sm text-gray-700 font-mono">{project.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">REGION</p>
                                    <p className="text-sm text-gray-700">{project.region}</p>
                                </div>
                            </div>

                            {/* Compliance Status Section */}
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                    <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Compliance Status:
                                </h5>
                                <ProjectComplianceStatus project={project} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                    <svg className="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Compliance Check Legend:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-green-300 mr-2 items-center justify-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>
                        <span><strong>MFA:</strong> Multi-Factor Authentication</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-green-300 mr-2 items-center justify-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>
                        <span><strong>RLS:</strong> Row Level Security</span>
                    </li>
                    <li className="flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-green-300 mr-2 items-center justify-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>
                        <span><strong>PITR:</strong> Point-in-Time Recovery</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}