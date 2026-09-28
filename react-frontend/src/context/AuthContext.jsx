'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs";
import { apiGet, apiPost, parseOnboardRoleDashboardMismatch, setTokenGetter } from "../api.js";

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
  const onClientRoute = pathname.startsWith("/dashboard/client");

  const metadataRoles = useMemo(() => {
    const metaRoles = user?.publicMetadata?.roles || user?.unsafeMetadata?.roles;
    if (Array.isArray(metaRoles)) return metaRoles;

    const singleRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role;
    if (singleRole) return [singleRole];

    return [];
  }, [user]);

  const wantsTherapistOnly = urlRole === "therapist" || onTherapistRoute;

  const [therapistProfile, setTherapistProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [whoami, setWhoami] = useState(null);
  /** Set when API rejects onboard because this account is locked to the other role. */
  const [roleDashboardMismatch, setRoleDashboardMismatch] = useState(null);
  const clearRoleDashboardMismatch = useCallback(() => setRoleDashboardMismatch(null), []);
  const reportRoleDashboardMismatchFromError = useCallback((err) => {
    const parsed = parseOnboardRoleDashboardMismatch(err);
    if (parsed) setRoleDashboardMismatch(parsed);
    return parsed;
  }, []);
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

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProfiles = async () => {
      if (!isLoaded || !isSignedIn) {
        if (mounted) {
          setWhoami(null);
          setTherapistProfile(null);
          setClientProfile(null);
          setRoleDashboardMismatch(null);
          setIsProfileLoading(false);
        }
        return;
      }
      if (mounted) setIsProfileLoading(true);
      try {
        // DB-backed canonical role context (source of truth).
        const who = await apiGet("whoami/").catch(() => null);
        const canonicalRoles = Array.isArray(who?.canonical_roles) ? who.canonical_roles : [];
        const hasTherapistCanonical = canonicalRoles.includes("therapist") || !!who?.has_therapist_profile;
        const hasClientCanonical = canonicalRoles.includes("client") || !!who?.has_client_profile;
        const hasAdminCanonical = canonicalRoles.includes("admin") || !!who?.admin_by_email || !!who?.admin_by_user_id;

        const metadataIsTherapist = metadataRoles.includes("therapist");
        const metadataIsClient = metadataRoles.includes("client");
        const metadataIsAdmin = metadataRoles.includes("admin");

        const userEmail = (
          user?.primaryEmailAddress?.emailAddress || 
          user?.emailAddresses?.[0]?.emailAddress || 
          ""
        ).toLowerCase().trim();
        const isPureAdminEmail = userEmail === "therapybymlc@gmail.com" || userEmail === "therapy@mlchealth.in";

        // Avoid noisy 404s on client pages by preferring canonical role signals
        // and current route intent over stale metadata.
        const shouldFetchTherapist =
          !isPureAdminEmail && (wantsTherapistOnly || (hasTherapistCanonical && !onClientRoute) || (hasAdminCanonical && userEmail === "therapy.aditya@gmail.com"));
        const shouldFetchClient = !wantsTherapistOnly && (hasClientCanonical || metadataIsClient);
        const fetchTherapistProfile = async () => {
          if (!shouldFetchTherapist) return null;
          try {
            return await apiGet("therapists/me/");
          } catch (err) {
            const status = err?.response?.status;
            // Self-heal canonical therapist profile on first-login race conditions (clinicians only, never admins).
            if (status === 404 && !hasAdminCanonical && !metadataIsAdmin && (metadataIsTherapist || wantsTherapistOnly)) {
              try {
                await apiPost("onboard/", { role: "therapist" });
                return await apiGet("therapists/me/").catch(() => null);
              } catch (onboardErr) {
                if (mounted) {
                  const parsed = parseOnboardRoleDashboardMismatch(onboardErr);
                  if (parsed) setRoleDashboardMismatch(parsed);
                }
                return null;
              }
            }
            return null;
          }
        };

        const [tData, cData] = await Promise.all([
          fetchTherapistProfile(),
          shouldFetchClient ? apiGet("clients/me/").catch(() => null) : Promise.resolve(null),
        ]);

        if (mounted) {
          setWhoami(who);
          setTherapistProfile(tData || null);
          setClientProfile(cData || null);
        }
      } catch (err) {
        console.warn("Profile load failed", err);
      } finally {
        if (mounted) {
          setIsProfileLoading(false);
        }
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
    metadataRoles,
    wantsTherapistOnly,
    onClientRoute,
  ]);

  const canonicalRoles = useMemo(() => {
    const fromWhoami = Array.isArray(whoami?.canonical_roles) ? whoami.canonical_roles : [];
    let normalized = fromWhoami.map((r) => String(r).toLowerCase());

    // Instant client-side fallback check for master administrative identities
    const userEmail = (
      user?.primaryEmailAddress?.emailAddress || 
      user?.emailAddresses?.[0]?.emailAddress || 
      ""
    ).toLowerCase().trim();
    const adminEmails = [
      "therapybymlc@gmail.com", 
      "therapy@mlchealth.in", 
      "therapy.aditya@gmail.com"
    ];
    if (userEmail && adminEmails.includes(userEmail)) {
      if (!normalized.includes("admin")) normalized.push("admin");
      if (userEmail === "therapy.aditya@gmail.com") {
        if (!normalized.includes("therapist")) normalized.push("therapist");
      } else {
        // MLC official account is strictly Admin only
        normalized = normalized.filter((r) => r !== "therapist");
      }
    }
    const asmaEmails = [
      "asma@mlchealth.in",
      "asma.ausa02@gmail.com",
      "asmadata02@gmail.com"
    ];
    if (userEmail && asmaEmails.includes(userEmail)) {
      if (!normalized.includes("therapist")) normalized.push("therapist");
      // Asma accounts are strictly Therapist only
      normalized = normalized.filter((r) => r !== "admin");
    }

    if (normalized.length > 0) return Array.from(new Set(normalized));
    let fallback = metadataRoles.map((r) => String(r).toLowerCase());
    if (userEmail && (userEmail === "therapybymlc@gmail.com" || userEmail === "therapy@mlchealth.in")) {
      fallback = ["admin"];
    } else if (userEmail && asmaEmails.includes(userEmail)) {
      fallback = ["therapist"];
    }
    return fallback;
  }, [whoami, metadataRoles, user]);

  const isAdmin = canonicalRoles.includes("admin");
  const isTherapist = canonicalRoles.includes("therapist");
  const isClient = canonicalRoles.includes("client");
  const isNewUser = canonicalRoles.length === 0;

  const isPremium = isAdmin || canonicalRoles.includes("premium");
  const isTherapistPreview = !isTherapist && !isAdmin && onTherapistRoute && canonicalRoles.length === 0;

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
        isProfileLoading,
        authReady: isLoaded && (!isSignedIn || !isProfileLoading),
        login,
        logout,
        roles: canonicalRoles,
        metadataRoles,
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
        whoami,
        clerk,
        roleDashboardMismatch,
        clearRoleDashboardMismatch,
        reportRoleDashboardMismatchFromError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) || {};
