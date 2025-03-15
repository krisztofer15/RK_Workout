import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const setAuth = async (authUser) => {
        if (!authUser) {
            setUser(null);
            return;
        }
        const { data: freshUserData, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error fetching user: ', error);
        } else {
            setUser(freshUserData.user);
        }
    };

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session) {
                    await setAuth(session.user);
                } else {
                    setUser(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);