'use client'

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Icon,
  useDisclosure,
  Progress,
  Center,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiBookOpen, FiActivity, FiTarget, FiShield } from "react-icons/fi";
import dynamic from 'next/dynamic';

// Use a dynamic import to avoid SSR issues with react-joyride which accesses 'window'
const Joyride = dynamic(() => import('react-joyride').then(mod => mod.Joyride), { ssr: false });

// Import constants for events/status if needed, but we can also use strings to be safe against SSR
const EVENTS = {
  TOUR_END: 'tour:end',
  TARGET_NOT_FOUND: 'error:target_not_found'
};
const STATUS = {
  SKIPPED: 'skipped',
  FINISHED: 'finished'
};

const MotionBox = motion(Box);

const AESTHETIC_STEPS = [
  {
    id: 'welcome',
    title: "Welcome to MLC",
    description: "Welcome to your private healing space. We've designed this environment to support your journey with beauty, privacy, and clinical insight.",
    icon: FiActivity,
    color: "#56756D",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2672&auto=format&fit=crop",
    path: '/dashboard/client',
  },
  {
    id: 'journal',
    title: "The Living Manuscript",
    description: "Your Journal isn't just a list—it's a story. Use our unique 'Book View' to see your reflections transformed into a digital manuscript of your growth.",
    icon: FiBookOpen,
    color: "#C9A960",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2574&auto=format&fit=crop",
    path: '/dashboard/client/journal',
  },
  {
    id: 'goals',
    title: "Guided Milestones",
    description: "Set and track goals with your therapist. Every step forward is captured, visualized, and celebrated as you build resilience.",
    icon: FiTarget,
    color: "#84A59D",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
    path: '/dashboard/client/goals',
  },
  {
    id: 'safety',
    title: "Safety & Sovereignty",
    description: "Your safety plan is always a click away. We prioritize your well-being with tools that ensure you're supported even between sessions.",
    icon: FiShield,
    color: "#4A4E69",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2670&auto=format&fit=crop",
    path: '/dashboard/client/safety',
  },
];

const PAGE_SPOTLIGHT_TOURS = [
  [
    {
      target: '#tour-welcome-heading',
      content: 'Your command center. This header greets you and anchors the whole dashboard.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-mood-card',
      content: 'Tap a mood to log how you are arriving today.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-goals-card',
      content: 'A live preview of your intentions.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-appt-card',
      content: 'Join your clinical sessions directly from this card.',
      placement: 'top',
      skipBeacon: true,
    },
  ],
  [
    {
      target: '#tour-journal-capture',
      content: 'The step-by-step reflection flow.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-journal-history',
      content: 'Your past reflections stacked by date.',
      placement: 'left',
      skipBeacon: true,
    },
    {
      target: '#tour-book-view-btn',
      content: 'Read your journey as a beautiful digital book.',
      placement: 'left',
      skipBeacon: true,
    },
  ],
  [
    {
      target: '#tour-goals-header',
      content: 'Manage your long-arc intentions here.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-goals-stats',
      content: 'Progress scores for each of your tiers.',
      placement: 'top',
      skipBeacon: true,
    },
  ],
  [
    {
      target: '#tour-safety-header',
      content: 'Your private, clinician-vetted safety plan.',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#tour-safety-sections',
      content: 'Proactive coping strategies and supports.',
      placement: 'top',
      skipBeacon: true,
    },
  ],
];

const JOYRIDE_OPTIONS = {
  zIndex: 100000,
  primaryColor: '#56756C',
  overlayColor: 'rgba(15, 23, 42, 0.85)',
  textColor: '#2E2E2E',
  showProgress: true,
  scrollOffset: 120,
  targetWaitTimeout: 10000, // Be more patient
  blockTargetInteraction: true,
};

