'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,
  Text,
  VStack,
  Image,
  Badge,
  IconButton,
  Circle,
  useBreakpointValue
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX, FiCheckCircle, FiInfo } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionHStack = motion(HStack);

function getSlideContent(link) {
  const href = link?.href || '';
  const label = link?.label || 'Page';

  const base = {
    key: href || label,
    title: label,
    subtitle: 'Strategic Purpose',
    body: [],
    sections: [],
    tips: [],
    href: href || null,
    icon: link?.icon || null,
  };

  // Client pages
  if (href === '/dashboard/client') {
    return {
      ...base,
      title: 'Overview',
      subtitle: 'Your Clinical Compass',
      body: [
        'Welcome to your home base. This orientation is designed to reduce decision fatigue by surfacing only what matters most right now.',
        'Use this space to ground yourself before sessions and track your immediate priorities.'
      ],
      sections: [
        { title: "Dashboard Insights", items: ['Immediate next steps', 'Quick access to active care tools', 'Session countdowns'] },
        { title: 'The Rhythm', items: ['Start every day here', 'Use it for a 2-minute mindful check-in', 'Return here when feeling overwhelmed'] },
      ],
      tips: [
        'Treat the Overview as a digital ritual to prepare for your therapeutic work.',
      ],
    };
  }

  if (href === '/dashboard/client/appointments') {
    return {
      ...base,
      title: 'Appointments',
      subtitle: 'Synchronized Care',
      body: [
        'A single, secure source of truth for your therapeutic sessions. No more hunting through emails for links.',
      ],
      sections: [
        { title: "Utility", items: ['Direct secure join links', 'Historical session log', 'Upcoming schedule at a glance'] },
        { title: 'Best Practice', items: ['Open the portal 5 minutes early', 'Test your connection here', 'Review the session focus'] },
      ],
      tips: [
        'If a session is missing, check your timezone settings in the profile area.',
      ],
    };
  }

  if (href === '/dashboard/client/goals') {
    return {
      ...base,
      title: 'My Goals',
      subtitle: 'Progressive Intent',
      body: [
        'Goals translate therapeutic insights into tangible momentum. This is where we track the building blocks of your healing.',
      ],
      sections: [
        { title: 'Philosophy', items: ['Progress over perfection', 'Small, iterative wins', 'Radical honesty in tracking'] },
        { title: 'Mechanism', items: ['Define clear markers', 'Update after major breakthroughs', 'Review with your therapist'] },
      ],
      tips: [
        'Smallest possible steps move the fastest. Keep goals microscopic if needed.',
      ],
    };
  }

  if (href === '/dashboard/client/journal') {
    return {
      ...base,
      title: 'Therapeutic Journal',
      subtitle: 'A Private Sanctuary',
      body: [
        'Your digital space for reflection, observation, and pattern-spotting. This is a secure area for your thoughts alone.',
      ],
      sections: [
        { title: 'The Value', items: ['Capture emotions in real-time', 'Spot recurring behavioral patterns', 'Prepare themes for your next session'] },
        { title: 'Frequency', items: ['Post-session reflections', 'Daily morning pages', 'Crisis venting'] },
      ],
      tips: [
        'Don\'t edit for grammar. Let the words fall out exactly as they feel.',
      ],
    };
  }

  if (href === '/dashboard/client/resources') {
    return {
      ...base,
      title: 'Care Tools',
      subtitle: 'Skills for Resilience',
      body: [
        'A curated library of evidence-based tools, worksheets, and meditations tailored to your journey.',
      ],
      sections: [
        { title: 'How to practice', items: ['Pick one skill per week', 'Practice during low-stress times', 'Apply during high-stress moments'] },
      ],
    };
  }

  if (href === '/dashboard/client/safety') {
    return {
      ...base,
      title: 'Safety Plan',
      subtitle: 'Support Infrastructure',
      body: [
        'Your immediate roadmap for when things feel urgent. Designed for clarity when cognitive load is high.',
      ],
      sections: [
        { title: 'Critical Steps', items: ['Grounding techniques', 'Contact chains', 'Safe environments'] },
      ],
    };
  }

  if (href === '/dashboard/client/premium') {
    return {
      ...base,
      title: 'The Lux Studio',
      subtitle: 'Elevated Support',
      body: [
        'Deep-dive tools for those seeking an immersive therapeutic experience with rich structure.',
      ],
    };
  }

  // Fallback
  return {
    ...base,
    subtitle: 'Dashboard Component',
    body: ['Explore this area to manage your care journey.'],
  };
}

