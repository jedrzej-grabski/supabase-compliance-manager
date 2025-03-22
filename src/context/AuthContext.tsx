'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


type AuthContextType = {
    token: string | null;
    setToken: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('supabaseToken');
        if (storedToken) {
            setTokenState(storedToken);
        }
    }, []);

    const setToken = (newToken: string) => {
        localStorage.setItem('supabaseToken', newToken);
        setTokenState(newToken);
    };

    const logout = () => {
        localStorage.removeItem('supabaseToken');
        setTokenState(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ token, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}