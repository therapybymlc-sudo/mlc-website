'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, Grid, Icon, 
  Avatar, Badge, Divider, Flex, useToast, Spinner, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Textarea, IconButton, Circle, Center
} from "@chakra-ui/react";
import { FiUsers, FiFileText, FiUploadCloud, FiBook, FiCheckCircle, FiClock, FiPlus, FiCalendar } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import NextLink from "next/link";
import ModernDatePicker from "../../../../../components/ModernDatePicker";

export default function SupervisionClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupervisee, setSelectedSupervisee] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteContent, setNoteContent] = useState("");
  const [noteAgenda, setNoteAgenda] = useState("");
  const [noteFormulation, setNoteFormulation] = useState("");
  const [noteNextSteps, setNoteNextSteps] = useState("");
  const [newActionItem, setNewActionItem] = useState({ title: "", owner: "supervisee", due_date: "" });
  const [savingNote, setSavingNote] = useState(false);
  const [savingActionItem, setSavingActionItem] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
    fetchSupervisionData();
  }, []);

  const fetchSupervisionData = async () => {
    try {
      const [relData, sessionData, noteData, actionData, reminderData] = await Promise.all([
        apiGet("supervisory-relationships/"),
        apiGet("supervisory-relationships/my-supervisor-sessions/").catch(() => []),
        apiGet("supervision-notes/").catch(() => []),
        apiGet("supervision-action-items/").catch(() => []),
        apiGet("supervision-action-items/my-reminders/").catch(() => []),
      ]);
      setRelationships(Array.isArray(relData) ? relData : []);
      setSessions(Array.isArray(sessionData) ? sessionData : []);
      setNotes(Array.isArray(noteData) ? noteData : []);
      setActionItems(Array.isArray(actionData) ? actionData : []);
      setReminders(Array.isArray(reminderData) ? reminderData : []);

      if (!selectedSupervisee && Array.isArray(relData) && relData.length > 0) {
        setSelectedSupervisee(relData[0]);
      }
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to load supervision caseload.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const superviseeCards = React.useMemo(() => {
    const byRelationship = new Map();
    relationships.forEach((rel) => {
      byRelationship.set(rel.id, {
        id: rel.id,
        supervisee_name: rel.supervisee_name,
        supervisee_title: rel.supervisee_title || "Practitioner",
        status: rel.status,
        supervisee_bio: "",
        supervisee_email: "",
      });
    });

    sessions.forEach((session) => {
      if (!byRelationship.has(session.relationship_id)) {
        byRelationship.set(session.relationship_id, {
          id: session.relationship_id,
          supervisee_name: session.supervisee_name,
          supervisee_title: session.supervisee_title || "Practitioner",
          status: "active",
          supervisee_bio: session.supervisee_bio || "",
          supervisee_email: session.supervisee_email || "",
        });
      } else {
        const existing = byRelationship.get(session.relationship_id);
        byRelationship.set(session.relationship_id, {
          ...existing,
          supervisee_bio: existing.supervisee_bio || session.supervisee_bio || "",
          supervisee_email: existing.supervisee_email || session.supervisee_email || "",
          supervisee_title: existing.supervisee_title || session.supervisee_title || "Practitioner",
        });
      }
    });

    return Array.from(byRelationship.values());
  }, [relationships, sessions]);

  const selectedSessions = React.useMemo(() => {
    if (!selectedSupervisee) return sessions;
    return sessions.filter((s) => s.relationship_id === selectedSupervisee.id);
  }, [sessions, selectedSupervisee]);

  const selectedNotes = React.useMemo(() => {
    if (!selectedSupervisee) return [];
    return notes.filter((n) => n.relationship === selectedSupervisee.id);
  }, [notes, selectedSupervisee]);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!selectedSupervisee?.id) {
        setTimeline([]);
        return;
      }
      const data = await apiGet(`supervisory-relationships/${selectedSupervisee.id}/timeline/`).catch(() => []);
      setTimeline(Array.isArray(data) ? data : []);
    };
    fetchTimeline();
  }, [selectedSupervisee?.id]);

  const handleCreateNote = async () => {
    if (!selectedSupervisee || !noteContent.trim()) return;
    setSavingNote(true);
    try {
      const latestSession = selectedSessions[0];
      const payload = {
        relationship: selectedSupervisee.id,
        content: noteContent.trim(),
        agenda: noteAgenda,
        case_formulation: noteFormulation,
        next_steps: noteNextSteps,
      };
      if (latestSession?.appointment_id) {
        payload.appointment = latestSession.appointment_id;
      }

      await apiPost("supervision-notes/", payload);
      setNoteContent("");
      setNoteAgenda("");
      setNoteFormulation("");
      setNoteNextSteps("");
      onClose();
      toast({ title: "Note saved", description: "Supervision note added successfully.", status: "success" });
      await fetchSupervisionData();
    } catch (err) {
      toast({ title: "Save failed", description: "Could not save supervision note.", status: "error" });
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateActionItem = async () => {
    if (!selectedSupervisee?.id || !newActionItem.title.trim()) return;
    setSavingActionItem(true);
    try {
      await apiPost("supervision-action-items/", {
        relationship: selectedSupervisee.id,
        title: newActionItem.title.trim(),
        owner: newActionItem.owner,
        due_date: newActionItem.due_date || null,
      });
      setNewActionItem({ title: "", owner: "supervisee", due_date: "" });
      await fetchSupervisionData();
      toast({ status: "success", title: "Action item added" });
    } catch (err) {
      toast({ status: "error", title: "Could not add action item" });
    } finally {
      setSavingActionItem(false);
    }
  };

  if (loading) {
    return (
      <Center minH="40vh">
        <VStack spacing={3}>
          <Spinner size="lg" color="#56756D" thickness="3px" />
          <Text fontSize="13px" color="#5A6E65">Syncing mentorship portfolio...</Text>
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
                <Icon as={FiUsers} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg={superviseeCards.length > 0 ? "#10B981" : "#A0AEC0"} 
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
                  Clinical Practice · Mentorship
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
                  Active Supervisor
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
                Clinical Supervision Suite
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Manage your mentorship caseload, session notes, and clinical records.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Manage Mentorship Hours CTA */}
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
                  <Icon as={FiUsers} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    SUPERVISEES
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {superviseeCards.length}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="24px" borderColor="rgba(86, 117, 109, 0.16)" />

              <HStack spacing={2} px={2} py={1}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                    SESSIONS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                    {sessions.length}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <Button
              as={NextLink}
              href="/dashboard/therapist/supervision/availability"
              leftIcon={<FiCalendar />}
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              whiteSpace="nowrap"
              _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
              transition="all 0.2s"
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.2)"
            >
              Manage Mentorship Hours
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* ⚠️ Reminders Banner (if any) */}
      {reminders.length > 0 && (
        <Box 
          mb={6} 
          p={4} 
          borderRadius="2xl" 
          bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" 
          border="1px solid rgba(245, 158, 11, 0.3)"
          boxShadow="0 4px 12px -2px rgba(245, 158, 11, 0.1)"
        >
          <Heading as="h4" fontSize="13px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#92400E" mb={2}>
            Upcoming Supervision Reminders
          </Heading>
          <VStack align="stretch" spacing={1.5}>
            {reminders.slice(0, 5).map((r) => (
              <Text key={r.id} fontSize="12.5px" color="#78350F">
                • {r.title} {r.due_date ? `(due ${r.due_date})` : ""}
              </Text>
            ))}
          </VStack>
        </Box>
      )}

      {/* 🍱 2. BENTO GRID LAYOUT */}
      <Grid templateColumns={{ base: "1fr", lg: "3.8fr 8.2fr" }} gap={6} alignItems="start">
        {/* 👥 Supervisee Caseload Column */}
        <Box
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(86, 117, 109, 0.14)"
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <HStack justify="space-between" mb={4}>
            <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
              Practitioners
            </Heading>
            <Badge 
              bg="rgba(86, 117, 109, 0.12)" 
              color="#263A33" 
              borderRadius="full" 
              px={2.5} 
              py={0.5} 
              fontSize="11px" 
              fontWeight="700"
            >
              {superviseeCards.length}
            </Badge>
          </HStack>

          {superviseeCards.length > 0 ? (
            <VStack align="stretch" spacing={2.5}>
              {superviseeCards.map((rel) => {
                const isSelected = selectedSupervisee?.id === rel.id;
                return (
                  <Box
                    key={rel.id}
                    p={3.5}
                    bg={isSelected ? "rgba(86, 117, 109, 0.08)" : "rgba(250, 248, 245, 0.85)"}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.12)"}
                    cursor="pointer"
                    onClick={() => setSelectedSupervisee(rel)}
                    transition="all 0.15s ease"
                    _hover={{ bg: isSelected ? "rgba(86, 117, 109, 0.12)" : "rgba(86, 117, 109, 0.05)", borderColor: "#56756D" }}
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={rel.supervisee_name} bg="#56756D" color="white" />
                      <VStack align="start" spacing={0} flex="1" minW={0}>
                        <Text fontSize="13px" fontWeight="600" color="#263A33" noOfLines={1}>
                          {rel.supervisee_name}
                        </Text>
                        <Text fontSize="11.5px" color="#5A6E65" noOfLines={1}>
                          {rel.supervisee_title || 'Practitioner'}
                        </Text>
                      </VStack>
                      <Circle size="20px" bg={rel.status === 'active' ? "rgba(16, 185, 129, 0.12)" : "rgba(160, 174, 192, 0.15)"} color={rel.status === 'active' ? "#059669" : "#718096"}>
                        <Icon as={FiCheckCircle} boxSize="11px" />
                      </Circle>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <VStack spacing={3} py={6} px={3} textAlign="center">
              <Circle size="44px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                <Icon as={FiUsers} boxSize="18px" />
              </Circle>
              <VStack spacing={1}>
                <Text fontSize="13.5px" fontWeight="600" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif">
                  No Active Supervisees
                </Text>
                <Text fontSize="12px" color="#5A6E65" lineHeight="1.5">
                  Supervisees who schedule mentorship hours with you will appear here automatically.
                </Text>
              </VStack>
              <Button
                as={NextLink}
                href="/dashboard/therapist/supervision/availability"
                size="sm"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="32px"
                fontSize="12px"
                fontWeight="600"
                px={3.5}
                mt={1}
                _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
              >
                Set Mentorship Hours
              </Button>
            </VStack>
          )}
        </Box>

        {/* 📝 Detail Pane: Supervisee Records or Empty Placeholder */}
        <Box>
          {selectedSupervisee ? (
            <VStack align="stretch" spacing={5}>
              {/* Supervisee Profile Card */}
              <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} wrap="wrap" gap={3} mb={4}>
                  <HStack spacing={3}>
                    <Avatar size="md" name={selectedSupervisee.supervisee_name} bg="#56756D" color="white" />
                    <VStack align="start" spacing={0}>
                      <Heading as="h2" fontSize="17px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                        {selectedSupervisee.supervisee_name}
                      </Heading>
                      <Text fontSize="12.5px" color="#5A6E65">Active Supervisory Relationship</Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={2}>
                    <Button 
                      leftIcon={<FiPlus />} 
                      bg="#56756D" 
                      color="white" 
                      borderRadius="full" 
                      h="34px" 
                      fontSize="12.5px" 
                      fontWeight="600" 
                      px={4}
                      _hover={{ bg: "#263A33" }}
                      onClick={onOpen}
                    >
                      New Note
                    </Button>
                    <Button 
                      leftIcon={<FiUploadCloud />} 
                      variant="outline" 
                      borderColor="rgba(86, 117, 109, 0.25)" 
                      color="#263A33" 
                      borderRadius="full" 
                      h="34px" 
                      fontSize="12.5px"
                      fontWeight="600"
                      px={4}
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D" }}
                    >
                      Vault
                    </Button>
                  </HStack>
                </Flex>

                <Divider borderColor="rgba(86, 117, 109, 0.12)" mb={4} />

                <VStack align="stretch" spacing={2.5}>
                  <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                    Supervisee Profile
                  </Text>
                  <HStack spacing={3} wrap="wrap">
                    <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" px={2.5} py={0.5} borderRadius="full" fontSize="12px" fontWeight="600">
                      {selectedSupervisee.supervisee_title || "Practitioner"}
                    </Badge>
                    {selectedSupervisee.supervisee_email && (
                      <Text fontSize="13px" color="#5A6E65">{selectedSupervisee.supervisee_email}</Text>
                    )}
                  </HStack>
                  {selectedSupervisee.supervisee_bio && (
                    <Text fontSize="13px" color="#5A6E65" lineHeight="1.5" mt={1}>
                      {selectedSupervisee.supervisee_bio}
                    </Text>
                  )}
                </VStack>
              </Box>

              {/* Action Items Card */}
              <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={4}>
                  <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                    Action Items
                  </Heading>
                  <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" borderRadius="full" px={2.5} py={0.5} fontSize="11px" fontWeight="700">
                    {actionItems.filter((a) => a.relationship === selectedSupervisee.id).length}
                  </Badge>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  <Textarea
                    minH="68px"
                    placeholder="Add a concrete next step or case assignment..."
                    value={newActionItem.title}
                    onChange={(e) => setNewActionItem((prev) => ({ ...prev, title: e.target.value }))}
                    fontSize="13px"
                    bg="rgba(250, 248, 245, 0.6)"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.2)"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  />

                  <Flex gap={2} wrap="wrap" align="center">
                    <Button
                      size="sm"
                      variant={newActionItem.owner === "supervisee" ? "solid" : "outline"}
                      bg={newActionItem.owner === "supervisee" ? "#56756D" : "transparent"}
                      color={newActionItem.owner === "supervisee" ? "white" : "#263A33"}
                      borderColor="rgba(86, 117, 109, 0.25)"
                      borderRadius="full"
                      h="32px"
                      fontSize="12px"
                      fontWeight="600"
                      _hover={{ bg: newActionItem.owner === "supervisee" ? "#263A33" : "rgba(86, 117, 109, 0.08)" }}
                      onClick={() => setNewActionItem((prev) => ({ ...prev, owner: "supervisee" }))}
                    >
                      Assign to Supervisee
                    </Button>
                    <Button
                      size="sm"
                      variant={newActionItem.owner === "supervisor" ? "solid" : "outline"}
                      bg={newActionItem.owner === "supervisor" ? "#56756D" : "transparent"}
                      color={newActionItem.owner === "supervisor" ? "white" : "#263A33"}
                      borderColor="rgba(86, 117, 109, 0.25)"
                      borderRadius="full"
                      h="32px"
                      fontSize="12px"
                      fontWeight="600"
                      _hover={{ bg: newActionItem.owner === "supervisor" ? "#263A33" : "rgba(86, 117, 109, 0.08)" }}
                      onClick={() => setNewActionItem((prev) => ({ ...prev, owner: "supervisor" }))}
                    >
                      Assign to Me
                    </Button>
                  </Flex>

                  <ModernDatePicker
                    value={newActionItem.due_date}
                    onChange={(val) => setNewActionItem((prev) => ({ ...prev, due_date: val }))}
                    placeholder="Due date (optional)"
                    h="36px"
                    fontSize="12.5px"
                    borderRadius="xl"
                  />

                  <Button
                    size="sm"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="36px"
                    fontSize="13px"
                    fontWeight="600"
                    onClick={handleCreateActionItem}
                    isLoading={savingActionItem}
                    _hover={{ bg: "#263A33" }}
                    w="fit-content"
                  >
                    Add Action Item
                  </Button>

                  <VStack align="stretch" spacing={2} pt={2}>
                    {actionItems
                      .filter((a) => a.relationship === selectedSupervisee.id)
                      .slice(0, 8)
                      .map((a) => (
                        <HStack
                          key={a.id}
                          justify="space-between"
                          p={3}
                          borderRadius="xl"
                          bg="rgba(250, 248, 245, 0.85)"
                          border="1px solid"
                          borderColor="rgba(86, 117, 109, 0.1)"
                        >
                          <Text fontSize="13px" color="#263A33" fontWeight="500">{a.title}</Text>
                          <Badge
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="10.5px"
                            fontWeight="700"
                            bg={a.status === "done" ? "#ECFDF5" : "#FFFBEB"}
                            color={a.status === "done" ? "#065F46" : "#92400E"}
                          >
                            {a.status}
                          </Badge>
                        </HStack>
                      ))}
                  </VStack>
                </VStack>
              </Box>

              {/* Relationship Timeline Card */}
              <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={4}>
                  <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                    Relationship Timeline
                  </Heading>
                  <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" borderRadius="full" px={2.5} py={0.5} fontSize="11px" fontWeight="700">
                    {timeline.length}
                  </Badge>
                </HStack>
                {timeline.length === 0 ? (
                  <Text fontSize="13px" color="#5A6E65">No timeline events recorded yet.</Text>
                ) : (
                  <VStack align="stretch" spacing={2.5}>
                    {timeline.slice(0, 12).map((item) => (
                      <Box
                        key={`${item.type}-${item.id}`}
                        p={3.5}
                        borderRadius="xl"
                        bg="rgba(250, 248, 245, 0.85)"
                        border="1px solid"
                        borderColor="rgba(86, 117, 109, 0.1)"
                      >
                        <Text fontSize="11px" color="#718096" mb={0.5}>
                          {new Date(item.created_at).toLocaleString()} · {item.type.replace("_", " ")}
                        </Text>
                        <Text fontSize="13px" fontWeight="600" color="#263A33">{item.title}</Text>
                        {item.summary && <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>{item.summary}</Text>}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Supervision Sessions Card */}
              <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={4}>
                  <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                    Supervision Sessions
                  </Heading>
                  <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" borderRadius="full" px={2.5} py={0.5} fontSize="11px" fontWeight="700">
                    {selectedSessions.length} Sessions
                  </Badge>
                </HStack>

                {selectedSessions.length === 0 ? (
                  <Text fontSize="13px" color="#5A6E65">No supervision sessions mapped yet for this supervisee.</Text>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr borderBottom="1px solid rgba(86, 117, 109, 0.14)">
                          <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">Supervisee</Th>
                          <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">Session</Th>
                          <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">Status</Th>
                          <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">Payment</Th>
                          <Th color="#718096" fontSize="10.5px" fontWeight="700" letterSpacing="0.05em">Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedSessions.map((s) => (
                          <Tr key={`${s.relationship_id}-${s.note_id}`} _hover={{ bg: "rgba(250, 248, 245, 0.5)" }}>
                            <Td fontSize="13px" fontWeight="500" color="#263A33">{s.supervisee_name}</Td>
                            <Td fontSize="12.5px" color="#5A6E65">{s.start_time ? new Date(s.start_time).toLocaleString() : "Not scheduled"}</Td>
                            <Td>
                              <Badge
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="10px"
                                fontWeight="700"
                                bg={s.status === "completed" ? "#ECFDF5" : s.status === "cancelled" ? "#FEF2F2" : "#FFFBEB"}
                                color={s.status === "completed" ? "#065F46" : s.status === "cancelled" ? "#991B1B" : "#92400E"}
                              >
                                {s.status_label || s.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="10px"
                                fontWeight="700"
                                bg={s.payment_status === "paid" ? "#ECFDF5" : "#FFFBEB"}
                                color={s.payment_status === "paid" ? "#065F46" : "#92400E"}
                              >
                                {s.payment_status === "paid" ? "Paid" : "Pending"}
                              </Badge>
                            </Td>
                            <Td>
                              {s.meeting_link ? (
                                <Button
                                  as="a"
                                  href={s.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="xs"
                                  variant="outline"
                                  borderColor="rgba(86, 117, 109, 0.3)"
                                  color="#263A33"
                                  borderRadius="full"
                                  h="26px"
                                  px={3}
                                  _hover={{ bg: "#56756D", color: "white", borderColor: "#56756D" }}
                                >
                                  Join
                                </Button>
                              ) : (
                                <Text fontSize="12px" color="#A0AEC0">Not assigned</Text>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>

              {/* Supervision Notes Card */}
              <Box bg="white" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
                <HStack justify="space-between" mb={4}>
                  <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                    Supervision Notes
                  </Heading>
                  <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" borderRadius="full" px={2.5} py={0.5} fontSize="11px" fontWeight="700">
                    {selectedNotes.length} Notes
                  </Badge>
                </HStack>

                {selectedNotes.length === 0 ? (
                  <Text fontSize="13px" color="#5A6E65">No notes recorded yet.</Text>
                ) : (
                  <VStack align="stretch" spacing={2.5}>
                    {selectedNotes.slice(0, 8).map((n) => (
                      <Box
                        key={n.id}
                        p={3.5}
                        borderRadius="xl"
                        bg="rgba(250, 248, 245, 0.85)"
                        border="1px solid"
                        borderColor="rgba(86, 117, 109, 0.1)"
                      >
                        <Text fontSize="11px" color="#718096" mb={1}>{new Date(n.created_at).toLocaleString()}</Text>
                        <Text fontSize="13px" color="#263A33" lineHeight="1.5">
                          {String(n.content || "").length > 220 ? `${String(n.content).slice(0, 220)}...` : n.content}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Clinical Case Vault Card */}
              <Box
                bg="linear-gradient(135deg, rgba(86, 117, 109, 0.06) 0%, rgba(250, 248, 245, 0.9) 100%)"
                p={5}
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
              >
                <HStack spacing={3} mb={2.5}>
                  <Circle size="34px" bg="rgba(86, 117, 109, 0.15)" color="#56756D">
                    <Icon as={FiBook} boxSize="16px" />
                  </Circle>
                  <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                    Clinical Case Vault
                  </Heading>
                </HStack>
                <Text fontSize="13px" color="#5A6E65" mb={4} lineHeight="1.5">
                  Shared secure area for formulations, clinical reviews, and professional development resources. 
                  Only you and {selectedSupervisee.supervisee_name} have access.
                </Text>
                <Button
                  variant="link"
                  color="#56756D"
                  rightIcon={<FiClock />}
                  fontSize="12.5px"
                  fontWeight="600"
                  _hover={{ color: "#263A33" }}
                >
                  View Version History
                </Button>
              </Box>
            </VStack>
          ) : (
            <Box
              bg="white"
              p={{ base: 8, md: 12 }}
              borderRadius="2xl"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.14)"
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              textAlign="center"
            >
              <Circle size="56px" bg="rgba(86, 117, 109, 0.08)" color="#56756D" mx="auto" mb={3.5}>
                <Icon as={FiUsers} boxSize="24px" />
              </Circle>
              <Heading as="h3" fontSize="17px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33" letterSpacing="-0.015em" mb={2}>
                Select a Supervisee
              </Heading>
              <Text fontSize="13px" color="#5A6E65" maxW="420px" mx="auto" lineHeight="1.6" mb={5}>
                Select a practitioner from your caseload to view their mentorship records, clinical case vault, and action items.
              </Text>
              {superviseeCards.length === 0 && (
                <Button
                  as={NextLink}
                  href="/dashboard/therapist/supervision/availability"
                  leftIcon={<FiCalendar />}
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  h="38px"
                  fontSize="13px"
                  fontWeight="600"
                  px={5}
                  _hover={{ bg: "#263A33" }}
                >
                  Manage Mentorship Hours
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Grid>

      {/* ✍️ New Supervision Note Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" bg="rgba(0, 0, 0, 0.4)" />
        <ModalContent borderRadius="2xl" p={2} fontFamily="'Inter', var(--font-inter), sans-serif">
          <ModalHeader pb={2}>
            <VStack align="start" spacing={1}>
              <Badge bg="rgba(86, 117, 109, 0.1)" color="#263A33" fontSize="10px" fontWeight="700" borderRadius="full" px={2.5} py={0.5} letterSpacing="0.06em" textTransform="uppercase">
                New Supervision Note
              </Badge>
              <Heading as="h3" fontSize="18px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">
                Session with {selectedSupervisee?.supervisee_name}
              </Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3.5}>
              <Text fontSize="12.5px" color="#5A6E65">
                These notes are end-to-end encrypted and visible ONLY to you. 
                They are not shared with the supervisee unless explicitly exported.
              </Text>
              <Textarea 
                placeholder="Clinical formulation, counter-transference patterns, ethical reviews..." 
                minH="180px" 
                borderRadius="xl"
                fontSize="13px"
                bg="rgba(250, 248, 245, 0.6)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: "0 0 0 1px #56756D" }}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Textarea
                placeholder="Session agenda"
                value={noteAgenda}
                onChange={(e) => setNoteAgenda(e.target.value)}
                fontSize="13px"
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.6)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: "0 0 0 1px #56756D" }}
                rows={2}
              />
              <Textarea
                placeholder="Case formulation"
                value={noteFormulation}
                onChange={(e) => setNoteFormulation(e.target.value)}
                fontSize="13px"
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.6)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: "0 0 0 1px #56756D" }}
                rows={2}
              />
              <Textarea
                placeholder="Next steps and homework"
                value={noteNextSteps}
                onChange={(e) => setNoteNextSteps(e.target.value)}
                fontSize="13px"
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.6)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.2)"
                _focus={{ bg: 'white', borderColor: '#56756D', boxShadow: "0 0 0 1px #56756D" }}
                rows={2}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="full" h="36px" fontSize="13px" color="#5A6E65">
              Discard
            </Button>
            <Button
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="36px"
              fontSize="13px"
              fontWeight="600"
              px={6}
              leftIcon={<FiCheckCircle />}
              onClick={handleCreateNote}
              isLoading={savingNote}
              _hover={{ bg: "#263A33" }}
            >
              Seal Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
