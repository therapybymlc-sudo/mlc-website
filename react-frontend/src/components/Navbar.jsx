'use client'

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
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  SimpleGrid
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { 
  FiUser, 
  FiLogOut, 
  FiLayout, 
  FiClock,
  FiTarget,
  FiArrowRight
} from "react-icons/fi";
import NextLink from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const logoSrc = "/logo_tra.png";

const navLinks = [
  { label: "Home", href: "/" },
  { 
    label: "Services", 
    href: "/services",
    subLinks: [
      { label: "Individual Therapy", href: "/individual-therapy" },
      { label: "Couples Therapy", href: "/couples-therapy" },
      { label: "Adolescent Therapy", href: "/adolescent-therapy" },
      { label: "Clinical Assessments", href: "/dashboard/client/resources" },
      { label: "Mindfulness Sessions", href: "/services" },
      { label: "Book a Session", href: "/book" },
    ]
  },
  { 
    label: "Ecosystem", 
    href: "/ecosystem",
    subLinks: [
      { label: "The Ecosystem Blueprint", href: "/ecosystem" },
      { label: "Client Care Platform", href: "/dashboard/client" },
      { label: "Therapist Practice Suite", href: "/therapists" },
      { label: "Clinical Supervision Network", href: "/supervision" },
    ]
  },
  { 
    label: "For Therapists", 
    href: "/therapists",
    subLinks: [
      { label: "Join as a Therapist", href: "/signup/therapist" },
      { label: "Clinical Supervision", href: "/supervision" },
      { label: "Therapist Directory", href: "/therapists/directory" },
      { label: "Supervisor Directory", href: "/therapists/supervisors/directory" },
      { label: "MLC Pro Suite", href: "/dashboard/therapist/subscription" },
      { label: "Therapist Community", href: "/dashboard/therapist/community" },
      { label: "Workshops & Circles", href: "/workshops" },
    ]
  },
  { 
    label: "Resources", 
    href: "/blog",
    subLinks: [
      { label: "Clinical Blog", href: "/blog" },
      { label: "Feelings Wheel", href: "/feelings-wheel" },
      { label: "Therapy Match Quiz", href: "/therapists/discovery" },
      { label: "Mental Health Guides", href: "/dashboard/client/resources" },
    ]
  },
  { label: "About", href: "/about" },
];

// 🌿 Zen-Engineered Dropdown Component (Flawless anchoring, no disappearing on hover gap)
const NavDropdown = ({ link, pathname }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const timeoutRef = useRef(null);
  const isActive = pathname === link.href || link.subLinks?.some(s => pathname === s.href);

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onOpen();
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onClose();
  };

  return (
    <Box
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      position="relative"
      display="inline-block"
      py={1}
    >
      <Menu isOpen={isOpen} isLazy gutter={4} placement="bottom-start">
        <MenuButton
          as={Button}
          variant="unstyled"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          height="38px"
          px={3.5}
          borderRadius="full"
          fontWeight={isActive ? "600" : "500"}
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="14px"
          color={isActive ? "#56756D" : "#374A43"}
          bg={isActive ? "rgba(86, 117, 109, 0.09)" : (isOpen ? "rgba(86, 117, 109, 0.06)" : "transparent")}
          _hover={{ bg: "rgba(86, 117, 109, 0.07)", color: "#263A33" }}
          _focus={{ boxShadow: "none", outline: "none" }}
          _focusVisible={{ boxShadow: "0 0 0 2px rgba(86, 117, 109, 0.35)", outline: "none" }}
          transition="all 0.18s ease"
          cursor="pointer"
        >
          <HStack spacing={1.5} align="center">
            <Text as="span">{link.label}</Text>
            <ChevronDownIcon
              boxSize="13px"
              color={isOpen ? "#56756D" : "#7A8D86"}
              transform={isOpen ? "rotate(180deg)" : "none"}
              transition="transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
            />
          </HStack>
        </MenuButton>

        <MenuList
          boxShadow="0 20px 45px -8px rgba(38, 58, 51, 0.12), 0 6px 18px -4px rgba(0, 0, 0, 0.04)"
          borderRadius="18px"
          p={2.5}
          minW="240px"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.14)"
          bg="rgba(255, 255, 255, 0.98)"
          backdropFilter="blur(20px)"
          zIndex={1200}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          _focus={{ boxShadow: "none", outline: "none" }}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: "-10px",
            left: 0,
            right: 0,
            height: "12px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {link.subLinks.map((sub) => {
            const isSubActive = pathname === sub.href;
            return (
              <MenuItem
                key={sub.label}
                as={NextLink}
                href={sub.href}
                borderRadius="10px"
                fontSize="13.5px"
                fontFamily="'Inter', sans-serif"
                fontWeight={isSubActive ? "600" : "500"}
                py={2.5}
                px={3.5}
                color={isSubActive ? "#56756D" : "#2E3E37"}
                bg={isSubActive ? "#F4F7F5" : "transparent"}
                _hover={{ bg: "#F4F7F5", color: "#56756D", transform: "translateX(2px)" }}
                _focus={{ bg: "#F4F7F5", color: "#56756D", outline: "none" }}
                transition="all 0.15s ease"
                onClick={handleItemClick}
              >
                {sub.label}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </Box>
  );
};

