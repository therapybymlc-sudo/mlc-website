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
        'Don\'t worry about spelling or grammar, this is for you only.',
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
      { title: 'Benefits', items: ['Secure Clinical Messaging', 'Privacy protection (no personal numbers)', 'Professional boundary management'] },
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
      'No need to exchange personal numbers: just a safe, professional space to stay connected between sessions.',
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
      'But we don’t just care for your clients, we care for you. Our built-in wellbeing tracking helps you maintain a healthy work-life balance, preventing burnout before it begins.',
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
      'We handle the logistics (scheduling, resources, and secure video) so you can focus entirely on your growth and wellbeing.',
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
                
                <Box position="absolute" bottom={12} left={12} maxW="400px">
                  <VStack align="start" spacing={3}>
                    <Badge 
                      bg="whiteAlpha.900" 
                      color="#263A33" 
                      px={3.5} 
                      py={1} 
                      borderRadius="full"
                      fontSize="10.5px"
                      fontWeight="600"
                      letterSpacing="0.08em"
                      boxShadow="sm"
                    >
                      PREMIUM CARE SYSTEM
                    </Badge>
                    <Heading 
                      color="white" 
                      fontSize={{ lg: "30px", xl: "34px" }} 
                      fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif" 
                      fontWeight="600"
                      lineHeight="1.2"
                      textShadow="0 2px 10px rgba(0,0,0,0.15)"
                    >
                      A Sanctuary <br/> for the Mind.
                    </Heading>
                    <Text 
                      color="whiteAlpha.900" 
                      fontSize="13.5px" 
                      fontWeight="400"
                      lineHeight="1.5"
                    >
                      Guided architecture for your therapeutic growth.
                    </Text>
                  </VStack>
                </Box>
              </Box>
            )}

            {/* 📝 Interaction Side */}
            <Box 
              w={{ base: 'full', lg: '560px', xl: '620px' }} 
              bg="white" 
              position="relative" 
              boxShadow="-10px 0 35px rgba(0,0,0,0.04)"
              zIndex={1}
            >
               <VStack h="100vh" align="stretch" spacing={0}>
                  {/* Header Bar */}
                  <Box px={{ base: 6, md: 10 }} pt={{ base: 6, md: 8 }} pb={4}>
                    <HStack justify="space-between" mb={5}>
                       <HStack spacing={2.5}>
                          <Circle size="6px" bg="#56756D" />
                          <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.15em" color="#56756D" textTransform="uppercase">ORIENTATION SYSTEM</Text>
                       </HStack>
                       <IconButton 
                        icon={<FiX size={16} />} 
                        size="sm"
                        variant="ghost" 
                        borderRadius="full" 
                        onClick={close} 
                        aria-label="Close" 
                        color="gray.500"
                        _hover={{ bg: 'red.50', color: 'red.500' }}
                       />
                    </HStack>

                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentSlide?.key || slideIdx}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                         <VStack align="start" spacing={1.5}>
                            <Heading 
                              fontSize={{ base: "24px", md: "28px" }}
                              fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif" 
                              fontWeight="600"
                              lineHeight="1.2"
                              color="#263A33"
                            >
                              {currentSlide?.title}
                            </Heading>
                            <Text 
                              fontSize="14px" 
                              color="#56756D" 
                              fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif" 
                              fontStyle="italic" 
                              letterSpacing="0.01em"
                            >
                              {currentSlide?.subtitle}
                            </Text>
                         </VStack>
                      </MotionBox>
                    </AnimatePresence>
                  </Box>

                  {/* Content Area */}
                  <Box 
                    flex="1" 
                    overflowY="auto" 
                    px={{ base: 6, md: 10 }} 
                    pb={6}
                    sx={{
                      '&::-webkit-scrollbar': { width: '4px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '4px' },
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <MotionBox
                        key={currentSlide?.key || slideIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <VStack align="start" spacing={5}>
                          <Box>
                             {(currentSlide?.body || []).map((p, idx) => (
                                <Text 
                                  key={idx} 
                                  fontSize="13.5px" 
                                  color="#4A5568" 
                                  lineHeight="1.6" 
                                  mb={2.5}
                                  fontFamily="'Inter', var(--font-inter), sans-serif"
                                >
                                  {p}
                                </Text>
                             ))}
                          </Box>

                          <SimpleGrid columns={1} spacing={3} w="full">
                             {(currentSlide?.sections || []).map((section) => (
                               <Box 
                                key={section.title} 
                                p={4} 
                                borderRadius="xl" 
                                bg="rgba(169,203,183,0.08)" 
                                border="1px solid" 
                                borderColor="rgba(169,203,183,0.2)"
                                transition="all 0.2s ease"
                                _hover={{ borderColor: 'rgba(86,117,109,0.3)', bg: 'rgba(169,203,183,0.12)' }}
                               >
                                  <Text 
                                    fontSize="10.5px" 
                                    fontWeight="700" 
                                    color="#56756D" 
                                    mb={2.5} 
                                    textTransform="uppercase" 
                                    letterSpacing="0.1em"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                  >
                                    {section.title}
                                  </Text>
                                  <VStack align="start" spacing={2}>
                                    {section.items.map((item, i) => (
                                      <HStack key={i} align="center" spacing={2.5}>
                                         <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" flexShrink={0} />
                                         <Text fontSize="13px" color="#2D3748" fontWeight="500" fontFamily="'Inter', var(--font-inter), sans-serif">{item}</Text>
                                      </HStack>
                                    ))}
                                  </VStack>
                               </Box>
                             ))}
                          </SimpleGrid>

                          {currentSlide?.tips?.length > 0 && (
                            <HStack 
                              p={3.5} 
                              bg="#F4F7F5" 
                              border="1px solid"
                              borderColor="rgba(86,117,109,0.15)"
                              borderRadius="xl" 
                              w="full" 
                              spacing={3}
                            >
                               <Icon as={FiInfo} color="#56756D" boxSize="15px" flexShrink={0} />
                               <Text fontSize="12px" color="#4A5568" fontWeight="500" fontFamily="'Inter', var(--font-inter), sans-serif">
                                  {currentSlide.tips[0]}
                               </Text>
                            </HStack>
                          )}
                        </VStack>
                      </MotionBox>
                    </AnimatePresence>
                  </Box>

                  {/* Navigation Bar */}
                  <Box px={{ base: 6, md: 10 }} py={4} bg="white" borderTop="1px solid" borderColor="gray.100">
                     <VStack spacing={3.5}>
                        <Box w="full" h="2px" bg="gray.100" position="relative" borderRadius="full" overflow="hidden">
                           <Box 
                            position="absolute" 
                            h="full" 
                            bg="#56756D" 
                            w={`${progress}%`} 
                            transition="0.4s ease" 
                           />
                        </Box>
                        <HStack justify="space-between" w="full">
                           <HStack spacing={3}>
                              <Button 
                                variant="ghost" 
                                leftIcon={<FiChevronLeft />} 
                                isDisabled={slideIdx === 0}
                                onClick={goPrev}
                                borderRadius="full"
                                px={4}
                                h="38px"
                                fontSize="13px"
                                fontWeight="500"
                                color="gray.600"
                                _hover={{ bg: 'gray.100' }}
                              >
                                Previous
                              </Button>
                           </HStack>
                           
                           <HStack spacing={3}>
                              {currentSlide?.href && (
                                <Button 
                                  variant="outline" 
                                  borderRadius="full" 
                                  px={5}
                                  h="38px"
                                  fontSize="13px"
                                  borderColor="gray.200"
                                  color="#263A33"
                                  _hover={{ bg: 'gray.50' }}
                                  onClick={() => { close(); router.push(currentSlide.href); }}
                                >
                                  Open Page
                                </Button>
                              )}
                              <Button 
                                bg="#56756D" 
                                color="white" 
                                borderRadius="full" 
                                px={6} 
                                h="38px"
                                fontSize="13px"
                                fontWeight="600"
                                _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                                transition="all 0.2s"
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
