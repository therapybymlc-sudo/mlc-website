'use client';

import { useEffect } from "react";
import { SignIn, useUser } from "@clerk/nextjs";
import { Box, Container, Heading, VStack, HStack, Text, Button, Icon, Image, useToast, CloseButton } from "@chakra-ui/react";
import { FiArrowLeft, FiShield, FiLock, FiKey, FiAlertCircle } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import NextLink from "next/link";

export default function AdminSignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const mismatch = searchParams.get("mismatch");
  const toast = useToast();

  useEffect(() => {
    if (isLoaded && isSignedIn && !mismatch) {
      router.replace("/admin");
    }
  }, [isLoaded, isSignedIn, mismatch, router]);

  useEffect(() => {
    if (!mismatch) return;
    const TOAST_ID = "role-mismatch-notice";
    if (toast.isActive(TOAST_ID)) return;

    toast.closeAll();

    const title = "Admin Portal";
    const desc = "Administrative credentials required.";

    toast({
      id: TOAST_ID,
      position: "top",
      duration: 5000,
      isClosable: true,
      render: ({ onClose }) => (
        <Box
          bg="#782320"
          color="#FFF"
          px={3.5}
          py={2}
          borderRadius="full"
          boxShadow="0 4px 16px rgba(0, 0, 0, 0.22)"
          display="flex"
          alignItems="center"
          gap={2.5}
          maxW={{ base: "90vw", sm: "440px" }}
          mx="auto"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <Icon as={FiAlertCircle} w={3.5} h={3.5} color="#FFA8A8" flexShrink={0} />
          <Text fontSize="12px" fontFamily="'Inter', sans-serif" flex="1" noOfLines={1} color="#FFF">
            <Text as="span" fontWeight="700" mr={1.5} color="#FFD1D1">
              {title}:
            </Text>
            {desc}
          </Text>
          <CloseButton size="sm" color="whiteAlpha.800" _hover={{ color: "white" }} onClick={onClose} />
        </Box>
      ),
    });

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("mismatch");
      window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
    }
  }, [mismatch, toast]);
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
      {/* 🌿 Gentle Ambient Background Glow */}
      <Box 
        position="absolute" 
        top="5%" 
        left="50%" 
        transform="translateX(-50%)" 
        w={{ base: "320px", md: "700px" }} 
        h="450px" 
        bg="radial-gradient(ellipse at center, rgba(38, 58, 51, 0.06) 0%, rgba(169, 203, 183, 0.12) 45%, rgba(253, 251, 250, 0) 75%)" 
        pointerEvents="none" 
        zIndex={0}
      />
      <Box 
        position="absolute" 
        bottom="-80px" 
        right="-80px" 
        w="350px" 
        h="350px" 
        bg="radial-gradient(circle, rgba(38, 58, 51, 0.05) 0%, rgba(253, 251, 250, 0) 70%)" 
        pointerEvents="none" 
        zIndex={0}
      />

      <Container maxW="460px" position="relative" zIndex={1} px={0}>
        <VStack spacing={6} align="stretch" w="100%">
          
          {/* Top Return Link & Eyebrow Badge */}
          <HStack justify="space-between" w="100%" px={1}>
            <Button
              as={NextLink}
              href="/login"
              variant="unstyled"
              display="inline-flex"
              alignItems="center"
              fontSize="13px"
              fontWeight="500"
              color="#56756D"
              px={3}
              py={1.5}
              h="auto"
              borderRadius="full"
              border="1px solid rgba(86, 117, 109, 0.2)"
              bg="rgba(255, 255, 255, 0.8)"
              backdropFilter="blur(6px)"
              transition="all 0.2s"
              _hover={{ 
                color: "#263A33", 
                borderColor: "#263A33",
                bg: "white",
                transform: "translateX(-2px)"
              }}
              leftIcon={<Icon as={FiArrowLeft} boxSize="13px" />}
            >
              Main Portal
            </Button>

            <HStack 
              spacing={1.5} 
              bg="rgba(38, 58, 51, 0.06)" 
              px={3} 
              py={1} 
              borderRadius="full"
              border="1px solid rgba(38, 58, 51, 0.12)"
            >
              <Icon as={FiKey} boxSize="11px" color="#263A33" />
              <Text 
                fontSize="10.5px" 
                fontWeight="700" 
                letterSpacing="0.1em" 
                textTransform="uppercase" 
                color="#263A33"
              >
                Governance Gateway
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
                Administration Sign In
              </Heading>
              <Text color="#5A6E65" fontSize="13.5px" fontFamily="'Inter', sans-serif" maxW="380px">
                Platform operations, clinician credentialing, content management, and clinical governance.
              </Text>
            </VStack>
          </VStack>

          {/* Clerk Auth Card */}
          <Box w="100%">
            <SignIn
              path="/login/admin"
              routing="path"
              forceRedirectUrl="/admin"
              fallbackRedirectUrl="/admin"
              afterSignInUrl="/admin"
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
              forceRedirectUrl="/admin"
              fallbackRedirectUrl="/admin"
            />
          </Box>

          {/* Privacy & Security Notice */}
          <HStack justify="center" spacing={2} color="#7A8D86" fontSize="11.5px" fontFamily="'Inter', sans-serif" pt={1}>
            <Icon as={FiShield} boxSize="12px" color="#263A33" />
            <Text>Restricted Administrative Environment • Audited & Encrypted Access</Text>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
}
