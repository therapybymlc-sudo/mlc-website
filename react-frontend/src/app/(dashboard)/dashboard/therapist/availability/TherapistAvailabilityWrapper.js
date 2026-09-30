'use client'

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  HStack,
  Flex,
  Text,
  VStack,
  Box,
  Heading,
  useToast,
  Icon,
  Circle,
  Divider,
} from "@chakra-ui/react";
import { FiClock, FiSave, FiCopy, FiTrash2 } from "react-icons/fi";
import { apiGet, apiPatch } from "../../../../../api";
import ModernSelect from "../../../../../components/ModernSelect";

const RANGE_OPTIONS = Array.from({ length: 24 }).map((_, i) => {
  const h = String(i).padStart(2, '0');
  const period = i >= 12 ? 'PM' : 'AM';
  const displayHour = i % 12 || 12;
  return {
    value: `${h}:00`,
    label: `${displayHour}:00 ${period}`,
  };
});

/**
 * Normalizes any legacy business_hours format (e.g. range objects [{startTime: "10:00", endTime: "18:00"}]
 * or raw hour strings) into a clean, uniform list of 1-hour slot strings ["10:00", "11:00", ...]
 */
const normalizeBusinessHours = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const normalized = {};

  Object.entries(raw).forEach(([dayKey, slots]) => {
    if (!Array.isArray(slots)) {
      normalized[dayKey] = [];
      return;
    }

    const set = new Set();
    slots.forEach((item) => {
      if (typeof item === "string") {
        const parts = item.split(":");
        if (parts.length >= 2) {
          const hh = String(parseInt(parts[0], 10)).padStart(2, "0");
          const mm = String(parseInt(parts[1], 10)).padStart(2, "0");
          set.add(`${hh}:${mm}`);
        }
      } else if (item && typeof item === "object") {
        const start = item.startTime || item.start;
        const end = item.endTime || item.end;
        if (start && end) {
          const startH = parseInt(start.split(":")[0], 10);
          const endH = parseInt(end.split(":")[0], 10);
          for (let h = startH; h < endH; h++) {
            set.add(`${String(h).padStart(2, "0")}:00`);
          }
        } else if (start) {
          const startH = parseInt(start.split(":")[0], 10);
          set.add(`${String(startH).padStart(2, "0")}:00`);
        }
      }
    });

    normalized[dayKey] = Array.from(set).sort();
  });

  return normalized;
};

