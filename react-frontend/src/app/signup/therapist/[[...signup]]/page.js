'use client';

import { SignUp } from "@clerk/nextjs";
import { Box, Container, Heading, VStack, HStack, Text, Button, Icon, Image } from "@chakra-ui/react";
import { FiArrowLeft, FiShield, FiLock, FiArrowRight } from "react-icons/fi";
import NextLink from "next/link";

const ROLE_META = { role: "therapist", roles: ["therapist"] };

export default function TherapistSignUpPage() {
  return (
    <Box 
      minH="100vh" 
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={{ base: 10, md: 14 }} 
      px={4}
      position="relative"
      overflow="hidden"
      bg="#FDFBFA"
    >
      {/* 🌿 Gentle Ambient Glow Gradients */}
      <Box 
        position="absolute" 
        top="5%" 
        left="50%" 
        transform="translateX(-50%)" 
        w={{ base: "320px", md: "700px" }} 
        h="450px" 
        bg="radial-gradient(ellipse at center, rgba(38, 58, 51, 0.05) 0%, rgba(169, 203, 183, 0.12) 45%, rgba(253, 251, 250, 0) 75%)" 
        pointerEvents="none" 
        zIndex={0}
      />
      <Box 
        position="absolute" 
        bottom="-80px" 
        left="-80px" 
        w="350px" 
        h="350px" 
        bg="radial-gradient(circle, rgba(38, 58, 51, 0.05) 0%, rgba(253, 251, 250, 0) 70%)" 
        pointerEvents="none" 
        zIndex={0}
      />

      <Container maxW="460px" position="relative" zIndex={1} px={0}>
        <VStack spacing={6} align="stretch" w="100%">
          
          {/* Top Return Link & Badge — aligned to card width */}
          <HStack justify="space-between" w="100%" px={1}>
            <Button
              as={NextLink}
              href="/signup"
              variant="unstyled"
              display="inline-flex"
              alignItems="center"
              fontSize="13px"
              fontWeight="500"
              color="#56756D"
              px={3}
              py={1.5}
              borderRadius="full"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33", transform: "translateX(-2px)" }}
              _focus={{ boxShadow: "none", outline: "none" }}
              transition="all 0.2s ease"
              leftIcon={<Icon as={FiArrowLeft} boxSize="14px" />}
            >
              Back to Portals
            </Button>

            <HStack 
              spacing={1.5} 
              px={3} 
              py={1.5} 
              borderRadius="full" 
              bg="rgba(38, 58, 51, 0.07)" 
              border="1px solid"
              borderColor="rgba(38, 58, 51, 0.16)"
            >
              <Icon as={FiShield} boxSize="12px" color="#263A33" />
              <Text 
                fontSize="10.5px" 
                fontWeight="600" 
                letterSpacing="0.08em" 
                textTransform="uppercase" 
                color="#263A33"
              >
                Clinician Onboarding
              </Text>
            </HStack>
          </HStack>

          {/* Centered Brand & Header */}
          <VStack spacing={3} textAlign="center" w="100%">
            <Box
              w="58px"
              h="58px"
              borderRadius="full"
              bg="white"
              p={2}
              border="1px solid rgba(38, 58, 51, 0.2)"
              boxShadow="0 8px 20px -4px rgba(38, 58, 51, 0.1)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image 
                src="/logo_tra.png" 
                alt="MLC Therapy" 
                maxW="100%" 
                maxH="100%" 
                objectFit="contain"
              />
            </Box>

            <VStack spacing={1}>
              <Heading 
                as="h1"
                fontSize={{ base: "26px", md: "30px" }} 
                color="#263A33" 
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight="600"
                letterSpacing="-0.015em"
              >
                Join the Collective
              </Heading>
              <Text color="#5A6E65" fontSize="13.5px" fontFamily="'Inter', sans-serif">
                Create your therapist account to begin clinical practice onboarding.
              </Text>
            </VStack>
          </VStack>

          {/* Clerk Auth Card */}
          <Box w="100%">
            <SignUp
              path="/signup/therapist"
              routing="path"
              signInUrl="/login/therapist"
              appearance={{
                elements: {
                  rootBox: { width: "100%" },
                  cardBox: { width: "100%", boxShadow: "none" },
                  card: {
                    boxShadow: '0 20px 45px -12px rgba(38, 58, 51, 0.09), 0 4px 16px rgba(0, 0, 0, 0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(86, 117, 109, 0.16)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    width: '100%',
                    padding: '28px 24px',
                  },
                  header: {
                    display: 'none',
                  },
                  socialButtonsBlockButton: {
                    borderRadius: '14px',
                    border: '1px solid rgba(86, 117, 109, 0.2)',
                    fontSize: '13.5px',
                    fontWeight: '500',
                    fontFamily: "'Inter', sans-serif",
                    color: '#263A33',
                    height: '44px',
                    '&:hover': {
                      backgroundColor: 'rgba(86, 117, 109, 0.05)',
                      borderColor: '#263A33',
                    }
                  },
                  dividerLine: {
                    backgroundColor: 'rgba(86, 117, 109, 0.14)',
                  },
                  dividerText: {
                    color: '#7A8D86',
                    fontSize: '12px',
                    fontFamily: "'Inter', sans-serif",
                  },
                  formFieldLabel: {
                    color: '#263A33',
                    fontSize: '12.5px',
                    fontWeight: '500',
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: '4px',
                  },
                  formFieldInput: {
                    borderRadius: '12px',
                    borderColor: 'rgba(86, 117, 109, 0.22)',
                    fontSize: '13.5px',
                    fontFamily: "'Inter', sans-serif",
                    height: '42px',
                    '&:focus': {
                      borderColor: '#263A33',
                      boxShadow: '0 0 0 2px rgba(38, 58, 51, 0.16)',
                    }
                  },
                  formButtonPrimary: {
                    backgroundColor: '#263A33',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: "'Inter', sans-serif",
                    height: '44px',
                    boxShadow: '0 4px 14px rgba(38, 58, 51, 0.25)',
                    '&:hover': {
                      backgroundColor: '#182722',
                      boxShadow: '0 6px 18px rgba(38, 58, 51, 0.35)',
                    }
                  },
                  footerActionLink: {
                    color: '#263A33',
                    fontWeight: '600',
                    fontFamily: "'Inter', sans-serif",
                    '&:hover': {
                      color: '#56756D',
                      textDecoration: 'underline',
                    }
                  },
                  footer: {
                    background: 'transparent',
                    borderTop: 'none',
                    paddingTop: '8px',
                  }
                }
              }}
              unsafeMetadata={ROLE_META}
              fallbackRedirectUrl="/dashboard?role=therapist"
            />
          </Box>

          {/* 🌿 Elegant Custom Sign-In Switcher */}
          <Box
            w="100%"
            py={3.5}
            px={5}
            borderRadius="18px"
            bg="white"
            border="1px solid rgba(38, 58, 51, 0.14)"
            boxShadow="0 4px 16px -4px rgba(38, 58, 51, 0.05)"
            textAlign="center"
          >
            <Text fontSize="13px" color="#5A6E65" fontFamily="'Inter', sans-serif">
              Already a registered clinician?{" "}
              <Button
                as={NextLink}
                href="/login/therapist"
                variant="unstyled"
                color="#263A33"
                fontWeight="600"
                fontSize="13px"
                display="inline-flex"
                alignItems="center"
                ml={1}
                _hover={{ color: "#182722", textDecoration: "underline" }}
                rightIcon={<Icon as={FiArrowRight} boxSize="13px" ml={-1} />}
              >
                Sign in here
              </Button>
            </Text>
          </Box>

          {/* Privacy & Trust Note */}
          <HStack justify="center" spacing={1.5} color="#7A8D86" fontSize="11.5px" fontFamily="'Inter', sans-serif">
            <Icon as={FiLock} boxSize="11px" color="#263A33" />
            <Text>HIPAA-Aligned • End-to-End Encrypted Clinical Records</Text>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
}
