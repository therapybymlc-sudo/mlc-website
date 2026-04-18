'use client'

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
  Image,
  Heading,
  Stack,
  Center
} from "@chakra-ui/react";
import { FaInstagram, FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa";
import { FiMail, FiMapPin, FiArrowRight } from "react-icons/fi";
import NextLink from 'next/link'

const logoSrc = "/logo_tra.png";

const FooterColumn = ({ title, links }) => (
  <VStack align="start" spacing={4}>
    <Text 
      fontSize="xs" 
      fontWeight="900" 
      color="#A9CBB7" 
      letterSpacing="0.2em" 
      textTransform="uppercase"
    >
      {title}
    </Text>
    <VStack align="start" spacing={2.5}>
      {links.map((link) => (
        <Link
          key={link.label}
          as={NextLink}
          href={link.href}
          fontSize="sm"
          color="whiteAlpha.800"
          transition="all 0.2s"
          _hover={{ color: "#C9A960", transform: "translateX(4px)" }}
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
    aria-label={label}
    w="40px"
    h="40px"
    borderRadius="full"
    bg="whiteAlpha.100"
    color="white"
    transition="all 0.3s"
    _hover={{ 
      bg: "#56756D", 
      color: "white", 
      transform: "translateY(-4px)",
      boxShadow: "0 4px 15px rgba(86, 117, 109, 0.4)"
    }}
  >
    <Icon as={icon} boxSize={5} />
  </Center>
);

export default function Footer() {
  return (
    <Box bg="#1A1A1A" color="white" pt={20} pb={10} borderTop="1px solid" borderColor="whiteAlpha.100">
      <Container maxW="1200px">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={12} mb={20}>
          {/* 🌿 Brand Section */}
          <Stack spacing={8} gridColumn={{ lg: "span 1.5" }}>
            <HStack spacing={4}>
              <Image src={logoSrc} alt="MLC Logo" boxSize="60px" filter="brightness(1.2)" />
              <VStack align="start" spacing={0}>
                <Heading 
                  size="md" 
                  fontFamily="'Forum', serif" 
                  letterSpacing="1px" 
                  fontWeight="400"
                  textTransform="none"
                >
                  MLC Health and Wellness Centre
                </Heading>
                <Text 
                  fontSize="sm" 
                  color="#56756D" 
                  fontFamily="'Forum', serif" 
                  letterSpacing="1px"
                >
                  a place to feel, to heal, to become
                </Text>
              </VStack>
            </HStack>
            <Text color="whiteAlpha.700" fontSize="md" lineHeight="tall" maxW="320px">
              A dedicated mental health organization providing structured, ethical, and high-quality psychological services across India.
            </Text>
            <HStack spacing={3}>
              <SocialIcon icon={FaInstagram} href="https://www.instagram.com/mlc_healthandwellness/" label="Instagram" />
              <SocialIcon icon={FaLinkedin} href="https://www.linkedin.com/in/mlc-health-and-wellness-centre-9b35b6394/" label="LinkedIn" />
              {/* Optional extras */}
              <SocialIcon icon={FaFacebook} href="#" label="Facebook" />
              <SocialIcon icon={FaTwitter} href="#" label="Twitter" />
            </HStack>
          </Stack>

          {/* 🧭 Navigation Columns */}
          <FooterColumn 
            title="Discovery" 
            links={[
              { label: "Our Story", href: "/about" },
              { label: "Therapeutic Services", href: "/services" },
              { label: "Meet the Team", href: "/meettheteam" },
              { label: "Find a Therapist", href: "/therapists/discovery" },
              { label: "Psychological Workshops", href: "/workshops" },
            ]} 
          />

          <FooterColumn 
            title="Practitioner" 
            links={[
              { label: "Join the Network", href: "/therapists" },
              { label: "Apply as Clinician", href: "/therapist-apply" },
              { label: "Global Supervision", href: "/supervision" },
              { label: "Career Opportunities", href: "/careers" },
            ]} 
          />

          <FooterColumn 
            title="Support" 
            links={[
              { label: "Contact Us", href: "/contactus" },
              { label: "Emergency Resources", href: "/dashboard/client/safety" },
              { label: "Book Appointment", href: "/book" },
              { label: "Member Login", href: "/login" },
            ]} 
          />
        </SimpleGrid>

        {/* 📧 Contact Strip */}
        <Box 
          bg="rgba(86, 117, 109, 0.1)" 
          p={8} 
          borderRadius="3xl" 
          mb={16} 
          border="1px solid" 
          borderColor="whiteAlpha.100"
        >
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} spacing={8}>
            <HStack spacing={6}>
              <Center bg="whiteAlpha.100" p={3} borderRadius="xl">
                <Icon as={FiMail} boxSize={6} color="#A9CBB7" />
              </Center>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.500">EMAIL INQUIRIES</Text>
                <Link href="mailto:therapy@mlchealth.in" fontSize="lg" fontWeight="600" color="#C9A960" _hover={{ color: "white" }}>
                  therapy@mlchealth.in
                </Link>
              </VStack>
            </HStack>
            
            <HStack spacing={6}>
              <Center bg="whiteAlpha.100" p={3} borderRadius="xl">
                <Icon as={FiMapPin} boxSize={6} color="#A9CBB7" />
              </Center>
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.500">HEADQUARTERS</Text>
                <Text fontSize="lg" fontWeight="600">Online Across India | Remote Focus</Text>
              </VStack>
            </HStack>

            <NextLink href="/book" passHref>
              <Box 
                as="button"
                bg="#56756D" 
                color="white" 
                px={8} 
                py={4} 
                borderRadius="full" 
                fontWeight="700" 
                fontSize="sm"
                transition="all 0.3s"
                _hover={{ bg: "#C9A960", transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(201, 169, 96, 0.3)" }}
              >
                <HStack spacing={2}>
                  <Text>Start Your Journey</Text>
                  <Icon as={FiArrowRight} />
                </HStack>
              </Box>
            </NextLink>
          </Stack>
        </Box>

        <Divider borderColor="whiteAlpha.100" />

        {/* 📜 Bottom Bar */}
        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" pt={8} spacing={4}>
          <Text fontSize="xs" color="whiteAlpha.500" fontWeight="500">
            © {new Date().getFullYear()} MLC Health & Wellness Centre. All rights reserved.
          </Text>
          <HStack spacing={8}>
            <Link fontSize="xs" color="whiteAlpha.500" _hover={{ color: "white" }}>Privacy Policy</Link>
            <Link fontSize="xs" color="whiteAlpha.500" _hover={{ color: "white" }}>Terms of Service</Link>
            <Link fontSize="xs" color="whiteAlpha.500" _hover={{ color: "white" }}>Cookie Settings</Link>
          </HStack>
          <Box />
        </Stack>
      </Container>
    </Box>
  );
}

