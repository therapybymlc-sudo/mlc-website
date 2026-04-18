'use client'

import React, { useState, useEffect } from 'react';
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
import { FiChevronRight, FiCheck, FiBookOpen, FiActivity, FiTarget, FiShield } from "react-icons/fi";
import dynamic from 'next/dynamic';
// Joyride often requires targeting the specific export in Next.js dynamic imports
const Joyride = dynamic(() => import('react-joyride').then(mod => mod.default || mod.Joyride), { ssr: false });

const STATUS = {
  FINISHED: 'finished',
  SKIPPED: 'skipped',
};

const MotionBox = motion(Box);

const STEPS = [
  {
    title: "Welcome to MLC Health",
    description: "Welcome to your private healing space. We've designed this environment to support your journey with beauty, privacy, and clinical insight.",
    icon: FiActivity,
    color: "#56756D",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2672&auto=format&fit=crop"
  },
  {
    title: "The Living Manuscript",
    description: "Your Journal isn't just a list—it's a story. Use our unique 'Book View' to see your reflections transformed into a digital manuscript of your growth.",
    icon: FiBookOpen,
    color: "#C9A960",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2574&auto=format&fit=crop"
  },
  {
    title: "Guided Milestones",
    description: "Set and track goals with your therapist. Every step forward is captured, visualized, and celebrated as you build resilience.",
    icon: FiTarget,
    color: "#84A59D",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop"
  },
  {
    title: "Safety & Sovereignty",
    description: "Your safety plan is always a click away. We prioritize your well-being with tools that ensure you're supported even between sessions.",
    icon: FiShield,
    color: "#4A4E69",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2670&auto=format&fit=crop"
  }
];

const TOUR_STEPS = [
  {
    target: '#tour-overview',
    content: 'This is your Dashboard Overview. It provides a biological and emotional snapshot of your week.',
    placement: 'right'
  },
  {
    target: '#tour-mood-card',
    content: 'Check in here daily. Sharing how you "arrive" helps your therapist tailor your next session.',
    placement: 'bottom'
  },
  {
    target: '#tour-journal',
    content: 'Your Journal is a sacred space for reflection. Don\'t forget to try the interactive Book View!',
    placement: 'right'
  },
  {
    target: '#tour-goals-card',
    content: 'Track your therapeutic goals and celebrate every milestone in your healing journey.',
    placement: 'bottom'
  },
  {
    target: '#tour-appt-card',
    content: 'Join your video sessions or schedule new ones from this command center.',
    placement: 'top'
  },
  {
    target: '#tour-safety-plan',
    content: 'Access your safety tools and emergency contacts instantly if you ever feel overwhelmed.',
    placement: 'right'
  }
];

export default function WelcomeOnboarding() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mlc_onboarding_visited');
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => onOpen(), 1500);
      return () => clearTimeout(timer);
    }
  }, [onOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('mlc_onboarding_visited', 'true');
      onClose();
      // Start the interactive tour after the modal closes
      setTimeout(() => setRunTour(true), 500);
    }
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  const current = STEPS[currentStep];

  return (
    <>
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#56756D',
            textColor: '#2E2E2E',
            zIndex: 10000,
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

      <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="none">
        <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(20px)" />
        <ModalContent bg="transparent" shadow="none">
          <ModalBody p={0}>
            <HStack h="100vh" spacing={0} align="stretch" overflow="hidden">
              {/* Visual Side */}
              <Box flex="1" position="relative" display={{ base: 'none', lg: 'block' }}>
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={currentStep}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    position="absolute"
                    top="0"
                    left="0"
                    w="full"
                    h="full"
                    bgImage={`url(${current.image})`}
                    bgSize="cover"
                    bgPosition="center"
                  >
                    <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient="linear(to-r, transparent, rgba(0,0,0,0.4))" />
                  </MotionBox>
                </AnimatePresence>
                
                <Box position="absolute" bottom={10} left={10} zIndex={10}>
                   <VStack align="start" spacing={0}>
                      <Text color="whiteAlpha.700" fontSize="xs" fontWeight="bold" letterSpacing="widest">ESTABLISHED 2024</Text>
                      <Heading color="white" size="lg" fontFamily="'Playfair Display', serif">MLC Therapies</Heading>
                   </VStack>
                </Box>
              </Box>

              {/* Content Side */}
              <Center bg="white" w={{ base: 'full', lg: '500px', xl: '650px' }} p={{ base: 8, md: 20 }} position="relative">
                <VStack spacing={12} w="full" maxW="400px" align="start">
                  <Box w="full">
                    <Progress 
                      value={((currentStep + 1) / STEPS.length) * 100} 
                      size="xs" 
                      bg="gray.50" 
                      colorScheme="teal" 
                      borderRadius="full" 
                    />
                    <Text mt={4} fontSize="xs" fontWeight="bold" color="gray.400" letterSpacing="0.2em">
                      STEP {currentStep + 1} OF {STEPS.length}
                    </Text>
                  </Box>

                  <VStack spacing={6} align="start" w="full">
                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        w="full"
                      >
                        <Icon as={current.icon} boxSize={12} color={current.color} mb={6} />
                        <Heading 
                          size="2xl" 
                          color="mlc.black" 
                          fontFamily="'Playfair Display', serif" 
                          mb={4}
                          lineHeight="shorter"
                        >
                          {current.title}
                        </Heading>
                        <Text fontSize="lg" color="gray.500" lineHeight="tall">
                          {current.description}
                        </Text>
                      </MotionBox>
                    </AnimatePresence>
                  </VStack>

                  <HStack w="full" justify="space-between" pt={10}>
                     <HStack spacing={2}>
                        {STEPS.map((_, i) => (
                          <Box 
                            key={i} 
                            w={i === currentStep ? "30px" : "8px"} 
                            h="8px" 
                            borderRadius="full" 
                            bg={i === currentStep ? current.color : "gray.100"}
                            transition="all 0.3s"
                          />
                        ))}
                     </HStack>
                     
                     <Button 
                        rightIcon={currentStep === STEPS.length - 1 ? <FiCheck /> : <FiChevronRight />} 
                        bg={current.color} 
                        color="white" 
                        borderRadius="full" 
                        px={10} 
                        h={14}
                        onClick={handleNext}
                        _hover={{ transform: 'scale(1.05)', bg: 'mlc.black' }}
                        transition="all 0.2s"
                     >
                       {currentStep === STEPS.length - 1 ? "Enter Workspace" : "Continue"}
                     </Button>
                  </HStack>
                </VStack>
                
                {/* Skip Button */}
                <Button 
                  position="absolute" 
                  top={10} 
                  right={10} 
                  variant="ghost" 
                  fontSize="xs" 
                  color="gray.400"
                  onClick={() => {
                     localStorage.setItem('mlc_onboarding_visited', 'true');
                     onClose();
                  }}
                >
                  SKIP TOUR
                </Button>
              </Center>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