export default function TherapistAvailabilityWrapper() {
  const toast = useToast();
  
  const [profile, setProfile] = useState(null);
  const [businessHours, setBusinessHours] = useState({});
  const [, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global system range (e.g., 7 AM to 8 PM)
  const [globalRange, setGlobalRange] = useState({ start: "07:00", end: "20:00" });

  const DAYS = [
    { key: "1", label: "Mon", full: "Monday" },
    { key: "2", label: "Tue", full: "Tuesday" },
    { key: "3", label: "Wed", full: "Wednesday" },
    { key: "4", label: "Thu", full: "Thursday" },
    { key: "5", label: "Fri", full: "Friday" },
    { key: "6", label: "Sat", full: "Saturday" },
    { key: "7", label: "Sun", full: "Sunday" },
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
      const profileData = await apiGet("therapists/me/").catch(() => null);
      if (profileData) {
        setProfile(profileData);
        setBusinessHours(normalizeBusinessHours(profileData.business_hours));
      }
    } catch {
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
      current.sort();
    }
    setBusinessHours({ ...businessHours, [dayKey]: current });
  };

  const clearDay = (dayKey) => {
    setBusinessHours((prev) => ({
      ...prev,
      [dayKey]: [],
    }));
  };

  const clearAllDays = () => {
    const cleared = {};
    DAYS.forEach((d) => {
      cleared[d.key] = [];
    });
    setBusinessHours(cleared);
    toast({
      title: "Schedule Cleared",
      description: "All days reset to 0 open hours. Click 'Apply Changes' to save.",
      status: "info",
      duration: 3000,
    });
  };

  const applyToAll = (dayKey) => {
    const pattern = businessHours[dayKey] || [];
    const newBh = {};
    DAYS.forEach(day => {
      newBh[day.key] = [...pattern];
    });
    setBusinessHours(newBh);
    const dayLabel = DAYS.find(d => d.key === dayKey)?.full || "selected day";
    toast({ 
      title: `Schedule Duplicated`, 
      description: `Copied ${dayLabel}'s active hours to your entire week.`,
      status: "info", 
      duration: 3000 
    });
  };

  const handleSavePattern = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      await apiPatch(`therapists/${profile.id}/`, { business_hours: businessHours });
      toast({ 
        title: "Availability Updated", 
        description: "Your weekly clinical hours were successfully saved.",
        status: "success" 
      });
      loadData();
    } catch {
      toast({ title: "Failed to save", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const activeHoursList = useMemo(() => {
    return generateHourlySlots(globalRange.start, globalRange.end);
  }, [globalRange.start, globalRange.end]);

  return (
    <VStack align="stretch" spacing={6} fontFamily="'Inter', var(--font-inter), sans-serif">
      <Box 
        bg="white" 
        p={{ base: 4, md: 6 }} 
        borderRadius="2xl" 
        border="1px solid" 
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        {/* Header Strip with Range Pickers & Actions */}
        <Flex 
          direction={{ base: "column", xl: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", xl: "center" }}
          mb={7} 
          gap={5}
        >
          <HStack spacing={3.5}>
            <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
              <Icon as={FiClock} boxSize="20px" />
            </Circle>
            <VStack align="start" spacing={0.5}>
              <Heading 
                as="h2" 
                fontSize="17px" 
                fontWeight="600" 
                color="#263A33"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                letterSpacing="-0.01em"
              >
                Weekly Capacity
              </Heading>
              <Text fontSize="13px" color="#5A6E65">
                Toggle hours to open or shield booking slots for clients.
              </Text>
            </VStack>
          </HStack>
          
          <Flex 
            direction={{ base: "column", sm: "row" }} 
            bg="rgba(250, 248, 245, 0.9)" 
            p={2.5} 
            px={3.5}
            borderRadius="xl" 
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.12)"
            gap={3}
            align={{ base: "stretch", sm: "center" }}
          >
            <HStack spacing={3} flex={1}>
              <Box minW="115px">
                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                  Start
                </Text>
                <ModernSelect
                  value={globalRange.start}
                  onChange={(val) => setGlobalRange({ ...globalRange, start: val })}
                  options={RANGE_OPTIONS}
                  h="36px"
                  fontSize="12px"
                  menuMaxH="220px"
                />
              </Box>

              <Box minW="115px">
                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                  End
                </Text>
                <ModernSelect
                  value={globalRange.end}
                  onChange={(val) => setGlobalRange({ ...globalRange, end: val })}
                  options={RANGE_OPTIONS}
                  h="36px"
                  fontSize="12px"
                  menuMaxH="220px"
                />
              </Box>
            </HStack>

            <HStack spacing={2.5} alignSelf={{ base: "stretch", sm: "flex-end" }} mt={{ base: 1, sm: 0 }}>
              <Button 
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#5A6E65"
                borderRadius="full"
                height="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                leftIcon={<Icon as={FiTrash2} boxSize="13px" />}
                onClick={clearAllDays}
                _hover={{ bg: "rgba(239, 68, 68, 0.06)", color: "#DC2626", borderColor: "rgba(239, 68, 68, 0.3)" }}
              >
                Clear All
              </Button>

              <Button 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                height="38px" 
                fontSize="13px" 
                fontWeight="600"
                px={6} 
                leftIcon={<Icon as={FiSave} boxSize="13px" />} 
                onClick={handleSavePattern} 
                isLoading={saving}
                _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }} 
                transition="all 0.2s"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              >
                Apply Changes
              </Button>
            </HStack>
          </Flex>
        </Flex>

        <Divider borderColor="rgba(86, 117, 109, 0.12)" mb={6} />

        {/* Days Grid & Hourly Pills */}
        <VStack align="stretch" spacing={6}>
          {DAYS.map((day) => {
            const daySlots = businessHours[day.key] || [];
            const activeCount = daySlots.length;

            return (
              <Box 
                key={day.key} 
                p={{ base: 3.5, md: 4 }}
                borderRadius="xl"
                bg={activeCount > 0 ? "rgba(250, 248, 245, 0.7)" : "transparent"}
                border="1px solid"
                borderColor={activeCount > 0 ? "rgba(86, 117, 109, 0.14)" : "transparent"}
                transition="all 0.2s"
              >
                <Flex 
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between" 
                  align={{ base: "start", sm: "center" }}
                  mb={3}
                  gap={2}
                >
                  <HStack spacing={3}>
                    <Text 
                      fontWeight="700" 
                      color="#263A33" 
                      fontSize="13.5px"
                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                      letterSpacing="0.02em"
                      w="42px"
                    >
                      {day.label.toUpperCase()}
                    </Text>

                    <Button 
                      size="xs" 
                      variant="ghost" 
                      color="#56756D"
                      h="24px"
                      px={2}
                      borderRadius="full"
                      leftIcon={<Icon as={FiCopy} boxSize="11px" />} 
                      aria-label="Duplicate schedule to all days" 
                      onClick={() => applyToAll(day.key)}
                      _hover={{ bg: "rgba(86, 117, 109, 0.1)" }}
                      fontSize="11px"
                      fontWeight="600"
                    >
                      Duplicate to entire week
                    </Button>

                    {activeCount > 0 && (
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        color="#718096"
                        h="24px"
                        px={2}
                        borderRadius="full"
                        leftIcon={<Icon as={FiTrash2} boxSize="11px" />} 
                        aria-label="Clear this day's hours" 
                        onClick={() => clearDay(day.key)}
                        _hover={{ bg: "rgba(239, 68, 68, 0.08)", color: "#DC2626" }}
                        fontSize="11px"
                        fontWeight="600"
                      >
                        Clear
                      </Button>
                    )}
                  </HStack>

                  <Text fontSize="11px" fontWeight="600" color={activeCount > 0 ? "#56756D" : "#A0AEC0"}>
                    {activeCount} {activeCount === 1 ? "hour" : "hours"} open
                  </Text>
                </Flex>

                <Flex gap={1.5} wrap="wrap">
                  {activeHoursList.map((time) => {
                    const isActive = daySlots.includes(time);
                    const hour = parseInt(time.split(":")[0], 10);
                    const ampm = hour >= 12 ? 'p' : 'a';
                    const displayHour = hour % 12 || 12;
                    const label = `${displayHour}${ampm}`;

                    return (
                      <Button
                        key={time}
                        size="xs"
                        h="32px"
                        minW="52px"
                        borderRadius="lg"
                        fontSize="12px"
                        fontFamily="'Inter', sans-serif"
                        fontWeight={isActive ? "700" : "500"}
                        bg={isActive ? "#56756D" : "white"}
                        color={isActive ? "white" : "#5A6E65"}
                        border="1px solid"
                        borderColor={isActive ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
                        boxShadow={isActive ? "0 2px 6px rgba(86, 117, 109, 0.28)" : "none"}
                        onClick={() => toggleSlot(day.key, time)}
                        _hover={{
                          bg: isActive ? "#46625B" : "rgba(86, 117, 109, 0.08)",
                          borderColor: "#56756D",
                        }}
                        transition="all 0.12s ease"
                      >
                        {label}
                      </Button>
                    );
                  })}
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
}
