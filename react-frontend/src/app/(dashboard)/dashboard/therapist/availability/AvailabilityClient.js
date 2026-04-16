'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiClock } from "react-icons/fi";

const TherapistAvailabilityComponent = dynamic(() => import("./TherapistAvailabilityWrapper"), {
  ssr: false,
  loading: () => (
    <Box h="600px" display="flex" alignItems="center" justifyContent="center">
      <Spinner size="xl" color="#56756D" />
    </Box>
  ),
});

export default function AvailabilityClient() {
  return (
    <Box>
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
          Clinical Availability
        </Heading>
        <Text color="gray.500">Configure your standard weekly hours and manage live calendar slots.</Text>
      </VStack>

      <TherapistAvailabilityComponent />
    </Box>
  );
}
