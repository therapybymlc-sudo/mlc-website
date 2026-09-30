'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  GridItem,
  Circle,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ModernSelect from '../ModernSelect';

// Generate time options in 15-minute increments from 07:00 to 22:00
const TIME_SLOTS = [];
for (let hour = 7; hour <= 21; hour++) {
  for (let min of [0, 15, 30, 45]) {
    const hh = String(hour).padStart(2, '0');
    const mm = String(min).padStart(2, '0');
    const val = `${hh}:${mm}`;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const label = `${displayHour}:${mm} ${period}`;
    TIME_SLOTS.push({ value: val, label });
  }
}
TIME_SLOTS.push({ value: '22:00', label: '10:00 PM' });

const DURATION_PRESETS = [
  { minutes: 30, label: '30 min' },
  { minutes: 50, label: '50 min (Clinical)', isDefault: true },
  { minutes: 60, label: '60 min' },
  { minutes: 90, label: '90 min' },
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function MiniCalendarPicker({
  startTime, // e.g. "2026-09-29T10:00"
  endTime,   // e.g. "2026-09-29T10:50"
  value,     // optional direct date string "YYYY-MM-DD" when mode="date"
  mode = 'datetime', // 'datetime' | 'date'
  dateOnly = false,
  onChange,  // ({ startTime, endTime }) => void OR (dateStr) => void
  defaultDuration = 50,
}) {
  const isDateOnlyMode = mode === 'date' || dateOnly;

  // Parse date and time from startTime or value
  const initialDate = useMemo(() => {
    const raw = value || startTime;
    if (!raw) return new Date();
    // parse safely
    if (typeof raw === 'string' && raw.length >= 10) {
      const parts = raw.slice(0, 10).split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
      }
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [startTime, value]);

  const [viewYear, setViewYear] = useState(() => initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initialDate.getMonth()); // 0-indexed

  // Extract selected components
  const selectedDateStr = useMemo(() => {
    if (value && typeof value === 'string') return value.slice(0, 10);
    if (!startTime) return '';
    return startTime.slice(0, 10); // "YYYY-MM-DD"
  }, [startTime, value]);

  const selectedStartTime = useMemo(() => {
    if (!startTime || !startTime.includes('T')) return '09:00';
    return startTime.split('T')[1].slice(0, 5); // "HH:mm"
  }, [startTime]);

  const selectedEndTime = useMemo(() => {
    if (!endTime || !endTime.includes('T')) return '09:50';
    return endTime.split('T')[1].slice(0, 5); // "HH:mm"
  }, [endTime]);

  // Current calculated duration
  const currentDurationMinutes = useMemo(() => {
    if (!startTime || !endTime) return defaultDuration;
    const s = new Date(startTime);
    const e = new Date(endTime);
    const diff = (e.getTime() - s.getTime()) / 60000;
    return diff > 0 ? diff : defaultDuration;
  }, [startTime, endTime, defaultDuration]);

  // Calendar month days generation
  const monthData = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0 is Sunday

    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Prev month overflow
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        month: viewMonth === 0 ? 11 : viewMonth - 1,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        year: viewYear,
        month: viewMonth,
      });
    }

    // Next month overflow to complete 35 or 42 grid cells
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({
          dayNumber: d,
          isCurrentMonth: false,
          year: viewMonth === 11 ? viewYear + 1 : viewYear,
          month: viewMonth === 11 ? 0 : viewMonth + 1,
        });
      }
    }

    return days;
  }, [viewYear, viewMonth]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    handleSelectDate(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Helper to emit updated startTime & endTime or dateStr
  const handleSelectDate = (year, month, dayNumber) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNumber).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;

    if (isDateOnlyMode) {
      onChange?.(dateStr);
      return;
    }

    const newStart = `${dateStr}T${selectedStartTime}`;
    // Recalculate end based on current duration
    const startDateObj = new Date(newStart);
    const endDateObj = new Date(startDateObj.getTime() + currentDurationMinutes * 60000);
    const newEnd = `${dateStr}T${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`;

    onChange?.({
      startTime: newStart,
      endTime: newEnd,
    });
  };

  const handleStartTimeChange = (newTimeStr) => {
    const dateStr = selectedDateStr || new Date().toISOString().slice(0, 10);
    const newStart = `${dateStr}T${newTimeStr}`;
    const startDateObj = new Date(newStart);
    const endDateObj = new Date(startDateObj.getTime() + currentDurationMinutes * 60000);
    const newEnd = `${dateStr}T${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`;

    onChange?.({
      startTime: newStart,
      endTime: newEnd,
    });
  };

  const handleDurationPresetClick = (minutes) => {
    const dateStr = selectedDateStr || new Date().toISOString().slice(0, 10);
    const newStart = `${dateStr}T${selectedStartTime}`;
    const startDateObj = new Date(newStart);
    const endDateObj = new Date(startDateObj.getTime() + minutes * 60000);
    const newEnd = `${dateStr}T${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`;

    onChange?.({
      startTime: newStart,
      endTime: newEnd,
    });
  };

  const handleEndTimeChange = (newTimeStr) => {
    const dateStr = selectedDateStr || new Date().toISOString().slice(0, 10);
    onChange?.({
      startTime: `${dateStr}T${selectedStartTime}`,
      endTime: `${dateStr}T${newTimeStr}`,
    });
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const readableDate = useMemo(() => {
    const raw = isDateOnlyMode ? (value || startTime) : startTime;
    if (!raw) return 'No date chosen';
    const d = new Date(typeof raw === 'string' && raw.length === 10 ? `${raw}T00:00:00` : raw);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [startTime, value, isDateOnlyMode]);

  const today = new Date();
  const isTodayCheck = (year, month, day) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  return (
    <Box
      w="full"
      bg="rgba(250, 248, 245, 0.85)"
      p={{ base: 3.5, sm: 4 }}
      borderRadius="2xl"
      border="1px solid rgba(86, 117, 109, 0.16)"
      boxShadow="0 4px 16px -2px rgba(38, 58, 51, 0.04)"
    >
      {/* Selected Summary Pill Strip */}
      <HStack
        justify="space-between"
        bg="white"
        p={2.5}
        px={3.5}
        borderRadius="xl"
        border="1px solid rgba(86, 117, 109, 0.12)"
        mb={4}
        wrap="wrap"
        gap={2}
      >
        <HStack spacing={2}>
          <Circle size="26px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
            <Icon as={FiCalendar} boxSize="13px" />
          </Circle>
          <VStack align="start" spacing={0}>
            <Text fontSize="10px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
              {isDateOnlyMode ? 'Selected Date' : 'Selected Session Time'}
            </Text>
            <Text fontSize="13px" fontWeight="600" color="#263A33" fontFamily="'Inter', sans-serif">
              {readableDate}
            </Text>
          </VStack>
        </HStack>

        {!isDateOnlyMode && (
          <HStack spacing={2}>
            <Badge
              bg="rgba(86, 117, 109, 0.1)"
              color="#56756D"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="11.5px"
              fontWeight="600"
            >
              <HStack spacing={1}>
                <Icon as={FiClock} boxSize="11px" />
                <Text>{selectedStartTime} – {selectedEndTime}</Text>
              </HStack>
            </Badge>
            <Badge
              bg="#263A33"
              color="white"
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="10.5px"
              fontWeight="600"
            >
              {Math.round(currentDurationMinutes)}m
            </Badge>
          </HStack>
        )}
      </HStack>

      <Grid templateColumns={isDateOnlyMode ? '1fr' : { base: '1fr', md: '1.2fr 1fr' }} gap={5} alignItems="start">
        {/* Left: Small Modern Calendar Month Grid */}
        <Box bg="white" p={3.5} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.12)">
          {/* Calendar Header with Prev / Title / Next / Today */}
          <HStack justify="space-between" mb={3}>
            <Text
              fontSize="13.5px"
              fontWeight="600"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              color="#263A33"
              letterSpacing="-0.01em"
            >
              {monthLabel}
            </Text>
            <HStack spacing={1}>
              <Button
                size="xs"
                variant="ghost"
                borderRadius="full"
                w="24px"
                h="24px"
                p={0}
                color="#56756D"
                _hover={{ bg: 'rgba(86, 117, 109, 0.1)' }}
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <Icon as={FiChevronLeft} boxSize="14px" />
              </Button>
              <Button
                size="xs"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                borderRadius="full"
                h="22px"
                px={2}
                fontSize="10.5px"
                fontWeight="600"
                color="#263A33"
                _hover={{ bg: 'rgba(86, 117, 109, 0.08)' }}
                onClick={jumpToToday}
              >
                Today
              </Button>
              <Button
                size="xs"
                variant="ghost"
                borderRadius="full"
                w="24px"
                h="24px"
                p={0}
                color="#56756D"
                _hover={{ bg: 'rgba(86, 117, 109, 0.1)' }}
                onClick={nextMonth}
                aria-label="Next month"
              >
                <Icon as={FiChevronRight} boxSize="14px" />
              </Button>
            </HStack>
          </HStack>

          {/* Weekday Labels */}
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1.5} textAlign="center">
            {WEEKDAY_NAMES.map((name, i) => (
              <GridItem key={i}>
                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.04em">
                  {name}
                </Text>
              </GridItem>
            ))}
          </Grid>

          {/* Day Cells Grid */}
          <Grid templateColumns="repeat(7, 1fr)" gap={1} textAlign="center">
            {monthData.map((cell, idx) => {
              const mm = String(cell.month + 1).padStart(2, '0');
              const dd = String(cell.dayNumber).padStart(2, '0');
              const dateKey = `${cell.year}-${mm}-${dd}`;
              const isSelected = dateKey === selectedDateStr;
              const isToday = isTodayCheck(cell.year, cell.month, cell.dayNumber);

              return (
                <GridItem key={idx}>
                  <Button
                    size="xs"
                    w="full"
                    h="30px"
                    p={0}
                    borderRadius="lg"
                    fontSize="12px"
                    fontFamily="'Inter', sans-serif"
                    fontWeight={isSelected ? '700' : isToday ? '700' : '500'}
                    bg={
                      isSelected
                        ? '#56756D'
                        : isToday
                        ? 'rgba(86, 117, 109, 0.12)'
                        : 'transparent'
                    }
                    color={
                      isSelected
                        ? 'white'
                        : cell.isCurrentMonth
                        ? '#263A33'
                        : '#A0AEC0'
                    }
                    border={
                      isToday && !isSelected
                        ? '1px dashed #56756D'
                        : 'none'
                    }
                    boxShadow={
                      isSelected
                        ? '0 2px 6px rgba(86, 117, 109, 0.3)'
                        : 'none'
                    }
                    _hover={{
                      bg: isSelected
                        ? '#4A665E'
                        : 'rgba(86, 117, 109, 0.12)',
                    }}
                    onClick={() => handleSelectDate(cell.year, cell.month, cell.dayNumber)}
                  >
                    {cell.dayNumber}
                  </Button>
                </GridItem>
              );
            })}
          </Grid>
        </Box>

        {/* Right: Time Selectors + Duration Presets (only in datetime mode) */}
        {!isDateOnlyMode && (
          <VStack align="stretch" spacing={3.5}>
            {/* Quick Duration Presets */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={2}>
                Duration Preset
              </Text>
              <HStack spacing={1.5} wrap="wrap">
                {DURATION_PRESETS.map((p) => {
                  const isActive = Math.round(currentDurationMinutes) === p.minutes;
                  return (
                    <Button
                      key={p.minutes}
                      size="xs"
                      h="28px"
                      px={2.5}
                      borderRadius="full"
                      fontSize="11.5px"
                      fontWeight={isActive ? '600' : '500'}
                      bg={isActive ? '#263A33' : 'white'}
                      color={isActive ? 'white' : '#263A33'}
                      border="1px solid"
                      borderColor={isActive ? '#263A33' : 'rgba(86, 117, 109, 0.2)'}
                      _hover={{
                        bg: isActive ? '#3A4F46' : 'rgba(86, 117, 109, 0.08)',
                      }}
                      onClick={() => handleDurationPresetClick(p.minutes)}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </HStack>
            </Box>

            <Divider borderColor="rgba(86, 117, 109, 0.14)" />

            {/* Start Time & End Time */}
            <Grid templateColumns="1fr 1fr" gap={3}>
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                  Start Time
                </Text>
                <ModernSelect
                  value={selectedStartTime}
                  onChange={handleStartTimeChange}
                  options={TIME_SLOTS}
                  h="38px"
                  fontSize="12.5px"
                  leftIcon={FiClock}
                  menuMaxH="220px"
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                  End Time
                </Text>
                <ModernSelect
                  value={selectedEndTime}
                  onChange={handleEndTimeChange}
                  options={TIME_SLOTS}
                  h="38px"
                  fontSize="12.5px"
                  leftIcon={FiClock}
                  menuMaxH="220px"
                />
              </Box>
            </Grid>
          </VStack>
        )}
      </Grid>
    </Box>
  );
}
