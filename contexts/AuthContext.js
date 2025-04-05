import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (!error && data?.user) {
                console.log("✅ Felhasználó frissítve:", data.user);
                setUser(prev => {
                    if (!prev) return data.user; // ha nincs előző user, teljesen újra beállítjuk
                    return {
                      ...prev,
                      ...data.user,
                      user_metadata: {
                        ...prev.user_metadata,
                        ...data.user?.user_metadata,
                      },
                    };
                  });
            }
        } catch (error) {
            console.error("❌ Hiba a refreshUser függvényben:", error);
        }
    };

    const setAuth = async (authUser) => {
        if (!authUser) {
            setUser(null);
            return;
        }
        setUser(authUser);
    };

    const setUserData = (newUser) => {
        setUser(newUser);
      }      

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                await refreshUser();
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setAuth, refreshUser, setUserData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);