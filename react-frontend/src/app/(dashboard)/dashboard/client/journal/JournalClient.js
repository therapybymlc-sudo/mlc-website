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
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
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
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSave, FiClock, FiActivity, FiDownload, FiPlusCircle, FiMessageCircle, FiChevronRight, FiChevronLeft, FiBookOpen } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import("../../../../../components/RichTextEditor.jsx"), {
  ssr: false,
  loading: () => <Box h="400px" bg="gray.50" borderRadius="3xl" animate={{ opacity: [0.5, 1, 0.5] }} />
});
import { useAuth } from "../../../../../context/AuthContext";
import { useUser } from "@clerk/nextjs";
const JournalBookView = dynamic(() => import("./JournalBookView"), {
  ssr: false,
  loading: () => <Center h="100vh" w="100vw" position="fixed" top="0" left="0" bg="rgba(0,0,0,0.8)" zIndex={2000}><Spinner color="white" /></Center>
});

const MOOD_CONFIG = {
  1: { label: "Very Unpleasant", color: "#4A4E69", glow: "rgba(74, 78, 105, 0.4)", tags: ["Angry", "Anxious", "Scared", "Overwhelmed", "Ashamed", "Sad", "Lonely", "Hopeless"] },
  2: { label: "Unpleasant", color: "#9A8C98", glow: "rgba(154, 140, 152, 0.4)", tags: ["Drained", "Irritated", "Stressed", "Worried", "Bored", "Disappointed"] },
  3: { label: "Neutral", color: "#C9A960", glow: "rgba(201, 169, 96, 0.4)", tags: ["Peaceful", "Indifferent", "Quiet", "Thinking", "Balanced"] },
  4: { label: "Pleasant", color: "#84A59D", glow: "rgba(132, 165, 157, 0.4)", tags: ["Happy", "Hopeful", "Grateful", "Content", "Motivated", "Proud"] },
  5: { label: "Very Pleasant", color: "#F2CC8F", glow: "rgba(242, 204, 143, 0.4)", tags: ["Amazed", "Excited", "Joyful", "Confident", "Brave", "Passionate"] },
};

const IMPACT_TAGS = ["Health", "Work", "Family", "Friends", "Partner", "Finance", "Self-Care", "Current Events"];

const MotionBox = motion(Box);

