import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import {
  loginWithEmail as fbLoginWithEmail,
  registerWithEmail as fbRegisterWithEmail,
  loginWithGoogle as fbLoginWithGoogle,
  logoutUser as fbLogoutUser,
} from "@/lib/firebase/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("investigator");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes("your_firebase_api_key")
  );

  // Sync profile with Supabase profiles table
  const syncProfile = async (user: User, fallbackRole: UserRole = "investigator") => {
    if (!isSupabaseConfigured) {
      setProfile({
        id: user.uid,
        firebase_uid: user.uid,
        email: user.email || "investigator@upay.com.bd",
        full_name: user.displayName || user.email?.split("@")[0] || "Investigator",
        avatar_url: user.photoURL,
        role: fallbackRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRole(fallbackRole);
      return;
    }

    try {
      // 1. Try to fetch profile
      const { data, error: selectErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("firebase_uid", user.uid)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
        setRole(data.role as UserRole);
        return;
      }

      // 2. If not found, insert profile
      const newProfile: Partial<UserProfile> = {
        firebase_uid: user.uid,
        email: user.email || "",
        full_name: user.displayName || user.email?.split("@")[0] || "Investigator",
        avatar_url: user.photoURL || null,
        role: fallbackRole,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (inserted) {
        setProfile(inserted as UserProfile);
        setRole(inserted.role as UserRole);
      } else {
        // Fallback local representation if insert restricted
        setProfile({
          id: user.uid,
          firebase_uid: user.uid,
          email: user.email || "",
          full_name: user.displayName || "Investigator",
          avatar_url: user.photoURL,
          role: fallbackRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setRole(fallbackRole);
      }
    } catch (err: any) {
      console.warn("Could not sync profile with Supabase:", err.message);
      setProfile({
        id: user.uid,
        firebase_uid: user.uid,
        email: user.email || "",
        full_name: user.displayName || "Investigator",
        avatar_url: user.photoURL,
        role: fallbackRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setRole(fallbackRole);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncProfile(user);
      } else {
        setProfile(null);
        setRole("investigator");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await fbLoginWithEmail(email, pass);
      await syncProfile(user);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with email/password.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    assignedRole: UserRole = "investigator"
  ) => {
    try {
      setError(null);
      setLoading(true);
      const user = await fbRegisterWithEmail(email, pass, name, assignedRole);
      await syncProfile(user, assignedRole);
    } catch (err: any) {
      setError(err.message || "Failed to register new account.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await fbLoginWithGoogle();
      await syncProfile(user);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fbLogoutUser();
      setCurrentUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        clearError,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
