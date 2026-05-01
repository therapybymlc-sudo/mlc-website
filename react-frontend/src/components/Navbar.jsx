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
  Divider,
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
  FiSettings, 
  FiLogOut, 
  FiLayout, 
  FiCreditCard,
  FiClock,
  FiBookOpen,
  FiTarget,
  FiArrowRight
} from "react-icons/fi";
import NextLink from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const logoSrc = "/logo_tra.png";

// Desktop Order: Home | About | Find a Therapist | ✦ MLC Ecosystem | For Therapists ˅ | Services ˅ | Resources ˅
const navLinks = [
  { label: "Home", href: "/", weight: "support" },
  { label: "About", href: "/about", weight: "support" },
  { label: "Find a Therapist", href: "/therapists/discovery", weight: "primary" },
  { label: "✦ MLC Ecosystem", href: "/ecosystem", weight: "brand", isEcosystem: true },
  { 
    label: "For Therapists", 
    href: "/therapists",
    weight: "secondary",
    subLinks: [
      { label: "Join as a Therapist", href: "/signup/therapist" },
      { label: "Therapist Directory", href: "/therapists/directory" },
      { label: "Supervisor Directory / Find a Supervisor", href: "/therapists/supervisors/directory" },
      { label: "MLC Pro", href: "/dashboard/therapist/subscription" },
      { label: "Therapist Community", href: "/dashboard/therapist/community" },
      { label: "Clinical Supervision", href: "/supervision" },
      { label: "Workshops & Circles", href: "/workshops" },
    ]
  },
  { 
    label: "Services", 
    href: "/services",
    weight: "support",
    subLinks: [
      { label: "Individual Therapy", href: "/individual-therapy" },
      { label: "Couples Therapy", href: "/couples-therapy" },
      { label: "Adolescent Therapy", href: "/adolescent-therapy" },
      { label: "Assessments", href: "/dashboard/client/resources" },
      { label: "Mindfulness Sessions", href: "/services" },
      { label: "Book a Session", href: "/book" },
    ]
  },
  { 
    label: "Resources", 
    href: "#",
    weight: "support",
    subLinks: [
      { label: "Blog", href: "/blog" },
      { label: "Feelings Wheel", href: "/feelings-wheel" },
      { label: "Therapy Quiz", href: "/quiz" },
      { label: "Mental Health Guides", href: "/dashboard/client/resources" },
    ]
  },
];

