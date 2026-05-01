'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Image, Badge, Stack, Flex, Select, Input, InputGroup,
  InputLeftElement, useToast, Spinner, Center, Divider,
  Menu, MenuButton, MenuList, MenuItem, Checkbox,
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  IconButton, Tooltip, Wrap, WrapItem, Tag, TagLabel, TagCloseButton, Circle
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiFilter, FiUser, FiGlobe, FiClock, FiDollarSign, 
  FiMapPin, FiCheckCircle, FiChevronDown, FiX, FiVideo, FiBriefcase,
  FiHeart, FiStar, FiAward, FiArrowRight, FiActivity
} from "react-icons/fi";
import { apiGet } from "../../../api.js";
import NextLink from "next/link";
import { Select as ChakraReactSelect } from "chakra-react-select";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// ===========================
// 🔹 Constants & Data
// ===========================

const EXPERIENCE_LEVELS = [
  { label: "All Experience", value: "all" },
  { label: "Junior (0-3 yrs)", value: "junior" },
  { label: "Mid-Level (3-8 yrs)", value: "mid" },
  { label: "Senior (8-15 yrs)", value: "senior" },
  { label: "Expert (15+ yrs)", value: "expert" },
];

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Transgender"];

const SESSION_TYPES = ["Online", "In-person"];

const WORLD_LANGUAGES = [
  "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Spanish", "French", "German", "Mandarin", "Japanese"
].sort();

const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow"
].sort();

const EXPERTISE_AREAS = [
  "Anxiety", "Depression", "Trauma & PTSD", "Relationships", "ADHD/Neurodivergence", "Self-Esteem", "Grief & Loss", "Workplace Burnout", "OCD", "Eating Disorders", "Bipolar Disorder", "Identity & Sexuality"
].sort();

const MODALITIES = [
  "CBT (Cognitive Behavioral)", "DBT (Dialectical)", "EMDR", "Psychodynamic", "Humanistic", "Integrative", "Somatic", "Art Therapy", "Mindfulness-Based"
].sort();

// ===========================
// 🔹 Components
// ===========================

const FilterDropdown = ({ label, options, selected, onSelect, icon }) => (
  <Menu closeOnSelect={false}>
    <MenuButton
      as={Button}
      rightIcon={<FiChevronDown />}
      variant="outline"
      borderRadius="full"
      px={6}
      bg="white"
      borderColor="gray.200"
      _hover={{ borderColor: "mlc.green", bg: "gray.50" }}
      _active={{ bg: "teal.50", borderColor: "mlc.green" }}
      leftIcon={<Icon as={icon} />}
      fontSize="sm"
      fontWeight="600"
      color="gray.700"
      h="48px"
      minW="160px"
    >
      {selected.length > 0 ? `${label} (${selected.length})` : label}
    </MenuButton>
    <MenuList borderRadius="2xl" shadow="xl" p={2} border="none" maxH="300px" overflowY="auto">
      {options.map((opt) => (
        <MenuItem
          key={opt}
          onClick={() => onSelect(opt)}
          borderRadius="lg"
          _hover={{ bg: "teal.50" }}
          closeOnSelect={false}
        >
          <Checkbox 
            isChecked={selected.includes(opt)} 
            colorScheme="teal" 
            pointerEvents="none"
            mr={3}
          />
          <Text fontSize="sm" fontWeight="500">{opt}</Text>
        </MenuItem>
      ))}
    </MenuList>
  </Menu>
);

