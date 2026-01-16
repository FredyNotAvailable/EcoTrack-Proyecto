import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import type { LoginCredentials } from './types';
import { AuthService } from './services/auth.service';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signUp: (credentials: LoginCredentials) => Promise<void>;
    signIn: (credentials: LoginCredentials) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                console.error('Error al obtener la sesión inicial de Supabase:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Escuchar cambios en la auth
        const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (mounted) {
                // Si la sesión es null (logout), limpiamos el cache de react-query
                if (!session) {
                    queryClient.clear();
                }
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            if (data?.subscription) {
                data.subscription.unsubscribe();
            }
        };
    }, [queryClient]);

    const signOut = async () => {
        await AuthService.signOut();
        queryClient.clear();
    };

    const signUp = async (credentials: LoginCredentials) => {
        await AuthService.signUp(credentials);
    };

    const signIn = async (credentials: LoginCredentials) => {
        await AuthService.signIn(credentials);
    };

    const signInWithGoogle = async () => {
        await AuthService.signInWithGoogle();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, signUp, signIn, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