const EcosystemHoverMenu = ({ link, pathname, isActive }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box 
      onMouseEnter={onOpen} 
      onMouseLeave={onClose}
      position="relative" 
      display="inline-block"
      pb={4}
      mb="-16px"
    >
      <HStack spacing={1} cursor="pointer">
        <ChakraLink
          as={NextLink}
          href={link.href}
          fontWeight="700"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          fontSize="15px"
          letterSpacing="0.2px"
          color="#56756D"
          _hover={{ color: "#C9A960", textDecoration: "none" }}
          transition="all 0.2s ease"
          whiteSpace="nowrap"
        >
          {link.label}
        </ChakraLink>
      </HStack>
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="50%"
          transform="translateX(-50%)"
          bg="white"
          boxShadow="0 20px 40px rgba(0,0,0,0.12)"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="2xl"
          p={6}
          minW="450px"
          zIndex={1001}
          mt="-2px"
        >
          <VStack align="stretch" spacing={4}>
            <Text color="gray.600" fontSize="sm" lineHeight="tall">
              The first integrated therapy ecosystem in India — connecting clients, therapists, tools, supervision, and growth as a community in one place.
            </Text>
            <SimpleGrid columns={2} spacing={3} pl={2}>
              <Text fontSize="sm" fontWeight="600" color="#56756D">• Client Platform</Text>
              <Text fontSize="sm" fontWeight="600" color="#56756D">• Therapist Network</Text>
              <Text fontSize="sm" fontWeight="600" color="#56756D">• Supervisor Network</Text>
              <Text fontSize="sm" fontWeight="600" color="#56756D">• Tools & Resources</Text>
              <Text fontSize="sm" fontWeight="600" color="#56756D">• MLC Community</Text>
            </SimpleGrid>
            <Button
              as={NextLink}
              href="/ecosystem"
              bg="#56756D"
              color="white"
              size="sm"
              mt={2}
              borderRadius="full"
              rightIcon={<FiArrowRight />}
              _hover={{ bg: "#C9A960" }}
            >
              Explore the Ecosystem
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

const HoverMenu = ({ link, pathname, isActive }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const isSecondary = link.weight === "secondary";

  return (
    <Menu isOpen={isOpen} isLazy gutter={0} placement="bottom">
      <Box 
        onMouseEnter={onOpen} 
        onMouseLeave={onClose}
        position="relative" 
        display="inline-block"
        pb={4}
        mb="-16px"
      >
        <HStack spacing={1} cursor="pointer">
          <ChakraLink
            as={NextLink}
            href={link.href}
            fontWeight={isSecondary ? "600" : "500"}
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize="15px"
            letterSpacing="0.2px"
            color={isActive ? "#C9A960" : isSecondary ? "#2E2E2E" : "#555"}
            _hover={{ color: "#C9A960", textDecoration: "none" }}
            transition="all 0.2s ease"
            whiteSpace="nowrap"
          >
            {link.label}
          </ChakraLink>
          <MenuButton
            as={Box}
            p={1}
            color="gray.400"
            _hover={{ color: "#C9A960" }}
          >
            <ChevronDownIcon />
          </MenuButton>
        </HStack>
        <MenuList
          boxShadow="0 10px 30px rgba(0,0,0,0.1)"
          border="1px solid"
          borderColor="gray.50"
          borderRadius="xl"
          p={2}
          minW="180px"
          zIndex={1001}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          mt="-2px"
        >
          {link.subLinks.map((sub) => (
            <MenuItem
              key={sub.label}
              as={NextLink}
              href={sub.href}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="500"
              py={2.5}
              _hover={{ bg: "gray.50", color: "#C9A960" }}
              onClick={onClose}
            >
              {sub.label}
            </MenuItem>
          ))}
        </MenuList>
      </Box>
    </Menu>
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

  return (
    <Box
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(8px)"
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
        flexWrap="nowrap"
        gap={{ base: 3, md: 4 }}
        py={3}
      >
        {/* 🌿 Left Section: Logo & Name */}
        <HStack 
          as={NextLink} 
          href="/" 
          spacing={3} 
          alignItems="center" 
          flexShrink={0}
          _hover={{ textDecoration: "none" }}
        >
          <Image
            src={logoSrc}
            alt="MLC Health and Wellness Centre - Professional therapy services in India"
            boxSize={{ base: "40px", md: "50px" }}
          />
          <Box lineHeight="1.1" display={{ base: "none", sm: "block" }}>
            <Text
              fontFamily="'Forum', serif"
              fontWeight="400"
              fontSize={{ base: "md", md: "18px" }}
              color="#2E2E2E"
              letterSpacing="0.5px"
            >
              MLC Health and Wellness Centre
            </Text>
            <Text
              fontFamily="'Forum', serif"
              fontSize="12px"
              color="#56756D"
              letterSpacing="0.8px"
            >
              a place to feel, to heal, to become
            </Text>
          </Box>
        </HStack>

        {/* 🗺️ Middle Section: Desktop Nav Links */}
        <HStack
          spacing={{ base: 4, xl: 6 }}
          display={{ base: "none", lg: "flex" }}
          justify="center"
          align="center"
          flex="1"
          mx={4}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            
            if (link.isEcosystem) {
              return <EcosystemHoverMenu key={link.label} link={link} pathname={pathname} isActive={isActive} />;
            }
            
            if (link.subLinks) {
              return (
                <HoverMenu key={link.label} link={link} pathname={pathname} isActive={isActive} />
              );
            }

            if (link.weight === "primary") {
              return (
                <Button
                  as={NextLink}
                  key={link.label}
                  href={link.href}
                  bg="#56756D"
                  color="white"
                  fontWeight="600"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontSize="15px"
                  borderRadius="full"
                  px={5}
                  py={2}
                  _hover={{ bg: "#C9A960", transform: "translateY(-1px)", boxShadow: "sm" }}
                  transition="all 0.2s ease"
                  whiteSpace="nowrap"
                  height="auto"
                >
                  {link.label}
                </Button>
              )
            }

            return (
              <ChakraLink
                as={NextLink}
                key={link.label}
                href={link.href}
                fontWeight="500"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontSize="15px"
                letterSpacing="0.2px"
                color={isActive ? "#C9A960" : "#555"}
                _hover={{ color: "#C9A960", textDecoration: "none" }}
                transition="all 0.2s ease"
                whiteSpace="nowrap"
              >
                {link.label}
              </ChakraLink>
            )
          })}
        </HStack>

        {/* 👤 Right Section: Auth & Mobile Menu */}
        <HStack spacing={{ base: 2, md: 4 }} flexShrink={0}>
          {(isMounted && isLoaded) ? (
            isSignedIn ? (
              <Menu gutter={12} placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  borderRadius="full"
                  height="auto"
                  py={1.5}
                  px={{ base: 1, md: 2 }}
                  _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                >
                  <HStack spacing={2}>
                    <Avatar 
                      size="sm" 
                      name={user?.fullName || "User"} 
                      src={user?.imageUrl} 
                      border="2px solid"
                      borderColor="#A9CBB7"
                    />
                    <Text 
                      fontSize="sm" 
                      fontWeight="600" 
                      color="#2E2E2E"
                      display={{ base: "none", md: "block" }}
                    >
                      {user?.firstName || "Account"}
                    </Text>
                    <ChevronDownIcon color="gray.400" />
                  </HStack>
                </MenuButton>

                <MenuList
                  boxShadow="0 10px 30px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="xl"
                  p={2}
                  minW="240px"
                >
                  <Box px={4} py={3}>
                    <Text fontWeight="700" color="#2E2E2E" fontSize="sm">
                      {user?.fullName || "User Account"}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                  </Box>
                  
                  <MenuDivider />
                  
                  {(() => {
                    const therapistContext =
                      isTherapist ||
                      isAdmin ||
                      pathname.startsWith("/dashboard/therapist");
                    const dashboardBase = therapistContext ? "/dashboard/therapist" : "/dashboard/client";
                    
                    return (
                      <>
                  <MenuItem
                    as={NextLink}
                    href={dashboardBase}
                    borderRadius="lg"
                    icon={<Icon as={FiLayout} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    Dashboard
                  </MenuItem>
                  
                  <MenuItem
                    as={NextLink}
                    href={`${dashboardBase}/appointments`}
                    borderRadius="lg"
                    icon={<Icon as={FiClock} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    My Sessions
                  </MenuItem>

                  <MenuItem
                    as={NextLink}
                    href={`${dashboardBase}/profile`}
                    borderRadius="lg"
                    icon={<Icon as={FiUser} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    Profile
                  </MenuItem>

                  <MenuItem
                    as={NextLink}
                    href={`${dashboardBase}/settings`}
                    borderRadius="lg"
                    icon={<Icon as={FiSettings} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    Settings
                  </MenuItem>
                  </>
                  )
                })()}
                  
                  <MenuDivider />
                  
                  <MenuItem
                    onClick={() => signOut()}
                    borderRadius="lg"
                    icon={<Icon as={FiLogOut} boxSize={4} />}
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={2.5}
                  >
                    Log Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={3} display={{ base: "none", md: "flex" }}>
                <Button
                  as={NextLink}
                  href="/login"
                  variant="ghost"
                  fontWeight="600"
                  fontSize="sm"
                  color="#2E2E2E"
                  borderRadius="full"
                  _hover={{ bg: "gray.50" }}
                >
                  Login
                </Button>
                <Button
                  as={NextLink}
                  href="/signup/client"
                  bg="#56756D"
                  color="white"
                  fontWeight="600"
                  fontSize="sm"
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: "#C9A960", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(86, 117, 109, 0.2)" }}
                  transition="all 0.2s"
                >
                  Sign Up
                </Button>
              </HStack>
            )
          ) : (
            <Box w="100px" /> 
          )}

          <IconButton
            display={{ base: "flex", lg: "none" }}
            onClick={isOpen ? onClose : onOpen}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="ghost"
            aria-label="Toggle navigation"
            borderRadius="full"
          />
        </HStack>
      </Flex>

      {/* 📱 Mobile Drawer */}
      {isOpen && (
        <Box 
          display={{ lg: "none" }} 
          pb={4}
          maxH="calc(100vh - 75px)"
          overflowY="auto"
        >
          <VStack
            bg="white"
            align="stretch"
            spacing={0}
            px={4}
            py={4}
            borderRadius="xl"
            boxShadow="0 10px 40px rgba(0,0,0,0.1)"
            border="1px solid"
            borderColor="gray.100"
            mt={2}
          >
            {/* MLC Ecosystem Mobile Card */}
            <Box 
              as={NextLink}
              href="/ecosystem"
              bg="rgba(86, 117, 109, 0.05)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              borderRadius="xl"
              p={4}
              mb={4}
              onClick={onClose}
              _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
            >
              <Text fontWeight="700" color="#56756D" fontSize="lg" mb={1}>✦ MLC Ecosystem</Text>
              <Text fontSize="xs" color="gray.600">The first integrated therapy ecosystem in India.</Text>
            </Box>

            {navLinks.filter(l => !l.isEcosystem).map((link) => (
              <Box key={link.label}>
                <ChakraLink
                  as={NextLink}
                  href={link.href}
                  fontWeight={link.weight === "primary" ? "700" : "600"}
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  color={link.weight === "primary" ? "#56756D" : "#2E2E2E"}
                  py={3.5}
                  px={4}
                  display="block"
                  borderRadius="lg"
                  _hover={{ bg: "gray.50", color: "#C9A960" }}
                  onClick={link.subLinks ? undefined : onClose}
                >
                  {link.label}
                </ChakraLink>
                {link.subLinks && (
                  <VStack align="stretch" spacing={0} pl={6} mb={2}>
                    {link.subLinks.map((sub) => (
                      <ChakraLink
                        as={NextLink}
                        key={sub.label}
                        href={sub.href}
                        color="gray.600"
                        fontSize="sm"
                        py={2}
                        px={4}
                        borderRadius="md"
                        _hover={{ bg: "gray.50", color: "#2E2E2E" }}
                        onClick={onClose}
                      >
                        {sub.label}
                      </ChakraLink>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
            
            {!isSignedIn && (
              <>
                <Divider borderColor="gray.200" my={4} />
                <Button
                  as={NextLink}
                  href="/login"
                  variant="outline"
                  colorScheme="teal"
                  py={6}
                  mb={2}
                  onClick={onClose}
                  borderRadius="full"
                >
                  Login
                </Button>
                <Button
                  as={NextLink}
                  href="/signup/client"
                  bg="#56756D"
                  color="white"
                  py={6}
                  mb={4}
                  onClick={onClose}
                  borderRadius="full"
                  _hover={{ bg: "#C9A960" }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
