'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Icon,
  Text,
  Spinner,
  Center,
  Button,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  useToast,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { 
  FiLayout, 
  FiUsers, 
  FiCalendar, 
  FiFileText, 
  FiHome,
  FiBookOpen,
  FiHeart,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiTarget,
  FiAward,
  FiClipboard,
  FiInbox,
  FiMessageSquare,
  FiHelpCircle,
  FiTrendingUp,
  FiShare2,
  FiShield
} from 'react-icons/fi'
import { useUser, useClerk } from '@clerk/nextjs'
import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react';
import SidebarContent from './SidebarContent';
import NotificationCenter from '../../../components/NotificationCenter';
import WelcomeOnboarding from '../../../components/WelcomeOnboarding';
import { useAuth } from '../../../context/AuthContext';
import FeedbackWidget from '../../../components/FeedbackWidget';
import OnboardingModal from './client/OnboardingModal';

export default function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const {
    therapistProfile,
    clientProfile,
    isAdmin,
    isTherapist,
    isClient,
    authReady,
    roleDashboardMismatch,
    clearRoleDashboardMismatch,
  } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const onClientDashboardRoute = pathname?.startsWith('/dashboard/client');
  const onTherapistDashboardRoute = pathname?.startsWith('/dashboard/therapist');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTherapistPendingVerification =
    onTherapistDashboardRoute &&
    !!isTherapist &&
    !isAdmin &&
    therapistProfile &&
    therapistProfile.is_verified === false;

  // 🚨 Strict Dashboard Route Isolation
  useEffect(() => {
    if (!mounted || !isLoaded || !authReady) return;

    // 1. Client user attempting to access Practitioner workspace
    if (onTherapistDashboardRoute && isClient && !isTherapist && !isAdmin) {
      toast.closeAll();
      signOut().then(() => {
        router.replace("/login/client?mismatch=client");
      });
      return;
    }

    // 2. Therapist user attempting to access Client workspace
    if (onClientDashboardRoute && isTherapist && !isClient && !isAdmin) {
      toast.closeAll();
      signOut().then(() => {
        router.replace("/login/therapist?mismatch=therapist");
      });
      return;
    }
  }, [
    mounted,
    isLoaded,
    authReady,
    onTherapistDashboardRoute,
    onClientDashboardRoute,
    isClient,
    isTherapist,
    isAdmin,
    router,
    toast,
    signOut,
  ]);

  const isUnauthorizedMismatch =
    mounted && isLoaded && authReady && (
      (onTherapistDashboardRoute && isClient && !isTherapist && !isAdmin) ||
      (onClientDashboardRoute && isTherapist && !isClient && !isAdmin)
    );

  const isPlaceholderClientIdentity = useMemo(() => {
    const name = String(clientProfile?.name || "").trim().toLowerCase();
    const email = String(clientProfile?.email || "").trim().toLowerCase();
    const placeholderName =
      !name ||
      name.startsWith("user_") ||
      ["new client", "client", "unknown", "unnamed client"].includes(name);
    const placeholderEmail =
      !email ||
      email.endsWith("@local") ||
      email.endsWith("@example.invalid") ||
      !email.includes("@");
    return placeholderName || placeholderEmail;
  }, [clientProfile]);

  const shouldForceClientOnboarding =
    !!clientProfile?.id &&
    !!isClient &&
    !isAdmin &&
    !isTherapistPendingVerification &&
    isPlaceholderClientIdentity;

  const therapistYearsExperience = Number(therapistProfile?.years_experience || 0);
  const hasSupervisorEligibility = isAdmin || therapistYearsExperience >= 5;

  const links = useMemo(() => {
    const therapistLinks = [
      { label: 'Overview', icon: FiLayout, href: '/dashboard/therapist' },
      { label: 'Clients', icon: FiUsers, href: '/dashboard/therapist/clients' },
      { label: 'Clinical Blueprints', icon: FiClipboard, href: '/dashboard/therapist/notes' },
      { label: 'My Schedule', icon: FiCalendar, href: '/dashboard/therapist/schedule' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/therapist/booking-requests' },
      { label: 'Availability', icon: FiClock, href: '/dashboard/therapist/availability' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/therapist/profile' },
      { label: 'Subscription', icon: FiTarget, href: '/dashboard/therapist/subscription' },
      { label: 'Resources', icon: FiBookOpen, href: '/dashboard/therapist/resources' },
      { label: 'Care Space', icon: FiHeart, href: '/dashboard/therapist/care' },
      { label: 'Community Hub', icon: FiShare2, href: '/dashboard/therapist/community' },
      hasSupervisorEligibility
        ? { label: 'Supervision Hub', icon: FiAward, href: '/dashboard/therapist/supervision' }
        : { label: 'Supervisee Suite', icon: FiAward, href: '/dashboard/therapist/supervisee' },
      { label: 'Messages', icon: FiMessageSquare, href: '/dashboard/therapist/messages' },
      { label: 'Earnings', icon: FiTrendingUp, href: '/dashboard/therapist/earnings' },
      { label: 'The Therapist OS', icon: FiTarget, href: '/dashboard/therapist/premium' },
      { label: 'Need Help?', icon: FiHelpCircle, href: '/dashboard/therapist/support' },
    ];

    const clientLinks = [
      { label: 'Overview', icon: FiLayout, href: '/dashboard/client', isClient: true },
      { label: 'Appointments', icon: FiCalendar, href: '/dashboard/client/appointments' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/client/booking-requests' },
      { label: 'Messages', icon: FiMessageSquare, href: '/dashboard/client/messages' },
      { label: 'My Goals', icon: FiCheckCircle, href: '/dashboard/client/goals' },
      { label: 'Journal', icon: FiFileText, href: '/dashboard/client/journal' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/client/profile' },
      { label: 'The Lux Studio', icon: FiTarget, href: '/dashboard/client/premium' },
      { label: 'Care Tools', icon: FiBookOpen, href: '/dashboard/client/resources' },
      { label: 'Safety Plan', icon: FiHeart, href: '/dashboard/client/safety' },
      { label: 'Need Help?', icon: FiHelpCircle, href: '/dashboard/client/support' },
    ];

    if (onClientDashboardRoute) {
      return clientLinks;
    }

    if (isTherapistPendingVerification) {
      return [
        { label: 'Overview', icon: FiLayout, href: '/dashboard/therapist' },
        { label: 'My Profile', icon: FiUser, href: '/dashboard/therapist/profile' },
        { label: 'Subscription', icon: FiTarget, href: '/dashboard/therapist/subscription' },
      ];
    }

    // Standard Therapist Navigation
    // If the account also has admin privileges, provide ONE clear switch option at the top:
    if (isAdmin) {
      return [
        { label: 'Switch to Admin', icon: FiShield, href: '/admin', isSwitchAction: true },
        ...therapistLinks,
      ];
    }

    return therapistLinks;
  }, [
    isTherapist,
    isAdmin,
    isTherapistPendingVerification,
    hasSupervisorEligibility,
    onClientDashboardRoute,
    onTherapistDashboardRoute,
  ]);

  if (!mounted || !isLoaded || !authReady || isUnauthorizedMismatch) {
    return (
        <Center h="100vh">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#56756C" size="xl" />
        </Center>
    );
  }

  return (
    <Flex minH="100vh" bg="#F9FAFB">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        h="100vh"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.100"
        position="sticky"
        top="0"
        overflowY="auto"
      >
        <SidebarContent links={links} pathname={pathname} signOut={signOut} />
      </Box>

      {/* Mobile Nav and Main Content */}
      <Box flex="1" overflowX="hidden">
        {/* Top Header Bar */}
        <Flex 
          h="70px" 
          px={8} 
          align="center" 
          justify="space-between" 
          bg="transparent" 
          display={{ base: 'none', lg: 'flex' }}
        >
           <Box /> 
            <HStack spacing={6}>
              <Button 
                size="sm" 
                variant="outline" 
                leftIcon={<Icon as={FiTarget} />} 
                onClick={() => window.dispatchEvent(new CustomEvent('mlc-start-tour'))}
                color="teal.700"
                borderColor="teal.100"
                bg="teal.50"
                fontWeight="900"
                fontSize="xs"
                letterSpacing="0.1em"
                borderRadius="full"
                _hover={{ bg: 'teal.800', color: 'white', transform: 'scale(1.05)' }}
                transition="all 0.3s"
              >
                ORIENTATION
              </Button>
              <NotificationCenter isAuthenticated={!!user} authLoading={!isLoaded} />
            </HStack>
        </Flex>

        <Flex
          display={{ base: 'flex', lg: 'none' }}
          align="center"
          justify="space-between"
          p={4}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <HStack spacing={3} as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
             <Box 
               w="36px" 
               h="36px" 
               borderRadius="10px" 
               bg="white" 
               border="1px solid rgba(86, 117, 109, 0.2)" 
               p={1}
               display="flex"
               alignItems="center"
               justifyContent="center"
               boxShadow="0 2px 6px rgba(38, 58, 51, 0.06)"
             >
                <Image src="/logo_tra.png" alt="MLC" w="100%" h="100%" objectFit="contain" />
             </Box>
             <VStack align="start" spacing={0}>
               <Text 
                 fontFamily="'Playfair Display', Georgia, serif" 
                 fontWeight="600" 
                 color="#263A33" 
                 fontSize="14.5px"
                 lineHeight="1.2"
               >
                 MLC Portal
               </Text>
               <Text 
                 fontFamily="'Playfair Display', Georgia, serif" 
                 fontStyle="italic" 
                 fontSize="11.5px" 
                 color="#56756D"
                 lineHeight="1.2"
               >
                 Mental Health Org
               </Text>
             </VStack>
          </HStack>
          <IconButton
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
            aria-label="Open sidebar"
          />
        </Flex>

        {/* Dash Page Content */}
        <Box p={{ base: 4, md: 8, lg: 10 }} key={pathname}>
          {roleDashboardMismatch ? (
            <Alert
              status="warning"
              variant="subtle"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="orange.200"
              mb={6}
              flexDirection="column"
              alignItems="stretch"
            >
              <HStack align="flex-start" spacing={3}>
                <AlertIcon boxSize="24px" mt={0.5} />
                <Box flex="1">
                  <AlertTitle fontSize="md" color="gray.800">
                    {roleDashboardMismatch.title}
                  </AlertTitle>
                  <AlertDescription mt={2} color="gray.700" display="block">
                    {roleDashboardMismatch.description}
                  </AlertDescription>
                  <HStack mt={4} flexWrap="wrap" spacing={3}>
                    <Button
                      as={NextLink}
                      href={roleDashboardMismatch.correctHref}
                      colorScheme="teal"
                      size="sm"
                      borderRadius="full"
                      onClick={clearRoleDashboardMismatch}
                    >
                      Open the correct dashboard
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearRoleDashboardMismatch}>
                      Dismiss
                    </Button>
                  </HStack>
                </Box>
              </HStack>
            </Alert>
          ) : null}
          {isTherapistPendingVerification ? (
            <Center minH="calc(100vh - 180px)">
              <Box
                bg="white"
                border="1px solid"
                borderColor="orange.100"
                borderRadius="2xl"
                p={{ base: 6, md: 10 }}
                maxW="760px"
                w="full"
                boxShadow="sm"
              >
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="#2E2E2E">
                    Your therapist profile is under verification
                  </Heading>
                  <Text color="gray.600">
                    Thank you for joining MLC. Our clinical team is reviewing your profile and credentials.
                    Verification typically takes <b>2-3 business days</b>.
                  </Text>
                  <Text color="gray.600">
                    While this review is in progress, dashboard tools remain locked. We will notify you as soon as your profile is approved.
                  </Text>
                  <HStack pt={2}>
                    <Button onClick={() => window.location.reload()} colorScheme="teal" borderRadius="full" size="sm">
                      Refresh Status
                    </Button>
                    <Button onClick={() => signOut()} variant="outline" borderRadius="full" size="sm">
                      Sign Out
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Center>
          ) : (
            children
          )}
        </Box>
      </Box>

      {/* Dashboard Walkthrough */}
      <WelcomeOnboarding links={links} />

      <OnboardingModal
        isOpen={shouldForceClientOnboarding}
        onClose={() => {}}
        profileId={clientProfile?.id}
        currentEmail={clientProfile?.email || user?.primaryEmailAddress?.emailAddress || ""}
      />

      {/* Mobile Sidebar Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" p={4}>
            <HStack justify="space-between">
              <HStack spacing={2.5}>
                <Box 
                  w="32px" 
                  h="32px" 
                  borderRadius="8px" 
                  bg="white" 
                  border="1px solid rgba(86, 117, 109, 0.2)" 
                  p={0.5}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Image src="/logo_tra.png" alt="MLC" w="100%" h="100%" objectFit="contain" />
                </Box>
                <Text fontFamily="'Playfair Display', Georgia, serif" fontSize="15px" fontWeight="600" color="#263A33">
                  MLC Portal
                </Text>
              </HStack>
              <IconButton icon={<CloseIcon />} variant="ghost" onClick={onClose} size="sm" />
            </HStack>
          </DrawerHeader>
          <DrawerBody px={2}>
            <SidebarContent links={links} pathname={pathname} signOut={signOut} onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {/* Floating Feedback Widget */}
      <FeedbackWidget variant="floating" />
    </Flex>
  );
}
