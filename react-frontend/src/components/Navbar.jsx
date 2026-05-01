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
  FiClock,
  FiArrowRight,
  FiTarget
} from "react-icons/fi";
import NextLink from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const logoSrc = "/logo_tra.png";

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
      mx={{ lg: 7, xl: 8 }}
    >
      <HStack spacing={1} cursor="pointer">
        <ChakraLink
          as={NextLink}
          href={link.href}
          fontWeight="600"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          fontSize="15px"
          letterSpacing="0.2px"
          color="#56756D"
          _hover={{ color: "#C9A960", textDecoration: "none" }}
          transition="all 0.3s ease"
          whiteSpace="nowrap"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            width: '0%',
            height: '2px',
            bottom: '-4px',
            left: '0',
            bg: '#C9A960',
            transition: 'width 0.3s'
          }}
          sx={{
            "&:hover::after": {
              width: '100%'
            }
          }}
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
              Explore the Ecosystem →
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

  if (isSecondary) {
    return (
      <Menu isOpen={isOpen} isLazy gutter={0} placement="bottom">
        <Box onMouseEnter={onOpen} onMouseLeave={onClose} position="relative" display="inline-block" pb={4} mb="-16px">
          <MenuButton
            as={Button}
            variant="ghost"
            bg="rgba(86, 117, 109, 0.12)"
            color="#56756D"
            fontWeight="600"
            fontSize="15px"
            borderRadius="xl"
            px={6}
            height="44px"
            _hover={{ bg: "rgba(86, 117, 109, 0.2)" }}
            rightIcon={<ChevronDownIcon />}
          >
            {link.label}
          </MenuButton>
          <MenuList boxShadow="xl" borderRadius="xl" p={2} minW="220px" zIndex={1001} onMouseEnter={onOpen} onMouseLeave={onClose} mt="-2px">
            {link.subLinks.map((sub) => (
              <MenuItem key={sub.label} as={NextLink} href={sub.href} borderRadius="lg" fontSize="sm" fontWeight="500" py={2.5} _hover={{ bg: "gray.50", color: "#C9A960" }} onClick={onClose}>
                {sub.label}
              </MenuItem>
            ))}
          </MenuList>
        </Box>
      </Menu>
    );
  }

  return (
    <Menu isOpen={isOpen} isLazy gutter={0} placement="bottom">
      <Box onMouseEnter={onOpen} onMouseLeave={onClose} position="relative" display="inline-block" pb={4} mb="-16px">
        <HStack spacing={1} cursor="pointer">
          <ChakraLink as={NextLink} href={link.href} fontWeight="500" fontFamily="'Inter', sans-serif" fontSize="15px" color={isActive ? "#C9A960" : "gray.600"} _hover={{ color: "#C9A960", textDecoration: "none" }} transition="all 0.2s" whiteSpace="nowrap">
            {link.label}
          </ChakraLink>
          <ChevronDownIcon color="gray.400" />
        </HStack>
        <MenuList boxShadow="xl" borderRadius="xl" p={2} minW="180px" zIndex={1001} onMouseEnter={onOpen} onMouseLeave={onClose} mt="-2px">
          {link.subLinks.map((sub) => (
            <MenuItem key={sub.label} as={NextLink} href={sub.href} borderRadius="lg" fontSize="sm" fontWeight="500" py={2.5} _hover={{ bg: "gray.50", color: "#C9A960" }} onClick={onClose}>
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

  // Determine dashboard paths
  const therapistContext = isTherapist || isAdmin || pathname.startsWith("/dashboard/therapist");
  const dashboardBase = therapistContext ? "/dashboard/therapist" : "/dashboard/client";

  return (
    <Box bg="rgba(255, 255, 255, 0.98)" backdropFilter="blur(10px)" px={{ base: 4, md: 8, lg: 10 }} boxShadow="sm" position="sticky" top="0" zIndex="1000" w="100%">
      <Flex alignItems="center" justifyContent="space-between" flexWrap="nowrap" py={3}>
        
        {/* 🌿 Left Section: Logo, Home, About */}
        <HStack spacing={10} flex="1">
          <HStack as={NextLink} href="/" spacing={3} _hover={{ textDecoration: "none" }} flexShrink={0}>
            <Image src={logoSrc} alt="MLC Centre" boxSize={{ base: "40px", md: "50px" }} />
            <Box lineHeight="1.1" display={{ base: "none", sm: "block" }}>
              <Text fontFamily="'Forum', serif" fontWeight="400" fontSize="18px" color="#2E2E2E">MLC Health and Wellness Centre</Text>
              <Text fontFamily="'Forum', serif" fontSize="12px" color="#56756D">a place to feel, to heal, to become</Text>
            </Box>
          </HStack>

          <HStack spacing={8} display={{ base: "none", lg: "flex" }}>
            {navLinks.filter(l => l.weight === "support" && !l.subLinks).map((link) => (
              <ChakraLink key={link.label} as={NextLink} href={link.href} fontWeight="400" fontSize="15px" color={pathname === link.href ? "#C9A960" : "gray.400"} _hover={{ color: "#C9A960", textDecoration: "none" }}>
                {link.label}
              </ChakraLink>
            ))}
          </HStack>
        </HStack>

        {/* 🗺️ Center Section: The Core Trio */}
        <HStack spacing={0} display={{ base: "none", lg: "flex" }} flex="2" justify="center">
          <Button as={NextLink} href="/therapists/discovery" bg="#56756D" color="white" fontWeight="700" fontSize="15px" borderRadius="full" px={7} height="44px" _hover={{ bg: "#4a645d", transform: "translateY(-1px)", boxShadow: "lg" }} transition="all 0.2s">
            Find a Therapist
          </Button>
          <EcosystemHoverMenu link={navLinks.find(l => l.isEcosystem)} pathname={pathname} />
          <HoverMenu link={navLinks.find(l => l.weight === "secondary")} pathname={pathname} />
        </HStack>

        {/* 👤 Right Section: Services, Resources, Auth */}
        <HStack spacing={8} flex="1" justify="flex-end">
          <HStack spacing={6} display={{ base: "none", lg: "flex" }}>
            {navLinks.filter(l => l.weight === "support" && l.subLinks).map((link) => (
              <HoverMenu key={link.label} link={link} pathname={pathname} />
            ))}
          </HStack>

          {isMounted && isLoaded && (
            isSignedIn ? (
              <Menu gutter={12} placement="bottom-end">
                <MenuButton as={Button} variant="ghost" borderRadius="full" p={1}>
                  <Avatar size="sm" name={user?.fullName} src={user?.imageUrl} border="2px solid" borderColor="#A9CBB7" />
                </MenuButton>
                <MenuList boxShadow="xl" borderRadius="xl" p={2} minW="260px">
                  <Box px={4} py={3}><Text fontWeight="700" fontSize="sm">{user?.fullName}</Text><Text fontSize="xs" color="gray.500">{user?.primaryEmailAddress?.emailAddress}</Text></Box>
                  <MenuDivider />
                  <MenuItem as={NextLink} href="/dashboard" fontWeight="600" icon={<Icon as={FiLayout} color="#56756D" />}>Dashboard</MenuItem>
                  <MenuItem as={NextLink} href={`${dashboardBase}/appointments`} fontWeight="600" icon={<Icon as={FiClock} color="#56756D" />}>My Sessions</MenuItem>
                  <MenuItem as={NextLink} href={`${dashboardBase}/profile`} fontWeight="600" icon={<Icon as={FiUser} color="#56756D" />}>Profile</MenuItem>
                  <MenuItem as={NextLink} href={`${dashboardBase}/settings`} fontWeight="600" icon={<Icon as={FiSettings} color="#56756D" />}>Settings</MenuItem>
                  {(isAdmin || isTherapist) && (
                    <MenuItem as={NextLink} href="/dashboard/therapist/subscription" fontWeight="600" icon={<Icon as={FiTarget} color="#56756D" />}>MLC Pro / Subscription</MenuItem>
                  )}
                  <MenuDivider />
                  <MenuItem onClick={() => signOut()} color="red.500" fontWeight="600" icon={<Icon as={FiLogOut} />}>Log Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                <ChakraLink as={NextLink} href="/login" fontSize="sm" fontWeight="600" color="gray.600">Login</ChakraLink>
                <Button as={NextLink} href="/signup/client" bg="#56756D" color="white" size="sm" borderRadius="full" px={5} _hover={{ bg: "#C9A960" }}>Sign Up</Button>
              </HStack>
            )
          )}

          <IconButton display={{ base: "flex", lg: "none" }} onClick={isOpen ? onClose : onOpen} icon={isOpen ? <CloseIcon /> : <HamburgerIcon />} variant="ghost" borderRadius="full" />
        </HStack>
      </Flex>

      {/* 📱 Mobile Drawer */}
      {isOpen && (
        <Box display={{ lg: "none" }} pb={6} maxH="85vh" overflowY="auto">
          <VStack bg="white" align="stretch" spacing={0} px={4} py={4} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor="gray.100" mt={2}>
            {/* Featured Ecosystem Mobile Card */}
            <Box as={NextLink} href="/ecosystem" bg="rgba(86, 117, 109, 0.05)" p={5} mb={4} borderRadius="xl" onClick={onClose} border="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
              <Text fontWeight="700" color="#56756D" fontSize="lg">✦ MLC Ecosystem</Text>
              <Text fontSize="xs" color="gray.600" mt={1}>The first integrated therapy ecosystem in India — tools, community, and care.</Text>
            </Box>

            {/* Auth Section for Mobile */}
            {isMounted && isLoaded && (
              isSignedIn ? (
                <Box mb={4} p={4} bg="gray.50" borderRadius="xl">
                   <HStack mb={3}>
                      <Avatar size="sm" name={user?.fullName} src={user?.imageUrl} />
                      <VStack align="start" spacing={0}>
                         <Text fontWeight="700" fontSize="sm">{user?.fullName}</Text>
                         <Text fontSize="xs" color="gray.500">Log out below</Text>
                      </VStack>
                   </HStack>
                   <SimpleGrid columns={2} spacing={2}>
                      <Button as={NextLink} href="/dashboard" size="sm" variant="outline" onClick={onClose}>Dashboard</Button>
                      <Button as={NextLink} href={`${dashboardBase}/profile`} size="sm" variant="outline" onClick={onClose}>Profile</Button>
                      <Button onClick={() => signOut()} size="sm" colorScheme="red" variant="ghost">Log Out</Button>
                   </SimpleGrid>
                </Box>
              ) : (
                <HStack spacing={3} mb={4}>
                   <Button as={NextLink} href="/login" flex="1" size="md" variant="outline" borderRadius="full" onClick={onClose}>Login</Button>
                   <Button as={NextLink} href="/signup/client" flex="1" size="md" bg="#56756D" color="white" borderRadius="full" onClick={onClose}>Sign Up</Button>
                </HStack>
              )
            )}

            {navLinks.filter(l => !l.isEcosystem).map((link) => (
              <Box key={link.label}>
                <ChakraLink as={NextLink} href={link.href} fontWeight="600" py={3.5} px={4} display="block" color={link.weight === "primary" ? "#56756D" : "gray.800"} onClick={link.subLinks ? undefined : onClose}>{link.label}</ChakraLink>
                {link.subLinks && (
                  <VStack align="stretch" spacing={0} pl={6} mb={2}>
                    {link.subLinks.map((sub) => (
                      <ChakraLink as={NextLink} key={sub.label} href={sub.href} color="gray.500" fontSize="sm" py={2.5} px={4} borderRadius="md" _hover={{ bg: "gray.50" }} onClick={onClose}>{sub.label}</ChakraLink>
                    ))}
                  </VStack>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
