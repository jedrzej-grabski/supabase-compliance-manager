import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TokenInput() {
    const [tokenInput, setTokenInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setToken } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {

            if (!tokenInput.trim()) {
                throw new Error('Please enter a Supabase PAT token');
            }
            setToken(tokenInput);

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to validate token');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Enter Your Access Token</h3>
            <p className="text-gray-600 mb-4">
                Provide your Supabase Personal Access Token (PAT) to securely access your projects.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                        Supabase PAT Token
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <input
                            id="token"
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-3 border"
                            placeholder="sbp_xxxxxxxxxxxxxxxxxxxx"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9zm3 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        <a
                            href="https://supabase.com/dashboard/account/tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            How to create a Supabase PAT token →
                        </a>
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating...
                        </>
                    ) : (
                        'Access Dashboard'
                    )}
                </button>
            </form>

            <div className="mt-4 bg-blue-50 p-3 rounded-md text-xs text-blue-700 border border-blue-100">
                <p className="flex items-start">
                    <svg className="h-4 w-4 mr-1 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    While your token is not stored on our servers, we still recommend generating a fresh PAT token for this analysis to ensure security. Revoke this token as soon as you are done.
                </p>
            </div>
        </div>
    );
}