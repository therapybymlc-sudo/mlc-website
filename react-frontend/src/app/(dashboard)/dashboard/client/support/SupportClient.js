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
  Select,
  useToast,
  Icon,
  Divider,
  Container,
  Circle,
  Badge
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  FiMail, 
  FiPhone, 
  FiSend, 
  FiHeart, 
  FiHelpCircle,
  FiLifeBuoy
} from "react-icons/fi";
import { apiPost } from "../../../../../api.js";

export default function ClientSupportClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost("support-tickets/", formData);
      
      toast({
        title: "Message Sent",
        description: "We've received your request. Our care team will reach out to help you shortly.",
        status: "success",
        duration: 5000,
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
    <Box position="relative" pb={20}>
      <Container maxW="container.lg" p={0}>
        <VStack align="start" spacing={2} mb={10}>
          <HStack spacing={3}>
            <Icon as={FiLifeBuoy} boxSize={8} color="mlc.gold" />
            <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">Support & Care</Heading>
          </HStack>
          <Text color="gray.500" fontSize="lg">
            Having trouble with the portal? Tell us what's happening and we'll help you get back to your journey.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}>
          {/* 📝 Request Form */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100">
              <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
                <Heading size="md" color="mlc.greenDark" mb={2}>How can we help you today?</Heading>
                
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">What's happening?</FormLabel>
                  <Input 
                    placeholder="Short title for your request"
                    borderRadius="xl"
                    h={12}
                    focusBorderColor="mlc.gold"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">Category</FormLabel>
                  <Select 
                    borderRadius="xl"
                    h={12}
                    focusBorderColor="mlc.gold"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="general">General Help</option>
                    <option value="technical">Trouble joining a session</option>
                    <option value="billing">Billing or Payments</option>
                    <option value="resources">Accessing tools or worksheets</option>
                    <option value="other">Something else</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">Tell us a bit more</FormLabel>
                  <Textarea 
                    placeholder="Describe the concern you're facing on the website..."
                    borderRadius="xl"
                    minH="150px"
                    focusBorderColor="mlc.gold"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </FormControl>

                <Button 
                  type="submit"
                  bg="mlc.gold"
                  color="white"
                  size="lg"
                  borderRadius="full"
                  isLoading={loading}
                  loadingText="Sending..."
                  rightIcon={<FiSend />}
                  _hover={{ bg: '#b89a50', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Send Help Request
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* 📞 Contact Us */}
          <Box gridColumn={{ lg: "span 1" }}>
            <VStack spacing={6} align="stretch">
              <Box bg="white" p={8} borderRadius="3xl" shadow="md" border="1px solid" borderColor="gray.100">
                <VStack align="start" spacing={6}>
                  <Heading size="md" color="mlc.greenDark">Reach Out Directly</Heading>
                  <Text fontSize="sm" color="gray.500">
                    If you prefer to email us directly, we're here for you.
                  </Text>
                  
                  <VStack align="start" spacing={4} w="full">
                    <HStack spacing={4} w="full" p={4} borderRadius="2xl" bg="rgba(201, 169, 96, 0.08)" transition="0.2s" _hover={{ bg: 'rgba(201, 169, 96, 0.15)' }}>
                      <Circle size="40px" bg="white" shadow="sm">
                        <Icon as={FiMail} color="mlc.gold" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="700" color="mlc.gold">EMAIL CARE TEAM</Text>
                        <Text fontSize="sm" fontWeight="600">care@mlchealth.in</Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={4} w="full" p={4} borderRadius="2xl" bg="gray.50" opacity={0.6}>
                      <Circle size="40px" bg="white" shadow="sm">
                        <Icon as={FiPhone} color="gray.400" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="700" color="gray.400">PHONE SUPPORT</Text>
                        <Text fontSize="sm" fontWeight="600" color="gray.400">Coming Soon</Text>
                      </VStack>
                    </HStack>
                  </VStack>

                  <Divider />

                  <Box w="full" p={4} borderRadius="2xl" bg="mlc.greenHighlight">
                    <HStack spacing={3} mb={2}>
                      <Icon as={FiHeart} color="mlc.green" />
                      <Text fontWeight="700" fontSize="xs" color="mlc.greenDark">YOUR PRIVACY</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                      Your support requests are kept confidential and handled by our care coordination team.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* 🌿 Support Reminder */}
              <Box p={6} borderRadius="3xl" bg="mlc.greenDark" color="white">
                <HStack spacing={3} mb={3}>
                  <Icon as={FiHelpCircle} color="mlc.gold" />
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.1em">QUICK TIP</Text>
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.800" lineHeight="relaxed">
                  Need to reschedule? You can also message your therapist directly from your appointments page if you have a session coming up.
                </Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
