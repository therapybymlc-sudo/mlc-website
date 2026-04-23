'use client'

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
    const metaRoles = user?.publicMetadata?.roles || user?.unsafeMetadata?.roles;
    if (Array.isArray(metaRoles)) return metaRoles;
    
    const singleRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role;
    if (singleRole) return [singleRole];

    return [];
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isTherapist = roles.includes("therapist");
  const isClient = roles.includes("client");
  const isNewUser = roles.length === 0;
  
  const isPremium = isAdmin || roles.includes("premium");
  const previewRole = typeof window !== 'undefined' ? localStorage.getItem("mlc_role_preview") : null;
  const signupRole = typeof window !== 'undefined' ? localStorage.getItem("mlc_signup_role") : null;
  const isTherapistPreview =
    previewRole === "therapist" &&
    signupRole === "therapist" &&
    !isTherapist && !isAdmin;
  const [therapistProfile, setTherapistProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const isLikelyJwt = (token) =>
    typeof token === "string" && token.split(".").length === 3;

  const getApiToken = async () => {
    // Prefer the default Clerk session token first because backend JWKS
    // verification is wired to standard Clerk session JWTs.
    let token = await getToken();
    if (isLikelyJwt(token)) return token;
    if (tokenTemplate) {
      token = await getToken({ template: tokenTemplate });
      if (isLikelyJwt(token)) return token;
    }
    return null;
  };

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
        const token = await getApiToken();
        // If token is not ready yet, skip this cycle and wait for the next effect tick.
        if (!token) return;

        const authConfig = { headers: { Authorization: `Bearer ${token}` } };
        const fetchTasks = [];
        if (isTherapist) {
          fetchTasks.push(api.get("therapists/me/", authConfig).catch(() => null));
        } else {
          fetchTasks.push(Promise.resolve(null));
        }

        // Only fetch client profile for users that can validly have one.
        // Therapist-only sessions receive 403 on this endpoint by design.
        if (isClient || (!isTherapist && !isAdmin)) {
          fetchTasks.push(api.get("clients/me/", authConfig).catch(() => null));
        } else {
          fetchTasks.push(Promise.resolve(null));
        }

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
  }, [isLoaded, isSignedIn, getToken, tokenTemplate, isTherapist]);

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
        const token = await getApiToken();
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
    setTokenGetter(() => getApiToken());
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
        isNewUser,
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