export default function JournalClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [entries, setEntries] = useState([]);
  const [step, setStep] = useState(1); // 1: Valence, 2: Tags, 3: Writing
  
  // New Capture states
  const [moodLevel, setMoodLevel] = useState(3);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedImpacts, setSelectedImpacts] = useState([]);
  
  const [content, setContent] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);

  async function fetchEntries() {
    try {
      const res = await apiGet("client-journals/");
      const data = Array.isArray(res) ? res : res.results || [];
      setEntries(data);
      // Update cache
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
      toast({ title: "Journal Entry Saved", status: "success" });
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
    setMoodLevel(3);
  }

  function toggleTag(tag, list, setList) {
    if (list.includes(tag)) setList(list.filter(t => t !== tag));
    else setList([...list, tag]);
  }

  useEffect(() => {
    setIsMounted(true);
    // Load fallback from localStorage for instant UI
    const cached = localStorage.getItem("mlc_journal_cache");
    if (cached) {
      try {
        setEntries(JSON.parse(cached));
      } catch (e) {}
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
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#56756C" size="xl" />
            <Text color="gray.500" fontWeight="500">Preparing your healing space...</Text>
        </VStack>
    </Center>
  );

  const renderStep = () => {
    const config = MOOD_CONFIG[moodLevel];
    
    switch(step) {
      case 1:
        return (
          <VStack spacing={8} py={4} w="full">
            <VStack spacing={2} textAlign="center">
                <Text fontSize="sm" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="widest">How are you feeling?</Text>
                <Heading size="xl" color="#2E2E2E" fontWeight="900">{config.label}</Heading>
            </VStack>
            
            <Center position="relative" w={{ base: "200px", md: "280px" }} h={{ base: "200px", md: "280px" }}>
                {/* Secondary Ripple/Echo */}
                <MotionBox
                    animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    w={{ base: "140px", md: "180px" }}
                    h={{ base: "140px", md: "180px" }}
                    position="absolute"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={config.color}
                />
                
                {/* Primary Breathing Pulse */}
                <MotionBox
                    animate={{ 
                        scale: [1, 1.15, 1],
                        borderRadius: ["50%", "40% 60% 50% 50% / 50% 50% 60% 40%", "50%"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    w={{ base: "140px", md: "180px" }}
                    h={{ base: "140px", md: "180px" }}
                    bg={config.color}
                    boxShadow={`0 0 70px ${config.glow}`}
                    zIndex={1}
                />
                <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient={`radial(circle, transparent 20%, white 80%)`} zIndex={2} pointerEvents="none" />
            </Center>

            <VStack w="full" maxW="320px" spacing={8}>
              <Box position="relative" w="full" px={4}>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={moodLevel} 
                    onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                    style={{ width: "100%", height: "6px", borderRadius: "10px", background: "#EDF2F7", outline: "none", appearance: "none" }}
                  />
                  <HStack justify="space-between" w="full" mt={4}>
                      <Text fontSize="10px" fontWeight="800" color="gray.400">UNPLEASANT</Text>
                      <Text fontSize="10px" fontWeight="800" color="gray.400">PLEASANT</Text>
                  </HStack>
              </Box>
              <Button 
                rightIcon={<FiChevronRight />} 
                bg="#2E2E2E" 
                color="white" 
                borderRadius="full" 
                px={12} 
                h={12}
                onClick={() => setStep(2)}
                _hover={{ bg: '#56756D', transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                Continue
              </Button>
            </VStack>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} py={6} w="full" align="start">
            <Button leftIcon={<FiChevronLeft />} variant="ghost" onClick={() => setStep(1)}>Back</Button>
            
            <VStack align="start" spacing={4} w="full">
                <Heading size="md" color="#2E2E2E">What best describes this feeling?</Heading>
                <Wrap spacing={3}>
                    {config.tags.map(tag => (
                        <WrapItem key={tag}>
                            <Button
                                size="sm"
                                borderRadius="full"
                                variant={selectedTags.includes(tag) ? "solid" : "outline"}
                                colorScheme={selectedTags.includes(tag) ? "teal" : "gray"}
                                onClick={() => toggleTag(tag, selectedTags, setSelectedTags)}
                            >
                                {tag}
                            </Button>
                        </WrapItem>
                    ))}
                </Wrap>
            </VStack>

            <VStack align="start" spacing={4} w="full">
                <Heading size="sm" color="gray.500">What's having the biggest impact?</Heading>
                <Wrap spacing={3}>
                    {IMPACT_TAGS.map(tag => (
                        <WrapItem key={tag}>
                            <Button
                                size="xs"
                                borderRadius="full"
                                variant={selectedImpacts.includes(tag) ? "solid" : "ghost"}
                                bg={selectedImpacts.includes(tag) ? "teal.50" : "transparent"}
                                color={selectedImpacts.includes(tag) ? "teal.600" : "gray.600"}
                                onClick={() => toggleTag(tag, selectedImpacts, setSelectedImpacts)}
                            >
                                {tag}
                            </Button>
                        </WrapItem>
                    ))}
                </Wrap>
            </VStack>

            <Button 
                rightIcon={<FiChevronRight />} 
                bg="#2E2E2E" 
                color="white" 
                borderRadius="full" 
                px={10} 
                w="full"
                onClick={() => setStep(3)}
            >
                Start Writing
            </Button>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={6} py={6} w="full" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
             <HStack w="full" justify="space-between" wrap="wrap" gap={3}>
                <Button leftIcon={<FiChevronLeft />} variant="ghost" onClick={() => setStep(2)} size={{ base: "sm", md: "md" }}>Back</Button>
                <HStack spacing={2} wrap="nowrap" overflow="hidden">
                    <Badge variant="subtle" colorScheme="teal" borderRadius="full" px={3} whiteSpace="nowrap">{config.label}</Badge>
                    {selectedTags.map(t => <Badge key={t} opacity={0.6} borderRadius="full" whiteSpace="nowrap" display={{ base: "none", sm: "inline-block" }}>{t}</Badge>)}
                </HStack>
             </HStack>
             
             <Box w="full" bg={"white"} borderRadius="3xl" p={1} border="2px solid" borderColor="gray.50">
                <RichTextEditor 
                    value={content}
                    onChange={(val) => setContent(val.html)}
                    placeholder="Write your reflection here..."
                    minHeight="400px"
                    isPremium={true}
                />
             </Box>

             <Button 
                leftIcon={<FiSave />} 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                size="lg"
                px={12}
                isLoading={loading}
                onClick={handleSave}
                _hover={{ bg: '#C9A960' }}
                w="full"
            >
                Save Final Save
            </Button>
          </VStack>
        );
      default: return null;
    }
  };

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, lg: 8 }} py={6}>
        <Grid 
            templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} 
            gap={10}
            alignItems="start"
        >
            {/* Capture Area - Takes 2/3 on large screens */}
            <GridItem colSpan={{ base: 1, lg: 2 }} id="tour-journal-capture">
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    bg="white" 
                    p={{ base: 5, md: 10 }} 
                    borderRadius={{ base: "3xl", md: "4xl" }} 
                    shadow="xl" 
                    border="1px solid" 
                    borderColor="gray.50"
                    minH={{ base: "auto", md: "700px" }}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                >
                    <AnimatePresence mode="wait">
                        <MotionBox
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </MotionBox>
                    </AnimatePresence>
                </MotionBox>
            </GridItem>

            {/* History Rail - Takes 1/3 */}
            <GridItem colSpan={1} id="tour-journal-history">
                <VStack align="stretch" spacing={6} position={{ lg: "sticky" }} top="24px">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                            <Heading size="md" color="#2E2E2E" fontFamily="'Playfair Display', serif">Recent reflections</Heading>
                            <Text fontSize="xs" color="gray.400">Your documented journey</Text>
                        </VStack>
                        <VStack spacing={2} align="center" id="tour-book-view-btn">
                            <IconButton 
                                icon={<FiBookOpen fontSize="24px" />} 
                                variant="ghost" 
                                color="mlc.greenDark" 
                                aria-label="View as Book"
                                onClick={() => setShowBook(true)}
                                isDisabled={entries.length === 0}
                                _hover={{ bg: 'teal.50', color: 'mlc.gold', transform: 'scale(1.1)' }}
                                transition="all 0.2s"
                                size="lg"
                                h="56px"
                                w="56px"
                                borderRadius="full"
                                shadow="sm"
                                bg="white"
                                border="1px solid"
                                borderColor="gray.100"
                            />
                            <Text fontSize="10px" fontWeight="800" color="mlc.greenDark" letterSpacing="wider">BOOK VIEW</Text>
                        </VStack>
                    </HStack>
                    
                    <VStack align="stretch" spacing={4} maxH={{ base: "400px", lg: "700px" }} overflowY="auto" pr={2} sx={{
                        "&::-webkit-scrollbar": { width: "4px" },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": { background: "gray.100", borderRadius: "10px" }
                    }}>
                        {entries.length > 0 ? entries.map((entry) => (
                            <Box 
                                key={entry.id} 
                                p={5} 
                                borderRadius="2xl" 
                                bg="white" 
                                border="1px solid" 
                                borderColor="gray.100"
                                cursor="pointer"
                                onClick={() => { setSelectedEntry(entry); onOpen(); }}
                                _hover={{ borderColor: '#C9A960', transform: 'translateY(-2px)', shadow: 'md' }}
                                transition="all 0.2s"
                            >
                                <HStack justify="space-between" mb={3} wrap="nowrap">
                                    <Text fontSize="10px" fontWeight="900" color="#C9A960" whiteSpace="nowrap">
                                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                    </Text>
                                    <Badge colorScheme="teal" borderRadius="full" fontSize="10px" px={2} variant="subtle" whiteSpace="nowrap">{entry.mood}</Badge>
                                </HStack>
                                <Box 
                                    fontSize="sm" 
                                    color="gray.600" 
                                    lineHeight="1.6"
                                    noOfLines={2}
                                    dangerouslySetInnerHTML={{ __html: entry.entry }}
                                    sx={{ "img": { display: 'none' } }}
                                />
                            </Box>
                        )) : (
                            <Center py={20} border="2px dashed" borderColor="gray.100" borderRadius="3xl">
                                <VStack spacing={2}>
                                    <Icon as={FiMessageCircle} boxSize={6} color="gray.200" />
                                    <Text color="gray.400" fontSize="sm">No reflections yet.</Text>
                                </VStack>
                            </Center>
                        )}
                    </VStack>
                </VStack>
            </GridItem>
        </Grid>

        {/* Modal for Details (Same as before but with mood visualization) */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent borderRadius="3xl" p={4} bg="rgba(255,255,255,0.9)">
                <ModalHeader borderBottom="1px solid" borderColor="gray.100" pb={6}>
                    <HStack justify="space-between" pr={10}>
                        <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.400" fontWeight="bold">{new Date(selectedEntry?.created_at).toLocaleString()}</Text>
                            <Heading size="lg" color="#56756D">{selectedEntry?.mood} Reflection</Heading>
                        </VStack>
                        <Button leftIcon={<FiDownload />} onClick={() => window.print()} variant="ghost" colorScheme="teal" borderRadius="full">Export</Button>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton top={8} right={8} />
                <ModalBody py={8}>
                    {selectedEntry?.extra_data?.tags?.length > 0 && (
                        <Wrap mb={6} spacing={2}>
                            {selectedEntry.extra_data.tags.map(t => <Tag key={t} size="sm" borderRadius="full">{t}</Tag>)}
                        </Wrap>
                    )}
                    <Box 
                        id="printable-journal-entry"
                        className="prose"
                        sx={{ "p": { mb: 4 }, "img": { borderRadius: "xl", my: 4 } }}
                        dangerouslySetInnerHTML={{ __html: selectedEntry?.entry }}
                    />
                    
                    <Divider my={10} />
                    
                    {/* Comments section same as implemented before */}
                    <VStack align="stretch" spacing={6}>
                        {selectedEntry?.updates?.map((upd, idx) => (
                            <Box key={idx} p={5} bg="#FAF7F2" borderRadius="2xl" borderLeft="4px solid" borderColor="#C9A960">
                                <HStack justify="space-between" mb={2}>
                                    <Text fontSize="xs" fontWeight="bold" color="#C9A960">{upd.author} Addition</Text>
                                    <Text fontSize="xs" color="gray.400">{new Date(upd.created_at).toLocaleString()}</Text>
                                </HStack>
                                <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">{upd.text}</Text>
                            </Box>
                        ))}
                    </VStack>
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
                    width: 24px;
                    height: 24px;
                    background: #2E2E2E;
                    border: 4px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
            `}
        </Box>

        {showBook && (
            <JournalBookView 
                entries={[...entries].reverse()} 
                onClose={() => setShowBook(false)} 
                userName={user?.fullName || "MLC Client"} 
            />
        )}
    </Box>
  );
}
