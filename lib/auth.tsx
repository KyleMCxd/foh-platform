'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// MOCK USER fallback for demo purposes if keys aren't set
const MOCK_USER = {
    uid: 'mock_student_1',
    email: 'student@fohacademy.nl',
    displayName: 'Tech Student',
    emailVerified: true
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Graceful handling if Firebase fails to init (e.g. invalid keys)
        if (!auth) {
            console.warn("Firebase Auth not initialized. Using Mock.");
            setUser(MOCK_USER);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, pass: string) => {
        if (!auth) return;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) {
            console.error("Login failed", e);
            throw e;
        }
    };

    const logout = async () => {
        if (!auth) {
            setUser(null);
            return;
        }
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
