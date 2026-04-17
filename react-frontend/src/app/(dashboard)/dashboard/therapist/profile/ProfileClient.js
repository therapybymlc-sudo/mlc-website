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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe, FiInfo 
} from "react-icons/fi";
import { apiGet, apiPut, apiPost } from "../../../../../api.js";

const CLINICAL_MODALITIES = [
  "CBT", "DBT-informed", "Psychodynamic", "Humanistic", "ACT", "REBT", 
  "Attachment-based", "Trauma-informed", "Gottman Method", "Narrative Therapy", 
  "Existential", "EMDR", "Internal Family Systems (IFS)", "Schema Therapy"
];

const IDENTITY_CONTEXTS = [
  "Expats in foreign countries", "Digital Nomads", "Third Culture Kids (TCKs)",
  "South Asian Diaspora", "LGBTQ+ / Queer Identity", "Neurodivergent (ADHD/Autism)",
  "Interfaith / Mixed Heritage Families", "International Students",
  "High-Stakes Professionals", "Survivors of Relational Trauma"
];

const PRESET_KEYWORDS = ["Anxiety", "Depression", "Trauma", "Mindfulness", "Self-Worth", "Burnout"];

const CURRENCIES = [
  { code: "KD", label: "Kuwaiti Dinar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "USD", label: "US Dollar" },
  { code: "AED", label: "UAE Dirham" },
  { code: "GBP", label: "British Pound" }
];

const ALL_LANGUAGES = [
  "English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "French", "Spanish", "German", "Mandarin", "Portuguese", "Bengali", "Telugu", "Marathi"
];

const FLUENCY_LEVELS = ["Conversational", "Professional Working Proficiency", "Fluent / Native"];

export default function ProfileClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    pronouns: "",
    headline: "",
    education: "",
    experience_years: 0,
    
    // Complex structures
    languages_info: [], // [{ lang: string, fluency: string }]
    modalities_info: [], // [{ name: string, training: string, supervision: string }]
    
    populations_served: [],
    identity_contexts: [],
    age_groups: [],
    
    concerns_levels: {}, // { "Anxiety": "Works Often" }
    exclusions: "",
    
    session_style: "",
    style_sliders: { structure: 50, pacing: 50, orientation: 50 },
    
    is_accepting_new: true,
    currency: "KD",
    hourly_rate: 0,
    
    bio: "",
    welcome_message: "",
    keywords: [],
    
    internal_risk_level: "Moderate",
    risk_protocols: { psychiatrist: "", hospital: "", location: "", contact: "", notes: "" }
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
      toast({ title: "Sync failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim() || profile.keywords.length >= 6) return;
    const corrected = keywordInput.trim().charAt(0).toUpperCase() + keywordInput.trim().slice(1).toLowerCase();
    if (!profile.keywords.includes(corrected)) {
      setProfile({...profile, keywords: [...profile.keywords, corrected]});
    }
    setKeywordInput("");
  };

  const toggleModality = (name) => {
    const exists = profile.modalities_info.find(m => m.name === name);
    if (exists) {
      setProfile({...profile, modalities_info: profile.modalities_info.filter(m => m.name !== name)});
    } else {
      setProfile({...profile, modalities_info: [...profile.modalities_info, { name, training: "", supervision: "" }]});
    }
  };

  const toggleLanguage = (lang) => {
    const exists = profile.languages_info.find(l => l.lang === lang);
    if (exists) {
      setProfile({...profile, languages_info: profile.languages_info.filter(l => l.lang !== lang)});
    } else {
      setProfile({...profile, languages_info: [...profile.languages_info, { lang, fluency: "Fluent / Native" }]});
    }
  };

  return (
    <Box maxW="1200px" mx="auto" pb={20}>
      <VStack align="stretch" spacing={6} mb={10}>
        <HStack justify="space-between">
           <Box>
              <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">Expertise & Public Profile</Heading>
              <Text color="gray.500" mt={1}>Manage your clinical presence and matching parameters.</Text>
           </Box>
           <Button leftIcon={<FiSave />} bg="#56756D" color="white" px={8} borderRadius="full" onClick={handleSave} isLoading={loading} _hover={{ bg: '#C9A960' }} shadow="xl">Sync Profile</Button>
        </HStack>
      </VStack>

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList overflowX="auto" border="none" mb={8}>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUser} mr={2}/> Identity</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiAward} mr={2}/> Credentials</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUsers} mr={2}/> Populations</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiTarget} mr={2}/> Clinical Scope</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiHeart} mr={2}/> Approach</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiClock} mr={2}/> Availability</Tab>
          <Tab borderRadius="xl" px={6} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiBook} mr={2}/> Bio & Content</Tab>
          <Tab _selected={{ color: 'red.500', bg: 'red.50' }} borderRadius="xl" px={6} border="1px solid" borderColor="gray.100"><Icon as={FiSettings} mr={2}/> Internal</Tab>
        </TabList>

        <TabPanels bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          {/* 1. Identity */}
          <TabPanel>
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <VStack align="stretch" spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Full Name</FormLabel>
                      <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="700">Professional Headline (Public)</FormLabel>
                      <Input placeholder="e.g. Trauma-informed therapist specializing in Diaspora identity" value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                </VStack>
                <VStack align="center" justify="center">
                   <Avatar size="2xl" name={profile.name} src={profile.imageUrl} bg="#56756D" />
                   <Button leftIcon={<FiCamera />} size="xs" variant="ghost" mt={2}>Change Photo</Button>
                </VStack>
             </SimpleGrid>
          </TabPanel>

          {/* 2. Credentials */}
          <TabPanel>
             <VStack align="stretch" spacing={6}>
                 <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="700">Highest Degree</FormLabel>
                      <Input value={profile.education} onChange={(e) => setProfile({...profile, education: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="700">Years of Experience</FormLabel>
                      <Input type="number" value={profile.experience_years} onChange={(e) => setProfile({...profile, experience_years: e.target.value})} borderRadius="xl" bg="gray.50" border="none" />
                    </FormControl>
                 </SimpleGrid>
             </VStack>
          </TabPanel>

          {/* 3. Populations & Languages */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Alert status="info" variant="subtle" borderRadius="2xl" bg="rgba(86, 117, 109, 0.05)">
                <AlertIcon color="mlc.green" />
                <Box>
                  <AlertTitle fontSize="sm">Intentional Matching</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Choose only the populations you are <b>most experienced</b> with. This helps our algorithm find your ideal clients. Profiles that claim to treat everyone often rank lower in specialized search results.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <FormLabel fontWeight="700">Identity Contexts</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  {IDENTITY_CONTEXTS.map(ctx => (
                    <Checkbox key={ctx} isChecked={profile.identity_contexts?.includes(ctx)} onChange={(e) => {
                       const current = profile.identity_contexts || [];
                       const updated = e.target.checked ? [...current, ctx] : current.filter(c => c !== ctx);
                       setProfile({...profile, identity_contexts: updated});
                    }}>{ctx}</Checkbox>
                  ))}
                </SimpleGrid>
              </Box>

              <Divider />

              <Box>
                <FormLabel fontWeight="700">Language Proficiency</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={4}>Select languages and indicate your fluency level for session conduct.</Text>
                <VStack align="stretch" spacing={4}>
                  <Wrap spacing={2}>
                    {ALL_LANGUAGES.map(lang => (
                      <Tag 
                        key={lang} 
                        cursor="pointer" 
                        variant={profile.languages_info.find(l => l.lang === lang) ? "solid" : "outline"}
                        colorScheme={profile.languages_info.find(l => l.lang === lang) ? "teal" : "gray"}
                        onClick={() => toggleLanguage(lang)}
                        borderRadius="full"
                      >
                        {lang}
                      </Tag>
                    ))}
                  </Wrap>
                  {profile.languages_info.map((linfo, idx) => (
                    <HStack key={linfo.lang} bg="gray.50" p={3} borderRadius="xl" justify="space-between">
                       <Text fontWeight="bold" fontSize="sm">{linfo.lang}</Text>
                       <Select 
                        size="sm" bg="white" w="200px" borderRadius="lg"
                        value={linfo.fluency}
                        onChange={(e) => {
                          const updated = [...profile.languages_info];
                          updated[idx].fluency = e.target.value;
                          setProfile({...profile, languages_info: updated});
                        }}
                       >
                         {FLUENCY_LEVELS.map(f => <option key={f} value={f}>{f}</option>)}
                       </Select>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* 4. Clinical Scope */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
              <Alert status="warning" variant="subtle" borderRadius="2xl">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Avoid Generic Profiles</AlertTitle>
                  <AlertDescription fontSize="xs">
                    We (and clients) value depth over breadth. <b>Intentionality matters.</b> Profiles that select too many specializations are often indexed lower. Focus on your core expertise for maximum visibility.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <FormLabel fontWeight="700">Presenting Concerns Management</FormLabel>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {["Anxiety", "Depression", "Trauma", "Relationships", "Stress / Burnout", "Grief", "Self-Esteem", "Parenting"].map(topic => (
                    <HStack key={topic} justify="space-between" p={3} bg="gray.50" borderRadius="xl">
                      <Text fontWeight="600" fontSize="sm">{topic}</Text>
                      <Select 
                        size="xs" variant="filled" bg="white" w="120px" borderRadius="lg"
                        value={profile.concerns_levels?.[topic] || ""}
                        onChange={(e) => setProfile({...profile, concerns_levels: { ...profile.concerns_levels, [topic]: e.target.value }})}
                      >
                        <option value="">Select Level</option>
                        <option>Works Often</option>
                        <option>Comfortable</option>
                        <option>Limited</option>
                      </Select>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </TabPanel>

          {/* 5. Therapeutic Approach */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
              <Box>
                <FormLabel fontWeight="700">Clinical Modalities</FormLabel>
                <Text fontSize="xs" color="gray.500" mb={4}>
                  Choose only modalities you have been <b>trained and supervised in</b>. 
                  Selecting too many will lead to lower indexing due to generic profile.
                </Text>
                <Wrap spacing={3} mb={8}>
                  {CLINICAL_MODALITIES.map(m => (
                    <Tag 
                       key={m} cursor="pointer" borderRadius="full" px={4} py={2}
                       variant={profile.modalities_info.find(mi => mi.name === m) ? "solid" : "outline"}
                       colorScheme="teal"
                       onClick={() => toggleModality(m)}
                    >
                      {m}
                    </Tag>
                  ))}
                </Wrap>

                <Alert status="info" variant="left-accent" mb={6} borderRadius="md" size="sm">
                   <AlertIcon />
                   <Text fontSize="xs">Non-practical trainings with no supervised follow-through will be periodically reviewed to maintain MLC standards.</Text>
                </Alert>

                <VStack align="stretch" spacing={6}>
                   {profile.modalities_info.map((mi, idx) => (
                     <Box key={mi.name} p={6} border="1px solid" borderColor="teal.100" bg="teal.50" borderRadius="2xl">
                        <HStack mb={4} justify="space-between">
                           <Heading size="sm" color="teal.800">{mi.name}</Heading>
                           <Badge colorScheme="teal">Mandatory Internal Log</Badge>
                        </HStack>
                        <SimpleGrid columns={1} spacing={4}>
                           <FormControl>
                              <FormLabel fontSize="xs" fontWeight="bold">Training Background</FormLabel>
                              <Textarea 
                                bg="white" placeholder="Institutions, certification details, hours..." fontSize="sm"
                                value={mi.training}
                                onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].training = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }}
                              />
                           </FormControl>
                           <FormControl>
                              <FormLabel fontSize="xs" fontWeight="bold">Supervision Received</FormLabel>
                              <Textarea 
                                bg="white" placeholder="Supervisor Name, Duration, Position, Contact Details..." fontSize="sm"
                                value={mi.supervision}
                                onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].supervision = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }}
                              />
                           </FormControl>
                        </SimpleGrid>
                     </Box>
                   ))}
                </VStack>
              </Box>
            </VStack>
          </TabPanel>

          {/* 6. Availability & Fees */}
          <TabPanel>
             <VStack align="stretch" spacing={8}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                   <FormControl>
                      <FormLabel fontWeight="700">Currency</FormLabel>
                      <Select value={profile.currency} onChange={(e) => setProfile({...profile, currency: e.target.value})} borderRadius="xl">
                         {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label} ({c.code})</option>)}
                      </Select>
                   </FormControl>
                   <FormControl>
                      <FormLabel fontWeight="700">Individual Session Fee</FormLabel>
                      <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})} borderRadius="xl" />
                   </FormControl>
                   <FormControl>
                      <FormLabel fontWeight="700">Sliding Scale</FormLabel>
                      <Select bg="gray.100" cursor="not-allowed"><option>Coming Soon (In Development)</option></Select>
                   </FormControl>
                </SimpleGrid>
             </VStack>
          </TabPanel>

          {/* 7. Bio & Content */}
          <TabPanel>
             <VStack align="stretch" spacing={8}>
                <FormControl>
                   <FormLabel fontWeight="700">Clinical Bio (Public)</FormLabel>
                   <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} borderRadius="2xl" rows={8} placeholder="Write something meaningful for your clients..." />
                </FormControl>

                <Box bg="#F9FBFA" p={8} borderRadius="3xl">
                   <HStack justify="space-between" mb={4}>
                      <Heading size="sm">Search Keywords / Skill Tags</Heading>
                      <Badge borderRadius="full" px={3}>{profile.keywords.length} / 6</Badge>
                   </HStack>
                   <Text fontSize="xs" color="gray.500" mb={4}>These appear as bubbles on your public profile to boost SEO. Click to add presets or type your own.</Text>
                   
                   <Wrap spacing={2} mb={6}>
                      {PRESET_KEYWORDS.map(kw => (
                        <Tag 
                          key={kw} cursor="pointer" variant="subtle" colorScheme="gray" borderRadius="full"
                          onClick={() => {
                             if (!profile.keywords.includes(kw) && profile.keywords.length < 6) {
                               setProfile({...profile, keywords: [...profile.keywords, kw]});
                             }
                          }}
                        >
                           <Icon as={FiPlus} mr={1} boxSize={3}/>{kw}
                        </Tag>
                      ))}
                   </Wrap>

                   <HStack mb={4}>
                      <Input 
                        placeholder="Type a clinical keyword..." 
                        value={keywordInput} 
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                      />
                      <Button colorScheme="teal" onClick={handleAddKeyword} isDisabled={profile.keywords.length >= 6}>Add</Button>
                   </HStack>

                   <Wrap spacing={3}>
                      {profile.keywords.map(kw => (
                        <Tag key={kw} size="lg" colorScheme="teal" borderRadius="full">
                           <TagLabel>{kw}</TagLabel>
                           <TagCloseButton onClick={() => setProfile({...profile, keywords: profile.keywords.filter(k => k !== kw)})}/>
                        </Tag>
                      ))}
                   </Wrap>
                </Box>
             </VStack>
          </TabPanel>

          {/* 8. Internal Clinical Governance */}
          <TabPanel>
             <VStack align="stretch" spacing={8}>
                <Box bg="red.50" p={8} borderRadius="3xl" border="1px solid" borderColor="red.100" shadow="sm">
                   <HStack color="red.600" mb={6}><Icon as={FiAlertCircle} boxSize={5}/><Heading size="sm">Escalation & Ethics Log</Heading></HStack>
                   
                   <Alert status="error" variant="left-accent" mb={8} bg="white">
                      <AlertIcon />
                      <Text fontSize="xs" color="red.700">
                        Information in this section is <b>periodically reviewed</b> to maintain ethical standards. 
                        False or incomplete risk protocols may lead to profile removal.
                      </Text>
                   </Alert>

                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Collaborating Psychiatrist</FormLabel>
                        <Input bg="white" placeholder="Dr. Name" value={profile.risk_protocols.psychiatrist} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, psychiatrist: e.target.value}})} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Primary Emergency Hospital</FormLabel>
                        <Input bg="white" placeholder="Hospital Name" value={profile.risk_protocols.hospital} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, hospital: e.target.value}})} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Hospital Location</FormLabel>
                        <Input bg="white" placeholder="City / Branch" value={profile.risk_protocols.location} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, location: e.target.value}})} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Emergency Contact</FormLabel>
                        <Input bg="white" placeholder="Phone No." value={profile.risk_protocols.contact} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, contact: e.target.value}})} />
                      </FormControl>
                   </SimpleGrid>
                </Box>
             </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
