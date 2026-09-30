'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Button,
  Spinner,
  Icon,
  Badge,
  Flex,
  Circle,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import { FiClock, FiShield, FiCalendar } from "react-icons/fi";
import SubscriptionWall from "../../../../../components/SubscriptionWall";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";

const TherapistAvailabilityComponent = dynamic(() => import("./TherapistAvailabilityWrapper"), {
  ssr: false,
  loading: () => (
    <Box h="400px" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="lg" color="#56756D" />
    </Box>
  ),
});

export default function AvailabilityClient() {
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiClock} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Clinical Practice · Availability
                </Badge>
                <Badge 
                  bg="rgba(16, 185, 129, 0.12)" 
                  color="#047857" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Live Sync On
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Clinical Availability
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Configure your standard weekly working capacity and manage open appointment slots.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Quick Action to Schedule */}
          <Button
            as={NextLink}
            href="/dashboard/therapist/schedule"
            bg="#56756D"
            color="white"
            borderRadius="full"
            height="38px"
            fontSize="13px"
            fontWeight="600"
            px={5}
            leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
            _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
            transition="all 0.2s"
            boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
            flexShrink={0}
          >
            View Calendar Schedule
          </Button>
        </Flex>
      </Box>

      {/* 🌿 2. CLINICAL STEWARDSHIP PROTOCOL CARD */}
      <Box 
        bg="linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)" 
        p={{ base: 4, md: 5 }} 
        borderRadius="2xl" 
        border="1px solid" 
        borderColor="rgba(16, 185, 129, 0.25)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Stack direction={{ base: "column", sm: "row" }} spacing={{ base: 3.5, md: 4 }} align="start">
          <Circle size="42px" bg="rgba(16, 185, 129, 0.15)" color="#047857" flexShrink={0} mt={0.5}>
            <Icon as={FiShield} boxSize="20px" />
          </Circle>
          <VStack align="start" spacing={1.5} flex="1">
            <HStack spacing={2} wrap="wrap">
              <Text 
                fontSize="15px" 
                fontWeight="600" 
                color="#064E3B"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Clinical Stewardship Protocol
              </Text>
            </HStack>
            <Text fontSize="13px" color="#374151" lineHeight="1.5">
              To maintain continuity of care, we recommend scheduling recurring clients and supervisees as far in advance as possible. Dedicated recurring slots safeguard your clinical schedule and protect hours from unvetted discovery requests.
            </Text>
            <HStack spacing={2} mt={1} wrap="wrap">
              <Badge 
                bg="rgba(16, 185, 129, 0.18)" 
                color="#065F46" 
                borderRadius="full" 
                px={2.5}
                py={0.5}
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.04em"
              >
                RECURRING SESSIONS
              </Badge>
              <Badge 
                bg="rgba(245, 158, 11, 0.16)" 
                color="#92400E" 
                borderRadius="full" 
                px={2.5}
                py={0.5}
                fontSize="10px"
                fontWeight="700"
                letterSpacing="0.04em"
              >
                EARLY BOOKING
              </Badge>
            </HStack>
          </VStack>
        </Stack>
      </Box>

      {!hasBasicAccess && (
        <Box mb={6}>
          <SubscriptionWall
            tier="basic"
            featureName="Clinical availability"
            hasAccess={false}
            onUpgrade={() => requireBasicAccess()}
            compact
          />
        </Box>
      )}

      {/* ⏰ 3. AVAILABILITY COMPONENT */}
      <Box opacity={hasBasicAccess ? 1 : 0.45} pointerEvents={hasBasicAccess ? 'auto' : 'none'}>
        <TherapistAvailabilityComponent />
      </Box>

      <TherapistGatedGateway
        isOpen={gateModal.isOpen}
        onClose={gateModal.onClose}
        contextLabel="Activate MLC Pro to publish availability and receive booking requests."
      />
    </Box>
  );
}
