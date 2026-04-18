'use client'

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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

const Joyride = dynamic(
  () => import('react-joyride').then((mod) => mod.Joyride),
  { ssr: false }
);

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

/** Spotlight tours: each array runs only on its matching route—never mix targets across pages. */
const PAGE_SPOTLIGHT_TOURS = [
  [
    {
      target: '#tour-welcome-heading',
      content: 'Your command center. This header greets you and anchors the whole dashboard—like a home base in a game.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-mood-card',
      content: 'Tap a mood to log how you are arriving. Your therapist can see this and shape the next session around it.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-goals-card',
      content: 'A live preview of your goals. Open “View detailed path” anytime to manage intentions with your therapist.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-appt-card',
      content: 'Your next session lives here—date, time, and when you are ready, join the video room from this card.',
      placement: 'top',
      disableBeacon: true,
    },
  ],
  [
    {
      target: '#tour-journal-capture',
      content: 'New entry flow: mood slider, tags, then the editor. Each step is a “level” that ends with Save.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-journal-history',
      content: 'Past reflections stack here. Scroll to revisit a day; everything stays in one timeline.',
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: '#tour-book-view-btn',
      content: 'Book View is the reward screen—your entries become a readable manuscript. Unlocks after you have at least one entry.',
      placement: 'left',
      disableBeacon: true,
    },
  ],
  [
    {
      target: '#tour-goals-header',
      content: 'Your roadmap title and subtitle—this page is for long-arc intentions, not just tasks.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-goals-new',
      content: 'New Intention opens the form: name it, pick a tier (daily / short / long term), add context, then save.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-goals-stats',
      content: 'These three cards score each tier—percent complete at a glance, like progress bars on a character sheet.',
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '#tour-goals-tabs',
      content: 'Switch tabs to filter all goals or focus on one tier. Check items off as you and your therapist agree they are done.',
      placement: 'bottom',
      disableBeacon: true,
    },
  ],
  [
    {
      target: '#tour-safety-header',
      content: 'Your safety plan is private and clinician-aligned. Fill it when you are relatively calm—it is easier than in crisis.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '#tour-safety-sections',
      content: 'Each section is a step: warning signs, coping, people to call, professionals, environment, and what matters to you.',
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '#tour-safety-save',
      content: 'Save locks in updates. Only you and your primary therapist can view this plan.',
      placement: 'top',
      disableBeacon: true,
    },
  ],
];

