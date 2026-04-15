import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Image,
  Text,
  IconButton,
  useDisclosure,
  VStack,
  Divider,
  Avatar,
  Button,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const logoSrc = "/logo_tra.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "For Therapists", href: "/therapists" },
  { label: "Meet the Team", href: "/meettheteam" },
  { label: "Book Now", href: "/book" },
  { label: "Contact Us", href: "/contactus" },
  { label: "Careers", href: "/careers" },
];

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <Box
      bg="rgba(255, 255, 255, 0.85)"
      backdropFilter="blur(6px)"
      px={{ base: 4, md: 8, lg: 10 }}
      boxShadow="sm"
      position="sticky"
      top="0"
      zIndex="1000"
      w="100%"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={{ base: 3, md: 4 }}
      >
        {/* 🌿 Top-left Dashboard / Login + Logo */}
        <HStack
          spacing={3}
          alignItems="center"
          flexShrink={0}
          maxW={{ base: "100%", md: "auto" }}
          py={3}
        >
          {isAuthenticated ? (
            <HStack spacing={2}>
              <Avatar size="sm" src="/logo_tra.png" name="Dashboard" />
              <Button
                as={Link}
                to="/dashboard"
                size="sm"
                variant="ghost"
                fontWeight="600"
                borderRadius="full"
              >
                Your Dashboard
              </Button>
              <Button size="xs" variant="outline" onClick={logout}>
                Log out
              </Button>
            </HStack>
          ) : (
            <HStack spacing={2}>
              <Avatar size="sm" src="/logo_tra.png" name="Sign in" />
              <Button
                as={Link}
                to="/login"
                size="sm"
                variant="ghost"
                fontWeight="600"
                borderRadius="full"
              >
                Sign in
              </Button>
            </HStack>
          )}

          <HStack spacing={3} alignItems="center">
            <Image
              src={logoSrc}
              alt="MLC Logo"
              boxSize={{ base: "44px", md: "55px" }}
            />
            <Box lineHeight="1.1" whiteSpace={{ base: "normal", md: "nowrap" }} minW={0}>
              <Text
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
                fontSize={{ base: "sm", sm: "md", md: "lg" }}
                color="#2E2E2E"
                letterSpacing="-0.2px"
              >
                MLC Health & Wellness Centre
              </Text>
              <Text
                fontFamily="'Inter', sans-serif"
                fontSize={{ base: "xs", sm: "sm" }}
                color="#56756D"
                mt={0.5}
                display={{ base: "none", sm: "block" }}
              >
                A space to feel, to heal, to become
              </Text>
            </Box>
          </HStack>
        </HStack>

        <HStack
          spacing={{ base: 4, md: 8 }}
          flexWrap="wrap"
          justify="flex-end"
          display={{ base: "none", md: "flex" }}
          flex="1"
        >
          {navLinks.map((link) => (
            <ChakraLink
              as={Link}
              key={link.label}
              to={link.href}
              fontWeight="600"
              fontFamily="'Inter', sans-serif"
              fontSize="clamp(0.9375rem, 0.9rem + 0.15vw, 1rem)"
              letterSpacing="0.2px"
              color="rgba(46, 46, 46, 0.9)"
              _hover={{ color: "#A9CBB7", textDecoration: "none" }}
              transition="color 200ms ease"
              whiteSpace="nowrap"
              py={4}
              display="inline-flex"
              alignItems="center"
            >
              {link.label}
            </ChakraLink>
          ))}
        </HStack>

        {/* 📱 Mobile Menu Icon */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          aria-label="Toggle navigation"
        />
      </Flex>

      {/* 📱 Mobile Drawer */}
      {isOpen && (
        <VStack
          bg="#3C5750"
          align="flex-start"
          mt={4}
          spacing={2}
          display={{ md: "none" }}
          px={6}
          py={5}
          borderRadius="md"
          boxShadow="xl"
        >
          {navLinks.map((link) => (
            <Box key={link.label} w="100%">
              <ChakraLink
                as={Link}
                to={link.href}
                fontWeight="medium"
                fontFamily="'Inter', sans-serif"
                color="white"
                display="block"
                textAlign="left"
                py={3}
                px={2}
                borderRadius="md"
                w="100%"
                _hover={{ bg: "rgba(255,255,255,0.1)", color: "#C9A960" }}
                transition="all 0.2s ease"
                onClick={onClose}
              >
                {link.label}
              </ChakraLink>
            </Box>
          ))}

          <Divider borderColor="rgba(255,255,255,0.2)" />
        </VStack>
      )}
    </Box>
  );
}
