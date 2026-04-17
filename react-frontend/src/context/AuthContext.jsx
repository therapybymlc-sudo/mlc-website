import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs";
import api, { setTokenGetter } from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const tokenTemplate = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE : null) || 
                       (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_CLERK_JWT_TEMPLATE : null);

  const roles = useMemo(() => {
    const metaRoles = user?.publicMetadata?.roles;
    if (Array.isArray(metaRoles)) return metaRoles;
    if (user?.publicMetadata?.role) return [user.publicMetadata.role];
    
    const unsafeRoles = user?.unsafeMetadata?.roles;
    if (Array.isArray(unsafeRoles)) return unsafeRoles;
    if (user?.unsafeMetadata?.role) return [user.unsafeMetadata.role];

    return [];
  }, [user]);

  const premiumPreviewEnabled = ((typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_PREMIUM_PREVIEW : null) || 
                                 (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_PREMIUM_PREVIEW : null)) === "true";
  const isAdmin = roles.includes("admin");
  const isTherapist = isAdmin || roles.includes("therapist");
  const isClient = !isTherapist;
  const isPremium = premiumPreviewEnabled || isAdmin || roles.includes("premium");
  const previewRole = typeof window !== 'undefined' ? localStorage.getItem("mlc_role_preview") : null;
  const signupRole = typeof window !== 'undefined' ? localStorage.getItem("mlc_signup_role") : null;
  const isTherapistPreview =
    previewRole === "therapist" &&
    signupRole === "therapist" &&
    !isTherapist;
  const [therapistProfile, setTherapistProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadProfiles = async () => {
      if (!isLoaded || !isSignedIn) {
        if (mounted) {
          setTherapistProfile(null);
          setClientProfile(null);
        }
        return;
      }
      try {
        const fetchTasks = [];
        if (isTherapist) {
          fetchTasks.push(api.get("therapists/me/").catch(() => null));
        } else {
          fetchTasks.push(Promise.resolve(null));
        }
        
        // Always try client me as fallback or if client
        fetchTasks.push(api.get("clients/me/").catch(() => null));

        const [tRes, cRes] = await Promise.all(fetchTasks);
        
        if (mounted) {
          if (tRes) setTherapistProfile(tRes.data);
          if (cRes) setClientProfile(cRes.data);
        }
      } catch (err) {
        console.warn("Profile load failed", err);
      }
    };
    loadProfiles();
    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    let isMounted = true;
    const syncToken = async () => {
      try {
        if (!isLoaded) return;
        if (!isSignedIn) {
          if (isMounted) {
            localStorage.removeItem("access_token");
            delete api.defaults.headers.Authorization;
          }
          return;
        }
        const token = await getToken(
          tokenTemplate ? { template: tokenTemplate } : undefined
        );
        if (isMounted && typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem("access_token", token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
          } else {
            localStorage.removeItem("access_token");
            delete api.defaults.headers.Authorization;
          }
        }
      } catch (e) {
        console.warn("Clerk token sync failed", e);
      }
    };
    syncToken();
    return () => {
      isMounted = false;
    };
  }, [getToken, isLoaded, isSignedIn, tokenTemplate]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setTokenGetter(null);
      return;
    }
    setTokenGetter(() =>
      getToken(tokenTemplate ? { template: tokenTemplate } : undefined)
    );
  }, [getToken, isLoaded, isSignedIn, tokenTemplate]);

  const login = () => {
    if (typeof window === 'undefined') return;
    clerk.redirectToSignIn({
      redirectUrl: `${window.location.origin}/dashboard`,
    });
  };

  const logout = () => {
    if (typeof window === 'undefined') return;
    clerk.signOut({
      redirectUrl: window.location.origin,
    });
  };

  const [token, setToken] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!isSignedIn,
        user,
        loading: !isLoaded,
        login,
        logout,
        token,
        roles,
        isAdmin,
        isTherapist,
        isClient,
        isPremium,
        therapistProfile,
        clientProfile,
        isVerifiedTherapist: !!therapistProfile?.is_verified,
        isTherapistPremium: !!therapistProfile?.is_premium,
        isTherapistPreview,
        previewRole,
        clerk,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) || {};
