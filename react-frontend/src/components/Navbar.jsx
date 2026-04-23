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
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiLayout, 
  FiCreditCard,
  FiClock,
  FiBookOpen
} from "react-icons/fi";
import NextLink from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const logoSrc = "/logo_tra.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Find a Therapist", href: "/therapists/discovery" },
  { label: "For Therapists", href: "/therapists" },
  { label: "Meet the Team", href: "/meettheteam" },
  { label: "Book Now", href: "/book" },
  { label: "Contact Us", href: "/contactus" },
];

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
            alt="MLC Logo"
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
          spacing={{ base: 4, xl: 8 }}
          display={{ base: "none", lg: "flex" }}
          justify="center"
          flex="1"
          mx={4}
        >
          {navLinks.map((link) => {
            const isDiscovery = link.href === "/therapists/discovery";
            const isActive = pathname === link.href;
            return (
              <ChakraLink
                as={NextLink}
                key={link.label}
                href={link.href}
                fontWeight={isDiscovery ? "700" : "500"}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontSize="15px"
                letterSpacing="0.2px"
                color={isDiscovery ? "#56756D" : isActive ? "#C9A960" : "#212121"}
                bg={isDiscovery ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                px={isDiscovery ? 4 : 0}
                py={isDiscovery ? 2 : 0}
                borderRadius={isDiscovery ? "full" : "none"}
                _hover={{ 
                  color: "#C9A960", 
                  textDecoration: "none",
                  bg: isDiscovery ? "rgba(86, 117, 109, 0.15)" : "transparent"
                }}
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
                    const roles = user?.publicMetadata?.roles || [];
                    const dashboardBase = roles.includes("therapist") || roles.includes("admin") ? "/dashboard/therapist" : "/dashboard/client";
                    
                    return (
                      <>
                  <MenuItem
                    as={NextLink}
                    href="/dashboard"
                    borderRadius="lg"
                    icon={<Icon as={FiLayout} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    My Dashboard
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
                    My Appointments
                  </MenuItem>

                  <MenuItem
                    as={NextLink}
                    href={`${dashboardBase}/resources`}
                    borderRadius="lg"
                    icon={<Icon as={FiBookOpen} boxSize={4} color="#56756D" />}
                    _hover={{ bg: "gray.50", color: "#C9A960" }}
                    fontSize="sm"
                    fontWeight="600"
                    py={3}
                  >
                    Resources & Tools
                  </MenuItem>
                  {(roles.includes("therapist") || roles.includes("admin")) && (
                    <MenuItem
                      as={NextLink}
                      href="/dashboard/therapist/subscription"
                      borderRadius="lg"
                      icon={<Icon as={FiTarget} boxSize={4} color="#56756D" />}
                      _hover={{ bg: "gray.50", color: "#C9A960" }}
                      fontSize="sm"
                      fontWeight="600"
                      py={3}
                    >
                      Subscription
                    </MenuItem>
                  )}
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
                    Sign Out
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
                  Sign In
                </Button>
                <Menu gutter={10} placement="bottom-end">
                  <MenuButton
                    as={Button}
                    bg="#56756D"
                    color="white"
                    fontWeight="600"
                    fontSize="sm"
                    borderRadius="full"
                    px={6}
                    rightIcon={<ChevronDownIcon />}
                    _hover={{ bg: "#C9A960", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(86, 117, 109, 0.2)" }}
                    transition="all 0.2s"
                  >
                    Join MLC
                  </MenuButton>
                  <MenuList
                    boxShadow="0 10px 30px rgba(0,0,0,0.1)"
                    border="1px solid"
                    borderColor="gray.100"
                    borderRadius="xl"
                    p={2}
                    minW="220px"
                  >
                    <MenuItem
                      as={NextLink}
                      href="/therapist-apply"
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="600"
                      py={3}
                    >
                      Sign up as Therapist
                    </MenuItem>
                    <MenuItem
                      as={NextLink}
                      href="/signup/client"
                      borderRadius="lg"
                      fontSize="sm"
                      fontWeight="600"
                      py={3}
                    >
                      Sign up as Client
                    </MenuItem>
                  </MenuList>
                </Menu>
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
        <Box display={{ lg: "none" }} pb={4}>
          <VStack
            bg="#56756D"
            align="stretch"
            spacing={0}
            px={4}
            py={2}
            borderRadius="xl"
            boxShadow="xl"
          >
            {navLinks.map((link) => (
              <ChakraLink
                as={NextLink}
                key={link.label}
                href={link.href}
                fontWeight="medium"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="white"
                py={3.5}
                px={4}
                borderRadius="lg"
                _hover={{ bg: "rgba(255,255,255,0.1)", color: "#C9A960" }}
                onClick={onClose}
              >
                {link.label}
              </ChakraLink>
            ))}
            
            {!isSignedIn && (
              <>
                <Divider borderColor="whiteAlpha.300" my={2} />
                <Button
                  as={NextLink}
                  href="/login"
                  variant="ghost"
                  color="white"
                  justifyContent="flex-start"
                  py={6}
                  _active={{ bg: "whiteAlpha.100" }}
                  onClick={onClose}
                >
                  Sign In
                </Button>
                <Button
                  as={NextLink}
                  href="/therapist-apply"
                  bg="#C9A960"
                  color="#2E2E2E"
                  py={6}
                  mt={2}
                  onClick={onClose}
                >
                  Sign up as Therapist
                </Button>
                <Button
                  as={NextLink}
                  href="/signup/client"
                  bg="white"
                  color="#2E2E2E"
                  py={6}
                  mb={4}
                  onClick={onClose}
                >
                  Sign up as Client
                </Button>
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
