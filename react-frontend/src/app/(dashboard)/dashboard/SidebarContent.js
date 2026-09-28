'use client'

import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  Image,
  Link as ChakraLink,
  Divider,
  Button
} from '@chakra-ui/react'
import { FiLogOut } from 'react-icons/fi'
import NextLink from 'next/link'

export default function SidebarContent({ links, pathname, signOut, onClose }) {
  return (
    <VStack align="stretch" spacing={2} p={4}>
      <HStack 
        spacing={3} 
        mb={6} 
        px={2} 
        py={1}
        as={NextLink} 
        href="/"
        cursor="pointer"
        role="group"
        transition="all 0.2s ease"
        _hover={{ textDecoration: 'none' }}
      >
        <Box 
          w="42px" 
          h="42px" 
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
            fontFamily="'Playfair Display', Georgia, serif"
            fontWeight="600" 
            color="#263A33" 
            fontSize="15.5px"
            lineHeight="1.2"
            letterSpacing="-0.01em"
            transition="color 0.2s"
            _groupHover={{ color: "#182722" }}
          >
            MLC Portal
          </Text>
          <Text 
            fontFamily="'Playfair Display', Georgia, serif"
            fontStyle="italic"
            fontSize="12px" 
            color="#56756D"
            lineHeight="1.2"
          >
            Mental Health Org
          </Text>
        </VStack>
      </HStack>

      {links.map((link, idx) => {
        if (link.isSwitchAction) {
          return (
            <ChakraLink
              as={NextLink}
              key={`${link.label}-${idx}`}
              href={link.href}
              _hover={{ textDecoration: 'none' }}
              onClick={onClose}
              mb={2}
            >
              <HStack
                spacing={3}
                p={2.5}
                borderRadius="xl"
                bg="rgba(38, 58, 51, 0.05)"
                border="1px solid rgba(86, 117, 109, 0.25)"
                color="#263A33"
                fontWeight="600"
                transition="all 0.2s"
                _hover={{ bg: 'rgba(38, 58, 51, 0.1)', borderColor: '#263A33' }}
              >
                <Icon as={link.icon} boxSize={4} color="#56756D" />
                <Text fontSize="12.5px" flex="1" fontFamily="'Inter', sans-serif">
                  {link.label}
                </Text>
                <Text fontSize="10px" color="#56756D" fontWeight="700" letterSpacing="0.5px">
                  SWITCH ➔
                </Text>
              </HStack>
            </ChakraLink>
          );
        }

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
