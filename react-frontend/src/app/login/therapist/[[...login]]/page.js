'use client'

import { SignIn } from "@clerk/nextjs";
import { Box, Container, Heading, VStack, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export default function TherapistSignInPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Persist explicit therapist login intent across Clerk redirects.
    localStorage.setItem("mlc_login_intent", "therapist");
  }, []);

  return (
    <Box bg="rgba(169, 203, 183, 0.12)" minH="100vh" py={20}>
      <Container maxW="lg">
        <VStack spacing={8} align="center">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
              Therapist Workspace
            </Heading>
            <Text color="gray.600">Access your clinical dashboard.</Text>
          </VStack>
          
          <SignIn 
            path="/login/therapist"
            routing="path"
            signUpUrl="/signup/therapist"
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: '#56756C',
                  '&:hover': {
                    backgroundColor: '#455e56'
                  }
                },
                card: {
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderRadius: '1.5rem'
                }
              }
            }}
            forceRedirectUrl="/dashboard?role=therapist"
            fallbackRedirectUrl="/dashboard?role=therapist"
          />
        </VStack>
      </Container>
    </Box>
  );
}
