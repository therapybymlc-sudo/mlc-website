'use client'

import { useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { Box, Container, Heading, VStack, Text } from "@chakra-ui/react";

const ROLE_META = { role: "client", roles: ["client"] };

export default function ClientSignUpPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mlc_signup_role", "client");
  }, []);

  return (
    <Box bg="rgba(169, 203, 183, 0.12)" minH="100vh" py={20}>
      <Container maxW="lg">
        <VStack spacing={8} align="center">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
              Join MLC Health
            </Heading>
            <Text color="gray.600">Create your private client account.</Text>
          </VStack>

          <SignUp
            path="/signup/client"
            routing="path"
            signInUrl="/login/client"
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
            unsafeMetadata={ROLE_META}
            fallbackRedirectUrl="/dashboard?role=client"
          />
        </VStack>
      </Container>
    </Box>
  );
}
