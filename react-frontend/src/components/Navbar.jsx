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
  FiUserPlus
} from "react-icons/fi";
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
  const { isAuthenticated, login, logout, user } = useAuth();

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
          as={Link} 
          to="/" 
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
              fontFamily="'Inter', sans-serif"
              fontWeight="600"
              fontSize={{ base: "sm", md: "md" }}
              color="mlc.black"
              letterSpacing="-0.2px"
            >
              MLC Health
            </Text>
            <Text
              fontFamily="'Inter', sans-serif"
              fontSize="xs"
              color="mlc.greenDark"
              fontWeight="500"
            >
              Wellness Centre
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
          {navLinks.map((link) => (
            <ChakraLink
              as={Link}
              key={link.label}
              to={link.href}
              fontWeight="500"
              fontFamily="'Inter', sans-serif"
              fontSize="15px"
              letterSpacing="0.2px"
              color="mlc.blackSoft"
              _hover={{ color: "mlc.gold", textDecoration: "none" }}
              transition="all 0.2s ease"
              whiteSpace="nowrap"
            >
              {link.label}
            </ChakraLink>
          ))}
        </HStack>

        {/* 👤 Right Section: Auth & Mobile Menu */}
        <HStack spacing={{ base: 2, md: 4 }} flexShrink={0}>
          {isAuthenticated ? (
            <Menu gutter={12} placement="bottom-end">
              <MenuButton
                as={Button}
                variant="ghost"
                borderRadius="full"
                height="auto"
                py={1.5}
                px={{ base: 1, md: 2 }}
                _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                _active={{ bg: "rgba(169, 203, 183, 0.2)" }}
              >
                <HStack spacing={2}>
                  <Avatar 
                    size="sm" 
                    name={user?.fullName || "User"} 
                    src={user?.imageUrl} 
                    border="2px solid"
                    borderColor="mlc.green"
                  />
                  <Text 
                    fontSize="sm" 
                    fontWeight="600" 
                    color="mlc.black"
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
                  <Text fontWeight="700" color="mlc.black" fontSize="sm">
                    {user?.fullName || "User Account"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={0.5}>
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </Box>
                
                <MenuDivider />
                
                <MenuItem
                  as={Link}
                  to="/dashboard"
                  borderRadius="lg"
                  icon={<Icon as={FiLayout} boxSize={4} color="mlc.greenDark" />}
                  _hover={{ bg: "gray.50", color: "mlc.gold" }}
                  fontSize="sm"
                  fontWeight="500"
                  py={2.5}
                >
                  Dashboard
                </MenuItem>
                
                <MenuItem
                  as={Link}
                  to="/profile"
                  borderRadius="lg"
                  icon={<Icon as={FiSettings} boxSize={4} color="mlc.greenDark" />}
                  _hover={{ bg: "gray.50", color: "mlc.gold" }}
                  fontSize="sm"
                  fontWeight="500"
                  py={2.5}
                >
                  Profile & Settings
                </MenuItem>
                
                <MenuItem
                  as={Link}
                  to="/subscription"
                  borderRadius="lg"
                  icon={<Icon as={FiCreditCard} boxSize={4} color="mlc.greenDark" />}
                  _hover={{ bg: "gray.50", color: "mlc.gold" }}
                  fontSize="sm"
                  fontWeight="500"
                  py={2.5}
                >
                  Manage Subscription
                </MenuItem>
                
                <MenuDivider />
                
                <MenuItem
                  onClick={logout}
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
                as={Link}
                to="/login"
                variant="ghost"
                fontWeight="600"
                fontSize="sm"
                color="mlc.black"
                borderRadius="full"
                _hover={{ bg: "gray.50" }}
              >
                Sign In
              </Button>
              <Button
                as={Link}
                to="/signup"
                bg="mlc.greenDark"
                color="white"
                fontWeight="600"
                fontSize="sm"
                borderRadius="full"
                px={6}
                _hover={{ bg: "mlc.gold", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(86, 117, 109, 0.2)" }}
                transition="all 0.2s"
              >
                Join MLC
              </Button>
            </HStack>
          )}

          {/* 📱 Mobile Menu Icon */}
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
            bg="mlc.greenDark"
            align="stretch"
            spacing={0}
            px={4}
            py={2}
            borderRadius="xl"
            boxShadow="xl"
          >
            {navLinks.map((link) => (
              <ChakraLink
                as={Link}
                key={link.label}
                to={link.href}
                fontWeight="medium"
                fontFamily="'Inter', sans-serif"
                color="white"
                py={3.5}
                px={4}
                borderRadius="lg"
                _hover={{ bg: "rgba(255,255,255,0.1)", color: "mlc.gold" }}
                onClick={onClose}
              >
                {link.label}
              </ChakraLink>
            ))}
            
            {!isAuthenticated && (
              <>
                <Divider borderColor="whiteAlpha.300" my={2} />
                <Button
                  as={Link}
                  to="/login"
                  variant="ghost"
                  color="white"
                  justifyContent="flex-start"
                  py={6}
                  _hover={{ bg: "whiteAlpha.100" }}
                  onClick={onClose}
                >
                  Sign In
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  bg="mlc.gold"
                  color="mlc.black"
                  py={6}
                  mt={2}
                  mb={4}
                  onClick={onClose}
                >
                  Join MLC
                </Button>
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
