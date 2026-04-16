import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  Checkbox,
  CheckboxGroup,
  useToast,
  Divider,
  Icon,
  Avatar,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Select,
  Tooltip,
} from "@chakra-ui/react";
import { 
  FiUser, FiVideo, FiFileText, FiAward, FiGlobe, FiHeart, FiSave, FiPlus, FiCamera 
} from "react-icons/fi";
import RichTextEditor from "../../components/RichTextEditor";
import { apiGet, apiPut } from "../../api";

const FOCUS_AREAS = [
  { id: 'anxiety', label: 'Anxiety disorders', icon: '🧶' },
  { id: 'depression', label: 'Depressive disorders', icon: '☁️' },
  { id: 'relationships', label: 'Relationship skills', icon: '💑' },
  { id: 'stress', label: 'Stress management', icon: '🧘' },
  { id: 'trauma', label: 'Trauma-related disorders', icon: '🚪' },
  { id: 'geriatric', label: 'Geriatric mental health', icon: '🪑' },
  { id: 'parenting', label: 'Parenting support', icon: '👪' },
  { id: 'adhd', label: 'ADHD / Neurodivergence', icon: '⚡' },
  { id: 'lgbtq', label: 'LGBTQ+ Affirming', icon: '🌈' },
];

const SPECIALIZATIONS = [
  "Cognitive Behaviour Therapy (CBT)",
  "Dialectical Behaviour Therapy (DBT)",
  "Family Systems Therapy",
  "Trauma-Informed Therapy",
  "Supportive Therapy",
  "EMDR",
  "Psychoanalysis",
  "Acceptance & Commitment (ACT)",
  "Mindfulness-Based Stress Reduction",
];

const LANGUAGES = ["English", "Spanish", "Hindi", "French", "Arabic", "German", "Mandarin", "Portuguese"];

const CONCERNS = [
  "Sleep hygiene",
  "Burnout",
  "Self-esteem",
  "Grief and loss",
  "Social anxiety",
  "Career transitions",
  "Communication problems",
];

