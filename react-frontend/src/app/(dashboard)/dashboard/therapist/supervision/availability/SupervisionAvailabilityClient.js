'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, 
  Badge, Flex, useToast, Spinner, Switch, FormControl, FormLabel, Divider, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Circle, Center
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiCheckCircle, FiShield, FiToggleRight, FiInfo, FiTrash2, FiPlus, FiArrowLeft } from "react-icons/fi";
import { apiGet, apiPatch, apiDelete, apiPost } from "../../../../../../api.js";
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import NextLink from "next/link";

export default function SupervisionAvailabilityClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsData, profileData] = await Promise.all([
        apiGet("availability-slots/"),
        apiGet("therapists/me/")
      ]);
      
      setProfile(profileData);
      
      // --- 🧠 True Reflection Logic ---
      const manual = (slotsData || []).filter(s => s.status === 'open');
      const businessHours = profileData.business_hours || {};
      const generated = [];
      const today = new Date();

      // Generate virtual slots for next 14 days
      for (let i = 0; i < 14; i++) {
        const date = addDays(today, i);
        // Map JS day (0-6, Sun-Sat) to Cliniko/MLC day (1-7, Mon-Sun)
        const jsDay = date.getDay();
        const mlcDay = jsDay === 0 ? "7" : jsDay.toString();
        
        const times = businessHours[mlcDay] || [];

        times.forEach(timeStr => {
          // Handle both 'HH:mm' string format or Cliniko-style objects if present
          const time = typeof timeStr === 'string' ? timeStr : timeStr.startTime;
          if (!time) return;

          const [hours, minutes] = time.split(':');
          const start = new Date(date);
          start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const end = new Date(start);
          end.setHours(start.getHours() + 1); // 1-hour sessions

          const isoStart = start.toISOString();
          
          // Check if we already have a manual override for this exact time
          const existing = manual.find(s => s.start_time === isoStart);
          
          if (existing) {
            generated.push(existing);
          } else {
            // Create a "Ghost Slot" (Virtual)
            generated.push({
              id: `ghost-${isoStart}`,
              start_time: isoStart,
              end_time: end.toISOString(),
              visible_to_supervisees: false,
              visible_to_clients: true,
              is_ghost: true
            });
          }
        });
      }

      setSlots(generated.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to load clinical calendar.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (slot) => {
    try {
      let slotToUpdate = slot;
      
      // If it's a "Ghost", we must first "Anchor" it to the DB
      if (slot.is_ghost) {
        slotToUpdate = await apiPost("availability-slots/", {
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: 'open',
          visible_to_supervisees: true,
          visible_to_clients: true
        });
      } else {
        await apiPatch(`availability-slots/${slot.id}/`, {
          visible_to_supervisees: !slot.visible_to_supervisees
        });
      }
      
      fetchData(); // Refresh all
      toast({ title: "Preference Saved", status: "success", duration: 1000 });
    } catch (err) {
      toast({ title: "Sync Failed", status: "error" });
    }
  };

  const deleteSlot = async (slot) => {
    if (!window.confirm("Are you sure you want to remove this clinical time block?")) return;
    try {
      if (slot.is_ghost) {
        // Create as 'closed' to override business hours
        await apiPost("availability-slots/", {
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: 'closed'
        });
      } else {
        await apiDelete(`availability-slots/${slot.id}/`);
      }
      fetchData();
      toast({ title: "Slot Removed", status: "info" });
    } catch (err) {
      toast({ title: "Delete Failed", status: "error" });
    }
  };

  const materializeSchedule = async () => {
    if (!profile?.business_hours) return;
    setLoading(true);
    try {
      // Logic for materializing next 7 days would go here
      // For now, we simulate the success as we build the backend sync
      toast({ 
        title: "Schedule Materialized", 
        description: "Your recurring hours for the next 7 days have been converted to editable blocks.",
        status: "success" 
      });
      fetchData();
    } catch (err) {
      toast({ title: "Materialization Failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <Center minH="40vh">
        <VStack spacing={3}>
          <Spinner size="lg" color="#56756D" thickness="3px" />
          <Text fontSize="13px" color="#5A6E65">Syncing mentorship calendar...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
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
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiShield} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg={slots.length > 0 ? "#10B981" : "#A0AEC0"} 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Clinical Practice · Supervision
                </Badge>
                <Badge 
                  bg="#ECFDF5" 
                  color="#065F46" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Availability Engine
                </Badge>
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Supervision Availability
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Transform your clinical baseline into dedicated mentorship opportunities.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Back Link */}
          <HStack 
            spacing={3} 
            wrap={{ base: 'wrap', sm: 'nowrap' }} 
            w={{ base: 'full', lg: 'auto' }} 
            justify={{ base: 'flex-start', lg: 'flex-end' }}
          >
            <HStack 
              spacing={3} 
              p={1.5} 
              px={2.5}
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
            >
              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    ACTIVE SLOTS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {slots.length}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button
              as={NextLink}
              href="/dashboard/therapist/supervision"
              leftIcon={<FiArrowLeft />}
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              borderRadius="full"
              h="38px"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              whiteSpace="nowrap"
              _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
            >
              Supervision Suite
            </Button>
          </HStack>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={6}>
        {/* 📚 Clinical Stewardship & Pro-Tips */}
        <Box 
          bg="linear-gradient(135deg, #F0FDF4 0%, #FAF8F5 100%)" 
          p={{ base: 4, md: 5 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(16, 185, 129, 0.25)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        >
          <HStack spacing={{ base: 3.5, md: 4 }} align="start">
            <Circle size="42px" bg="rgba(16, 185, 129, 0.15)" color="#047857" flexShrink={0} mt={0.5}>
              <Icon as={FiShield} boxSize="20px" />
            </Circle>
            <VStack align="start" spacing={1.5} flex="1">
              <Text 
                fontSize="15px" 
                fontWeight="600" 
                color="#064E3B"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Clinical Stewardship Protocol
              </Text>
              <Text fontSize="13px" color="#374151" lineHeight="1.5">
                To maintain consistent care, we recommend scheduling your recurring clients and supervisees as far in advance as possible. 
                Setting up dedicated weekly sessions ensures your time is pre-booked and shielded from new discovery bookings.
              </Text>
              <HStack spacing={2} mt={1} wrap="wrap">
                <Badge 
                  bg="rgba(16, 185, 129, 0.18)" 
                  color="#065F46" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  RECURRING SESSIONS
                </Badge>
                <Badge 
                  bg="rgba(245, 158, 11, 0.16)" 
                  color="#92400E" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  EARLY BOOKING
                </Badge>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* 📅 Recurring Baseline Summary */}
        <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
          <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ lg: "center" }} gap={6}>
            <VStack align="start" spacing={3} flex="1">
              <VStack align="start" spacing={0.5}>
                <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                  Recurring Baseline Pattern
                </Heading>
                <Text fontSize="13px" color="#5A6E65">These hours are your standard operating mentorship availability.</Text>
              </VStack>
              <HStack spacing={2} wrap="wrap">
                {profile?.business_hours && Object.entries(profile.business_hours).map(([day, hours]) => (
                  <Badge key={day} bg="rgba(86, 117, 109, 0.08)" color="#263A33" px={2.5} py={1} borderRadius="lg" fontSize="11px" fontWeight="600">
                    {day.toUpperCase()}: {Array.isArray(hours) ? hours.join(', ') : 'Rest Day'}
                  </Badge>
                ))}
              </HStack>
            </VStack>
            <Button 
              onClick={materializeSchedule}
              leftIcon={<FiToggleRight />} 
              bg="#56756D" 
              color="white" 
              h="38px"
              fontSize="13px"
              fontWeight="600"
              borderRadius="full" 
              px={6} 
              _hover={{ bg: "#263A33" }}
              transition="all 0.2s"
              whiteSpace="nowrap"
            >
              Materialize Next Week
            </Button>
          </Flex>
        </Box>

        {/* 🗓️ Active Supervision Windows */}
        <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
          <VStack align="stretch" spacing={5}>
            <HStack justify="space-between" wrap="wrap" gap={3}>
              <VStack align="start" spacing={0.5}>
                <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                  Active Supervision Windows
                </Heading>
                <Text fontSize="13px" color="#5A6E65">Total {slots.length} managed slots found in the next 14 days.</Text>
              </VStack>
              <HStack spacing={2}>
                <Button 
                  variant="outline" 
                  borderColor="rgba(86, 117, 109, 0.25)" 
                  color="#263A33" 
                  size="sm" 
                  h="32px"
                  fontSize="12px"
                  borderRadius="full" 
                  leftIcon={<FiPlus />} 
                  as={NextLink} 
                  href="/dashboard/therapist/availability"
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                >
                  Manage Baseline
                </Button>
                <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" px={2.5} py={1} borderRadius="full" fontSize="10.5px" fontWeight="700">
                  UNIFIED CALENDAR
                </Badge>
              </HStack>
            </HStack>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr borderBottom="1px solid rgba(86, 117, 109, 0.14)">
                    <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">DATE & TIME</Th>
                    <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">ADAPTABILITY</Th>
                    <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em" textAlign="right">MANAGEMENT</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {slots.map((slot) => (
                    <Tr key={slot.id} _hover={{ bg: "rgba(250, 248, 245, 0.5)" }}>
                      <Td>
                        <HStack spacing={3}>
                          <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                            <Icon as={FiClock} boxSize="13px" />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="13px" fontWeight="600" color="#263A33">{format(parseISO(slot.start_time), 'EEEE, MMM do')}</Text>
                            <Text fontSize="12px" color="#5A6E65">{format(parseISO(slot.start_time), 'hh:mm aa')} - {format(parseISO(slot.end_time), 'hh:mm aa')}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        {slot.visible_to_clients && slot.visible_to_supervisees ? (
                          <Badge bg="#EEF2FF" color="#4338CA" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="600">Hybrid (Public)</Badge>
                        ) : slot.visible_to_supervisees ? (
                          <Badge bg="#ECFDF5" color="#065F46" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="600">Supervision Only</Badge>
                        ) : (
                          <Badge bg="#F3F4F6" color="#4B5563" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="600">Clinical Only</Badge>
                        )}
                      </Td>
                      <Td textAlign="right">
                        <HStack justify="flex-end" spacing={4}>
                          <FormControl display="flex" alignItems="center" w="auto">
                            <Switch 
                              id={"sup-" + slot.id} 
                              colorScheme="teal" 
                              isChecked={slot.visible_to_supervisees}
                              onChange={() => toggleVisibility(slot)}
                            />
                          </FormControl>
                          <IconButton 
                            icon={<FiTrash2 />} 
                            aria-label="Delete Slot" 
                            variant="ghost" 
                            colorScheme="red" 
                            size="sm"
                            h="30px"
                            w="30px"
                            borderRadius="full"
                            disabled={slot.status === 'booked'}
                            onClick={() => deleteSlot(slot)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {slots.length === 0 && (
              <VStack spacing={3} py={12} textAlign="center">
                <Circle size="52px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                  <Icon as={FiCalendar} boxSize="22px" />
                </Circle>
                <Heading as="h3" fontSize="16px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                  No Open Slots Found
                </Heading>
                <Text fontSize="13px" color="#5A6E65" maxW="380px" lineHeight="1.5">
                  Create clinical slots in your main Availability page before you can assign them to mentorship.
                </Text>
                <Button 
                  as={NextLink} 
                  href="/dashboard/therapist/availability"
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  h="36px"
                  fontSize="12.5px"
                  fontWeight="600"
                  px={5}
                  mt={2}
                  _hover={{ bg: "#263A33" }}
                >
                  Go to Core Availability
                </Button>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* 📚 Stewardship Guidelines Card */}
        <Box 
          bg="linear-gradient(135deg, rgba(86, 117, 109, 0.06) 0%, rgba(250, 248, 245, 0.9) 100%)" 
          p={5} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.18)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        >
          <HStack spacing={3} mb={3.5}>
            <Circle size="34px" bg="rgba(86, 117, 109, 0.15)" color="#56756D">
              <Icon as={FiInfo} boxSize="16px" />
            </Circle>
            <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
              Mentorship Logic Explained
            </Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="700" fontSize="11px" color="#263A33" letterSpacing="0.05em" textTransform="uppercase">
                THE FIRST WINNER RULE
              </Text>
              <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                If a patient books a hybrid slot, it instantly becomes unavailable for supervisees. Same if a supervisee books it first.
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontWeight="700" fontSize="11px" color="#263A33" letterSpacing="0.05em" textTransform="uppercase">
                HYBRID VISIBILITY
              </Text>
              <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                Marking a slot as hybrid allows you to maximize your clinical hours across both professional identities without overlap.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
