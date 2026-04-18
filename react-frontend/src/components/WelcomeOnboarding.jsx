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
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const MotionBox = motion(Box);

function getSlideContent(link) {
  const href = link?.href || '';
  const label = link?.label || 'Page';

  const base = {
    key: href || label,
    title: label,
    subtitle: 'What this page is for',
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
      subtitle: 'Your home base',
      body: [
        'Use this page to get oriented in seconds: what’s happening next, what needs attention, and what to do today.',
        'It’s designed to reduce decision fatigue by surfacing the essentials first.',
      ],
      sections: [
        { title: "You’ll find", items: ['Your next steps for the day', 'Quick access to key areas', 'A snapshot of what matters most'] },
        { title: 'Best rhythm', items: ['Open this page first', 'Return here whenever you feel stuck', 'Use it before sessions'] },
      ],
      tips: [
        'Treat Overview as your reset point when you feel scattered.',
        'Open it before sessions to review what you want to bring into the room.',
      ],
    };
  }

  if (href === '/dashboard/client/appointments') {
    return {
      ...base,
      title: 'Appointments',
      subtitle: 'Sessions and scheduling',
      body: [
        'Find upcoming sessions, join links, and session details without hunting through email.',
        'Use this page as your single source of truth for what’s scheduled and what’s next.',
      ],
      sections: [
        { title: "You’ll find", items: ['Upcoming sessions', 'Join links and time details', 'A clear view of what is scheduled'] },
        { title: 'Before a session', items: ['Open this page early', 'Check the session time zone and link', 'Bring one focus for the session'] },
      ],
      tips: [
        'Open this page a few minutes before a session so you’re not rushing.',
        'If something looks incorrect, capture a screenshot and send it to support.',
      ],
    };
  }

  if (href === '/dashboard/client/goals') {
    return {
      ...base,
      title: 'My Goals',
      subtitle: 'Progress you can feel',
      body: [
        'Goals translate therapy into practical, trackable steps so progress stays visible.',
        'This page helps you keep sessions focused and reinforces what you are building toward.',
      ],
      sections: [
        { title: 'How to use', items: ['Keep goals specific', 'Track small steps', 'Mark progress honestly, not perfectly'] },
        { title: 'Good goals feel like', items: ['Clear', 'Measurable', 'Small enough to repeat'] },
      ],
      tips: [
        'Update goals after a session while it’s fresh.',
        'Aim for clarity over ambition: smaller goals move faster.',
      ],
    };
  }

  if (href === '/dashboard/client/journal') {
    return {
      ...base,
      title: 'Journal',
      subtitle: 'A private space to reflect',
      body: [
        'Capture thoughts, patterns, and wins between sessions. This is your space to be honest, not perfect.',
        'Over time, your entries become a record of what is shifting and what is repeating.',
      ],
      sections: [
        { title: 'When to write', items: ['After a strong emotion', 'After a session', 'When you notice a pattern'] },
        { title: 'Use it in therapy', items: ['Bring one entry to discuss', 'Name themes you keep seeing', 'Notice what helped'] },
      ],
      tips: [
        'Write the first sentence only. Momentum usually follows.',
        'When something matters, jot it down right away, even if it is brief.',
      ],
    };
  }

  if (href === '/dashboard/client/resources') {
    return {
      ...base,
      title: 'Care Tools',
      subtitle: 'Skills and materials',
      body: [
        'Use this page for therapist-approved tools, worksheets, and practice materials.',
        'Think of it as your between-sessions practice space: the small reps that change outcomes.',
      ],
      sections: [
        { title: 'How to choose', items: ['Pick one tool for the week', 'Practice consistently', 'Review what worked with your therapist'] },
        { title: 'Best rhythm', items: ['10 minutes a day beats 60 minutes once', 'Repeat the same tool until it becomes automatic'] },
      ],
      tips: [
        'Pick one tool for the week instead of trying everything at once.',
        'Practice when you are steady enough to learn, not only when you feel overwhelmed.',
      ],
    };
  }

  if (href === '/dashboard/client/safety') {
    return {
      ...base,
      title: 'Safety Plan',
      subtitle: 'Support when things feel urgent',
      body: [
        'This page is built for clarity in the moment: steps, resources, and grounding actions you can follow quickly.',
        'It is most useful when it is familiar, so review it once when you are calm.',
      ],
      sections: [
        { title: 'When to open', items: ['When you feel overwhelmed', 'When you feel unsafe', 'When you need a simple next step'] },
        { title: 'In the moment', items: ['Follow the steps one by one', 'Reach out to your supports', 'Use emergency services if needed'] },
      ],
      tips: [
        'If you ever feel unsafe, use local emergency services immediately.',
        'Keep this page easy to reach so you do not have to think when you are stressed.',
      ],
    };
  }

  if (href === '/dashboard/client/premium') {
    return {
      ...base,
      subtitle: 'Deeper structure and support',
      body: [
        'This space contains premium features and deeper tools for momentum between sessions.',
        'Use it when you want more structure, more insight, and a clearer weekly rhythm.',
      ],
      sections: [{ title: 'Best rhythm', items: ['Choose one feature to practice for a week', 'Review results weekly'] }],
      tips: ['Use premium tools as a weekly routine, not a one-time binge.'],
    };
  }

  // Practitioner/Admin areas (fallback copy)
  if (href === '/dashboard/therapist') {
    return {
      ...base,
      title: 'Overview',
      subtitle: 'Clinician home base',
      body: [
        'Start here to orient your day: what needs attention, what is scheduled, and where to focus first.',
      ],
      sections: [
        { title: 'Best rhythm', items: ['Overview', 'Schedule', 'Clients'] },
      ],
      tips: ['Use Overview as your reset point between tasks.'],
    };
  }

  if (href === '/dashboard/therapist/clients') {
    return {
      ...base,
      title: 'Clients',
      subtitle: 'Your caseload and context',
      body: ['Use this page to view your client list and jump into care tools quickly.'],
      sections: [{ title: 'Best rhythm', items: ['Open clients before sessions', 'Use it to prep and follow up'] }],
      tips: ['Keep notes concise and actionable.'],
    };
  }

  if (href === '/dashboard/therapist/schedule') {
    return {
      ...base,
      title: 'My Schedule',
      subtitle: 'Today and this week',
      body: ['Use this page to see your sessions in time order and manage your clinical day.'],
      sections: [
        { title: "You’ll find", items: ['Your calendar view', 'Session details', 'A clear view of time blocks'] },
      ],
      tips: ['Review tomorrow at the end of today to reduce cognitive load.'],
    };
  }

  if (href === '/dashboard/therapist/availability') {
    return {
      ...base,
      title: 'Availability',
      subtitle: 'Time boundaries',
      body: [
        'Set and maintain your availability so scheduling stays aligned with your capacity.',
      ],
      sections: [{ title: 'Best rhythm', items: ['Review weekly', 'Adjust when your capacity changes'] }],
      tips: ['Protect recovery time like an appointment.'],
    };
  }

  if (href === '/dashboard/therapist/profile') {
    return {
      ...base,
      title: 'My Profile',
      subtitle: 'How clients experience you',
      body: ['Update your professional details and the parts of your profile that affect client trust and clarity.'],
      sections: [{ title: 'Best rhythm', items: ['Update quarterly', 'Review after any service change'] }],
      tips: ['Clarity beats volume: write less, say more.'],
    };
  }

  if (href === '/dashboard/therapist/resources') {
    return {
      ...base,
      title: 'Resources',
      subtitle: 'Clinical materials',
      body: ['Access and manage resources you use with clients between sessions.'],
      sections: [{ title: 'Best rhythm', items: ['Curate a small default toolkit', 'Add only what you actually use'] }],
      tips: ['A smaller, sharper library is easier to maintain.'],
    };
  }

  if (href === '/dashboard/therapist/care') {
    return {
      ...base,
      title: 'Care Space',
      subtitle: 'Clinician wellbeing',
      body: ['Use this space to support your own sustainability and reduce burnout.'],
      sections: [{ title: 'Best rhythm', items: ['5 minutes daily', 'A longer weekly review'] }],
      tips: ['Care quality improves when capacity is protected.'],
    };
  }

  if (href === '/dashboard/therapist/premium') {
    return {
      ...base,
      title: label,
      subtitle: 'Advanced workflow',
      body: ['This space contains premium practitioner features designed for speed, clarity, and clinical organization.'],
      sections: [{ title: 'Best rhythm', items: ['Choose one workflow improvement at a time', 'Standardize your week'] }],
      tips: [],
    };
  }

  if (href.startsWith('/dashboard/therapist')) {
    return {
      ...base,
      subtitle: 'Clinical workflow',
      body: [
        'These pages are optimized for practitioner workflow: client context, scheduling, and care delivery.',
      ],
      sections: [{ title: 'Best rhythm', items: ['Overview', 'Schedule', 'Clients'] }],
      tips: ['A simple rhythm: Overview, then Schedule, then Clients.'],
    };
  }

  if (href.startsWith('/admin')) {
    return {
      ...base,
      subtitle: 'Administration',
      body: ['These pages are for site and operations management.'],
      tips: [],
    };
  }

  return {
    ...base,
    body: ['Use this page to complete the tasks described in the sidebar.'],
    tips: [],
  };
}

