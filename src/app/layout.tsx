import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Supabase Compliance Manager - Dashboard',
    description: 'Monitor and manage the compliance of your Supabase projects',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <header className="shadow-sm">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex h-16 items-center">
                                    <div className="flex items-center">
                                        <svg
                                            className="h-8 w-8 text-blue-600"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="ml-2 text-xl font-bold text-transparent bg-gradient-to-r from-blue-800 via-blue-400 to-green-400 bg-clip-text">
                                            Supabase Compliance Manager
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
                            {children}
                        </main>

                        <footer className="py-6 border-t border-gray-300">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <p className="text-center text-sm text-gray-500">
                                    Supabase Compliance Manager &copy; {new Date().getFullYear()}
                                </p>
                            </div>
                        </footer>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
