'use client'

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Text, VStack, useToast } from "@chakra-ui/react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const { roles = [], isTherapist, isClient, isAdmin } = useAuth();
  const router = useRouter();
  const [resolvingRole, setResolvingRole] = useState(false);
  const attemptedRoleRef = useRef("");
  const toast = useToast();
  const searchParams = useSearchParams();
  const autoRole = String(searchParams.get("role") || "").toLowerCase();

  const hasExplicitRole = roles.length > 0;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
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

    // No manual role picker: infer role from explicit redirect hint only.
    if (resolvingRole) return;
    const hintedRole = autoRole;
    if (hintedRole === "therapist" || hintedRole === "client") {
      if (attemptedRoleRef.current === hintedRole) return;
      handleResolveRole(hintedRole);
      return;
    }

    // If role metadata is missing and we cannot infer intent, go to role-based login.
    router.replace("/login");
  }, [isLoaded, isSignedIn, hasExplicitRole, isTherapist, isClient, isAdmin, router, autoRole, resolvingRole]);

  const handleResolveRole = async (role) => {
    setResolvingRole(true);
    attemptedRoleRef.current = role;
    try {
      const tokenTemplate =
        (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE : null) || undefined;
      const token = await getToken(tokenTemplate ? { template: tokenTemplate } : undefined);
      if (!token) {
        throw new Error("Authentication token unavailable.");
      }
      const apiBase = (
        (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE : null) ||
        "http://localhost:8000/api"
      ).replace(/\/+$/, "");

      const res = await fetch(`${apiBase}/onboard/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.detail || "Unable to set role.");
      }
      localStorage.setItem("mlc_signup_role", role);
      await user.reload();

      if (role === 'therapist') {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
    } catch (e) {
      console.error(e);
      toast({
        status: "error",
        title: "Could not finalize account setup.",
        description: e?.message || "Please sign in again.",
      });
      if (role === "therapist") {
        router.replace("/login/therapist");
      } else {
        router.replace("/login/client");
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
