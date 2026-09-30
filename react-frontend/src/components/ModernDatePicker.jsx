'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Grid,
  GridItem,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Helper to safely parse "YYYY-MM-DD" without timezone shift
function parseDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

// Helper to format Date to "YYYY-MM-DD"
function formatDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function ModernDatePicker({
  value, // string "YYYY-MM-DD"
  onChange, // (dateString) => void
  placeholder = 'Select date',
  isDisabled = false,
  isClearable = true,
  minYear = 1940,
  maxYear = 2040,
  // Styling overrides for trigger
  h = '38px',
  borderRadius = 'xl',
  fontSize = '13px',
  bg = 'rgba(250, 248, 245, 0.85)',
  borderColor = 'rgba(86, 117, 109, 0.18)',
  w = 'full',
  maxW,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Selected date components
  const selectedDateObj = useMemo(() => parseDateString(value), [value]);

  // Calendar view year and month
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => (selectedDateObj ? selectedDateObj.getFullYear() : today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDateObj ? selectedDateObj.getMonth() : today.getMonth()));
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  // Sync calendar view if value changes externally
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [selectedDateObj]);

  // Readable display text
  const displayLabel = useMemo(() => {
    if (!selectedDateObj) return '';
    return selectedDateObj.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateObj]);

  // Month days generation
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

    // Next month overflow
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

  // Navigation handlers
  const prevMonth = (e) => {
    e?.stopPropagation();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e?.stopPropagation();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (year, month, dayNumber) => {
    const formatted = formatDateString(year, month, dayNumber);
    onChange?.(formatted);
    onClose();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  const jumpToToday = (e) => {
    e?.stopPropagation();
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    handleSelectDay(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const isTodayCheck = (year, month, day) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  // Years for quick year picker
  const yearOptions = useMemo(() => {
    const list = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  return (
    <Popover
      isOpen={isOpen}
      onOpen={isDisabled ? undefined : onOpen}
      onClose={() => {
        setIsYearPickerOpen(false);
        onClose();
      }}
      placement="bottom-start"
      closeOnBlur
      isLazy
    >
      <PopoverTrigger>
        <Flex
          as="button"
          type="button"
          w={w}
          maxW={maxW}
          h={h}
          px={3}
          align="center"
          justify="space-between"
          bg={isOpen ? 'white' : bg}
          borderRadius={borderRadius}
          border="1px solid"
          borderColor={isOpen ? '#56756D' : borderColor}
          boxShadow={isOpen ? '0 0 0 1px #56756D' : 'none'}
          transition="all 0.15s ease"
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          opacity={isDisabled ? 0.6 : 1}
          _hover={isDisabled ? {} : { borderColor: '#56756D', bg: 'white' }}
          fontFamily="'Inter', var(--font-inter), sans-serif"
          outline="none"
        >
          <HStack spacing={2} minW={0} overflow="hidden">
            <Icon
              as={FiCalendar}
              boxSize="14px"
              color={value ? '#56756D' : '#A0AEC0'}
              flexShrink={0}
            />
            <Text
              fontSize={fontSize}
              color={value ? '#263A33' : '#A0AEC0'}
              fontWeight={value ? '500' : '400'}
              isTruncated
            >
              {displayLabel || placeholder}
            </Text>
          </HStack>

          <HStack spacing={1} flexShrink={0} ml={1}>
            {value && isClearable && !isDisabled && (
              <Box
                as="span"
                onClick={handleClear}
                p={1}
                borderRadius="full"
                color="#A0AEC0"
                _hover={{ color: '#E53E3E', bg: 'rgba(239, 68, 68, 0.08)' }}
                title="Clear date"
              >
                <Icon as={FiX} boxSize="12px" />
              </Box>
            )}
            <Icon
              as={FiChevronDown}
              boxSize="13px"
              color="#A0AEC0"
              transition="transform 0.15s ease"
              transform={isOpen ? 'rotate(180deg)' : 'none'}
            />
          </HStack>
        </Flex>
      </PopoverTrigger>

      <Portal>
        <PopoverContent
          bg="white"
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.16)"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          p={3.5}
          w="300px"
          maxW="92vw"
          _focus={{ outline: 'none' }}
          zIndex={2000}
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          <PopoverBody p={0}>
            {/* Calendar Header */}
            <HStack justify="space-between" mb={3} px={1}>
              {/* Month & Year Title (clickable to toggle quick year selector) */}
              <HStack spacing={1.5}>
                <Button
                  size="xs"
                  variant="ghost"
                  px={1.5}
                  h="26px"
                  borderRadius="md"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  fontWeight="600"
                  fontSize="14px"
                  letterSpacing="-0.01em"
                  _hover={{ bg: 'rgba(86, 117, 109, 0.08)' }}
                  onClick={() => setIsYearPickerOpen((prev) => !prev)}
                  rightIcon={<Icon as={FiChevronDown} boxSize="11px" color="#56756D" />}
                >
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Button>
              </HStack>

              {/* Prev / Today / Next Controls */}
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
                  <Icon as={FiChevronLeft} boxSize="13px" />
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
                  <Icon as={FiChevronRight} boxSize="13px" />
                </Button>
              </HStack>
            </HStack>

            {/* Quick Year / Month Selector Panel */}
            {isYearPickerOpen ? (
              <Box
                py={2}
                borderTop="1px solid rgba(86, 117, 109, 0.1)"
                borderBottom="1px solid rgba(86, 117, 109, 0.1)"
                mb={2}
              >
                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                  Select Month
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={1.5} mb={3}>
                  {MONTH_NAMES.map((m, idx) => (
                    <Button
                      key={m}
                      size="xs"
                      h="26px"
                      fontSize="11.5px"
                      borderRadius="md"
                      fontWeight={viewMonth === idx ? '700' : '500'}
                      bg={viewMonth === idx ? '#56756D' : 'rgba(250, 248, 245, 0.85)'}
                      color={viewMonth === idx ? 'white' : '#263A33'}
                      _hover={{ bg: viewMonth === idx ? '#4A665E' : 'rgba(86, 117, 109, 0.12)' }}
                      onClick={() => setViewMonth(idx)}
                    >
                      {m.slice(0, 3)}
                    </Button>
                  ))}
                </Grid>

                <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                  Select Year
                </Text>
                <Box maxH="120px" overflowY="auto" pr={1}>
                  <Grid templateColumns="repeat(4, 1fr)" gap={1}>
                    {yearOptions.map((y) => (
                      <Button
                        key={y}
                        size="xs"
                        h="24px"
                        fontSize="11px"
                        borderRadius="md"
                        fontWeight={viewYear === y ? '700' : '500'}
                        bg={viewYear === y ? '#263A33' : 'transparent'}
                        color={viewYear === y ? 'white' : '#263A33'}
                        _hover={{ bg: viewYear === y ? '#1E2F29' : 'rgba(86, 117, 109, 0.1)' }}
                        onClick={() => {
                          setViewYear(y);
                          setIsYearPickerOpen(false);
                        }}
                      >
                        {y}
                      </Button>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ) : (
              <>
                {/* Weekday Abbreviations */}
                <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1.5} textAlign="center">
                  {WEEKDAY_NAMES.map((name, i) => (
                    <GridItem key={i}>
                      <Text
                        fontSize="10px"
                        fontWeight="700"
                        color="#718096"
                        textTransform="uppercase"
                        letterSpacing="0.04em"
                      >
                        {name}
                      </Text>
                    </GridItem>
                  ))}
                </Grid>

                {/* Day Cells Grid */}
                <Grid templateColumns="repeat(7, 1fr)" gap={1} textAlign="center">
                  {monthData.map((cell, idx) => {
                    const formatted = formatDateString(cell.year, cell.month, cell.dayNumber);
                    const isSelected = value && value.slice(0, 10) === formatted;
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
                          onClick={() => handleSelectDay(cell.year, cell.month, cell.dayNumber)}
                        >
                          {cell.dayNumber}
                        </Button>
                      </GridItem>
                    );
                  })}
                </Grid>
              </>
            )}

            {/* Bottom Actions: Jump Today + Clear */}
            <Flex
              justify="space-between"
              align="center"
              pt={2.5}
              mt={2.5}
              borderTop="1px solid rgba(86, 117, 109, 0.12)"
              px={1}
            >
              <Button
                size="xs"
                variant="ghost"
                color="#56756D"
                fontSize="11px"
                fontWeight="600"
                h="22px"
                px={2}
                borderRadius="full"
                _hover={{ bg: 'rgba(86, 117, 109, 0.1)' }}
                onClick={jumpToToday}
              >
                Today
              </Button>

              {value && isClearable && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#718096"
                  fontSize="11px"
                  fontWeight="500"
                  h="22px"
                  px={2}
                  borderRadius="full"
                  _hover={{ color: '#E53E3E', bg: 'rgba(239, 68, 68, 0.08)' }}
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