export default function TherapistProfileSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    title: "Psychotherapist",
    education: "",
    experience_years: 0,
    bio: "",
    video_url: "",
    focus_areas: [],
    specializations: [],
    languages: [],
    concerns: [],
    affiliations: [],
    hourly_rate: 80,
  });

  const [newAffiliation, setNewAffiliation] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiGet("therapists/me/"); // Endpoint for current therapist
      if (data) {
        setProfile({
          ...data,
          focus_areas: data.focus_areas || [],
          specializations: data.specializations || [],
          languages: data.languages || [],
          concerns: data.concerns || [],
          affiliations: data.affiliations || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiPut(`therapists/${profile.id}/`, profile);
      toast({
        title: "Profile Updated",
        description: "Your public profile has been synchronized.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (field, item) => {
    setProfile(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const addAffiliation = () => {
    if (!newAffiliation.trim()) return;
    setProfile(prev => ({
      ...prev,
      affiliations: [...(prev.affiliations || []), newAffiliation.trim()]
    }));
    setNewAffiliation("");
  };

  const removeAffiliation = (index) => {
    setProfile(prev => ({
      ...prev,
      affiliations: prev.affiliations.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box maxW="1000px" mx="auto" pb={20}>
      <VStack align="stretch" spacing={10}>
        {/* Header Section */}
        <Box>
            <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">Public Clinician Profile</Heading>
            <Text color="gray.500" mt={1}>This information is visible to clients during the discovery process.</Text>
        </Box>

        {/* 1. Basic Identity */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack spacing={8} align="flex-start" mb={8}>
            <VStack position="relative">
              <Avatar size="2xl" name={profile.name} bg="mlc.green" />
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
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                  <Input 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="700">Professional Title</FormLabel>
                  <Input 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.title}
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                  />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4}>
                 <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">Education (Ph.D, M.Phil, etc.)</FormLabel>
                    <Input 
                      bg="gray.50" border="none" borderRadius="xl"
                      value={profile.education}
                      onChange={(e) => setProfile({...profile, education: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">Years of Experience</FormLabel>
                    <Input 
                      type="number"
                      bg="gray.50" border="none" borderRadius="xl"
                      value={profile.experience_years}
                      onChange={(e) => setProfile({...profile, experience_years: e.target.value})}
                    />
                  </FormControl>
              </SimpleGrid>
            </VStack>
          </HStack>
        </Box>

        {/* 2. Intro & Media */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
           <Heading size="md" mb={6} display="flex" align="center" gap={2}>
              <Icon as={FiVideo} color="mlc.gold" /> Introduction & Story
           </Heading>
           <VStack align="stretch" spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">Video Introduction URL (YouTube/Vimeo)</FormLabel>
                <Input 
                  placeholder="https://youtube.com/watch?v=..."
                  bg="gray.50" border="none" borderRadius="xl"
                  value={profile.video_url}
                  onChange={(e) => setProfile({...profile, video_url: e.target.value})}
                />
                <Text fontSize="xs" color="gray.400" mt={2}>A short video helps clients feel connected before the first session.</Text>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">Professional Bio</FormLabel>
                <RichTextEditor 
                  value={profile.bio}
                  onChange={(val) => setProfile({...profile, bio: val.html})}
                  minHeight="200px"
                />
              </FormControl>
           </VStack>
        </Box>

        {/* 3. Clinical Focus Areas (Icons) */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Heading size="md" mb={6} display="flex" align="center" gap={2}>
            <Icon as={FiHeart} color="red.400" /> Focus Areas
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
             {FOCUS_AREAS.map(area => (
               <Box 
                key={area.id}
                p={4}
                borderRadius="2xl"
                border="2px solid"
                borderColor={profile.focus_areas.includes(area.id) ? "mlc.green" : "gray.50"}
                bg={profile.focus_areas.includes(area.id) ? "rgba(86, 117, 109, 0.05)" : "transparent"}
                cursor="pointer"
                onClick={() => toggleItem('focus_areas', area.id)}
                transition="all 0.2s"
                _hover={{ borderColor: 'mlc.green' }}
                textAlign="center"
               >
                  <Text fontSize="2xl" mb={1}>{area.icon}</Text>
                  <Text fontSize="xs" fontWeight="700">{area.label}</Text>
               </Box>
             ))}
          </SimpleGrid>
        </Box>

        {/* 4. Specializations & Languages */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
           <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
              <Heading size="md" mb={6} display="flex" align="center" gap={2}>
                <Icon as={FiAward} color="blue.400" /> Specializations
              </Heading>
              <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto" pr={2}>
                 {SPECIALIZATIONS.map(spec => (
                   <Checkbox 
                    key={spec} 
                    colorScheme="teal"
                    isChecked={profile.specializations.includes(spec)}
                    onChange={() => toggleItem('specializations', spec)}
                  >
                     <Text fontSize="sm">{spec}</Text>
                   </Checkbox>
                 ))}
              </VStack>
           </Box>

           <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
              <Heading size="md" mb={6} display="flex" align="center" gap={2}>
                <Icon as={FiGlobe} color="teal.400" /> Languages
              </Heading>
              <SimpleGrid columns={2} spacing={2}>
                 {LANGUAGES.map(lang => (
                   <Checkbox 
                    key={lang} 
                    colorScheme="teal"
                    isChecked={profile.languages.includes(lang)}
                    onChange={() => toggleItem('languages', lang)}
                  >
                     <Text fontSize="sm">{lang}</Text>
                   </Checkbox>
                 ))}
              </SimpleGrid>
           </Box>
        </SimpleGrid>

        {/* 5. Concerns & Affiliations */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Heading size="md" mb={6}>Additional Details</Heading>
          <VStack align="stretch" spacing={8}>
             <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">I can help clients with...</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                   {CONCERNS.map(concern => (
                     <Checkbox 
                      key={concern} 
                      colorScheme="teal"
                      isChecked={profile.concerns.includes(concern)}
                      onChange={() => toggleItem('concerns', concern)}
                    >
                       <Text fontSize="sm">{concern}</Text>
                     </Checkbox>
                   ))}
                </SimpleGrid>
             </FormControl>

             <Divider />

             <FormControl>
                <FormLabel fontSize="sm" fontWeight="700">Professional Affiliations</FormLabel>
                <HStack mb={4}>
                   <Input 
                    placeholder="e.g. American Psychological Association" 
                    bg="gray.50" border="none" borderRadius="xl"
                    value={newAffiliation}
                    onChange={(e) => setNewAffiliation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAffiliation()}
                   />
                   <Button leftIcon={<FiPlus />} colorScheme="teal" borderRadius="full" onClick={addAffiliation}>Add</Button>
                </HStack>
                <HStack spacing={2} flexWrap="wrap">
                   {profile.affiliations.map((aff, i) => (
                     <Tag key={i} size="lg" borderRadius="full" variant="subtle" colorScheme="blue">
                        <TagLabel>{aff}</TagLabel>
                        <TagCloseButton onClick={() => removeAffiliation(i)} />
                     </Tag>
                   ))}
                </HStack>
             </FormControl>

             <Divider />

             <SimpleGrid columns={2} spacing={8}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="700">Hourly Rate ($)</FormLabel>
                  <Input 
                    type="number"
                    bg="gray.50" border="none" borderRadius="xl"
                    value={profile.hourly_rate}
                    onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})}
                  />
                </FormControl>
             </SimpleGrid>
          </VStack>
        </Box>

        {/* Global Action Bar */}
        <Box 
          position="sticky" 
          bottom={10} 
          bg="rgba(255,255,255,0.8)" 
          backdropFilter="blur(10px)"
          p={6} 
          borderRadius="3xl" 
          shadow="2xl" 
          border="1px solid" 
          borderColor="gray.100"
          zIndex={100}
        >
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
               <Text fontWeight="700">Unsaved Changes</Text>
               <Text fontSize="xs" color="gray.500">Your profile is currently waiting to be synced.</Text>
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
              Sync Public Profile
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
