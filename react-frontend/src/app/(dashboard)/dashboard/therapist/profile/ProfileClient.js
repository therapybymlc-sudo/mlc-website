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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Select,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  Badge,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe 
} from "react-icons/fi";
import { apiGet, apiPut, apiPost } from "../../../../../api.js";

const CATEGORIES = {
  AGE_GROUPS: ["Children", "Pre-teens", "Adolescents", "Young adults", "Adults", "Older adults", "Couples", "Families"],
  MODALITIES: ["CBT", "DBT-informed", "Psychodynamic", "Humanistic", "ACT", "REBT", "Attachment-based", "Trauma-informed", "Gottman Method", "Narrative Therapy", "Existential"],
  LANGUAGES: ["English", "Arabic", "Hindi", "Urdu", "French", "Spanish"],
  POPULATIONS: ["Women", "Men", "LGBTQ+", "Neurodivergent", "Expats", "Working Professionals", "University Students"],
};

export default function ProfileClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const [profile, setProfile] = useState({
    // 1. Core Identity
    name: "",
    title: "",
    pronouns: "",
    headline: "",
    
    // 2. Credentials
    education: "",
    experience_years: 0,
    certifications: [],
    
    // 3. Populations
    populations_served: [],
    age_groups: [],
    languages: [],
    
    // 4. Clinical Scope
    concerns: [], // Array of objects { topic: string, level: 'often'|'comfortable'|'limited' }
    exclusions: [],
    complexity_level: "Moderate",
    
    // 5. Approach
    modalities: [],
    session_style: "", // Long text
    style_sliders: {
      structure: 50, // structured vs exploratory
      action: 50,    // reflective vs action-oriented
      pacing: 50,    // gentle vs direct
    },
    
    // 6. Availability & Fees
    is_accepting_new: true,
    hourly_rate: 0,
    cancellation_policy: "24-hour notice required",
    
    // 7. Media & Bio
    bio: "",
    welcome_message: "",
    faqs: [],
    
    // 8. Internal (Ideally sent to a different endpoint or handled server-side)
    internal_risk_level: "Moderate",
    best_fit_cases: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiGet("therapists/me/");
        if (data) setProfile(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.warn("Using local draft state");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (profile.id) {
        await apiPut(`therapists/${profile.id}/`, profile);
        toast({ title: "Profile Synced", status: "success" });
      } else {
        const created = await apiPost("therapists/", profile);
        setProfile(created);
        toast({ title: "Profile Initialized", status: "success" });
      }
    } catch (error) {
      toast({ title: "Sync failed", status: "error", description: "Please ensure all required fields are filled." });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (field, item) => {
    setProfile(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <Box maxW="1200px" mx="auto" pb={20}>
      <VStack align="stretch" spacing={6} mb={10}>
        <HStack justify="space-between">
           <Box>
              <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">Clinical Identity Editor</Heading>
              <Text color="gray.500" mt={1}>Define your professional presence and matching parameters.</Text>
           </Box>
           <Button 
            leftIcon={<FiSave />} 
            bg="#56756D" 
            color="white" 
            px={8} 
            borderRadius="full" 
            onClick={handleSave} 
            isLoading={loading}
            _hover={{ bg: '#C9A960' }}
            shadow="lg"
           >
            Sync Profile
           </Button>
        </HStack>
      </VStack>

      <Tabs variant="enclosed" onChange={(index) => setActiveTab(index)} colorScheme="teal">
        <TabList overflowX="auto" border="none" mb={8} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUser} mr={2}/> Identity</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiAward} mr={2}/> Credentials</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUsers} mr={2}/> Populations</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiTarget} mr={2}/> Clinical Scope</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiHeart} mr={2}/> Approach</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiClock} mr={2}/> Availability</Tab>
          <Tab _selected={{ color: '#56756D', borderColor: '#56756D', bg: 'white', fontWeight: 'bold' }} borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiBook} mr={2}/> Bio & Media</Tab>
          <Tab _selected={{ color: 'red.500', borderColor: 'red.200', bg: 'red.50', fontWeight: 'bold' }} borderRadius="xl" px={6} border="1px solid" borderColor="gray.100"><Icon as={FiSettings} mr={2}/> Internal</Tab>
        </TabList>

        <TabPanels bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          {/* 1. Identity */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <HStack spacing={10}>
                <VStack position="relative">
                  <Avatar size="2xl" name={profile.name} src={profile.imageUrl} bg="#56756D" />
                  <IconButton icon={<FiCamera />} size="sm" borderRadius="full" position="absolute" bottom={0} right={0} colorScheme="teal" aria-label="Upload Photo" />
                </VStack>
                <VStack align="stretch" flex={1} spacing={4}>
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                      <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="700">Pronouns</FormLabel>
                      <Input placeholder="e.g. She/Her" value={profile.pronouns} onChange={(e) => setProfile({...profile, pronouns: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="700">Professional Title</FormLabel>
                    <Input placeholder="e.g. Counselling Psychologist" value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                  </FormControl>
                </VStack>
              </HStack>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700">Short Headline</FormLabel>
                <Input placeholder="e.g. Working with anxiety, trauma, and relationship concerns" value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* 2. Credentials */}
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <SimpleGrid columns={2} spacing={4}>
                 <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">Highest Qualification</FormLabel>
                    <Input value={profile.qualification} onChange={(e) => setProfile({...profile, qualification: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                 </FormControl>
                 <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">Years of Post-Qual Experience</FormLabel>
                    <Input type="number" value={profile.experience_years} onChange={(e) => setProfile({...profile, experience_years: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                 </FormControl>
              </SimpleGrid>
              <Box p={6} border="2px dashed" borderColor="gray.200" borderRadius="2xl" textAlign="center">
                 <Icon as={FiAward} boxSize={10} color="gray.300" mb={2} />
                 <Text fontWeight="600" color="gray.500">Internal Credentialing (Visible to Admins Only)</Text>
                 <Text fontSize="xs" color="gray.400" mb={4}>Upload Degrees, Licenses, and Certifications</Text>
                 <Button leftIcon={<FiPlus />} size="sm" variant="outline" colorScheme="teal">Add Document</Button>
              </Box>
            </VStack>
          </TabPanel>

          {/* 3. Populations */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Alert status="info" variant="subtle" borderRadius="2xl" bg="rgba(86, 117, 109, 0.05)" color="mlc.greenDark">
                <AlertIcon color="mlc.green" />
                <Box>
                  <AlertTitle fontSize="sm">Specificity Improves Matching</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Choosing the <b>3-4 populations</b> you are most experienced with helps our algorithm find your ideal clients. Profiles that claim to treat everyone often rank lower in specialized search results.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <FormLabel fontWeight="700">Age Groups Served</FormLabel>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  {CATEGORIES.AGE_GROUPS.map(age => (
                    <Checkbox key={age} isChecked={profile.age_groups?.includes(age)} onChange={() => toggleArrayItem('age_groups', age)}>{age}</Checkbox>
                  ))}
                </SimpleGrid>
              </Box>
              <Divider/>
              <Box>
                <FormLabel fontWeight="700">Languages (Fluency Required)</FormLabel>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  {CATEGORIES.LANGUAGES.map(lang => (
                    <Checkbox key={lang} isChecked={profile.languages?.includes(lang)} onChange={() => toggleArrayItem('languages', lang)}>{lang}</Checkbox>
                  ))}
                </SimpleGrid>
              </Box>
              <Divider/>
              <Box>
                <FormLabel fontWeight="700">Identity Contexts (Select top 3-4)</FormLabel>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  {CATEGORIES.POPULATIONS.map(p => (
                    <Checkbox key={p} isChecked={profile.populations_served?.includes(p)} onChange={() => toggleArrayItem('populations_served', p)}>{p}</Checkbox>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </TabPanel>

          {/* 4. Clinical Scope */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Alert status="warning" variant="subtle" borderRadius="2xl" border="1px solid" borderColor="orange.100">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">SEO Advisory: Avoid "Generic" Profiles</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Search engines (and clients) value depth over breadth. <b>Intentionality matters.</b> Profiles that select too many specializations are often indexed lower. Focus on your core expertise for maximum visibility.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <FormLabel fontWeight="700">Presenting Concerns Management</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={4}>Which concerns do you actively work with? Be specific for better matching.</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {["Anxiety", "Depression", "Trauma", "Relationships", "Grief", "Work Stress", "Self-Esteem", "Parenting"].map(topic => (
                    <HStack key={topic} justify="space-between" p={3} bg="gray.50" borderRadius="xl">
                      <Text fontWeight="600">{topic}</Text>
                      <Select size="xs" variant="filled" bg="white" w="120px" borderRadius="lg">
                        <option>Choose Level</option>
                        <option>Works Often</option>
                        <option>Comfortable</option>
                        <option>Limited</option>
                      </Select>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>
              <FormControl>
                <FormLabel fontWeight="700" color="red.500">Exclusions (Internal Matching)</FormLabel>
                <Textarea placeholder="List specific presentations you DO NOT TREAT (e.g. active suicidality, forensic cases). This ensures safe and appropriate referrals." borderRadius="xl" />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* 5. Approach */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
              <Box>
                <FormLabel fontWeight="700">Therapeutic Modalities</FormLabel>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                  {CATEGORIES.MODALITIES.map(m => (
                    <Checkbox key={m} isChecked={profile.modalities?.includes(m)} onChange={() => toggleArrayItem('modalities', m)}>{m}</Checkbox>
                  ))}
                </SimpleGrid>
              </Box>
              
              <Box bg="#F9FAFB" p={8} borderRadius="3xl">
                <Heading size="sm" mb={6}>Therapy Dynamics (Matching Sliders)</Heading>
                <VStack spacing={8}>
                   <Box w="100%">
                      <HStack justify="space-between" mb={2}><Text fontSize="xs" color="gray.500">Structured</Text><Text fontSize="xs" color="gray.500">Exploratory</Text></HStack>
                      <Slider defaultValue={50} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb /></Slider>
                   </Box>
                   <Box w="100%">
                      <HStack justify="space-between" mb={2}><Text fontSize="xs" color="gray.500">Gentle Pacing</Text><Text fontSize="xs" color="gray.500">Direct / Challenging</Text></HStack>
                      <Slider defaultValue={50} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb /></Slider>
                   </Box>
                   <Box w="100%">
                      <HStack justify="space-between" mb={2}><Text fontSize="xs" color="gray.500">Past-Focused</Text><Text fontSize="xs" color="gray.500">Present-Focused</Text></HStack>
                      <Slider defaultValue={50} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb /></Slider>
                   </Box>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* 6. Availability */}
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" fontWeight="700">Accepting New Clients</FormLabel>
                <Checkbox size="lg" colorScheme="teal" isChecked={profile.is_accepting_new} onChange={(e) => setProfile({...profile, is_accepting_new: e.target.checked})}/>
              </FormControl>
              <SimpleGrid columns={2} spacing={4}>
                 <FormControl>
                    <FormLabel fontWeight="700">Standard Session Fee</FormLabel>
                    <HStack>
                       <Text fontWeight="bold">KD</Text>
                       <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})} borderRadius="xl" />
                    </HStack>
                 </FormControl>
                 <FormControl>
                    <FormLabel fontWeight="700">Sliding Scale Available?</FormLabel>
                    <Select borderRadius="xl"><option>No</option><option>Yes (Limited slots)</option><option>Yes (Waitlist only)</option></Select>
                 </FormControl>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* 7. Bio & Content */}
          <TabPanel>
             <VStack align="stretch" spacing={6}>
               <FormControl>
                 <FormLabel fontWeight="700">Professional Bio (Public)</FormLabel>
                 <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} borderRadius="2xl" rows={8} />
               </FormControl>
               <FormControl>
                 <FormLabel fontWeight="700">Welcome Message (For first-timers)</FormLabel>
                 <Textarea placeholder="Reassure someone who is new to therapy..." value={profile.welcome_message} onChange={(e) => setProfile({...profile, welcome_message: e.target.value})} borderRadius="2xl" />
               </FormControl>
             </VStack>
          </TabPanel>

          {/* 8. Internal Matching */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Box bg="red.50" p={8} borderRadius="3xl" border="1px solid" borderColor="red.100" shadow="sm">
                <HStack color="red.600" mb={6}><Icon as={FiAlertCircle} boxSize={5}/><Text fontWeight="bold" fontSize="lg">Internal Clinical Governance</Text></HStack>
                
                <VStack align="stretch" spacing={8}>
                   <Box>
                      <Heading size="xs" mb={4} textTransform="uppercase" letterSpacing="widest" color="red.700">Risk Thresholds</Heading>
                      <FormControl>
                          <FormLabel fontSize="sm">Maximum Risk Level Capacity</FormLabel>
                          <Select variant="filled" bg="white" value={profile.internal_risk_level} onChange={(e) => setProfile({...profile, internal_risk_level: e.target.value})}>
                            <option value="Mild">Mild Presentation only (Standard cases)</option>
                            <option value="Moderate">Moderate (Stable presentations)</option>
                            <option value="High">High Risk (Requires specialized monitoring)</option>
                          </Select>
                      </FormControl>
                   </Box>

                   <Divider borderColor="red.200" />

                   <Box>
                      <Heading size="xs" mb={2} textTransform="uppercase" letterSpacing="widest" color="red.700">Emergency Risk Protocols</Heading>
                      <Text fontSize="xs" color="red.600" mb={6}>Please provide exact details for your clinical escalation path. This is mandatory for therapist verification.</Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                         <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Collaborating Psychiatrist Name</FormLabel>
                            <Input bg="white" placeholder="Dr. Full Name" />
                         </FormControl>
                         <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Primary Emergency Hospital</FormLabel>
                            <Input bg="white" placeholder="Hospital Name" />
                         </FormControl>
                         <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Hospital Location / Branch</FormLabel>
                            <Input bg="white" placeholder="City, Area" />
                         </FormControl>
                         <FormControl isRequired>
                            <FormLabel fontSize="xs" fontWeight="bold">Emergency Contact Number</FormLabel>
                            <Input bg="white" placeholder="+91 / +965 ..." />
                         </FormControl>
                      </SimpleGrid>
                      <FormControl mt={4}>
                         <FormLabel fontSize="xs" fontWeight="bold">Additional Escalation Notes</FormLabel>
                         <Textarea bg="white" placeholder="Specific steps for high-risk referrals..." borderRadius="xl" />
                      </FormControl>
                   </Box>

                   <Divider borderColor="red.200" />

                   <FormControl>
                      <FormLabel fontSize="sm">Internal Matching Notes</FormLabel>
                      <Textarea bg="white" placeholder="e.g. Best with high-functioning executives, avoid court-involved cases..." borderRadius="xl" />
                   </FormControl>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Box mt={12} p={8} bg="#56756D" borderRadius="3xl" color="white">
         <HStack justify="space-between">
            <VStack align="start" spacing={0}>
               <Text fontWeight="bold" fontSize="lg">Ready to update your public profile?</Text>
               <Text fontSize="sm" opacity="0.8">Click sync to push all changes to the MLC therapist directory and matching engine.</Text>
            </VStack>
            <Button size="lg" bg="white" color="#56756D" borderRadius="full" px={10} isLoading={loading} onClick={handleSave} _hover={{ bg: '#C9A960', color: 'white' }}>Finalize & Sync</Button>
         </HStack>
      </Box>
    </Box>
  );
}
