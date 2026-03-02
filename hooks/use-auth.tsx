"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

interface AuthContextType {
  user: any;
  profile: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, userData: { name: string; role: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signInWithWallet: (walletAddress: string) => Promise<AuthResult>;
  updateProfile: (updates: any) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
  connectWallet: (walletAddress: string) => Promise<AuthResult>;
  disconnectWallet: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.error("Error fetching profile", e);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: string }): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Automatically create a profile for them since trigger might be delayed or missing
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: userData.name,
            role: userData.role,
            email: email,
          }
        ]).select();

        if (profileError) {
          console.warn("Issue creating profile row immediately, relying on DB trigger.", profileError);
        }
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const signInWithWallet = async (walletAddress: string) => {
    return { success: false, error: "Wallet auth not implemented" };
  }

  // Placeholder implementations
  const updateProfile = async () => ({ success: false, error: "Not implemented" });
  const refreshUser = async () => {
    if (user) await fetchProfile(user.id);
  };
  const connectWallet = async () => ({ success: false, error: "Not implemented" });
  const disconnectWallet = async () => ({ success: false, error: "Not implemented" });

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      signInWithWallet,
      updateProfile,
      refreshUser,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
