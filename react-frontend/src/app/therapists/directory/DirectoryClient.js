'use client'

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Icon, Image, Badge, Stack, Flex, Select, Input, InputGroup,
  InputLeftElement, InputRightElement, useToast, Spinner, Center, Divider,
  Menu, MenuButton, MenuList, MenuItem, Checkbox,
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  IconButton, Tooltip, Wrap, WrapItem, Tag, TagLabel, TagCloseButton, Circle
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiFilter, FiUser, FiGlobe, FiClock, 
  FiMapPin, FiCheckCircle, FiChevronDown, FiX, FiVideo, FiBriefcase,
  FiHeart, FiStar, FiAward, FiArrowRight, FiActivity, FiShield, FiCheck
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
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
            <HStack spacing={1}>
              <Text as="span">{label}</Text>
              {hasSelection && (
                <Badge 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  px={1.5} 
                  py={0.2} 
                  fontSize="9.5px" 
                  fontWeight="700"
                >
                  {selected.length}
                </Badge>
              )}
            </HStack>
          </MenuButton>
          <MenuList 
            borderRadius="20px" 
            shadow="0 18px 45px -8px rgba(38,58,51,0.18)" 
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
            shadow="0 18px 45px -8px rgba(38,58,51,0.18)" 
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

const RateDropdown = ({ costRange, setCostRange, maxLimit = 10000 }) => {
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
                  <Text fontWeight="700" fontSize="13px" color="#263A33">Hourly Rate</Text>
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

const TherapistCardMini = ({ therapist }) => {
  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
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
      {/* Top Banner / Image */}
      <Box h="165px" position="relative" bg="gray.100" overflow="hidden">
        <Image
          src={therapist.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"}
          alt={therapist.name}
          w="full"
          h="full"
          objectFit="cover"
          transition="transform 0.3s ease"
          _groupHover={{ transform: "scale(1.03)" }}
        />
        <Box 
          position="absolute" 
          inset={0} 
          bgGradient="linear(to-t, rgba(0,0,0,0.45) 0%, transparent 60%)" 
        />
        
        {/* Verification Badge */}
        <Badge 
          position="absolute" 
          top={3} 
          right={3} 
          bg="white" 
          color="#56756D" 
          borderRadius="full" 
          px={2.5} 
          py={0.5} 
          shadow="sm"
          display="flex"
          alignItems="center"
          gap={1}
          fontSize="10px"
          fontWeight="800"
          letterSpacing="0.04em"
        >
          <Icon as={FiCheckCircle} color="blue.400" boxSize="11px" /> VERIFIED
        </Badge>

        <Box position="absolute" bottom={3} left={3} color="white">
            <HStack spacing={1.5}>
                <Badge bg="mlc.gold" color="white" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="700">
                    {therapist.years_experience}+ YRS EXP
                </Badge>
                <Badge bg="rgba(255,255,255,0.25)" backdropFilter="blur(6px)" color="white" borderRadius="full" px={2} py={0.5} fontSize="10px" fontWeight="600">
                    {Array.isArray(therapist.modality) ? therapist.modality[0] : (therapist.modality || "Integrative")}
                </Badge>
            </HStack>
        </Box>
      </Box>

      {/* Content */}
      <VStack align="stretch" p={4} spacing={2.5} flex="1">
        <VStack align="start" spacing={0.5}>
          <Heading fontSize="17px" fontWeight="600" color="#263A33" fontFamily="'Playfair Display', serif" lineHeight="1.2">
            {therapist.name}
          </Heading>
          <Text fontSize="10.5px" color="rgba(46,46,46,0.6)" fontWeight="700" letterSpacing="0.06em" textTransform="uppercase">
            {therapist.title || "Clinical Associate"}
          </Text>
        </VStack>

        <Box>
            <HStack spacing={1.5} mb={1.5} wrap="wrap">
                {(therapist.specialties || therapist.concerns || []).slice(0, 3).map(s => (
                    <Tag key={s} size="sm" variant="subtle" colorScheme="green" borderRadius="full" px={2.5} py={0.5}>
                        <TagLabel fontSize="10.5px" fontWeight="600">{s}</TagLabel>
                    </Tag>
                ))}
            </HStack>
            <Text fontSize="12px" color="rgba(46,46,46,0.72)" noOfLines={2} lineHeight="1.5">
                {therapist.bio || "A dedicated professional committed to holding space for your growth and emotional well-being through evidence-based clinical practices."}
            </Text>
        </Box>

        <VStack align="stretch" spacing={1.5} bg="rgba(86,117,109,0.05)" p={2.5} borderRadius="xl" border="1px solid rgba(86,117,109,0.08)">
            <HStack justify="space-between" fontSize="11.5px" color="gray.700">
                <HStack spacing={1.5} maxW="60%">
                    <Icon as={FiGlobe} color="#6B8B7B" boxSize="12px" flexShrink={0} />
                    <Text fontWeight="600" isTruncated>{Array.isArray(therapist.languages) ? therapist.languages.slice(0,2).join(", ") : "English, Hindi"}</Text>
                </HStack>
                <HStack spacing={0.5} flexShrink={0}>
                    <Text fontWeight="800" color="#263A33" fontSize="12px">₹{therapist.hourly_rate || "1200"}</Text>
                    <Text fontSize="10px" color="gray.500" fontWeight="500">/hr</Text>
                </HStack>
            </HStack>
            <HStack spacing={1.5} fontSize="11px" color="gray.600">
                <Icon as={FiVideo} color="#6B8B7B" boxSize="12px" flexShrink={0} />
                <Text fontWeight="500">Video & Online Sessions</Text>
            </HStack>
        </VStack>

        <HStack spacing={2} pt={1} mt="auto">
            <Button 
                as={NextLink}
                href={`/therapists/${therapist.id}`}
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
                href={`/therapists/${therapist.id}#booking-calendar`}
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
  const [costRange, setCostRange] = useState([0, 10000]);

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
  }, [therapists, searchTerm, selectedGender, selectedLanguages, selectedExpertise, selectedExpLevel, costRange, selectedModalities, selectedCities]);

  const isRateActive = costRange[0] > 0 || costRange[1] < 10000;
  const activeFilterCount = selectedGender.length + selectedLanguages.length + selectedExpertise.length + selectedModalities.length + selectedCities.length + (selectedExpLevel !== "all" ? 1 : 0) + (isRateActive ? 1 : 0);

  const resetFilters = () => {
      setSelectedGender([]);
      setSelectedLanguages([]);
      setSelectedExpertise([]);
      setSelectedModalities([]);
      setSelectedCities([]);
      setSelectedExpLevel("all");
      setCostRange([0, 10000]);
      setSearchTerm("");
  };

  return (
    <Box bg="#FDFBFA" minH="100vh" pb={{ base: 12, md: 16 }}>
      {/* 🌿 VISIONARY HERO */}
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

        <Box position="absolute" top="-10%" right="-5%" w="600px" h="600px" bg="#56756D" borderRadius="full" filter="blur(120px)" opacity="0.3" />
        <Box position="absolute" bottom="-10%" left="-5%" w="400px" h="400px" bg="mlc.gold" borderRadius="full" filter="blur(150px)" opacity="0.1" />
        
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
                    OUR CLINICAL COLLECTIVE
                </Badge>
                <Heading as="h1" fontSize={{ base: "32px", md: "44px", lg: "50px" }} fontFamily="'Playfair Display', serif" lineHeight="1.15" fontWeight="600" mb={3}>
                  Exceptional Minds <br /> Human Connection
                </Heading>
                <Text fontSize={{ base: "14.5px", md: "15.5px" }} opacity="0.8" maxW="2xl" mx="auto" lineHeight="1.6">
                  Meet the MLC Collective, a handpicked group of world-class therapists dedicated to the art and science of healing. No barriers, just expertise.
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
                  placeholder="Search by name, issue, or keyword..." 
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

              {/* Filter Pills */}
              <Wrap spacing={2} align="center">
                <FilterDropdown 
                  label="Expertise" 
                  icon={FiActivity}
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
                  label="Gender" 
                  icon={FiUser}
                  options={GENDER_OPTIONS} 
                  selected={selectedGender} 
                  onSelect={(v) => toggleFilter(v, selectedGender, setSelectedGender)} 
                  onClear={() => setSelectedGender([])}
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
                  options={EXPERIENCE_LEVELS}
                  selected={selectedExpLevel}
                  onSelect={(val) => setSelectedExpLevel(val)}
                />
                <RateDropdown 
                  costRange={costRange}
                  setCostRange={setCostRange}
                  maxLimit={10000}
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
                    {selectedExpertise.map(e => (
                      <Tag key={e} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{e}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(e, selectedExpertise, setSelectedExpertise)} />
                      </Tag>
                    ))}
                    {selectedLanguages.map(l => (
                      <Tag key={l} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{l}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(l, selectedLanguages, setSelectedLanguages)} />
                      </Tag>
                    ))}
                    {selectedGender.map(g => (
                      <Tag key={g} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{g}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(g, selectedGender, setSelectedGender)} />
                      </Tag>
                    ))}
                    {selectedCities.map(c => (
                      <Tag key={c} size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{c}</TagLabel>
                        <TagCloseButton onClick={() => toggleFilter(c, selectedCities, setSelectedCities)} />
                      </Tag>
                    ))}
                    {selectedExpLevel !== "all" && (
                      <Tag size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">{EXPERIENCE_LEVELS.find(l => l.value === selectedExpLevel)?.label}</TagLabel>
                        <TagCloseButton onClick={() => setSelectedExpLevel("all")} />
                      </Tag>
                    )}
                    {isRateActive && (
                      <Tag size="sm" borderRadius="full" variant="subtle" bg="rgba(86,117,109,0.12)" color="#263A33" px={3} py={1}>
                        <TagLabel fontSize="12px">₹{costRange[0].toLocaleString('en-IN')} - ₹{costRange[1].toLocaleString('en-IN')}</TagLabel>
                        <TagCloseButton onClick={() => setCostRange([0, 10000])} />
                      </Tag>
                    )}
                  </Wrap>
                </MotionBox>
              )}
            </AnimatePresence>
          </VStack>
        </Container>
      </Box>

      {/* 🖼️ THERAPIST GRID */}
      <Container maxW={{ base: "full", xl: "7xl" }} px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
        {loading ? (
            <Center py={40}>
                <VStack spacing={4}>
                    <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="#6B8B7B" size="xl" />
                    <Text fontWeight="600" color="rgba(46,46,46,0.6)">Preparing the collective...</Text>
                </VStack>
            </Center>
        ) : (
            <>
                <Flex justify="space-between" align="center" mb={5}>
                    <HStack spacing={3}>
                        <Heading size="md" color="#263A33" fontFamily="'Playfair Display', serif">
                            {filteredTherapists.length} Specialists Available
                        </Heading>
                        {filteredTherapists.length < therapists.length && (
                            <Badge borderRadius="full" px={3} bg="rgba(169,203,183,0.1)" color="#56756D">Filtered Results</Badge>
                        )}
                    </HStack>
                </Flex>

                {filteredTherapists.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 5, lg: 6 }}>
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
                                <Heading size="md" color="rgba(46,46,46,0.75)">No specialists match these filters</Heading>
                                <Text color="gray.400">Try adjusting your filters or search terms.</Text>
                            </VStack>
                            <Button onClick={resetFilters} variant="outline" borderRadius="full" px={10}>Reset Filters</Button>
                        </VStack>
                    </Center>
                )}
         {/* 🏔️ CLINICAL VERIFICATION QUALITY BANNER */}
      <Box mt={{ base: 10, md: 14 }} pt={{ base: 8, md: 10 }} pb={{ base: 6, md: 8 }} borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
        <VStack spacing={{ base: 5, md: 6 }} align="center" textAlign="center" maxW="3xl" mx="auto" px={4}>
          <HStack spacing={2.5}>
            <Circle size="32px" bg="#EAF2EE" color="#56756D">
              <Icon as={FiShield} boxSize="15px" />
            </Circle>
            <Text 
              fontSize="11.5px" 
              fontWeight="800" 
              letterSpacing="0.1em" 
              textTransform="uppercase" 
              color="#56756D"
            >
              Clinical Verification Standards
            </Text>
          </HStack>

          <Heading 
            fontSize={{ base: "22px", md: "26px" }} 
            color="#263A33" 
            fontFamily="'Playfair Display', serif" 
            fontWeight="600" 
            lineHeight="1.3"
          >
            A Commitment to Quality & Relational Safety
          </Heading>

          <Text 
            color="rgba(46, 46, 46, 0.68)" 
            fontSize="14px" 
            lineHeight="1.7" 
            maxW="2xl"
          >
            Every mental health professional at MLC undergoes a multi-stage verification process, including master's credential auditing, clinical orientation, and alignment with relational safety and supervision standards.
          </Text>

          <HStack 
            spacing={{ base: 4, md: 8 }} 
            pt={2}
            flexWrap="wrap"
            justify="center"
          >
            {[
              "Verified Academic Credentials",
              "Bi-Weekly Clinical Supervision",
              "Relational Safety Vetted"
            ].map((item) => (
              <HStack key={item} spacing={2}>
                <Circle size="20px" bg="#EAF2EE" color="#56756D" flexShrink={0}>
                  <Icon as={FiCheck} boxSize="11px" />
                </Circle>
                <Text fontSize="12.5px" fontWeight="600" color="#263A33" whiteSpace="nowrap">
                  {item}
                </Text>
              </HStack>
            ))}
          </HStack>

          <Button 
            as={NextLink} 
            href="/about" 
            size="sm"
            variant="outline"
            borderColor="rgba(86, 117, 109, 0.3)"
            color="#56756D"
            borderRadius="full"
            px={6}
            h="38px"
            fontWeight="600" 
            fontSize="12.5px" 
            mt={1}
            rightIcon={<FiArrowRight boxSize="12px" />}
            _hover={{ bg: "#56756D", color: "white", borderColor: "#56756D" }}
            transition="all 0.2s ease"
          >
            Learn About Our Standards
          </Button>
        </VStack>
      </Box>
            </>
        )}
      </Container>
    </Box>
  );
}
