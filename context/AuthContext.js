"use client";
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const register = async (username, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { success: false, error: error.message };
            }

            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Invalid email or password' };
        }
    };

    const updateUsername = async (newUsername) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { username: newUsername }
            });

            if (error) return { success: false, error: error.message };

            // Refresh user state
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updatePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateEmail = async (newEmail) => {
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            });

            if (error) return { success: false, error: error.message };
            return { success: true, message: 'Confirmation link sent to your new email.' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateUsername,
            updatePassword,
            updateEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
