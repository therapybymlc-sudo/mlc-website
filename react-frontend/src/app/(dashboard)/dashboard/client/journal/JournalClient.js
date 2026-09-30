'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Divider,
  Center,
  Wrap,
  WrapItem,
  Tag,
  Grid,
  GridItem,
  Spinner,
  IconButton,
  Circle,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSave, FiDownload, FiChevronRight, FiChevronLeft, FiBookOpen, FiFeather, FiCheck, FiFileText } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import("../../../../../components/RichTextEditor.jsx"), {
  ssr: false,
  loading: () => <Box h="400px" bg="#FAF8F5" borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.14)" />
});
import { useAuth } from "../../../../../context/AuthContext";
import { useUser } from "@clerk/nextjs";
const JournalBookView = dynamic(() => import("./JournalBookView"), {
  ssr: false,
  loading: () => <Center h="100vh" w="100vw" position="fixed" top="0" left="0" bg="rgba(0,0,0,0.8)" zIndex={2000}><Spinner color="white" /></Center>
});

const MOOD_CONFIG = {
  1: { label: "Very Unpleasant", color: "#4A4E69", glow: "rgba(74, 78, 105, 0.3)", tags: ["Angry", "Anxious", "Scared", "Overwhelmed", "Ashamed", "Sad", "Lonely", "Hopeless"] },
  2: { label: "Unpleasant", color: "#8C7A87", glow: "rgba(140, 122, 135, 0.3)", tags: ["Drained", "Irritated", "Stressed", "Worried", "Bored", "Disappointed"] },
  3: { label: "Neutral", color: "#C9A960", glow: "rgba(201, 169, 96, 0.3)", tags: ["Peaceful", "Indifferent", "Quiet", "Thinking", "Balanced"] },
  4: { label: "Pleasant", color: "#56756D", glow: "rgba(86, 117, 109, 0.3)", tags: ["Happy", "Hopeful", "Grateful", "Content", "Motivated", "Proud"] },
  5: { label: "Very Pleasant", color: "#D4A373", glow: "rgba(212, 163, 115, 0.3)", tags: ["Amazed", "Excited", "Joyful", "Confident", "Brave", "Passionate"] },
};

const IMPACT_TAGS = ["Health", "Work", "Family", "Friends", "Partner", "Finance", "Self-Care", "Current Events"];

const MotionBox = motion(Box);

