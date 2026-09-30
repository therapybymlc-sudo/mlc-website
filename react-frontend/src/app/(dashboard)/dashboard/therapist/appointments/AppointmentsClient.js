'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Button,
  Spinner,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Circle,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCalendar,
  FiClock,
  FiVideo,
  FiFileText,
  FiXCircle,
  FiSearch,
  FiRefreshCw,
  FiInfo,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { schedulingApi } from '../../../../../api/scheduling';
import ModernSelect from '../../../../../components/ModernSelect';

export default function TherapistAppointmentsClient() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtering & View state
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel Modal State
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const {
    isOpen: isCancelOpen,
    onOpen: onCancelOpen,
    onClose: onCancelClose,
  } = useDisclosure();

  // Details Modal State
  const [selectedAppt, setSelectedAppt] = useState(null);
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const [copiedLink, setCopiedLink] = useState(false);

  const loadAppointments = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      const data = await schedulingApi.listTherapistAppointments();
      setAppointments(Array.isArray(data) ? data : data?.results || []);
    } catch (_err) {
      toast({
        title: 'Connection Notice',
        description: 'Unable to refresh appointments list.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const isUpcoming = (appt) => {
    if (!appt?.start_time) return false;
    return new Date(appt.start_time) > new Date() && appt.status !== 'cancelled';
  };

  // Metrics
  const metrics = useMemo(() => {
    let upcomingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    appointments.forEach((appt) => {
      const s = (appt.status || '').toLowerCase();
      if (s === 'cancelled') {
        cancelledCount++;
      } else if (s === 'completed' || (!isUpcoming(appt) && s !== 'cancelled')) {
        completedCount++;
      }
      if (isUpcoming(appt)) {
        upcomingCount++;
      }
    });

    return {
      upcoming: upcomingCount,
      completed: completedCount,
      cancelled: cancelledCount,
      total: appointments.length,
    };
  }, [appointments]);

  // Filtered List
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Tab filter
      if (activeTab === 'upcoming') {
        if (!isUpcoming(appt)) return false;
      } else if (activeTab === 'history') {
        if (isUpcoming(appt)) return false;
      }

      // 2. Status dropdown filter
      if (statusFilter !== 'all') {
        const s = (appt.status || '').toLowerCase();
        if (statusFilter === 'scheduled' && (s !== 'scheduled' && s !== 'confirmed')) return false;
        if (statusFilter === 'completed' && s !== 'completed') return false;
        if (statusFilter === 'cancelled' && s !== 'cancelled') return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientName = (appt.client_name || appt.client_display_name || '').toLowerCase();
        const clientEmail = (appt.client_email || '').toLowerCase();
        const service = (appt.service_type || '').toLowerCase();
        const roomId = (appt.room_id || `mlc_${appt.id}`).toLowerCase();
        if (!clientName.includes(q) && !clientEmail.includes(q) && !service.includes(q) && !roomId.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, activeTab, statusFilter, searchQuery]);

  // Open Cancel Modal
  const initiateCancel = (appt) => {
    setCancellingAppt(appt);
    setCancelReason('Cancelled by therapist due to schedule change');
    onCancelOpen();
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppt) return;
    try {
      setIsSubmittingCancel(true);
      await schedulingApi.cancelTherapistAppointment(
        cancellingAppt.id,
        cancelReason || 'Cancelled by therapist via dashboard'
      );
      toast({
        title: 'Session Cancelled',
        description: 'The session has been cancelled and the slot has been reopened in your calendar.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onCancelClose();
      setCancellingAppt(null);
      await loadAppointments(true);
    } catch (err) {
      toast({
        title: 'Cancellation Error',
        description: err.response?.data?.detail || 'Unable to cancel appointment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'cancelled') {
      return (
        <Badge
          bg="rgba(239, 68, 68, 0.12)"
          color="#DC2626"
          borderRadius="full"
          px={2.5}
          py={0.5}
          fontSize="10.5px"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          Cancelled
        </Badge>
      );
    }
    if (s === 'completed') {
      return (
        <Badge
          bg="rgba(86, 117, 109, 0.12)"
          color="#263A33"
          borderRadius="full"
          px={2.5}
          py={0.5}
          fontSize="10.5px"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        bg="rgba(16, 185, 129, 0.12)"
        color="#059669"
        borderRadius="full"
        px={2.5}
        py={0.5}
        fontSize="10.5px"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        Scheduled
      </Badge>
    );
  };

  const getPaymentBadge = (status) => {
    const isPaid = (status || '').toLowerCase() === 'paid';
    return (
      <Badge
        bg={isPaid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}
        color={isPaid ? '#059669' : '#D97706'}
        borderRadius="full"
        px={2.5}
        py={0.5}
        fontSize="10.5px"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {isPaid ? 'Paid' : 'Pending'}
      </Badge>
    );
  };

  const getRoomUrl = (appt) => {
    if (!appt) return '#';
    if (appt.meeting_link && appt.meeting_link.startsWith('http')) {
      return appt.meeting_link;
    }
    const roomId = appt.room_id || `MLC_${appt.id}`;
    return `/conference/${roomId}`;
  };

  const copyRoomLink = (appt) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${getRoomUrl(appt)}` : getRoomUrl(appt);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({
      title: 'Link Copied',
      description: 'Session room link copied to clipboard.',
      status: 'info',
      duration: 2500,
      isClosable: true,
    });
  };

  const statusDropdownOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled / Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 Unified Hero Banner Card */}
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
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCalendar} boxSize="22px" />
              </Circle>
              <Circle
                size="11px"
                bg="#10B981"
                border="2px solid white"
                position="absolute"
                bottom="0"
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge
                  bg="rgba(86, 117, 109, 0.12)"
                  color="#56756D"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                >
                  Clinical Practice • Sessions
                </Badge>
              </HStack>
              <Heading
                as="h1"
                fontSize={{ base: '21px', sm: '25px' }}
                fontWeight="600"
                color="#263A33"
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                lineHeight="1.25"
              >
                Session Appointments
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                Manage your upcoming clinical consultations, attendance, and session history.
              </Text>
            </VStack>
          </HStack>

          {/* Right Cluster: Metric Strip & Actions */}
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={3}
            align={{ base: 'stretch', md: 'center' }}
            w={{ base: 'full', lg: 'auto' }}
          >
            {/* Metric Strip (Rule 10) */}
            <HStack
              spacing={{ base: 1.5, sm: 3 }}
              p={1.5}
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid rgba(86, 117, 109, 0.1)"
              w={{ base: 'full', md: 'auto' }}
              justify="space-between"
            >
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiCalendar} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Upcoming
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {metrics.upcoming}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiCheckCircle} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Completed
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {metrics.completed}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(214, 158, 46, 0.12)" color="#D69E2E" flexShrink={0}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Total Consults
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {metrics.total}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Quick Action Buttons */}
            <HStack spacing={2.5} w={{ base: 'full', md: 'auto' }} justify={{ base: 'flex-start', md: 'flex-end' }} flexShrink={0}>
              <Button
                as={NextLink}
                href="/dashboard/therapist/schedule"
                bg="#56756D"
                color="white"
                borderRadius="full"
                height="38px"
                fontSize="13px"
                fontWeight="600"
                px={5}
                leftIcon={<Icon as={FiCalendar} boxSize="13px" />}
                _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                whiteSpace="nowrap"
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              >
                My Schedule
              </Button>
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* 🧭 Sub-Tab Switcher & Filter Controls */}
      <Box
        bg="white"
        p={4}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        mb={6}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          gap={3.5}
        >
          {/* Segmented Pill Tabs (Rule 11) */}
          <HStack spacing={2} overflowX="auto" pb={{ base: 2, md: 0 }}>
            {[
              { id: 'upcoming', label: 'Upcoming', count: metrics.upcoming },
              { id: 'history', label: 'Session History', count: metrics.completed },
              { id: 'all', label: 'All Sessions', count: metrics.total },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  size="sm"
                  h="36px"
                  px={4}
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  transition="all 0.2s"
                  bg={isSelected ? '#56756D' : 'white'}
                  color={isSelected ? 'white' : '#5A6E65'}
                  border="1px solid"
                  borderColor={isSelected ? '#56756D' : 'rgba(86, 117, 109, 0.16)'}
                  boxShadow={isSelected ? '0 2px 6px rgba(86, 117, 109, 0.22)' : 'none'}
                  _hover={{
                    bg: isSelected ? '#56756D' : 'rgba(86, 117, 109, 0.06)',
                    color: isSelected ? 'white' : '#263A33',
                  }}
                >
                  <HStack spacing={2}>
                    <Text>{tab.label}</Text>
                    <Badge
                      borderRadius="full"
                      px={1.5}
                      py={0.2}
                      fontSize="10px"
                      fontWeight="700"
                      bg={isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(86, 117, 109, 0.1)'}
                      color={isSelected ? 'white' : '#56756D'}
                    >
                      {tab.count}
                    </Badge>
                  </HStack>
                </Button>
              );
            })}
          </HStack>

          {/* Search & Filter Strip */}
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup size="sm" maxW={{ base: 'full', sm: '260px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="#718096" />
              </InputLeftElement>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, email..."
                h="36px"
                borderRadius="xl"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.2)"
                fontSize="12.5px"
                color="#263A33"
                _focus={{ borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
              />
            </InputGroup>

            <Box minW="160px">
              <ModernSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={statusDropdownOptions}
                h="36px"
                borderRadius="xl"
                fontSize="12px"
              />
            </Box>

            <Tooltip label="Refresh appointment records" placement="top" hasArrow>
              <Button
                onClick={() => loadAppointments(true)}
                isLoading={refreshing}
                variant="outline"
                size="sm"
                h="36px"
                w="36px"
                p={0}
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                color="#56756D"
                _hover={{ bg: 'rgba(86, 117, 109, 0.08)', borderColor: '#56756D' }}
              >
                <Icon as={FiRefreshCw} boxSize="13px" />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content Area */}
      {loading ? (
        <Box
          bg="white"
          p={12}
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.14)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={3}>
            <Spinner size="lg" color="#56756D" thickness="3px" speed="0.7s" />
            <Text fontSize="13px" color="#5A6E65">
              Loading session appointments...
            </Text>
          </VStack>
        </Box>
      ) : filteredAppointments.length === 0 ? (
        <Box
          bg="white"
          p={10}
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          textAlign="center"
        >
          <VStack spacing={3.5} maxW="420px" mx="auto">
            <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiCalendar} boxSize="22px" />
            </Circle>
            <Heading
              fontSize="16px"
              fontWeight="600"
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              {searchQuery ? 'No matching appointments found' : 'No sessions found'}
            </Heading>
            <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
              {searchQuery
                ? 'Try adjusting your search keywords or clear filters to see your sessions.'
                : activeTab === 'upcoming'
                ? 'You do not have any upcoming consultations scheduled. Check your availability to ensure clients can book slots.'
                : 'No past session records found in this category.'}
            </Text>
            {activeTab === 'upcoming' && !searchQuery && (
              <Button
                as={NextLink}
                href="/dashboard/therapist/availability"
                size="sm"
                borderRadius="full"
                bg="#56756D"
                color="white"
                px={5}
                _hover={{ bg: '#263A33' }}
              >
                Set Availability Slots
              </Button>
            )}
          </VStack>
        </Box>
      ) : activeTab === 'upcoming' ? (
        /* 🌿 UPCOMING SESSIONS VIEW - High-touch clinical action cards */
        <VStack align="stretch" spacing={4}>
          {filteredAppointments.map((appt) => {
            const startDate = new Date(appt.start_time);
            const endDate = appt.end_time ? new Date(appt.end_time) : null;
            const dateStr = startDate.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
              endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''
            }`;
            const clientName = appt.client_display_name || appt.client_name || 'Client';

            return (
              <Box
                key={appt.id}
                bg="white"
                p={{ base: 4, sm: 5 }}
                borderRadius="2xl"
                border="1px solid rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                transition="all 0.2s"
                _hover={{
                  borderColor: '#56756D',
                  boxShadow: '0 6px 24px -4px rgba(38, 58, 51, 0.08)',
                }}
              >
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  justify="space-between"
                  align={{ base: 'stretch', md: 'center' }}
                  gap={4}
                >
                  {/* Left: Client & Session Details */}
                  <HStack spacing={4} align="flex-start" flex="1">
                    <Avatar
                      size="md"
                      name={clientName}
                      src={appt.client_avatar}
                      border="2px solid white"
                      boxShadow="0 2px 6px rgba(0,0,0,0.06)"
                    />
                    <VStack align="start" spacing={1.5}>
                      <HStack spacing={2.5} flexWrap="wrap">
                        <Text
                          fontFamily="'Outfit', var(--font-outfit), sans-serif"
                          fontWeight="600"
                          fontSize="16px"
                          color="#263A33"
                        >
                          {clientName}
                        </Text>
                        {getStatusBadge(appt.status)}
                        {getPaymentBadge(appt.payment_status)}
                      </HStack>

                      {appt.client_email && (
                        <Text fontSize="12px" color="#718096" fontFamily="'Inter', sans-serif">
                          {appt.client_email}
                        </Text>
                      )}

                      <HStack spacing={3} flexWrap="wrap" pt={0.5}>
                        <HStack spacing={1.5} color="#263A33" fontSize="12.5px" fontWeight="500">
                          <Icon as={FiClock} color="#56756D" />
                          <Text>
                            {dateStr} • {timeStr}
                          </Text>
                        </HStack>

                        <HStack
                          spacing={1.5}
                          px={2.5}
                          py={0.5}
                          borderRadius="full"
                          bg="rgba(86, 117, 109, 0.08)"
                        >
                          <Icon as={FiVideo} color="#56756D" boxSize="11px" />
                          <Text fontSize="11px" fontWeight="600" color="#263A33">
                            {appt.service_type || 'Virtual 1-on-1'}
                          </Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Right: Actions */}
                  <HStack
                    spacing={2.5}
                    justify={{ base: 'flex-start', md: 'flex-end' }}
                    flexWrap="wrap"
                    pt={{ base: 2, md: 0 }}
                  >
                    <Button
                      as={NextLink}
                      href={getRoomUrl(appt)}
                      target="_blank"
                      size="sm"
                      h="36px"
                      px={4}
                      borderRadius="full"
                      bg="#56756D"
                      color="white"
                      fontSize="12.5px"
                      fontWeight="600"
                      leftIcon={<Icon as={FiVideo} boxSize="13px" />}
                      _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                      transition="all 0.2s"
                      boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                      whiteSpace="nowrap"
                    >
                      Join Session
                    </Button>

                    <Button
                      as={NextLink}
                      href="/dashboard/therapist/notes"
                      size="sm"
                      h="36px"
                      px={3.5}
                      borderRadius="full"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      fontSize="12px"
                      fontWeight="600"
                      leftIcon={<Icon as={FiFileText} boxSize="12px" />}
                      _hover={{ bg: 'rgba(86, 117, 109, 0.06)' }}
                      whiteSpace="nowrap"
                    >
                      Notes
                    </Button>

                    <Button
                      onClick={() => {
                        setSelectedAppt(appt);
                        onDetailOpen();
                      }}
                      size="sm"
                      h="36px"
                      px={3}
                      borderRadius="full"
                      variant="ghost"
                      color="#56756D"
                      fontSize="12px"
                      fontWeight="600"
                      leftIcon={<Icon as={FiInfo} boxSize="12px" />}
                      _hover={{ bg: 'rgba(86, 117, 109, 0.08)' }}
                    >
                      Details
                    </Button>

                    <Button
                      onClick={() => initiateCancel(appt)}
                      size="sm"
                      h="36px"
                      px={3}
                      borderRadius="full"
                      variant="ghost"
                      color="#DC2626"
                      fontSize="12px"
                      fontWeight="600"
                      leftIcon={<Icon as={FiXCircle} boxSize="12px" />}
                      _hover={{ bg: 'rgba(239, 68, 68, 0.08)' }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      ) : (
        /* 📜 SESSION HISTORY / ALL SESSIONS TABLE VIEW */
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          overflowX="auto"
        >
          <Table variant="simple" size="sm">
            <Thead>
              <Tr borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                >
                  Date & Time
                </Th>
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                >
                  Client
                </Th>
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                >
                  Modality
                </Th>
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                >
                  Status
                </Th>
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                >
                  Payment
                </Th>
                <Th
                  fontFamily="'Inter', sans-serif"
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  py={3.5}
                  textAlign="right"
                >
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAppointments.map((appt) => {
                const startDate = new Date(appt.start_time);
                const clientName = appt.client_display_name || appt.client_name || 'Client';
                const s = (appt.status || '').toLowerCase();
                const isCancelled = s === 'cancelled';

                return (
                  <Tr
                    key={appt.id}
                    _hover={{ bg: 'rgba(250, 248, 245, 0.65)' }}
                    transition="background 0.15s"
                  >
                    <Td py={3.5}>
                      <VStack align="start" spacing={0.5}>
                        <Text
                          fontFamily="'Outfit', sans-serif"
                          fontWeight="600"
                          fontSize="13px"
                          color="#263A33"
                          whiteSpace="nowrap"
                        >
                          {startDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text fontSize="11.5px" color="#5A6E65">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </VStack>
                    </Td>

                    <Td py={3.5}>
                      <HStack spacing={2.5}>
                        <Avatar size="xs" name={clientName} src={appt.client_avatar} />
                        <VStack align="start" spacing={0}>
                          <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                            {clientName}
                          </Text>
                          {appt.client_email && (
                            <Text fontSize="11px" color="#718096" noOfLines={1}>
                              {appt.client_email}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Td>

                    <Td py={3.5}>
                      <Badge
                        bg="rgba(86, 117, 109, 0.08)"
                        color="#263A33"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="10.5px"
                        fontWeight="600"
                      >
                        {appt.service_type || 'Virtual 1-on-1'}
                      </Badge>
                    </Td>

                    <Td py={3.5}>{getStatusBadge(appt.status)}</Td>

                    <Td py={3.5}>{getPaymentBadge(appt.payment_status)}</Td>

                    <Td py={3.5} textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          onClick={() => {
                            setSelectedAppt(appt);
                            onDetailOpen();
                          }}
                          size="xs"
                          h="28px"
                          px={2.5}
                          borderRadius="full"
                          variant="outline"
                          borderColor="rgba(86, 117, 109, 0.2)"
                          color="#263A33"
                          fontSize="11.5px"
                          fontWeight="600"
                          _hover={{ bg: 'rgba(86, 117, 109, 0.06)' }}
                        >
                          Details
                        </Button>

                        {!isCancelled && (
                          <Button
                            as={NextLink}
                            href="/dashboard/therapist/notes"
                            size="xs"
                            h="28px"
                            px={2.5}
                            borderRadius="full"
                            variant="ghost"
                            color="#56756D"
                            fontSize="11.5px"
                            fontWeight="600"
                            leftIcon={<Icon as={FiFileText} boxSize="11px" />}
                            _hover={{ bg: 'rgba(86, 117, 109, 0.08)' }}
                          >
                            Notes
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* 📋 Clinical Session Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2} fontFamily="'Inter', sans-serif">
          <ModalHeader pb={2}>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0.5}>
                <Heading
                  fontSize="17px"
                  fontWeight="600"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Clinical Session Details
                </Heading>
                <Text fontSize="12px" color="#5A6E65">
                  Record ID #{selectedAppt?.id}
                </Text>
              </VStack>
              {selectedAppt && getStatusBadge(selectedAppt.status)}
            </HStack>
          </ModalHeader>
          <ModalBody>
            {selectedAppt && (
              <VStack align="stretch" spacing={4} py={2}>
                <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.1)">
                  <HStack spacing={3}>
                    <Avatar
                      size="md"
                      name={selectedAppt.client_display_name || selectedAppt.client_name || 'Client'}
                      src={selectedAppt.client_avatar}
                    />
                    <VStack align="start" spacing={0.5}>
                      <Text fontFamily="'Outfit', sans-serif" fontWeight="600" fontSize="15px" color="#263A33">
                        {selectedAppt.client_display_name || selectedAppt.client_name || 'Client'}
                      </Text>
                      {selectedAppt.client_email && (
                        <Text fontSize="12px" color="#718096">
                          {selectedAppt.client_email}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Box>

                <SimpleDetailsGrid appt={selectedAppt} />

                {/* Video Room Strip */}
                <Box p={3.5} borderRadius="xl" border="1px solid rgba(86, 117, 109, 0.15)" bg="white">
                  <VStack align="start" spacing={2}>
                    <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                      Tele-Therapy Video Room
                    </Text>
                    <HStack justify="space-between" w="full" spacing={2}>
                      <Text fontSize="12.5px" fontWeight="600" color="#263A33" noOfLines={1}>
                        Room: {selectedAppt.room_id || `MLC_${selectedAppt.id}`}
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          onClick={() => copyRoomLink(selectedAppt)}
                          size="xs"
                          borderRadius="full"
                          variant="outline"
                          borderColor="rgba(86, 117, 109, 0.25)"
                          color="#56756D"
                          leftIcon={<Icon as={copiedLink ? FiCheck : FiCopy} />}
                        >
                          {copiedLink ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          as={NextLink}
                          href={getRoomUrl(selectedAppt)}
                          target="_blank"
                          size="xs"
                          borderRadius="full"
                          bg="#56756D"
                          color="white"
                          leftIcon={<Icon as={FiExternalLink} />}
                          _hover={{ bg: '#263A33' }}
                        >
                          Join
                        </Button>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>

                {selectedAppt.cancellation_reason && (
                  <Box p={3.5} borderRadius="xl" bg="rgba(239, 68, 68, 0.08)" border="1px solid rgba(239, 68, 68, 0.2)">
                    <Text fontSize="11px" fontWeight="700" color="#DC2626" textTransform="uppercase" letterSpacing="0.06em">
                      Cancellation Reason
                    </Text>
                    <Text fontSize="12.5px" color="#263A33" mt={1}>
                      {selectedAppt.cancellation_reason}
                    </Text>
                  </Box>
                )}

                {selectedAppt.notes && (
                  <Box p={3.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.1)">
                    <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                      Booking Notes
                    </Text>
                    <Text fontSize="12.5px" color="#263A33" mt={1}>
                      {selectedAppt.notes}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter pt={2}>
            <Button size="sm" borderRadius="full" onClick={onDetailClose} variant="ghost" color="#56756D">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ⚠️ Cancellation Confirmation Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" p={2} fontFamily="'Inter', sans-serif">
          <ModalHeader pb={2}>
            <HStack spacing={2} color="#DC2626">
              <Icon as={FiAlertCircle} boxSize="20px" />
              <Heading
                fontSize="17px"
                fontWeight="600"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
              >
                Cancel Session Appointment
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {cancellingAppt && (
              <VStack align="stretch" spacing={3.5}>
                <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                  Are you sure you want to cancel the session with{' '}
                  <Text as="span" fontWeight="700" color="#263A33">
                    {cancellingAppt.client_display_name || cancellingAppt.client_name || 'the client'}
                  </Text>
                  ? The client will be notified and the slot will be released back to your public schedule.
                </Text>

                <FormControl>
                  <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">
                    Cancellation Reason (Visible to Client)
                  </FormLabel>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                    borderRadius="xl"
                    borderColor="rgba(86, 117, 109, 0.2)"
                    fontSize="13px"
                    rows={3}
                    _focus={{ borderColor: '#56756D', boxShadow: '0 0 0 1px #56756D' }}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap={2} pt={2}>
            <Button
              size="sm"
              borderRadius="full"
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              onClick={onCancelClose}
              isDisabled={isSubmittingCancel}
            >
              Keep Session
            </Button>
            <Button
              size="sm"
              borderRadius="full"
              bg="#DC2626"
              color="white"
              onClick={handleConfirmCancel}
              isLoading={isSubmittingCancel}
              _hover={{ bg: '#B91C1C' }}
            >
              Confirm Cancellation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function SimpleDetailsGrid({ appt }) {
  const startDate = new Date(appt.start_time);
  const endDate = appt.end_time ? new Date(appt.end_time) : null;
  const dateStr = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
    endDate ? ` - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''
  }`;

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr' }}
      gap={3}
    >
      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.08)">
        <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
          Scheduled Time
        </Text>
        <Text fontSize="12.5px" fontWeight="600" color="#263A33" mt={0.5}>
          {dateStr}
        </Text>
        <Text fontSize="11.5px" color="#5A6E65">
          {timeStr}
        </Text>
      </Box>

      <Box p={3} borderRadius="xl" bg="rgba(250, 248, 245, 0.6)" border="1px solid rgba(86, 117, 109, 0.08)">
        <Text fontSize="10.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
          Modality & Format
        </Text>
        <Text fontSize="12.5px" fontWeight="600" color="#263A33" mt={0.5}>
          {appt.service_type || 'Virtual 1-on-1'}
        </Text>
        <Text fontSize="11.5px" color="#5A6E65">
          Encrypted Video
        </Text>
      </Box>
    </Box>
  );
}