function buildWalkthroughSlides(links) {
  const cleanedLinks = Array.isArray(links) ? links.filter((l) => l && !l.type && l.href) : [];

  const intro = {
    key: 'intro',
    title: 'Welcome Home',
    subtitle: 'The MLC Therapeutic Ecosystem',
    body: [
      'Your dashboard is more than a tool—it is a secure digital architecture built to support your mental health and personal growth.',
      'This 2-minute orientation will guide you through the primary touchpoints of your new workspace.'
    ],
    sections: [
      { title: 'The Approach', items: ['Clarity above noise', 'Compassion in design', 'Structure for healing'] },
    ],
    tips: ['You can restart this journey at any time from the top menu.'],
    href: null,
    icon: null,
  };

  const navigation = {
    key: 'navigation',
    title: 'Intuitive Navigation',
    subtitle: 'Effortless Movement',
    body: [
      'The sidebar is your central nervous system. Every link leads to a specific clinical or supportive domain.',
    ],
    sections: [
      { title: 'Sidebar Logic', items: ['Overview is your reset point', 'Support tools are always accessible', 'Notifications keep you updated'] },
    ],
    tips: ['On smaller screens, use the menu icon to toggle your view.'],
    href: null,
    icon: null,
  };

  const outro = {
    key: 'outro',
    title: 'The Path Forward',
    subtitle: 'Everything is in Place',
    body: [
      'Healing is not linear, but your support can be. You are now equipped with the tools to manage your sessions, goals, and reflections.',
      'We are honored to be part of your journey.'
    ],
    sections: [{ title: 'Immediate Step', items: ['Explore the Overview', 'Check your next session time', 'Record your first journal entry'] }],
    tips: [],
    href: null,
    icon: null,
  };

  const pageSlides = cleanedLinks.map((l) => getSlideContent(l));
  return [intro, navigation, ...pageSlides, outro];
}

