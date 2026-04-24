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
import { FiShield, FiFileText, FiCreditCard, FiUsers, FiLock, FiAlertCircle } from 'react-icons/fi';

const MotionBox = motion(Box);

export default function TermsOfService() {
  return (
    <Box bg="#FDFBFA" minH="100vh" pt={{ base: 20, md: 32 }} pb={24}>
      <Container maxW="5xl">
        <Breadcrumb fontSize="xs" color="gray.400" mb={8} textTransform="uppercase" letterSpacing="widest">
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Terms of Service</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="start" spacing={10} w="full">
          <Box>
            <HStack spacing={4} mb={4}>
              <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={3}>v2.0 Clinical Standard</Badge>
              <Text color="gray.400" fontSize="xs" fontWeight="700">EFFECTIVE AS OF APRIL 24, 2026</Text>
            </HStack>
            <Heading as="h1" size="2xl" fontFamily="'Playfair Display', serif" color="teal.900" mb={6}>
              Terms of Service & Clinical Governance
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall" maxW="3xl">
              These terms govern the use of the MLC Health & Wellness Centre ecosystem. By utilizing our portal, you enter into a binding agreement that ensures the highest standards of clinical care, practitioner protection, and ethical follow-through.
            </Text>
          </Box>

          <Accordion allowMultiple w="full" variant="ghost">
            {/* 1. Scope of the Clinical Ecosystem */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiShield} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    1. Scope of the Clinical Ecosystem
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  MLC Health provides a comprehensive, all-in-one clinical environment. This ecosystem encompasses:
                </Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem>Initial clinical screening and diagnostic intake.</ListItem>
                  <ListItem>In-built secure video conferencing for therapeutic sessions.</ListItem>
                  <ListItem>Secure messaging and ethical follow-through communications.</ListItem>
                  <ListItem>Automated scheduling and clinical availability management.</ListItem>
                  <ListItem>Practitioner wellbeing tracking and work-life balance support.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 2. Privacy & Communication Boundaries */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiLock} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    2. Privacy & Communication Boundaries
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4} fontWeight="600">Protecting Practitioner Privacy:</Text>
                <Text mb={4}>
                  To maintain professional boundaries and protect the personal lives of our clinicians, all communication between clients and therapists must occur strictly within the MLC Portal. 
                </Text>
                <UnorderedList spacing={3} ml={6} mb={4}>
                  <ListItem>Exchanging personal phone numbers, home addresses, or social media handles is strictly prohibited.</ListItem>
                  <ListItem>All secure messages are part of the clinical record and are stored with end-to-end encryption standard to clinical guidelines.</ListItem>
                  <ListItem>Practitioners are entitled to silence notifications outside of their designated clinical hours to preserve work-life balance.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 3. Financial Integrity & Subscriptions */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiCreditCard} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    3. Financial Integrity & Subscriptions
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>The platform utilizes a structured financial model to ensure transparency and commitment:</Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem><Text as="span" fontWeight="bold">Subscription Tiers:</Text> Access to "The Therapist OS" and premium clinical tools is governed by active subscription plans (Basic, Pro, or Clinic).</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Session Fees:</Text> Client billing is automated upon session completion. Cancellations with less than 24-hour notice will trigger a 100% service fee charge.</ListItem>
                  <ListItem><Text as="span" fontWeight="bold">Refund Policy:</Text> Clinical session fees are non-refundable once the session has commenced. Disputes must be raised through the "Need Help?" portal within 7 days.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 4. The Supervision Hub */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiUsers} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    4. The Supervision Hub & Clinical Growth
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>The Supervision Suite is a specialized environment for clinical mentorship:</Text>
                <UnorderedList spacing={3} ml={6}>
                  <ListItem>Supervisors must maintain active verification and demonstrate 5+ years of clinical seniority.</ListItem>
                  <ListItem>The relationship between Supervisor and Supervisee is one of professional development and does not constitute legal clinical responsibility for the Supervisee's primary clients.</ListItem>
                  <ListItem>Supervision records are maintained separately from patient clinical records to ensure professional confidentiality.</ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            {/* 5. Intellectual Property & "The Therapist OS" */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="white" borderRadius="2xl" shadow="sm" _hover={{ bg: 'teal.50' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiFileText} color="teal.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="teal.800" textTransform="uppercase" letterSpacing="1px">
                    5. Intellectual Property & "The Therapist OS"
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700">
                <Text mb={4}>
                  The MLC Portal, including "The Therapist OS" feature set, note templates, and clinical worksheets, is the exclusive intellectual property of MLC Health.
                </Text>
                <Text>
                  Users are granted a limited, non-transferable license to use these tools for direct clinical care within the portal. Redistribution, extraction of source code, or replication of the MLC clinical logic is strictly prohibited.
                </Text>
              </AccordionPanel>
            </AccordionItem>

            {/* 6. Emergency & Crisis Disclaimer */}
            <AccordionItem border="none" mb={6}>
              <AccordionButton p={6} bg="red.50" borderRadius="2xl" shadow="sm" _hover={{ bg: 'red.100' }}>
                <HStack flex="1" textAlign="left" spacing={4}>
                  <Icon as={FiAlertCircle} color="red.500" boxSize={5} />
                  <Heading as="h2" size="sm" color="red.800" textTransform="uppercase" letterSpacing="1px">
                    6. Emergency & Crisis Protocol
                  </Heading>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} pt={6} px={8} color="gray.700" bg="red.50" borderRadius="b-2xl">
                <Text fontWeight="bold" color="red.700" mb={4}>
                  MLC HEALTH IS NOT A CRISIS SERVICE.
                </Text>
                <Text>
                  If you are experiencing thoughts of self-harm, suicidal ideation, or are in an immediate psychiatric crisis, do not use this portal. You must contact your local emergency services (ER) or a specialized crisis hotline immediately. MLC clinicians are not required to be available for emergency responses outside of scheduled session times.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <Divider />

          <Box pt={10} w="full">
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                By continuing to use our services, you acknowledge that you have read and understood these Terms. These terms are subject to update as our ecosystem evolves to better serve your clinical needs.
              </Text>
              <HStack spacing={6}>
                <Text fontSize="xs" color="teal.600" fontWeight="700">GOVERNANCE: legal@mlchealth.in</Text>
                <Text fontSize="xs" color="teal.600" fontWeight="700">SUPPORT: office@mlchealth.in</Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
