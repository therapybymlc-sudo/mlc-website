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
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Tag,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiSun, FiActivity, FiZap, FiMoon, FiCheck, FiArrowRight } from "react-icons/fi";
import { apiPost } from "../../../../../api.js";
import { useRouter } from "next/navigation";

export default function CheckinClient() {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    mood: "Balanced",
    energy: 5,
    stress: 5,
    gratitude: "",
    notes: ""
  });

  const moods = [
    { label: 'Calm', icon: FiSun, color: 'teal' },
    { label: 'Balanced', icon: FiActivity, color: 'blue' },
    { label: 'High Energy', icon: FiZap, color: 'orange' },
    { label: 'Low', icon: FiMoon, color: 'purple' },
  ];

  const handleMoodSelect = (m) => setData({ ...data, mood: m });

  const submitCheckin = async () => {
    setLoading(true);
    try {
      await apiPost("client-checkins/", {
        ...data,
        checkin_date: new Date().toISOString().split('T')[0],
      });
      toast({ 
        title: "Check-in Complete", 
        description: "Thank you for sharing. We've updated your reflection logs.", 
        status: "success" 
      });
      router.push("/dashboard/client");
    } catch (err) {
      toast({ title: "Failed to save check-in", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" pt={10}>
       <VStack spacing={12} align="stretch">
          {step === 1 && (
            <VStack spacing={10} align="center">
                <VStack spacing={2} textAlign="center">
                    <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">How are you arriving today?</Heading>
                    <Text color="gray.500">Take a moment to check in with your internal state.</Text>
                </VStack>
                
                <SimpleGrid columns={2} spacing={6} w="full">
                    {moods.map(m => (
                        <Box 
                            key={m.label}
                            p={8}
                            bg={data.mood === m.label ? `${m.color}.50` : 'white'}
                            border="2px solid"
                            borderColor={data.mood === m.label ? `${m.color}.500` : 'gray.100'}
                            borderRadius="3xl"
                            cursor="pointer"
                            onClick={() => handleMoodSelect(m.label)}
                            textAlign="center"
                            transition="0.2s"
                            _hover={{ borderColor: `${m.color}.300` }}
                        >
                            <Icon as={m.icon} color={data.mood === m.label ? `${m.color}.500` : 'gray.400'} boxSize={10} mb={4} />
                            <Text fontWeight="800" fontSize="lg" color="#2E2E2E">{m.label}</Text>
                        </Box>
                    ))}
                </SimpleGrid>
                
                <Button 
                    bg="#56756D" 
                    color="white" 
                    size="lg" 
                    h="60px" 
                    px={10} 
                    borderRadius="2xl" 
                    onClick={() => setStep(2)}
                    rightIcon={<FiArrowRight />}
                >
                    Continue
                </Button>
            </VStack>
          )}

          {step === 2 && (
            <VStack spacing={10} align="stretch">
                <VStack align="start" spacing={1}>
                    <Heading size="lg" color="#2E2E2E">Capacity & Focus</Heading>
                    <Text color="gray.500">Notice the physical and mental sensations in your body.</Text>
                </VStack>

                <FormControl>
                    <FormLabel fontWeight="700">Energy Level ({data.energy}/10)</FormLabel>
                    <Slider value={data.energy} min={1} max={10} onChange={(v) => setData({...data, energy: v})}>
                        <SliderTrack bg="gray.100"><SliderFilledTrack bg="teal.400" /></SliderTrack>
                        <SliderThumb boxSize={6} />
                    </Slider>
                    <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs">Low</Text>
                        <Text fontSize="xs">High</Text>
                    </HStack>
                </FormControl>

                <FormControl>
                    <FormLabel fontWeight="700">Stress Level ({data.stress}/10)</FormLabel>
                    <Slider value={data.stress} min={1} max={10} onChange={(v) => setData({...data, stress: v})}>
                        <SliderTrack bg="gray.100"><SliderFilledTrack bg="orange.400" /></SliderTrack>
                        <SliderThumb boxSize={6} />
                    </Slider>
                    <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs">Calm</Text>
                        <Text fontSize="xs">Overwhelmed</Text>
                    </HStack>
                </FormControl>

                <FormControl>
                    <FormLabel fontWeight="700">One thing you're grateful for today?</FormLabel>
                    <Input 
                        placeholder="e.g. A warm cup of tea" 
                        value={data.gratitude} 
                        onChange={(e) => setData({...data, gratitude: e.target.value})}
                        bg="white"
                        h="50px"
                        borderRadius="xl"
                    />
                </FormControl>

                <HStack pt={6}>
                    <Button variant="ghost" onClick={() => setStep(1)} h="60px">Back</Button>
                    <Button 
                        flex="1"
                        bg="#56756D" 
                        color="white" 
                        size="lg" 
                        h="60px" 
                        borderRadius="2xl" 
                        isLoading={loading}
                        onClick={submitCheckin}
                        rightIcon={<FiCheck />}
                    >
                        Complete Check-in
                    </Button>
                </HStack>
            </VStack>
          )}
       </VStack>
    </Box>
  );
}
