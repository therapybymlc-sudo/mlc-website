import {
  Box,
  VStack,
  HStack,
  Link,
  Text,
  Button,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <Box bg="#2E2E2E" color="white" py={10} px={{ base: 6, md: 16 }}>
      <VStack spacing={6} align="start" maxW="7xl" mx="auto">
        {/* 🔗 Top Links */}
        <HStack spacing={8} flexWrap="wrap">
          <Link href="/about" _hover={{ color: "#A9CBB7" }}>
            About
          </Link>
          <Link href="/services" _hover={{ color: "#A9CBB7" }}>
            Services
          </Link>
          <Link href="/meettheteam" _hover={{ color: "#A9CBB7" }}>
            Meet the Team
          </Link>
          <Link href="/book" _hover={{ color: "#A9CBB7" }}>
            Book Now
          </Link>
          <Link href="/signup/client" _hover={{ color: "#A9CBB7" }}>
            Client Sign Up
          </Link>
          <Link href="/therapist-apply" _hover={{ color: "#A9CBB7" }}>
            Therapist Apply
          </Link>
          <Link href="/contactus" _hover={{ color: "#A9CBB7" }}>
            Contact
          </Link>
          <Link href="/careers" _hover={{ color: "#A9CBB7" }}>
            Careers
          </Link>
        </HStack>

        <Divider borderColor="gray.600" />

        {/* 🌱 Contact Info */}
        <VStack align="start" spacing={2} fontFamily="'Inter', sans-serif">
          <Text>
            Email:{" "}
            <Link href="mailto:therapy@mlchealth.in" color="#A9CBB7">
              therapy@mlchealth.in
            </Link>
          </Text>
          <Text>Location: Remote | Online Across India</Text>
          <HStack spacing={4}>
            <IconButton
              as="a"
              href="https://www.instagram.com/mlc_healthandwellness/"
              aria-label="Instagram"
              icon={<FaInstagram />}
              bg="transparent"
              color="white"
              _hover={{ color: "#A9CBB7" }}
            />
            <IconButton
              as="a"
              href="https://www.linkedin.com/in/mlc-health-and-wellness-centre-9b35b6394/"
              aria-label="LinkedIn"
              icon={<FaLinkedin />}
              bg="transparent"
              color="white"
              _hover={{ color: "#A9CBB7" }}
            />
          </HStack>
        </VStack>

        <Divider borderColor="gray.600" />

        {/* 🪶 Copyright */}
        <Text fontFamily="'Inter', sans-serif" fontSize="sm" pt={4}>
          © 2025 MLC Health & Wellness Centre | A space to feel, to heal, to
          become
        </Text>
      </VStack>
    </Box>
  );
}
