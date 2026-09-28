'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Button,
  Badge,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useToast,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  FiShield,
  FiLock,
  FiCreditCard,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiPrinter,
  FiMail,
  FiArrowRight,
  FiCopy,
  FiCheckCircle,
  FiPhoneCall,
  FiCheck
} from 'react-icons/fi';

const SECTIONS = [
  { id: 'clinical-scope', title: '1. Scope of the Ecosystem', icon: FiShield },
  { id: 'communication-boundaries', title: '2. Professional Boundaries', icon: FiLock },
  { id: 'financial-terms', title: '3. Financial Integrity & Plans', icon: FiCreditCard },
  { id: 'supervision-hub', title: '4. Clinical Supervision Hub', icon: FiUsers },
  { id: 'intellectual-property', title: '5. Intellectual Property', icon: FiFileText },
  { id: 'crisis-protocol', title: '6. Emergency & Crisis Protocol', icon: FiAlertTriangle },
  { id: 'legal-governance', title: '7. Governance & Inquiries', icon: FiMail },
];

export default function TermsClient() {
  const [activeSection, setActiveSection] = useState('clinical-scope');
  const [copiedEmail, setCopiedEmail] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
    toast({
      title: 'Email Copied',
      description: `${email} copied to your clipboard.`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top-right',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" color="#263A33">
      {/* ═══════════════ EDITORIAL HERO ═══════════════ */}
      <Box
        position="relative"
        bg="linear-gradient(135deg, #1C2B26 0%, #263A33 55%, #1F302A 100%)"
        color="white"
        pt={{ base: 12, md: 16 }}
        pb={{ base: 14, md: 20 }}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
      >
        {/* Ambient background accents */}
        <Box
          position="absolute"
          top="-20%"
          right="-5%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201, 169, 96, 0.12) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-30%"
          left="5%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169, 203, 183, 0.08) 0%, transparent 70%)"
          pointerEvents="none"
        />

        <Container maxW="6xl" position="relative" zIndex={2}>
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            fontSize="12px"
            fontWeight="600"
            color="whiteAlpha.600"
            mb={{ base: 5, md: 6 }}
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href="/" _hover={{ color: '#C9A960' }}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Text color="whiteAlpha.400">Legal</Text>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink color="#C9A960">Terms of Service</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Top Badges & Tabs */}
          <HStack
            justify="space-between"
            align={{ base: 'start', sm: 'center' }}
            flexWrap="wrap"
            gap={4}
            mb={6}
          >
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                bg="rgba(201, 169, 96, 0.18)"
                color="#F0D591"
                border="1px solid rgba(201, 169, 96, 0.4)"
                px={3.5}
                py={1}
                borderRadius="full"
                fontSize="11.5px"
                fontWeight="700"
                letterSpacing="0.06em"
                textTransform="uppercase"
              >
                Clinical Governance v2.4
              </Badge>
              <Text fontSize="12.5px" color="whiteAlpha.700" fontWeight="500">
                Effective: April 24, 2026 • 6 min read
              </Text>
            </HStack>

            {/* Segmented Switcher Pill */}
            <HStack
              bg="rgba(255, 255, 255, 0.06)"
              p={1}
              borderRadius="full"
              border="1px solid rgba(255, 255, 255, 0.12)"
              spacing={1}
            >
              <Button
                as={NextLink}
                href="/privacy"
                size="sm"
                variant="ghost"
                color="whiteAlpha.750"
                borderRadius="full"
                px={4}
                height="32px"
                fontSize="12.5px"
                fontWeight="500"
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              >
                Privacy Policy
              </Button>
              <Button
                as={NextLink}
                href="/terms"
                size="sm"
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={4}
                height="32px"
                fontSize="12.5px"
                fontWeight="600"
                boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                _hover={{ bg: '#56756D' }}
              >
                Terms of Service
              </Button>
            </HStack>
          </HStack>

          {/* Title & Philosophy */}
          <Heading
            as="h1"
            fontSize={{ base: '2.2rem', md: '3.25rem' }}
            fontFamily="'Playfair Display', var(--font-playfair), Georgia, serif"
            fontWeight="600"
            color="white"
            lineHeight="1.18"
            letterSpacing="-0.02em"
            mb={4}
            maxW="4xl"
          >
            Terms of Service & Clinical Governance
          </Heading>

          <Text
            fontSize={{ base: '15px', md: '16.5px' }}
            color="whiteAlpha.800"
            lineHeight="1.8"
            maxW="720px"
            fontFamily="'Inter', var(--font-inter), sans-serif"
          >
            These terms define the clinical standard, legal agreements, and ethical covenants governing
            participation in the MLC Health & Wellness Centre ecosystem. By utilizing our portal,
            practitioners and clients enter into a relationship dedicated to therapeutic safety,
            clear clinical boundaries, and mutual accountability.
          </Text>
        </Container>
      </Box>

      {/* ═══════════════ MAIN CONTENT ARCHITECTURE ═══════════════ */}
      <Container maxW="6xl" py={{ base: 10, md: 16 }}>
        <HStack align="start" spacing={{ base: 0, lg: 10 }}>
          {/* ═══════ STICKY DESKTOP SIDEBAR ═══════ */}
          <Box
            display={{ base: 'none', lg: 'block' }}
            w="300px"
            position="sticky"
            top="95px"
            flexShrink={0}
          >
            <VStack align="stretch" spacing={5}>
              {/* Table of Contents Card */}
              <Box
                bg="white"
                p={5}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.03)"
              >
                <Text
                  fontSize="11px"
                  fontWeight="800"
                  color="#56756D"
                  letterSpacing="0.14em"
                  textTransform="uppercase"
                  mb={3}
                >
                  Table of Contents
                </Text>
                <VStack align="stretch" spacing={1.5}>
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    const isCrisis = sec.id === 'crisis-protocol';
                    return (
                      <HStack
                        key={sec.id}
                        as="button"
                        onClick={() => scrollToSection(sec.id)}
                        px={3}
                        py={2}
                        borderRadius="xl"
                        textAlign="left"
                        bg={isActive ? (isCrisis ? '#FFF5F5' : '#F2F7F4') : 'transparent'}
                        color={isActive ? (isCrisis ? '#C53030' : '#263A33') : 'rgba(46, 46, 46, 0.7)'}
                        fontWeight={isActive ? '600' : '400'}
                        fontSize="13px"
                        transition="all 0.18s ease"
                        _hover={{
                          bg: isCrisis ? '#FFF5F5' : '#F8FAF9',
                          color: isCrisis ? '#C53030' : '#263A33',
                          transform: 'translateX(2px)',
                        }}
                        spacing={2.5}
                      >
                        <Icon
                          as={sec.icon}
                          boxSize={3.5}
                          color={isActive ? (isCrisis ? '#E53E3E' : '#56756D') : 'gray.400'}
                        />
                        <Text noOfLines={1}>{sec.title}</Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>

              {/* Clinical Covenant Box */}
              <Box
                bg="linear-gradient(135deg, rgba(86, 117, 109, 0.08) 0%, rgba(20, 36, 32, 0.03) 100%)"
                p={5}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.15)"
              >
                <Text
                  fontSize="11px"
                  fontWeight="800"
                  color="#56756D"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                  mb={3}
                >
                  Clinical Standards
                </Text>
                <VStack align="start" spacing={3} fontSize="12.5px" color="rgba(46,46,46,0.85)">
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">Strict In-Portal Care:</Text> Protects practitioner private life.</Text>
                  </HStack>
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">24-Hr Notice Rule:</Text> Rescheduling honors clinical time.</Text>
                  </HStack>
                  <HStack align="start" spacing={2.5}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize={4} mt={0.5} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600">Non-Crisis Care:</Text> Emergency hotlines for critical safety.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* Print Action Button */}
              <Button
                leftIcon={<FiPrinter />}
                onClick={handlePrint}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.2)"
                color="#56756D"
                borderRadius="full"
                height="38px"
                fontSize="13px"
                fontWeight="600"
                w="full"
                _hover={{ bg: '#F2F7F4', borderColor: '#56756D' }}
              >
                Print / Save Document
              </Button>
            </VStack>
          </Box>

          {/* ═══════ EDITORIAL BODY SECTIONS ═══════ */}
          <Box flex="1" maxW={{ base: '100%', lg: '780px' }}>
            <VStack align="stretch" spacing={{ base: 8, md: 10 }}>

              {/* ─── SECTION 1: SCOPE OF THE CLINICAL ECOSYSTEM ─── */}
              <Box
                id="clinical-scope"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiShield} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    1. Scope of the Clinical Ecosystem
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={5}>
                  MLC Health & Wellness Centre provides a unified psychological infrastructure designed to elevate therapy standards, clinical supervision, and practitioner sustainability across India. This ecosystem comprises:
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5}>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1}>Discovery & Clinical Intake</Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">Structured diagnostic intake protocols and ethical practitioner matchmaking.</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1}>Encrypted Video Rooms</Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">Peer-to-peer telehealth sessions built directly into the patient portal.</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1}>Secure Boundary Chat</Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">Number-free therapeutic follow-through messages and journal reflections.</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13px" fontWeight="700" color="#263A33" mb={1}>The Supervision Suite</Text>
                    <Text fontSize="12.5px" color="rgba(46,46,46,0.78)" lineHeight="1.6">Dedicated peer consultation, case study reviews, and clinical mentorship.</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* ─── SECTION 2: PROFESSIONAL BOUNDARIES ─── */}
              <Box
                id="communication-boundaries"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiLock} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    2. Privacy & Communication Boundaries
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  To maintain rigorous professional standards and safeguard the personal lives and emotional reserves of our clinicians, all communications between clients and therapists must occur strictly within the designated portal.
                </Text>

                <VStack align="start" spacing={3} pl={2} fontSize="14px" color="rgba(46, 46, 46, 0.85)">
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">No External Contact Sharing:</Text> Soliciting or sharing personal telephone numbers, personal WhatsApp, physical home addresses, or private social media handles is strictly prohibited.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Permanent Clinical Archival:</Text> In-portal messages constitute a part of the clinical continuity narrative and are stored with clinical end-to-end encryption.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Protected Rest Intervals:</Text> Clinicians are ethically entitled to silence notifications outside of their designated operating calendar to preserve work-life balance and prevent emotional depletion.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── SECTION 3: FINANCIAL INTEGRITY & SUBSCRIPTIONS ─── */}
              <Box
                id="financial-terms"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiCreditCard} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    3. Financial Integrity & Cancellation Policies
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  The platform operates a transparent, automated financial framework honoring both client investment and therapist reservation commitments:
                </Text>

                <VStack align="stretch" spacing={3.5} mb={2}>
                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      Subscription Plans ("The Therapist OS")
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Clinician access to advanced practice automation, analytics, and booking gateways is governed by active tiered subscriptions (Basic, Pro, or Clinic tiers). Subscriptions renew automatically until cancelled via the therapist subscription portal.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      24-Hour Cancellation Protocol
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Because therapy timeslots are exclusively reserved and cannot be allocated to waiting clients on short notice, session cancellations or reschedulings requested with less than 24 hours' notice will incur a 100% reservation charge.
                    </Text>
                  </Box>

                  <Box p={4} borderRadius="xl" bg="#FAF8F5" border="1px solid rgba(86, 117, 109, 0.08)">
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" mb={1}>
                      Refund Policy & Dispute Resolution
                    </Text>
                    <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                      Session fees are strictly non-refundable once the clinical consultation has commenced. Billing discrepancies or technical connectivity disputes must be lodged within 7 days via our institutional care portal.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* ─── SECTION 4: THE SUPERVISION HUB ─── */}
              <Box
                id="supervision-hub"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiUsers} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    4. The Supervision Hub & Clinical Growth
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  The Supervision Suite is an exclusive environment designed for peer mentorship, case conceptualization, and ethical refinement:
                </Text>

                <VStack align="start" spacing={3} pl={2} fontSize="14px" color="rgba(46, 46, 46, 0.85)">
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Vetted Seniority Threshold:</Text> Supervisors listed in the MLC Directory must maintain verified credentials with a minimum of 5 years of licensed clinical experience.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Mentorship Scope:</Text> Supervision consultations provide educational guidance and case formulation. They do not constitute vicarious legal liability for the primary clinical decisions of the supervisee.</Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#56756D" mt={2} flexShrink={0} />
                    <Text><Text as="span" fontWeight="600" color="#263A33">Confidential Records:</Text> Supervision logs are maintained independently from patient clinical records to uphold the safety of reflective professional discourse.</Text>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── SECTION 5: INTELLECTUAL PROPERTY ─── */}
              <Box
                id="intellectual-property"
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.12)"
                boxShadow="0 4px 20px rgba(38, 58, 51, 0.025)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="#EAF2EE"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#56756D"
                    flexShrink={0}
                  >
                    <Icon as={FiFileText} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#263A33"
                    fontWeight="600"
                  >
                    5. Intellectual Property & "The Therapist OS"
                  </Heading>
                </HStack>

                <Text fontSize="14.5px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75" mb={4}>
                  The MLC Portal, including "The Therapist OS" suite, specialized clinical note structures, feelings wheel algorithms, psychometric worksheets, and UI design systems, represents the proprietary intellectual property of MLC Health & Wellness Centre.
                </Text>

                <Text fontSize="14px" color="rgba(46, 46, 46, 0.85)" lineHeight="1.75">
                  Practitioners and organizations are granted a revocable, non-transferable, limited license to utilize these instruments exclusively for direct therapeutic service within our ecosystem. The unauthorized extraction, resale, programmatic reverse-engineering, or commercial dissemination of MLC clinical logic is strictly actionable under applicable intellectual property laws.
                </Text>
              </Box>

              {/* ─── SECTION 6: EMERGENCY & CRISIS PROTOCOL ─── */}
              <Box
                id="crisis-protocol"
                bg="#FFF8F8"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1.5px solid"
                borderColor="rgba(197, 48, 48, 0.3)"
                boxShadow="0 8px 24px rgba(197, 48, 48, 0.06)"
              >
                <HStack spacing={3.5} mb={4}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="rgba(197, 48, 48, 0.12)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#C53030"
                    flexShrink={0}
                  >
                    <Icon as={FiAlertTriangle} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="#9B2C2C"
                    fontWeight="700"
                  >
                    6. Critical Emergency & Crisis Protocol
                  </Heading>
                </HStack>

                <Badge colorScheme="red" variant="solid" px={3} py={1} borderRadius="full" fontSize="11px" mb={3}>
                  URGENT CLINICAL NOTICE
                </Badge>

                <Text fontSize="15px" fontWeight="700" color="#9B2C2C" mb={2}>
                  MLC HEALTH IS NOT AN EMERGENCY OR CRISIS INTERVENTION FACILITY.
                </Text>

                <Text fontSize="14px" color="rgba(116, 42, 42, 0.9)" lineHeight="1.75" mb={5}>
                  If you are experiencing suicidal thoughts, intent of self-harm, severe substance overdose, or an acute psychiatric crisis, do not wait for a portal response. MLC therapists are not on-call for emergency care outside scheduled appointments. Immediately contact national emergency lines or present yourself to the nearest hospital casualty emergency room.
                </Text>

                <Box bg="white" p={4} borderRadius="xl" border="1px solid rgba(197, 48, 48, 0.2)">
                  <Text fontSize="12px" fontWeight="800" color="#9B2C2C" textTransform="uppercase" letterSpacing="0.08em" mb={2.5}>
                    Emergency Hotlines Across India (24/7 Free & Confidential)
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    <HStack spacing={3} p={2.5} bg="#FFF5F5" borderRadius="lg">
                      <Icon as={FiPhoneCall} color="#E53E3E" boxSize={4} />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#2D3748">Tele-MANAS (Govt of India)</Text>
                        <Text fontSize="13px" fontWeight="800" color="#C53030">Dial 14416 / 1800 891 4416</Text>
                      </Box>
                    </HStack>
                    <HStack spacing={3} p={2.5} bg="#FFF5F5" borderRadius="lg">
                      <Icon as={FiPhoneCall} color="#E53E3E" boxSize={4} />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#2D3748">Vandrevala Foundation</Text>
                        <Text fontSize="13px" fontWeight="800" color="#C53030">+91 9999 666 555</Text>
                      </Box>
                    </HStack>
                    <HStack spacing={3} p={2.5} bg="#FFF5F5" borderRadius="lg">
                      <Icon as={FiPhoneCall} color="#E53E3E" boxSize={4} />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#2D3748">KIRAN Mental Health</Text>
                        <Text fontSize="13px" fontWeight="800" color="#C53030">1800-599-0019</Text>
                      </Box>
                    </HStack>
                    <HStack spacing={3} p={2.5} bg="#FFF5F5" borderRadius="lg">
                      <Icon as={FiPhoneCall} color="#E53E3E" boxSize={4} />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#2D3748">National Emergency</Text>
                        <Text fontSize="13px" fontWeight="800" color="#C53030">Dial 112</Text>
                      </Box>
                    </HStack>
                  </SimpleGrid>
                </Box>
              </Box>

              {/* ─── SECTION 7: GOVERNANCE & LEGAL INQUIRIES ─── */}
              <Box
                id="legal-governance"
                bg="linear-gradient(135deg, #263A33 0%, #1F302A 100%)"
                color="white"
                p={{ base: 6, md: 8 }}
                borderRadius="24px"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                boxShadow="0 8px 30px rgba(0, 0, 0, 0.15)"
              >
                <HStack spacing={3.5} mb={3}>
                  <Box
                    w="38px"
                    h="38px"
                    borderRadius="full"
                    bg="rgba(201, 169, 96, 0.18)"
                    border="1px solid rgba(201, 169, 96, 0.4)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="#F0D591"
                    flexShrink={0}
                  >
                    <Icon as={FiMail} boxSize={5} />
                  </Box>
                  <Heading
                    as="h2"
                    fontSize={{ base: '18px', md: '21px' }}
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    color="white"
                    fontWeight="600"
                  >
                    7. Institutional Governance & Legal Contacts
                  </Heading>
                </HStack>

                <Text fontSize="14px" color="whiteAlpha.800" lineHeight="1.7" mb={6}>
                  By accessing the MLC Health portal, you confirm having read and agreed to these terms. If you have inquiries regarding institutional partnerships, legal agreements, or operational compliance, contact us directly:
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={5}>
                  <Box
                    bg="whiteAlpha.08"
                    p={4}
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <Text fontSize="11px" fontWeight="800" color="#F0D591" textTransform="uppercase" letterSpacing="0.1em" mb={1.5}>
                      Legal & Governance Counsel
                    </Text>
                    <HStack spacing={2} align="center">
                      <Text fontSize="14px" fontWeight="600" color="white">
                        legal@mlchealth.in
                      </Text>
                      <Tooltip label={copiedEmail === 'legal@mlchealth.in' ? "Copied!" : "Copy address"} hasArrow placement="top">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={copiedEmail === 'legal@mlchealth.in' ? <FiCheck /> : <FiCopy />}
                          color={copiedEmail === 'legal@mlchealth.in' ? "#8BE48B" : "whiteAlpha.800"}
                          _hover={{ color: "white", bg: "whiteAlpha.200" }}
                          borderRadius="md"
                          minW="26px"
                          h="26px"
                          fontSize="13px"
                          aria-label="Copy email address"
                          onClick={() => copyEmail('legal@mlchealth.in')}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>

                  <Box
                    bg="whiteAlpha.08"
                    p={4}
                    borderRadius="xl"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                  >
                    <Text fontSize="11px" fontWeight="800" color="#F0D591" textTransform="uppercase" letterSpacing="0.1em" mb={1.5}>
                      Clinical Office Administration
                    </Text>
                    <HStack spacing={2} align="center">
                      <Text fontSize="14px" fontWeight="600" color="white">
                        office@mlchealth.in
                      </Text>
                      <Tooltip label={copiedEmail === 'office@mlchealth.in' ? "Copied!" : "Copy address"} hasArrow placement="top">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={copiedEmail === 'office@mlchealth.in' ? <FiCheck /> : <FiCopy />}
                          color={copiedEmail === 'office@mlchealth.in' ? "#8BE48B" : "whiteAlpha.800"}
                          _hover={{ color: "white", bg: "whiteAlpha.200" }}
                          borderRadius="md"
                          minW="26px"
                          h="26px"
                          fontSize="13px"
                          aria-label="Copy email address"
                          onClick={() => copyEmail('office@mlchealth.in')}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                </SimpleGrid>

                <Divider borderColor="whiteAlpha.200" mb={4} />

                <HStack justify="space-between" flexWrap="wrap" gap={3}>
                  <Text fontSize="12px" color="whiteAlpha.600">
                    MLC Health and Wellness Centre • Pan-India Clinical Governance
                  </Text>
                  <Button
                    as={NextLink}
                    href="/privacy"
                    size="sm"
                    variant="link"
                    color="#F0D591"
                    rightIcon={<FiArrowRight />}
                    _hover={{ color: 'white', textDecoration: 'none' }}
                    fontSize="13px"
                  >
                    Read Privacy Policy
                  </Button>
                </HStack>
              </Box>

            </VStack>
          </Box>
        </HStack>
      </Container>
    </Box>
  );
}
