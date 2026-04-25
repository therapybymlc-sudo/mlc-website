'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Image, Badge, Stack, Flex, Select, Input, InputGroup,
  InputLeftElement, useToast, Spinner, Center, Divider,
  Menu, MenuButton, MenuList, MenuItem, Checkbox,
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  Wrap, Tag, TagLabel, TagCloseButton, Circle,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiFilter, FiUser, FiGlobe, FiClock, FiDollarSign, 
  FiMapPin, FiCheckCircle, FiChevronDown, FiX, FiVideo, FiBriefcase,
  FiHeart, FiStar, FiAward, FiArrowRight, FiShield, FiBook, FiActivity
} from "react-icons/fi";
import { apiGet } from "../../../../api.js";
import NextLink from "next/link";

const MotionBox = motion(Box);

// ===========================
// 🔹 Constants & Data
// ===========================

const SUPERVISOR_EXPERIENCE_LEVELS = [
  { label: "Minimum 5+ Years", value: "all" },
  { label: "Experienced (5-10 yrs)", value: "experienced" },
  { label: "Master (10-20 yrs)", value: "master" },
  { label: "Senior Master (20+ yrs)", value: "senior" },
];

const EXPERTISE_AREAS = [
  "Clinical Supervision", "Integrative Therapy", "CBT Mastery", "Trauma-Informed Practice", "Child & Adolescent", "Psychodynamic", "Group Therapy", "Private Practice Mentorship", "Ethical Stewardship"
].sort();

const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow"
].sort();

const WORLD_LANGUAGES = [
  "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi"
].sort();

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary"];

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
      _hover={{ borderColor: "teal.500", bg: "gray.50" }}
      _active={{ bg: "teal.50", borderColor: "teal.500" }}
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

