'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Icon,
  Circle,
  Link,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { 
  FiMail, 
  FiPhone, 
  FiSend, 
  FiHeart, 
  FiLifeBuoy,
  FiHelpCircle,
  FiChevronDown,
  FiCheck,
  FiVideo,
  FiCreditCard,
  FiFileText,
  FiMessageSquare
} from "react-icons/fi";
import { apiPost } from "../../../../../api.js";

const CATEGORIES = [
  { value: "general", label: "General Help", icon: FiHelpCircle },
  { value: "technical", label: "Trouble joining a session", icon: FiVideo },
  { value: "billing", label: "Billing or Payments", icon: FiCreditCard },
  { value: "resources", label: "Accessing tools or worksheets", icon: FiFileText },
  { value: "other", label: "Something else", icon: FiMessageSquare },
];

export default function ClientSupportClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    description: "",
  });

  const selectedCategory = CATEGORIES.find(c => c.value === formData.category) || CATEGORIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("support-tickets/", formData);
      
      toast({
        title: "Message Sent",
        description: "We've received your request. Our care team will reach out to help you shortly.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      setFormData({ subject: "", category: "general", description: "" });
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* 🌿 Framed Header Card */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', md: 'center' }} 
          gap={4}
        >
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiHelpCircle} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>
            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(86, 117, 109, 0.12)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  textTransform="uppercase" 
                  letterSpacing="0.08em"
                >
                  Help Desk
                </Badge>
              </HStack>
              <Heading 
                as="h1"
                fontSize={{ base: "22px", md: "25px" }} 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                Support & Care
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Having trouble with the portal? Tell us what's happening and our care team will help you get back to your journey.
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Badge
              bg="rgba(86, 117, 109, 0.08)"
              color="#56756D"
              fontSize="11px"
              fontWeight="600"
              borderRadius="full"
              px={3}
              py={1}
            >
              Response Time ~ 24h
            </Badge>
          </HStack>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 6, lg: 8 }} alignItems="start">
        {/* 📝 Request Form Card */}
        <Box gridColumn={{ lg: "span 2" }}>
          <Box 
            bg="white" 
            p={{ base: 6, md: 8 }} 
            borderRadius="2xl" 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack as="form" onSubmit={handleSubmit} spacing={5} align="stretch">
              <Box mb={1}>
                <Heading 
                  fontSize="16px" 
                  fontWeight="600" 
                  color="#263A33" 
                  letterSpacing="-0.01em"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  How can we help you today?
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                  Submit a message directly to our care coordination team.
                </Text>
              </Box>
              
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  What's happening?
                </FormLabel>
                <Input 
                  placeholder="Short title for your request"
                  bg="#FAF8F5"
                  border="1px solid rgba(86, 117, 109, 0.2)"
                  borderRadius="xl"
                  h="42px"
                  fontSize="13px"
                  color="#263A33"
                  _placeholder={{ color: "#8C9E96" }}
                  _hover={{ borderColor: "#56756D" }}
                  _focus={{ bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </FormControl>

              {/* 🏷️ Custom Modern Dropdown Menu */}
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Category
                </FormLabel>
                <Menu matchWidth gutter={6}>
                  {({ isOpen }) => (
                    <>
                      <MenuButton
                        as={Button}
                        w="full"
                        h="42px"
                        bg="#FAF8F5"
                        border="1px solid"
                        borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
                        borderRadius="xl"
                        px={3.5}
                        textAlign="left"
                        fontWeight="400"
                        fontSize="13px"
                        color="#263A33"
                        _hover={{ borderColor: "#56756D", bg: "#FAF8F5" }}
                        _active={{ bg: "white" }}
                        _focus={{ boxShadow: "0 0 0 1px #56756D" }}
                        transition="all 0.2s"
                        display="flex"
                        alignItems="center"
                      >
                        <HStack justify="space-between" w="full">
                          <HStack spacing={2.5}>
                            <Icon as={selectedCategory.icon} boxSize={3.5} color="#56756D" />
                            <Text as="span" fontSize="13px" color="#263A33" fontWeight="500">
                              {selectedCategory.label}
                            </Text>
                          </HStack>
                          <Icon 
                            as={FiChevronDown} 
                            boxSize={4} 
                            color="#56756D" 
                            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"} 
                            transition="transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)" 
                          />
                        </HStack>
                      </MenuButton>

                      <MenuList
                        bg="white"
                        border="1px solid rgba(86, 117, 109, 0.16)"
                        borderRadius="xl"
                        boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
                        p={1.5}
                        zIndex={25}
                      >
                        {CATEGORIES.map((cat) => {
                          const isSelected = formData.category === cat.value;
                          const CatIcon = cat.icon;
                          return (
                            <MenuItem
                              key={cat.value}
                              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                              borderRadius="lg"
                              py={2.5}
                              px={3}
                              fontSize="13px"
                              fontWeight={isSelected ? "600" : "400"}
                              color="#263A33"
                              bg={isSelected ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                              _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              transition="background 0.15s"
                            >
                              <HStack spacing={2.5}>
                                <Icon 
                                  as={CatIcon} 
                                  boxSize={3.5} 
                                  color={isSelected ? "#56756D" : "#8C9E96"} 
                                />
                                <Text as="span">{cat.label}</Text>
                              </HStack>
                              {isSelected && <Icon as={FiCheck} color="#56756D" boxSize={3.5} />}
                            </MenuItem>
                          );
                        })}
                      </MenuList>
                    </>
                  )}
                </Menu>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                  Tell us a bit more
                </FormLabel>
                <Textarea 
                  placeholder="Describe the concern you're facing on the website..."
                  bg="#FAF8F5"
                  border="1px solid rgba(86, 117, 109, 0.2)"
                  borderRadius="xl"
                  p={3.5}
                  minH="140px"
                  fontSize="13px"
                  color="#263A33"
                  _placeholder={{ color: "#8C9E96" }}
                  _hover={{ borderColor: "#56756D" }}
                  _focus={{ bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </FormControl>

              <Box pt={2}>
                <Button 
                  type="submit"
                  bg="#263A33"
                  color="white"
                  h="42px"
                  px={7}
                  borderRadius="full"
                  fontSize="13px"
                  fontWeight="600"
                  isLoading={loading}
                  loadingText="Sending..."
                  rightIcon={<Icon as={FiSend} boxSize={3.5} />}
                  _hover={{ bg: "#1C2C26", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(38, 58, 51, 0.2)" }}
                  transition="all 0.2s"
                >
                  Send Help Request
                </Button>
              </Box>
            </VStack>
          </Box>
        </Box>

        {/* 📞 Contact & Guidance Sidebar */}
        <Box gridColumn={{ lg: "span 1" }}>
          <VStack spacing={5} align="stretch">
            {/* Direct Contact Card */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="2xl" 
              border="1px solid rgba(86, 117, 109, 0.14)" 
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            >
              <VStack align="start" spacing={5}>
                <Box>
                  <Heading 
                    fontSize="15px" 
                    fontWeight="600" 
                    color="#263A33"
                    letterSpacing="-0.01em"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    Reach Out Directly
                  </Heading>
                  <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                    If you prefer direct communication, our team is readily reachable below.
                  </Text>
                </Box>
                
                <VStack align="start" spacing={3} w="full">
                  {/* Email */}
                  <HStack 
                    spacing={3.5} 
                    w="full" 
                    p={3.5} 
                    borderRadius="xl" 
                    bg="rgba(86, 117, 109, 0.05)" 
                    border="1px solid rgba(86, 117, 109, 0.12)"
                    transition="0.2s" 
                    _hover={{ bg: "rgba(86, 117, 109, 0.09)" }}
                  >
                    <Circle size="36px" bg="white" color="#56756D" shadow="sm" flexShrink={0}>
                      <Icon as={FiMail} boxSize={4} />
                    </Circle>
                    <VStack align="start" spacing={0} minW={0}>
                      <Text fontSize="10.5px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                        Email Care Team
                      </Text>
                      <Link 
                        href="mailto:therapy@mlchealth.in" 
                        fontSize="12.5px" 
                        fontWeight="600" 
                        color="#263A33" 
                        _hover={{ color: "#56756D" }}
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        therapy@mlchealth.in
                      </Link>
                    </VStack>
                  </HStack>

                  {/* Phone & WhatsApp */}
                  <HStack 
                    spacing={3.5} 
                    w="full" 
                    p={3.5} 
                    borderRadius="xl" 
                    bg="rgba(86, 117, 109, 0.05)" 
                    border="1px solid rgba(86, 117, 109, 0.12)"
                    transition="0.2s" 
                    _hover={{ bg: "rgba(86, 117, 109, 0.09)" }}
                  >
                    <Circle size="36px" bg="white" color="#56756D" shadow="sm" flexShrink={0}>
                      <Icon as={FiPhone} boxSize={4} />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="10.5px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                        Phone & WhatsApp
                      </Text>
                      <HStack spacing={2} pt={0.5}>
                        <Link 
                          href="tel:+919901619968" 
                          fontSize="12.5px" 
                          fontWeight="600" 
                          color="#263A33" 
                          _hover={{ color: "#56756D" }}
                          whiteSpace="nowrap"
                        >
                          +91 99016 19968
                        </Link>
                        <Link 
                          href="https://wa.me/919901619968" 
                          isExternal 
                          color="#25D366" 
                          display="inline-flex" 
                          alignItems="center"
                          _hover={{ transform: "scale(1.1)" }}
                          transition="0.2s"
                        >
                          <Icon as={FaWhatsapp} boxSize={3.5} />
                        </Link>
                      </HStack>
                    </VStack>
                  </HStack>
                </VStack>

                {/* Privacy Badge */}
                <Box 
                  w="full" 
                  p={3.5} 
                  borderRadius="xl" 
                  bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
                  border="1px solid rgba(16, 185, 129, 0.25)"
                >
                  <HStack spacing={2} mb={1}>
                    <Icon as={FiHeart} boxSize={3.5} color="#059669" />
                    <Text fontWeight="700" fontSize="10.5px" color="#065F46" letterSpacing="0.08em" textTransform="uppercase">
                      Confidential Care
                    </Text>
                  </HStack>
                  <Text fontSize="11.5px" color="#065F46" lineHeight="1.5">
                    Your support requests are kept confidential and handled directly by our care coordination team.
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* 🌿 Support Reminder / Quick Guidance */}
            <Box 
              p={5} 
              borderRadius="2xl" 
              bg="linear-gradient(135deg, #FAF8F5 0%, #FFFFFF 100%)" 
              border="1px solid rgba(86, 117, 109, 0.16)"
              boxShadow="0 4px 16px -2px rgba(38, 58, 51, 0.03)"
            >
              <HStack spacing={2} mb={2}>
                <Circle size="24px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiHelpCircle} boxSize={3} />
                </Circle>
                <Text fontSize="10.5px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                  Quick Guidance
                </Text>
              </HStack>
              <Text fontSize="12px" color="#5A6E65" lineHeight="1.55">
                Need to reschedule? You can also message your therapist directly from your appointments tab or adjust upcoming sessions.
              </Text>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
