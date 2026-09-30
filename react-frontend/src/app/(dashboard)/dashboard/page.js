'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Text, VStack, useToast } from "@chakra-ui/react";
import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { apiPost, parseOnboardRoleDashboardMismatch } from "../../../api.js";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuth();
  const {
    roles = [],
    isTherapist,
    isClient,
    isAdmin,
    metadataRoles = [],
    reportRoleDashboardMismatchFromError,
    therapistProfile,
    whoami,
    authReady,
  } = useAuth();
  const router = useRouter();
  const [resolvingRole, setResolvingRole] = useState(false);
  const attemptedRoleRef = useRef("");
  const toast = useToast();
  const searchParams = useSearchParams();
  const autoRole = String(searchParams.get("role") || "").toLowerCase();

  const hasExplicitRole = roles.length > 0;
  const hasMetadataRole = metadataRoles.length > 0;
  const isLikelyJwt = (token) =>
    typeof token === "string" && token.split(".").length === 3;

  useEffect(() => {
    if (!isLoaded || !authReady) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    // 🛡️ 1. Administrative accounts: direct to Admin portal (or clinician space if requested and qualified)
    if (isAdmin) {
      if (autoRole === "therapist" && isTherapist) {
        router.replace("/dashboard/therapist");
        return;
      }
      if (autoRole === "client" && isClient) {
        router.replace("/dashboard/client");
        return;
      }
      router.replace("/admin");
      return;
    }

    // 🚨 2. Strict Role Isolation on Role-Specific Sign-Ins:

    // Case A: User signed in via Therapist Login (/login/therapist)
    if (autoRole === "therapist") {
      if (isTherapist || !!whoami?.has_therapist_profile || !!therapistProfile) {
        router.replace("/dashboard/therapist");
        return;
      }

      const hasTherapistIdentity =
        isTherapist ||
        !!whoami?.has_therapist_profile ||
        !!therapistProfile ||
        metadataRoles.includes("therapist");

      // Check if this account is actually a Client (and strictly not a clinician)
      const isClientAccount =
        !hasTherapistIdentity &&
        (isClient || !!whoami?.has_client_profile || metadataRoles.includes("client"));
      if (isClientAccount) {
        toast.closeAll();
        signOut().then(() => {
          router.replace("/login/client?mismatch=client");
        });
        return;
      }

      // If genuine new clinician without prior roles, attempt self-onboard
      if (resolvingRole) return;
      if (attemptedRoleRef.current === "therapist") return;
      handleResolveRole("therapist");
      return;
    }

    // Case B: User signed in via Client Login (/login/client)
    if (autoRole === "client") {
      const hasTherapistIdentity =
        isTherapist ||
        !!whoami?.has_therapist_profile ||
        !!therapistProfile ||
        metadataRoles.includes("therapist");

      if (isClient && !hasTherapistIdentity) {
        router.replace("/dashboard/client");
        return;
      }

      // Check if this account is actually a Therapist
      if (hasTherapistIdentity) {
        toast.closeAll();
        signOut().then(() => {
          router.replace("/login/therapist?mismatch=therapist");
        });
        return;
      }

      // If genuine new client without prior roles, attempt self-onboard
      if (resolvingRole) return;
      if (attemptedRoleRef.current === "client") return;
      handleResolveRole("client");
      return;
    }

    // Case C: User signed in via Admin Login (/login/admin) but lacks admin privileges
    if (autoRole === "admin") {
      toast.closeAll();
      const target = isClient ? "/login/client?mismatch=admin" : isTherapist ? "/login/therapist?mismatch=admin" : "/login/admin?mismatch=admin";
      signOut().then(() => {
        router.replace(target);
      });
      return;
    }

    // 🔄 3. Normal / Non-Hinted Route Dispatch:
    const hasPractitionerIdentity = isTherapist || !!whoami?.has_therapist_profile || !!therapistProfile;
    if (hasExplicitRole || hasPractitionerIdentity) {
      if (hasPractitionerIdentity) {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
      return;
    }

    // 4. Metadata Role Fallback:
    if (hasMetadataRole) {
      const preferred = metadataRoles.includes("therapist") ? "therapist" : "client";
      if (preferred === "therapist") {
        router.replace("/dashboard/therapist");
        return;
      }
      if (!resolvingRole && attemptedRoleRef.current !== preferred) {
        handleResolveRole(preferred);
        return;
      }
    }

    // Last fallback: ask user to sign in through role-specific path.
    router.replace("/login");
  }, [
    isLoaded,
    authReady,
    isSignedIn,
    hasExplicitRole,
    hasMetadataRole,
    isTherapist,
    isClient,
    isAdmin,
    router,
    autoRole,
    resolvingRole,
    metadataRoles,
    therapistProfile,
    whoami,
    signOut,
    toast
  ]);

  const handleResolveRole = async (role) => {
    if (isAdmin) {
      router.replace("/admin");
      return;
    }
    setResolvingRole(true);
    attemptedRoleRef.current = role;
    try {
      const tokenTemplate =
        (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE : null) || undefined;
      let token = await getToken();
      if (!isLikelyJwt(token) && tokenTemplate) token = await getToken({ template: tokenTemplate });
      if (!token && typeof window !== "undefined" && window.Clerk?.session?.getToken) {
        token = await window.Clerk.session.getToken();
        if (!isLikelyJwt(token) && tokenTemplate) {
          token = await window.Clerk.session.getToken({ template: tokenTemplate });
        }
      }
      if (!isLikelyJwt(token)) {
        throw new Error("Authentication token unavailable.");
      }
      await apiPost("onboard/", { role });
      await user.reload();

      if (role === "therapist") {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
    } catch (e) {
      const mismatch = reportRoleDashboardMismatchFromError?.(e) || parseOnboardRoleDashboardMismatch(e);
      if (mismatch) {
        console.warn("Role mismatch during onboarding redirect (handled):", mismatch);
        toast({
          status: "warning",
          title: mismatch.title,
          description: "Use the button below or open the correct dashboard from the banner.",
          duration: 9000,
          isClosable: true,
        });
        router.replace(mismatch.correctHref);
      } else {
        console.error("Onboarding error:", e);
        toast({
          status: "error",
          title: "Could not finalize account setup.",
          description: e?.message || "Please sign in again.",
        });
        router.replace("/login");
      }
    } finally {
      setResolvingRole(false);
    }
  };

  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="mlc.green" thickness="4px" />
        <Text color="gray.500" fontWeight="500">Entering the portal...</Text>
      </VStack>
    </Center>
  );
}
