'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  Link as ChakraLink,
  Divider,
  Button
} from '@chakra-ui/react'
import { FiHome, FiLogOut } from 'react-icons/fi'
import NextLink from 'next/link'

export default function SidebarContent({ links, pathname, signOut, onClose }) {
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

      {links.map((link, idx) => {
        if (link.type === 'header') {
          return (
            <Box key={`header-${idx}`} pt={idx === 0 ? 0 : 4} pb={2} px={3}>
              <Text 
                fontSize="10px" 
                fontWeight="800" 
                color="mlc.gold" 
                letterSpacing="1.5px"
                opacity={0.8}
              >
                {link.label}
              </Text>
            </Box>
          );
        }

        const isActive = pathname === link.href;
        return (
          <ChakraLink
            as={NextLink}
            key={`${link.label}-${idx}`}
            href={link.href}
            _hover={{ textDecoration: 'none' }}
            onClick={onClose}
          >
            <HStack
              id={`tour-${link.label.toLowerCase().replace(/\s+/g, '-')}${link.isClient ? '-client' : ''}`}
              data-tour={link.label === 'Overview' && link.isClient ? "overview-link" : undefined}
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
