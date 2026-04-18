'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiCheck, FiBookOpen, FiActivity, FiTarget, FiShield } from "react-icons/fi";
import dynamic from 'next/dynamic';

const Joyride = dynamic(() => import('react-joyride').then(mod => mod.default || mod.Joyride), { ssr: false });

const MotionBox = motion(Box);

const AESTHETIC_STEPS = [
  {
    id: 'welcome',
    title: "Welcome to MLC Health",
    description: "Welcome to your private healing space. We've designed this environment to support your journey with beauty, privacy, and clinical insight.",
    icon: FiActivity,
    color: "#56756D",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2672&auto=format&fit=crop",
    href: "/dashboard/client"
  },
  {
    id: 'journal',
    title: "The Living Manuscript",
    description: "Your Journal isn't just a list—it's a story. Use our unique 'Book View' to see your reflections transformed into a digital manuscript of your growth.",
    icon: FiBookOpen,
    color: "#C9A960",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2574&auto=format&fit=crop",
    href: "/dashboard/client/journal"
  },
  {
    id: 'goals',
    title: "Guided Milestones",
    description: "Set and track goals with your therapist. Every step forward is captured, visualized, and celebrated as you build resilience.",
    icon: FiTarget,
    color: "#84A59D",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
    href: "/dashboard/client/goals"
  },
  {
    id: 'safety',
    title: "Safety & Sovereignty",
    description: "Your safety plan is always a click away. We prioritize your well-being with tools that ensure you're supported even between sessions.",
    icon: FiShield,
    color: "#4A4E69",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2670&auto=format&fit=crop",
    href: "/dashboard/client/safety"
  }
];

const TOUR_STEPS = [
  // Phase 1: Dashboard Overview (After Welcome Slide)
  {
    target: '[data-tour="overview-link"]',
    content: 'This is your Dashboard Sidebar. You can navigate between all your tools here.',
    placement: 'right',
    disableBeacon: true, // Show tooltip immediately to prevent the "stuck" state
  },
  {
    target: '#tour-mood-card',
    content: 'Share how you are feeling today. This helps your therapist attuned to your current state.',
    placement: 'bottom',
  },
  {
    target: '#tour-appt-card',
    content: 'Review and join your upcoming clinical sessions here.',
    placement: 'top',
    is_last_in_phase: true
  },
  // Phase 2: Journal (After Journal Slide)
  {
    target: '#tour-book-view-btn',
    content: 'The Book View transforms your entries into a beautiful digital manuscript.',
    placement: 'left',
    is_last_in_phase: true
  },
  // Phase 3: Goals (After Goals Slide)
  {
    target: '#tour-goals-card',
    content: 'Track the milestones you and your therapist define together.',
    placement: 'bottom',
    is_last_in_phase: true
  },
  // Phase 4: Safety (After Safety Slide)
  {
    target: '#tour-safety-plan',
    content: 'Your Care Space. Access your safety plan and groundedness tools instantly.',
    placement: 'right',
    is_last_in_phase: true
  }
];

export default function WelcomeOnboarding() {
  const router = useRouter();
  const currentPath = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [currentAestheticIdx, setCurrentAestheticIdx] = useState(0);
  const [joyrideIndex, setJoyrideIndex] = useState(0);
  const [runJoyride, setRunJoyride] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mlc_onboarding_visited');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsModalVisible(true);
        onOpen();
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handleStartTour = () => {
        setCurrentAestheticIdx(0);
        setJoyrideIndex(0);
        setRunJoyride(false);
        setIsModalVisible(true);
        onOpen();
    };
    window.addEventListener('mlc-start-tour', handleStartTour);
    return () => window.removeEventListener('mlc-start-tour', handleStartTour);
  }, [onOpen]);

  const handleModalContinue = () => {
    setIsModalVisible(false);
    onClose();

    const targetPath = currentAesthetic.href;
    if (targetPath && currentPath !== targetPath) {
      router.push(targetPath);
      // Wait for navigation and potential data loading before starting Joyride
      setTimeout(() => setRunJoyride(true), 1200);
    } else {
      setTimeout(() => setRunJoyride(true), 200);
    }
  };

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    
    if (type === 'step:after') {
      const currentStep = TOUR_STEPS[index];
      if (currentStep?.is_last_in_phase) {
        setRunJoyride(false);
        setJoyrideIndex(index + 1);

        if (currentAestheticIdx < AESTHETIC_STEPS.length - 1) {
          const nextIdx = currentAestheticIdx + 1;
          setCurrentAestheticIdx(nextIdx);
          
          setTimeout(() => {
            setIsModalVisible(true);
            onOpen();
          }, 500);
        } else {
            localStorage.setItem('mlc_onboarding_visited', 'true');
        }
      }
    }

    if (status === 'finished' || status === 'skipped') {
      setRunJoyride(false);
      localStorage.setItem('mlc_onboarding_visited', 'true');
    }
  };

  const currentAesthetic = AESTHETIC_STEPS[currentAestheticIdx];

  return (
    <>
      <Joyride
        steps={TOUR_STEPS}
        stepIndex={joyrideIndex}
        run={runJoyride}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        disableOverlayClose
        disableScrolling={false}
        disableSafeSelectors={true}
        spotlightClicks={true}
        scrollOffset={100}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#56756D',
            textColor: '#2E2E2E',
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 20000, // Even higher to stay above EVERYTHING
          },
          tooltipContainer: {
            textAlign: 'left',
            borderRadius: '16px',
            padding: '10px'
          },
          buttonNext: {
            borderRadius: '10px',
            padding: '12px 24px',
            fontWeight: 'bold'
          }
        }}
      />

      <Modal isOpen={isOpen && isModalVisible} onClose={onClose} size="full" motionPreset="none">
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
                    <Progress 
                      value={((currentAestheticIdx + 1) / AESTHETIC_STEPS.length) * 100} 
                      size="xs" 
                      bg="gray.50" 
                      colorScheme="teal" 
                      borderRadius="full" 
                    />
                    <Text mt={4} fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="0.2em">
                      MILESTONE {currentAestheticIdx + 1} OF {AESTHETIC_STEPS.length}
                    </Text>
                  </Box>

                  <VStack spacing={6} align="start" w="full">
                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentAestheticIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        w="full"
                      >
                        <Icon as={currentAesthetic.icon} boxSize={12} color={currentAesthetic.color} mb={6} />
                        <Heading 
                          size="2xl" 
                          color="mlc.black" 
                          fontFamily="'Playfair Display', serif" 
                          mb={4}
                          lineHeight="shorter"
                        >
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
                          <Box 
                            key={i} 
                            w={i === currentAestheticIdx ? "30px" : "8px"} 
                            h="8px" 
                            borderRadius="full" 
                            bg={i === currentAestheticIdx ? currentAesthetic.color : "gray.100"}
                            transition="all 0.3s"
                          />
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
                        transition="all 0.2s"
                     >
                       Explore Feature
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
