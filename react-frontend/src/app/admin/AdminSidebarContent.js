'use client';

import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  Image,
  Link as ChakraLink,
  Avatar,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';
import NextLink from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useAuth } from '../../context/AuthContext';

const iconThemes = {
  'Overview': { color: '#56756D', bg: 'rgba(86, 117, 109, 0.12)' },
  'Contact Inquiries': { color: '#319795', bg: 'rgba(49, 151, 149, 0.12)' },
  'Booking Leads': { color: '#D69E2E', bg: 'rgba(214, 158, 46, 0.12)' },
  'Support Tickets': { color: '#E53E3E', bg: 'rgba(229, 62, 62, 0.12)' },
  'Therapist Directory': { color: '#2F855A', bg: 'rgba(47, 133, 90, 0.12)' },
  'Business Reports': { color: '#3182CE', bg: 'rgba(49, 130, 206, 0.12)' },
  'Improvement Architect': { color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
  'Assessment QA': { color: '#805AD5', bg: 'rgba(128, 90, 213, 0.12)' },
  'Home Page': { color: '#56756D', bg: 'rgba(86, 117, 109, 0.12)' },
  'Services Cards': { color: '#3182CE', bg: 'rgba(49, 130, 206, 0.12)' },
  'Team Members': { color: '#2F855A', bg: 'rgba(47, 133, 90, 0.12)' },
  'Other Pages': { color: '#718096', bg: 'rgba(113, 128, 150, 0.12)' },
  'Blog CMS': { color: '#C9A960', bg: 'rgba(201, 169, 96, 0.14)' },
  'Therapist Matching': { color: '#9F7AEA', bg: 'rgba(159, 122, 234, 0.12)' },
  'Video Test Lab': { color: '#DD6B20', bg: 'rgba(221, 107, 32, 0.12)' },
};

function isItemActive(link, pathname, currentTab) {
  if (!pathname) return false;
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  
  if (link.isRoute) {
    const cleanTarget = link.href.replace(/\/+$/, '');
    return cleanPath === cleanTarget || cleanPath.startsWith(`${cleanTarget}/`);
  }
  
  // It's a tab link under /admin
  if (cleanPath === '/admin') {
    const targetTab = link.tab || 'overview';
    return (currentTab || 'overview') === targetTab;
  }
  
  return false;
}

export default function AdminSidebarContent({ links, pathname, currentTab, signOut, onClose }) {
  const { user } = useUser();
  const { isTherapist } = useAuth();

  return (
    <VStack 
      align="stretch" 
      justify="space-between" 
      h="full" 
      spacing={0}
      px={3}
      py={3.5}
      fontFamily="'Inter', var(--font-inter), sans-serif"
    >
      {/* Top Header & Links */}
      <Box 
        flex="1" 
        overflowY="auto" 
        sx={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {/* Brand Header (Rule 7: Outfit 600 upright mark, Inter upright subtext) */}
        <HStack 
          spacing={3} 
          mb={4} 
          px={2} 
          py={1}
          as={NextLink} 
          href="/admin"
          cursor="pointer"
          role="group"
          transition="all 0.2s ease"
          _hover={{ textDecoration: 'none' }}
        >
          <Box 
            w="38px" 
            h="38px" 
            borderRadius="12px" 
            bg="white" 
            border="1px solid rgba(86, 117, 109, 0.2)" 
            boxShadow="0 2px 8px -1px rgba(38, 58, 51, 0.08)" 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            p={1.5}
            flexShrink={0}
            transition="all 0.25s ease"
            _groupHover={{ 
              borderColor: "#263A33",
              boxShadow: "0 6px 16px -2px rgba(38, 58, 51, 0.16)",
              transform: "translateY(-1px)"
            }}
          >
            <Image 
              src="/logo_tra.png" 
              alt="MLC Therapy" 
              w="100%" 
              h="100%" 
              objectFit="contain" 
            />
          </Box>
          <VStack align="start" spacing={0}>
            <Text 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600" 
              color="#263A33" 
              fontSize="15px"
              lineHeight="1.2"
              letterSpacing="-0.015em"
              transition="color 0.2s"
              _groupHover={{ color: "#182722" }}
            >
              MLC Admin
            </Text>
            <Text 
              fontFamily="'Inter', var(--font-inter), sans-serif" 
              fontSize="11px" 
              fontWeight="500"
              color="#56756D" 
              lineHeight="1.2"
              mt={0.5}
            >
              Management Console
            </Text>
          </VStack>
        </HStack>

        {/* Links Navigation */}
        <VStack align="stretch" spacing="3px">
          {links.map((link, idx) => {
            if (link.type === 'header') {
              return (
                <Box key={`header-${idx}`} pt={3.5} pb={1} px={2.5}>
                  <Text 
                    fontSize="10px" 
                    fontWeight="700" 
                    color="#56756D" 
                    letterSpacing="0.12em" 
                    textTransform="uppercase"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    opacity={0.85}
                  >
                    {link.label}
                  </Text>
                </Box>
              );
            }

            const isActive = isItemActive(link, pathname, currentTab);
            const theme = iconThemes[link.label] || { color: '#56756D', bg: 'rgba(86, 117, 109, 0.12)' };

            return (
              <ChakraLink
                as={NextLink}
                key={`${link.label}-${idx}`}
                href={link.href}
                _hover={{ textDecoration: 'none' }}
                onClick={onClose}
              >
                <HStack
                  spacing={2.5}
                  px={2.5}
                  py="7px"
                  borderRadius="10px"
                  position="relative"
                  bg={isActive ? 'rgba(86, 117, 109, 0.08)' : 'transparent'}
                  color={isActive ? '#263A33' : '#5A6E65'}
                  fontWeight={isActive ? '600' : '500'}
                  transition="background-color 0.15s ease, color 0.15s ease"
                  _hover={{ 
                    bg: isActive ? 'rgba(86, 117, 109, 0.12)' : 'rgba(86, 117, 109, 0.04)', 
                    color: '#263A33',
                  }}
                >
                  {/* Slender left rail indicator (Rule 7) */}
                  {isActive && (
                    <Box 
                      position="absolute"
                      left="0"
                      top="50%"
                      transform="translateY(-50%)"
                      w="3px"
                      h="16px"
                      borderRadius="full"
                      bg="#56756D"
                    />
                  )}
                  <Box
                    w="28px"
                    h="28px"
                    borderRadius="8px"
                    bg={isActive ? '#56756D' : theme.bg}
                    boxShadow={isActive ? '0 2px 6px rgba(86, 117, 109, 0.22)' : 'none'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    transition="all 0.2s"
                  >
                    <Icon 
                      as={link.icon} 
                      boxSize="14px" 
                      color={isActive ? 'white' : theme.color} 
                    />
                  </Box>
                  <Text 
                    fontSize="13px" 
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    flex="1"
                    noOfLines={1}
                  >
                    {link.label}
                  </Text>
                  {link.badge && (
                    <Badge
                      fontSize="9px"
                      fontWeight="700"
                      borderRadius="full"
                      px={1.5}
                      py={0}
                      bg={link.badge === 'NEW' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(86, 117, 109, 0.12)'}
                      color={link.badge === 'NEW' ? '#D97706' : '#56756D'}
                      letterSpacing="0.05em"
                    >
                      {link.badge}
                    </Badge>
                  )}
                </HStack>
              </ChakraLink>
            );
          })}
        </VStack>
      </Box>

      {/* Bottom Admin User Profile Card & Sign Out */}
      <Box pt={2.5} mt={1} borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.12)">
        <HStack 
          justify="space-between" 
          p={2} 
          borderRadius="xl" 
          bg="rgba(169, 203, 183, 0.08)"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.12)"
        >
          <HStack spacing={2.5} minW="0" flex="1">
            <Box position="relative">
              <Avatar 
                size="sm" 
                name={user?.fullName || "Admin"} 
                src={user?.imageUrl} 
                border="1.5px solid white"
                boxShadow="0 1px 4px rgba(38, 58, 51, 0.1)"
              />
              <Box 
                position="absolute" 
                bottom="0" 
                right="0" 
                w="8px" 
                h="8px" 
                borderRadius="full" 
                bg="#56756D" 
                border="1.5px solid white"
              />
            </Box>
            <VStack align="start" spacing={0} minW="0" flex="1">
              <Text 
                fontSize="12.5px" 
                fontWeight="600" 
                color="#263A33" 
                noOfLines={1}
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                {user?.fullName || user?.firstName || 'Admin'}
              </Text>
              <Badge 
                variant="subtle" 
                bg="rgba(86, 117, 109, 0.12)" 
                color="#56756D" 
                fontSize="9px" 
                fontWeight="700" 
                borderRadius="full"
                px={1.5}
                py={0}
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                Super Admin
              </Badge>
            </VStack>
          </HStack>

          <Tooltip 
            label="Sign Out" 
            placement="top" 
            hasArrow
            arrowSize={6}
            bg="#263A33"
            color="white"
            fontSize="11.5px"
            fontWeight="500"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            letterSpacing="-0.01em"
            px={2.5}
            py={1}
            borderRadius="md"
            boxShadow="0 6px 18px -2px rgba(38, 58, 51, 0.25)"
          >
            <IconButton
              icon={<FiLogOut />}
              variant="ghost"
              size="sm"
              borderRadius="full"
              color="#56756D"
              aria-label="Sign Out"
              onClick={() => signOut && signOut()}
              _hover={{ bg: 'red.50', color: 'red.600' }}
            />
          </Tooltip>
        </HStack>
      </Box>
    </VStack>
  );
}
