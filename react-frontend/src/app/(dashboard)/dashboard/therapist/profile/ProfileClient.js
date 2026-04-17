'use client'

import React, { useState, useEffect } from "react";
import {
  Box, VStack, HStack, Heading, Text, Input, Button, FormControl, FormLabel, SimpleGrid, useToast, Icon, Avatar, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, Stack, Select, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Tag, TagLabel, TagCloseButton, Divider, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Wrap, WrapItem, 
} from "@chakra-ui/react";
import { 
  FiUser, FiAward, FiUsers, FiTarget, FiHeart, FiClock, FiBook, FiSettings, 
  FiSave, FiCamera, FiPlus, FiAlertCircle, FiGlobe, FiBriefcase, FiZap
} from "react-icons/fi";
import { apiGet, apiPut, apiPost } from "../../../../../api.js";

// ===========================
// 🔹 Constants & Presets
// ===========================

const CATEGORIES = {
  AGE_GROUPS: ["Children", "Pre-teens", "Adolescents", "Young adults", "Adults", "Older adults", "Couples", "Families", "Parents"],
  CLINICAL_ROLES: ["Counselling Psychologist", "Clinical Psychologist", "Psychotherapist", "Psychologist in training", "Marriage and Family Therapist", "Counsellor"],
  MODALITIES: ["CBT", "DBT-informed", "Psychodynamic", "Humanistic", "ACT", "REBT", "Attachment-based", "Trauma-informed", "Gottman Method", "Narrative Therapy", "Existential", "EMDR", "IFS", "Schema Therapy"],
  LANGUAGES: ["English", "Arabic", "Hindi", "Urdu", "Malayalam", "Tamil", "French", "Spanish"],
  POPULATIONS: ["Women", "Men", "LGBTQ+", "Non-binary", "Expats in foreign countries", "Digital Nomads", "International Students", "Working Professionals", "Neurodivergent (ADHD/Autism)", "South Asian Diaspora", "Interfaith Families"],
  CONCERNS: [
    "Anxiety (Generalized, Panic, Social)", 
    "Depression & Low Mood", 
    "Complex Trauma (CPTSD)", 
    "Childhood / Developmental Trauma",
    "Identity & Self-Esteem", 
    "Relationships & Attachment", 
    "Neurodivergence (ADHD/Autism Support)",
    "Workplace Burnout & High-Performance Stress",
    "Grief, Loss & Life Transitions",
    "Personality-related Difficulties (e.g. BPD traits)",
    "Body Image & Eating Concerns",
    "Sleep & Psychosomatic Symptoms",
    "Postpartum & Women's Mental Health",
    "Addiction & Substance Use Recovery",
    "Acute Stress & Crisis Intervention"
  ],
  SKILL_PRESETS: ["Trauma-Informed", "LGBTQ+ Affirming", "Neurodiversity-Affirming", "Crisis Intervention", "Goal-Oriented", "Deep Reflection"]
};

const FLUENCY_LEVELS = ["Conversational", "Professional Working Proficiency", "Fluent / Native"];
const CURRENCIES = ["KD", "INR", "USD", "AED", "GBP"];

