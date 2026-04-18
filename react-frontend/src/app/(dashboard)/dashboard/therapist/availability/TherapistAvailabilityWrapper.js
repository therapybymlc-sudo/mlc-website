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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(null);
  const [businessHours, setBusinessHours] = useState({});
  const [loading, setLoading] = useState(true);

  const DAYS = [
    { key: "1", label: "Monday" },
    { key: "2", label: "Tuesday" },
    { key: "3", label: "Wednesday" },
    { key: "4", label: "Thursday" },
    { key: "5", label: "Friday" },
    { key: "6", label: "Saturday" },
    { key: "7", label: "Sunday" },
  ];

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

  const calendarEvents = useMemo(() => {
    return slots.map(slot => ({
      id: slot.id,
      title: slot.status || "Available",
      start: slot.start_time,
      end: slot.end_time,
      backgroundColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
      borderColor: slot.status === 'blocked' ? '#CBD5E0' : '#A9CBB7',
    }));
  }, [slots]);

  const handleAddBlock = (dayKey) => {
    const current = businessHours[dayKey] || [];
    setBusinessHours({
        ...businessHours,
        [dayKey]: [...current, { startTime: "09:00", endTime: "17:00" }]
    });
  };

  const handleRemoveBlock = (dayKey, index) => {
    const current = [...(businessHours[dayKey] || [])];
    current.splice(index, 1);
    setBusinessHours({ ...businessHours, [dayKey]: current });
  };

  const handleUpdateBlock = (dayKey, index, field, value) => {
    const current = [...(businessHours[dayKey] || [])];
    current[index] = { ...current[index], [field]: value };
    setBusinessHours({ ...businessHours, [dayKey]: current });
  };

  const handleSavePattern = async () => {
    if (!profile) return;
    try {
        await apiPatch(`therapists/${profile.id}/`, { business_hours: businessHours });
        toast({ title: "Weekly pattern saved", status: "success" });
        onClose();
        loadData();
    } catch (err) {
        toast({ title: "Failed to save pattern", status: "error" });
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
       <VStack align="stretch" spacing={8}>
          <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack mb={6}>
              <Icon as={FiClock} color="#56756D" />
              <Heading size="md" color="#2E2E2E">Weekly Standard Hours</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.500" mb={4}>Set your recurring availability for the week.</Text>
            <Button 
                variant="outline" 
                borderRadius="full" 
                size="sm" 
                onClick={onOpen}
                leftIcon={<FiSettings />}
            >
                Configure Weekly Pattern
            </Button>
          </Box>
       </VStack>

       <Box bg="white" p={4} borderRadius="3xl" shadow="xl" overflow="hidden" border="1px solid" borderColor="gray.100" h="640px">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next', center: 'title', right: '' }}
            height="100%"
            allDaySlot={false}
            events={calendarEvents}
            nowIndicator={true}
          />
       </Box>

       {/* Weekly Pattern Modal */}
       <Modal isOpen={isOpen} onClose={onClose} size="3xl">
         <ModalOverlay backdropFilter="blur(5px)" />
         <ModalContent borderRadius="3xl" p={4}>
            <ModalHeader>Configure Weekly Pattern</ModalHeader>
            <ModalCloseButton mt={6} mr={6} />
            <ModalBody>
                <VStack spacing={8} align="stretch" maxH="60vh" overflowY="auto" pr={4}>
                    {DAYS.map((day) => (
                        <Box key={day.key} p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
                            <HStack justify="space-between" mb={4}>
                                <Text fontWeight="700" color="#56756D">{day.label}</Text>
                                <Button 
                                    size="xs" 
                                    leftIcon={<FiPlus />} 
                                    variant="ghost" 
                                    colorScheme="teal"
                                    onClick={() => handleAddBlock(day.key)}
                                >
                                    Add Block
                                </Button>
                            </HStack>
                            
                            <VStack align="stretch" spacing={3}>
                                {(businessHours[day.key] || []).length === 0 && (
                                    <Text fontSize="xs" color="gray.400" fontStyle="italic">No hours set for this day.</Text>
                                )}
                                {(businessHours[day.key] || []).map((block, idx) => (
                                    <HStack key={idx} spacing={3}>
                                        <Input 
                                            type="time" 
                                            size="sm" 
                                            borderRadius="lg"
                                            value={block.startTime}
                                            onChange={(e) => handleUpdateBlock(day.key, idx, 'startTime', e.target.value)}
                                        />
                                        <Text fontSize="xs" color="gray.400">to</Text>
                                        <Input 
                                            type="time" 
                                            size="sm" 
                                            borderRadius="lg"
                                            value={block.endTime}
                                            onChange={(e) => handleUpdateBlock(day.key, idx, 'endTime', e.target.value)}
                                        />
                                        <IconButton 
                                            aria-label="Remove" 
                                            icon={<FiTrash2 />} 
                                            size="sm" 
                                            variant="ghost" 
                                            colorScheme="red"
                                            onClick={() => handleRemoveBlock(day.key, idx)}
                                        />
                                    </HStack>
                                ))}
                            </VStack>
                        </Box>
                    ))}
                </VStack>
            </ModalBody>
            <ModalFooter pt={8}>
                <Button variant="ghost" mr={3} onClick={onClose} borderRadius="full">Cancel</Button>
                <Button 
                    bg="#56756C" 
                    color="white" 
                    borderRadius="full" 
                    leftIcon={<FiSave />}
                    onClick={handleSavePattern}
                    _hover={{ bg: '#2E2E2E' }}
                >
                    Save Changes
                </Button>
            </ModalFooter>
         </ModalContent>
       </Modal>
    </SimpleGrid>
  );
}
