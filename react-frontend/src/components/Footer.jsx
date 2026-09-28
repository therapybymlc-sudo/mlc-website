'use client'

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Link,
  Text,
  Divider,
  Icon,
  Container,
  SimpleGrid,
  Grid,
  Image,
  Heading,
  Center,
  Flex
} from "@chakra-ui/react";
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiMapPin, FiArrowRight, FiPhone } from "react-icons/fi";
import NextLink from 'next/link';

const logoSrc = "/logo_tra.png";

const FooterColumn = ({ title, links }) => (
  <VStack align="start" spacing={3}>
    <Text 
      fontSize="11px" 
      fontWeight="800" 
      color="#C9A960" 
      letterSpacing="0.14em" 
      textTransform="uppercase"
    >
      {title}
    </Text>
    <VStack align="start" spacing={2}>
      {links.map((link) => (
        <Link
          key={link.label}
          as={NextLink}
          href={link.href}
          scroll={true}
          fontSize="13px"
          color="whiteAlpha.750"
          transition="all 0.2s ease"
          _hover={{ color: "white", transform: "translateX(3px)" }}
        >
          {link.label}
        </Link>
      ))}
    </VStack>
  </VStack>
);

const SocialIcon = ({ icon, href, label }) => (
  <Center
    as="a"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    w="34px"
    h="34px"
    borderRadius="full"
    bg="rgba(255, 255, 255, 0.06)"
    border="1px solid rgba(255, 255, 255, 0.1)"
    color="whiteAlpha.800"
    transition="all 0.25s ease"
    _hover={{ 
      bg: "#56756D", 
      borderColor: "#C9A960",
      color: "white", 
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(86, 117, 109, 0.35)"
    }}
  >
    <Icon as={icon} boxSize={4} />
  </Center>
);

