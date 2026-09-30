import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { schedulingApi } from "../../api/scheduling";
import ModernSelect from "../ModernSelect";

const TIME_OPTIONS = [];
for (let h = 6; h <= 23; h++) {
  for (let m of [0, 30]) {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const val = `${hh}:${mm}`;
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const label = `${displayH}:${mm} ${period}`;
    TIME_OPTIONS.push({ value: val, label });
  }
}

const DAYS = [
  { id: "1", label: "Monday" },
  { id: "2", label: "Tuesday" },
  { id: "3", label: "Wednesday" },
  { id: "4", label: "Thursday" },
  { id: "5", label: "Friday" },
  { id: "6", label: "Saturday" },
  { id: "0", label: "Sunday" },
];

export default function BusinessHoursForm({ profile, onSlotsGenerated }) {
  const [hours, setHours] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (profile && profile.business_hours) {
      setHours(profile.business_hours);
    }
  }, [profile]);

  const handleDayChange = (dayId, isChecked) => {
    setHours((prev) => {
      const newHours = { ...prev };
      if (isChecked) {
        newHours[dayId] = [{ startTime: "09:00", endTime: "17:00" }];
      } else {
        delete newHours[dayId];
      }
      return newHours;
    });
  };

  const handleTimeChange = (dayId, index, field, value) => {
    setHours((prev) => {
      const newHours = { ...prev };
      if (newHours[dayId]) {
        newHours[dayId][index][field] = value;
      }
      return newHours;
    });
  };

  const saveAndGenerate = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await schedulingApi.updateTherapistProfile(profile.id, {
        business_hours: hours,
      });
      const start_date = new Date();
      const end_date = new Date(start_date.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const payload = {
        start_date: start_date.toISOString().split("T")[0],
        end_date: end_date.toISOString().split("T")[0],
      };
      await schedulingApi.generateAvailabilitySlotsBulk(payload);
      
      toast({
        title: "Schedule Synced",
        description: "Your business hours were updated and calendar slots generated.",
        status: "success",
      });
      if (onSlotsGenerated) onSlotsGenerated();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update business hours.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={5}>
      {DAYS.map((day) => {
        const isEnabled = !!hours[day.id];
        const times = hours[day.id] || [];
        return (
          <Box 
            key={day.id} 
            p={4} 
            borderRadius="2xl" 
            bg={isEnabled ? "rgba(169, 203, 183, 0.08)" : "gray.50"}
            border="1px solid"
            borderColor={isEnabled ? "rgba(169, 203, 183, 0.3)" : "gray.100"}
            transition="all 0.2s"
          >
            <HStack spacing={4} align="center" justify="space-between">
              <Checkbox
                size="lg"
                colorScheme="teal"
                isChecked={isEnabled}
                onChange={(e) => handleDayChange(day.id, e.target.checked)}
              >
                <Text fontWeight="600" fontSize="sm">{day.label}</Text>
              </Checkbox>
              
              {isEnabled && (
                <HStack spacing={2.5} align="center">
                  <Box w="135px">
                    <ModernSelect
                      value={times[0]?.startTime || "09:00"}
                      onChange={(val) => handleTimeChange(day.id, 0, "startTime", val)}
                      options={TIME_OPTIONS}
                      h="36px"
                      fontSize="12.5px"
                      leftIcon={FiClock}
                      menuMaxH="220px"
                    />
                  </Box>
                  <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em">TO</Text>
                  <Box w="135px">
                    <ModernSelect
                      value={times[0]?.endTime || "17:00"}
                      onChange={(val) => handleTimeChange(day.id, 0, "endTime", val)}
                      options={TIME_OPTIONS}
                      h="36px"
                      fontSize="12.5px"
                      leftIcon={FiClock}
                      menuMaxH="220px"
                    />
                  </Box>
                </HStack>
              )}
            </HStack>
          </Box>
        );
      })}
      
      <Box pt={4}>
        <Button 
          w="100%"
          h="44px"
          bg="#56756D" 
          color="white"
          fontSize="13.5px"
          fontWeight="600"
          borderRadius="full"
          _hover={{ bg: "#263A33" }}
          onClick={saveAndGenerate} 
          isLoading={loading}
          leftIcon={<FiCheckCircle />}
        >
          Save & Sync Calendar
        </Button>
        <Text fontSize="xs" color="gray.400" mt={4} textAlign="center">
          Updating your hours will auto-refresh your public availability for the next 30 days.
        </Text>
      </Box>
    </VStack>
  );
}
