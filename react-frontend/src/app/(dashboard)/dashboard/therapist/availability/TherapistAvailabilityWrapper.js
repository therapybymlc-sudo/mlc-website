'use client'

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Flex,
  Input,
  Text,
  VStack,
  Box,
  Heading,
  SimpleGrid,
  useToast,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { FiClock, FiPlus, FiTrash2, FiSave, FiSettings, FiCopy } from "react-icons/fi";
import { apiGet, apiPatch } from "../../../../../api";

export default function TherapistAvailabilityWrapper() {
  const toast = useToast();
  
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(null);
  const [businessHours, setBusinessHours] = useState({});
  const [loading, setLoading] = useState(true);

  // Global system range (e.g., 7 AM to 8 PM)
  const [globalRange, setGlobalRange] = useState({ start: "07:00", end: "20:00" });

  const DAYS = [
    { key: "1", label: "Mon" },
    { key: "2", label: "Tue" },
    { key: "3", label: "Wed" },
    { key: "4", label: "Thu" },
    { key: "5", label: "Fri" },
    { key: "6", label: "Sat" },
    { key: "7", label: "Sun" },
  ];

  const generateHourlySlots = (startStr, endStr) => {
    const list = [];
    let cur = parseInt(startStr.split(":")[0], 10);
    const end = parseInt(endStr.split(":")[0], 10);
    while (cur < end) {
        list.push(`${String(cur).padStart(2, '0')}:00`);
        cur++;
    }
    return list;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotData, profileData] = await Promise.all([
        apiGet("availability-slots/"),
        apiGet("therapists/me/").catch(() => null)
      ]);
      setSlots(Array.isArray(slotData) ? slotData : slotData.results || []);
      if (profileData) {
        setProfile(profileData);
        setBusinessHours(profileData.business_hours || {});
      }
    } catch (err) {
      console.warn("Could not load availability data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSlot = (dayKey, slotTime) => {
    const current = [...(businessHours[dayKey] || [])];
    const index = current.indexOf(slotTime);
    if (index > -1) {
        current.splice(index, 1);
    } else {
        current.push(slotTime);
    }
    setBusinessHours({ ...businessHours, [dayKey]: current });
  };

  const applyToAll = (dayKey) => {
      const pattern = businessHours[dayKey] || [];
      const newBh = {};
      DAYS.forEach(day => {
          newBh[day.key] = [...pattern];
      });
      setBusinessHours(newBh);
      toast({ title: `Copied ${DAYS.find(d => d.key === dayKey).label} pattern to all days`, status: "info", duration: 2000 });
  };

  const handleSavePattern = async () => {
    if (!profile) return;
    try {
        await apiPatch(`therapists/${profile.id}/`, { business_hours: businessHours });
        toast({ title: "Availability updated", status: "success" });
        loadData();
    } catch (err) {
        toast({ title: "Failed to save", status: "error" });
    }
  };

  return (
    <VStack align="stretch" spacing={6} pb={20} p={{ base: 2, md: 0 }}>
       <Box bg="white" p={{ base: 4, md: 8 }} borderRadius={{ base: "2xl", md: "4xl" }} shadow="sm" border="1px solid" borderColor="gray.100">
            <Flex 
                direction={{ base: "column", xl: "row" }} 
                justify="space-between" 
                mb={8} 
                gap={6}
            >
                <HStack spacing={4}>
                    <Icon as={FiClock} color="#56756D" w={6} h={6} />
                    <VStack align="start" spacing={0}>
                        <Heading size="md" color="#2E2E2E">Weekly Capacity</Heading>
                        <Text fontSize="sm" color="gray.500">Enable hours to open them for booking.</Text>
                    </VStack>
                </HStack>
                
                <Flex 
                    direction={{ base: "column", sm: "row" }} 
                    spacing={{ base: 4, sm: 6 }} 
                    bg="gray.50" 
                    p={4} 
                    borderRadius="2xl" 
                    gap={4}
                    align={{ base: "stretch", sm: "end" }}
                >
                    <HStack spacing={4} flex={1}>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="700">Start</FormLabel>
                            <Select size="sm" borderRadius="xl" value={globalRange.start} onChange={(e) => setGlobalRange({ ...globalRange, start: e.target.value })} bg="white">
                                {Array.from({length: 24}).map((_, i) => {
                                    const h = String(i).padStart(2, '0');
                                    return <option key={h} value={`${h}:00`}>{i % 12 || 12} {i >= 12 ? 'PM' : 'AM'}</option>
                                })}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="700">End</FormLabel>
                            <Select size="sm" borderRadius="xl" value={globalRange.end} onChange={(e) => setGlobalRange({ ...globalRange, end: e.target.value })} bg="white">
                                {Array.from({length: 24}).map((_, i) => {
                                    const h = String(i).padStart(2, '0');
                                    return <option key={h} value={`${h}:00`}>{i % 12 || 12} {i >= 12 ? 'PM' : 'AM'}</option>
                                })}
                            </Select>
                        </FormControl>
                    </HStack>
                    <Button bg="#56756C" color="white" borderRadius="full" size="md" px={8} leftIcon={<FiSave />} onClick={handleSavePattern} _hover={{ bg: '#2E2E2E' }} w={{ base: "full", sm: "auto" }}>
                        Apply Changes
                    </Button>
                </Flex>
            </Flex>

            <VStack align="stretch" spacing={8}>
                {DAYS.map(day => (
                    <VStack key={day.key} align="stretch" spacing={3}>
                        <HStack justify="space-between">
                            <HStack>
                                <Text fontWeight="800" color="#56756C" fontSize="sm">{day.label.toUpperCase()}</Text>
                                <HStack spacing={2}>
                                    <IconButton 
                                        icon={<FiCopy />} 
                                        size="xs" 
                                        variant="ghost" 
                                        colorScheme="teal" 
                                        aria-label="Apply to all" 
                                        onClick={() => applyToAll(day.key)}
                                    />
                                    <Text fontSize="2xs" color="gray.400" fontWeight="600" display={{ base: "none", lg: "block" }}>
                                        Duplicate today's schedule to your entire week
                                    </Text>
                                </HStack>
                            </HStack>
                            <Divider flex={1} ml={4} display={{ base: "none", sm: "block" }} />
                        </HStack>
                        <Flex gap={2} wrap="wrap">
                            {generateHourlySlots(globalRange.start, globalRange.end).map(time => {
                                const isActive = (businessHours[day.key] || []).includes(time);
                                const hour = parseInt(time.split(":")[0], 10);
                                const ampm = hour >= 12 ? 'p' : 'a';
                                const displayHour = hour % 12 || 12;
                                const label = `${displayHour}${ampm}`;
                                return (
                                    <Button
                                        key={time}
                                        size="sm"
                                        variant={isActive ? "solid" : "outline"}
                                        bg={isActive ? "#A9CBB7" : "transparent"}
                                        color={isActive ? "white" : "gray.400"}
                                        borderColor={isActive ? "#A9CBB7" : "gray.200"}
                                        borderRadius="xl"
                                        fontSize="xs"
                                        px={3}
                                        minW="55px"
                                        onClick={() => toggleSlot(day.key, time)}
                                        _hover={isActive ? { bg: '#8FB49F' } : { borderColor: '#A9CBB7' }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </Flex>
                    </VStack>
                ))}
            </VStack>
       </Box>
    </VStack>
  );
}
