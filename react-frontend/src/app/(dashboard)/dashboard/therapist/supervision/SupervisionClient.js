'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, 
  Avatar, Badge, Divider, Flex, useToast, Spinner, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Textarea, IconButton
} from "@chakra-ui/react";
import { FiUsers, FiFileText, FiUploadCloud, FiBook, FiCheckCircle, FiClock, FiPlus, FiCalendar } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";
import NextLink from "next/link";

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

  if (!isMounted) return null;

  if (loading) return (
    <Container maxW="container.xl" py={20} centerContent>
      <Spinner size="xl" color="mlc.green" thickness="4px" />
      <Text mt={4} color="gray.500">Syncing mentorship portfolio...</Text>
    </Container>
  );

  return (
    <Box pb={20}>
      <VStack align="stretch" spacing={10}>
        {/* 🌿 Headers */}
        <HStack justify="space-between" align="end" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Badge bg="mlc.gold" color="white" px={3} py={1} borderRadius="full" fontSize="2xs">ACTIVE SUPERVISOR</Badge>
            <Heading size="xl" color="mlc.greenDark">Clinical Supervision Suite</Heading>
            <Text color="gray.500">Manage your mentorship caseload and private session records.</Text>
          </VStack>
          <Button 
            as={NextLink} 
            href="/dashboard/therapist/supervision/availability" 
            leftIcon={<FiCalendar />} 
            variant="outline" 
            borderColor="mlc.green" 
            color="mlc.green" 
            borderRadius="full"
            _hover={{ bg: 'mlc.green', color: 'white' }}
          >
            Manage Mentorship Hours
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}>
          {/* 👥 Supervisee Caseload (Responsive Column) */}
          <VStack align="stretch" spacing={4} gridColumn={{ lg: "span 1" }}>
            <HStack justify="space-between">
              <Heading size="sm" color="gray.700">Practitioners</Heading>
              <Badge colorScheme="teal" borderRadius="full" px={3}>{superviseeCards.length}</Badge>
            </HStack>
            
            {superviseeCards.length > 0 ? superviseeCards.map((rel) => (
              <Box 
                key={rel.id} 
                p={4} 
                bg={selectedSupervisee?.id === rel.id ? "teal.50" : "white"}
                borderRadius="2xl" 
                border="1px solid" 
                borderColor={selectedSupervisee?.id === rel.id ? "mlc.green" : "gray.100"}
                cursor="pointer"
                onClick={() => setSelectedSupervisee(rel)}
                transition="all 0.2s"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
              >
                <HStack spacing={4}>
                  <Avatar size="md" name={rel.supervisee_name} border="2px solid white" shadow="sm" />
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontWeight="700" color="mlc.greenDark" noOfLines={1}>{rel.supervisee_name}</Text>
                    <Text fontSize="xs" color="gray.500">{rel.supervisee_title || 'Practitioner'}</Text>
                  </VStack>
                  <Icon as={FiCheckCircle} color={rel.status === 'active' ? "green.400" : "gray.300"} />
                </HStack>
              </Box>
            )) : (
              <Box p={8} bg="gray.50" borderRadius="2rem" textAlign="center" border="1px dashed" borderColor="gray.200">
                <Icon as={FiUsers} boxSize={8} color="gray.300" mb={2} />
                <Text fontSize="sm" color="gray.500">No active supervisees yet.</Text>
              </Box>
            )}
          </VStack>

          {/* 📝 Note Engine & Vault (Dynamic Grid) */}
          <Box gridColumn={{ lg: "span 2" }}>
            {selectedSupervisee ? (
              <VStack align="stretch" spacing={8}>
                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={8} wrap="wrap" gap={4}>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="mlc.greenDark">{selectedSupervisee.supervisee_name}</Heading>
                      <Text fontSize="sm" color="gray.500">Active Supervisory Relationship</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button leftIcon={<FiPlus />} bg="mlc.green" color="white" borderRadius="full" size="sm" onClick={onOpen}>New Note</Button>
                      <Button leftIcon={<FiUploadCloud />} variant="outline" borderColor="mlc.green" color="mlc.green" borderRadius="full" size="sm">Vault</Button>
                    </HStack>
                  </HStack>

                  <Divider mb={8} />

                  <VStack align="stretch" spacing={6}>
                    <Heading size="xs" color="gray.400" textTransform="uppercase" letterSpacing="widest">
                      Supervisee Profile
                    </Heading>
                    <Text fontSize="sm" color="gray.700" fontWeight="600">
                      {selectedSupervisee.supervisee_title || "Practitioner"}
                    </Text>
                    {selectedSupervisee.supervisee_email && (
                      <Text fontSize="sm" color="gray.600">{selectedSupervisee.supervisee_email}</Text>
                    )}
                    {selectedSupervisee.supervisee_bio && (
                      <Text fontSize="sm" color="gray.600">
                        {selectedSupervisee.supervisee_bio}
                      </Text>
                    )}
                  </VStack>
                </Box>

                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={5}>
                    <Heading size="sm" color="mlc.greenDark">Action Items</Heading>
                    <Badge colorScheme="purple" borderRadius="full" px={3}>
                      {actionItems.filter((a) => a.relationship === selectedSupervisee.id).length}
                    </Badge>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    <Textarea
                      minH="70px"
                      placeholder="Add a concrete next step..."
                      value={newActionItem.title}
                      onChange={(e) => setNewActionItem((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <HStack>
                      <Button
                        size="sm"
                        variant={newActionItem.owner === "supervisee" ? "solid" : "outline"}
                        colorScheme="teal"
                        borderRadius="full"
                        onClick={() => setNewActionItem((prev) => ({ ...prev, owner: "supervisee" }))}
                      >
                        Assign to Supervisee
                      </Button>
                      <Button
                        size="sm"
                        variant={newActionItem.owner === "supervisor" ? "solid" : "outline"}
                        colorScheme="teal"
                        borderRadius="full"
                        onClick={() => setNewActionItem((prev) => ({ ...prev, owner: "supervisor" }))}
                      >
                        Assign to Me
                      </Button>
                    </HStack>
                    <input
                      type="date"
                      value={newActionItem.due_date}
                      onChange={(e) => setNewActionItem((prev) => ({ ...prev, due_date: e.target.value }))}
                      style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #E2E8F0" }}
                    />
                    <Button size="sm" colorScheme="teal" borderRadius="full" onClick={handleCreateActionItem} isLoading={savingActionItem}>
                      Add Action Item
                    </Button>
                    <VStack align="stretch" spacing={2}>
                      {actionItems
                        .filter((a) => a.relationship === selectedSupervisee.id)
                        .slice(0, 8)
                        .map((a) => (
                          <HStack key={a.id} justify="space-between" p={3} borderRadius="xl" bg="gray.50">
                            <Text fontSize="sm" color="gray.700">{a.title}</Text>
                            <Badge borderRadius="full" colorScheme={a.status === "done" ? "green" : "orange"}>{a.status}</Badge>
                          </HStack>
                        ))}
                    </VStack>
                  </VStack>
                </Box>

                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={5}>
                    <Heading size="sm" color="mlc.greenDark">Relationship Timeline</Heading>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>{timeline.length}</Badge>
                  </HStack>
                  {timeline.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">No timeline events yet.</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {timeline.slice(0, 12).map((item) => (
                        <Box key={`${item.type}-${item.id}`} p={3} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
                          <Text fontSize="xs" color="gray.500">
                            {new Date(item.created_at).toLocaleString()} · {item.type.replace("_", " ")}
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color="gray.700">{item.title}</Text>
                          <Text fontSize="sm" color="gray.600">{item.summary}</Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>

                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={5}>
                    <Heading size="sm" color="mlc.greenDark">Supervision Sessions</Heading>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>{selectedSessions.length} Sessions</Badge>
                  </HStack>

                  {selectedSessions.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">No supervision sessions mapped yet for this supervisee.</Text>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Supervisee</Th>
                            <Th>Session</Th>
                            <Th>Status</Th>
                            <Th>Payment</Th>
                            <Th>Session Link</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedSessions.map((s) => (
                            <Tr key={`${s.relationship_id}-${s.note_id}`}>
                              <Td>
                                <Button variant="link" color="teal.700" onClick={() => setSelectedSupervisee({ ...selectedSupervisee, id: s.relationship_id })}>
                                  {s.supervisee_name}
                                </Button>
                              </Td>
                              <Td>{s.start_time ? new Date(s.start_time).toLocaleString() : "Not scheduled"}</Td>
                              <Td>
                                <Badge colorScheme={s.status === "completed" ? "green" : s.status === "cancelled" ? "red" : "orange"} borderRadius="full">
                                  {s.status_label || s.status}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={s.payment_status === "paid" ? "green" : "yellow"} borderRadius="full">
                                  {s.payment_status === "paid" ? "Paid" : "Pending"}
                                </Badge>
                              </Td>
                              <Td>
                                {s.meeting_link ? (
                                  <Button as="a" href={s.meeting_link} target="_blank" rel="noopener noreferrer" size="xs" colorScheme="teal" variant="outline" borderRadius="full">
                                    Join
                                  </Button>
                                ) : (
                                  <Text fontSize="xs" color="gray.500">Not assigned</Text>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>

                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={5}>
                    <Heading size="sm" color="mlc.greenDark">Supervision Notes</Heading>
                    <Badge colorScheme="purple" borderRadius="full" px={3}>{selectedNotes.length} Notes</Badge>
                  </HStack>
                    
                  {selectedNotes.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">No notes recorded yet.</Text>
                  ) : (
                    <VStack align="stretch" spacing={3}>
                      {selectedNotes.slice(0, 8).map((n) => (
                        <Box key={n.id} p={4} borderRadius="xl" bg="gray.50" border="1px solid" borderColor="gray.100">
                          <Text fontSize="xs" color="gray.500" mb={1}>{new Date(n.created_at).toLocaleString()}</Text>
                          <Text fontSize="sm" color="gray.700">
                            {String(n.content || "").length > 220 ? `${String(n.content).slice(0, 220)}...` : n.content}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* 🛡️ Secure Shared Vault Preview */}
                <Box bg="#F9FBFA" p={8} borderRadius="3xl" border="1px dashed" borderColor="mlc.green">
                   <HStack spacing={4} mb={4}>
                      <Icon as={FiBook} boxSize={6} color="mlc.green" />
                      <Heading size="sm" color="mlc.greenDark">Clinical Case Vault</Heading>
                   </HStack>
                   <Text fontSize="sm" color="gray.600" mb={6}>
                      Shared secure area for formulations, clinical reviews, and professional development resources. 
                      Only you and {selectedSupervisee.supervisee_name} have access.
                   </Text>
                   <Button variant="link" color="mlc.green" rightIcon={<FiClock />} fontSize="xs">View Version History</Button>
                </Box>
              </VStack>
            ) : (
                <Flex direction="column" align="center" justify="center" h="400px" bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" p={10} textAlign="center">
                  <Icon as={FiUsers} boxSize={12} color="gray.200" mb={4} />
                  <Heading size="md" color="gray.400">Select a Supervisee</Heading>
                  <Text color="gray.400" maxW="sm" mt={2}>Select a practitioner from your caseload to view their mentorship records and secure vault.</Text>
                </Flex>
            )}
          </Box>
        </SimpleGrid>
      </VStack>

      {/* ✍️ New Supervision Note Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="bold" color="mlc.gold">NEW SUPERVISION NOTE</Text>
              <Heading size="md" color="mlc.greenDark">Session with {selectedSupervisee?.supervisee_name}</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                These notes are end-to-end encrypted and visible ONLY to you. 
                They are not shared with the supervisee unless explicitly exported.
              </Text>
              <Textarea 
                placeholder="Clinical formulation, counter-transference patterns, ethical reviews..." 
                minH="300px" 
                borderRadius="2xl"
                variant="filled"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: 'mlc.green' }}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Textarea
                placeholder="Session agenda"
                value={noteAgenda}
                onChange={(e) => setNoteAgenda(e.target.value)}
              />
              <Textarea
                placeholder="Case formulation"
                value={noteFormulation}
                onChange={(e) => setNoteFormulation(e.target.value)}
              />
              <Textarea
                placeholder="Next steps and homework"
                value={noteNextSteps}
                onChange={(e) => setNoteNextSteps(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="full">Discard</Button>
            <Button
              bg="mlc.green"
              color="white"
              borderRadius="full"
              px={8}
              leftIcon={<FiCheckCircle />}
              onClick={handleCreateNote}
              isLoading={savingNote}
            >
              Seal Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {reminders.length > 0 && (
        <Box mt={8} p={5} borderRadius="2xl" border="1px solid" borderColor="orange.200" bg="orange.50">
          <Heading size="xs" color="orange.800" mb={2}>Upcoming Supervision Reminders</Heading>
          <VStack align="stretch" spacing={2}>
            {reminders.slice(0, 5).map((r) => (
              <Text key={r.id} fontSize="sm" color="orange.800">
                • {r.title} {r.due_date ? `(due ${r.due_date})` : ""}
              </Text>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