export default function Footer() {
  const [year, setYear] = useState(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Box bg="#141918" color="white" pt={{ base: 12, md: 14 }} pb={8} borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.08)">
      <Container maxW="6xl">
        {/* 🧭 Top Navigation Grid */}
        <Grid 
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "1.6fr 1fr 1fr 1fr" }} 
          gap={{ base: 8, lg: 10 }} 
          mb={{ base: 10, md: 12 }}
          alignItems="start"
        >
          {/* 🌿 Brand Section */}
          <VStack align="start" spacing={4}>
            <HStack spacing={3.5} align="center">
              <Image src={logoSrc} alt="MLC Logo" boxSize="48px" filter="brightness(1.15)" />
              <VStack align="start" spacing={0.5}>
                <Heading 
                  fontSize={{ base: "15px", sm: "16.5px" }} 
                  fontFamily="'Playfair Display', var(--font-playfair), serif" 
                  letterSpacing="-0.01em" 
                  fontWeight="600"
                  color="white"
                  lineHeight="1.2"
                  whiteSpace="nowrap"
                >
                  MLC Health and Wellness Centre
                </Heading>
                <Text 
                  fontSize="12.5px" 
                  color="#A9CBB7" 
                  letterSpacing="0.01em"
                  whiteSpace="nowrap"
                >
                  a place to feel, to heal, to become
                </Text>
              </VStack>
            </HStack>
            <Text color="whiteAlpha.700" fontSize="13px" lineHeight="1.6" maxW="320px">
              A dedicated mental health organization providing structured, ethical, and clinically grounded psychological care across India.
            </Text>
            <HStack spacing={2.5} pt={1}>
              <SocialIcon icon={FaInstagram} href="https://www.instagram.com/mlc_healthandwellness/" label="Instagram" />
              <SocialIcon icon={FaLinkedin} href="https://www.linkedin.com/in/mlc-health-and-wellness-centre-9b35b6394/" label="LinkedIn" />
              <SocialIcon icon={FaWhatsapp} href="https://wa.me/919901619968" label="WhatsApp" />
            </HStack>
          </VStack>

          {/* 🧭 Discovery */}
          <FooterColumn 
            title="Discovery" 
            links={[
              { label: "Our Story", href: "/about" },
              { label: "The MLC Blog", href: "/blog" },
              { label: "Therapeutic Services", href: "/services" },
              { label: "Meet the Team", href: "/meettheteam" },
              { label: "Therapist Directory", href: "/therapists/directory" },
              { label: "Find a Therapist", href: "/therapists/discovery" },
            ]} 
          />

          {/* 💼 Practitioner */}
          <FooterColumn 
            title="Practitioner" 
            links={[
              { label: "Join the Network", href: "/therapists" },
              { label: "Apply as Clinician", href: "/therapist-apply" },
              { label: "Supervisor Directory", href: "/therapists/supervisors/directory" },
              { label: "Clinical Supervision", href: "/supervision" },
              { label: "Workshops & Circles", href: "/workshops" },
              { label: "Career Opportunities", href: "/careers" },
            ]} 
          />

          {/* 🤝 Support */}
          <FooterColumn 
            title="Support & Care" 
            links={[
              { label: "Contact Us", href: "/contactus" },
              { label: "Emergency Resources", href: "/dashboard/client/safety" },
              { label: "Book Appointment", href: "/book" },
              { label: "Member Login", href: "/login" },
              { label: "Feelings Wheel", href: "/feelings-wheel" },
            ]} 
          />
        </Grid>

        {/* 📧 Contact Dock */}
        <Box 
          bg="linear-gradient(135deg, rgba(86, 117, 109, 0.12) 0%, rgba(20, 36, 32, 0.6) 100%)"
          p={{ base: 4, md: 5 }} 
          borderRadius="2xl" 
          mb={{ base: 8, md: 9 }} 
          border="1px solid" 
          borderColor="rgba(255, 255, 255, 0.08)"
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 4, lg: 6 }} alignItems="center">
            <HStack spacing={3.5}>
              <Center bg="whiteAlpha.100" border="1px solid rgba(255, 255, 255, 0.08)" p={2.5} borderRadius="xl" minW="42px" minH="42px">
                <Icon as={FiMail} boxSize={4} color="#C9A960" />
              </Center>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="800" letterSpacing="0.08em" color="whiteAlpha.500" textTransform="uppercase">EMAIL INQUIRIES</Text>
                <Link href="mailto:therapy@mlchealth.in" fontSize="13px" fontWeight="600" color="whiteAlpha.900" _hover={{ color: "#C9A960" }}>
                  therapy@mlchealth.in
                </Link>
              </VStack>
            </HStack>

            <HStack spacing={3.5}>
              <Center bg="whiteAlpha.100" border="1px solid rgba(255, 255, 255, 0.08)" p={2.5} borderRadius="xl" minW="42px" minH="42px">
                <Icon as={FiPhone} boxSize={4} color="#C9A960" />
              </Center>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="800" letterSpacing="0.08em" color="whiteAlpha.500" textTransform="uppercase">PHONE & WHATSAPP</Text>
                <Link href="tel:+919901619968" fontSize="13px" fontWeight="600" color="whiteAlpha.900" _hover={{ color: "#C9A960" }}>
                  +91 99016 19968
                </Link>
              </VStack>
            </HStack>
            
            <HStack spacing={3.5}>
              <Center bg="whiteAlpha.100" border="1px solid rgba(255, 255, 255, 0.08)" p={2.5} borderRadius="xl" minW="42px" minH="42px">
                <Icon as={FiMapPin} boxSize={4} color="#C9A960" />
              </Center>
              <VStack align="start" spacing={0}>
                <Text fontSize="10px" fontWeight="800" letterSpacing="0.08em" color="whiteAlpha.500" textTransform="uppercase">CLINICAL CARE</Text>
                <Text fontSize="13px" fontWeight="600" color="whiteAlpha.900">Online Pan-India & Global</Text>
              </VStack>
            </HStack>

            <NextLink href="/book" passHref scroll={true} style={{ width: '100%' }}>
              <Box 
                as="button"
                bg="#56756D" 
                color="white" 
                px={6} 
                py={3} 
                borderRadius="full" 
                fontWeight="700" 
                fontSize="13px"
                transition="all 0.25s ease"
                w="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                _hover={{ bg: "#C9A960", color: "#141918", transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(201, 169, 96, 0.35)" }}
              >
                <span>Start Your Journey</span>
                <Icon as={FiArrowRight} boxSize={3.5} />
              </Box>
            </NextLink>
          </SimpleGrid>
        </Box>

        <Divider borderColor="whiteAlpha.100" />

        {/* 📜 Bottom Bar */}
        <Flex 
          direction={{ base: "column", sm: "row" }} 
          justify="space-between" 
          align="center" 
          pt={5} 
          gap={3}
        >
          <Text fontSize="12px" color="whiteAlpha.500" fontWeight="500">
            © {year || '2026'} MLC Health & Wellness Centre. All rights reserved.
          </Text>
          <HStack spacing={6}>
            <Link as={NextLink} href="/privacy" scroll={true} fontSize="12px" color="whiteAlpha.500" _hover={{ color: "white" }}>
              Privacy Policy
            </Link>
            <Link as={NextLink} href="/terms" scroll={true} fontSize="12px" color="whiteAlpha.500" _hover={{ color: "white" }}>
              Terms of Service
            </Link>
            <Link 
              fontSize="12px" 
              color="whiteAlpha.500" 
              _hover={{ color: "white" }}
              onClick={() => window.dispatchEvent(new CustomEvent('mlc-show-cookies'))}
            >
              Cookie Settings
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