export default function WelcomeOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentAestheticIdx, setCurrentAestheticIdx] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const [runSpotlight, setRunSpotlight] = useState(false);
  const [spotlightKey, setSpotlightKey] = useState(0);
  const [spotlightSteps, setSpotlightSteps] = useState(() => PAGE_SPOTLIGHT_TOURS[0]);

  /** Phase index for the tour that just ran (0–3), captured when leaving the modal. */
  const spotlightPhaseRef = useRef(0);

  const finishOnboarding = () => {
    localStorage.setItem('mlc_onboarding_visited', 'true');
    setIsModalVisible(false);
    setPendingRoute(null);
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
    }, 1500);
    return () => window.clearTimeout(t);
  }, [pathname, onOpen]);

  useEffect(() => {
    const handleStartTour = () => {
      setCurrentAestheticIdx(0);
      setPendingRoute(null);
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

    const t = window.setTimeout(() => {
      setPendingRoute(null);
      setSpotlightSteps(PAGE_SPOTLIGHT_TOURS[spotlightPhaseRef.current]);
      setSpotlightKey((k) => k + 1);
      setRunSpotlight(true);
    }, 650);

    return () => window.clearTimeout(t);
  }, [pathname, pendingRoute]);

  const handleModalContinue = () => {
    const phase = currentAestheticIdx;
    const route = AESTHETIC_STEPS[phase].path;

    spotlightPhaseRef.current = phase;
    setSpotlightSteps(PAGE_SPOTLIGHT_TOURS[phase]);
    setIsModalVisible(false);
    onClose();

    if (pathname === route) {
      setSpotlightKey((k) => k + 1);
      setRunSpotlight(true);
      return;
    }

    setPendingRoute(route);
    router.push(route);
  };

  const advanceAfterSpotlight = (phase, skipped) => {
    setRunSpotlight(false);
    setSpotlightKey((k) => k + 1);

    if (skipped) {
      finishOnboarding();
      return;
    }

    if (phase < AESTHETIC_STEPS.length - 1) {
      setCurrentAestheticIdx(phase + 1);
      setIsModalVisible(true);
      onOpen();
      return;
    }

    finishOnboarding();
  };

  const handleSpotlightCallback = (data) => {
    const { status, type } = data;

    if (type === 'error:target_not_found') {
      advanceAfterSpotlight(spotlightPhaseRef.current, false);
      return;
    }

    if (status !== 'finished' && status !== 'skipped') return;

    const skipped = status === 'skipped';
    advanceAfterSpotlight(spotlightPhaseRef.current, skipped);
  };

  const currentAesthetic = AESTHETIC_STEPS[currentAestheticIdx];
  const isLastSlide = currentAestheticIdx === AESTHETIC_STEPS.length - 1;

  return (
    <>
      <Joyride
        key={spotlightKey}
        steps={spotlightSteps}
        run={runSpotlight && !isModalVisible}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        scrollOffset={120}
        spotlightClicks={false}
        disableScrolling={false}
        callback={handleSpotlightCallback}
        floaterProps={{ disableAnimation: true }}
        styles={{
          options: {
            zIndex: 100000,
            primaryColor: '#56756D',
            textColor: '#2E2E2E',
            overlayColor: 'rgba(15, 23, 42, 0.78)',
          },
          tooltip: {
            borderRadius: '16px',
            padding: 16,
          },
          tooltipContainer: { textAlign: 'left' },
          buttonNext: {
            borderRadius: '10px',
            padding: '10px 18px',
            backgroundColor: '#56756D',
            fontWeight: '700',
          },
          buttonBack: { color: '#56756D' },
          buttonSkip: { color: '#718096' },
          spotlight: {
            borderRadius: '14px',
            border: '2px solid #C9A960',
          },
        }}
      />

      <Modal
        isOpen={isOpen && isModalVisible}
        onClose={finishOnboarding}
        size="full"
        motionPreset="none"
        closeOnOverlayClick
        closeOnEsc
      >
        <ModalOverlay bg="transparent" backdropFilter="none" />
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
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    position="absolute"
                    top="0"
                    left="0"
                    w="full"
                    h="full"
                    bgImage={`url(${currentAesthetic.image})`}
                    bgSize="cover"
                    bgPosition="center"
                  >
                    <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient="linear(to-r, transparent, rgba(0,0,0,0.4))" />
                  </MotionBox>
                </AnimatePresence>
              </Box>

              <Center bg="white" w={{ base: 'full', lg: '500px', xl: '650px' }} p={{ base: 8, md: 20 }} position="relative">
                <VStack spacing={12} w="full" maxW="400px" align="start">
                  <Box w="full">
                    <Progress value={((currentAestheticIdx + 1) / AESTHETIC_STEPS.length) * 100} size="xs" bg="gray.50" colorScheme="teal" borderRadius="full" />
                    <Text mt={4} fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="0.2em">
                      MILESTONE {currentAestheticIdx + 1} OF {AESTHETIC_STEPS.length}
                    </Text>
                  </Box>

                  <VStack spacing={6} align="start" w="full">
                    <AnimatePresence mode="wait">
                      <MotionBox key={currentAestheticIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} w="full">
                        <Icon as={currentAesthetic.icon} boxSize={12} color={currentAesthetic.color} mb={6} />
                        <Heading size="2xl" color="mlc.black" fontFamily="'Playfair Display', serif" mb={4} lineHeight="shorter">
                          {currentAesthetic.title}
                        </Heading>
                        <Text fontSize="lg" color="gray.500" lineHeight="tall">
                          {currentAesthetic.description}
                        </Text>
                      </MotionBox>
                    </AnimatePresence>
                  </VStack>

                  <HStack w="full" justify="space-between" pt={10}>
                    <HStack spacing={2}>
                      {AESTHETIC_STEPS.map((_, i) => (
                        <Box key={i} w={i === currentAestheticIdx ? "30px" : "8px"} h="8px" borderRadius="full" bg={i === currentAestheticIdx ? currentAesthetic.color : "gray.100"} transition="all 0.3s" />
                      ))}
                    </HStack>
                    <Button
                      rightIcon={<FiChevronRight />}
                      bg={currentAesthetic.color}
                      color="white"
                      borderRadius="full"
                      px={10}
                      h={14}
                      onClick={handleModalContinue}
                      _hover={{ transform: 'scale(1.05)', bg: 'mlc.black' }}
                    >
                      {isLastSlide ? 'Show me this page' : 'Next — spotlight tour'}
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
