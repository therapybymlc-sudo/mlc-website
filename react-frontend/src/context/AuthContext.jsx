'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const isInvoiceRoute = pathname?.includes("/invoice/");
  const onTherapistRoute = pathname.startsWith("/dashboard/therapist") && !isInvoiceRoute;
  const onClientRoute = pathname.startsWith("/dashboard/client") && !isInvoiceRoute;

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
  const failedTemplateRef = useRef(false);
  const hasLoadedProfilesRef = useRef(false);
  const metadataRolesKey = metadataRoles.join(",");

  const getApiToken = async () => {
    if (tokenTemplate && !failedTemplateRef.current) {
      try {
        const templated = await getToken({ template: tokenTemplate });
        if (isLikelyJwt(templated)) return templated;
      } catch (e) {
        failedTemplateRef.current = true;
        console.warn("Clerk templated token fetch failed, falling back to default token", e);
      }
    }
    const token = await getToken();
    if (isLikelyJwt(token)) return token;
    return null;
  };

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProfiles = async () => {
      if (!isLoaded || !isSignedIn) {
        if (mounted) {
          hasLoadedProfilesRef.current = false;
          setWhoami(null);
          setTherapistProfile(null);
          setClientProfile(null);
          setRoleDashboardMismatch(null);
          setIsProfileLoading(false);
        }
        return;
      }
      // Only show full-screen skeleton on the first load, never on silent background token rotations
      if (mounted && !hasLoadedProfilesRef.current) {
        setIsProfileLoading(true);
      }
      try {
        // DB-backed canonical role context (source of truth).
        const who = await apiGet("whoami/").catch(() => null);
        const canonicalRoles = Array.isArray(who?.canonical_roles) ? who.canonical_roles : [];
        const hasTherapistCanonical = canonicalRoles.includes("therapist") || !!who?.has_therapist_profile;
        const hasClientCanonical = (canonicalRoles.includes("client") || !!who?.has_client_profile) && !hasTherapistCanonical;
        const hasAdminCanonical = canonicalRoles.includes("admin") || !!who?.admin_by_email || !!who?.admin_by_user_id;

        const metadataIsTherapist = metadataRoles.includes("therapist") || (Array.isArray(who?.roles) && who.roles.includes("therapist"));
        const metadataIsClient = metadataRoles.includes("client") && !metadataIsTherapist;
        const metadataIsAdmin = metadataRoles.includes("admin");

        const userEmail = (
          user?.primaryEmailAddress?.emailAddress || 
          user?.emailAddresses?.[0]?.emailAddress || 
          ""
        ).toLowerCase().trim();
        const isPureAdminEmail = userEmail === "therapybymlc@gmail.com" || userEmail === "therapy@mlchealth.in";

        // Avoid noisy 403s / 404s by preferring canonical role signals.
        // When whoami itself failed (`who` is null), all canonical flags are false;
        // in that scenario only attempt the therapist probe when the URL explicitly
        // requests the therapist dashboard, AND we're NOT on a client route.
        const isClientOnly =
          (hasClientCanonical || metadataIsClient) &&
          !hasAdminCanonical &&
          !hasTherapistCanonical &&
          !metadataIsTherapist;
        const whoamiFailed = !who;
        const shouldFetchTherapist =
          !isPureAdminEmail && 
          !isClientOnly && 
          !onClientRoute &&  // never probe therapist when we're on a client route
          !(whoamiFailed && !wantsTherapistOnly) &&  // if whoami failed, only probe if URL says therapist
          (wantsTherapistOnly || (hasTherapistCanonical && !onClientRoute) || (hasAdminCanonical && userEmail === "therapy.aditya@gmail.com"));
        const shouldFetchClient = !hasTherapistCanonical && !metadataIsTherapist && !wantsTherapistOnly && (hasClientCanonical || metadataIsClient || onClientRoute);
        const fetchTherapistProfile = async () => {
          if (!shouldFetchTherapist) return null;
          try {
            return await apiGet("therapists/me/");
          } catch (err) {
            const status = err?.response?.status;
            const isKnownClientOnly = (hasClientCanonical || metadataIsClient) && !hasTherapistCanonical && !metadataIsTherapist && !hasAdminCanonical;
            if (isKnownClientOnly && wantsTherapistOnly) {
              if (mounted) {
                setRoleDashboardMismatch({
                  code: "onboard_blocked_has_client",
                  correctHref: "/dashboard/client",
                  title: "You're signed in with a client account",
                  description:
                    "This login is linked to the client portal. Practitioner tools use a separate practitioner account. Use the client dashboard below, or sign out and sign in with the email you used when you joined as a practitioner.",
                });
              }
              return null;
            }
            // Self-heal canonical therapist profile on first-login race conditions (clinicians only, never admins, never clients).
            if (
              status === 404 &&
              !hasAdminCanonical &&
              !metadataIsAdmin &&
              !isKnownClientOnly &&
              (metadataIsTherapist || (wantsTherapistOnly && !metadataRoles.length))
            ) {
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
          hasLoadedProfilesRef.current = true;
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
    tokenTemplate,
    metadataRolesKey,
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

    // Practitioner verification & metadata override:
    // If the account has a therapist profile, active clinician data, or therapist metadata:
    const hasTherapistProfile = !!whoami?.has_therapist_profile || !!therapistProfile;
    const metadataIsTherapist =
      metadataRoles.includes("therapist") ||
      (Array.isArray(whoami?.roles) && whoami.roles.includes("therapist"));
    if (hasTherapistProfile || metadataIsTherapist) {
      if (!normalized.includes("therapist")) normalized.push("therapist");
      // Clinicians must never be treated as clients, even if an incidental client profile exists in DB
      normalized = normalized.filter((r) => r !== "client");
    }

    if (normalized.length > 0) return Array.from(new Set(normalized));
    let fallback = metadataRoles.map((r) => String(r).toLowerCase());
    if (userEmail && (userEmail === "therapybymlc@gmail.com" || userEmail === "therapy@mlchealth.in")) {
      fallback = ["admin"];
    } else if (userEmail && asmaEmails.includes(userEmail)) {
      fallback = ["therapist"];
    } else if (hasTherapistProfile || metadataIsTherapist) {
      fallback = ["therapist"];
    }
    return fallback;
  }, [whoami, metadataRoles, user, therapistProfile]);

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

  const userEmail = (
    user?.primaryEmailAddress?.emailAddress || 
    user?.emailAddresses?.[0]?.emailAddress || 
    ""
  ).toLowerCase().trim();
  const userName = (user?.fullName || "").toLowerCase().trim();

  const isDummyClient = useMemo(() => {
    return isClient && (
      userEmail.includes("dummy") || 
      userEmail.includes("test") || 
      userName.includes("dummy") || 
      (clientProfile?.name && String(clientProfile.name).toLowerCase().includes("dummy")) ||
      (clientProfile?.email && String(clientProfile.email).toLowerCase().includes("dummy"))
    );
  }, [isClient, userEmail, userName, clientProfile]);

  const isDummyTherapist = useMemo(() => {
    return isTherapist && (
      userEmail.includes("dummy") || 
      userEmail.includes("test") || 
      userName.includes("dummy") || 
      (therapistProfile?.name && String(therapistProfile.name).toLowerCase().includes("dummy")) ||
      (therapistProfile?.email && String(therapistProfile.email).toLowerCase().includes("dummy"))
    );
  }, [isTherapist, userEmail, userName, therapistProfile]);

  const isAdityaAdmin = useMemo(() => {
    return isAdmin && userEmail === "therapy.aditya@gmail.com";
  }, [isAdmin, userEmail]);

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
        isDummyClient,
        isDummyTherapist,
        isAdityaAdmin,
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
