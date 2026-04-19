'use client'

import React from 'react';
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

const MotionBox = motion(Box);

export default function TermsOfService() {
  return (
    <Box bg="#FDFBFA" minH="100vh" pt={32} pb={24}>
      <Container maxW="4xl">
        <Breadcrumb fontSize="xs" color="gray.400" mb={8} textTransform="uppercase" letterSpacing="widest">
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Terms of Service</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="start" spacing={10}>
          <Box>
            <Heading as="h1" size="2xl" fontFamily="'Playfair Display', serif" color="teal.900" mb={4}>
              Terms of Service
            </Heading>
            <Text color="gray.500" fontSize="sm">Last Updated: April 19, 2026</Text>
          </Box>

          <Text fontSize="lg" color="gray.700" lineHeight="tall">
            By accessing or using the MLC Health & Wellness Centre portal, you agree to be bound by these Terms of Service. These terms govern the relationship between you and MLC Health regarding your use of our platform and clinical services.
          </Text>

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              1. The Therapeutic Relationship
            </Heading>
            <Text color="gray.700">
              MLC Health is a clinical collective. While our platform facilitates matching and scheduling, the therapeutic relationship is between you and your assigned therapist. All therapists are vetted clinicians who adhere to international ethical standards.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              2. Cancellation & No-Show Policy
            </Heading>
            <Text color="gray.700">
              To respect the clinician's time and ensure availability for all clients, we require a minimum of 24-hour notice for any session cancellations or rescheduling. Cancellations made within less than 24 hours may incur a full session fee.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              3. Tele-health Requirements
            </Heading>
            <Text color="gray.700">
              Users are responsible for ensuring they have a stable internet connection and a private, quiet space for their sessions. For safety reasons, sessions cannot be conducted while the client is driving or in a public/non-private setting.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              4. Emergency Care
            </Heading>
            <Text color="gray.700">
              MLC Health is an outpatient psychological service and is not equipped to handle acute psychiatric emergencies. If you are in immediate danger or experiencing a crisis, please contact your local emergency services or hospital immediately.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              5. Intellectual Property
            </Heading>
            <Text color="gray.700">
              All therapeutic tools, resources, and content provided through the portal are the intellectual property of MLC Health and are for your personal therapeutic use only.
            </Text>
          </VStack>

          <Box pt={10}>
            <Text fontSize="sm" color="gray.500">
              If you have any questions regarding these terms, please contact <Text as="span" color="teal.600" fontWeight="600">office@mlchealth.in</Text>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
