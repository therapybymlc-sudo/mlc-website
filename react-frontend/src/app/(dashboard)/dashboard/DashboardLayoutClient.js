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
  Button
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
  FiInbox
} from 'react-icons/fi'
import { useUser, useClerk } from '@clerk/nextjs'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react';
import SidebarContent from './SidebarContent';
import NotificationCenter from '../../../components/NotificationCenter';
import WelcomeOnboarding from '../../../components/WelcomeOnboarding';

export default function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { isAdmin, isTherapist } = useMemo(() => {
    if (!user) return { isAdmin: false, isTherapist: false };
    const roles = user.publicMetadata?.roles || [];
    return {
      isAdmin: roles.includes('admin'),
      isTherapist: roles.includes('therapist') || roles.includes('admin')
    };
  }, [user]);

  const links = useMemo(() => {
    const therapistLinks = [
      { label: 'Overview', icon: FiLayout, href: '/dashboard/therapist' },
      { label: 'Clients', icon: FiUsers, href: '/dashboard/therapist/clients' },
      { label: 'Clinical Blueprints', icon: FiClipboard, href: '/dashboard/therapist/notes' },
      { label: 'My Schedule', icon: FiCalendar, href: '/dashboard/therapist/schedule' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/therapist/booking-requests' },
      { label: 'Availability', icon: FiClock, href: '/dashboard/therapist/availability' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/therapist/profile' },
      { label: 'Resources', icon: FiBookOpen, href: '/dashboard/therapist/resources' },
      { label: 'Care Space', icon: FiHeart, href: '/dashboard/therapist/care' },
      { label: 'Supervision Hub', icon: FiAward, href: '/dashboard/therapist/supervision' },
      { label: 'The Therapist OS', icon: FiTarget, href: '/dashboard/therapist/premium' },
    ];

    const clientLinks = [
      { label: 'Overview', icon: FiLayout, href: '/dashboard/client', isClient: true },
      { label: 'Appointments', icon: FiCalendar, href: '/dashboard/client/appointments' },
      { label: 'Booking requests', icon: FiInbox, href: '/dashboard/client/booking-requests' },
      { label: 'My Goals', icon: FiCheckCircle, href: '/dashboard/client/goals' },
      { label: 'Journal', icon: FiFileText, href: '/dashboard/client/journal' },
      { label: 'My Profile', icon: FiUser, href: '/dashboard/client/profile' },
      { label: 'The Lux Studio', icon: FiTarget, href: '/dashboard/client/premium' },
      { label: 'Care Tools', icon: FiBookOpen, href: '/dashboard/client/resources' },
      { label: 'Safety Plan', icon: FiHeart, href: '/dashboard/client/safety' },
    ];

    if (isAdmin) {
      return [
        { label: 'ADMINISTRATION', type: 'header' },
        { label: 'Site Editors', icon: FiFileText, href: '/admin' },
        { label: 'Applications', icon: FiUsers, href: '/admin' },
        { label: 'Inquiries', icon: FiHeart, href: '/admin' },
        
        { label: 'PRACTITIONER', type: 'header' },
        ...therapistLinks,
        
        { label: 'CLIENT VIEW', type: 'header' },
        ...clientLinks
      ];
    }

    return isTherapist ? therapistLinks : clientLinks;
  }, [isTherapist, isAdmin]);

  if (!mounted || !isLoaded) {
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
          <HStack spacing={3} as={NextLink} href="/">
             <Box bg="#56756C" p={2} borderRadius="lg">
                <Icon as={FiHome} color="white" boxSize={4} />
             </Box>
             <Text fontWeight="700" color="#2E2E2E" fontSize="md">MLC Portal</Text>
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
          {children}
        </Box>
      </Box>

      {/* Dashboard Walkthrough */}
      <WelcomeOnboarding links={links} />

      {/* Mobile Sidebar Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" p={4}>
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="800">MLC Portal</Text>
              <IconButton icon={<CloseIcon />} variant="ghost" onClick={onClose} size="sm" />
            </HStack>
          </DrawerHeader>
          <DrawerBody px={2}>
            <SidebarContent links={links} pathname={pathname} signOut={signOut} onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