// 🌿 Unified Nav Link (Identical baseline, height, padding, and zero blue focus box)
const NavItem = ({ label, href, pathname }) => {
  const isActive = pathname === href;
  return (
    <Button
      as={NextLink}
      href={href}
      variant="unstyled"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      height="38px"
      px={3.5}
      borderRadius="full"
      fontWeight={isActive ? "600" : "500"}
      fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      fontSize="14px"
      color={isActive ? "#56756D" : "#374A43"}
      bg={isActive ? "rgba(86, 117, 109, 0.09)" : "transparent"}
      _hover={{ bg: "rgba(86, 117, 109, 0.07)", color: "#263A33", textDecoration: "none" }}
      _focus={{ boxShadow: "none", outline: "none" }}
      _focusVisible={{ boxShadow: "0 0 0 2px rgba(86, 117, 109, 0.35)", outline: "none" }}
      transition="all 0.18s ease"
      cursor="pointer"
    >
      {label}
    </Button>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { isAdmin, isTherapist } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const therapistContext = isTherapist || isAdmin || pathname.startsWith("/dashboard/therapist");
  const dashboardBase = therapistContext ? "/dashboard/therapist" : "/dashboard/client";

  return (
    <Box 
      bg="rgba(253, 251, 250, 0.94)" 
      backdropFilter="blur(20px)" 
      px={{ base: 4, md: 8, xl: 12 }} 
      borderBottom="1px solid"
      borderColor="rgba(86, 117, 109, 0.08)"
      boxShadow="0 2px 20px rgba(0, 0, 0, 0.02)" 
      position="sticky" 
      top="0" 
      zIndex="1000" 
      w="100%"
      transition="all 0.3s ease"
    >
      <Flex 
        alignItems="center" 
        justifyContent="space-between" 
        flexWrap="nowrap" 
        height="74px" 
        maxW="1600px" 
        mx="auto"
      >
        
        {/* 🌿 Left Section: Refined Brand Emblem & Identity */}
        <HStack 
          as={NextLink} 
          href="/" 
          spacing={3.5} 
          _hover={{ textDecoration: "none" }} 
          _focus={{ boxShadow: "none", outline: "none" }}
          flexShrink={0} 
          mr={6}
        >
          <Box 
            p="2px" 
            borderRadius="full" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.15)"
            bg="white"
            boxShadow="0 2px 6px rgba(0, 0, 0, 0.03)"
          >
            <Image src={logoSrc} alt="MLC Centre" boxSize={{ base: "38px", md: "42px" }} />
          </Box>
          <Box lineHeight="1.15" display={{ base: "none", lg: "block" }}>
            <Text 
              fontFamily="'Playfair Display', var(--font-playfair), serif" 
              fontWeight="600" 
              fontSize="16px" 
              color="#263A33" 
              letterSpacing="-0.01em"
              whiteSpace="nowrap"
            >
              MLC Health and Wellness Centre
            </Text>
            <Text 
              fontFamily="'Playfair Display', var(--font-playfair), serif" 
              fontSize="12px" 
              color="#56756D" 
              letterSpacing="0.02em"
              mt="1px"
              whiteSpace="nowrap"
            >
              a place to feel, to heal, to become
            </Text>
          </Box>
        </HStack>

        {/* 🗺️ Center Section: UNIFIED, BALANCED NAVIGATION LINKS */}
        <HStack 
          display={{ base: "none", lg: "flex" }} 
          flex="1" 
          justify="center" 
          spacing={{ lg: 1, xl: 1.5 }}
          px={2}
        >
          <NavItem label="Home" href="/" pathname={pathname} />
          <NavDropdown link={navLinks.find(l => l.label === "Services")} pathname={pathname} />
          <NavDropdown link={navLinks.find(l => l.label === "Ecosystem")} pathname={pathname} />
          <NavDropdown link={navLinks.find(l => l.label === "For Therapists")} pathname={pathname} />
          <NavDropdown link={navLinks.find(l => l.label === "Resources")} pathname={pathname} />
          <NavItem label="About" href="/about" pathname={pathname} />
        </HStack>

        {/* 👤 Right Section: Auth & Distinct Primary Call-To-Action */}
        <HStack spacing={3} flexShrink={0} ml={6}>
          {isMounted && isLoaded && isSignedIn ? (
            <HStack spacing={3}>
              <Button
                as={NextLink}
                href="/therapists/discovery"
                height="40px"
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={7}
                minW="160px"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="0.01em"
                boxShadow="0 2px 10px rgba(86, 117, 109, 0.25)"
                _hover={{ bg: "#425C55", transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(86, 117, 109, 0.35)" }}
                _focus={{ boxShadow: "none", outline: "none" }}
                transition="all 0.2s ease"
                whiteSpace="nowrap"
                display={{ base: "none", xl: "inline-flex" }}
                alignItems="center"
                justifyContent="center"
              >
                Find a Therapist
              </Button>
              <Menu gutter={10} placement="bottom-end">
                <MenuButton 
                  as={Button} 
                  variant="ghost" 
                  borderRadius="full" 
                  p={1}
                  _focus={{ boxShadow: "none", outline: "none" }}
                >
                  <Avatar size="sm" name={user?.fullName} src={user?.imageUrl} border="2px solid" borderColor="#A9CBB7" />
                </MenuButton>
                <MenuList 
                  boxShadow="0 20px 45px -8px rgba(38, 58, 51, 0.12)" 
                  borderRadius="18px" 
                  p={2.5} 
                  minW="240px" 
                  zIndex={1200}
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.14)"
                  bg="white"
                >
                  <Box px={4} py={3}>
                    <Text fontWeight="700" fontSize="sm" color="#263A33">{user?.fullName}</Text>
                    <Text fontSize="xs" color="rgba(46,46,46,0.6)">{user?.primaryEmailAddress?.emailAddress}</Text>
                  </Box>
                  <MenuDivider borderColor="gray.100" />
                  <MenuItem as={NextLink} href="/dashboard" fontWeight="500" fontSize="13.5px" borderRadius="10px" py={2.5} icon={<Icon as={FiLayout} color="#56756D" />}>Dashboard</MenuItem>
                  <MenuItem as={NextLink} href={`${dashboardBase}/appointments`} fontWeight="500" fontSize="13.5px" borderRadius="10px" py={2.5} icon={<Icon as={FiClock} color="#56756D" />}>My Sessions</MenuItem>
                  <MenuItem as={NextLink} href={`${dashboardBase}/profile`} fontWeight="500" fontSize="13.5px" borderRadius="10px" py={2.5} icon={<Icon as={FiUser} color="#56756D" />}>Profile</MenuItem>
                  {(isAdmin || isTherapist) && (
                    <MenuItem as={NextLink} href="/dashboard/therapist/subscription" fontWeight="500" fontSize="13.5px" borderRadius="10px" py={2.5} icon={<Icon as={FiTarget} color="#56756D" />}>MLC Pro Suite</MenuItem>
                  )}
                  <MenuDivider borderColor="gray.100" />
                  <MenuItem onClick={() => signOut()} color="red.500" fontWeight="500" fontSize="13.5px" borderRadius="10px" py={2.5} icon={<Icon as={FiLogOut} />}>Log Out</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <HStack spacing={3} display={{ base: "none", md: "flex" }} align="center">
              <Button
                as={NextLink}
                href="/login"
                height="40px"
                px={6}
                minW="96px"
                bg="white"
                color="#263A33"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.16)"
                borderRadius="full"
                fontSize="14px"
                fontWeight="500"
                boxShadow="0 2px 10px rgba(86, 117, 109, 0.08)"
                _hover={{
                  bg: "white",
                  borderColor: "rgba(86, 117, 109, 0.35)",
                  boxShadow: "0 6px 18px rgba(86, 117, 109, 0.14)",
                  transform: "translateY(-1px)",
                  color: "#1E2D27"
                }}
                _focus={{ boxShadow: "none", outline: "none" }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                whiteSpace="nowrap"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                Log In
              </Button>
              <Button 
                as={NextLink} 
                href="/therapists/discovery" 
                height="40px"
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                px={7} 
                minW="160px"
                fontSize="14px"
                fontWeight="600"
                letterSpacing="0.01em"
                boxShadow="0 2px 10px rgba(86, 117, 109, 0.28)"
                _hover={{ bg: "#425C55", transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(86, 117, 109, 0.35)" }} 
                _focus={{ boxShadow: "none", outline: "none" }}
                transition="all 0.2s ease"
                whiteSpace="nowrap"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                Find a Therapist
              </Button>
            </HStack>
          )}

          <IconButton 
            display={{ base: "flex", lg: "none" }} 
            onClick={isOpen ? onClose : onOpen} 
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />} 
            variant="ghost" 
            borderRadius="full" 
            aria-label="Toggle navigation"
            _focus={{ boxShadow: "none", outline: "none" }}
          />
        </HStack>
      </Flex>

      {/* 📱 Mobile Drawer */}
      {isOpen && (
        <Box display={{ lg: "none" }} pb={6} maxH="85vh" overflowY="auto">
          <VStack bg="white" align="stretch" spacing={0} px={4} py={4} borderRadius="2xl" boxShadow="xl" border="1px solid" borderColor="gray.100" mt={2}>
            {isMounted && isLoaded && isSignedIn ? (
                <Box mb={4} p={4} bg="#F4F7F5" borderRadius="16px">
                   <HStack mb={3}>
                      <Avatar size="sm" name={user?.fullName} src={user?.imageUrl} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="700" fontSize="sm" color="#263A33">{user?.fullName}</Text>
                        <Text fontSize="xs" color="rgba(46,46,46,0.6)">Logged in</Text>
                      </VStack>
                   </HStack>
                   <SimpleGrid columns={2} spacing={2}>
                      <Button as={NextLink} href="/dashboard" size="sm" variant="outline" borderRadius="full" onClick={onClose}>Dashboard</Button>
                      <Button as={NextLink} href={`${dashboardBase}/profile`} size="sm" variant="outline" borderRadius="full" onClick={onClose}>Profile</Button>
                   </SimpleGrid>
                   <Button onClick={() => signOut()} w="full" mt={2} size="sm" colorScheme="red" variant="ghost" borderRadius="full">Log Out</Button>
                </Box>
              ) : (
                <HStack spacing={3} mb={4}>
                   <Button as={NextLink} href="/login" flex="1" size="md" variant="outline" borderRadius="full" onClick={onClose}>Log In</Button>
                   <Button as={NextLink} href="/therapists/discovery" flex="1" size="md" bg="#56756D" color="white" borderRadius="full" onClick={onClose}>Find Therapist</Button>
                </HStack>
              )
            }

            {navLinks.map((link) => (
              <Box key={link.label} py={1}>
                {link.subLinks ? (
                  <Box py={2}>
                    <Text fontWeight="600" px={3} py={1} color="#56756D" fontSize="sm">
                      {link.label}
                    </Text>
                    <VStack align="stretch" spacing={0} pl={3}>
                      {link.subLinks.map((sub) => (
                        <ChakraLink 
                          as={NextLink} 
                          key={sub.label} 
                          href={sub.href} 
                          color="rgba(46,46,46,0.75)" 
                          fontSize="sm" 
                          py={2} 
                          px={3} 
                          borderRadius="8px" 
                          _hover={{ bg: "#F4F7F5", color: "#56756D" }} 
                          onClick={onClose}
                        >
                          {sub.label}
                        </ChakraLink>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <ChakraLink 
                    as={NextLink} 
                    href={link.href} 
                    fontWeight="600" 
                    py={2.5} 
                    px={3} 
                    display="block" 
                    color="gray.800" 
                    onClick={onClose}
                  >
                    {link.label}
                  </ChakraLink>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
