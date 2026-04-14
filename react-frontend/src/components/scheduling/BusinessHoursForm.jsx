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
      // automatically generate slots for next 30 days
      const start_date = new Date();
      const end_date = new Date(start_date.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const payload = {
        start_date: start_date.toISOString().split("T")[0],
        end_date: end_date.toISOString().split("T")[0],
      };
      const res = await schedulingApi.generateAvailabilitySlotsBulk(payload);
      
      toast({
        title: "Slots Generated",
        description: res.detail || "Successfully updated business hours and generated calendar.",
        status: "success",
        duration: 3000,
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
    <VStack align="stretch" spacing={4}>
      {DAYS.map((day) => {
        const isEnabled = !!hours[day.id];
        const times = hours[day.id] || [];
        return (
          <HStack key={day.id} spacing={4} align="flex-start">
            <Checkbox
              w="120px"
              isChecked={isEnabled}
              onChange={(e) => handleDayChange(day.id, e.target.checked)}
            >
              {day.label}
            </Checkbox>
            {isEnabled && (
              <VStack align="stretch">
                {times.map((block, idx) => (
                  <HStack key={idx} spacing={3}>
                    <Input
                      type="time"
                      size="sm"
                      value={block.startTime}
                      onChange={(e) => handleTimeChange(day.id, idx, "startTime", e.target.value)}
                    />
                    <Text fontSize="sm">to</Text>
                    <Input
                      type="time"
                      size="sm"
                      value={block.endTime}
                      onChange={(e) => handleTimeChange(day.id, idx, "endTime", e.target.value)}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </HStack>
        );
      })}
      <Box pt={4}>
        <Button colorScheme="teal" onClick={saveAndGenerate} isLoading={loading}>
          Save & Generate 30 Days
        </Button>
        <Text fontSize="xs" color="gray.500" mt={2}>
          This will update your profile and auto-create open slots for any matched times in the next 30 days. You can manually block/delete them below.
        </Text>
      </Box>
    </VStack>
  );
}
