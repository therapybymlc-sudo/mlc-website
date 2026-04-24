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
  Badge,
  Circle,
  Flex
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  FiMail, 
  FiPhone, 
  FiSend, 
  FiAlertCircle, 
  FiMessageCircle, 
  FiHelpCircle,
  FiBook
} from "react-icons/fi";
import { apiPost } from "../../../../../api.js";

export default function SupportClient() {
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
        title: "Ticket Raised Successfully",
        description: "Our support team has received your report and will reach out shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ subject: "", category: "general", description: "" });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly via email.",
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
            <Icon as={FiHelpCircle} boxSize={8} color="mlc.green" />
            <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">Need Help?</Heading>
          </HStack>
          <Text color="gray.500" fontSize="lg">
            We're here to ensure your clinical workspace runs smoothly. Raise a ticket or reach out directly.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}>
          {/* 📝 Ticket Form */}
          <Box gridColumn={{ lg: "span 2" }}>
            <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100">
              <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
                <Heading size="md" color="mlc.greenDark" mb={2}>Raise a Support Ticket</Heading>
                
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">Subject</FormLabel>
                  <Input 
                    placeholder="Brief summary of the issue"
                    borderRadius="xl"
                    h={12}
                    focusBorderColor="mlc.green"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">Category</FormLabel>
                  <Select 
                    borderRadius="xl"
                    h={12}
                    focusBorderColor="mlc.green"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue / Bug</option>
                    <option value="billing">Billing & Subscription</option>
                    <option value="client-access">Client Access Issue</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700" color="gray.600">Description of Concern</FormLabel>
                  <Textarea 
                    placeholder="Tell us more about the concern you faced on the website..."
                    borderRadius="xl"
                    minH="150px"
                    focusBorderColor="mlc.green"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </FormControl>

                <Button 
                  type="submit"
                  bg="mlc.green"
                  color="white"
                  size="lg"
                  borderRadius="full"
                  isLoading={loading}
                  loadingText="Raising Ticket..."
                  rightIcon={<FiSend />}
                  _hover={{ bg: 'mlc.greenDark', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  Submit Report
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* 📞 Contact Us Section */}
          <Box gridColumn={{ lg: "span 1" }}>
            <VStack spacing={6} align="stretch">
              <Box bg="white" p={8} borderRadius="3xl" shadow="md" border="1px solid" borderColor="gray.100">
                <VStack align="start" spacing={6}>
                  <Heading size="md" color="mlc.greenDark">Contact Us Now</Heading>
                  <Text fontSize="sm" color="gray.500">
                    For urgent clinical support or immediate inquiries, use the channels below.
                  </Text>
                  
                  <VStack align="start" spacing={4} w="full">
                    <HStack spacing={4} w="full" p={4} borderRadius="2xl" bg="mlc.greenHighlight" transition="0.2s" _hover={{ bg: 'rgba(86, 117, 109, 0.1)' }}>
                      <Circle size="40px" bg="white" shadow="sm">
                        <Icon as={FiMail} color="mlc.green" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="700" color="mlc.greenDark">EMAIL US</Text>
                        <Text fontSize="sm" fontWeight="600">support@mlchealth.in</Text>
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

                  <Box w="full" p={4} borderRadius="2xl" bg="teal.50">
                    <HStack spacing={3} mb={2}>
                      <Icon as={FiBook} color="teal.500" />
                      <Text fontWeight="700" fontSize="xs" color="teal.700">KNOWLEDGE BASE</Text>
                    </HStack>
                    <Text fontSize="xs" color="teal.600">
                      Browse our therapist guides and FAQ for instant answers to common questions.
                    </Text>
                  </Box>
                </VStack>
              </Box>

              {/* 🛡️ Ethical Promise */}
              <Box p={6} borderRadius="3xl" bg="gray.900" color="white">
                <HStack spacing={3} mb={3}>
                  <Icon as={FiAlertCircle} color="mlc.gold" />
                  <Text fontSize="xs" fontWeight="900" letterSpacing="0.1em">ETHICAL PROMISE</Text>
                </HStack>
                <Text fontSize="xs" color="whiteAlpha.800" lineHeight="relaxed">
                  All support requests are handled with the same clinical confidentiality and ethical standards as our patient care.
                </Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
