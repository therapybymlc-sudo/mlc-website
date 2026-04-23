'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs";
import { apiGet, setTokenGetter } from "../api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const tokenTemplate =
    (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE : null) ||
    (typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env.VITE_CLERK_JWT_TEMPLATE
      : null);

  const urlRole = (searchParams?.get("role") || "").toLowerCase();
  const onTherapistRoute = pathname.startsWith("/dashboard/therapist");

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

  const wantsTherapistOnly = urlRole === "therapist" || onTherapistRoute;

  const isTherapistPreview =
    !isTherapist && !isAdmin && onTherapistRoute && roles.length === 0;

  const [therapistProfile, setTherapistProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const isLikelyJwt = (token) => typeof token === "string" && token.split(".").length === 3;

  const getApiToken = async () => {
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
        const fetchTasks = [];
        if (isTherapist) {
          fetchTasks.push(apiGet("therapists/me/").catch(() => null));
        } else {
          fetchTasks.push(Promise.resolve(null));
        }

        const skipClientProfile = isTherapist || isAdmin || wantsTherapistOnly || isTherapistPreview;

        if (isClient || (!isTherapist && !isAdmin && !skipClientProfile)) {
          fetchTasks.push(apiGet("clients/me/").catch(() => null));
        } else {
          fetchTasks.push(Promise.resolve(null));
        }

        const [tData, cData] = await Promise.all(fetchTasks);

        if (mounted) {
          if (tData) setTherapistProfile(tData);
          if (cData) setClientProfile(cData);
        }
      } catch (err) {
        console.warn("Profile load failed", err);
      }
    };
    loadProfiles();
    return () => {
      mounted = false;
    };
  }, [
    isLoaded,
    isSignedIn,
    getToken,
    tokenTemplate,
    isTherapist,
    isClient,
    isAdmin,
    wantsTherapistOnly,
    isTherapistPreview,
  ]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setTokenGetter(null);
      return;
    }
    setTokenGetter(() => getApiToken());
  }, [getToken, isLoaded, isSignedIn, tokenTemplate]);

  const login = () => {
    if (typeof window === "undefined") return;
    clerk.redirectToSignIn({
      redirectUrl: `${window.location.origin}/dashboard`,
    });
  };

  const logout = () => {
    if (typeof window === "undefined") return;
    clerk.signOut({
      redirectUrl: window.location.origin,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!isSignedIn,
        user,
        loading: !isLoaded,
        login,
        logout,
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
        previewRole: null,
        clerk,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) || {};
