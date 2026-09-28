'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useUser, useClerk } from "@clerk/nextjs";
import { useToast, Center, Spinner, VStack, Text } from "@chakra-ui/react";

export default function AdminLayout({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { isAdmin, isClient, isTherapist, authReady } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLoaded || !authReady) return;

    if (!isSignedIn) {
      router.replace("/login/admin");
      return;
    }

    if (!isAdmin) {
      toast.closeAll();

      const targetLogin = isClient 
        ? "/login/client?mismatch=admin" 
        : isTherapist 
        ? "/login/therapist?mismatch=admin" 
        : "/login/admin?mismatch=admin";

      signOut().then(() => {
        router.replace(targetLogin);
      });
    }
  }, [mounted, isLoaded, isSignedIn, authReady, isAdmin, isClient, isTherapist, router, toast, signOut]);

  if (!mounted || !isLoaded || !authReady || !isAdmin) {
    return (
      <Center h="100vh" bg="#FDFBFA">
        <VStack spacing={4}>
          <Spinner size="xl" color="mlc.green" thickness="4px" speed="0.7s" />
          <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', sans-serif">
            Verifying administrative access...
          </Text>
        </VStack>
      </Center>
    );
  }

  return children;
}