export default function WelcomeOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentAestheticIdx, setCurrentAestheticIdx] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [runSpotlight, setRunSpotlight] = useState(false);
  const [spotlightKey, setSpotlightKey] = useState(0);
  const [spotlightSteps, setSpotlightSteps] = useState(PAGE_SPOTLIGHT_TOURS[0]);

  const spotlightPhaseRef = useRef(0);

  const finishOnboarding = () => {
    localStorage.setItem('mlc_onboarding_visited', 'true');
    setIsModalVisible(false);
    setRunSpotlight(false);
    onClose();
  };

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mlc_onboarding_visited');
    if (hasSeenOnboarding) return;
    if (!pathname?.startsWith('/dashboard/client')) return;

    const t = window.setTimeout(() => {
      setIsModalVisible(true);
      onOpen();
    }, 2000);
    return () => window.clearTimeout(t);
  }, [pathname, onOpen]);

  useEffect(() => {
    const handleStartTour = () => {
      setCurrentAestheticIdx(0);
      setRunSpotlight(false);
      setSpotlightSteps(PAGE_SPOTLIGHT_TOURS[0]);
      setIsModalVisible(true);
      onOpen();
    };
    window.addEventListener('mlc-start-tour', handleStartTour);
    return () => window.removeEventListener('mlc-start-tour', handleStartTour);
  }, [onOpen]);

  useEffect(() => {
    if (!pendingRoute) return;
    if (pathname !== pendingRoute) return;

    // We reached the target page, wait for it to settle
    const t = window.setTimeout(() => {
      setPendingRoute(null);
      setSpotlightSteps(PAGE_SPOTLIGHT_TOURS[spotlightPhaseRef.current]);
      setSpotlightKey((k) => k + 1);
      setRunSpotlight(true);
    }, 1200);

    return () => window.clearTimeout(t);
  }, [pathname, pendingRoute]);

  const advanceAfterSpotlight = (skipped) => {
    setRunSpotlight(false);
    if (skipped) {
      finishOnboarding();
      return;
    }

    if (currentAestheticIdx < AESTHETIC_STEPS.length - 1) {
      setCurrentAestheticIdx(idx => idx + 1);
      setTimeout(() => {
        setIsModalVisible(true);
        onOpen();
      }, 500);
    } else {
      finishOnboarding();
    }
  };

  const handleJoyrideEvent = (data) => {
    const { type, status } = data;

    if (type === EVENTS.TARGET_NOT_FOUND) {
        // Silently advance if a target isn't available to prevent blocking
        advanceAfterSpotlight(false);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      advanceAfterSpotlight(status === STATUS.SKIPPED);
    }
  };

  const handleModalContinue = () => {
    const route = AESTHETIC_STEPS[currentAestheticIdx].path;
    spotlightPhaseRef.current = currentAestheticIdx;
    
    setIsModalVisible(false);
    onClose();

    if (pathname === route) {
      setTimeout(() => {
        setSpotlightKey(k => k + 1);
        setRunSpotlight(true);
      }, 600); // Give modal time to finish closing
    } else {
      setPendingRoute(route);
      router.push(route);
    }
  };

  const currentAesthetic = AESTHETIC_STEPS[currentAestheticIdx];
  const isLastSlide = currentAestheticIdx === AESTHETIC_STEPS.length - 1;

  if (typeof window === 'undefined') return null;

  return (
    <>
      <Joyride
        key={`joyride-${spotlightKey}`}
        steps={spotlightSteps}
        run={runSpotlight && !isModalVisible}
        continuous
        scrollToFirstStep
        {...JOYRIDE_OPTIONS}
        callback={handleJoyrideEvent}
        styles={{
          options: {
            zIndex: 100000,
            primaryColor: '#56756C',
            overlayColor: 'rgba(15, 23, 42, 0.85)',
          },
          tooltip: {
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          tooltipContainer: { textAlign: 'left' },
          buttonPrimary: {
            borderRadius: '12px',
            padding: '12px 20px',
            backgroundColor: '#56756C',
            fontWeight: 'bold',
          },
          spotlight: {
            borderRadius: '20px',
            border: '2px solid #C9A960',
          },
        }}
      />

      <Modal isOpen={isOpen && isModalVisible} onClose={finishOnboarding} size="full" motionPreset="none">
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(20px)" />
        <ModalContent bg="transparent" shadow="none">
          <ModalBody p={0}>
            <HStack h="100vh" spacing={0} align="stretch" overflow="hidden">
              <Box flex="1" position="relative" display={{ base: 'none', lg: 'block' }}>
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={currentAestheticIdx}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    position="absolute" top="0" left="0" w="full" h="full"
                    bgImage={`url(${currentAesthetic.image})`}
                    bgSize="cover" bgPosition="center"
                  >
                    <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient="linear(to-r, transparent, rgba(0,0,0,0.4))" />
                  </MotionBox>
                </AnimatePresence>
              </Box>

              <Center bg="white" w={{ base: 'full', lg: '500px', xl: '650px' }} p={{ base: 8, md: 20 }}>
                <VStack spacing={12} w="full" maxW="400px" align="start">
                  <Box w="full">
                    <Progress value={((currentAestheticIdx + 1) / AESTHETIC_STEPS.length) * 100} size="xs" colorScheme="teal" borderRadius="full" />
                    <Text mt={4} fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="widest">
                      PHASE {currentAestheticIdx + 1} OF {AESTHETIC_STEPS.length}
                    </Text>
                  </Box>

                  <AnimatePresence mode="wait">
                    <MotionBox
                      key={currentAestheticIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      w="full"
                    >
                      <Icon as={currentAesthetic.icon} boxSize={12} color={currentAesthetic.color} mb={6} />
                      <Heading size="2xl" color="#2E2E2E" fontFamily="'Playfair Display', serif" mb={4}>
                        {currentAesthetic.title}
                      </Heading>
                      <Text fontSize="lg" color="gray.500" lineHeight="tall">
                        {currentAesthetic.description}
                      </Text>
                    </MotionBox>
                  </AnimatePresence>

                  <HStack w="full" justify="space-between" pt={10}>
                    <HStack spacing={2}>
                      {AESTHETIC_STEPS.map((_, i) => (
                        <Box key={i} w={i === currentAestheticIdx ? "30px" : "8px"} h="8px" borderRadius="full" 
                        bg={i === currentAestheticIdx ? currentAesthetic.color : "gray.100"} />
                      ))}
                    </HStack>
                    <Button
                      rightIcon={<FiChevronRight />}
                      bg={currentAesthetic.color} color="white" borderRadius="full" px={10} h={14}
                      onClick={handleModalContinue}
                      _hover={{ transform: 'scale(1.05)' }}
                    >
                      {isLastSlide ? 'Begin Journey' : 'Next Spotlight'}
                    </Button>
                  </HStack>
                </VStack>
              </Center>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
