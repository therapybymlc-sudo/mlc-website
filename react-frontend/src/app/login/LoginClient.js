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
  FiHelpCircle,
  FiKey
} from "react-icons/fi";
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginClient() {
  const router = useRouter();
  return (
    <Box 
      minH="100vh" 
      pt={{ base: 8, md: 12, lg: 16 }} 
      pb={{ base: 10, md: 14, lg: 16 }} 
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
        h="350px" 
        bg="radial-gradient(ellipse at 50% 0%, rgba(201, 169, 96, 0.08) 0%, rgba(169, 203, 183, 0.12) 45%, rgba(253, 251, 250, 0) 75%)" 
        pointerEvents="none" 
        zIndex={0}
      />
      <Box 
        position="absolute" 
        bottom="-100px" 
        right="-100px" 
        w="400px" 
        h="400px" 
        bg="radial-gradient(circle, rgba(86, 117, 109, 0.05) 0%, rgba(253, 251, 250, 0) 70%)" 
        pointerEvents="none" 
        zIndex={0}
      />

      <Container maxW="5xl" position="relative" zIndex={1}>
        {/* 🌿 Top Navigation & Security Header Bar */}
        <HStack justify="space-between" align="center" w="100%" maxW="920px" mx="auto" mb={{ base: 5, md: 7 }}>
          <Button
            as={NextLink}
            href="/"
            variant="unstyled"
            display="inline-flex"
            alignItems="center"
            fontSize="13px"
            fontWeight="500"
            color="#56756D"
            px={3}
            py={1}
            borderRadius="full"
            _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33", transform: "translateX(-2px)" }}
            _focus={{ boxShadow: "none", outline: "none" }}
            transition="all 0.2s ease"
            leftIcon={<Icon as={FiArrowLeft} boxSize="14px" />}
          >
            Return to Website
          </Button>

          <HStack 
            spacing={1.5} 
            px={3} 
            py={1} 
            borderRadius="full" 
            bg="rgba(86, 117, 109, 0.08)" 
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.18)"
          >
            <Icon as={FiShield} boxSize="12px" color="#56756D" />
            <Text 
              fontSize="11px" 
              fontWeight="600" 
              letterSpacing="0.1em" 
              textTransform="uppercase" 
              color="#425C55"
              fontFamily="'Inter', sans-serif"
            >
              MLC Secure Portal Gateway
            </Text>
          </HStack>
        </HStack>

        {/* 🏷️ Gateway Header */}
        <VStack spacing={2.5} textAlign="center" maxW="720px" mx="auto" mb={{ base: 6, md: 8 }}>
          <Heading 
            as="h1" 
            fontSize={{ base: "26px", md: "34px" }} 
            fontFamily="'Playfair Display', Georgia, serif"
            fontWeight="600" 
            color="#263A33" 
            letterSpacing="-0.02em"
            lineHeight="1.15"
          >
            Welcome to the MLC Portal
          </Heading>

          <Text 
            fontSize={{ base: "13.5px", md: "15px" }} 
            fontFamily="'Inter', sans-serif"
            color="#5A6E65" 
            lineHeight="1.5"
            maxW="560px"
          >
            Please select your workspace below to access your confidential care records, appointments, and wellness resources.
          </Text>
        </VStack>

        {/* 🏛️ Peer-Level Dual Portal Architecture */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, lg: 8 }} w="100%" maxW="920px" mx="auto">
          
          {/* 💖 Client Portal Card */}
          <Box
            onClick={() => router.push('/login/client')}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') router.push('/login/client'); }}
            role="group"
            bg="white"
            p={{ base: 6, md: 7 }}
            borderRadius="24px"
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
            <VStack align="start" spacing={4} w="100%">
              <HStack justify="space-between" w="100%" align="center">
                <Tag 
                  size="sm" 
                  bg="rgba(201, 169, 96, 0.12)" 
                  color="#8A7032" 
                  border="1px solid rgba(201, 169, 96, 0.25)"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10.5px"
                  fontWeight="600"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  Individuals & Couples
                </Tag>

                <Box 
                  w="46px" 
                  h="46px" 
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
                  <Icon as={FiHeart} boxSize="20px" color="#B38E36" />
                </Box>
              </HStack>

              <VStack align="start" spacing={1.5}>
                <Heading 
                  as="h2" 
                  fontSize={{ base: "20px", md: "22px" }}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight="600" 
                  color="#263A33"
                >
                  Client Portal
                </Heading>
                <Text fontSize="13px" color="#5A6E65" lineHeight="1.55" fontFamily="'Inter', sans-serif">
                  Access your scheduled therapy appointments, private reflective journal, self-care resources, and direct clinician communication.
                </Text>
              </VStack>

              {/* Feature Tags */}
              <HStack spacing={2} flexWrap="wrap">
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Encrypted Sessions
                </Tag>
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Private Journal
                </Tag>
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Resource Library
                </Tag>
              </HStack>
            </VStack>

            <Box w="100%" mt={5}>
              <Button 
                w="100%" 
                h="44px" 
                borderRadius="full" 
                bg="#56756D" 
                color="white" 
                fontSize="14px" 
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
                    boxSize="15px" 
                    transition="transform 0.2s ease" 
                    _groupHover={{ transform: "translateX(4px)" }} 
                  />
                }
              >
                Enter Client Portal
              </Button>

              <Text fontSize="12px" color="#7A8D86" mt={2.5} textAlign="center" fontFamily="'Inter', sans-serif">
                New to therapy?{" "}
                <Text 
                  as={NextLink} 
                  href="/therapists/discovery" 
                  onClick={(e) => e.stopPropagation()}
                  color="#56756D" 
                  fontWeight="600" 
                  textDecoration="underline" 
                  _hover={{ color: "#263A33" }}
                >
                  Find your therapist
                </Text>
              </Text>
            </Box>
          </Box>

          {/* 🌿 Therapist Portal Card */}
          <Box
            onClick={() => router.push('/login/therapist')}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') router.push('/login/therapist'); }}
            role="group"
            bg="white"
            p={{ base: 6, md: 7 }}
            borderRadius="24px"
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
            <VStack align="start" spacing={4} w="100%">
              <HStack justify="space-between" w="100%" align="center">
                <Tag 
                  size="sm" 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#3D5A52" 
                  border="1px solid rgba(86, 117, 109, 0.22)"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="10.5px"
                  fontWeight="600"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  Licensed Practitioners
                </Tag>

                <Box 
                  w="46px" 
                  h="46px" 
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
                  <Icon as={FiUserCheck} boxSize="20px" color="#56756D" />
                </Box>
              </HStack>

              <VStack align="start" spacing={1.5}>
                <Heading 
                  as="h2" 
                  fontSize={{ base: "20px", md: "22px" }}
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight="600" 
                  color="#263A33"
                >
                  Therapist Portal
                </Heading>
                <Text fontSize="13px" color="#5A6E65" lineHeight="1.55" fontFamily="'Inter', sans-serif">
                  Manage your client appointments, confidential clinical progress notes, peer supervision cohorts, and practice analytics.
                </Text>
              </VStack>

              {/* Feature Tags */}
              <HStack spacing={2} flexWrap="wrap">
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Practice Calendar
                </Tag>
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Clinical Notes
                </Tag>
                <Tag size="sm" variant="subtle" bg="#F4F7F5" color="#56756D" borderRadius="full" fontSize="11px" px={2.5} py={0.5}>
                  Supervision Suite
                </Tag>
              </HStack>
            </VStack>

            <Box w="100%" mt={5}>
              <Button 
                w="100%" 
                h="44px" 
                borderRadius="full" 
                bg="#263A33" 
                color="white" 
                fontSize="14px" 
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
                    boxSize="15px" 
                    transition="transform 0.2s ease" 
                    _groupHover={{ transform: "translateX(4px)" }} 
                  />
                }
              >
                Enter Therapist Portal
              </Button>

              <Text fontSize="12px" color="#7A8D86" mt={2.5} textAlign="center" fontFamily="'Inter', sans-serif">
                Not yet part of our collective?{" "}
                <Text 
                  as={NextLink} 
                  href="/therapist-apply" 
                  onClick={(e) => e.stopPropagation()}
                  color="#56756D" 
                  fontWeight="600" 
                  textDecoration="underline" 
                  _hover={{ color: "#263A33" }}
                >
                  Apply as a clinician
                </Text>
              </Text>
            </Box>
          </Box>

        </SimpleGrid>

        {/* 🔒 Security & Standards Trust Bar */}
        <HStack 
          justify="center" 
          spacing={{ base: 4, md: 8 }} 
          flexWrap="wrap" 
          pt={{ base: 7, md: 9 }} 
          color="#7A8D86" 
          fontSize="12px" 
          fontFamily="'Inter', sans-serif"
        >
          <HStack spacing={1.5}>
            <Icon as={FiLock} color="#56756D" boxSize="13px" />
            <Text>256-Bit SSL Encrypted Portal</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Icon as={FiShield} color="#56756D" boxSize="13px" />
            <Text>DISHA & HIPAA Aligned Confidentiality</Text>
          </HStack>
          <HStack spacing={1.5}>
            <Icon as={FiHelpCircle} color="#56756D" boxSize="13px" />
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

        {/* 🗝️ Quiet Luxury Administration Link */}
        <HStack justify="center" pt={4}>
          <Text 
            as={NextLink} 
            href="/login/admin" 
            fontSize="12px" 
            color="#8A9D96"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            transition="all 0.2s ease"
            _hover={{ color: "#263A33", textDecoration: "underline" }}
          >
            <Icon as={FiKey} boxSize="11px" />
            Administration & Governance Sign In →
          </Text>
        </HStack>

      </Container>
    </Box>
  );
}
