'use client';

import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Badge,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiTrendingUp, FiUsers, FiFileText, FiClock, FiShield, FiArrowRight } from 'react-icons/fi';

const SLIDES = [
  {
    title: 'Get matched with new clients',
    subtitle: 'Become visible on the MLC platform and grow your practice pipeline.',
    icon: FiUsers,
    bullets: ['Appear in therapist discovery', 'Receive structured booking requests', 'Build long-term caseload consistency'],
  },
  {
    title: 'Go paperless with your practice',
    subtitle: 'Manage sessions, notes, resources, and follow-ups in one clinical workspace.',
    icon: FiFileText,
    bullets: ['Clinical schedule + recurring sessions', 'Goals, journals, and care tools', 'Everything synced in one dashboard'],
  },
  {
    title: 'Cut admin work to near zero',
    subtitle: 'Let MLC handle repetitive workflows so you focus on therapeutic impact.',
    icon: FiClock,
    bullets: ['Streamlined appointment workflows', 'Automated client-facing flow', 'Faster daily operations'],
  },
];

export default function TherapistSubscriptionGateway({
  isOpen = false,
  onClose,
  title = 'Unlock MLC Therapist Platform',
  contextLabel = 'This action requires an active therapist subscription.',
  mode = 'modal', // modal | inline
  onSelectPlan,
  loadingPlan = '',
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = SLIDES[slideIndex];

  const monthlyUrl = process.env.NEXT_PUBLIC_THERAPIST_BASIC_MONTHLY_URL || '/dashboard/therapist/subscription?plan=basic_monthly';
  const annualUrl = process.env.NEXT_PUBLIC_THERAPIST_BASIC_ANNUAL_URL || '/dashboard/therapist/subscription?plan=basic_annual';
  const premiumUrl = process.env.NEXT_PUBLIC_THERAPIST_PREMIUM_URL || '/dashboard/therapist/premium';

  const Body = useMemo(
    () => (
      <VStack align="stretch" spacing={6}>
        <Box bg="linear-gradient(135deg, #56756D 0%, #2E4A44 100%)" borderRadius="2xl" p={6} color="white">
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={1}>
              <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={3} py={1}>
                Basic Plan Gate
              </Badge>
              <Heading size="md">{title}</Heading>
              <Text fontSize="sm" opacity={0.9}>
                {contextLabel}
              </Text>
            </VStack>
            <Icon as={slide.icon} boxSize={7} />
          </HStack>

          <VStack align="start" spacing={2}>
            <Heading size="sm">{slide.title}</Heading>
            <Text fontSize="sm" opacity={0.9}>
              {slide.subtitle}
            </Text>
            {slide.bullets.map((b) => (
              <HStack key={b} spacing={2} align="start">
                <Text mt="-1px">•</Text>
                <Text fontSize="sm">{b}</Text>
              </HStack>
            ))}
          </VStack>

          <HStack mt={4} spacing={3}>
            <Button
              size="sm"
              variant="outline"
              borderColor="whiteAlpha.500"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={() => setSlideIndex((s) => Math.max(0, s - 1))}
              isDisabled={slideIndex === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              bg="white"
              color="#2E4A44"
              _hover={{ bg: 'gray.100' }}
              onClick={() => setSlideIndex((s) => Math.min(SLIDES.length - 1, s + 1))}
              isDisabled={slideIndex === SLIDES.length - 1}
            >
              Next
            </Button>
          </HStack>
          <Progress value={((slideIndex + 1) / SLIDES.length) * 100} size="xs" mt={3} borderRadius="full" bg="whiteAlpha.300" />
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box border="1px solid" borderColor="gray.100" borderRadius="2xl" p={5} bg="white">
            <HStack mb={2}>
              <Icon as={FiShield} color="#56756D" />
              <Text fontWeight="700">Basic Monthly</Text>
            </HStack>
            <Heading size="md" color="#2E2E2E">
              INR 99<span style={{ fontSize: '0.8rem', color: '#6B7280' }}>/month</span>
            </Heading>
            <Text mt={2} fontSize="sm" color="gray.600">
              Get listed publicly, get matched with clients, and use core MLC therapist dashboard tools.
            </Text>
            <Button
              as={onSelectPlan ? 'button' : NextLink}
              href={onSelectPlan ? undefined : monthlyUrl}
              mt={4}
              w="full"
              bg="#56756D"
              color="white"
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              _hover={{ bg: '#3E5B54' }}
              onClick={onSelectPlan ? () => onSelectPlan('monthly') : undefined}
              isLoading={loadingPlan === 'monthly'}
              loadingText="Starting..."
            >
              Start Monthly Plan
            </Button>
          </Box>

          <Box border="2px solid" borderColor="#C9A960" borderRadius="2xl" p={5} bg="#FFFDF7">
            <HStack mb={2}>
              <Icon as={FiTrendingUp} color="#C9A960" />
              <Text fontWeight="700">Basic Annual</Text>
              <Badge colorScheme="green">Best Value</Badge>
            </HStack>
            <Heading size="md" color="#2E2E2E">
              INR 999<span style={{ fontSize: '0.8rem', color: '#6B7280' }}>/year</span>
            </Heading>
            <Text mt={2} fontSize="sm" color="gray.600">
              Everything in Basic, at a lower annual cost to ramp up your practice faster.
            </Text>
            <Button
              as={onSelectPlan ? 'button' : NextLink}
              href={onSelectPlan ? undefined : annualUrl}
              mt={4}
              w="full"
              bg="#C9A960"
              color="#2E2E2E"
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              _hover={{ bg: '#B89343' }}
              onClick={onSelectPlan ? () => onSelectPlan('annual') : undefined}
              isLoading={loadingPlan === 'annual'}
              loadingText="Starting..."
            >
              Start Annual Plan
            </Button>
          </Box>
        </SimpleGrid>

        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Text fontSize="xs" color="gray.500">
            Want advanced automation and premium clinical growth tools?
          </Text>
          <Button as={NextLink} href={premiumUrl} variant="ghost" colorScheme="purple" size="sm">
            Explore Premium Gateway
          </Button>
        </Flex>
      </VStack>
    ),
    [contextLabel, monthlyUrl, annualUrl, premiumUrl, slide, slideIndex, title]
  );

  if (mode === 'inline') {
    return <Box>{Body}</Box>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent borderRadius={{ base: "none", md: "3xl" }} overflow="hidden" m={{ base: 0, md: 4 }} maxH={{ base: "100vh", md: "90vh" }}>
        <ModalCloseButton zIndex={2} top="15px" right="15px" bg="whiteAlpha.300" _hover={{ bg: "whiteAlpha.400" }} borderRadius="full" />
        <ModalBody p={{ base: 4, md: 8 }} overflowY="auto">{Body}</ModalBody>
      </ModalContent>
    </Modal>
  );
}