const TherapistCardMini = ({ therapist }) => {
  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      bg="white"
      borderRadius="3xl"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      shadow="sm"
      _hover={{ shadow: "2xl", transform: "translateY(-8px)" }}
      display="flex"
      flexDirection="column"
      h="full"
    >
      {/* Top Banner / Image */}
      <Box h="220px" position="relative" bg="gray.100" overflow="hidden">
        <Image
          src={therapist.profile_image_url || "https://images.unsplash.com/photo-1559839734-2b71f1536b1a?auto=format&fit=crop&q=80&w=600"}
          alt={therapist.name}
          w="full"
          h="full"
          objectFit="cover"
          transition="transform 0.5s ease"
          _groupHover={{ transform: "scale(1.05)" }}
        />
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="linear(to-t, rgba(0,0,0,0.4) 0%, transparent 60%)" 
        />
        
        {/* Verification Badge */}
        <Badge 
          position="absolute" 
          top={4} 
          right={4} 
          bg="white" 
          color="teal.800" 
          borderRadius="full" 
          px={3} 
          py={1} 
          shadow="md"
          display="flex"
          alignItems="center"
          gap={1}
          fontSize="2xs"
          fontWeight="900"
        >
          <Icon as={FiCheckCircle} color="blue.400" /> VERIFIED
        </Badge>

        <Box position="absolute" bottom={4} left={4} color="white">
            <HStack spacing={2}>
                <Badge bg="mlc.gold" color="white" borderRadius="full" px={2} fontSize="2xs">
                    {therapist.years_experience}+ YRS EXP
                </Badge>
                <Badge bg="whiteAlpha.400" backdropFilter="blur(5px)" color="white" borderRadius="full" px={2} fontSize="2xs">
                    {Array.isArray(therapist.modality) ? therapist.modality[0] : (therapist.modality || "Integrative")}
                </Badge>
            </HStack>
        </Box>
      </Box>

      {/* Content */}
      <VStack align="stretch" p={6} spacing={4} flex="1">
        <VStack align="start" spacing={0}>
          <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">{therapist.name}</Heading>
          <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="widest" textTransform="uppercase">
            {therapist.title || "Clinical Associate"}
          </Text>
        </VStack>

        <Divider borderColor="gray.50" />

        <Box>
            <HStack spacing={2} mb={3} wrap="wrap">
                {(therapist.specialties || therapist.concerns || []).slice(0, 3).map(s => (
                    <Tag key={s} size="sm" variant="subtle" colorScheme="teal" borderRadius="full" px={3}>
                        <TagLabel fontSize="2xs" fontWeight="700">{s}</TagLabel>
                    </Tag>
                ))}
            </HStack>
            <Text fontSize="xs" color="gray.600" noOfLines={3} lineHeight="tall">
                {therapist.bio || "A dedicated professional committed to holding space for your growth and emotional well-being through evidence-based clinical practices."}
            </Text>
        </Box>

        <VStack align="stretch" spacing={2} bg="gray.50" p={3} borderRadius="2xl">
            <HStack justify="space-between" fontSize="xs" color="gray.700">
                <HStack spacing={2}>
                    <Icon as={FiGlobe} color="teal.500" />
                    <Text fontWeight="600">{Array.isArray(therapist.languages) ? therapist.languages.slice(0,2).join(", ") : "English, Hindi"}</Text>
                </HStack>
                <HStack spacing={2}>
                    <Icon as={FiDollarSign} color="teal.500" />
                    <Text fontWeight="800">₹{therapist.hourly_rate || "1200"}/hr</Text>
                </HStack>
            </HStack>
            <HStack spacing={2} fontSize="xs" color="gray.700">
                <Icon as={FiVideo} color="teal.500" />
                <Text fontWeight="600">Video & Online Sessions</Text>
            </HStack>
        </VStack>

        <HStack spacing={3} mt="auto">
            <Button 
                as={NextLink}
                href={`/therapists/${therapist.id}`}
                flex="1" 
                variant="outline" 
                borderRadius="full" 
                size="sm"
                borderColor="teal.100"
                _hover={{ bg: 'teal.50', borderColor: 'teal.200' }}
            >
                View Profile
            </Button>
            <Button 
                as={NextLink}
                href={`/therapists/${therapist.id}#booking-calendar`}
                flex="1" 
                bg="teal.800" 
                color="white" 
                borderRadius="full" 
                size="sm"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: 'teal.900', transform: 'translateX(2px)' }}
                transition="all 0.2s"
            >
                Book Now
            </Button>
        </HStack>
      </VStack>
    </MotionBox>
  );
};

// ===========================
// 🔹 Main Page
// ===========================

