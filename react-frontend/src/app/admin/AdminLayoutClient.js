'use client';

import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Icon,
  Text,
  Button,
  Image,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { 
  FiLayout, 
  FiMail, 
  FiInbox, 
  FiHelpCircle, 
  FiUserCheck, 
  FiTrendingUp, 
  FiZap, 
  FiClipboard, 
  FiHome, 
  FiBriefcase, 
  FiUsers, 
  FiLayers, 
  FiFileText, 
  FiCompass, 
  FiVideo,
  FiExternalLink,
  FiCalendar,
} from 'react-icons/fi';
import { useUser, useClerk } from '@clerk/nextjs';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import AdminSidebarContent from './AdminSidebarContent';
import NotificationCenter from '../../components/NotificationCenter';
import FeedbackWidget from '../../components/FeedbackWidget';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { type: 'header', label: 'Operations' },
  { label: 'Overview', icon: FiLayout, href: '/admin', tab: 'overview' },
  { label: 'Bookings & Sessions', icon: FiCalendar, href: '/admin?tab=bookings', tab: 'bookings' },
  { label: 'Contact Inquiries', icon: FiMail, href: '/admin?tab=messages', tab: 'messages' },
  { label: 'Support Tickets', icon: FiHelpCircle, href: '/admin?tab=support_tickets', tab: 'support_tickets' },
  { label: 'Therapist Directory', icon: FiUsers, href: '/admin?tab=vetting', tab: 'vetting' },

  { type: 'header', label: 'Intelligence & Quality' },
  { label: 'Business Reports', icon: FiTrendingUp, href: '/admin?tab=reports', tab: 'reports' },
  { label: 'Improvement Architect', icon: FiZap, href: '/admin/feedback', isRoute: true, badge: 'NEW' },
  { label: 'Assessment QA', icon: FiClipboard, href: '/admin/assessments', isRoute: true },

  { type: 'header', label: 'Website CMS' },
  { label: 'Home Page', icon: FiHome, href: '/admin?tab=home', tab: 'home' },
  { label: 'Services Cards', icon: FiBriefcase, href: '/admin?tab=services_list', tab: 'services_list' },
  { label: 'Team Members', icon: FiUsers, href: '/admin?tab=team', tab: 'team' },
  { label: 'Other Pages', icon: FiLayers, href: '/admin?tab=other_pages', tab: 'other_pages' },
  { label: 'Blog CMS', icon: FiFileText, href: '/admin/blog', isRoute: true },
  { label: 'Therapist Matching', icon: FiCompass, href: '/admin/therapist-matching', isRoute: true },

  { type: 'header', label: 'System' },
  { label: 'Video Test Lab', icon: FiVideo, href: '/admin?tab=video_test', tab: 'video_test' },
];

function AdminLayoutShell({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isTherapist } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname() || '/admin';
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const pageTitle = useMemo(() => {
    const clean = pathname.replace(/\/+$/, '') || '/admin';
    if (clean === '/admin') {
      const activeLink = adminLinks.find(l => l.tab === currentTab);
      return activeLink ? activeLink.label : 'Overview';
    }
    if (clean.startsWith('/admin/feedback')) return 'Improvement Architect';
    if (clean.startsWith('/admin/blog')) return 'Blog CMS';
    if (clean.startsWith('/admin/assessments')) return 'Assessment QA';
    if (clean.startsWith('/admin/therapist-matching')) return 'Therapist Matching';
    return 'Console';
  }, [pathname, currentTab]);

  return (
    <Flex minH="100vh" bg="#FAF8F5" fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* Desktop Sidebar (Rule 7: w="235px", flexShrink={0}) */}
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
        <AdminSidebarContent 
          links={adminLinks} 
          pathname={pathname} 
          currentTab={currentTab}
          signOut={signOut} 
        />
      </Box>

      {/* Main Column */}
      <Box flex="1" overflowX="hidden" minW="0">
        {/* Desktop Sticky Header */}
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
              MLC Admin
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
          <HStack spacing={3}>
            <Button
              as="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              height="34px"
              variant="outline"
              borderRadius="full"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#56756D"
              fontSize="12.5px"
              fontWeight="600"
              px={3.5}
              leftIcon={<Icon as={FiExternalLink} boxSize="13px" />}
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33", borderColor: "#56756D" }}
            >
              Live Site
            </Button>

            {isTherapist && (
              <Button
                as={NextLink}
                href="/dashboard/therapist"
                size="sm"
                height="34px"
                variant="outline"
                borderRadius="full"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                fontSize="12.5px"
                fontWeight="600"
                px={3.5}
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
              >
                Therapist View
              </Button>
            )}

            <NotificationCenter isAuthenticated={!!user} authLoading={!isLoaded} />
          </HStack>
        </Flex>

        {/* Mobile Top Header Bar */}
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
          <HStack spacing={2.5} as={NextLink} href="/admin" _hover={{ textDecoration: 'none' }}>
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
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                fontWeight="600" 
                color="#263A33" 
                fontSize="14.5px" 
                lineHeight="1.2"
              >
                MLC Admin
              </Text>
              <Text 
                fontFamily="'Inter', var(--font-inter), sans-serif" 
                fontSize="11.5px" 
                color="#56756D" 
                lineHeight="1.2"
                fontWeight="500"
              >
                {pageTitle}
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

        {/* Dashboard Page Content (Rule 8: p={{ base: 4, md: 8, lg: 10 }}) */}
        <Box p={{ base: 4, md: 8, lg: 10 }}>
          {children}
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer (Rule 7: maxW="260px") */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="260px">
          <DrawerHeader borderBottomWidth="1px" p={4} borderColor="rgba(86, 117, 109, 0.12)">
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
                <Text fontFamily="'Outfit', var(--font-outfit), sans-serif" fontSize="15px" fontWeight="600" color="#263A33">
                  MLC Admin
                </Text>
              </HStack>
              <IconButton icon={<CloseIcon />} variant="ghost" onClick={onClose} size="sm" />
            </HStack>
          </DrawerHeader>
          <DrawerBody px={2}>
            <AdminSidebarContent 
              links={adminLinks} 
              pathname={pathname} 
              currentTab={currentTab}
              signOut={signOut} 
              onClose={onClose} 
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Floating Feedback Widget */}
      <FeedbackWidget variant="floating" />
    </Flex>
  );
}

export default function AdminLayoutClient({ children }) {
  return (
    <Suspense fallback={
      <Flex minH="100vh" bg="#FAF8F5" align="center" justify="center">
        <Text fontSize="13px" color="#56756D" fontFamily="'Inter', sans-serif">Loading Admin Console...</Text>
      </Flex>
    }>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </Suspense>
  );
}
