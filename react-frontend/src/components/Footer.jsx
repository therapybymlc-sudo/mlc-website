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
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { isAuthenticated, login, logout } = useAuth();

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
          <Link href="/contactus" _hover={{ color: "#A9CBB7" }}>
            Contact
          </Link>
          <Link href="/careers" _hover={{ color: "#A9CBB7" }}>
            Careers
          </Link>
        </HStack>

        <Divider borderColor="gray.600" />

        {/* 🌱 Contact Info */}
        <VStack align="start" spacing={2} fontFamily="'Lato', sans-serif">
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

        {/* 🧠 Therapist Login / Portal */}
        {!isAuthenticated ? (
          <Button
            size="sm"
            bg="#A9CBB7"
            color="black"
            borderRadius="full"
            _hover={{ bg: "#C9A960", color: "white" }}
            onClick={login}
          >
            Therapist Login
          </Button>
        ) : (
          <HStack spacing={3}>
            <Button
              as="a"
              href="/dashboard/therapist"
              size="sm"
              bg="#C9A960"
              color="white"
              borderRadius="full"
              _hover={{ bg: "#A9CBB7", color: "black" }}
            >
              Go to Portal
            </Button>
            <Button
              size="sm"
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ color: "white" }}
              onClick={logout}
            >
              Log out
            </Button>
          </HStack>
        )}

        {/* 🪶 Copyright */}
        <Text fontFamily="'Lato', sans-serif" fontSize="sm" pt={4}>
          © 2025 MLC Health & Wellness Centre | A space to feel, to heal, to
          become
        </Text>
      </VStack>
    </Box>
  );
}