export default function JournalClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated, clientProfile } = useAuth();
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [entries, setEntries] = useState([]);
  const [step, setStep] = useState(1); // 1: Valence, 2: Tags, 3: Writing
  
  // New Capture states
  const [moodLevel, setMoodLevel] = useState(3);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedImpacts, setSelectedImpacts] = useState([]);
  const [selectedFeelingPrompts, setSelectedFeelingPrompts] = useState([]);
  
  const [content, setContent] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);

  async function fetchEntries() {
    try {
      const res = await apiGet("client-journals/");
      const data = Array.isArray(res) ? res : res.results || [];
      setEntries(data);
      localStorage.setItem("mlc_journal_cache", JSON.stringify(data));
    } catch (err) {
      console.warn("Could not fetch journal entries");
    }
  }

  async function handleSave() {
    if (!content || content === "<p></p>") return;
    setLoading(true);
    try {
      const saved = await apiPost("client-journals/", {
        entry: content,
        mood: MOOD_CONFIG[moodLevel].label,
        extra_data: {
          mood_level: moodLevel,
          tags: selectedTags,
          impacts: selectedImpacts
        }
      });
      const newEntries = [saved, ...entries];
      setEntries(newEntries);
      localStorage.setItem("mlc_journal_cache", JSON.stringify(newEntries));
      resetForm();
      toast({ 
        title: "Reflection Saved", 
        description: "Your journal entry has been safely preserved.",
        status: "success",
        duration: 3000
      });
    } catch (err) {
      toast({ title: "Failed to save entry", status: "error" });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStep(1);
    setContent("");
    setSelectedTags([]);
    setSelectedImpacts([]);
    setSelectedFeelingPrompts([]);
    setMoodLevel(3);
  }

  function toggleTag(tag, list, setList) {
    if (list.includes(tag)) setList(list.filter(t => t !== tag));
    else setList([...list, tag]);
  }

  useEffect(() => {
    setIsMounted(true);
    const cached = localStorage.getItem("mlc_journal_cache");
    if (cached) {
      try {
        setEntries(JSON.parse(cached));
      } catch {
        // Ignore cache parse errors
      }
    }

    const prefillRaw = localStorage.getItem("mlc_journal_prefill");
    if (prefillRaw) {
      try {
        const prefill = JSON.parse(prefillRaw);
        if (prefill?.source === "feelings-wheel") {
          const mood = Number(prefill?.moodLevel || 3);
          setMoodLevel(Number.isFinite(mood) ? Math.min(5, Math.max(1, mood)) : 3);
          setSelectedTags(Array.isArray(prefill?.selectedFeelings) ? prefill.selectedFeelings : []);
          setSelectedFeelingPrompts(
            Array.isArray(prefill?.selectedFeelingPrompts)
              ? prefill.selectedFeelingPrompts
                  .filter((item) => item && typeof item.feeling === "string" && typeof item.prompt === "string")
                  .map((item) => ({ feeling: item.feeling, prompt: item.prompt }))
              : []
          );
          if (typeof prefill?.prompt === "string" && prefill.prompt.trim()) {
            const htmlPrompt = prefill.prompt
              .split("\n")
              .map((line) => `<p>${line}</p>`)
              .join("");
            setContent(htmlPrompt);
          }
          setStep(3);
        }
      } catch (e) {
        console.warn("Invalid journal prefill payload");
      } finally {
        localStorage.removeItem("mlc_journal_prefill");
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        fetchEntries();
    }
  }, [authLoading, isAuthenticated]);

  if (!isMounted) return (
    <Center h="70vh">
        <VStack spacing={4}>
            <Spinner thickness="3px" speed="0.65s" emptyColor="rgba(86, 117, 109, 0.15)" color="#56756D" size="lg" />
            <Text color="#5A6E65" fontSize="13px" fontWeight="500">Preparing your private journal...</Text>
        </VStack>
    </Center>
  );

  const renderStep = () => {
    const config = MOOD_CONFIG[moodLevel];
    
    switch(step) {
      case 1:
        return (
          <VStack spacing={7} py={4} w="full">
            <VStack spacing={1} textAlign="center">
                <Heading 
                  fontSize={{ base: "24px", md: "28px" }} 
                  color="#263A33" 
                  fontWeight="600" 
                  letterSpacing="-0.015em"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  {config.label}
                </Heading>
                <Text color="#5A6E65" fontSize="13px">
                  Take a mindful breath and gently tune in to your present state.
                </Text>
            </VStack>
            
            <Center position="relative" w={{ base: "200px", md: "260px" }} h={{ base: "200px", md: "260px" }}>
                {/* Secondary Ripple/Echo */}
                <MotionBox
                    animate={{ 
                        scale: [1, 1.35, 1],
                        opacity: [0.25, 0.08, 0.25]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    w={{ base: "140px", md: "170px" }}
                    h={{ base: "140px", md: "170px" }}
                    position="absolute"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={config.color}
                />
                
                {/* Primary Breathing Pulse */}
                <MotionBox
                    animate={{ 
                        scale: [1, 1.12, 1],
                        borderRadius: ["50%", "42% 58% 50% 50% / 50% 50% 58% 42%", "50%"]
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    w={{ base: "140px", md: "170px" }}
                    h={{ base: "140px", md: "170px" }}
                    bg={config.color}
                    boxShadow={`0 0 60px ${config.glow}`}
                    zIndex={1}
                />
                <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient={`radial(circle, transparent 20%, white 80%)`} zIndex={2} pointerEvents="none" />
            </Center>

            <VStack w="full" maxW="320px" spacing={6}>
              <Box position="relative" w="full" px={2}>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={moodLevel} 
                    onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                    style={{ width: "100%", height: "6px", borderRadius: "10px", background: "rgba(86, 117, 109, 0.14)", outline: "none", appearance: "none" }}
                  />
                  <HStack justify="space-between" w="full" mt={3}>
                      <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.06em">UNPLEASANT</Text>
                      <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.06em">PLEASANT</Text>
                  </HStack>
              </Box>
              <Button 
                rightIcon={<Icon as={FiChevronRight} boxSize="13px" />} 
                bg="#263A33" 
                color="white" 
                borderRadius="full" 
                px={10} 
                height="40px"
                fontSize="13px"
                fontWeight="600"
                onClick={() => setStep(2)}
                _hover={{ bg: '#182722', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
              >
                Continue
              </Button>
            </VStack>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={7} py={4} w="full" align="start">
            <Button 
              leftIcon={<Icon as={FiChevronLeft} boxSize="13px" />} 
              variant="ghost" 
              onClick={() => setStep(1)}
              size="sm"
              borderRadius="full"
              color="#56756D"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
            >
              Back
            </Button>
            
            <VStack align="start" spacing={3} w="full">
                <Heading 
                  fontSize="16px" 
                  color="#263A33" 
                  fontWeight="600"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  What best describes this feeling?
                </Heading>
                <Wrap spacing={2.5}>
                    {config.tags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <WrapItem key={tag}>
                            <Button
                                size="sm"
                                height="32px"
                                borderRadius="full"
                                fontSize="12px"
                                fontWeight="600"
                                px={3.5}
                                bg={isSelected ? "#263A33" : "#FAF8F5"}
                                color={isSelected ? "white" : "#263A33"}
                                border="1px solid"
                                borderColor={isSelected ? "#263A33" : "rgba(86, 117, 109, 0.16)"}
                                _hover={{ bg: isSelected ? "#182722" : "white" }}
                                onClick={() => toggleTag(tag, selectedTags, setSelectedTags)}
                            >
                                {tag}
                            </Button>
                        </WrapItem>
                      );
                    })}
                </Wrap>
            </VStack>

            <VStack align="start" spacing={3} w="full">
                <Heading 
                  fontSize="14px" 
                  color="#56756D" 
                  fontWeight="600"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  What is having the biggest impact?
                </Heading>
                <Wrap spacing={2}>
                    {IMPACT_TAGS.map(tag => {
                      const isSelected = selectedImpacts.includes(tag);
                      return (
                        <WrapItem key={tag}>
                            <Button
                                size="xs"
                                height="28px"
                                borderRadius="full"
                                fontSize="11.5px"
                                fontWeight="600"
                                px={3}
                                bg={isSelected ? "rgba(86, 117, 109, 0.15)" : "transparent"}
                                color={isSelected ? "#263A33" : "#5A6E65"}
                                border="1px solid"
                                borderColor={isSelected ? "rgba(86, 117, 109, 0.3)" : "rgba(86, 117, 109, 0.12)"}
                                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                                onClick={() => toggleTag(tag, selectedImpacts, setSelectedImpacts)}
                            >
                                {tag}
                            </Button>
                        </WrapItem>
                      );
                    })}
                </Wrap>
            </VStack>

            <Button 
                rightIcon={<Icon as={FiChevronRight} boxSize="13px" />} 
                bg="#263A33" 
                color="white" 
                borderRadius="full" 
                px={8} 
                height="40px"
                fontSize="13px"
                fontWeight="600"
                w="full"
                onClick={() => setStep(3)}
                _hover={{ bg: "#182722" }}
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
                mt={2}
            >
                Start Writing
            </Button>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={5} py={4} w="full">
             <HStack w="full" justify="space-between" wrap="wrap" gap={3}>
                <Button 
                  leftIcon={<Icon as={FiChevronLeft} boxSize="13px" />} 
                  variant="ghost" 
                  onClick={() => setStep(2)} 
                  size="sm"
                  borderRadius="full"
                  color="#56756D"
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                >
                  Back
                </Button>
                <HStack spacing={2} wrap="nowrap" overflow="hidden">
                    <Badge 
                      bg="rgba(86, 117, 109, 0.12)" 
                      color="#263A33" 
                      border="1px solid rgba(86, 117, 109, 0.22)" 
                      borderRadius="full" 
                      px={3} 
                      py={0.5}
                      fontSize="10.5px"
                      fontWeight="700"
                      whiteSpace="nowrap"
                    >
                      {config.label}
                    </Badge>
                    {selectedTags.slice(0, 3).map(t => (
                      <Badge 
                        key={t} 
                        bg="#FAF8F5"
                        color="#5A6E65"
                        border="1px solid rgba(86, 117, 109, 0.12)"
                        borderRadius="full" 
                        fontSize="10px"
                        fontWeight="600"
                        px={2.5}
                        py={0.5}
                        whiteSpace="nowrap" 
                        display={{ base: "none", sm: "inline-block" }}
                      >
                        {t}
                      </Badge>
                    ))}
                </HStack>
             </HStack>
             
             <Box w="full" bg="white" borderRadius="2xl" p={1} border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
                {selectedFeelingPrompts.length > 0 && (
                  <Box
                    mx={2}
                    mt={2}
                    mb={3}
                    bg="rgba(250, 248, 245, 0.9)"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.14)"
                    borderRadius="xl"
                    p={4}
                  >
                    <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em">
                      Reflection Prompts From Your Feelings
                    </Text>
                    <VStack align="start" spacing={1.5} mt={2}>
                      {selectedFeelingPrompts.map(({ feeling, prompt }) => (
                        <Box key={`${feeling}-${prompt}`} w="full">
                          <Text as="span" fontWeight="600" color="#263A33" fontSize="13px">
                            {feeling}:
                          </Text>{" "}
                          <Text as="span" color="#5A6E65" fontSize="13px">
                            {prompt}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
                <RichTextEditor 
                    value={content}
                    onChange={(val) => setContent(val.html)}
                    placeholder="Write your thoughts, reflections, or insights here..."
                    minHeight="360px"
                    isPremium={true}
                />
             </Box>

             <Button 
                leftIcon={<Icon as={FiSave} boxSize="13px" />} 
                bg="#263A33" 
                color="white" 
                borderRadius="full" 
                height="40px"
                fontSize="13px"
                fontWeight="600"
                px={10}
                isLoading={loading}
                loadingText="Saving..."
                onClick={handleSave}
                _hover={{ bg: '#182722' }}
                w="full"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
            >
                Save Reflection
            </Button>
          </VStack>
        );
      default: return null;
    }
  };

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
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
                <Icon as={FiFileText} boxSize="22px" />
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
                  Reflective Journal
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
                Mindful Journal
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Check in with your feelings, reflect on prompts, and document your inner journey.
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2.5}>
            <Button
              size="sm"
              height="38px"
              variant="outline"
              borderRadius="full"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              leftIcon={<Icon as={FiBookOpen} boxSize="13px" />}
              onClick={() => setShowBook(true)}
              isDisabled={entries.length === 0}
              _hover={{ bg: "rgba(86, 117, 109, 0.06)", borderColor: "#56756D" }}
              transition="all 0.2s"
              whiteSpace="nowrap"
            >
              Book View
            </Button>
          </HStack>
        </Flex>
      </Box>

        <Grid 
            templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} 
            gap={7}
            alignItems="start"
        >
            {/* 🌿 Left Section: Interactive Mood & Capture Box (2 Cols) */}
            <GridItem colSpan={{ base: 1, lg: 2 }} id="tour-journal-capture">
                <MotionBox
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    bg="white" 
                    p={{ base: 5, md: 8 }} 
                    borderRadius="2xl" 
                    boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
                    border="1px solid" 
                    borderColor="rgba(86, 117, 109, 0.14)"
                    minH={{ base: "auto", md: "560px" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                >
                    <AnimatePresence mode="wait">
                        <MotionBox
                            key={step}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderStep()}
                        </MotionBox>
                    </AnimatePresence>
                </MotionBox>
            </GridItem>

            {/* 📜 Right Section: Recent Reflections Rail (1 Col) */}
            <GridItem colSpan={1} id="tour-journal-history">
                <VStack align="stretch" spacing={4} position={{ lg: "sticky" }} top="24px">
                    <HStack justify="space-between" align="center" mb={1}>
                        <VStack align="start" spacing={0.5}>
                            <Heading 
                              fontSize="16px" 
                              fontWeight="600" 
                              color="#263A33" 
                              letterSpacing="-0.015em"
                              fontFamily="'Outfit', var(--font-outfit), sans-serif"
                            >
                              Recent Reflections
                            </Heading>
                            <Text fontSize="12.5px" color="#718096">
                              Your documented journey
                            </Text>
                        </VStack>
                        
                        <VStack spacing={1} align="center" id="tour-book-view-btn">
                            <IconButton 
                                icon={<Icon as={FiBookOpen} boxSize="17px" />} 
                                variant="ghost" 
                                color="#263A33" 
                                aria-label="View as Book"
                                onClick={() => setShowBook(true)}
                                isDisabled={entries.length === 0}
                                _hover={{ bg: 'rgba(86, 117, 109, 0.1)' }}
                                transition="all 0.2s"
                                size="sm"
                                h="36px"
                                w="36px"
                                borderRadius="full"
                                bg="#FAF8F5"
                                border="1px solid"
                                borderColor="rgba(86, 117, 109, 0.16)"
                            />
                            <Text fontSize="9.5px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                              Book View
                            </Text>
                        </VStack>
                    </HStack>
                    
                    <VStack 
                      align="stretch" 
                      spacing={3} 
                      maxH={{ base: "400px", lg: "620px" }} 
                      overflowY="auto" 
                      pr={1} 
                      sx={{
                        "&::-webkit-scrollbar": { width: "4px" },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": { background: "rgba(86, 117, 109, 0.15)", borderRadius: "10px" }
                      }}
                    >
                        {entries.length > 0 ? entries.map((entry) => (
                            <Box 
                                key={entry.id} 
                                p={4} 
                                borderRadius="2xl" 
                                bg="white" 
                                border="1px solid" 
                                borderColor="rgba(86, 117, 109, 0.14)"
                                boxShadow="0 2px 10px rgba(38, 58, 51, 0.03)"
                                cursor="pointer"
                                onClick={() => { setSelectedEntry(entry); onOpen(); }}
                                _hover={{ borderColor: 'rgba(86, 117, 109, 0.28)', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(38, 58, 51, 0.06)' }}
                                transition="all 0.2s"
                            >
                                <HStack justify="space-between" mb={2} wrap="nowrap">
                                    <Badge 
                                      bg="rgba(86, 117, 109, 0.1)" 
                                      color="#263A33" 
                                      border="1px solid rgba(86, 117, 109, 0.18)"
                                      borderRadius="full" 
                                      fontSize="10px" 
                                      fontWeight="700"
                                      px={2.5} 
                                      py={0.2}
                                      whiteSpace="nowrap"
                                    >
                                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                    </Badge>
                                    <Badge 
                                      bg="rgba(16, 185, 129, 0.1)" 
                                      color="#047857" 
                                      borderRadius="full" 
                                      fontSize="10px" 
                                      fontWeight="600"
                                      px={2.5} 
                                      py={0.2}
                                      whiteSpace="nowrap"
                                    >
                                      {entry.mood}
                                    </Badge>
                                </HStack>
                                <Box 
                                    fontSize="13px" 
                                    color="#5A6E65" 
                                    lineHeight="1.5"
                                    noOfLines={2}
                                    dangerouslySetInnerHTML={{ __html: entry.entry }}
                                    sx={{ "img": { display: 'none' } }}
                                />
                            </Box>
                        )) : (
                            <Box 
                              p={8} 
                              border="1px dashed" 
                              borderColor="rgba(86, 117, 109, 0.2)" 
                              borderRadius="2xl" 
                              textAlign="center"
                              bg="#FAF8F5"
                            >
                                <VStack spacing={2}>
                                    <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                                      <Icon as={FiFeather} boxSize="18px" />
                                    </Circle>
                                    <Text color="#718096" fontSize="12.5px" fontWeight="500">
                                      No reflections documented yet.
                                    </Text>
                                </VStack>
                            </Box>
                        )}
                    </VStack>
                </VStack>
            </GridItem>
        </Grid>

        {/* 📖 Reflection Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(6px)" bg="rgba(38, 58, 51, 0.25)" />
            <ModalContent borderRadius="2xl" p={4} bg="white" border="1px solid rgba(86, 117, 109, 0.16)">
                <ModalHeader borderBottom="1px solid" borderColor="rgba(86, 117, 109, 0.1)" pb={5}>
                    <HStack justify="space-between" pr={10}>
                        <VStack align="start" spacing={0.5}>
                            <Text fontSize="11.5px" color="#718096" fontWeight="600">
                              {new Date(selectedEntry?.created_at).toLocaleString()}
                            </Text>
                            <Heading 
                              fontSize="18px" 
                              color="#263A33" 
                              fontWeight="600"
                              fontFamily="'Outfit', var(--font-outfit), sans-serif"
                            >
                              {selectedEntry?.mood} Reflection
                            </Heading>
                        </VStack>
                        <Button 
                          leftIcon={<Icon as={FiDownload} boxSize="13px" />} 
                          onClick={() => window.print()} 
                          variant="ghost" 
                          borderRadius="full"
                          size="sm"
                          height="32px"
                          fontSize="12px"
                          fontWeight="600"
                          color="#56756D"
                          _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                        >
                          Export
                        </Button>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton top={6} right={6} />
                <ModalBody py={6}>
                    {selectedEntry?.extra_data?.tags?.length > 0 && (
                        <Wrap mb={5} spacing={2}>
                            {selectedEntry.extra_data.tags.map(t => (
                              <Tag 
                                key={t} 
                                size="sm" 
                                borderRadius="full"
                                bg="#FAF8F5"
                                border="1px solid rgba(86, 117, 109, 0.16)"
                                color="#263A33"
                                fontSize="11px"
                                fontWeight="600"
                              >
                                {t}
                              </Tag>
                            ))}
                        </Wrap>
                    )}
                    <Box 
                        id="printable-journal-entry"
                        className="prose"
                        fontSize="14px"
                        color="#263A33"
                        lineHeight="1.6"
                        sx={{ "p": { mb: 4 }, "img": { borderRadius: "xl", my: 4 } }}
                        dangerouslySetInnerHTML={{ __html: selectedEntry?.entry }}
                    />
                    
                    {selectedEntry?.updates?.length > 0 && (
                      <>
                        <Divider my={8} borderColor="rgba(86, 117, 109, 0.12)" />
                        <VStack align="stretch" spacing={4}>
                            {selectedEntry.updates.map((upd, idx) => (
                                <Box key={idx} p={4} bg="#FAF8F5" borderRadius="xl" borderLeft="3px solid" borderColor="#56756D">
                                    <HStack justify="space-between" mb={1.5}>
                                        <Text fontSize="11px" fontWeight="700" color="#263A33">{upd.author} Note</Text>
                                        <Text fontSize="11px" color="#718096">{new Date(upd.created_at).toLocaleString()}</Text>
                                    </HStack>
                                    <Text fontSize="13px" color="#5A6E65" whiteSpace="pre-wrap">{upd.text}</Text>
                                </Box>
                            ))}
                        </VStack>
                      </>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>

        {/* Custom Input Styles */}
        <Box as="style">
            {`
                @media print {
                    body * { visibility: hidden; }
                    #printable-journal-entry, #printable-journal-entry * { visibility: visible; }
                    #printable-journal-entry { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    width: 22px;
                    height: 22px;
                    background: #263A33;
                    border: 3.5px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
                }
            `}
        </Box>

        {showBook && (
            <JournalBookView 
                entries={[...entries].reverse()} 
                onClose={() => setShowBook(false)} 
                userName={clientProfile?.name || user?.fullName || user?.firstName || "MLC Client"} 
            />
        )}
    </Box>
  );
}
