'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Text, VStack, useToast } from "@chakra-ui/react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { apiPost, parseOnboardRoleDashboardMismatch } from "../../../api.js";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const {
    roles = [],
    isTherapist,
    isClient,
    isAdmin,
    metadataRoles = [],
    reportRoleDashboardMismatchFromError,
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
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    // Honor ?role= from redirect URL (configure Account Portal / sign-in redirect to include it).
    const hintedRole = autoRole;
    if (hintedRole === "therapist" || hintedRole === "client") {
      const hasHintedRole =
        hintedRole === "therapist" ? (isTherapist || isAdmin) : isClient;

      if (hasHintedRole) {
        router.replace(hintedRole === "therapist" ? "/dashboard/therapist" : "/dashboard/client");
        return;
      }

      if (resolvingRole) return;
      if (attemptedRoleRef.current === hintedRole) return;
      handleResolveRole(hintedRole);
      return;
    }

    if (hasExplicitRole) {
      if (isTherapist || isAdmin) {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
      return;
    }

    // No canonical profile role yet.
    // If metadata suggests an intended role, bootstrap canonical profile via onboard automatically.
    if (!hasExplicitRole && hasMetadataRole) {
      const preferred = metadataRoles.includes("therapist") ? "therapist" : "client";
      if (!resolvingRole && attemptedRoleRef.current !== preferred) {
        handleResolveRole(preferred);
        return;
      }
    }

    // Last fallback: ask user to sign in through role-specific path.
    router.replace("/login");
  }, [isLoaded, isSignedIn, hasExplicitRole, hasMetadataRole, isTherapist, isClient, isAdmin, router, autoRole, resolvingRole, metadataRoles]);

  const handleResolveRole = async (role) => {
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
      console.error(e);
      const mismatch = reportRoleDashboardMismatchFromError?.(e) || parseOnboardRoleDashboardMismatch(e);
      if (mismatch) {
        toast({
          status: "warning",
          title: mismatch.title,
          description: "Use the button below or open the correct dashboard from the banner.",
          duration: 9000,
          isClosable: true,
        });
        router.replace(mismatch.correctHref);
      } else {
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
