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
    isRegistered: boolean;
    signOut: () => Promise<void>;
    signUp: (credentials: LoginCredentials) => Promise<void>;
    signIn: (credentials: LoginCredentials) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    refreshRegistration: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const queryClient = useQueryClient();

    const checkRegistration = async (currentSession: Session | null) => {
        if (!currentSession) {
            console.log('[AuthContext] No session found, skipping registration check.');
            setIsRegistered(false);
            return;
        }

        console.log('[AuthContext] START: registration check for:', currentSession.user.email);
        try {
            const { registered } = await AuthService.checkRegistrationStatus(currentSession.access_token);
            console.log('[AuthContext] END: registration check result:', registered);
            setIsRegistered(registered);
        } catch (error) {
            console.error('[AuthContext] Error in registration check:', error);
            setIsRegistered(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            console.log('[AuthContext] 🏁 STEP 1: Starting initAuth...');
            try {
                const { data } = await supabase.auth.getSession();
                const session = data.session;

                if (mounted) {
                    console.log('[AuthContext] 🏁 STEP 2: Session retrieved:', session?.user?.email || 'Guest');
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session) {
                        console.log('[AuthContext] 🏁 STEP 3: Verifying if user is registered...');
                        console.log('[AuthContext] Using access token for registration check (first load):', session.access_token ? 'present' : 'not present');
                        await checkRegistration(session);
                    } else {
                        console.log('[AuthContext] 🏁 STEP 3: No session, user is guest.');
                    }
                }
            } catch (error) {
                console.error('[AuthContext] ❌ FATAL ERROR in initAuth:', error);
            } finally {
                if (mounted) {
                    console.log('[AuthContext] 🏁 STEP 4: Setting loading=false. App should render now.');
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Escuchar cambios en la auth
        const { data } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            console.log(`[AuthContext] 🔔 AUTH EVENT: ${event} for ${session?.user?.email || 'Guest'}`);
            if (mounted) {
                // Si la sesión es null (logout), limpiamos el cache de react-query
                if (!session) {
                    console.log('[AuthContext] No session, clearing cache.');
                    queryClient.clear();
                }
                setSession(session);
                setUser(session?.user ?? null);

                // Si hay sesión, verificamos registro. Si no, ya seteamos false arriba implícitamente o en checkRegistration
                if (session) {
                    // Mantener loading true si es un cambio de sesión (login) para evitar flash
                    // Pero onAuthStateChange a veces dispara eventos que no son login.
                    // Idealmente, deberíamos manejar un estado de 'validando' registro si quisiéramos ser muy precisos.
                    // Por simplicidad, dejamos que checkRegistration corra y actualice el estado.
                    await checkRegistration(session);
                } else {
                    setIsRegistered(false);
                }

                console.log('[AuthContext] Setting loading to false (onAuthStateChange)');
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
        setIsRegistered(false);
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

    const refreshRegistration = async () => {
        if (session) {
            await checkRegistration(session);
        }
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            loading,
            isRegistered,
            signOut,
            signUp,
            signIn,
            signInWithGoogle,
            refreshRegistration
        }}>
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