function buildWalkthroughSlides(links) {
  const cleanedLinks = Array.isArray(links) ? links.filter((l) => l && !l.type && l.href) : [];

  const intro = {
    key: 'intro',
    title: 'Orientation',
    subtitle: 'A clean map of your dashboard',
    body: [
      'This walkthrough explains each page in the sidebar, one by one.',
      'You can restart it any time from the ORIENTATION button.',
    ],
    sections: [
      { title: 'How to use this walkthrough', items: ['Click Next to read', 'Use Open Page to jump directly', 'Close anytime and come back later'] },
    ],
    tips: ['Go page by page. Clarity beats speed.', 'If you feel lost, return to Overview.'],
    href: null,
    icon: null,
  };

  const navigation = {
    key: 'navigation',
    title: 'Navigation',
    subtitle: 'How to move through the portal',
    body: [
      'Use the sidebar as your table of contents. Each label is a distinct area of the dashboard.',
      'The ORIENTATION button reopens this walkthrough whenever you need a reset.',
    ],
    sections: [
      { title: 'Sidebar', items: ['Your primary navigation', 'One page per focus area', 'Return to Overview when unsure'] },
      { title: 'Support', items: ['If something is confusing, capture a screenshot', 'Message support with what you expected vs what happened'] },
    ],
    tips: [],
    href: null,
    icon: null,
  };

  const outro = {
    key: 'outro',
    title: 'You are set',
    subtitle: 'Use the dashboard at your pace',
    body: [
      'You do not need to remember everything today. Start with Overview, then move one page at a time.',
      'If anything feels confusing, use ORIENTATION again or message support with a screenshot.',
    ],
    sections: [{ title: 'Simple first week', items: ['Overview daily', 'Appointments before sessions', 'Journal when something stands out'] }],
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

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('mlc_onboarding_visited');
    let timer = null;
    if (!hasSeenOnboarding) {
      timer = setTimeout(() => {
        setSlideIdx(0);
        setIsOpen(true);
      }, 800);
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
      <ModalOverlay bg="blackAlpha.250" backdropFilter="blur(6px)" />
      <ModalContent bg="white" shadow="xl">
        <ModalBody p={0}>
          <VStack h="100vh" align="stretch" spacing={0}>
            <Box px={{ base: 6, md: 10 }} pt={{ base: 6, md: 10 }} pb={6}>
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.18em">
                    DASHBOARD WALKTHROUGH
                  </Text>
                  <Heading mt={2} size={{ base: 'lg', md: 'xl' }} fontFamily="'Playfair Display', serif" color="#2E2E2E">
                    {currentSlide?.title || 'Orientation'}
                  </Heading>
                  <Text mt={2} color="gray.600" maxW="2xl" fontSize={{ base: 'md', md: 'lg' }}>
                    {currentSlide?.subtitle || ''}
                  </Text>
                </Box>
                <Button variant="ghost" onClick={close} leftIcon={<Icon as={FiX} />} color="gray.500">
                  Close
                </Button>
              </HStack>

              <Progress mt={6} value={progress} size="xs" bg="gray.100" colorScheme="teal" borderRadius="full" />
              <HStack mt={3} justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  Step {Math.min(slideIdx + 1, slides.length)} of {slides.length}
                </Text>
                {currentSlide?.href ? (
                  <Text fontSize="xs" color="gray.500">
                    {currentSlide.href}
                  </Text>
                ) : (
                  <Box />
                )}
              </HStack>
            </Box>

            <Divider />

            <Box flex="1" overflowY="auto" px={{ base: 6, md: 10 }} py={{ base: 8, md: 10 }}>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={currentSlide?.key || slideIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <HStack spacing={4} align="center" mb={8}>
                    {currentSlide?.icon ? (
                      <Center w="44px" h="44px" borderRadius="10px" bg="gray.50" border="1px solid" borderColor="gray.100">
                        <Icon as={currentSlide.icon} boxSize={5} color="#56756D" />
                      </Center>
                    ) : (
                      <Box />
                    )}
                    <Box>
                      <Text fontSize="sm" fontWeight="700" color="gray.500">
                        What to do here
                      </Text>
                      <Text fontSize="lg" fontWeight="700" color="#2E2E2E">
                        {currentSlide?.title}
                      </Text>
                    </Box>
                  </HStack>

                  <VStack align="start" spacing={4} maxW="3xl">
                    {(currentSlide?.body || []).map((p, idx) => (
                      <Text key={idx} color="gray.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="tall">
                        {p}
                      </Text>
                    ))}

                    {(currentSlide?.sections || []).length > 0 ? (
                      <VStack align="start" spacing={4} w="full" pt={2}>
                        {currentSlide.sections.map((section) => (
                          <Box
                            key={section.title}
                            w="full"
                            p={5}
                            borderRadius="12px"
                            bg="white"
                            border="1px solid"
                            borderColor="gray.100"
                          >
                            <Text fontSize="sm" fontWeight="900" color="gray.600" mb={3}>
                              {section.title}
                            </Text>
                            <VStack align="start" spacing={2}>
                              {(section.items || []).map((item) => (
                                <Text key={item} color="gray.700">
                                  {item}
                                </Text>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : null}

                    {(currentSlide?.tips || []).length > 0 ? (
                      <Box w="full" mt={4} p={5} borderRadius="12px" bg="gray.50" border="1px solid" borderColor="gray.100">
                        <Text fontSize="sm" fontWeight="800" color="gray.600" mb={3}>
                          Quick tips
                        </Text>
                        <VStack align="start" spacing={2}>
                          {currentSlide.tips.map((t, idx) => (
                            <Text key={idx} color="gray.700">
                              {t}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    ) : null}
                  </VStack>
                </MotionBox>
              </AnimatePresence>
            </Box>

            <Divider />

            <Box px={{ base: 6, md: 10 }} py={6}>
              <HStack justify="space-between">
                <Button
                  onClick={goPrev}
                  leftIcon={<Icon as={FiChevronLeft} />}
                  isDisabled={slideIdx === 0}
                  variant="outline"
                  borderRadius="10px"
                >
                  Back
                </Button>

                <HStack spacing={3}>
                  {currentSlide?.href ? (
                    <Button
                      variant="outline"
                      borderRadius="10px"
                      onClick={() => {
                        close();
                        if (currentSlide.href && currentPath !== currentSlide.href) {
                          router.push(currentSlide.href);
                        }
                      }}
                    >
                      Open Page
                    </Button>
                  ) : null}

                  {slideIdx < slides.length - 1 ? (
                    <Button
                      onClick={goNext}
                      rightIcon={<Icon as={FiChevronRight} />}
                      bg="#56756D"
                      color="white"
                      borderRadius="10px"
                      _hover={{ bg: '#2E2E2E' }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={close}
                      bg="#56756D"
                      color="white"
                      borderRadius="10px"
                      _hover={{ bg: '#2E2E2E' }}
                    >
                      Done
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
