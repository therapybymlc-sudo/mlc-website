'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  useToast,
  Divider,
  Icon,
  Select,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiEdit3, FiSave, FiClock, FiActivity } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";

const journalEmotions = [
  "Calm", "Hopeful", "Grateful", "Anxious", "Overwhelmed", "Tired", "Sad", "Angry", "Motivated"
];

export default function JournalClient() {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("Calm");
  const [intensity, setIntensity] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await apiGet("client-journals/");
        setEntries(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        console.warn("Could not fetch journal entries");
      }
    };
    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const saved = await apiPost("client-journals/", {
        entry: content,
        emotion,
        intensity,
        mood: emotion,
      });
      setEntries([saved, ...entries]);
      setContent("");
      toast({ title: "Journal Entry Saved", status: "success" });
    } catch (err) {
      toast({ title: "Failed to save entry", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1000px" mx="auto">
       <VStack align="start" spacing={1} mb={8}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            Private Journal
          </Heading>
          <Text color="gray.500">Your protected space for reflection and emotional processing.</Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={12}>
            <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                <Heading size="md" mb={6} color="#2E2E2E">New Reflection</Heading>
                <VStack spacing={6} align="stretch">
                    <Textarea 
                        placeholder="What's on your mind today?" 
                        minH="200px" 
                        borderRadius="2xl" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        borderColor="gray.200"
                        _focus={{ borderColor: '#56756D', boxShadow: 'none' }}
                    />
                    
                    <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Primary Emotion</FormLabel>
                            <Select 
                                value={emotion} 
                                onChange={(e) => setEmotion(e.target.value)} 
                                borderRadius="xl"
                            >
                                {journalEmotions.map(e => <option key={e} value={e}>{e}</option>)}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="600">Intensity: {intensity}/10</FormLabel>
                            <Slider value={intensity} min={1} max={10} step={1} onChange={setIntensity}>
                                <SliderTrack bg="gray.100"><SliderFilledTrack bg="#56756D" /></SliderTrack>
                                <SliderThumb boxSize={4} />
                            </Slider>
                        </FormControl>
                    </SimpleGrid>

                    <Button 
                        leftIcon={<FiSave />} 
                        bg="#56756D" 
                        color="white" 
                        borderRadius="full" 
                        py={6} 
                        isLoading={loading}
                        onClick={handleSave}
                        _hover={{ bg: '#C9A960' }}
                    >
                        Save to Journal
                    </Button>
                </VStack>
            </Box>

            <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                <HStack justify="space-between" mb={6}>
                    <Heading size="md" color="#2E2E2E">Recent History</Heading>
                    <Icon as={FiClock} color="gray.400" />
                </HStack>
                <VStack align="stretch" spacing={4} maxH="400px" overflowY="auto" pr={2}>
                    {entries.map((entry) => (
                        <Box key={entry.id} p={4} borderRadius="2xl" bg="gray.50" border="1px solid" borderColor="gray.100">
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="xs" fontWeight="700" color="#56756D">
                                    {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Text>
                                <HStack>
                                    <Icon as={FiActivity} boxSize={3} color="orange.300" />
                                    <Text fontSize="xs" fontWeight="600">{entry.emotion || entry.mood}</Text>
                                </HStack>
                            </HStack>
                            <Text fontSize="sm" noOfLines={3} color="gray.600">{entry.entry}</Text>
                        </Box>
                    ))}
                    {entries.length === 0 && <Text color="gray.400" textAlign="center" py={10}>No reflections yet.</Text>}
                </VStack>
            </Box>
        </SimpleGrid>
    </Box>
  );
}
