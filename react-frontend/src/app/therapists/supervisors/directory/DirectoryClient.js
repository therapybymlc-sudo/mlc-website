'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Image, Badge, Stack, Flex, Select, Input, InputGroup,
  InputLeftElement, InputRightElement, IconButton, useToast, Spinner, Center, Divider,
  Menu, MenuButton, MenuList, MenuItem, Checkbox,
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  Wrap, Tag, TagLabel, TagCloseButton, Circle,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  useDisclosure, FormControl, FormLabel
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiFilter, FiUser, FiGlobe, FiClock,
  FiMapPin, FiCheckCircle, FiChevronDown, FiX, FiVideo, FiBriefcase,
  FiHeart, FiStar, FiAward, FiArrowRight, FiShield, FiBook, FiActivity
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
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

const FilterDropdown = ({ label, options, selected, onSelect, icon, onClear }) => {
  const hasSelection = selected.length > 0;
  return (
    <Menu closeOnSelect={false} placement="bottom-start">
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={
              <Icon 
                as={FiChevronDown} 
                boxSize="11px"
                transition="transform 0.2s ease" 
                transform={isOpen ? "rotate(180deg)" : "none"} 
                color={hasSelection ? "#56756D" : "rgba(46,46,46,0.45)"}
              />
            }
            variant="outline"
            borderRadius="full"
            px={3}
            h="38px"
            bg={hasSelection ? "rgba(86,117,109,0.08)" : "white"}
            borderColor={hasSelection ? "#56756D" : "rgba(86,117,109,0.2)"}
            _hover={{ 
              borderColor: "#56756D", 
              bg: hasSelection ? "rgba(86,117,109,0.12)" : "rgba(169,203,183,0.12)",
              transform: "translateY(-1px)",
              shadow: "0 4px 12px rgba(86,117,109,0.08)"
            }}
            _active={{ bg: "rgba(169,203,183,0.18)", borderColor: "#56756D" }}
            leftIcon={<Icon as={icon} boxSize="13px" color={hasSelection ? "#56756D" : "#6B8B7B"} />}
            fontSize="12.5px"
            fontWeight={hasSelection ? "600" : "500"}
            color={hasSelection ? "#263A33" : "rgba(38,58,51,0.85)"}
            transition="all 0.2s ease"
            whiteSpace="nowrap"
            shadow="0 1px 3px rgba(0,0,0,0.02)"
          >
            <HStack spacing={1.5}>
              <Text as="span">{label}</Text>
              {hasSelection && (
                <Badge 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  px={1.5} 
                  py={0.2} 
                  fontSize="10px" 
                  fontWeight="700"
                >
                  {selected.length}
                </Badge>
              )}
            </HStack>
          </MenuButton>
          <MenuList 
            borderRadius="20px" 
            shadow="0 18px 45px -6px rgba(38,58,51,0.18)" 
            p={2} 
            border="1px solid" 
            borderColor="rgba(86,117,109,0.14)" 
            maxH="320px" 
            overflowY="auto"
            zIndex={25}
            bg="white"
            minW="220px"
          >
            {hasSelection && onClear && (
              <Box px={3} py={1.5} mb={1} borderBottom="1px solid" borderColor="rgba(86,117,109,0.08)">
                <Flex justify="space-between" align="center">
                  <Text fontSize="11px" fontWeight="700" color="rgba(46,46,46,0.5)" textTransform="uppercase" letterSpacing="wider">
                    {selected.length} Selected
                  </Text>
                  <Button 
                    variant="link" 
                    size="xs" 
                    color="#56756D" 
                    fontSize="11px" 
                    fontWeight="600" 
                    onClick={onClear}
                  >
                    Clear
                  </Button>
                </Flex>
              </Box>
            )}
            {options.map((opt) => {
              const isChecked = selected.includes(opt);
              return (
                <MenuItem
                  key={opt}
                  onClick={() => onSelect(opt)}
                  borderRadius="10px"
                  bg={isChecked ? "rgba(86,117,109,0.07)" : "transparent"}
                  _hover={{ bg: "rgba(169,203,183,0.16)", color: "#263A33" }}
                  closeOnSelect={false}
                  py={2}
                  px={3}
                >
                  <Checkbox 
                    isChecked={isChecked} 
                    colorScheme="teal" 
                    pointerEvents="none"
                    mr={3}
                    borderColor="rgba(86,117,109,0.3)"
                  />
                  <Text fontSize="13px" fontWeight={isChecked ? "600" : "500"} color="#263A33">
                    {opt}
                  </Text>
                </MenuItem>
              );
            })}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

const ExperienceDropdown = ({ options, selected, onSelect }) => {
  const currentOption = options.find(o => o.value === selected) || options[0];
  const isCustom = selected !== "all";

  return (
    <Menu placement="bottom-start">
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={
              <Icon 
                as={FiChevronDown} 
                boxSize="11px"
                transition="transform 0.2s ease" 
                transform={isOpen ? "rotate(180deg)" : "none"} 
                color={isCustom ? "#56756D" : "rgba(46,46,46,0.45)"}
              />
            }
            variant="outline"
            borderRadius="full"
            px={3}
            h="38px"
            bg={isCustom ? "rgba(86,117,109,0.08)" : "white"}
            borderColor={isCustom ? "#56756D" : "rgba(86,117,109,0.2)"}
            _hover={{ 
              borderColor: "#56756D", 
              bg: isCustom ? "rgba(86,117,109,0.12)" : "rgba(169,203,183,0.12)",
              transform: "translateY(-1px)",
              shadow: "0 4px 12px rgba(86,117,109,0.08)"
            }}
            _active={{ bg: "rgba(169,203,183,0.18)", borderColor: "#56756D" }}
            leftIcon={<Icon as={FiAward} boxSize="13px" color={isCustom ? "#56756D" : "#6B8B7B"} />}
            fontSize="12.5px"
            fontWeight={isCustom ? "600" : "500"}
            color={isCustom ? "#263A33" : "rgba(38,58,51,0.85)"}
            transition="all 0.2s ease"
            whiteSpace="nowrap"
            shadow="0 1px 3px rgba(0,0,0,0.02)"
          >
            {currentOption.value === "all" ? "Experience" : currentOption.label}
          </MenuButton>
          <MenuList 
            borderRadius="20px" 
            shadow="0 18px 45px -6px rgba(38,58,51,0.18)" 
            p={2} 
            border="1px solid" 
            borderColor="rgba(86,117,109,0.14)" 
            zIndex={25}
            bg="white"
            minW="220px"
          >
            {options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <MenuItem
                  key={opt.value}
                  onClick={() => onSelect(opt.value)}
                  borderRadius="10px"
                  bg={isSelected ? "rgba(86,117,109,0.08)" : "transparent"}
                  _hover={{ bg: "rgba(169,203,183,0.16)", color: "#263A33" }}
                  py={2}
                  px={3}
                >
                  <HStack justify="space-between" w="full">
                    <Text fontSize="13px" fontWeight={isSelected ? "600" : "500"} color="#263A33">
                      {opt.label}
                    </Text>
                    {isSelected && <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />}
                  </HStack>
                </MenuItem>
              );
            })}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

const RateDropdown = ({ costRange, setCostRange, maxLimit = 15000 }) => {
  const isCustom = costRange[0] > 0 || costRange[1] < maxLimit;

  return (
    <Menu closeOnSelect={false} placement="bottom-start">
      {({ isOpen }) => (
        <>
          <MenuButton
            as={Button}
            rightIcon={
              <Icon 
                as={FiChevronDown} 
                boxSize="11px"
                transition="transform 0.2s ease" 
                transform={isOpen ? "rotate(180deg)" : "none"} 
                color={isCustom ? "#56756D" : "rgba(46,46,46,0.45)"}
              />
            }
            variant="outline"
            borderRadius="full"
            px={3}
            h="38px"
            bg={isCustom ? "rgba(86,117,109,0.08)" : "white"}
            borderColor={isCustom ? "#56756D" : "rgba(86,117,109,0.2)"}
            _hover={{ 
              borderColor: "#56756D", 
              bg: isCustom ? "rgba(86,117,109,0.12)" : "rgba(169,203,183,0.12)",
              transform: "translateY(-1px)",
              shadow: "0 4px 12px rgba(86,117,109,0.08)"
            }}
            _active={{ bg: "rgba(169,203,183,0.18)", borderColor: "#56756D" }}
            leftIcon={<Icon as={FaRupeeSign} boxSize="10px" color={isCustom ? "#56756D" : "#6B8B7B"} />}
            fontSize="12.5px"
            fontWeight={isCustom ? "600" : "500"}
            color={isCustom ? "#263A33" : "rgba(38,58,51,0.85)"}
            transition="all 0.2s ease"
            whiteSpace="nowrap"
            shadow="0 1px 3px rgba(0,0,0,0.02)"
          >
            {isCustom ? `₹${costRange[0].toLocaleString('en-IN')} - ₹${costRange[1].toLocaleString('en-IN')}` : "Rate"}
          </MenuButton>
          <MenuList 
            p={5} 
            borderRadius="24px" 
            shadow="0 18px 45px -8px rgba(38,58,51,0.18)" 
            minW="320px" 
            border="1px solid" 
            borderColor="rgba(86,117,109,0.14)" 
            zIndex={25}
            bg="white"
          >
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between" align="center">
                <HStack spacing={1.5}>
                  <Icon as={FaRupeeSign} color="#56756D" boxSize="12px" />
                  <Text fontWeight="700" fontSize="13px" color="#263A33">Supervision Rate</Text>
                </HStack>
                <Badge bg="rgba(86,117,109,0.1)" color="#56756D" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="700">
                  ₹{costRange[0].toLocaleString('en-IN')} – ₹{costRange[1].toLocaleString('en-IN')}
                </Badge>
              </Flex>

              <Box px={1} py={2}>
                <RangeSlider 
                  aria-label={['min', 'max']} 
                  value={costRange} 
                  min={0} 
                  max={maxLimit} 
                  step={250}
                  colorScheme="teal"
                  onChange={(val) => setCostRange(val)}
                >
                  <RangeSliderTrack bg="rgba(86,117,109,0.15)" h="5px" borderRadius="full">
                    <RangeSliderFilledTrack bg="#56756D" />
                  </RangeSliderTrack>
                  <RangeSliderThumb 
                    index={0} 
                    boxSize={5} 
                    bg="white" 
                    borderColor="#56756D" 
                    borderWidth="2px"
                    shadow="0 2px 6px rgba(0,0,0,0.18)"
                    _focus={{ boxShadow: "0 0 0 3px rgba(86,117,109,0.25)" }}
                  />
                  <RangeSliderThumb 
                    index={1} 
                    boxSize={5} 
                    bg="white" 
                    borderColor="#56756D" 
                    borderWidth="2px"
                    shadow="0 2px 6px rgba(0,0,0,0.18)"
                    _focus={{ boxShadow: "0 0 0 3px rgba(86,117,109,0.25)" }}
                  />
                </RangeSlider>
              </Box>

              {/* Quick Presets */}
              <Wrap spacing={2}>
                {[
                  { label: "All Rates", range: [0, maxLimit] },
                  { label: "Under ₹1,500", range: [0, 1500] },
                  { label: "₹1,500 - ₹3,000", range: [1500, 3000] },
                  { label: "₹3,000+", range: [3000, maxLimit] }
                ].map((preset) => {
                  const isPresetActive = costRange[0] === preset.range[0] && costRange[1] === preset.range[1];
                  return (
                    <Button
                      key={preset.label}
                      size="xs"
                      variant={isPresetActive ? "solid" : "outline"}
                      bg={isPresetActive ? "#56756D" : "transparent"}
                      color={isPresetActive ? "white" : "rgba(46,46,46,0.75)"}
                      borderColor={isPresetActive ? "#56756D" : "rgba(86,117,109,0.2)"}
                      borderRadius="full"
                      fontSize="11px"
                      fontWeight="600"
                      _hover={{ bg: isPresetActive ? "#4a645d" : "rgba(169,203,183,0.15)" }}
                      onClick={() => setCostRange(preset.range)}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </Wrap>

              {isCustom && (
                <Button 
                  size="xs" 
                  variant="ghost" 
                  color="rgba(46,46,46,0.6)" 
                  fontSize="11px"
                  alignSelf="flex-end"
                  onClick={() => setCostRange([0, maxLimit])}
                >
                  Reset Rate
                </Button>
              )}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  );
};

const SupervisorCard = ({ supervisor }) => {
  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      border="1px solid"
      borderColor="rgba(86,117,109,0.12)"
      shadow="0 2px 10px rgba(38,58,51,0.04)"
      _hover={{ shadow: "0 10px 25px -4px rgba(38,58,51,0.12)", transform: "translateY(-3px)", borderColor: "rgba(86,117,109,0.25)" }}
      display="flex"
      flexDirection="column"
      h="full"
    >
      <Box h="165px" position="relative" bg="gray.100" overflow="hidden">
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
          top={3} 
          right={3} 
          bg="#56756D" 
          color="white" 
          borderRadius="full" 
          px={2.5} 
          py={0.5} 
          fontSize="10px" 
          fontWeight="800"
          letterSpacing="0.04em"
        >
          BOARD APPROVED
        </Badge>

        <Box position="absolute" bottom={3} left={3} color="white">
            <HStack spacing={1.5}>
                <Badge bg="white" color="#56756D" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="700">
                    {supervisor.years_experience}+ YRS EXP
                </Badge>
                <Badge bg="rgba(255,255,255,0.25)" backdropFilter="blur(6px)" color="white" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="600">
                    SUPERVISOR
                </Badge>
            </HStack>
        </Box>
      </Box>

      <VStack align="stretch" p={4} spacing={2.5} flex="1">
        <VStack align="start" spacing={0.5}>
          <Heading fontSize="17px" fontWeight="600" color="#263A33" fontFamily="'Playfair Display', serif" lineHeight="1.2">
            {supervisor.name}
          </Heading>
          <Text fontSize="10.5px" color="rgba(46,46,46,0.6)" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase">
            Senior Clinical Supervisor
          </Text>
        </VStack>

        <Box>
            <HStack spacing={1.5} mb={1.5} wrap="wrap">
                {(supervisor.specialties || supervisor.concerns || []).slice(0, 3).map(s => (
                    <Tag key={s} size="sm" variant="subtle" colorScheme="green" borderRadius="full" px={2.5} py={0.5}>
                        <TagLabel fontSize="10.5px" fontWeight="600">{s}</TagLabel>
                    </Tag>
                ))}
            </HStack>
            <Text fontSize="12px" color="rgba(46,46,46,0.72)" noOfLines={2} lineHeight="1.5">
                {supervisor.bio || "Providing clinical supervision rooted in modality-specific excellence and the holistic evolution of the therapeutic identity."}
            </Text>
        </Box>

        <VStack align="stretch" spacing={1.5} bg="rgba(86,117,109,0.05)" p={2.5} borderRadius="xl" border="1px solid rgba(86,117,109,0.08)">
            <HStack justify="space-between" fontSize="11.5px" color="#263A33">
                <HStack spacing={1.5} maxW="60%">
                    <Icon as={FiGlobe} color="#56756D" boxSize="12px" flexShrink={0} />
                    <Text fontWeight="600" isTruncated>{Array.isArray(supervisor.languages) ? supervisor.languages.slice(0,2).join(", ") : "English, Hindi"}</Text>
                </HStack>
                <HStack spacing={0.5} flexShrink={0}>
                    <Text fontWeight="800" color="#263A33" fontSize="12px">₹{supervisor.hourly_rate || "1500"}</Text>
                    <Text fontSize="10px" color="gray.500" fontWeight="500">/hr</Text>
                </HStack>
            </HStack>
            <HStack spacing={1.5} fontSize="11px" color="gray.600">
                <Icon as={FiShield} color="#56756D" boxSize="12px" flexShrink={0} />
                <Text fontWeight="500">Secure Supervision Environment</Text>
            </HStack>
        </VStack>

        <HStack spacing={2} pt={1} mt="auto">
            <Button 
                as={NextLink}
                href={`/therapists/${supervisor.id}`}
                flex="1" 
                variant="outline" 
                borderRadius="full" 
                h="34px"
                fontSize="12px"
                fontWeight="600"
                borderColor="rgba(86,117,109,0.25)"
                color="#263A33"
                _hover={{ bg: 'rgba(169,203,183,0.12)', borderColor: '#56756D' }}
            >
                View Profile
            </Button>
            <Button 
                as={NextLink}
                href={`/therapists/${supervisor.id}#supervision-booking`}
                flex="1" 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                h="34px"
                fontSize="12px"
                fontWeight="600"
                rightIcon={<FiArrowRight boxSize="11px" />}
                _hover={{ bg: '#425C55', shadow: '0 4px 12px rgba(86,117,109,0.25)' }}
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Filters state
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedExpLevel, setSelectedExpLevel] = useState("all");
  const [costRange, setCostRange] = useState([0, 15000]);

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

  const isRateActive = costRange[0] > 0 || costRange[1] < 15000;
  const activeFilterCount = selectedGender.length + selectedLanguages.length + selectedExpertise.length + selectedCities.length + (selectedExpLevel !== "all" ? 1 : 0) + (isRateActive ? 1 : 0);

  const resetFilters = () => {
      setSelectedGender([]);
      setSelectedLanguages([]);
      setSelectedExpertise([]);
      setSelectedCities([]);
      setSelectedExpLevel("all");
      setCostRange([0, 15000]);
      setSearchTerm("");
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" pb={{ base: 12, md: 16 }}>
      {/* 🏛️ MENTORSHIP HERO */}
      <Box 
        position="relative" 
        pt={{ base: 8, md: 10 }} 
        pb={{ base: 6, md: 8 }} 
        px={6} 
        bg="#263A33"
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
        
        <Container maxW="6xl" position="relative" zIndex={2}>
          <VStack align="center" spacing={4} textAlign="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Badge 
                  bg="rgba(201, 169, 96, 0.18)" 
                  color="#F0D591" 
                  border="1px solid rgba(201, 169, 96, 0.4)" 
                  px={3.5} 
                  py={1} 
                  borderRadius="full" 
                  fontSize="xs" 
                  fontWeight="800" 
                  letterSpacing="widest" 
                  mb={3}
                  backdropFilter="blur(8px)"
                >
                    CLINICAL MASTERY & STEWARDSHIP
                </Badge>
                <Heading as="h1" fontSize={{ base: "32px", md: "44px", lg: "50px" }} fontFamily="'Playfair Display', serif" lineHeight="1.15" fontWeight="600" mb={3}>
                  Elevating Practice. <br /> Holding Space for Mentors.
                </Heading>
                <Text fontSize={{ base: "14.5px", md: "15.5px" }} opacity="0.8" maxW={{ base: "full", md: "4xl" }} mx="auto" lineHeight="1.6">
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
        zIndex={15} 
        bg="rgba(253, 251, 250, 0.92)" 
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(86, 117, 109, 0.12)"
        shadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        py={{ base: 2.5, md: 3 }}
      >
        <Container maxW={{ base: "full", xl: "7xl" }} px={{ base: 4, md: 6 }}>
          <VStack spacing={3} align="stretch">
            <Flex direction={{ base: "column", lg: "row" }} gap={3} align={{ base: "stretch", lg: "center" }} justify="space-between">
              <InputGroup size="sm" maxW={{ base: "full", lg: "220px", xl: "250px" }}>
                <InputLeftElement pointerEvents="none" h="38px">
                  <FiSearch color="#56756D" />
                </InputLeftElement>
                <Input 
                  placeholder="Search mentors by name, specialty..." 
                  bg="white" 
                  borderRadius="full" 
                  h="38px"
                  fontSize="12.5px"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  _focus={{ borderColor: "#56756D", shadow: "0 0 0 3px rgba(86,117,109,0.12)" }}
                  _placeholder={{ color: "rgba(46,46,46,0.45)" }}
                />
                {searchTerm && (
                  <InputRightElement h="38px">
                    <IconButton 
                      size="xs" 
                      variant="ghost" 
                      icon={<FiX />} 
                      onClick={() => setSearchTerm("")} 
                      aria-label="Clear search" 
                      borderRadius="full"
                      color="gray.400"
                      _hover={{ color: "gray.700" }}
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              {/* Mobile Filter Button */}
              <Button 
                display={{ base: "flex", md: "none" }}
                leftIcon={<FiFilter />} 
                variant="solid" 
                bg="white"
                color="#56756D"
                border="1px solid"
                borderColor="rgba(86,117,109,0.2)"
                borderRadius="full" 
                h="38px"
                px={5}
                onClick={onOpen}
                fontSize="12.5px"
                fontWeight="600"
                _hover={{ bg: "rgba(169,203,183,0.1)" }}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>

              {/* Desktop Filter Pills */}
              <Wrap display={{ base: "none", md: "flex" }} spacing={2} align="center">
                <FilterDropdown 
                  label="Focus Area" 
                  icon={FiBook}
                  options={EXPERTISE_AREAS} 
                  selected={selectedExpertise} 
                  onSelect={(v) => toggleFilter(v, selectedExpertise, setSelectedExpertise)} 
                  onClear={() => setSelectedExpertise([])}
                />
                <FilterDropdown 
                  label="Language" 
                  icon={FiGlobe}
                  options={WORLD_LANGUAGES} 
                  selected={selectedLanguages} 
                  onSelect={(v) => toggleFilter(v, selectedLanguages, setSelectedLanguages)} 
                  onClear={() => setSelectedLanguages([])}
                />
                <FilterDropdown 
                  label="Location" 
                  icon={FiMapPin}
                  options={MAJOR_CITIES} 
                  selected={selectedCities} 
                  onSelect={(v) => toggleFilter(v, selectedCities, setSelectedCities)} 
                  onClear={() => setSelectedCities([])}
                />
                <ExperienceDropdown 
                  options={SUPERVISOR_EXPERIENCE_LEVELS}
                  selected={selectedExpLevel}
                  onSelect={(val) => setSelectedExpLevel(val)}
                />
                <RateDropdown 
                  costRange={costRange}
                  setCostRange={setCostRange}
                  maxLimit={15000}
                />
                {activeFilterCount > 0 && (
                  <Button 
                    variant="ghost" 
                    color="rgba(46,46,46,0.65)" 
                    fontSize="12px" 
                    fontWeight="600" 
                    h="36px"
                    px={3}
                    borderRadius="full"
                    leftIcon={<FiX />}
                    onClick={resetFilters}
                    _hover={{ bg: "rgba(229, 62, 62, 0.08)", color: "red.600" }}
                  >
                    Reset
                  </Button>
                )}
              </Wrap>
            </Flex>

            {/* Active Filter Tags */}
            <AnimatePresence>
              {(activeFilterCount > 0 || searchTerm) && (
                <MotionBox initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Wrap spacing={2} pt={1}>
                    {searchTerm && (
                      <Tag size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">Search: "{searchTerm}"</TagLabel>
                        <TagCloseButton onClick={() => setSearchTerm("")} />
                      </Tag>
                    )}
                    {selectedExpertise.map(item => (
                      <Tag key={item} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{item}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(item, selectedExpertise, setSelectedExpertise)} />
                      </Tag>
                    ))}
                    {selectedLanguages.map(item => (
                      <Tag key={item} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{item}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(item, selectedLanguages, setSelectedLanguages)} />
                      </Tag>
                    ))}
                    {selectedCities.map(item => (
                      <Tag key={item} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{item}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(item, selectedCities, setSelectedCities)} />
                      </Tag>
                    ))}
                    {selectedExpLevel !== "all" && (
                      <Tag size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{SUPERVISOR_EXPERIENCE_LEVELS.find(l => l.value === selectedExpLevel)?.label}</TagLabel>
                        <TagCloseButton onClick={() => setSelectedExpLevel("all")} />
                      </Tag>
                    )}
                    {isRateActive && (
                      <Tag size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">₹{costRange[0].toLocaleString('en-IN')} - ₹{costRange[1].toLocaleString('en-IN')}</TagLabel>
                        <TagCloseButton onClick={() => setCostRange([0, 15000])} />
                      </Tag>
                    )}
                  </Wrap>
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Container>
      </Box>

      {/* 💠 SUPERVISOR GRID */}
      <Container maxW={{ base: "full", xl: "7xl" }} px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
        {loading ? (
            <Center py={40}>
                <VStack spacing={4}>
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="#6B8B7B" size="xl" />
                    <Text fontWeight="600" color="rgba(46,46,46,0.6)">Connecting with senior masters...</Text>
                </VStack>
            </Center>
        ) : (
            <>
                <HStack spacing={3} mb={5}>
                    <Heading size="md" color="#263A33" fontFamily="'Playfair Display', serif">
                        {filteredSupervisors.length} Senior Mentors Available
                    </Heading>
                </HStack>

                {filteredSupervisors.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 5, lg: 6 }}>
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
                            <Heading size="md" color="rgba(46,46,46,0.75)">No mentors match these specific criteria</Heading>
                            <Button onClick={resetFilters} variant="outline" borderRadius="full" px={10}>Reset Filters</Button>
                        </VStack>
                    </Center>
                )}
            </>
        )}
      </Container>

      {/* 🛡️ STANDARDS INFO */}
      <Container maxW="6xl" mt={{ base: 10, md: 12 }}>
        <Box 
          p={{ base: 5, md: 6 }} 
          bg="rgba(169,203,183,0.08)" 
          borderRadius="24px" 
          border="1px solid" 
          borderColor="rgba(86,117,109,0.14)"
          shadow="sm"
          _hover={{ borderColor: "rgba(86,117,109,0.22)", shadow: "md" }}
          transition="all 0.2s ease"
        >
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={{ base: 5, md: 8 }}>
            <VStack align="start" spacing={3} flex="1">
              <HStack spacing={2.5}>
                <Circle size="30px" bg="white" shadow="xs">
                  <Icon as={FiShield} boxSize="15px" color="#56756D" />
                </Circle>
                <Badge 
                  bg="white" 
                  color="#56756D" 
                  border="1px solid" 
                  borderColor="rgba(86,117,109,0.18)" 
                  px={2.5} 
                  py={0.5} 
                  borderRadius="full" 
                  fontSize="10.5px" 
                  fontWeight="700" 
                  letterSpacing="0.06em"
                >
                  SUPERVISORY STANDARDS
                </Badge>
              </HStack>

              <Heading fontSize={{ base: "19px", md: "22px" }} color="#263A33" fontFamily="'Playfair Display', serif" fontWeight="600" lineHeight="1.3">
                The Gold Standard of Mentorship
              </Heading>

              <Text color="rgba(46,46,46,0.72)" fontSize="13.5px" lineHeight="1.6" maxW="2xl">
                Clinical supervision at MLC is rooted in the <b>long-term stewardship</b> of your clinical voice. All supervisors are vetted for modality-specific depth and the professional evolution of the therapist.
              </Text>

              <HStack spacing={4} wrap="wrap" pt={0.5}>
                <HStack spacing={1.5} fontSize="12.5px" color="#263A33" fontWeight="600">
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />
                  <Text>5+ Years Clinical Seniority Required</Text>
                </HStack>
                <HStack spacing={1.5} fontSize="12.5px" color="#263A33" fontWeight="600">
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />
                  <Text>Modality-Specific Depth</Text>
                </HStack>
              </HStack>
            </VStack>

            <Box 
              flexShrink={0} 
              w={{ base: "full", md: "230px", lg: "270px" }} 
              h={{ base: "140px", md: "145px" }} 
              borderRadius="16px" 
              overflow="hidden" 
              shadow="sm"
            >
              <Image 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600" 
                alt="Clinical Supervision Standards"
                w="full" 
                h="full" 
                objectFit="cover" 
              />
            </Box>
          </Flex>
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
                <Text fontSize="xs" color="rgba(46,46,46,0.6)" fontWeight="400">Refine the supervisor collective</Text>
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
                            colorScheme="green"
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
                            colorScheme="green" 
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
                <FormLabel fontWeight="800" fontSize="xs" letterSpacing="widest" textTransform="uppercase" mb={0}>Rate (₹{costRange[0].toLocaleString('en-IN')} - ₹{costRange[1].toLocaleString('en-IN')})</FormLabel>
                <RangeSlider 
                    aria-label={['min', 'max']} 
                    value={costRange} 
                    min={0} 
                    max={15000} 
                    step={250}
                    colorScheme="teal"
                    onChange={(val) => setCostRange(val)}
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
            <Button w="full" bg="#56756D" color="white" borderRadius="full" h="46px" fontSize="14px" fontWeight="700" onClick={onClose} _hover={{ bg: "#263A33" }}>
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
