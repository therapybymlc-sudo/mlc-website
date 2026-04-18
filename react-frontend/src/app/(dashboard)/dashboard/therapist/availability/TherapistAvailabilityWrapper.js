'use client'

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
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
import { FiClock, FiPlus, FiTrash2, FiSave, FiSettings } from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { schedulingApi } from "../../../../../api/scheduling";
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

  // Helper to generate hourly slots between start and end
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
        // We expect business_hours to be an object: { "1": ["09:00", "10:00"], ... }
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

  // Convert hourly slots into FullCalendar businessHours objects
  const calendarBusinessHours = useMemo(() => {
    const bh = [];
    Object.keys(businessHours).forEach(dayKey => {
        const slotsForDay = [...(businessHours[dayKey] || [])].sort();
        slotsForDay.forEach(startTime => {
            const h = parseInt(startTime.split(":")[0], 10);
            bh.push({
                daysOfWeek: [parseInt(dayKey, 10)],
                startTime: startTime,
                endTime: `${String(h + 1).padStart(2, '0')}:00`
            });
        });
    });
    return bh;
  }, [businessHours]);

  const calendarEvents = useMemo(() => {
    return slots.map(slot => ({
      id: slot.id,
      title: slot.status === "booked" ? "Booked" : "Reserved",
      start: slot.start_time,
      end: slot.end_time,
      backgroundColor: slot.status === 'booked' ? '#56756C' : '#CBD5E0',
      borderColor: slot.status === 'booked' ? '#56756C' : '#CBD5E0',
    }));
  }, [slots]);

  return (
    <VStack align="stretch" spacing={10}>
       <Box bg="white" p={8} borderRadius="4xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={8} wrap="wrap">
                <HStack spacing={4}>
                    <Icon as={FiClock} color="#56756D" w={6} h={6} />
                    <VStack align="start" spacing={0}>
                        <Heading size="md" color="#2E2E2E">Weekly Capacity</Heading>
                        <Text fontSize="sm" color="gray.500">Enable hours to open them for booking.</Text>
                    </VStack>
                </HStack>
                
                <HStack spacing={6} bg="gray.50" p={4} borderRadius="2xl">
                    <FormControl w="auto">
                        <FormLabel fontSize="xs" fontWeight="700">System Start</FormLabel>
                        <Select 
                            size="sm" 
                            borderRadius="xl" 
                            value={globalRange.start}
                            onChange={(e) => setGlobalRange({ ...globalRange, start: e.target.value })}
                        >
                            {Array.from({length: 24}).map((_, i) => {
                                const h = String(i).padStart(2, '0');
                                return <option key={h} value={`${h}:00`}>{i % 12 || 12} {i >= 12 ? 'PM' : 'AM'}</option>
                            })}
                        </Select>
                    </FormControl>
                    <FormControl w="auto">
                        <FormLabel fontSize="xs" fontWeight="700">System End</FormLabel>
                        <Select 
                            size="sm" 
                            borderRadius="xl"
                            value={globalRange.end}
                            onChange={(e) => setGlobalRange({ ...globalRange, end: e.target.value })}
                        >
                            {Array.from({length: 24}).map((_, i) => {
                                const h = String(i).padStart(2, '0');
                                return <option key={h} value={`${h}:00`}>{i % 12 || 12} {i >= 12 ? 'PM' : 'AM'}</option>
                            })}
                        </Select>
                    </FormControl>
                    <Button 
                        bg="#56756C" 
                        color="white" 
                        borderRadius="full" 
                        size="md" 
                        px={8}
                        leftIcon={<FiSave />}
                        onClick={handleSavePattern}
                        _hover={{ bg: '#2E2E2E' }}
                        mt={6}
                    >
                        Apply Changes
                    </Button>
                </HStack>
            </HStack>

            <VStack align="stretch" spacing={6}>
                {DAYS.map(day => (
                    <HStack key={day.key} spacing={6} align="center">
                        <Text fontWeight="800" w="50px" color="#56756D" fontSize="sm">{day.label}</Text>
                        <HStack spacing={2} wrap="wrap">
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
                                        minW="60px"
                                        onClick={() => toggleSlot(day.key, time)}
                                        _hover={isActive ? { bg: '#8FB49F' } : { borderColor: '#A9CBB7' }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </HStack>
                    </HStack>
                ))}
            </VStack>
       </Box>

       <Box 
            bg="white" 
            p={4} 
            borderRadius="4xl" 
            shadow="xl" 
            overflow="hidden" 
            border="1px solid" 
            borderColor="gray.100" 
            h="800px"
            sx={{
                ".fc-business-hour": {
                    backgroundColor: "rgba(169, 203, 183, 0.2) !important", // Light MLC Green for business hours
                },
                ".fc-non-business": {
                    backgroundColor: "#F7FAFC !important", // Grey for non-business
                }
            }}
        >
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
            height="100%"
            allDaySlot={false}
            events={calendarEvents}
            businessHours={calendarBusinessHours}
            nowIndicator={true}
            slotDuration="01:00:00"
          />
       </Box>
    </VStack>
  );
}