const SupervisorCard = ({ supervisor }) => {
  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      bg="white"
      borderRadius="3xl"
      overflow="hidden"
      border="1px solid"
      borderColor="teal.50"
      shadow="sm"
      _hover={{ shadow: "2xl", transform: "translateY(-8px)" }}
      display="flex"
      flexDirection="column"
      h="full"
    >
      <Box h="220px" position="relative" bg="gray.100" overflow="hidden">
        <Image
          src={supervisor.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"}
          alt={supervisor.name}
          w="full"
          h="full"
          objectFit="cover"
        />
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="linear(to-t, rgba(0,0,0,0.5) 0%, transparent 70%)" 
        />
        
        <Badge 
          position="absolute" 
          top={4} 
          right={4} 
          bg="teal.800" 
          color="white" 
          borderRadius="full" 
          px={3} 
          py={1} 
          fontSize="2xs"
          fontWeight="900"
        >
          BOARD APPROVED
        </Badge>

        <Box position="absolute" bottom={4} left={4} color="white">
            <HStack spacing={2}>
                <Badge bg="white" color="teal.800" borderRadius="full" px={2} fontSize="2xs">
                    {supervisor.years_experience}+ YRS EXP
                </Badge>
                <Badge bg="whiteAlpha.400" backdropFilter="blur(5px)" color="white" borderRadius="full" px={2} fontSize="2xs">
                    SUPERVISOR
                </Badge>
            </HStack>
        </Box>
      </Box>

      <VStack align="stretch" p={6} spacing={4} flex="1">
        <VStack align="start" spacing={0}>
          <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">{supervisor.name}</Heading>
          <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="widest" textTransform="uppercase">
            Senior Clinical Supervisor
          </Text>
        </VStack>

        <Divider borderColor="gray.50" />

        <Box>
            <HStack spacing={2} mb={3} wrap="wrap">
                {(supervisor.specialties || supervisor.concerns || []).slice(0, 3).map(s => (
                    <Tag key={s} size="sm" variant="subtle" colorScheme="teal" borderRadius="full" px={3}>
                        <TagLabel fontSize="2xs" fontWeight="700">{s}</TagLabel>
                    </Tag>
                ))}
            </HStack>
            <Text fontSize="xs" color="gray.600" noOfLines={3} lineHeight="tall">
                {supervisor.bio || "Providing clinical supervision rooted in modality-specific excellence and the holistic evolution of the therapeutic identity."}
            </Text>
        </Box>

        <VStack align="stretch" spacing={2} bg="teal.50" p={3} borderRadius="2xl">
            <HStack justify="space-between" fontSize="xs" color="teal.900">
                <HStack spacing={2}>
                    <Icon as={FiGlobe} color="teal.600" />
                    <Text fontWeight="600">{Array.isArray(supervisor.languages) ? supervisor.languages.slice(0,2).join(", ") : "English, Hindi"}</Text>
                </HStack>
                <HStack spacing={2}>
                    <Icon as={FiBriefcase} color="teal.600" />
                    <Text fontWeight="800">₹{supervisor.hourly_rate || "1500"}/hr</Text>
                </HStack>
            </HStack>
            <HStack spacing={2} fontSize="xs" color="teal.900">
                <Icon as={FiShield} color="teal.600" />
                <Text fontWeight="600">Secure Supervision Environment</Text>
            </HStack>
        </VStack>

        <HStack spacing={3} mt="auto">
            <Button 
                as={NextLink}
                href={`/therapists/${supervisor.id}`}
                flex="1" 
                variant="outline" 
                borderRadius="full" 
                size="sm"
                borderColor="teal.100"
                _hover={{ bg: 'white', borderColor: 'teal.500' }}
            >
                View Profile
            </Button>
            <Button 
                as={NextLink}
                href={`/therapists/${supervisor.id}#supervision-booking`}
                flex="1" 
                bg="teal.800" 
                color="white" 
                borderRadius="full" 
                size="sm"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: 'teal.900', transform: 'translateX(2px)' }}
                transition="all 0.2s"
            >
                Book Mentorship
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
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Filters state
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedExpLevel, setSelectedExpLevel] = useState("all");
  const [costRange, setCostRange] = useState([0, 10000]);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function fetchSupervisors() {
      try {
        setLoading(true);
        const res = await apiGet("therapists/?is_supervisor=true&supervision_status=approved");
        setSupervisors(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        toast({ title: "Failed to load supervisors", status: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchSupervisors();
  }, []);

  const toggleFilter = (val, list, setList) => {
    if (list.includes(val)) setList(list.filter(x => x !== val));
    else setList([...list, val]);
  };

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter(s => {
      // Search
      const searchStr = `${s.name} ${s.bio}`.toLowerCase();
      if (searchTerm && !searchStr.includes(searchTerm.toLowerCase())) return false;

      // Gender
      if (selectedGender.length > 0 && !selectedGender.includes(s.gender)) return false;

      // Languages
      if (selectedLanguages.length > 0) {
          const sLangs = Array.isArray(s.languages) ? s.languages : ["English"];
          if (!selectedLanguages.some(l => sLangs.includes(l))) return false;
      }

      // Expertise
      if (selectedExpertise.length > 0) {
          const sExp = Array.isArray(s.specialties) ? s.specialties : [];
          if (!selectedExpertise.some(e => sExp.includes(e))) return false;
      }

      // Experience Level - Enforce 5+ years for all supervisors
      const exp = Number(s.years_experience || 0);
      if (exp < 5) return false;

      if (selectedExpLevel !== "all") {
          if (selectedExpLevel === "experienced" && (exp < 5 || exp > 10)) return false;
          if (selectedExpLevel === "master" && (exp < 10 || exp > 20)) return false;
          if (selectedExpLevel === "senior" && exp < 20) return false;
      }

      // Location
      if (selectedCities.length > 0 && !selectedCities.includes(s.city)) return false;

      // Cost
      const rate = Number(s.hourly_rate || 0);
      if (rate < costRange[0] || rate > costRange[1]) return false;

      return true;
    });
  }, [supervisors, searchTerm, selectedGender, selectedLanguages, selectedExpertise, selectedExpLevel, costRange, selectedCities]);

  const activeFilterCount = selectedGender.length + selectedLanguages.length + selectedExpertise.length + selectedCities.length + (selectedExpLevel !== "all" ? 1 : 0);

  const resetFilters = () => {
      setSelectedGender([]);
      setSelectedLanguages([]);
      setSelectedExpertise([]);
      setSelectedCities([]);
      setSelectedExpLevel("all");
      setCostRange([0, 10000]);
      setSearchTerm("");
  };

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" minH="100vh" pb={20}>
      {/* 🏛️ MENTORSHIP HERO */}
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
                rotate: [0, 2, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            position="absolute" top="10%" left="5%" w="300px" h="300px" 
            bg="rgba(86, 117, 109, 0.4)" borderRadius="full" filter="blur(80px)"
        />
        
        <Container maxW="7xl" position="relative" zIndex={2}>
          <VStack align="center" spacing={8} textAlign="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Badge bg="teal.700" color="teal.100" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest" mb={4}>
                    CLINICAL MASTERY & STEWARDSHIP
                </Badge>
                <Heading as="h1" fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }} fontFamily="'Playfair Display', serif" lineHeight="1.1" mb={6}>
                  Elevating Practice. <br /> Holding Space for Mentors.
                </Heading>
                <Text fontSize={{ base: "md", md: "xl" }} opacity="0.8" maxW="3xl" mx="auto" lineHeight="tall">
                  Our Supervisor Collective is exclusively comprised of senior clinicians with 5+ years of active field experience. Find a mentor who understands the depth, ethics, and evolution of the therapeutic journey.
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
        bg="rgba(253, 251, 250, 0.9)" 
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="gray.100"
        py={6}
      >
        <Container maxW="7xl">
          <Flex direction={{ base: "column", lg: "row" }} gap={4} align={{ base: "stretch", lg: "center" }}>
            <InputGroup size="lg" flex="1">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search mentors by name, modality, or expertise..." 
                bg="white" 
                borderRadius="full" 
                fontSize="sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                _focus={{ borderColor: "teal.500", shadow: "none" }}
              />
            </InputGroup>

            <HStack spacing={3}>
                <Button 
                    display={{ base: "flex", xl: "none" }}
                    leftIcon={<FiFilter />} 
                    variant="solid" 
                    bg="white"
                    color="teal.800"
                    border="1px solid"
                    borderColor="teal.100"
                    borderRadius="full" 
                    h="48px"
                    px={6}
                    onClick={onOpen}
                    _hover={{ bg: "teal.50" }}
                >
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>

                <HStack display={{ base: "none", xl: "flex" }} spacing={3}>
                    <FilterDropdown 
                        label="Focus Area" 
                        icon={FiBook}
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
                        label="Location" 
                        icon={FiMapPin}
                        options={MAJOR_CITIES} 
                        selected={selectedCities} 
                        onSelect={(v) => toggleFilter(v, selectedCities, setSelectedCities)} 
                    />
                    
                    <Select 
                        variant="outline" 
                        borderRadius="full" 
                        h="48px" 
                        bg="white" 
                        w="180px"
                        fontSize="sm" 
                        fontWeight="600"
                        value={selectedExpLevel}
                        onChange={(e) => setSelectedExpLevel(e.target.value)}
                    >
                        {SUPERVISOR_EXPERIENCE_LEVELS.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                    </Select>
    
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} variant="outline" borderRadius="full" h="48px" px={6} bg="white" leftIcon={<FiDollarSign />} rightIcon={<FiChevronDown />} fontSize="sm">
                            Rate
                        </MenuButton>
                        <MenuList p={6} borderRadius="2xl" shadow="2xl" minW="300px">
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Text fontWeight="700" fontSize="sm">Supervision Rate</Text>
                                    <Text fontSize="xs" fontWeight="800" color="teal.600">₹{costRange[0]} - ₹{costRange[1]}</Text>
                                </HStack>
                                <RangeSlider 
                                    aria-label={['min', 'max']} 
                                    defaultValue={[0, 10000]} 
                                    min={0} 
                                    max={15000} 
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
                </HStack>

                {activeFilterCount > 0 && (
                    <Button variant="ghost" color="gray.500" fontSize="xs" onClick={resetFilters}>Reset</Button>
                )}
            </HStack>
          </Flex>
                    <MenuList p={6} borderRadius="2xl" shadow="2xl" minW="300px">
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Text fontWeight="700" fontSize="sm">Supervision Rate</Text>
                                <Text fontSize="xs" fontWeight="800" color="teal.600">₹{costRange[0]} - ₹{costRange[1]}</Text>
                            </HStack>
                            <RangeSlider 
                                aria-label={['min', 'max']} 
                                defaultValue={[0, 10000]} 
                                min={0} 
                                max={15000} 
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
                    CLEAR
                </Button>
            )}
          </Flex>
        </Container>
      </Box>

      {/* 💠 SUPERVISOR GRID */}
      <Container maxW="7xl" pt={12}>
        {loading ? (
            <Center py={40}>
                <VStack spacing={4}>
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="teal.500" size="xl" />
                    <Text fontWeight="600" color="gray.500">Connecting with senior masters...</Text>
                </VStack>
            </Center>
        ) : (
            <>
                <HStack spacing={3} mb={10}>
                    <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">
                        {filteredSupervisors.length} Senior Mentors Available
                    </Heading>
                </HStack>

                {filteredSupervisors.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        <AnimatePresence mode="popLayout">
                            {filteredSupervisors.map((s) => (
                                <SupervisorCard key={s.id} supervisor={s} />
                            ))}
                        </AnimatePresence>
                    </SimpleGrid>
                ) : (
                    <Center py={40} bg="white" borderRadius="3xl" border="2px dashed" borderColor="gray.100">
                        <VStack spacing={6}>
                            <Icon as={FiFilter} boxSize={12} color="gray.200" />
                            <Heading size="md" color="gray.600">No mentors match these specific criteria</Heading>
                            <Button onClick={resetFilters} variant="outline" borderRadius="full" px={10}>Reset Filters</Button>
                        </VStack>
                    </Center>
                )}
            </>
        )}
      </Container>

      {/* 🛡️ STANDARDS INFO */}
      <Container maxW="7xl" mt={24}>
          <Box p={12} bg="teal.50" borderRadius="4xl" border="1px solid" borderColor="teal.100">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
                  <VStack align="start" spacing={6}>
                      <Circle size="60px" bg="white" shadow="sm"><Icon as={FiShield} w={8} h={8} color="teal.800" /></Circle>
                      <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">The Gold Standard of Mentorship.</Heading>
                      <Text color="gray.600" fontSize="lg">
                          Clinical supervision at MLC is not just about troubleshooting cases. It is about the <b>long-term stewardship</b> of your clinical voice. All our supervisors are vetted for their ability to hold space for the professional and personal evolution of the therapist.
                      </Text>
                      <HStack spacing={4}>
                        <Icon as={FiCheckCircle} color="teal.500" />
                        <Text fontWeight="700" fontSize="sm">5+ Years Clinical Seniority Required</Text>
                      </HStack>
                  </VStack>
                  <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" borderRadius="3xl" shadow="xl" />
              </SimpleGrid>
          </Box>
      </Container>

      {/* 📱 MOBILE FILTER DRAWER */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay backdropFilter="blur(10px)" />
        <DrawerContent borderRadius="2xl 0 0 2xl" p={4}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="800">Filters</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="400">Refine the supervisor collective</Text>
            </VStack>
          </DrawerHeader>
          <DrawerBody py={6}>
            <VStack align="stretch" spacing={8}>
              <FormControl>
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Focus Area</FormLabel>
                <SimpleGrid columns={1} spacing={2}>
                    {EXPERTISE_AREAS.map(opt => (
                        <Checkbox 
                            key={opt} 
                            isChecked={selectedExpertise.includes(opt)} 
                            onChange={() => toggleFilter(opt, selectedExpertise, setSelectedExpertise)}
                            colorScheme="teal"
                        >
                            <Text fontSize="sm">{opt}</Text>
                        </Checkbox>
                    ))}
                </SimpleGrid>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Language</FormLabel>
                <Wrap spacing={2}>
                    {WORLD_LANGUAGES.map(opt => (
                        <Tag 
                            key={opt} 
                            size="md" 
                            variant={selectedLanguages.includes(opt) ? "solid" : "outline"} 
                            colorScheme="teal" 
                            cursor="pointer"
                            onClick={() => toggleFilter(opt, selectedLanguages, setSelectedLanguages)}
                        >
                            {opt}
                        </Tag>
                    ))}
                </Wrap>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Location</FormLabel>
                <Select value={selectedCities[0] || ""} onChange={(e) => setSelectedCities(e.target.value ? [e.target.value] : [])}>
                    <option value="">All Cities</option>
                    {MAJOR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase">Seniority Level</FormLabel>
                <Select value={selectedExpLevel} onChange={(e) => setSelectedExpLevel(e.target.value)}>
                    {SUPERVISOR_EXPERIENCE_LEVELS.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                </Select>
              </FormControl>

              <VStack align="stretch" spacing={4}>
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase" mb={0}>Rate (₹{costRange[0]} - ₹{costRange[1]})</FormLabel>
                <RangeSlider 
                    aria-label={['min', 'max']} 
                    defaultValue={[0, 10000]} 
                    min={0} 
                    max={15000} 
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
            </VStack>
          </DrawerBody>
          <Box p={6} borderTopWidth="1px">
            <Button w="full" bg="teal.800" color="white" borderRadius="full" h="56px" onClick={onClose} _hover={{ bg: "teal.900" }}>
                Show Results
            </Button>
            {activeFilterCount > 0 && (
                <Button w="full" variant="ghost" mt={2} onClick={resetFilters}>Reset All</Button>
            )}
          </Box>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
