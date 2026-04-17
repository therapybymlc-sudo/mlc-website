'use client'

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  useToast,
  Icon,
  Avatar,
  IconButton,
} from "@chakra-ui/react";
import { 
  FiHeart, FiSave, FiCamera 
} from "react-icons/fi";
import { apiGet, apiPut } from "../../../../../api.js";

const FOCUS_AREAS = [
  { id: 'anxiety', label: 'Anxiety disorders', icon: '🧶' },
  { id: 'depression', label: 'Depressive disorders', icon: '☁️' },
  { id: 'relationships', label: 'Relationship skills', icon: '💑' },
  { id: 'stress', label: 'Stress management', icon: '🧘' },
  { id: 'trauma', label: 'Trauma-related disorders', icon: '🚪' },
];

export default function ProfileClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    title: "Psychotherapist",
    education: "",
    experience_years: 0,
    bio: "",
    focus_areas: [],
    languages: [],
    affiliations: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiGet("therapists/me/");
        if (data) setProfile(data);
      } catch (error) {
        console.warn("Could not fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (profile.id) {
        await apiPut(`therapists/${profile.id}/`, profile);
        toast({ title: "Profile Updated", status: "success" });
      } else {
        const created = await apiPost("therapists/", profile);
        setProfile(created);
        toast({ title: "Profile Created", status: "success" });
      }
    } catch (error) {
      toast({ title: "Sync failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1000px" mx="auto" pb={20}>
      <VStack align="stretch" spacing={10}>
        <Box>
            <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">Public Clinician Profile</Heading>
            <Text color="gray.500" mt={1}>This information is visible to clients during the discovery process.</Text>
        </Box>

        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack spacing={8} align="flex-start">
            <VStack position="relative">
              <Avatar size="2xl" name={profile.name} bg="#56756D" />
              <IconButton
                icon={<FiCamera />}
                size="sm"
                borderRadius="full"
                position="absolute"
                bottom={0}
                right={0}
                colorScheme="teal"
                aria-label="Upload Photo"
              />
            </VStack>
            <VStack align="stretch" flex={1} spacing={4}>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                  <Input 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.name || ""}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">Professional Title</FormLabel>
                  <Input 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.title || ""}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                  />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">Education (Degrees)</FormLabel>
                  <Input 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.education || ""}
                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">Years of Experience</FormLabel>
                  <Input 
                    type="number"
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.experience_years || 0}
                    onChange={(e) => setProfile({...profile, experience_years: parseInt(e.target.value) || 0})}
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">Professional Bio</FormLabel>
                <textarea 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#F9FAFB', border: 'none', minHeight: '120px' }}
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Share your therapeutic approach..."
                />
              </FormControl>
            </VStack>
          </HStack>
        </Box>

        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
            <Icon as={FiHeart} color="red.400" /> Focus Areas
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
             {FOCUS_AREAS.map(area => (
               <Box 
                key={area.id}
                p={4}
                borderRadius="2xl"
                border="2px solid"
                borderColor={profile.focus_areas?.includes(area.id) ? "#56756D" : "gray.50"}
                bg={profile.focus_areas?.includes(area.id) ? "rgba(86, 117, 109, 0.05)" : "transparent"}
                cursor="pointer"
                onClick={() => {
                    const current = profile.focus_areas || [];
                    const updated = current.includes(area.id) ? current.filter(i => i !== area.id) : [...current, area.id];
                    setProfile({...profile, focus_areas: updated});
                }}
                transition="all 0.2s"
                textAlign="center"
               >
                  <Text fontSize="2xl" mb={1}>{area.icon}</Text>
                  <Text fontSize="xs" fontWeight="700">{area.label}</Text>
               </Box>
             ))}
          </SimpleGrid>
        </Box>

        <Box 
          position="sticky" 
          bottom={10} 
          bg="white" 
          p={6} 
          borderRadius="3xl" 
          shadow="2xl" 
          border="1px solid" 
          borderColor="gray.100"
          zIndex={100}
        >
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
               <Text fontWeight="700">Synchronize Changes</Text>
               <Text fontSize="xs" color="gray.500">Your profile is currently waiting to be synced with the public directory.</Text>
            </VStack>
            <Button 
              leftIcon={<FiSave />} 
              bg="#56756D" 
              color="white" 
              px={10} 
              h="50px" 
              borderRadius="full" 
              onClick={handleSave}
              isLoading={loading}
              _hover={{ bg: '#C9A960' }}
            >
              Sync Profile
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
