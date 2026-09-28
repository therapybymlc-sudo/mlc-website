'use client'

import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  SimpleGrid, 
  Button, 
  Text, 
  Icon,
  Tag
} from "@chakra-ui/react";
import { 
  FiHeart, 
  FiUserCheck, 
  FiArrowRight, 
  FiArrowLeft,
  FiLock, 
  FiShield, 
  FiHelpCircle 
} from "react-icons/fi";
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupClient() {
  const router = useRouter();
  return (
    <Box 
      minH="100vh" 
      py={{ base: 12, md: 20 }} 
      px={4}
      position="relative"
      overflow="hidden"
      bg="#FDFBFA"
    >
      {/* 🌿 Calming Ambient Background Elements */}
      <Box 
        position="absolute" 
        top="0" 
        left="50%" 
        transform="translateX(-50%)" 
        w="1000px" 
        h="400px" 
        bg="radial-gradient(ellipse at 50% 0%, rgba(201, 169, 96, 0.08) 0%, rgba(169, 203, 183, 0.12) 45%, rgba(253, 251, 250, 0) 75%)" 
        pointerEvents="none" 
        zIndex={0}
      />
      <Box 
        position="absolute" 
        bottom="-100px" 
        right="-100px" 
        w="450px" 
        h="450px" 
        bg="radial-gradient(circle, rgba(86, 117, 109, 0.06) 0%, rgba(253, 251, 250, 0) 70%)" 
        pointerEvents="none" 
        zIndex={0}
      />

      <Container maxW="5xl" position="relative" zIndex={1}>
        <VStack spacing={{ base: 8, md: 12 }} align="center">
          
          {/* 🌿 Top Return Navigation */}
          <HStack justify="flex-start" w="100%" maxW="920px">
            <Button
              as={NextLink}
              href="/"
              variant="unstyled"
              display="inline-flex"
              alignItems="center"
              fontSize="13.5px"
              fontWeight="500"
              color="#56756D"
              px={3}
              py={1.5}
              borderRadius="full"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33", transform: "translateX(-2px)" }}
              _focus={{ boxShadow: "none", outline: "none" }}
              transition="all 0.2s ease"
              leftIcon={<Icon as={FiArrowLeft} boxSize="15px" />}
            >
              Return to Website
            </Button>
          </HStack>

          {/* 🏷️ Gateway Header */}
          <VStack spacing={3.5} textAlign="center" maxW="720px">
            <HStack 
              spacing={2} 
              px={3.5} 
              py={1} 
              borderRadius="full" 
              bg="rgba(86, 117, 109, 0.08)" 
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.18)"
            >
              <Icon as={FiShield} boxSize="13px" color="#56756D" />
              <Text 
                fontSize="11.5px" 
                fontWeight="600" 
                letterSpacing="0.12em" 
                textTransform="uppercase" 
                color="#425C55"
                fontFamily="'Inter', sans-serif"
              >
                Join the MLC Ecosystem
              </Text>
            </HStack>

            <Heading 
              as="h1" 
              fontSize={{ base: "32px", md: "46px" }} 
              fontFamily="'Playfair Display', Georgia, serif"
              fontWeight="600" 
              color="#263A33" 
              letterSpacing="-0.02em"
              lineHeight="1.15"
            >
              Create Your MLC Account
            </Heading>

            <Text 
              fontSize={{ base: "15px", md: "16.5px" }} 
              fontFamily="'Inter', sans-serif"
              color="#5A6E65" 
              lineHeight="1.6"
              maxW="580px"
            >
              Select your path to begin confidential therapy or join India&apos;s leading clinical collective.
            </Text>
          </VStack>

          {/* 🏛️ Dual Registration Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, lg: 8 }} w="100%" maxW="920px">
            
            {/* 💖 Client Registration Card */}
            <Box
              onClick={() => router.push('/signup/client')}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push('/signup/client'); }}
              role="group"
              bg="white"
              p={{ base: 7, md: 9 }}
              borderRadius="28px"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.14)"
              boxShadow="0 10px 30px -5px rgba(38, 58, 51, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)"
              transition="all 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{ 
                transform: "translateY(-4px)", 
                borderColor: "rgba(86, 117, 109, 0.35)", 
                boxShadow: "0 20px 45px -10px rgba(38, 58, 51, 0.12)", 
                textDecoration: "none" 
              }}
              _focus={{ boxShadow: "0 0 0 2px #56756D", outline: "none" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              cursor="pointer"
              position="relative"
            >
              <VStack align="start" spacing={5} w="100%">
                <HStack justify="space-between" w="100%" align="center">
                  <Tag 
                    size="sm" 
                    bg="rgba(201, 169, 96, 0.12)" 
                    color="#8A7032" 
                    border="1px solid rgba(201, 169, 96, 0.25)"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="11px"
                    fontWeight="600"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    Clients & Seekers
                  </Tag>

                  <Box 
                    w="58px" 
                    h="58px" 
                    borderRadius="full" 
                    bg="linear-gradient(135deg, #FDF8F0 0%, #F5ECDD 100%)" 
                    border="1px solid rgba(201, 169, 96, 0.25)"
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    boxShadow="0 4px 12px rgba(201, 169, 96, 0.12)"
                    transition="transform 0.25s ease"
                    _groupHover={{ transform: "scale(1.06)" }}
                  >
                    <Icon as={FiHeart} boxSize="24px" color="#B38E36" />
                  </Box>
                </HStack>

                <VStack align="start" spacing={2.5}>
                  <Heading 
                    as="h2" 
                    size="lg" 
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontWeight="600" 
                    color="#263A33"
                  >
                    Register as Client
                  </Heading>
                  <Text fontSize="14px" color="#5A6E65" lineHeight="1.65" fontFamily="'Inter', sans-serif">
                    Begin your therapeutic journey with verified practitioners, a private clinical journal, and dedicated care continuity.
                  </Text>
                </VStack>

                <HStack spacing={2} flexWrap="wrap">
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Zero Waitlist
                  </Tag>
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Strict Privacy
                  </Tag>
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Free Discovery Quiz
                  </Tag>
                </HStack>
              </VStack>

              <Box w="100%" mt={8}>
                <Button 
                  w="100%" 
                  h="48px" 
                  borderRadius="full" 
                  bg="#56756D" 
                  color="white" 
                  fontSize="14.5px" 
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  boxShadow="0 4px 14px rgba(86, 117, 109, 0.22)"
                  _groupHover={{ 
                    bg: "#425C55",
                    boxShadow: "0 6px 18px rgba(86, 117, 109, 0.32)" 
                  }}
                  _focus={{ boxShadow: "none", outline: "none" }}
                  transition="all 0.2s ease"
                  rightIcon={
                    <Box 
                      as={FiArrowRight} 
                      boxSize="16px" 
                      transition="transform 0.2s ease" 
                      _groupHover={{ transform: "translateX(4px)" }} 
                    />
                  }
                >
                  Create Client Account
                </Button>

                <Text fontSize="12.5px" color="#7A8D86" mt={3.5} textAlign="center" fontFamily="'Inter', sans-serif">
                  Already have an account?{" "}
                  <Text 
                    as={NextLink} 
                    href="/login/client" 
                    onClick={(e) => e.stopPropagation()}
                    color="#56756D" 
                    fontWeight="600" 
                    textDecoration="underline" 
                    _hover={{ color: "#263A33" }}
                  >
                    Sign in here
                  </Text>
                </Text>
              </Box>
            </Box>

            {/* 🌿 Therapist Registration Card */}
            <Box
              onClick={() => router.push('/signup/therapist')}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push('/signup/therapist'); }}
              role="group"
              bg="white"
              p={{ base: 7, md: 9 }}
              borderRadius="28px"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.14)"
              boxShadow="0 10px 30px -5px rgba(38, 58, 51, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)"
              transition="all 0.28s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{ 
                transform: "translateY(-4px)", 
                borderColor: "rgba(86, 117, 109, 0.35)", 
                boxShadow: "0 20px 45px -10px rgba(38, 58, 51, 0.12)", 
                textDecoration: "none" 
              }}
              _focus={{ boxShadow: "0 0 0 2px #263A33", outline: "none" }}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              cursor="pointer"
              position="relative"
            >
              <VStack align="start" spacing={5} w="100%">
                <HStack justify="space-between" w="100%" align="center">
                  <Tag 
                    size="sm" 
                    bg="rgba(86, 117, 109, 0.1)" 
                    color="#3D5A52" 
                    border="1px solid rgba(86, 117, 109, 0.22)"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="11px"
                    fontWeight="600"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    Licensed Practitioners
                  </Tag>

                  <Box 
                    w="58px" 
                    h="58px" 
                    borderRadius="full" 
                    bg="linear-gradient(135deg, #EBF3EE 0%, #D8E8DE 100%)" 
                    border="1px solid rgba(86, 117, 109, 0.25)"
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    boxShadow="0 4px 12px rgba(86, 117, 109, 0.12)"
                    transition="transform 0.25s ease"
                    _groupHover={{ transform: "scale(1.06)" }}
                  >
                    <Icon as={FiUserCheck} boxSize="24px" color="#56756D" />
                  </Box>
                </HStack>

                <VStack align="start" spacing={2.5}>
                  <Heading 
                    as="h2" 
                    size="lg" 
                    fontFamily="'Playfair Display', Georgia, serif"
                    fontWeight="600" 
                    color="#263A33"
                  >
                    Join as Therapist
                  </Heading>
                  <Text fontSize="14px" color="#5A6E65" lineHeight="1.65" fontFamily="'Inter', sans-serif">
                    Set up your verified clinical identity, join senior peer supervision, and establish your private practice within the collective.
                  </Text>
                </VStack>

                <HStack spacing={2} flexWrap="wrap">
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Vetted Network
                  </Tag>
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Supervision Included
                  </Tag>
                  <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11.5px" px={2.5} py={1}>
                    Integrated EHR
                  </Tag>
                </HStack>
              </VStack>

              <Box w="100%" mt={8}>
                <Button 
                  w="100%" 
                  h="48px" 
                  borderRadius="full" 
                  bg="#263A33" 
                  color="white" 
                  fontSize="14.5px" 
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  boxShadow="0 4px 14px rgba(38, 58, 51, 0.22)"
                  _groupHover={{ 
                    bg: "#182722",
                    boxShadow: "0 6px 18px rgba(38, 58, 51, 0.32)" 
                  }}
                  _focus={{ boxShadow: "none", outline: "none" }}
                  transition="all 0.2s ease"
                  rightIcon={
                    <Box 
                      as={FiArrowRight} 
                      boxSize="16px" 
                      transition="transform 0.2s ease" 
                      _groupHover={{ transform: "translateX(4px)" }} 
                    />
                  }
                >
                  Create Therapist Account
                </Button>

                <Text fontSize="12.5px" color="#7A8D86" mt={3.5} textAlign="center" fontFamily="'Inter', sans-serif">
                  Existing practitioner?{" "}
                  <Text 
                    as={NextLink} 
                    href="/login/therapist" 
                    onClick={(e) => e.stopPropagation()}
                    color="#56756D" 
                    fontWeight="600" 
                    textDecoration="underline" 
                    _hover={{ color: "#263A33" }}
                  >
                    Sign in here
                  </Text>
                </Text>
              </Box>
            </Box>

          </SimpleGrid>

          {/* 🔒 Security & Standards Trust Bar */}
          <HStack 
            justify="center" 
            spacing={{ base: 5, md: 10 }} 
            flexWrap="wrap" 
            pt={{ base: 4, md: 6 }} 
            color="#7A8D86" 
            fontSize="13px" 
            fontFamily="'Inter', sans-serif"
          >
            <HStack spacing={2}>
              <Icon as={FiLock} color="#56756D" boxSize="14px" />
              <Text>256-Bit SSL Encrypted Access</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiShield} color="#56756D" boxSize="14px" />
              <Text>DISHA & HIPAA Aligned Data Standards</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiHelpCircle} color="#56756D" boxSize="14px" />
              <Text>
                Assistance:{" "}
                <Text 
                  as="a" 
                  href="mailto:therapy@mlchealth.in" 
                  color="#56756D" 
                  fontWeight="600"
                  _hover={{ textDecoration: "underline" }}
                >
                  therapy@mlchealth.in
                </Text>
              </Text>
            </HStack>
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
}
