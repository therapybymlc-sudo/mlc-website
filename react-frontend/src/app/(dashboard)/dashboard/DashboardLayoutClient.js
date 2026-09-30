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
    whoami,
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

  const hasPractitionerIdentity =
    isTherapist || !!therapistProfile || !!whoami?.has_therapist_profile;

  const isTherapistPendingVerification =
    onTherapistDashboardRoute &&
    hasPractitionerIdentity &&
    !isAdmin &&
    therapistProfile &&
    therapistProfile.is_verified === false;

  // 🚨 Strict Dashboard Route Isolation
  useEffect(() => {
    if (!mounted || !isLoaded || !authReady) return;

    // 1. Client user attempting to access Practitioner workspace
    if (onTherapistDashboardRoute && isClient && !hasPractitionerIdentity && !isAdmin) {
      toast.closeAll();
      signOut().then(() => {
        router.replace("/login/client?mismatch=client");
      });
      return;
    }

    // 2. Therapist user attempting to access Client workspace
    if (onClientDashboardRoute && hasPractitionerIdentity && !isClient && !isAdmin) {
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
    hasPractitionerIdentity,
    isAdmin,
    router,
    toast,
    signOut,
  ]);

  useEffect(() => {
    if (roleDashboardMismatch) {
      if ((hasPractitionerIdentity && onTherapistDashboardRoute) || (isClient && onClientDashboardRoute)) {
        clearRoleDashboardMismatch();
      }
    }
  }, [roleDashboardMismatch, hasPractitionerIdentity, onTherapistDashboardRoute, isClient, onClientDashboardRoute, clearRoleDashboardMismatch]);

  const isUnauthorizedMismatch =
    mounted && isLoaded && authReady && (
      (onTherapistDashboardRoute && isClient && !hasPractitionerIdentity && !isAdmin) ||
      (onClientDashboardRoute && hasPractitionerIdentity && !isClient && !isAdmin)
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
      { type: 'header', label: 'Clinical Practice' },
      { label: 'Overview', icon: FiLayout, href: '/dashboard/therapist' },
      { label: 'Appointments', icon: FiCalendar, href: '/dashboard/therapist/appointments' },
      { label: 'Clients', icon: FiUsers, href: '/dashboard/therapist/clients' },
      { label: 'Clinical Blueprints', icon: FiClipboard, href: '/dashboard/therapist/notes' },
      { label: 'My Schedule', icon: FiCalendar, href: '/dashboard/therapist/schedule' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/therapist/booking-requests' },
      { label: 'Availability', icon: FiClock, href: '/dashboard/therapist/availability' },
      { type: 'header', label: 'Community & Tools' },
      { label: 'Care Space', icon: FiHeart, href: '/dashboard/therapist/care' },
      { label: 'Community Hub', icon: FiShare2, href: '/dashboard/therapist/community' },
      hasSupervisorEligibility
        ? { label: 'Supervision Hub', icon: FiAward, href: '/dashboard/therapist/supervision' }
        : { label: 'Supervisee Suite', icon: FiAward, href: '/dashboard/therapist/supervisee' },
      { label: 'Resources', icon: FiBookOpen, href: '/dashboard/therapist/resources' },
      { label: 'The Therapist OS', icon: FiTarget, href: '/dashboard/therapist/premium' },
      { type: 'header', label: 'Management' },
      { label: 'Messages', icon: FiMessageSquare, href: '/dashboard/therapist/messages' },
      { label: 'Earnings', icon: FiTrendingUp, href: '/dashboard/therapist/earnings' },
      { label: 'Subscription', icon: FiTarget, href: '/dashboard/therapist/subscription' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/therapist/profile' },
      { label: 'Need Help?', icon: FiHelpCircle, href: '/dashboard/therapist/support' },
    ];

    const clientLinks = [
      { type: 'header', label: 'Sessions & Care' },
      { label: 'Overview', icon: FiLayout, href: '/dashboard/client', isClient: true },
      { label: 'Appointments', icon: FiCalendar, href: '/dashboard/client/appointments' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/client/booking-requests' },
      { label: 'Messages', icon: FiMessageSquare, href: '/dashboard/client/messages' },
      { type: 'header', label: 'Growth & Tools' },
      { label: 'My Goals', icon: FiCheckCircle, href: '/dashboard/client/goals' },
      { label: 'Journal', icon: FiFileText, href: '/dashboard/client/journal' },
      { label: 'The Lux Studio', icon: FiTarget, href: '/dashboard/client/premium' },
      { label: 'Care Tools', icon: FiBookOpen, href: '/dashboard/client/resources' },
      { label: 'Safety Plan', icon: FiHeart, href: '/dashboard/client/safety' },
      { type: 'header', label: 'Account' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/client/profile' },
      { label: 'Need Help?', icon: FiHelpCircle, href: '/dashboard/client/support' },
    ];

    if (onClientDashboardRoute) {
      return clientLinks;
    }

    if (isTherapistPendingVerification) {
      return [
        { type: 'header', label: 'Clinical Practice' },
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
        <Center h="100vh" bg="#FAF8F5">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#56756C" size="xl" />
        </Center>
    );
  }

  // Derive human-readable page name for breadcrumb
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  const lastSegment = pathParts[pathParts.length - 1];
  const pageTitle = (!lastSegment || lastSegment === 'client' || lastSegment === 'therapist')
    ? 'Overview' 
    : lastSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Flex minH="100vh" bg="#FAF8F5">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', lg: 'block' }}
        w="235px"
        flexShrink={0}
        h="100vh"
        bg="white"
        borderRight="1px solid"
        borderColor="rgba(86, 117, 109, 0.12)"
        position="sticky"
        top="0"
        overflowY="auto"
        zIndex="30"
        sx={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <SidebarContent links={links} pathname={pathname} signOut={signOut} />
      </Box>

      {/* Mobile Nav and Main Content */}
      <Box flex="1" overflowX="hidden" minW="0">
        {/* Modern Dribbble-inspired Frosted Top Header Bar */}
        <Flex 
          h="64px" 
          px={{ base: 4, lg: 8 }} 
          align="center" 
          justify="space-between" 
          bg="rgba(250, 248, 245, 0.85)" 
          backdropFilter="blur(12px)"
          borderBottom="1px solid"
          borderColor="rgba(86, 117, 109, 0.12)"
          position="sticky"
          top="0"
          zIndex="20"
          display={{ base: 'none', lg: 'flex' }}
        >
          {/* Breadcrumb / Workspace indicator */}
          <HStack spacing={3}>
            <Box 
              w="8px" 
              h="8px" 
              borderRadius="full" 
              bg="#56756D" 
              boxShadow="0 0 0 3px rgba(169, 203, 183, 0.3)" 
            />
            <Text 
              fontFamily="'Inter', var(--font-inter), sans-serif" 
              fontSize="14px" 
              fontWeight="600" 
              color="#263A33"
            >
              {onClientDashboardRoute ? 'Client Portal' : 'Clinical Practice'}
            </Text>
            <Text color="rgba(86, 117, 109, 0.4)" fontSize="xs" fontWeight="bold">/</Text>
            <Text 
              fontFamily="'Inter', var(--font-inter), sans-serif" 
              fontSize="13px" 
              color="#56756D"
              fontWeight="500"
            >
              {pageTitle}
            </Text>
          </HStack>

          {/* Right Action Strip */}
          <HStack spacing={3.5}>
            {onClientDashboardRoute ? (
              <Button
                as={NextLink}
                href="/dashboard/client/appointments"
                size="sm"
                height="38px"
                borderRadius="full"
                bg="#56756D"
                color="white"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
                _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.1)"
              >
                Book Session
              </Button>
            ) : (
              <Button
                as={NextLink}
                href="/dashboard/therapist/schedule"
                size="sm"
                height="38px"
                borderRadius="full"
                bg="#56756D"
                color="white"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
                _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.1)"
              >
                My Schedule
              </Button>
            )}

            <Button 
              size="sm" 
              height="38px"
              variant="outline" 
              leftIcon={<Icon as={FiTarget} boxSize="13px" />} 
              onClick={() => window.dispatchEvent(new CustomEvent('mlc-start-tour'))}
              color="#56756D"
              borderColor="rgba(86, 117, 109, 0.25)"
              bg="rgba(169, 203, 183, 0.1)"
              fontWeight="600"
              fontSize="12px"
              letterSpacing="0.05em"
              borderRadius="full"
              _hover={{ bg: 'rgba(86, 117, 109, 0.15)', color: '#263A33', borderColor: '#56756D' }}
              transition="all 0.2s"
            >
              TOUR
            </Button>

            <NotificationCenter isAuthenticated={!!user} authLoading={!isLoaded} />
          </HStack>
        </Flex>

        {/* Mobile Top Header */}
        <Flex
          display={{ base: 'flex', lg: 'none' }}
          align="center"
          justify="space-between"
          p={3.5}
          bg="rgba(250, 248, 245, 0.95)"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor="rgba(86, 117, 109, 0.15)"
          position="sticky"
          top="0"
          zIndex="20"
        >
          <HStack spacing={2.5} as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
             <Box 
               w="34px" 
               h="34px" 
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
                 fontFamily="'Inter', var(--font-inter), sans-serif" 
                 fontSize="11.5px" 
                 color="#56756D" 
                 lineHeight="1.2"
                 fontWeight="500"
               >
                 {onClientDashboardRoute ? 'Client Portal' : 'Clinical Practice'}
               </Text>
             </VStack>
          </HStack>
          <HStack spacing={2}>
            <NotificationCenter isAuthenticated={!!user} authLoading={!isLoaded} />
            <IconButton
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
              aria-label="Open sidebar"
              size="sm"
              borderRadius="full"
              color="#263A33"
            />
          </HStack>
        </Flex>

        {/* Dash Page Content */}
        <Box p={{ base: 4, md: 8, lg: 10 }} key={pathname}>
          {roleDashboardMismatch && !(hasPractitionerIdentity && onTherapistDashboardRoute) && !(isClient && onClientDashboardRoute) ? (
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
        <DrawerContent maxW="260px">
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
