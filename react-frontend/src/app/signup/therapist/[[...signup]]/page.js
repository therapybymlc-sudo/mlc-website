'use client'

import { SignUp } from "@clerk/nextjs";
import { Box, Container, Heading, VStack, Text } from "@chakra-ui/react";

const ROLE_META = { role: "therapist", roles: ["therapist"] };

export default function TherapistSignUpPage() {
  return (
    <Box bg="rgba(169, 203, 183, 0.12)" minH="100vh" py={20}>
      <Container maxW="lg">
        <VStack spacing={8} align="center">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
              Join MLC as a Practitioner
            </Heading>
            <Text color="gray.600">Create your therapist account to begin verification.</Text>
          </VStack>

          <SignUp
            path="/signup/therapist"
            routing="path"
            signInUrl="/login/therapist"
            appearance={{
              elements: {
                formButtonPrimary: {
                  backgroundColor: "#56756C",
                  "&:hover": {
                    backgroundColor: "#455e56",
                  },
                },
                card: {
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  borderRadius: "1.5rem",
                },
              },
            }}
            unsafeMetadata={ROLE_META}
            fallbackRedirectUrl="/dashboard?role=therapist"
          />
        </VStack>
      </Container>
    </Box>
  );
}