export default function DirectoryClient() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  // Filters state
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedModalities, setSelectedModalities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedExpLevel, setSelectedExpLevel] = useState("all");
  const [costRange, setCostRange] = useState([0, 5000]);

  useEffect(() => {
    async function fetchTherapists() {
      try {
        setLoading(true);
        const res = await apiGet("therapists/public/");
        setTherapists(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        toast({ title: "Failed to load therapists", status: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchTherapists();
  }, []);

  const toggleFilter = (val, list, setList) => {
    if (list.includes(val)) setList(list.filter(x => x !== val));
    else setList([...list, val]);
  };

  const filteredTherapists = useMemo(() => {
    return therapists.filter(t => {
      // Search
      const searchStr = `${t.name} ${t.title} ${t.bio}`.toLowerCase();
      if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;

      // Gender
      if (selectedGender.length > 0 && !selectedGender.includes(t.gender)) return false;

      // Languages
      if (selectedLanguages.length > 0) {
          const tLangs = Array.isArray(t.languages) ? t.languages : ["English"];
          if (!selectedLanguages.some(l => tLangs.includes(l))) return false;
      }

      // Expertise
      if (selectedExpertise.length > 0) {
          const tExp = Array.isArray(t.specialties) ? t.specialties : [];
          if (!selectedExpertise.some(e => tExp.includes(e))) return false;
      }

      // Experience Level
      if (selectedExpLevel !== "all") {
          const exp = Number(t.years_experience || 0);
          if (selectedExpLevel === "junior" && exp > 3) return false;
          if (selectedExpLevel === "mid" && (exp <= 3 || exp > 8)) return false;
          if (selectedExpLevel === "senior" && (exp <= 8 || exp > 15)) return false;
          if (selectedExpLevel === "expert" && exp <= 15) return false;
      }

      // City / Location
      if (selectedCities.length > 0 && !selectedCities.includes(t.city)) return false;

      // Cost
      const rate = Number(t.hourly_rate || 0);
      if (rate < costRange[0] || rate > costRange[1]) return false;

      // Modality
      if (selectedModalities.length > 0) {
          const tMods = Array.isArray(t.modality) ? t.modality : (t.modality ? [t.modality] : []);
          if (!selectedModalities.some(m => tMods.includes(m))) return false;
      }

      return true;
    });
  }, [therapists, searchTerm, selectedGender, selectedLanguages, selectedExpertise, selectedExpLevel, costRange, selectedModalities]);

  const activeFilterCount = selectedGender.length + selectedLanguages.length + selectedExpertise.length + selectedModalities.length + selectedCities.length + (selectedExpLevel !== "all" ? 1 : 0);

  const resetFilters = () => {
      setSelectedGender([]);
      setSelectedLanguages([]);
      setSelectedExpertise([]);
      setSelectedModalities([]);
      setSelectedCities([]);
      setSelectedExpLevel("all");
      setCostRange([0, 5000]);
      setSearchTerm("");
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" pb={20}>
      {/* 🌿 VISIONARY HERO */}
      <Box 
        position="relative" 
        pt={{ base: 32, md: 48 }} 
        pb={{ base: 16, md: 24 }} 
        px={6} 
        bg="teal.900"
        color="white"
        overflow="hidden"
      >
        <MotionBox
            animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            position="absolute" top="10%" right="10%" w="150px" h="150px" 
            bg="rgba(201, 169, 96, 0.2)" borderRadius="30% 70% 70% 30% / 30% 30% 70% 70%" filter="blur(40px)"
        />
        <MotionBox
            animate={{ 
                x: [0, 30, 0],
                y: [0, 20, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            position="absolute" bottom="15%" left="5%" w="200px" h="200px" 
            bg="rgba(86, 117, 109, 0.3)" borderRadius="50%" filter="blur(60px)"
        />

        <Box position="absolute" top="-10%" right="-5%" w="600px" h="600px" bg="teal.800" borderRadius="full" filter="blur(120px)" opacity="0.3" />
        <Box position="absolute" bottom="-10%" left="-5%" w="400px" h="400px" bg="mlc.gold" borderRadius="full" filter="blur(150px)" opacity="0.1" />
        
        <Container maxW="7xl" position="relative" zIndex={2}>
          <VStack align="center" spacing={8} textAlign="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Badge bg="teal.700" color="teal.100" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest" mb={4}>
                    OUR CLINICAL COLLECTIVE
                </Badge>
                <Heading as="h1" fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} fontFamily="'Playfair Display', serif" lineHeight="1.1" mb={6}>
                  Exceptional Minds. <br /> Human Connection.
                </Heading>
                <Text fontSize={{ base: "md", md: "xl" }} opacity="0.8" maxW="2xl" mx="auto" lineHeight="tall">
                  Meet the MLC Collective—a handpicked group of world-class therapists dedicated to the art and science of healing. No barriers, just expertise.
                </Text>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* 🔍 FILTER BAR */}
      <Box 
        position="sticky" 
        top="0" 
        zIndex={10} 
        bg="rgba(253, 251, 250, 0.8)" 
        backdropFilter="blur(15px)"
        borderBottom="1px solid"
        borderColor="gray.100"
        py={6}
      >
        <Container maxW="7xl">
          <VStack spacing={4} align="stretch">
            <Flex direction={{ base: "column", xl: "row" }} gap={4} align={{ base: "stretch", xl: "center" }}>
              <InputGroup size="lg" maxW={{ xl: "320px" }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by name or keyword..." 
                  bg="white" 
                  borderRadius="full" 
                  fontSize="sm"
                  border="1px solid"
                  borderColor="gray.200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  _focus={{ borderColor: "mlc.green", shadow: "none" }}
                />
              </InputGroup>

              <Wrap spacing={3} justify={{ base: "start", xl: "start" }}>
                <FilterDropdown 
                    label="Expertise" 
                    icon={FiActivity}
                    options={EXPERTISE_AREAS} 
                    selected={selectedExpertise} 
                    onSelect={(v) => toggleFilter(v, selectedExpertise, setSelectedExpertise)} 
                />
                <FilterDropdown 
                    label="Language" 
                    icon={FiGlobe}
                    options={WORLD_LANGUAGES} 
                    selected={selectedLanguages} 
                    onSelect={(v) => toggleFilter(v, selectedLanguages, setSelectedLanguages)} 
                />
                <FilterDropdown 
                    label="Gender" 
                    icon={FiUser}
                    options={GENDER_OPTIONS} 
                    selected={selectedGender} 
                    onSelect={(v) => toggleFilter(v, selectedGender, setSelectedGender)} 
                />
                <FilterDropdown 
                    label="Location" 
                    icon={FiMapPin}
                    options={MAJOR_CITIES} 
                    selected={selectedCities} 
                    onSelect={(v) => toggleFilter(v, selectedCities, setSelectedCities)} 
                />
                
                {/* Experience Select */}
                <Select 
                    variant="outline" 
                    borderRadius="full" 
                    h="48px" 
                    bg="white" 
                    w={{ base: "full", md: "160px" }}
                    fontSize="sm" 
                    fontWeight="600"
                    icon={<FiChevronDown />}
                    value={selectedExpLevel}
                    onChange={(e) => setSelectedExpLevel(e.target.value)}
                >
                    {EXPERIENCE_LEVELS.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                </Select>

                {/* More Filters Placeholder or Price Filter */}
                <Menu closeOnSelect={false}>
                    <MenuButton as={Button} variant="outline" borderRadius="full" h="48px" px={6} bg="white" leftIcon={<FiDollarSign />} rightIcon={<FiChevronDown />} fontSize="sm" w={{ base: "full", md: "auto" }}>
                        Budget
                    </MenuButton>
                    <MenuList p={6} borderRadius="2xl" shadow="2xl" minW="300px">
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Text fontWeight="700" fontSize="sm">Hourly Rate</Text>
                                <Text fontSize="xs" fontWeight="800" color="teal.600">₹{costRange[0]} - ₹{costRange[1]}</Text>
                            </HStack>
                            <RangeSlider 
                                aria-label={['min', 'max']} 
                                defaultValue={[0, 5000]} 
                                min={0} 
                                max={10000} 
                                step={500}
                                colorScheme="teal"
                                onChangeEnd={(val) => setCostRange(val)}
                            >
                                <RangeSliderTrack h={1}>
                                    <RangeSliderFilledTrack />
                                </RangeSliderTrack>
                                <RangeSliderThumb index={0} boxSize={5} shadow="md" border="2px solid white" />
                                <RangeSliderThumb index={1} boxSize={5} shadow="md" border="2px solid white" />
                            </RangeSlider>
                        </VStack>
                    </MenuList>
                </Menu>
              </Wrap>

              {activeFilterCount > 0 && (
                  <Button variant="ghost" color="red.500" fontSize="xs" fontWeight="800" onClick={resetFilters} leftIcon={<FiX />}>
                      CLEAR ALL
                  </Button>
              )}
            </Flex>

            {/* Active Filter Tags */}
            <AnimatePresence>
                {(activeFilterCount > 0 || searchTerm) && (
                    <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Wrap spacing={2}>
                            {searchTerm && (
                                <Tag size="md" borderRadius="full" variant="solid" colorScheme="gray">
                                    <TagLabel>"{searchTerm}"</TagLabel>
                                    <TagCloseButton onClick={() => setSearchTerm("")} />
                                </Tag>
                            )}
                            {selectedExpertise.map(e => (
                                <Tag key={e} size="md" borderRadius="full" variant="subtle" colorScheme="teal">
                                    <TagLabel>{e}</TagLabel>
                                    <TagCloseButton onClick={() => toggleFilter(e, selectedExpertise, setSelectedExpertise)} />
                                </Tag>
                            ))}
                            {/* ... more tags can be added here */}
                        </Wrap>
                    </MotionBox>
                )}
            </AnimatePresence>
          </VStack>
        </Container>
      </Box>

      {/* 🖼️ THERAPIST GRID */}
      <Container maxW="7xl" pt={12}>
        {loading ? (
            <Center py={40}>
                <VStack spacing={4}>
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="teal.500" size="xl" />
                    <Text fontWeight="600" color="gray.500">Preparing the collective...</Text>
                </VStack>
            </Center>
        ) : (
            <>
                <Flex justify="space-between" align="center" mb={10}>
                    <HStack spacing={3}>
                        <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">
                            {filteredTherapists.length} Specialists Available
                        </Heading>
                        {filteredTherapists.length < therapists.length && (
                            <Badge borderRadius="full" px={3} bg="teal.50" color="teal.700">Filtered Results</Badge>
                        )}
                    </HStack>
                </Flex>

                {filteredTherapists.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        <AnimatePresence mode="popLayout">
                            {filteredTherapists.map((t) => (
                                <TherapistCardMini key={t.id} therapist={t} />
                            ))}
                        </AnimatePresence>
                    </SimpleGrid>
                ) : (
                    <Center py={40} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                        <VStack spacing={6}>
                            <Icon as={FiFilter} boxSize={12} color="gray.200" />
                            <VStack spacing={1}>
                                <Heading size="md" color="gray.600">No specialists match these filters</Heading>
                                <Text color="gray.400">Try adjusting your filters or search terms.</Text>
                            </VStack>
                            <Button onClick={resetFilters} variant="outline" borderRadius="full" px={10}>Reset Filters</Button>
                        </VStack>
                    </Center>
                )}
            </>
        )}
      </Container>

      {/* 🏔️ FOOTER INFO */}
      <Container maxW="7xl" mt={24}>
          <Box p={12} bg="teal.50" borderRadius="4xl" border="1px solid" borderColor="teal.100">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
                  <VStack align="start" spacing={6}>
                      <Circle size="60px" bg="white" shadow="sm"><Icon as={FiAward} w={8} h={8} color="teal.800" /></Circle>
                      <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">A Commitment to Quality.</Heading>
                      <Text color="gray.600" fontSize="lg">
                          Every professional at MLC undergoes a rigorous verification process, including credential auditing, clinical orientation, and alignment with our relational safety standards.
                      </Text>
                      <Button as={NextLink} href="/about" variant="link" color="teal.800" fontWeight="900" rightIcon={<FiArrowRight />}>Learn about our standards</Button>
                  </VStack>
                  <Image src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" fallbackSrc="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600" borderRadius="3xl" shadow="xl" />
              </SimpleGrid>
          </Box>
      </Container>
    </Box>
  );
}
