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
import { FiCheckCircle } from "react-icons/fi";
import { schedulingApi } from "../../api/scheduling";


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
                <HStack spacing={3}>
                  <Input
                    type="time"
                    size="sm"
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    value={times[0]?.startTime || ""}
                    onChange={(e) => handleTimeChange(day.id, 0, "startTime", e.target.value)}
                  />
                  <Text fontSize="xs" fontWeight="700" color="gray.400">TO</Text>
                  <Input
                    type="time"
                    size="sm"
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    value={times[0]?.endTime || ""}
                    onChange={(e) => handleTimeChange(day.id, 0, "endTime", e.target.value)}
                  />
                </HStack>
              )}
            </HStack>
          </Box>
        );
      })}
      
      <Box pt={4}>
        <Button 
          w="100%"
          h="50px"
          bg="#56756C" 
          color="white"
          borderRadius="full"
          _hover={{ bg: "#C9A960" }}
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
