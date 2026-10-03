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
  Circle,
  Divider,
  SimpleGrid,
  Badge,
  IconButton,
  Spinner,
  Center,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiMail, FiPhone, FiSave, FiAlertCircle, FiCamera, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import { apiPatch } from "../../../../../api.js";

export default function ProfileClient() {
  const { user, clientProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    preferred_first_name: "",
    occupation: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInputRef = useRef(null);
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
      });
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

  if (!isMounted || authLoading) {
    return (
      <Center h="60vh">
        <Spinner size="lg" color="#56756D" thickness="3px" />
      </Center>
    );
  }

  const isGhost = formData.name.startsWith("user_") || formData.email.includes("@example.invalid");
  
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview for immediate visual feedback
    const localUrl = URL.createObjectURL(file);
    setPreviewPhoto(localUrl);
    setIsSaving(true);

    try {
      // 1. Upload via Next.js API route (saves to Clerk CDN & PostgreSQL database)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      if (formData.email || clientProfile?.email) {
        uploadFormData.append("email", formData.email || clientProfile?.email);
      }
      if (clientProfile?.id) {
        uploadFormData.append("clientId", String(clientProfile.id));
      }
      if (user?.id) {
        uploadFormData.append("userId", String(user.id));
      }

      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: uploadFormData,
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || "Failed to upload photo to server.");
      }

      if (resData.imageUrl) {
        setPreviewPhoto(resData.imageUrl);
      }

      // 2. Also update Clerk client user object directly if available
      if (user && typeof user.setProfileImage === "function") {
        try {
          await user.setProfileImage({ file });
        } catch (clerkErr) {
          console.warn("Clerk user.setProfileImage notice:", clerkErr);
        }
      }

      // 3. Fallback sync to Django backend (including name & email so partial validation succeeds)
      try {
        const { apiPatchForm } = await import("../../../../../api.js");
        const djangoForm = new FormData();
        djangoForm.append("profile_image", file);
        if (formData.name) djangoForm.append("name", formData.name);
        if (formData.email) djangoForm.append("email", formData.email);
        const targetEndpoint = clientProfile?.id ? `clients/${clientProfile.id}/` : `clients/me/`;
        await apiPatchForm(targetEndpoint, djangoForm);
      } catch (djangoErr) {
        console.warn("Django patch notice (handled by DB route):", djangoErr);
      }

      toast({
        title: "Photo updated",
        description: "Your profile picture has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reload after slight delay to let auth tokens and profile re-sync
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Profile photo upload failed:", err);
      toast({
        title: "Upload failed",
        description: err.message || "An unexpected error occurred while uploading your photo.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      setPreviewPhoto(null);
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handlePhotoUpload} 
      />
      
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
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiUser} boxSize="22px" />
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
                  Account & Preferences
                </Badge>
              </HStack>
              <Heading 
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }} 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                lineHeight="1.25"
              >
                My Profile
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Manage your personal details, contact preferences, and profile display.
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Badge
              bg="rgba(16, 185, 129, 0.12)"
              color="#059669"
              fontSize="11px"
              fontWeight="600"
              borderRadius="full"
              px={3}
              py={1}
            >
              Active Client
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {isGhost && (
        <Box 
          borderRadius="2xl" 
          mb={8} 
          p={5}
          bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" 
          border="1px solid rgba(245, 158, 11, 0.3)"
          boxShadow="0 4px 14px -2px rgba(245, 158, 11, 0.08)"
        >
          <HStack align="flex-start" spacing={3.5}>
            <Circle size="34px" bg="rgba(245, 158, 11, 0.15)" color="#B45309" flexShrink={0} mt={0.5}>
              <Icon as={FiAlertCircle} boxSize="17px" />
            </Circle>
            <VStack align="start" spacing={1} flex={1}>
              <Text fontWeight="600" fontSize="14px" color="#92400E" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                Identity Mismatch Detected
              </Text>
              <Text fontSize="13px" color="#78350F" lineHeight="1.5">
                Your profile currently uses a temporary system ID. Please enter your <strong>actual name</strong> and <strong>real email</strong> below to ensure your therapist can find your records correctly.
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* 👤 Left Profile Summary Card */}
        <VStack spacing={6} align="stretch">
          <Box 
            bg="white" 
            borderRadius="2xl" 
            p={{ base: 6, md: 7 }} 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            textAlign="center"
          >
            <VStack spacing={5}>
              <Box position="relative">
                <Avatar 
                  size="2xl" 
                  name={formData.name || "Client"} 
                  src={previewPhoto || user?.imageUrl || clientProfile?.profile_image} 
                  bg="#56756D"
                  color="white"
                  border="4px solid white" 
                  boxShadow="0 4px 16px rgba(38, 58, 51, 0.12)"
                />
                <IconButton
                  aria-label="Change photo"
                  icon={<Icon as={FiCamera} boxSize="14px" />}
                  size="sm"
                  borderRadius="full"
                  position="absolute"
                  bottom="1"
                  right="1"
                  bg="white"
                  color="#263A33"
                  border="1px solid rgba(86, 117, 109, 0.2)"
                  boxShadow="0 2px 6px rgba(0,0,0,0.1)"
                  _hover={{ bg: "#FAF8F5", color: "#56756D" }}
                  onClick={handlePhotoClick}
                  isLoading={isSaving}
                />
              </Box>

              <VStack spacing={1.5}>
                <Heading 
                  fontSize="18px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  {formData.name || 'Anonymous User'}
                </Heading>
                <Badge
                  bg="rgba(86, 117, 109, 0.08)"
                  color="#56756D"
                  border="1px solid rgba(86, 117, 109, 0.2)"
                  borderRadius="full"
                  px={3}
                  py={0.5}
                  fontSize="11px"
                  fontWeight="600"
                  textTransform="capitalize"
                >
                  {formData.occupation || 'Client Member'}
                </Badge>
              </VStack>

              <Divider borderColor="rgba(86, 117, 109, 0.12)" />

              <VStack align="start" w="full" spacing={3}>
                <HStack color="#5A6E65" spacing={2.5} fontSize="13px">
                  <Icon as={FiMail} color="#56756D" boxSize="14px" />
                  <Text noOfLines={1} title={formData.email}>
                    {formData.email || 'No email added'}
                  </Text>
                </HStack>
                <HStack color="#5A6E65" spacing={2.5} fontSize="13px">
                  <Icon as={FiPhone} color="#56756D" boxSize="14px" />
                  <Text>{formData.phone_number || 'No phone added'}</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>

        {/* 📝 Right Profile Form Editor Card */}
        <Box gridColumn={{ lg: "span 2" }}>
          <Box 
            bg="white" 
            borderRadius="2xl" 
            p={{ base: 6, md: 8 }} 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack spacing={6} align="stretch">
              <Box mb={1}>
                <Heading 
                  fontSize="16px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  Personal Details
                </Heading>
                <Text color="#5A6E65" fontSize="13px" mt={1}>
                  Update your contact details and display preferences.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Full Name
                  </FormLabel>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    borderRadius="xl"
                    bg="#FAF8F5"
                    height="42px"
                    fontSize="13.5px"
                    color="#263A33"
                    border="1px solid rgba(86, 117, 109, 0.18)"
                    _placeholder={{ color: "rgba(90, 110, 101, 0.55)" }}
                    _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Email Address
                  </FormLabel>
                  <Input 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="your@email.com"
                    borderRadius="xl"
                    bg="#FAF8F5"
                    height="42px"
                    fontSize="13.5px"
                    color="#263A33"
                    border="1px solid rgba(86, 117, 109, 0.18)"
                    _placeholder={{ color: "rgba(90, 110, 101, 0.55)" }}
                    _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Preferred Name
                  </FormLabel>
                  <Input 
                    name="preferred_first_name" 
                    value={formData.preferred_first_name} 
                    onChange={handleChange}
                    placeholder="What should we call you?"
                    borderRadius="xl"
                    bg="#FAF8F5"
                    height="42px"
                    fontSize="13.5px"
                    color="#263A33"
                    border="1px solid rgba(86, 117, 109, 0.18)"
                    _placeholder={{ color: "rgba(90, 110, 101, 0.55)" }}
                    _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Occupation
                  </FormLabel>
                  <Input 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange}
                    placeholder="e.g. Graphic Designer"
                    borderRadius="xl"
                    bg="#FAF8F5"
                    height="42px"
                    fontSize="13.5px"
                    color="#263A33"
                    border="1px solid rgba(86, 117, 109, 0.18)"
                    _placeholder={{ color: "rgba(90, 110, 101, 0.55)" }}
                    _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>

                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5}>
                    Phone Number
                  </FormLabel>
                  <Input 
                    name="phone_number" 
                    value={formData.phone_number} 
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    borderRadius="xl"
                    bg="#FAF8F5"
                    height="42px"
                    fontSize="13.5px"
                    color="#263A33"
                    border="1px solid rgba(86, 117, 109, 0.18)"
                    _placeholder={{ color: "rgba(90, 110, 101, 0.55)" }}
                    _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>
              </SimpleGrid>

              <Divider borderColor="rgba(86, 117, 109, 0.12)" pt={2} />

              <HStack justify="flex-end" spacing={3}>
                <Button 
                  variant="ghost" 
                  borderRadius="full" 
                  px={6}
                  height="40px"
                  fontSize="13px"
                  fontWeight="500"
                  color="#5A6E65"
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                  onClick={() => {
                    if (clientProfile) {
                      setFormData({
                        name: clientProfile.name || "",
                        email: clientProfile.email || "",
                        phone_number: clientProfile.phone_number || "",
                        preferred_first_name: clientProfile.preferred_first_name || "",
                        occupation: clientProfile.occupation || "",
                      });
                    }
                  }}
                >
                  Reset
                </Button>
                <Button 
                  leftIcon={<Icon as={FiSave} boxSize="14px" />} 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  px={7}
                  height="42px"
                  fontSize="13px"
                  fontWeight="600"
                  isLoading={isSaving}
                  loadingText="Saving..."
                  onClick={handleSave}
                  _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                  boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
                  transition="all 0.2s"
                >
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

