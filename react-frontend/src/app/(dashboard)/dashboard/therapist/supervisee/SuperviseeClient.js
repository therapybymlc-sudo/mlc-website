'use client'

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Textarea,
  Button,
  Icon,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import { FiEdit3, FiDownload, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import { apiGet, apiPost } from "../../../../../api.js";
import api from "../../../../../api.js";

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function SuperviseeClient() {
  const toast = useToast();
  const { therapistProfile } = useAuth();
  const [note, setNote] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [actionItems, setActionItems] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [reflectionDraft, setReflectionDraft] = useState({
    relationship: "",
    reflection_type: "post_session",
    goals: "",
    discussion_points: "",
    takeaways: "",
    confidence_score: 5,
  });
  const [savingReflection, setSavingReflection] = useState(false);
  const years = Number(therapistProfile?.years_experience || 0);

  const todayLabel = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isNotFound = (err) => err?.response?.status === 404;

  const optionalListGet = async (path) => {
    try {
      const res = await api.get(path.endsWith("/") ? path : `${path}/`);
      return Array.isArray(res.data) ? res.data : res.data?.results || [];
    } catch (err) {
      if (isNotFound(err)) return [];
      throw err;
    }
  };

  const handleExport = () => {
    const content = (note || "").trim();
    if (!content) {
      toast({
        status: "warning",
        title: "No notes yet",
        description: "Write something first, then export your supervision note.",
      });
      return;
    }
    downloadTextFile(`mlc-supervisee-note-${todayLabel}.txt`, content);
    toast({
      status: "success",
      title: "Note exported",
      description: "Your supervision note was downloaded as a text file.",
    });
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const [sessionData, actionData, reflectionData] = await Promise.all([
          apiGet("supervisory-relationships/my-supervisee-sessions/"),
          optionalListGet("supervision-action-items"),
          optionalListGet("supervision-reflections"),
        ]);
        const data = sessionData;
        setSessions(Array.isArray(data) ? data : []);
        setActionItems(Array.isArray(actionData) ? actionData : []);
        setReflections(Array.isArray(reflectionData) ? reflectionData : []);
        const firstRelationshipId = Array.isArray(data) && data[0]?.relationship_id;
        if (firstRelationshipId) {
          setReflectionDraft((prev) => ({ ...prev, relationship: firstRelationshipId }));
        }
      } catch (err) {
        toast({
          status: "error",
          title: "Could not load supervision sessions",
          description: "Please refresh and try again.",
        });
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, [toast]);

  const handleSubmitReflection = async () => {
    if (!reflectionDraft.relationship) {
      toast({ status: "warning", title: "No supervision relationship found for reflection." });
      return;
    }
    setSavingReflection(true);
    try {
      await apiPost("supervision-reflections/", reflectionDraft);
      setReflectionDraft((prev) => ({
        ...prev,
        goals: "",
        discussion_points: "",
        takeaways: "",
        confidence_score: 5,
      }));
      const reflectionData = await optionalListGet("supervision-reflections");
      setReflections(Array.isArray(reflectionData) ? reflectionData : []);
      toast({ status: "success", title: "Reflection submitted" });
    } catch (err) {
      if (isNotFound(err)) {
        toast({
          status: "info",
          title: "Reflections module coming soon",
          description: "Your account can use this once the latest supervision APIs are deployed.",
        });
        return;
      }
      toast({ status: "error", title: "Could not submit reflection" });
    } finally {
      setSavingReflection(false);
    }
  };

  return (
    <Box pb={20}>
      <VStack align="stretch" spacing={8}>
        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.100">
          <VStack align="start" spacing={3}>
            <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
              SUPERVISEE SUITE
            </Badge>
            <Heading size="lg" color="mlc.greenDark">
              Supervision Notes Workspace
            </Heading>
            <Text color="gray.600">
              You currently have {years} years of experience. The Supervisor Suite unlocks at 5+ years.
              Until then, use this space to capture supervision reflections, session learnings, and action points.
            </Text>
          </VStack>
        </Box>

        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="mlc.greenDark">
              My Action Items
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={3}>
              {actionItems.length} Items
            </Badge>
          </HStack>
          {actionItems.length === 0 ? (
            <Text color="gray.500" fontSize="sm">No assigned action items yet.</Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Task</Th>
                    <Th>Owner</Th>
                    <Th>Status</Th>
                    <Th>Due</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {actionItems.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.title}</Td>
                      <Td textTransform="capitalize">{item.owner}</Td>
                      <Td>
                        <Badge colorScheme={item.status === "done" ? "green" : item.status === "in_progress" ? "orange" : "gray"} borderRadius="full">
                          {item.status}
                        </Badge>
                      </Td>
                      <Td>{item.due_date || "—"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.100">
          <Heading size="sm" color="mlc.greenDark" mb={4}>Pre / Post Session Reflection</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack gap={3} wrap="wrap">
              <Button
                size="sm"
                borderRadius="full"
                variant={reflectionDraft.reflection_type === "pre_session" ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => setReflectionDraft((prev) => ({ ...prev, reflection_type: "pre_session" }))}
              >
                Pre-session
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                variant={reflectionDraft.reflection_type === "post_session" ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => setReflectionDraft((prev) => ({ ...prev, reflection_type: "post_session" }))}
              >
                Post-session
              </Button>
            </HStack>
            <Textarea placeholder="Goals for this supervision session" value={reflectionDraft.goals} onChange={(e) => setReflectionDraft((prev) => ({ ...prev, goals: e.target.value }))} />
            <Textarea placeholder="Discussion points" value={reflectionDraft.discussion_points} onChange={(e) => setReflectionDraft((prev) => ({ ...prev, discussion_points: e.target.value }))} />
            <Textarea placeholder="Takeaways and applications" value={reflectionDraft.takeaways} onChange={(e) => setReflectionDraft((prev) => ({ ...prev, takeaways: e.target.value }))} />
            <Button onClick={handleSubmitReflection} colorScheme="teal" borderRadius="full" size="sm" isLoading={savingReflection}>
              Submit Reflection
            </Button>
            <Text fontSize="xs" color="gray.500">Recent reflections: {reflections.length}</Text>
          </VStack>
        </Box>

        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={4} wrap="wrap" gap={3}>
            <HStack spacing={3}>
              <Icon as={FiEdit3} color="mlc.green" />
              <Heading size="sm" color="mlc.greenDark">
                My Supervision Note
              </Heading>
            </HStack>
            <Button leftIcon={<FiDownload />} onClick={handleExport} borderRadius="full" size="sm" colorScheme="teal">
              Export Note
            </Button>
          </HStack>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minH="320px"
            placeholder="Write your supervision reflections, case discussions, ethical questions, and follow-up plans here..."
            borderRadius="2xl"
            bg="gray.50"
            _focus={{ bg: "white", borderColor: "mlc.green" }}
          />
          <Text mt={3} fontSize="xs" color="gray.500">
            This workspace does not auto-save in localStorage. Export your note when ready.
          </Text>
        </Box>

        <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="mlc.greenDark">
              My Supervision Sessions
            </Heading>
            <Badge colorScheme="teal" borderRadius="full" px={3}>
              {sessions.length} Sessions
            </Badge>
          </HStack>

          {loadingSessions ? (
            <HStack py={6}>
              <Spinner size="sm" color="mlc.green" />
              <Text color="gray.500" fontSize="sm">
                Loading session history...
              </Text>
            </HStack>
          ) : sessions.length === 0 ? (
            <Text color="gray.500" fontSize="sm">
              No supervision sessions yet. Once sessions are scheduled with your supervisor, they will appear here.
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Supervisor</Th>
                    <Th>Session</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th>Session Link</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sessions.map((session) => {
                    const when = session.start_time ? new Date(session.start_time).toLocaleString() : "Not scheduled";
                    return (
                      <Tr key={`${session.relationship_id}-${session.note_id}`}>
                        <Td>{session.supervisor_name || "Supervisor"}</Td>
                        <Td>{when}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              session.status === "completed"
                                ? "green"
                                : session.status === "cancelled"
                                  ? "red"
                                  : "orange"
                            }
                            borderRadius="full"
                          >
                            {session.status_label || session.status || "scheduled"}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={session.payment_status === "paid" ? "green" : "yellow"} borderRadius="full">
                            {session.payment_status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </Td>
                        <Td>
                          {session.meeting_link ? (
                            <Button
                              as="a"
                              href={session.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="xs"
                              colorScheme="teal"
                              variant="outline"
                              borderRadius="full"
                            >
                              Join
                            </Button>
                          ) : (
                            <Text fontSize="xs" color="gray.500">
                              Not assigned
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" border="1px dashed" borderColor="purple.200">
          <HStack spacing={3} mb={2}>
            <Icon as={FiBookOpen} color="purple.500" />
            <Text fontWeight="700" color="purple.700">
              Path to Supervisor Suite
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Once your recorded experience reaches 5+ years, the dashboard will automatically show the full
            Supervision Hub in your sidebar.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
