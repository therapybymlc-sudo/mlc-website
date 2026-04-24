'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
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
  // Client pages
  if (href === '/dashboard/client') {
    return {
      ...base,
      title: 'Dashboard Overview',
      subtitle: 'Your home base',
      body: [
        'Welcome to your personal MLC dashboard. We designed this space to make managing your therapy simple and stress-free.',
        'Check this page daily to see your upcoming tasks and any updates from your therapist.'
      ],
      sections: [
        { title: "What's here?", items: ['Your next appointment time', 'Quick links to journals and goals', 'Daily mood check-ins'] },
        { title: 'Best way to use this', items: ['Check it every morning', 'Log how you are feeling', 'See what goals you want to focus on today'] },
      ],
      tips: [
        'Think of this page as your starting point for every session.',
      ],
    };
  }

  if (href === '/dashboard/client/appointments') {
    return {
      ...base,
      title: 'Appointments',
      subtitle: 'Manage your sessions',
      body: [
        'This is where you view your schedule and join your video calls. It keeps all your session links in one organized place.',
      ],
      sections: [
        { title: "Features", items: ['One-click links to join calls', 'A history of your past sessions', 'Upcoming appointment details'] },
        { title: 'Helpful Tips', items: ['Log in 5 minutes before your session', 'Test your camera and mic here', 'Review your last session notes if shared'] },
      ],
      tips: [
        'Need to reschedule? Contact your therapist directly through our support link.',
      ],
    };
  }

  if (href === '/dashboard/client/goals') {
    return {
      ...base,
      title: 'My Goals',
      subtitle: 'Track your progress',
      body: [
        'Use this area to set and track small goals for your healing journey. Growth happens one step at a time.',
      ],
      sections: [
        { title: 'How it works', items: ['Focus on small, achievable steps', 'Be honest with your progress', 'Celebrate your wins, no matter how small'] },
        { title: 'Getting started', items: ['Add your first goal today', 'Update it as you move forward', 'Discuss these goals with your clinician'] },
      ],
      tips: [
        'Keep your goals small! Tiny steps lead to big changes.',
      ],
    };
  }

  if (href === '/dashboard/client/journal') {
    return {
      ...base,
      title: 'Personal Journal',
      subtitle: 'A private space for your thoughts',
      body: [
        'This is your private digital notebook. It is a secure place to write down your thoughts, feelings, and questions.',
      ],
      sections: [
        { title: 'Why use it?', items: ['Track how your mood changes over time', 'Note down things to talk about in session', 'Release stress by writing it down'] },
        { title: 'When to write', items: ['Just after a session', 'When you feel overwhelmed', 'Every morning for clarity'] },
      ],
      tips: [
        'Don\'t worry about spelling or grammar—this is for you only.',
      ],
    };
  }

  if (href === '/dashboard/client/resources') {
    return {
      ...base,
      title: 'Care Tools',
      subtitle: 'Worksheets & Meditations',
      body: [
        'Explore a library of helpful tools, exercises, and audio guides chosen specifically to support your care.',
      ],
      sections: [
        { title: 'How to use tools', items: ['Try one new skill each week', 'Practice when you are calm', 'Use them when you feel stressed'] },
      ],
    };
  }

  if (href === '/dashboard/client/safety') {
    return {
      ...base,
      title: 'Safety Plan',
      subtitle: 'Your support guide',
      body: [
        'A simple roadmap for when things feel difficult. It is designed to be clear and easy to follow when you need help.',
      ],
      sections: [
        { title: 'Key Steps', items: ['Calming techniques', 'Who to call for support', 'Safe places to go'] },
      ],
    };
  }

  if (href === '/dashboard/client/premium') {
    return {
      ...base,
      title: 'Premium Tools',
      subtitle: 'Advanced Support',
      body: [
        'Special deep-dive resources for those looking for extra support and detailed growth tools.',
      ],
    };
  }

  // Therapist pages
  if (href === '/dashboard/therapist') {
    return {
      ...base,
      title: 'Clinical Command Center',
      subtitle: 'Your professional home base',
      body: [
        'Welcome to your MLC workspace. This environment is built to streamline your practice, so you can focus on what matters: your clients.',
        'From here, you can monitor your caseload, manage upcoming sessions, and track your clinical growth.'
      ],
      sections: [
        { title: 'Core View', items: ['Real-time appointment tracking', 'Pending client requests', 'Daily clinical agenda'] },
        { title: 'Growth Path', items: ['Subscription status tracking', 'Supervision eligibility alerts', 'Performance metrics'] },
      ],
      tips: [
        'Use the "Quick Actions" to start a note or update availability in seconds.',
      ],
    };
  }

  if (href === '/dashboard/therapist/clients') {
    return {
      ...base,
      title: 'Client Management',
      subtitle: 'Caseload at a glance',
      body: [
        'A secure, organized list of everyone in your care. Access profiles, history, and active treatment plans instantly.',
      ],
      sections: [
        { title: 'Tools', items: ['Detailed client profiles', 'Session history tracking', 'Direct lounge access links'] },
      ],
    };
  }

  if (href === '/dashboard/therapist/schedule' || href === '/dashboard/therapist/availability') {
    return {
      ...base,
      title: 'Smart Scheduling',
      subtitle: 'Control your time',
      body: [
        'Set your business hours, manage buffers, and let clients book into approved slots seamlessly.',
      ],
      sections: [
        { title: 'Optimization', items: ['Recurring availability', 'Session buffers', 'One-click calendar sync'] },
      ],
    };
  }

  if (href === '/dashboard/therapist/supervision') {
    return {
      ...base,
      title: 'Supervision Suite',
      subtitle: 'Advance your clinical career',
      body: [
        'A dedicated space for senior practitioners to mentor others and manage professional supervision workflows.',
      ],
      sections: [
        { title: 'Supervisor Tools', items: ['Supervisee matchmaking', 'Clinical seniority tracking', 'Mentorship session logs'] },
      ],
      tips: [
        'Apply for Supervisor status once you reach 5 years of experience!',
      ],
    };
  }

  // Fallback
  return {
    ...base,
    subtitle: 'Professional Tool',
    body: ['Explore this area to optimize your clinical workflow.'],
  };
}