export default function ProfileClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  
  const [profile, setProfile] = useState({
    // 1. Identity
    name: "",
    title: "",
    pronouns: "",
    headline: "",
    
    // 2. Credentials
    qualification_highest: "",
    qualification_title: "",
    university: "",
    year_completed: "",
    experience_years: 0,
    experience_post_qual: 0,
    license_details: "",
    
    // 3. Pro Role
    professional_role: "",
    scope_of_practice: "",
    not_treated: "",
    complexity_comfort: "Moderate",
    independence_level: "Independent",

    // 4. Populations & Languages
    age_groups: [],
    identity_contexts: [],
    languages_info: [], // [{ lang: string, fluency: string }]
    
    // 5. Clinical Scope
    concerns_levels: {}, 
    exclusions: "",
    
    // 6. Approach
    primary_orientation: "",
    secondary_modalities: [],
    modalities_info: [], // [{ name, training, supervision }]
    primary_lens: "",
    pacing: 50, structure: 50, action: 50,
    
    // 7. Availability & Fees
    is_accepting_new: true,
    currency: "KD",
    hourly_rate: 0,
    cancellation_policy: "24-hour notice required",
    session_modes: ["Online Video"],
    locations: "",

    // 8. Media & Bio
    bio: "",
    welcome_note: "",
    faqs: [{ q: "What happens in the first session?", a: "" }],
    keywords: [],

    // 9. Internal
    internal_risk_level: "Moderate",
    risk_protocols: { psychiatrist: "", hospital: "", location: "", contact: "", notes: "" },
    best_fit_notes: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiGet("therapists/me/");
        if (data) setProfile(prev => ({ ...prev, ...data }));
      } catch (error) {
        console.warn("Using local draft");
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

  const handleKeywordAdd = () => {
    if (!keywordInput.trim() || profile.keywords?.length >= 6) return;
    const corrected = keywordInput.trim().charAt(0).toUpperCase() + keywordInput.trim().slice(1).toLowerCase();
    if (!profile.keywords.includes(corrected)) {
      setProfile({...profile, keywords: [...(profile.keywords || []), corrected]});
    }
    setKeywordInput("");
  };

  const toggleArray = (field, item) => {
    const current = profile[field] || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setProfile({...profile, [field]: updated});
  };

  return (
    <Box maxW="1200px" mx="auto" pb={20}>
      <VStack align="stretch" spacing={6} mb={10}>
        <HStack justify="space-between">
           <Box>
              <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">Cinician Identity Hub</Heading>
              <Text color="gray.500" mt={1}>Define your professional scope, expertise, and public presence.</Text>
           </Box>
           <Button leftIcon={<FiSave />} bg="#56756D" color="white" px={10} borderRadius="full" onClick={handleSave} isLoading={loading} _hover={{ bg: '#C9A960' }} shadow="xl">Finalize & Sync</Button>
        </HStack>
      </VStack>

      <Tabs variant="enclosed" colorScheme="teal" isLazy>
        <TabList overflowX="auto" border="none" mb={8} sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUser} mr={2}/> Identity</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiAward} mr={2}/> Credentials</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiUsers} mr={2}/> Populations</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiTarget} mr={2}/> Scope</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiHeart} mr={2}/> Approach</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiClock} mr={2}/> Availability</Tab>
          <Tab borderRadius="xl" px={8} mr={2} border="1px solid" borderColor="gray.100"><Icon as={FiBook} mr={2}/> Bio & Media</Tab>
          <Tab _selected={{ color: 'red.500', bg: 'red.50' }} borderRadius="xl" px={8} border="1px solid" borderColor="gray.100"><Icon as={FiSettings} mr={2}/> Internal</Tab>
        </TabList>

        <TabPanels bg="white" p={10} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          {/* 1. Identity */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
               <VStack align="stretch" spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">Full Name</FormLabel>
                    <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Professional Title</FormLabel>
                    <Input placeholder="e.g. Counselling Psychologist" value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Pronouns</FormLabel>
                    <Input placeholder="She / Her" value={profile.pronouns} onChange={(e) => setProfile({...profile, pronouns: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontWeight="700">Public Headline</FormLabel>
                    <Input placeholder="Focused on trauma and relationship wellness..." value={profile.headline} onChange={(e) => setProfile({...profile, headline: e.target.value})} variant="filled" borderRadius="xl" />
                  </FormControl>
               </VStack>
               <VStack align="center" justify="center">
                  <Avatar size="2xl" name={profile.name} src={profile.imageUrl} bg="#56756D" />
                  <Button mt={4} leftIcon={<FiCamera />} variant="ghost" size="sm">Update Profile Picture</Button>
               </VStack>
            </SimpleGrid>
          </TabPanel>

          {/* 2. Credentials */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Highest Qualification</FormLabel>
                    <Input placeholder="e.g. Ph.D, M.Phil" value={profile.qualification_highest} onChange={(e) => setProfile({...profile, qualification_highest: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Degree Title</FormLabel>
                    <Input placeholder="Psychology" value={profile.qualification_title} onChange={(e) => setProfile({...profile, qualification_title: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">University / Institution</FormLabel>
                    <Input value={profile.university} onChange={(e) => setProfile({...profile, university: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Year Completed</FormLabel>
                    <Input type="number" value={profile.year_completed} onChange={(e) => setProfile({...profile, year_completed: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </SimpleGrid>
               <Divider />
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Total Years of Experience</FormLabel>
                    <Input type="number" value={profile.experience_years} onChange={(e) => setProfile({...profile, experience_years: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Post-Qualification Years</FormLabel>
                    <Input type="number" value={profile.experience_post_qual} onChange={(e) => setProfile({...profile, experience_post_qual: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </SimpleGrid>
               <FormControl>
                  <FormLabel fontWeight="700">License / Registration Details</FormLabel>
                  <Textarea value={profile.license_details} onChange={(e) => setProfile({...profile, license_details: e.target.value})} borderRadius="xl" />
               </FormControl>
               <Box p={8} border="2px dashed" borderColor="gray.200" borderRadius="3xl" textAlign="center">
                  <Icon as={FiBriefcase} boxSize={8} color="gray.300" mb={2} />
                  <Text fontWeight="600" color="gray.500">Professional Documents (Internal Only)</Text>
                  <Text fontSize="xs" color="gray.400" mb={4}>Degree Certificate, CV/Resume, License Proof</Text>
                  <Button size="sm" colorScheme="teal" variant="outline">Upload Files</Button>
               </Box>
            </VStack>
          </TabPanel>

          {/* 3. Populations & Languages */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Alert status="info" variant="subtle" borderRadius="2xl" bg="rgba(86, 117, 109, 0.05)">
                  <AlertIcon color="mlc.green" />
                  <Box>
                    <AlertTitle fontSize="sm">Specificity and Ideal Matching</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Make sure to choose only populations you are most experienced with, this helps our algorithm find your ideal clients. Profiles that claim to treat everyone often rank lower in specialized search results.
                    </AlertDescription>
                  </Box>
               </Alert>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Age Groups Served</FormLabel>
                  <Wrap spacing={3}>
                     {CATEGORIES.AGE_GROUPS.map(age => (
                       <Checkbox key={age} isChecked={profile.age_groups?.includes(age)} onChange={() => toggleArray('age_groups', age)}>{age}</Checkbox>
                     ))}
                  </Wrap>
               </Box>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Language Proficiency</FormLabel>
                  <Wrap spacing={2} mb={4}>
                    {CATEGORIES.LANGUAGES.map(lang => (
                      <Tag key={lang} cursor="pointer" variant={profile.languages_info?.find(l => l.lang === lang) ? "solid" : "outline"} colorScheme="teal" onClick={() => {
                         const exists = profile.languages_info?.find(l => l.lang === lang);
                         const updated = exists ? profile.languages_info.filter(l => l.lang !== lang) : [...(profile.languages_info || []), { lang, fluency: "Fluent" }];
                         setProfile({...profile, languages_info: updated});
                      }} borderRadius="full">{lang}</Tag>
                    ))}
                  </Wrap>
                  {profile.languages_info?.map((info, idx) => (
                    <HStack key={info.lang} bg="gray.50" p={3} borderRadius="xl" justify="space-between" mb={2}>
                       <Text fontWeight="bold" fontSize="sm">{info.lang}</Text>
                       <Select size="sm" bg="white" w="220px" borderRadius="lg" value={info.fluency} onChange={(e) => {
                          const updated = [...profile.languages_info];
                          updated[idx].fluency = e.target.value;
                          setProfile({...profile, languages_info: updated});
                       }}>
                         {FLUENCY_LEVELS.map(f => <option key={f} value={f}>{f}</option>)}
                       </Select>
                    </HStack>
                  ))}
               </Box>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Identity Contexts & Experiences</FormLabel>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                     {CATEGORIES.POPULATIONS.map(p => (
                       <Checkbox key={p} isChecked={profile.identity_contexts?.includes(p)} onChange={() => toggleArray('identity_contexts', p)}>{p}</Checkbox>
                     ))}
                  </SimpleGrid>
               </Box>
            </VStack>
          </TabPanel>

          {/* 4. Scope */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Alert status="warning" variant="subtle" borderRadius="2xl">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Avoid Generic Profiles</AlertTitle>
                    <AlertDescription fontSize="xs">
                      We (and clients) value depth over breadth. Intentionality matters. Profiles that select too many specializations are often indexed lower. Focus on your core expertise for maximum visibility.
                    </AlertDescription>
                  </Box>
               </Alert>

               <Box>
                  <FormLabel fontWeight="800" mb={4}>Professional Role & Practice</FormLabel>
                  <SimpleGrid columns={2} spacing={4} mb={6}>
                     <FormControl>
                        <FormLabel fontSize="xs">Primary Role</FormLabel>
                        <Select value={profile.professional_role} onChange={(e) => setProfile({...profile, professional_role: e.target.value})} borderRadius="xl">
                           <option>Select Role</option>
                           {CATEGORIES.CLINICAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                     </FormControl>
                     <FormControl>
                        <FormLabel fontSize="xs">Complexity Handling</FormLabel>
                        <Select value={profile.complexity_comfort} onChange={(e) => setProfile({...profile, complexity_comfort: e.target.value})} borderRadius="xl">
                           <option value="Mild">Mild presentations</option>
                           <option value="Moderate">Moderate distress</option>
                           <option value="High">High complexity (Clinical focus)</option>
                        </Select>
                     </FormControl>
                  </SimpleGrid>
                  <SimpleGrid columns={1} spacing={6}>
                     <FormControl>
                        <FormLabel fontWeight="700">Scope of Practice</FormLabel>
                        <Textarea placeholder="Define your clinical boundaries..." value={profile.scope_of_practice} onChange={(e) => setProfile({...profile, scope_of_practice: e.target.value})} borderRadius="xl" />
                     </FormControl>
                     <FormControl>
                        <FormLabel fontWeight="700">Specific Presentations Not Treated</FormLabel>
                        <Textarea placeholder="e.g. Forensics, active dependence, etc." value={profile.not_treated} onChange={(e) => setProfile({...profile, not_treated: e.target.value})} borderRadius="xl" />
                     </FormControl>
                  </SimpleGrid>
               </Box>

               <Box>
                  <FormLabel fontWeight="800" mb={2}>Presenting Concerns Matrix</FormLabel>
                  <Box p={4} bg="gray.50" borderRadius="xl" mb={6} border="1px solid" borderColor="gray.100">
                    <Heading size="xs" mb={3} textTransform="uppercase" color="gray.500">Choosing the right level:</Heading>
                    <VStack align="stretch" spacing={2}>
                       <HStack fontSize="xs"><Badge colorScheme="teal" variant="solid" w="110px">Core Focus</Badge><Text color="gray.600">Primary expertise. You work with this daily and have advanced training.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="teal" variant="outline" w="110px">Experienced</Badge><Text color="gray.600">Substantial clinical experience and supervised follow-through.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="gray" variant="subtle" w="110px">Foundational</Badge><Text color="gray.600">Foundational knowledge; take occasionally but not a core focus.</Text></HStack>
                       <HStack fontSize="xs"><Badge colorScheme="red" variant="ghost" w="110px">Refer Out</Badge><Text color="gray.600">Choose this if you <b>do not</b> treat this presentation.</Text></HStack>
                    </VStack>
                  </Box>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                     {CATEGORIES.CONCERNS.map(topic => (
                       <HStack key={topic} justify="space-between" p={3} borderBottom="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }} transition="0.2s">
                          <Text fontWeight="600" fontSize="xs" color="gray.700">{topic}</Text>
                          <Select 
                            size="xs" bg="white" w="140px" borderRadius="md"
                            value={profile.concerns_levels?.[topic] || ""} 
                            onChange={(e) => setProfile({...profile, concerns_levels: {...profile.concerns_levels, [topic]: e.target.value}})}
                          >
                             <option value="">Choose Level</option>
                             <option value="Core Focus">Core Focus</option>
                             <option value="Experienced">Experienced</option>
                             <option value="Foundational">Foundational</option>
                             <option value="Refer Out">Refer Out</option>
                          </Select>
                       </HStack>
                     ))}
                  </SimpleGrid>
               </Box>
            </VStack>
          </TabPanel>

          {/* 5. Approach */}
          <TabPanel>
            <VStack align="stretch" spacing={10}>
               <Box>
                  <FormLabel fontWeight="800">Therapeutic Orientation</FormLabel>
                  <Text fontSize="xs" color="gray.500" mb={4}>Select only modalities you have been <b>trained and supervised in</b>. Generic profiles with too many specialisations get indexed lower.</Text>
                  
                  <Wrap spacing={2} mb={8}>
                     {CATEGORIES.MODALITIES.map(m => (
                       <Tag key={m} cursor="pointer" variant={profile.modalities_info?.find(mi => mi.name === m) ? "solid" : "outline"} colorScheme="teal" onClick={() => {
                          const exists = profile.modalities_info?.find(mi => mi.name === m);
                          const updated = exists ? profile.modalities_info.filter(mi => mi.name !== m) : [...(profile.modalities_info || []), { name: m, training: "", supervision: "" }];
                          setProfile({...profile, modalities_info: updated});
                       }} borderRadius="full">{m}</Tag>
                     ))}
                  </Wrap>

                  <Alert status="info" size="sm" mb={6} borderRadius="xl" bg="teal.50" border="1px solid" borderColor="teal.100">
                     <AlertIcon />
                     <Text fontSize="xs">Non-practical trainings with no supervised follow through will be periodically reviewed and flagged in order to maintain MLC standards of treatment.</Text>
                  </Alert>

                  <VStack align="stretch" spacing={6}>
                     {profile.modalities_info?.map((info, idx) => (
                       <Box key={info.name} p={6} bg="white" border="1px solid" borderColor="gray.100" borderRadius="2xl" shadow="sm">
                          <Heading size="xs" mb={4} color="teal.700">{info.name} Details</Heading>
                          <SimpleGrid columns={1} spacing={4}>
                             <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Training Background</FormLabel>
                                <Input placeholder="Certification, Institution, Hours" value={info.training} onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].training = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }} borderRadius="lg" />
                             </FormControl>
                             <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold">Supervision Received</FormLabel>
                                <Textarea placeholder="Supervisor Name, How long, Position, Preferred Contact Details" value={info.supervision} onChange={(e) => {
                                   const updated = [...profile.modalities_info];
                                   updated[idx].supervision = e.target.value;
                                   setProfile({...profile, modalities_info: updated});
                                }} borderRadius="lg" />
                             </FormControl>
                          </SimpleGrid>
                       </Box>
                     ))}
                  </VStack>
               </Box>

               <Divider />

               <Box>
                  <FormLabel fontWeight="800">Therapy Dynamics</FormLabel>
                  <SimpleGrid columns={1} spacing={8} p={8} bg="gray.50" borderRadius="3xl">
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">More Structured</Text><Text fontSize="xs">More Exploratory</Text></HStack>
                        <Slider value={profile.structure} onChange={(v) => setProfile({...profile, structure: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">Past-Focused</Text><Text fontSize="xs">Present-Focused</Text></HStack>
                        <Slider value={profile.orientation} onChange={(v) => setProfile({...profile, orientation: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                     <Box>
                        <HStack justify="space-between" mb={2}><Text fontSize="xs">Gentle Pacing</Text><Text fontSize="xs">Direct / Challenging</Text></HStack>
                        <Slider value={profile.pacing} onChange={(v) => setProfile({...profile, pacing: v})} colorScheme="teal"><SliderTrack><SliderFilledTrack/></SliderTrack><SliderThumb/></Slider>
                     </Box>
                  </SimpleGrid>
               </Box>
            </VStack>
          </TabPanel>

          {/* 6. Availability */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="700">Currency</FormLabel>
                    <Select value={profile.currency} onChange={(e) => setProfile({...profile, currency: e.target.value})} borderRadius="xl">
                       {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Individual Fee</FormLabel>
                    <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({...profile, hourly_rate: e.target.value})} borderRadius="xl" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Sliding Scale</FormLabel>
                    <Select bg="gray.100" isDisabled borderRadius="xl"><option>Coming Soon (In Development)</option></Select>
                  </FormControl>
               </SimpleGrid>
               <Divider />
               <VStack align="stretch" spacing={4}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0" fontWeight="700">Accepting New Clients</FormLabel>
                    <Checkbox isChecked={profile.is_accepting_new} onChange={(e) => setProfile({...profile, is_accepting_new: e.target.checked})} />
                  </FormControl>
                  <FormControl>
                     <FormLabel fontWeight="700">In-Person Locations</FormLabel>
                     <Input placeholder="e.g. Banjara Hills, Hyderabad" value={profile.locations} onChange={(e) => setProfile({...profile, locations: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </VStack>
            </VStack>
          </TabPanel>

          {/* 7. Bio & Media */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <FormControl>
                  <FormLabel fontWeight="800">Professional Bio (Minimum 150 words for SEO)</FormLabel>
                  <Textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} borderRadius="2xl" rows={10} placeholder="Talk about your journey, style, and approach..." />
               </FormControl>
               
               <Box bg="#F9FBFA" p={8} borderRadius="3xl">
                  <HStack justify="space-between" mb={4}>
                    <Heading size="xs" textTransform="uppercase">Skill Keywords (Max 6)</Heading>
                    <Badge colorScheme="teal">{profile.keywords?.length} / 6</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mb={6}>Type and press enter. Keywords are auto-corrected for uniform SEO consistency.</Text>
                  
                  <HStack mb={6}>
                     <Input placeholder="e.g. Trauma-sensitive" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleKeywordAdd()} />
                     <Button colorScheme="teal" onClick={handleKeywordAdd} isDisabled={profile.keywords?.length >= 6}>Add</Button>
                  </HStack>

                  <Wrap spacing={2}>
                     {profile.keywords?.map(kw => (
                       <Tag key={kw} size="lg" borderRadius="full" colorScheme="teal">
                          <TagLabel>{kw}</TagLabel>
                          <TagCloseButton onClick={() => setProfile({...profile, keywords: profile.keywords.filter(k => k !== kw)})} />
                       </Tag>
                     ))}
                  </Wrap>
               </Box>

               <FormControl>
                  <FormLabel fontWeight="800">Welcome Note to First-Time Seekers</FormLabel>
                  <Textarea value={profile.welcome_note} onChange={(e) => setProfile({...profile, welcome_note: e.target.value})} borderRadius="xl" placeholder="A reassuring message for those new to therapy..." />
               </FormControl>
            </VStack>
          </TabPanel>

          {/* 8. Internal Matching */}
          <TabPanel>
            <VStack align="stretch" spacing={8}>
               <Box bg="red.50" p={10} borderRadius="3xl" border="1px dashed" borderColor="red.200">
                  <HStack color="red.600" mb={6}><Icon as={FiAlertCircle} boxSize={6} /><Heading size="md">Clinical Governance & Ethics</Heading></HStack>
                  
                  <Text fontSize="sm" color="red.700" mb={8} fontWeight="500">
                     These details are periodically reviewed for maintaining ethical and standardised practices. False or incomplete information may be flagged and lead to therapist removal from the platform.
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Collaborating Psychiatrist</FormLabel>
                        <Input bg="white" value={profile.risk_protocols?.psychiatrist} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, psychiatrist: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Primary Emergency Hospital</FormLabel>
                        <Input bg="white" value={profile.risk_protocols?.hospital} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, hospital: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Hospital Location</FormLabel>
                        <Input bg="white" value={profile.risk_protocols?.location} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, location: e.target.value}})} />
                     </FormControl>
                     <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="bold">Emergency Contact</FormLabel>
                        <Input bg="white" value={profile.risk_protocols?.contact} onChange={(e) => setProfile({...profile, risk_protocols: {...profile.risk_protocols, contact: e.target.value}})} />
                     </FormControl>
                  </SimpleGrid>

                  <FormControl>
                     <FormLabel fontWeight="700">Internal Matching Notes</FormLabel>
                     <Textarea bg="white" placeholder="Best fit cases, specific exclusion patterns, etc." value={profile.best_fit_notes} onChange={(e) => setProfile({...profile, best_fit_notes: e.target.value})} borderRadius="xl" />
                  </FormControl>
               </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Box p={8} mt={10} bg="#56756D" borderRadius="3xl" color="white" shadow="2xl">
         <HStack justify="space-between">
            <VStack align="start" spacing={0}>
               <Text fontWeight="bold" fontSize="lg">Commit Changes to Public Profile</Text>
               <Text fontSize="sm" opacity="0.8">This will immediately update your crawlable public page and matching score.</Text>
            </VStack>
            <Button size="lg" bg="white" color="mlc.greenDark" borderRadius="full" px={12} onClick={handleSave} isLoading={loading}>Sync Now</Button>
         </HStack>
      </Box>
    </Box>
  );
}
