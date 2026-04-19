'use client'

import React from 'react';
import { Box, Container, Heading, Text, VStack, UnorderedList, ListItem, Divider, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

const MotionBox = motion(Box);

export default function PrivacyPolicy() {
  return (
    <Box bg="#FDFBFA" minH="100vh" pt={32} pb={24}>
      <Container maxW="4xl">
        <Breadcrumb fontSize="xs" color="gray.400" mb={8} textTransform="uppercase" letterSpacing="widest">
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Privacy Policy</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="start" spacing={10}>
          <Box>
            <Heading as="h1" size="2xl" fontFamily="'Playfair Display', serif" color="teal.900" mb={4}>
              Privacy Policy
            </Heading>
            <Text color="gray.500" fontSize="sm">Last Updated: April 19, 2026</Text>
          </Box>

          <Text fontSize="lg" color="gray.700" lineHeight="tall">
            At MLC Health & Wellness Centre, we take your privacy and the confidentiality of your clinical data with the utmost seriousness. This policy outlines how we collect, protect, and handle your information.
          </Text>

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              1. Information We Collect
            </Heading>
            <Text color="gray.700">
              In order to provide high-quality psychological care, we collect the following types of information:
            </Text>
            <UnorderedList spacing={3} pl={6} color="gray.700">
              <ListItem><Text fontWeight="600">Personal Identification:</Text> Name, email address, phone number, and date of birth.</ListItem>
              <ListItem><Text fontWeight="600">Clinical Data:</Text> Intake forms, screening results (e.g., DASS-21), therapeutic goals, and session notes.</ListItem>
              <ListItem><Text fontWeight="600">Logistics:</Text> Preferred session times, location context, and payment information.</ListItem>
            </UnorderedList>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              2. Clinical Confidentiality
            </Heading>
            <Text color="gray.700">
              Your therapeutic relationship is anchored in trust. All clinical notes and session data are stored in a secure, encrypted environment. Access is strictly limited to your primary therapist and, where necessary for clinical supervision, the Clinical Lead.
            </Text>
            <Text color="gray.700">
              Confidentiality is only breached in exceptional circumstances where there is a clear and immediate risk of serious harm to yourself or others, as required by clinical ethics and law.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              3. Data Security
            </Heading>
            <Text color="gray.700">
              We employ industry-standard encryption (AES-256) for all data at rest and TLS for data in transit. We use trusted identity providers like Clerk to ensure your authentication remain secure.
            </Text>
          </VStack>

          <Divider />

          <VStack align="start" spacing={6} w="full">
            <Heading as="h2" size="md" color="teal.800" fontFamily="'Forum', serif" textTransform="uppercase" letterSpacing="1px">
              4. Your Rights
            </Heading>
            <Text color="gray.700">
              You have the right to request a summary of your clinical records, update your personal information, or request the closure of your account at any time.
            </Text>
          </VStack>

          <Box pt={10}>
            <Text fontSize="sm" color="gray.500">
              For any questions regarding your data, please contact our data protection officer at <Text as="span" color="teal.600" fontWeight="600">privacy@mlchealth.in</Text>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
