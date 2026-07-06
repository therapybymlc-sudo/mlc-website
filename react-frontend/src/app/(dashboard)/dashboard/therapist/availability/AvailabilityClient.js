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
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { FiClock, FiShield } from "react-icons/fi";
import SubscriptionWall from "../../../../../components/SubscriptionWall";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";

const TherapistAvailabilityComponent = dynamic(() => import("./TherapistAvailabilityWrapper"), {
  ssr: false,
  loading: () => (
    <Box h="600px" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="xl" color="#56756D" />
    </Box>
  ),
});

export default function AvailabilityClient() {
  const { hasBasicAccess, requireBasicAccess, gateModal } = useTherapistSubscriptionGate();

  return (
    <Box>
      <Box bg="teal.50" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="teal.100" mb={10}>
         <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 4, md: 6 }} align="start">
            <Icon as={FiShield} color="teal.500" boxSize={8} mt={1} />
            <VStack align="start" spacing={2}>
               <Heading size="md" color="teal.800">🌿 Clinical Stewardship Protocol</Heading>
               <Text fontSize="md" color="teal.700" fontWeight="500">
                  To maintain consistent care, we recommend scheduling your recurring clients and supervisees as far in advance as possible. 
                  Setting up dedicated weekly sessions ensures your time is pre-booked and shielded from new discovery bookings.
               </Text>
               <HStack spacing={4} mt={2} wrap="wrap">
                  <Badge colorScheme="teal" variant="solid" borderRadius="full" px={3}>RECURRING SESSIONS</Badge>
                  <Badge colorScheme="orange" variant="solid" borderRadius="full" px={3}>EARLY BOOKING</Badge>
               </HStack>
            </VStack>
         </Stack>
      </Box>

      {!hasBasicAccess && (
        <SubscriptionWall
          tier="basic"
          featureName="Clinical availability"
          hasAccess={false}
          onUpgrade={() => requireBasicAccess()}
          compact
        />
      )}

      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Clinical Availability
        </Heading>
        <Text color="gray.500">Configure your standard weekly hours and manage live calendar slots.</Text>
      </VStack>

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