export default function WelcomeOnboarding({ links = [] }) {
  const router = useRouter();
  const currentPath = usePathname();
  const slides = useMemo(() => buildWalkthroughSlides(links), [links]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mlc_onboarding_visited');
    let timer = null;
    if (!hasSeenOnboarding) {
      timer = setTimeout(() => {
        setSlideIdx(0);
        setIsOpen(true);
      }, 1500);
    }

    const handleStart = () => {
      setSlideIdx(0);
      setIsOpen(true);
    };
    window.addEventListener('mlc-start-tour', handleStart);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mlc-start-tour', handleStart);
    };
  }, []);

  const close = () => {
    setIsOpen(false);
    localStorage.setItem('mlc_onboarding_visited', 'true');
  };

  const goPrev = () => setSlideIdx((i) => Math.max(0, i - 1));
  const goNext = () => setSlideIdx((i) => Math.min(slides.length - 1, i + 1));

  const currentSlide = slides[slideIdx] || slides[0];
  const progress = slides.length > 1 ? (slideIdx / (slides.length - 1)) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={close} size="full" motionPreset="none">
      <ModalOverlay bg="rgba(253, 251, 250, 0.95)" backdropFilter="blur(20px)" />
      <ModalContent bg="transparent" shadow="none" m={0}>
        <ModalBody p={0}>
          <HStack h="100vh" spacing={0} align="stretch" overflow="hidden">
            
            {/* 🎨 Visual Side (Desktop Only) */}
            {isDesktop && (
              <Box flex="1" position="relative" bg="#A9CBB7">
                <Image 
                  src="/therapeutic_dashboard_journey_1776632244950.png" 
                  alt="" 
                  w="full" 
                  h="full" 
                  objectFit="cover"
                  opacity="0.9"
                />
                <Box position="absolute" inset={0} bgGradient="linear(to-r, transparent, rgba(253, 251, 250, 1))" />
                
                <Box position="absolute" bottom={20} left={20} maxW="400px">
                  <VStack align="start" spacing={4}>
                    <Badge bg="whiteAlpha.800" color="teal.900" px={4} py={1} borderRadius="full">PREMIUM CARE SYSTEM</Badge>
                    <Heading color="white" size="2xl" fontFamily="'Playfair Display', serif" textShadow="0 2px 10px rgba(0,0,0,0.1)">
                      A Sanctuary <br/> for the Mind.
                    </Heading>
                    <Text color="whiteAlpha.900" fontSize="lg" fontWeight="500">
                      Guided architecture for your therapeutic growth.
                    </Text>
                  </VStack>
                </Box>
              </Box>
            )}

            {/* 📝 Interaction Side */}
            <Box 
              w={{ base: 'full', lg: '800px' }} 
              bg="white" 
              position="relative" 
              boxShadow="-20px 0 50px rgba(0,0,0,0.05)"
              zIndex={1}
            >
               <VStack h="100vh" align="stretch" spacing={0}>
                  {/* Header Bar */}
                  <Box px={{ base: 8, md: 16 }} pt={{ base: 8, md: 12 }} pb={6}>
                    <HStack justify="space-between" mb={12}>
                       <HStack spacing={3}>
                          <Circle size={2} bg="teal.500" />
                          <Text fontSize="xs" fontWeight="900" letterSpacing="0.2em" color="gray.400">ORIENTATION SYSTEM</Text>
                       </HStack>
                       <IconButton 
                        icon={<FiX />} 
                        variant="ghost" 
                        borderRadius="full" 
                        onClick={close} 
                        aria-label="Close" 
                        _hover={{ bg: 'red.50', color: 'red.500' }}
                       />
                    </HStack>

                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentSlide?.key || slideIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                      >
                         <VStack align="start" spacing={4}>
                            <Heading size="xl" fontFamily="'Playfair Display', serif" color="teal.900">
                              {currentSlide?.title}
                            </Heading>
                            <Text fontSize="lg" color="teal.600" fontFamily="'Forum', serif" letterSpacing="1px">
                              {currentSlide?.subtitle}
                            </Text>
                         </VStack>
                      </MotionBox>
                    </AnimatePresence>
                  </Box>

                  {/* Content Area */}
                  <Box flex="1" overflowY="auto" px={{ base: 8, md: 16 }} pb={10}>
                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentSlide?.key || slideIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <VStack align="start" spacing={8}>
                          <Box>
                             {(currentSlide?.body || []).map((p, idx) => (
                                <Text key={idx} fontSize="lg" color="gray.600" lineHeight="tall" mb={4}>
                                  {p}
                                </Text>
                             ))}
                          </Box>

                          <SimpleGrid columns={1} spacing={4} w="full">
                             {(currentSlide?.sections || []).map((section) => (
                               <Box 
                                key={section.title} 
                                p={8} 
                                borderRadius="2xl" 
                                bg="teal.50" 
                                border="1px solid" 
                                borderColor="teal.100"
                                transition="0.3s"
                                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                               >
                                  <Text fontSize="xs" fontWeight="900" color="teal.700" mb={4} textTransform="uppercase" letterSpacing="1px">
                                    {section.title}
                                  </Text>
                                  <VStack align="start" spacing={3}>
                                    {section.items.map((item, i) => (
                                      <HStack key={i} align="start" spacing={3}>
                                         <Icon as={FiCheckCircle} color="teal.500" mt={1} />
                                         <Text fontSize="md" color="gray.700" fontWeight="500">{item}</Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                               </Box>
                             ))}
                          </SimpleGrid>

                          {currentSlide?.tips?.length > 0 && (
                            <HStack p={6} bg="gray.900" borderRadius="2xl" w="full" spacing={4}>
                               <Icon as={FiInfo} color="gold" w={6} h={6} />
                               <Text fontSize="sm" color="whiteAlpha.900" fontWeight="500">
                                  {currentSlide.tips[0]}
                               </Text>
                            </HStack>
                          )}
                        </VStack>
                      </MotionBox>
                    </AnimatePresence>
                  </Box>

                  {/* Navigation Bar */}
                  <Box px={{ base: 8, md: 16 }} py={10} bg="white" borderTop="1px solid" borderColor="gray.100">
                     <VStack spacing={6}>
                        <Box w="full" h="2px" bg="gray.100" position="relative">
                           <Box 
                            position="absolute" 
                            h="full" 
                            bg="teal.600" 
                            w={`${progress}%`} 
                            transition="0.5s ease" 
                           />
                        </Box>
                        <HStack justify="space-between" w="full">
                           <HStack spacing={4}>
                              <Button 
                                variant="ghost" 
                                leftIcon={<FiChevronLeft />} 
                                isDisabled={slideIdx === 0}
                                onClick={goPrev}
                                borderRadius="full"
                                px={6}
                              >
                                Previous
                              </Button>
                           </HStack>
                           
                           <HStack spacing={4}>
                              {currentSlide?.href && (
                                <Button 
                                  variant="outline" 
                                  borderRadius="full" 
                                  px={8}
                                  onClick={() => { close(); router.push(currentSlide.href); }}
                                >
                                  Open Page
                                </Button>
                              )}
                              <Button 
                                bg="teal.800" 
                                color="white" 
                                borderRadius="full" 
                                px={10} 
                                h={12}
                                _hover={{ bg: 'teal.900', transform: 'translateX(5px)' }}
                                rightIcon={slideIdx < slides.length - 1 ? <FiChevronRight /> : <FiCheckCircle />}
                                onClick={slideIdx < slides.length - 1 ? goNext : close}
                              >
                                {slideIdx === 0 ? "Begin Orientation" : slideIdx < slides.length - 1 ? "Continue" : "Done"}
                              </Button>
                           </HStack>
                        </HStack>
                     </VStack>
                  </Box>
               </VStack>
            </Box>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// Helper SimpleGrid replacement for local scope if needed
const SimpleGrid = ({ children, columns, spacing, ...props }) => (
  <Box 
    display="grid" 
    gridTemplateColumns={{ base: '1fr', md: `repeat(${columns}, 1fr)` }} 
    gap={spacing} 
    {...props}
  >
    {children}
  </Box>
);
