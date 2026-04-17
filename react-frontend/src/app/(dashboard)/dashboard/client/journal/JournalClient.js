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
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSave, FiClock, FiActivity, FiDownload, FiPlusCircle, FiMessageCircle, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import RichTextEditor from "../../../../../components/RichTextEditor.jsx";

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

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await apiGet("client-journals/");
      setEntries(Array.isArray(res) ? res : res.results || []);
    } catch (err) {
      console.warn("Could not fetch journal entries");
    }
  };

  const handleSave = async () => {
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
      setEntries([saved, ...entries]);
      resetForm();
      toast({ title: "Journal Entry Saved", status: "success" });
    } catch (err) {
      toast({ title: "Failed to save entry", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setContent("");
    setSelectedTags([]);
    setSelectedImpacts([]);
    setMoodLevel(3);
  };

  const toggleTag = (tag, list, setList) => {
    if (list.includes(tag)) setList(list.filter(t => t !== tag));
    else setList([...list, tag]);
  };

  const renderStep = () => {
    const config = MOOD_CONFIG[moodLevel];
    
    switch(step) {
      case 1:
        return (
          <VStack spacing={12} py={10} w="full">
            <VStack spacing={4}>
                <Heading size="md" color="gray.500">How are you feeling?</Heading>
                <Heading size="2xl" color="#2E2E2E">{config.label}</Heading>
            </VStack>
            
            <Center position="relative" w="300px" h="300px">
                <MotionBox
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                    w="200px"
                    h="200px"
                    borderRadius="full"
                    bg={config.color}
                    boxShadow={`0 0 80px ${config.glow}`}
                />
                <Box position="absolute" top="0" left="0" w="full" h="full" bgGradient={`radial(circle, transparent 40%, white 70%)`} />
            </Center>

            <VStack w="full" maxW="400px" spacing={6}>
              <Box position="relative" w="full" px={4}>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={moodLevel} 
                    onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                    style={{ width: "100%", height: "8px", borderRadius: "10px", background: "#E2E8F0", outline: "none", appearance: "none" }}
                  />
                  <HStack justify="space-between" w="full" mt={4}>
                      <Text fontSize="xs" fontWeight="700" color="gray.400">UNPLEASANT</Text>
                      <Text fontSize="xs" fontWeight="700" color="gray.400">PLEASANT</Text>
                  </HStack>
              </Box>
              <Button 
                rightIcon={<FiChevronRight />} 
                bg="#2E2E2E" 
                color="white" 
                borderRadius="full" 
                px={10} 
                onClick={() => setStep(2)}
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
             <HStack w="full" justify="space-between">
                <Button leftIcon={<FiChevronLeft />} variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <HStack>
                    <Badge variant="subtle" colorScheme="teal" borderRadius="full" px={3}>{config.label}</Badge>
                    {selectedTags.map(t => <Badge key={t} opacity={0.6} borderRadius="full">{t}</Badge>)}
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
    <Box maxW="1200px" mx="auto" px={4}>
        <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={10}>
            {/* Capture Area */}
            <Box colSpan={{ xl: 2 }}>
                <MotionBox 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    bg="white" 
                    p={8} 
                    borderRadius="4xl" 
                    shadow="xl" 
                    border="1px solid" 
                    borderColor="gray.50"
                    minH="700px"
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
            </Box>

            {/* History Rail */}
            <VStack align="stretch" spacing={6}>
                <HStack justify="space-between">
                    <Heading size="md" color="#2E2E2E" fontFamily="'Playfair Display', serif">Recent reflections</Heading>
                    <Icon as={FiClock} color="gray.400" />
                </HStack>
                <VStack align="stretch" spacing={4} maxH="750px" overflowY="auto" pr={2}>
                    {entries.map((entry) => (
                        <Box 
                            key={entry.id} 
                            p={5} 
                            borderRadius="3xl" 
                            bg="gray.50" 
                            border="1px solid" 
                            borderColor="gray.100"
                            cursor="pointer"
                            onClick={() => { setSelectedEntry(entry); onOpen(); }}
                            _hover={{ borderColor: '#C9A960', bg: 'white', shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            <HStack justify="space-between" mb={3}>
                                <Text fontSize="xs" fontWeight="800" color="gray.400">
                                    {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Text>
                                <Badge colorScheme="teal" borderRadius="full" fontSize="10px" px={2}>{entry.mood}</Badge>
                            </HStack>
                            <Box 
                                fontSize="sm" 
                                color="gray.600" 
                                noOfLines={2}
                                dangerouslySetInnerHTML={{ __html: entry.entry }}
                                sx={{ "img": { display: 'none' } }}
                            />
                        </Box>
                    ))}
                </VStack>
            </VStack>
        </SimpleGrid>

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
    </Box>
  );
}
