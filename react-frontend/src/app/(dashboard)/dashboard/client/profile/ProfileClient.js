'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Avatar,
  Icon,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiSave, FiAlertCircle, FiCamera } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import { apiPatch } from "../../../../../api.js";

export default function ProfileClient() {
  const { clientProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    preferred_first_name: "",
    occupation: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (clientProfile) {
      setFormData({
        name: clientProfile.name || "",
        email: clientProfile.email || "",
        phone_number: clientProfile.phone_number || "",
        preferred_first_name: clientProfile.preferred_first_name || "",
        occupation: clientProfile.occupation || "",
      });
    }
  }, [clientProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiPatch(`clients/${clientProfile.id}/`, formData);
      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      // Optionally trigger a page refresh or context update
      window.location.reload(); 
    } catch (err) {
      console.error("Failed to update profile", err);
      toast({
        title: "Update failed",
        description: err.response?.data?.detail || "An error occurred while saving your profile.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepair = async () => {
    setIsSaving(true);
    try {
      const { apiPost } = await import("../../../../../api.js");
      await apiPost("clients/repair-account/");
      toast({
        title: "Account Repaired",
        description: "Your profiles have been merged and your data should now be visible. Refreshing...",
        status: "success",
        duration: 5000,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast({
        title: "Repair Failed",
        description: error.response?.data?.detail || "Something went wrong during the repair process.",
        status: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted || authLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="#56756D" thickness="4px" />
      </Center>
    );
  }

  const isGhost = formData.name.startsWith("user_") || formData.email.includes("@example.invalid");

  return (
    <Box maxW="1000px" mx="auto">
      <VStack align="start" spacing={1} mb={10}>
        <HStack>
            <Icon as={FiUser} color="#56756D" boxSize={6} />
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">My Profile</Heading>
        </HStack>
        <Text color="gray.500">Manage your identity and clinical records link.</Text>
      </VStack>

      {isGhost && (
        <Alert status="warning" borderRadius="2xl" mb={10} variant="subtle" bg="orange.50" border="1px solid" borderColor="orange.100">
          <AlertIcon color="orange.400" />
          <Box>
            <Text fontWeight="bold" color="orange.900">Identity Mismatch Detected</Text>
            <Text fontSize="sm" color="orange.800">
              Your profile currently uses a system ID. Please enter your <strong>actual name</strong> and <strong>real email</strong> below to ensure your therapist can find your records correctly.
            </Text>
          </Box>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        {/* Profile Card */}
        <VStack spacing={6} align="stretch">
          <Card borderRadius="3xl" overflow="hidden" shadow="sm" border="1px solid" borderColor="gray.100">
            <CardBody p={8} textAlign="center">
              <VStack spacing={6}>
                <Box position="relative">
                  <Avatar size="2xl" name={formData.name} border="4px solid white" shadow="xl" />
                  <IconButton
                    aria-label="Change photo"
                    icon={<FiCamera />}
                    size="sm"
                    borderRadius="full"
                    position="absolute"
                    bottom="2"
                    right="2"
                    bg="white"
                    shadow="md"
                    _hover={{ bg: 'gray.50' }}
                  />
                </Box>
                <VStack spacing={1}>
                  <Heading size="md" color="#2E2E2E">{formData.name || 'Anonymous User'}</Heading>
                  <Text fontSize="sm" color="gray.500">{formData.occupation || 'Member'}</Text>
                </VStack>
                <Divider />
                <VStack align="start" w="full" spacing={4}>
                   <HStack color="gray.600">
                      <Icon as={FiMail} />
                      <Text fontSize="sm" noOfLines={1}>{formData.email}</Text>
                   </HStack>
                   <HStack color="gray.600">
                      <Icon as={FiPhone} />
                      <Text fontSize="sm">{formData.phone_number || 'No phone added'}</Text>
                   </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
          
          <Box p={6} bg="#F2F8F5" borderRadius="3xl">
             <HStack mb={4}>
                <Icon as={FiAlertCircle} color="#56756D" />
                <Text fontWeight="bold" color="#56756D">Clinical Records</Text>
             </HStack>
             <Text fontSize="xs" color="gray.600" lineHeight="tall" mb={4}>
                Updating your email will automatically attempt to link your account to any existing therapeutic records matching that email address.
             </Text>
             <Button 
                size="sm" 
                variant="outline" 
                colorScheme="teal" 
                w="full" 
                borderRadius="full"
                onClick={handleRepair}
                isLoading={isSaving}
                loadingText="Repairing..."
             >
                Repair & Merge Records
             </Button>
          </Box>
        </VStack>

        {/* Editor Form */}
        <Box gridColumn={{ md: "span 2" }}>
           <Card borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
              <CardBody p={8}>
                 <VStack spacing={8} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                       <FormControl>
                          <FormLabel fontSize="sm" color="gray.600">Full Name</FormLabel>
                          <Input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            borderRadius="xl"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.200' }}
                          />
                       </FormControl>
                       <FormControl>
                          <FormLabel fontSize="sm" color="gray.600">Email Address</FormLabel>
                          <Input 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange}
                            placeholder="your@email.com"
                            borderRadius="xl"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.200' }}
                          />
                       </FormControl>
                       <FormControl>
                          <FormLabel fontSize="sm" color="gray.600">Preferred Name</FormLabel>
                          <Input 
                            name="preferred_first_name" 
                            value={formData.preferred_first_name} 
                            onChange={handleChange}
                            placeholder="What should we call you?"
                            borderRadius="xl"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.200' }}
                          />
                       </FormControl>
                       <FormControl>
                          <FormLabel fontSize="sm" color="gray.600">Occupation</FormLabel>
                          <Input 
                            name="occupation" 
                            value={formData.occupation} 
                            onChange={handleChange}
                            placeholder="e.g. Graphic Designer"
                            borderRadius="xl"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.200' }}
                          />
                       </FormControl>
                       <FormControl gridColumn={{ md: "span 2" }}>
                          <FormLabel fontSize="sm" color="gray.600">Phone Number</FormLabel>
                          <Input 
                            name="phone_number" 
                            value={formData.phone_number} 
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                            borderRadius="xl"
                            bg="gray.50"
                            border="none"
                            _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.200' }}
                          />
                       </FormControl>
                    </SimpleGrid>

                    <Divider />

                    <HStack justify="flex-end" spacing={4}>
                       <Button variant="ghost" borderRadius="full" px={8}>Cancel</Button>
                       <Button 
                        leftIcon={<FiSave />} 
                        bg="#56756D" 
                        color="white" 
                        borderRadius="full" 
                        px={10}
                        isLoading={isSaving}
                        loadingText="Saving..."
                        onClick={handleSave}
                        _hover={{ bg: '#455c56', transform: 'translateY(-2px)' }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.3s"
                       >
                         Save Changes
                       </Button>
                    </HStack>
                 </VStack>
              </CardBody>
           </Card>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
