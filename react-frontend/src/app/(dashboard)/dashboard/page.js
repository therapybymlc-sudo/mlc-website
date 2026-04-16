'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Box, Heading, Text, Button, VStack, useToast } from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import { apiPost } from "../../../api.js";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [onboarding, setOnboarding] = useState(false);
  const toast = useToast();

  const roles = user?.publicMetadata?.roles || [];
  const hasExplicitRole = Array.isArray(roles) && roles.length > 0;
  const isTherapist = roles.includes("therapist") || roles.includes("admin");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    if (hasExplicitRole) {
      if (isTherapist) {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
    }
  }, [isLoaded, isSignedIn, hasExplicitRole, isTherapist, router]);

  const handleSelectRole = async (role) => {
    setOnboarding(true);
    try {
      await apiPost("/onboard/", { role });
      // In Next.js with Clerk, we might need a small delay for metadata sync
      // or we can just redirect and the next page will check again
      toast({ status: "success", title: `Welcome as a ${role}!` });
      
      // Force a refresh of the user object to get new metadata
      await user.reload();
      
      if (role === 'therapist') {
        router.replace("/dashboard/therapist");
      } else {
        router.replace("/dashboard/client");
      }
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't set role." });
      setOnboarding(false);
    }
  };

  if (!isLoaded || onboarding || (isSignedIn && hasExplicitRole)) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="mlc.green" thickness="4px" />
          <Text color="gray.500" fontWeight="500">Entering the portal...</Text>
        </VStack>
      </Center>
    );
  }

  // If signed in but no role (onboarding)
  return (
    <Center py={24} h="100vh" bg="#F6F6F4">
      <Box 
        bg="white" 
        p={10} 
        borderRadius="3xl" 
        boxShadow="2xl" 
        maxW="md" 
        textAlign="center"
        border="1px solid"
        borderColor="gray.100"
      >
        <Heading size="lg" mb={4} color="mlc.greenDark" fontFamily="'Playfair Display', serif">
          Select your Path
        </Heading>
        <Text color="gray.600" mb={8} fontSize="md">
          How would you like to use the MLC portal?
        </Text>
        <VStack spacing={4}>
          <Button 
            w="100%" 
            size="lg" 
            bg="#56756C" 
            color="white" 
            borderRadius="full"
            _hover={{ bg: "#C9A960" }}
            onClick={() => handleSelectRole("client")}
          >
            I am a Client
          </Button>
          <Button 
            w="100%" 
            size="lg" 
            variant="outline" 
            borderColor="#56756C" 
            color="#56756C" 
            borderRadius="full"
            _hover={{ bg: "gray.50" }}
            onClick={() => handleSelectRole("therapist")}
          >
            I am a Practitioner
          </Button>
        </VStack>
      </Box>
    </Center>
  );
}
