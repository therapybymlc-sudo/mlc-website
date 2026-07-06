'use client';

import NextLink from 'next/link';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';

const COPY = {
  basic: {
    title: 'MLC Pro required',
    description:
      'Activate MLC Pro to use this feature — calendar, bookings, profile publishing, and client workflows. Plans are live now.',
    cta: 'Activate MLC Pro',
    href: '/dashboard/therapist/subscription',
  },
  premium: {
    title: 'Therapist OS — coming soon',
    description:
      'Therapist OS Premium is on the back burner. MLC Pro is live today. Join the pre-release waitlist for Therapist OS launch pricing.',
    cta: 'Join pre-release list',
    href: '/dashboard/therapist/premium#premium-pre-release',
  },
};

export default function SubscriptionWall({
  tier = 'basic',
  featureName,
  hasAccess = true,
  onUpgrade,
  compact = false,
  children,
}) {
  if (hasAccess) return children || null;

  const copy = COPY[tier] || COPY.basic;
  const label = featureName ? `${copy.title}: ${featureName}` : copy.title;

  if (compact) {
    return (
      <Alert status="warning" borderRadius="xl" mb={4}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="sm">{label}</AlertTitle>
          <AlertDescription fontSize="sm">{copy.description}</AlertDescription>
        </Box>
        <Button
          size="sm"
          colorScheme="orange"
          borderRadius="full"
          onClick={onUpgrade}
          as={onUpgrade ? undefined : NextLink}
          href={onUpgrade ? undefined : copy.href}
        >
          {copy.cta}
        </Button>
      </Alert>
    );
  }

  return (
    <Box
      borderRadius="2xl"
      border="1px dashed"
      borderColor="orange.200"
      bg="orange.50"
      p={{ base: 5, md: 6 }}
      mb={6}
    >
      <HStack align="start" spacing={4}>
        <Box color="orange.500" pt={1}>
          <FiLock size={22} />
        </Box>
        <VStack align="start" spacing={3} flex="1">
          <Box>
            <Text fontWeight="700" color="orange.900">
              {label}
            </Text>
            <Text fontSize="sm" color="orange.800" mt={1}>
              {copy.description}
            </Text>
          </Box>
          <Button
            size="sm"
            bg="#56756D"
            color="white"
            borderRadius="full"
            onClick={onUpgrade}
            as={onUpgrade ? undefined : NextLink}
            href={onUpgrade ? undefined : copy.href}
            _hover={{ bg: '#3E5B54' }}
          >
            {copy.cta}
          </Button>
        </VStack>
      </HStack>
      {children ? (
        <Box mt={4} opacity={0.45} pointerEvents="none" userSelect="none" aria-hidden="true">
          {children}
        </Box>
      ) : null}
    </Box>
  );
}