function buildWalkthroughSlides(links, role = 'client') {
  const cleanedLinks = Array.isArray(links) ? links.filter((l) => l && !l.type && l.href) : [];
  const isTherapist = role === 'therapist';

  const intro = {
    key: 'intro',
    title: 'Welcome to MLC',
    subtitle: isTherapist ? 'Your clinical command center' : 'Your secure care portal',
    body: [
      isTherapist 
        ? 'This environment is designed to streamline your practice and protect your boundaries.'
        : 'This dashboard is your private space to manage your therapy, track your progress, and access helpful tools.',
      'This quick 2-minute tour will show you where everything is located.'
    ],
    sections: [
      { title: 'Our Goal', items: isTherapist 
          ? ['Clinical efficiency', 'Boundary protection', 'Professional growth']
          : ['Simple to use', 'Safe and secure', 'Designed for your healing'] 
      },
    ],
    tips: ['You can restart this tour anytime from the top menu.'],
    href: null,
    icon: null,
  };

  const navigation = {
    key: 'navigation',
    title: 'Finding Your Way',
    subtitle: 'Easy navigation',
    body: [
      'Use the sidebar to move between different areas of your dashboard.',
    ],
    sections: [
      { title: 'Quick Guide', items: ['The Overview is your home base', 'Tools and resources are always one click away', 'Notifications keep you updated'] },
    ],
    tips: ['On your phone? Use the menu icon at the top to see the sidebar.'],
    href: null,
    icon: null,
  };

  const secureChat = isTherapist ? {
    key: 'secure-chat',
    title: 'Secure Communications',
    subtitle: 'Protect your privacy (Coming Soon)',
    body: [
      'Future-proof your practice: Soon, you will be able to communicate with your clients directly through the MLC portal. No personal phone numbers, just professional boundaries.',
      'We are building a secure space where your personal life stays personal.',
    ],
    sections: [
      { title: 'Benefits', items: ['End-to-end secure messaging', 'Privacy protection (no personal numbers)', 'Professional boundary management'] },
    ],
    tips: ['You can disable or enable chat for specific clients in their profile settings.'],
    href: '/dashboard/therapist/messages',
    icon: null,
  } : {
    key: 'secure-chat-client',
    title: 'Safe Communication',
    subtitle: 'Connecting with care (Coming Soon)',
    body: [
      'Your privacy is our priority. Soon, you will be able to message your therapist directly within this secure portal.',
      'No need to exchange personal numbers—just a safe, professional space to stay connected between sessions.',
    ],
    sections: [
      { title: 'Why it matters', items: ['Direct line to your therapist', 'All conversations are encrypted', 'Keep your personal contact private'] },
    ],
    tips: ['Your therapist will respond during their designated clinical hours.'],
    href: null,
    icon: null,
  };

  const holisticEcosystem = isTherapist ? {
    key: 'holistic-ecosystem',
    title: 'The MLC Ecosystem',
    subtitle: 'Your wellbeing matters',
    body: [
      'MLC is more than a dashboard; it is a complete clinical ecosystem. From the first screening to final billing and ethical follow-through, everything stays here.',
      'But we don’t just care for your clients—we care for you. Our built-in wellbeing tracking helps you maintain a healthy work-life balance, preventing burnout before it begins.',
    ],
    sections: [
      { title: 'Full Cycle', items: ['Screening & Scheduling', 'In-built Video Sessions', 'Billing & Clinical Notes'] },
      { title: 'For You', items: ['Wellbeing Tracking', 'Burnout Prevention Tools', 'Ethical Follow-through'] },
    ],
    tips: ['Work-life balance is at the heart of our design.'],
    href: null,
    icon: null,
  } : {
    key: 'holistic-ecosystem-client',
    title: 'Your Care Sanctuary',
    subtitle: 'A complete healing journey',
    body: [
      'MLC provides a seamless experience for your entire healing process. From your first screening to your final session, everything is held in one safe place.',
      'We handle the logistics—scheduling, resources, and secure video—so you can focus entirely on your growth and wellbeing.',
    ],
    sections: [
      { title: 'One Home', items: ['Easy scheduling & intake', 'High-quality video sessions', 'Accessible care tools'] },
      { title: 'Your Privacy', items: ['Secure clinical records', 'Safe messaging portal', 'Confidential safety plans'] },
    ],
    tips: ['Every tool here is chosen to support your unique journey.'],
    href: null,
    icon: null,
  };

  const outro = {
    key: 'outro',
    title: 'Ready to Begin',
    subtitle: 'Everything is ready for you',
    body: [
      isTherapist 
        ? 'Your workspace is active. We are honored to support your clinical practice.'
        : 'You are all set. You now have everything you need to manage your sessions, goals, and reflections.',
      isTherapist ? 'Let’s start building your impact.' : 'We are honored to support you on your journey.'
    ],
    sections: [{ 
      title: 'First Steps', 
      items: isTherapist 
        ? ['Set your availability', 'Explore your caseload', 'Check your wellbeing dashboard']
        : ['Check your next session time', 'Write your first journal entry', 'Explore your care tools'] 
    }],
    tips: [],
    href: null,
    icon: null,
  };

  const pageSlides = cleanedLinks.map((l) => getSlideContent(l));
  return [intro, navigation, ...pageSlides, secureChat, holisticEcosystem, outro];
}

export default function WelcomeOnboarding({ links = [] }) {
  const router = useRouter();
  const currentPath = usePathname();
  const { user, isLoaded: userLoaded } = useUser();
  
  const role = user?.unsafeMetadata?.mlc_role_preview || 
               (currentPath.includes('/therapist') ? 'therapist' : 'client');

  const slides = useMemo(() => buildWalkthroughSlides(links, role), [links, role]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const hasSeenOnboarding = user?.unsafeMetadata?.mlc_onboarding_visited === true;

  useEffect(() => {
    let timer = null;
    if (userLoaded && user && !hasSeenOnboarding) {
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
  }, [userLoaded, user, hasSeenOnboarding]);

  const close = async () => {
    setIsOpen(false);
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          mlc_onboarding_visited: true,
        },
      });
    } catch (e) {
      console.warn('Could not persist onboarding completion', e);
    }
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
                  src="/human_connection_therapy_1776424085531.png" 
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
