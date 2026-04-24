'use client'

import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  UnorderedList, 
  ListItem, 
  Divider, 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  HStack,
  Icon
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import NextLink from 'next/link';
import { FiLock, FiEye, FiServer, FiShield, FiCpu, FiUserCheck } from 'react-icons/fi';

const MotionBox = motion(Box);

export default function PrivacyPolicy() {
  return (
    <Box bg="#FDFBFA" minH="100vh" pt={{ base: 20, md: 32 }} pb={24}>
      <Container maxW="5xl">
        <Breadcrumb fontSize="xs" color="gray.400" mb={8} textTransform="uppercase" letterSpacing="widest">
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Privacy Policy</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="start" spacing={10} w="full">
          <Box>
            <HStack spacing={4} mb={4}>
              <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={3}>Clinical Privacy v2.0</Badge>
              <Text color="gray.400" fontSize="xs" fontWeight="700">EFFECTIVE AS OF APRIL 24, 2026</Text>
            </HStack>
            <Heading as="h1" size="2xl" fontFamily="'Playfair Display', serif" color="teal.900" mb={6}>
              Privacy & Data Sovereignty
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall" maxW="3xl">
              At MLC Health & Wellness Centre, we don't just protect your data; we honor its clinical sanctity. Our privacy standards are built on the foundations of therapeutic trust and advanced digital encryption.
            </Text>
          </Box>

          <Accordion allowMultiple w="full" variant="ghost">
            {/* 1. Clinical Data Governance */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiShield} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    1. Clinical Data Governance
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  We collect data specifically for the advancement of clinical outcomes. This includes:
                </Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem><Text as="span" fontWeight="bold">Psychometric Screening:</Text> Responses to intake forms and screening tools (e.g., DASS-21, Anxiety/Depression scales) are encrypted and accessible only to your clinician.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Clinical Notes & Journals:</Text> Session notes and client journal entries are stored separately from identifying administrative data to provide an extra layer of privacy.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Supervision Records:</Text> Professional mentorship data within the Supervision Suite is siloed from patient-facing data to maintain professional integrity.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 2. Identity & Authentication Sovereignty */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiUserCheck} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    2. Identity & Authentication Sovereignty
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  We use <Text as="span" fontWeight="bold">Clerk</Text> as our primary identity provider to ensure bank-grade security for your authentication.
                </Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem>Your authentication metadata (including roles and session state) is stored securely and never shared with advertisers.</ListItem>
                  <ListItem>We utilize Clerk’s multi-factor authentication (MFA) capabilities to protect clinical accounts from unauthorized access.</ListItem>
                  <ListItem>Log-in sessions are automatically timed out after periods of inactivity to prevent physical access breaches.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 3. Messaging & Telehealth Confidentiality */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiCpu} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    3. Messaging & Telehealth Confidentiality
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  The "Number-Free" secure chat and video portal are designed for clinical isolation:
                </Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem><Text as="span" fontWeight="bold">In-built Video:</Text> Video sessions are peer-to-peer and encrypted in transit. We <Text as="span" fontWeight="bold">do not record</Text> video sessions by default.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Secure Chat:</Text> Messages exchanged within the portal are stored with end-to-end encryption. These logs are protected from external data harvesting.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Boundary Protection:</Text> Phone numbers and personal emails are never exposed to the other party through the messaging interface.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 4. Wellbeing Analytics & Ethics */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiEye} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    4. Wellbeing Analytics & Ethics
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  For our practitioners, we collect "Balance Metrics" to help prevent clinical burnout:
                </Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem>Wellbeing data is strictly internal and used only to provide health alerts to the practitioner.</ListItem>
                  <ListItem>Aggregate, de-identified metrics may be used to improve institutional support systems, but individual health data is never shared with third parties.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 5. Infrastructure & Security Layers */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiServer} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    5. Infrastructure & Security Layers
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>Our platform employs a multi-layered security stack:</Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem><Text as="span" fontWeight="bold">Encryption:</Text> AES-256 for data at rest and TLS 1.3 for data in transit.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Siloed Architecture:</Text> Clinical records, payment data, and identity metadata are stored in separate, firewalled databases.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Regular Audits:</Text> Our internal clinical and technical boards perform monthly audits to ensure ethical and technical data integrity.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 6. Data Rights & Deletion */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiLock} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    6. Data Rights & Clinical Portability
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>You maintain sovereignty over your clinical narrative:</Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem>You may request a summary of your clinical progress and intake data at any time.</ListItem>
                  <ListItem>Upon request for account deletion, identifying data will be removed within 30 days, while clinical records may be archived in a de-identified format as required by medical record-keeping laws.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Divider />

          <Box pt={10} w="full">
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                We believe that privacy is the catalyst for healing. By using our clinical ecosystem, you trust us with your journey, and we honor that trust with uncompromising digital security.
              </Text>
              <HStack spacing={6}>
                <Text fontSize="xs" color="teal.600" fontWeight="700">DPO: privacy@mlchealth.in</Text>
                <Text fontSize="xs" color="teal.600" fontWeight="700">CLINICAL ETHICS: ethics@mlchealth.in</Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
