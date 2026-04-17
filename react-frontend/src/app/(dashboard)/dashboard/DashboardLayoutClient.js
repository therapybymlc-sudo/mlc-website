'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  VStack,
  Text,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Divider,
  Icon,
  Link as ChakraLink,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { 
  FiLayout, 
  FiUsers, 
  FiCalendar, 
  FiFileText, 
  FiLogOut,
  FiHome,
  FiBookOpen,
  FiHeart,
  FiClock,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi'
import { useUser, useClerk } from '@clerk/nextjs'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationCenter from '../../../components/NotificationCenter';

import { useState, useEffect } from 'react';

// Simplified Sidebar
function SidebarContent({ links, pathname, signOut, onClose }) {
  return (
    <VStack align="stretch" spacing={2} p={4}>
      <HStack spacing={3} mb={8} px={2} as={NextLink} href="/">
        <Box bg="#56756C" p={2} borderRadius="xl">
          <Icon as={FiHome} color="white" />
        </Box>
        <VStack align="start" spacing={0}>
          <Text fontWeight="700" color="#2E2E2E" fontSize="sm">MLC Portal</Text>
          <Text fontSize="xs" color="gray.500">Mental Health Org</Text>
        </VStack>
      </HStack>

      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <ChakraLink
            as={NextLink}
            key={link.label}
            href={link.href}
            _hover={{ textDecoration: 'none' }}
            onClick={onClose}
          >
            <HStack
              spacing={3}
              p={3}
              borderRadius="xl"
              bg={isActive ? 'rgba(86, 117, 109, 0.08)' : 'transparent'}
              color={isActive ? '#56756D' : 'gray.600'}
              fontWeight={isActive ? '700' : '500'}
              transition="all 0.2s"
              _hover={{ bg: 'rgba(86, 117, 109, 0.04)', color: '#56756D' }}
            >
              <Icon as={link.icon} boxSize={5} />
              <Text fontSize="sm">{link.label}</Text>
            </HStack>
          </ChakraLink>
        )
      })}

      <Divider my={4} />
      
      <Button
        variant="ghost"
        color="red.500"
        justifyContent="flex-start"
        leftIcon={<FiLogOut />}
        onClick={() => signOut()}
        borderRadius="xl"
        fontSize="sm"
        _hover={{ bg: 'red.50' }}
      >
        Sign Out
      </Button>
    </VStack>
  );
}

export default function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
        <Center h="100vh">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#56756C" size="xl" />
        </Center>
    );
  }

  const isTherapist = user?.publicMetadata?.roles?.includes('therapist') || user?.publicMetadata?.roles?.includes('admin');

  const links = isTherapist ? [
    { label: 'Overview', icon: FiLayout, href: '/dashboard/therapist' },
    { label: 'Clients', icon: FiUsers, href: '/dashboard/therapist/clients' },
    { label: 'My Schedule', icon: FiCalendar, href: '/dashboard/therapist/schedule' },
    { label: 'Availability', icon: FiClock, href: '/dashboard/therapist/availability' },
    { label: 'My Profile', icon: FiUser, href: '/dashboard/therapist/profile' },
    { label: 'Resources', icon: FiBookOpen, href: '/dashboard/therapist/resources' },
    { label: 'Care Space', icon: FiHeart, href: '/dashboard/therapist/care' },
  ] : [
    { label: 'Overview', icon: FiLayout, href: '/dashboard/client' },
    { label: 'Appointments', icon: FiCalendar, href: '/dashboard/client/appointments' },
    { label: 'My Goals', icon: FiCheckCircle, href: '/dashboard/client/goals' },
    { label: 'Journal', icon: FiFileText, href: '/dashboard/client/journal' },
    { label: 'Care Tools', icon: FiBookOpen, href: '/dashboard/client/resources' },
    { label: 'Safety Plan', icon: FiHeart, href: '/dashboard/client/safety' },
  ];

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
           <HStack spacing={4}>
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
