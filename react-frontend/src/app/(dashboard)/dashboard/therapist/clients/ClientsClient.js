'use client'

import {
  Box, Heading, Text, Input, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner, SimpleGrid, FormControl, FormLabel, Badge, Divider, Icon, Stack, Grid, GridItem, Progress, Flex, Avatar, Center, Select, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Link, Collapse, Circle, InputGroup, InputLeftElement, InputRightElement, IconButton,
  Menu, MenuButton, MenuList, MenuItem,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { FiArrowLeft, FiUser, FiActivity, FiShield, FiClipboard, FiFileText, FiCalendar, FiCreditCard, FiClock, FiEdit3, FiPaperclip, FiSearch, FiSave, FiX, FiCheckCircle, FiDownload, FiUsers, FiArchive, FiUserPlus, FiArrowRight, FiChevronDown, FiCheck } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { apiDelete, apiGet, apiGetBlob, apiPatch, apiPost, apiPut, apiUpload } from "../../../../../api.js";
import { resourcesApi } from "../../../../../api/resources.js";
import { useRouter, useSearchParams } from "next/navigation";
import { exportAllClientNotes, exportNoteToPDF } from "../../../../../utils/ClinicalPDFService.js";
import ModernDatePicker from "../../../../../components/ModernDatePicker";

const initialClient = {
  name: "",
  title: "",
  first_name: "",
  last_name: "",
  preferred_first_name: "",
  date_of_birth: "",
  sex: "",
  gender_identity: "",
  pronouns: [],
  extra_information: "",
  email: "",
  phone_number: "",
  phone_type: "Mobile",
  address_line1: "",
  address_line2: "",
  address_line3: "",
  city: "",
  state: "",
  post_code: "",
  country: "Kuwait",
  time_zone: "Use account time zone",
  appointment_notes: "",
  privacy_policy_status: "no_response",
  related_clients: [],
  reminder_sms: false,
  reminder_email: false,
  followup_sms: false,
  followup_email: false,
  marketing_sms: false,
  marketing_email: false,
  receive_booking_confirmation: false,
  receive_booking_cancellation: false,
  concession_type: "None",
  invoice_to: "",
  invoice_email_to: "",
  invoice_extra_information: "",
  occupation: "",
  emergency_contact: "",
  medicare_number: "",
  reference_number: "",
  referring_doctor: "",
  referral_type: "None",
  nationality: "",
  civil_id_number: "",
  client_file_number: "",
  terminated_client: false,
  termination_reasons: [],
  termination_notes: "",
};

export default function ClientsClient() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Mission Context from Schedule
  const missionClientId = searchParams.get("id");
  const missionSection = searchParams.get("section");
  const missionApptId = searchParams.get("appointmentId");
  const missionTypeId = searchParams.get("eventTypeId");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list, add, detail
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState(initialClient);
  const [editClient, setEditClient] = useState(initialClient);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("details"); // details, notes, files, appointments
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // all, active, archived
  const [clientNotes, setClientNotes] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [clientFormAssignments, setClientFormAssignments] = useState([]);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [assigningFormType, setAssigningFormType] = useState("");
  const [regeneratingFormId, setRegeneratingFormId] = useState(null);
  const [assessmentCatalog, setAssessmentCatalog] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [showTerminatedDrawer, setShowTerminatedDrawer] = useState(false);
  const [showArchivedFiles, setShowArchivedFiles] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [relationshipTransitioning, setRelationshipTransitioning] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const uploadInputRef = useRef(null);
  const toast = useToast();

  const resolveFileUrl = (filePath) => {
    if (!filePath) return "";
    if (/^https?:\/\//i.test(filePath)) return filePath;
    const apiBase = (
      (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE : null) ||
      "http://localhost:8000/api"
    ).replace(/\/+$/, "");
    const apiOrigin = apiBase.replace(/\/api\/?$/, "");

    // Handle values returned as "/media/...", "client_files/...", or bare filename.
    if (filePath.startsWith("/media/")) {
      return `${apiOrigin}${filePath}`;
    }
    if (filePath.startsWith("client_files/")) {
      return `${apiOrigin}/media/${filePath}`;
    }
    if (!filePath.startsWith("/")) {
      return `${apiOrigin}/media/client_files/${filePath}`;
    }
    return `${apiOrigin}${filePath}`;
  };

  const resolveApiPath = (urlOrPath) => {
    if (!urlOrPath) return "";
    if (/^https?:\/\//i.test(urlOrPath)) {
      try {
        const parsed = new URL(urlOrPath);
        urlOrPath = `${parsed.pathname}${parsed.search || ""}`;
      } catch (_e) {
        return "";
      }
    }
    if (urlOrPath.startsWith("/api/")) return urlOrPath.slice(5);
    if (urlOrPath.startsWith("api/")) return urlOrPath.slice(4);
    if (urlOrPath.startsWith("/")) return urlOrPath.slice(1);
    return urlOrPath;
  };

  const openFileWithAuth = async (file) => {
    const apiPath = resolveApiPath(file?.download_url);
    try {
      if (apiPath) {
        const blob = await apiGetBlob(apiPath);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        return;
      }
      // Fallback for non-API hosted files.
      const fallbackUrl = resolveFileUrl(file?.file_url || file?.file);
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      }
    } catch (_e) {
      toast({ title: "Could not open file", status: "error" });
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiGet("clients/");
      setClients(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      toast({ title: "Error fetching clients", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFullClientDetails = async (clientId) => {
    try {
      setFetchingDetails(true);
      const [c, n, f, a, t, formAssignments] = await Promise.all([
        apiGet(`clients/${clientId}/`),
        apiGet(`notes/?client=${clientId}`),
        apiGet(`files/?client=${clientId}&include_archived=1`),
        apiGet(`appointments/?client=${clientId}`),
        apiGet("note-templates/"),
        apiGet(`client-form-assignments/?client=${clientId}`).catch(() => []),
      ]);
      setSelectedClient(c);
      setEditClient(c);
      setClientNotes(Array.isArray(n) ? n : n.results || []);
      setClientFiles(Array.isArray(f) ? f : f.results || []);
      setClientAppointments(Array.isArray(a) ? a : a.results || []);
      setNoteTemplates(Array.isArray(t) ? t : t.results || []);
      setClientFormAssignments(Array.isArray(formAssignments) ? formAssignments : formAssignments.results || []);
    } catch (e) {
      toast({ title: "Error loading client file", status: "error" });
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchClients();
    resourcesApi
      .listAssessmentCatalog()
      .then((payload) => {
        const list = payload?.assessments || [];
        setAssessmentCatalog(list);
        if (list[0]?.id) setSelectedAssessmentId(list[0].id);
      })
      .catch(() => {
        setAssessmentCatalog([]);
      });
  }, []);

  useEffect(() => {
    if (mounted && missionClientId && clients.length > 0) {
      const client = clients.find(c => String(c.id) === String(missionClientId));
      if (client) {
        setSelectedClient(client);
        setViewMode("detail");
        if (missionSection) setActiveSection(missionSection);
        
        // If we have an appointment documentation mission, forward to editor
        if (missionSection === "notes" && missionApptId) {
          router.push(`/dashboard/therapist/notes/edit?clientId=${missionClientId}&appointmentId=${missionApptId}&eventTypeId=${missionTypeId}`);
        }
      }
    }
  }, [mounted, missionClientId, clients.length]);

  useEffect(() => {
    if (selectedClient && viewMode === "detail") {
      fetchFullClientDetails(selectedClient.id);
    }
  }, [viewMode, selectedClient?.id]);

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({ title: "Clinical Requirement", description: "Name and Email are mandatory.", status: "warning" });
      return;
    }

    try {
      const payload = {
        ...newClient,
        name: `${newClient.first_name} ${newClient.last_name}`.trim(),
      };
      const res = await apiPost("clients/", payload);
      setNewClient(initialClient);
      setViewMode("list");
      await fetchClients();
      if (res?.linked_existing_profile) {
        toast({ title: "Relationship Secured", description: "Existing patient record linked to your caseload.", status: "success" });
      } else {
        toast({ title: "New File Created", description: "Patient record created and active in care.", status: "success" });
      }
    } catch (e) {
      toast({ title: "Registration Error", description: e?.response?.data?.detail || "Could not register patient file.", status: "error" });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editClient,
        name: `${editClient.first_name} ${editClient.last_name}`.trim(),
      };
      const res = await apiPut(`clients/${selectedClient.id}/`, payload);
      setSelectedClient(res);
      setIsEditing(false);
      fetchClients();
      toast({ title: "Profile Updated", status: "success" });
    } catch (e) {
      toast({ title: "Update Failed", status: "error" });
    }
  };

  const handleTerminateRelationship = async () => {
    if (!selectedClient?.id) return;
    const confirmed = window.confirm("Are you sure you'd like to terminate this client relationship?");
    if (!confirmed) return;
    try {
      setRelationshipTransitioning(true);
      await apiPost(`clients/${selectedClient.id}/terminate-relationship/`, {
        reason: "Therapy concluded",
        notes: editClient.termination_notes || "",
      });
      toast({ title: "Relationship terminated", status: "success" });
      await fetchClients();
      await fetchFullClientDetails(selectedClient.id);
    } catch (_e) {
      toast({ title: "Could not terminate relationship", status: "error" });
    } finally {
      setRelationshipTransitioning(false);
    }
  };

  const handleReactivateRelationship = async () => {
    if (!selectedClient?.id) return;
    try {
      setRelationshipTransitioning(true);
      await apiPost(`clients/${selectedClient.id}/reactivate-relationship/`, {});
      toast({ title: "Relationship reactivated", status: "success" });
      await fetchClients();
      await fetchFullClientDetails(selectedClient.id);
    } catch (_e) {
      toast({ title: "Could not reactivate relationship", status: "error" });
    } finally {
      setRelationshipTransitioning(false);
    }
  };

  const startRename = (file) => {
    setRenamingFileId(file.id);
    setRenameValue(file.display_name || file.file?.split("/").pop() || "Document");
  };

  const saveRename = async (fileId) => {
    const cleanName = renameValue.trim();
    if (!cleanName || !selectedClient?.id) return;
    try {
      await apiPatch(`files/${fileId}/`, { display_name: cleanName });
      setRenamingFileId(null);
      setRenameValue("");
      await fetchFullClientDetails(selectedClient.id);
      toast({ title: "File renamed", status: "success" });
    } catch (_e) {
      toast({ title: "Could not rename file", status: "error" });
    }
  };

  const archiveFile = async (fileId, archive = true) => {
    if (!selectedClient?.id) return;
    try {
      await apiPatch(`files/${fileId}/`, {
        is_archived: archive,
        archived_at: archive ? new Date().toISOString() : null,
      });
      await fetchFullClientDetails(selectedClient.id);
      toast({ title: archive ? "File archived" : "File restored", status: "success" });
    } catch (_e) {
      toast({ title: archive ? "Could not archive file" : "Could not restore file", status: "error" });
    }
  };

  const deleteFile = async (fileId) => {
    if (!selectedClient?.id) return;
    const confirmed = window.confirm("Delete this file permanently? This action cannot be undone.");
    if (!confirmed) return;
    try {
      await apiDelete(`files/${fileId}/`);
      await fetchFullClientDetails(selectedClient.id);
      toast({ title: "File deleted", status: "success" });
    } catch (_e) {
      toast({ title: "Could not delete file", status: "error" });
    }
  };

  const handleUploadDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedClient?.id) return;
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("client", selectedClient.id);
      formData.append("file", file);
      formData.append("display_name", file.name);
      await apiUpload("files/", formData);
      await fetchFullClientDetails(selectedClient.id);
      toast({ title: "Document uploaded", status: "success" });
    } catch (_e) {
      toast({ title: "Could not upload document", status: "error" });
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    (c.client_file_number && c.client_file_number.toLowerCase().includes(search.toLowerCase()))
  );
  const activeClients = filteredClients.filter((c) => !c.terminated_patient);
  const terminatedClients = filteredClients.filter((c) => !!c.terminated_patient);
  const activeFiles = clientFiles.filter((f) => !f.is_archived);
  const archivedFiles = clientFiles.filter((f) => !!f.is_archived);

  const displayedClients = 
    filterTab === "active" ? activeClients :
    filterTab === "archived" ? terminatedClients :
    filteredClients;

  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => !c.terminated_patient).length;
  const archivedClientsCount = clients.filter(c => !!c.terminated_patient).length;

  const renderClientHeader = () => (
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
        {viewMode === "list" && (
          <>
            {/* Identity & Space Title */}
            <HStack spacing={3.5} align="center">
              <Box position="relative">
                <Avatar 
                  size="md" 
                  name={user?.fullName || "Practitioner"} 
                  src={user?.imageUrl} 
                  border="2px solid white" 
                  boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)" 
                />
                <Circle 
                  size="11px" 
                  bg="#38A169" 
                  border="2px solid white" 
                  position="absolute" 
                  bottom="0" 
                  right="0" 
                />
              </Box>

              <VStack align="start" spacing={0.5}>
                <HStack spacing={2} wrap="wrap">
                  <Badge 
                    bg="rgba(169, 203, 183, 0.2)" 
                    color="#263A33" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                  >
                    CLINICAL PRACTICE 🌿
                  </Badge>
                  <Badge 
                    bg="rgba(86, 117, 109, 0.08)" 
                    color="#56756D" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    {totalClientsCount} Total Patients
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
                  Clinical Caseload
                </Heading>

                <Text 
                  fontSize="13px" 
                  color="#5A6E65"
                  fontWeight="400"
                >
                  Manage patient documentation, treatment blueprints, and clinical history.
                </Text>
              </VStack>
            </HStack>

            {/* Right: Metric Strip + Add Button */}
            <Stack 
              direction={{ base: "column", md: "row" }} 
              spacing={3} 
              align={{ base: "stretch", md: "center" }} 
              w={{ base: "full", lg: "auto" }}
            >
              <HStack 
                spacing={{ base: 1.5, sm: 3 }} 
                p={1.5} 
                px={{ base: 2, sm: 2.5 }}
                borderRadius="xl" 
                bg="rgba(250, 248, 245, 0.9)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.1)"
                w={{ base: 'full', md: 'auto' }}
                justify="space-between"
              >
                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                    <Icon as={FiUsers} boxSize="14px" />
                  </Circle>
                  <VStack align="start" spacing={0} minW="max-content">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                      CASELOAD
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {totalClientsCount} Total
                    </Text>
                  </VStack>
                </HStack>

                <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                    <Icon as={FiActivity} boxSize="14px" />
                  </Circle>
                  <VStack align="start" spacing={0} minW="max-content">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                      ACTIVE
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {activeClientsCount} In Care
                    </Text>
                  </VStack>
                </HStack>

                <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

                <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                  <Circle size="28px" bg="rgba(113, 128, 150, 0.12)" color="#718096" flexShrink={0}>
                    <Icon as={FiArchive} boxSize="14px" />
                  </Circle>
                  <VStack align="start" spacing={0} minW="max-content">
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                      ARCHIVED
                    </Text>
                    <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                      {archivedClientsCount} Closed
                    </Text>
                  </VStack>
                </HStack>
              </HStack>

              <Button 
                leftIcon={<FiUserPlus />} 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                px={5} 
                h="38px"
                fontSize="13px"
                fontWeight="600"
                w={{ base: "full", md: "auto" }}
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                _active={{ bg: "#263A33" }}
                transition="all 0.2s"
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                onClick={() => setViewMode("add")}
                whiteSpace="nowrap"
                flexShrink={0}
              >
                Add New Client
              </Button>
            </Stack>
          </>
        )}

        {viewMode === "detail" && (
          <>
            <HStack spacing={3.5} align="center" flex="1" minW={0} wrap="wrap">
              <Button 
                variant="outline" 
                borderColor="rgba(86, 117, 109, 0.25)" 
                color="#263A33" 
                onClick={() => setViewMode("list")} 
                leftIcon={<FiArrowLeft />} 
                borderRadius="full" 
                h="38px" 
                fontSize="12.5px" 
                fontWeight="600" 
                px={4} 
                _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
              >
                Back
              </Button>
              <Box position="relative">
                <Avatar 
                  size="md" 
                  name={selectedClient?.name || "Client"} 
                  bg="rgba(86, 117, 109, 0.15)" 
                  color="#263A33" 
                  fontWeight="600" 
                  border="2px solid white" 
                  boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)" 
                />
                <Circle 
                  size="11px" 
                  bg={selectedClient?.terminated_patient ? "#E53E3E" : "#38A169"} 
                  border="2px solid white" 
                  position="absolute" 
                  bottom="0" 
                  right="0" 
                />
              </Box>
              <VStack align="start" spacing={0.5} minW={0}>
                <HStack spacing={2} wrap="wrap">
                  <Badge 
                    bg={selectedClient?.terminated_patient ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.12)"} 
                    color={selectedClient?.terminated_patient ? "#B91C1C" : "#047857"} 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full" 
                    px={2.5} 
                    py={0.5} 
                    letterSpacing="0.04em" 
                    textTransform="uppercase"
                  >
                    {selectedClient?.terminated_patient ? "ARCHIVED / TERMINATED" : "ACTIVE CLINICAL FILE 🌿"}
                  </Badge>
                  <Badge 
                    bg="rgba(86, 117, 109, 0.08)" 
                    color="#56756D" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full" 
                    px={2.5} 
                    py={0.5}
                  >
                    FILE #{selectedClient?.client_file_number || "UNASSIGNED"}
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
                  {selectedClient?.name || "Patient Record"}
                </Heading>
                <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                  {selectedClient?.email} {selectedClient?.phone_number ? `• ${selectedClient.phone_number}` : ''}
                </Text>
              </VStack>
            </HStack>

            <Stack direction={{ base: "column", sm: "row" }} spacing={2.5} align="center" wrap="wrap" w={{ base: "full", lg: "auto" }}>
              <Button 
                leftIcon={<FiDownload />} 
                variant="outline" 
                borderColor="rgba(86, 117, 109, 0.25)" 
                color="#263A33" 
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                onClick={() => exportAllClientNotes(selectedClient, clientNotes, "MLC Professional", noteTemplates)}
              >
                Export Records
              </Button>
              <Button 
                leftIcon={<FiCalendar />} 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                h="38px"
                fontSize="13px"
                fontWeight="600"
                px={4}
                _hover={{ bg: "#263A33" }}
                onClick={() => router.push('/dashboard/therapist/schedule')}
              >
                Book Appointment
              </Button>
              <Button 
                leftIcon={isEditing ? <FiCheckCircle /> : <FiEdit3 />} 
                variant={isEditing ? "solid" : "outline"} 
                bg={isEditing ? "#263A33" : "transparent"}
                color={isEditing ? "white" : "#263A33"}
                borderColor="rgba(86, 117, 109, 0.25)"
                borderRadius="full" 
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                _hover={isEditing ? { bg: "#56756D" } : { bg: "rgba(169, 203, 183, 0.1)" }}
                onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
              {selectedClient?.terminated_patient ? (
                <Button 
                  variant="outline" 
                  borderColor="rgba(16, 185, 129, 0.3)" 
                  color="#047857" 
                  borderRadius="full" 
                  h="38px" 
                  fontSize="12.5px" 
                  fontWeight="600" 
                  px={4} 
                  onClick={handleReactivateRelationship} 
                  isLoading={relationshipTransitioning}
                  _hover={{ bg: "rgba(16, 185, 129, 0.08)" }}
                >
                  Reactivate Relationship
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  borderColor="rgba(239, 68, 68, 0.3)" 
                  color="#B91C1C" 
                  borderRadius="full" 
                  h="38px" 
                  fontSize="12.5px" 
                  fontWeight="600" 
                  px={4} 
                  onClick={handleTerminateRelationship} 
                  isLoading={relationshipTransitioning}
                  _hover={{ bg: "rgba(239, 68, 68, 0.08)" }}
                >
                  Terminate
                </Button>
              )}
            </Stack>
          </>
        )}

        {viewMode === "add" && (
          <HStack spacing={3.5} align="center">
            <Button 
              variant="outline" 
              borderColor="rgba(86, 117, 109, 0.25)" 
              color="#263A33" 
              onClick={() => setViewMode("list")} 
              leftIcon={<FiArrowLeft />} 
              borderRadius="full" 
              h="38px" 
              fontSize="12.5px" 
              fontWeight="600" 
              px={4} 
              _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
            >
              Back
            </Button>
            <Circle size="44px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiUserPlus} boxSize="20px" />
            </Circle>
            <VStack align="start" spacing={0.5}>
              <Badge 
                bg="rgba(169, 203, 183, 0.2)" 
                color="#263A33" 
                fontSize="10px" 
                fontWeight="700" 
                borderRadius="full" 
                px={2.5} 
                py={0.5} 
                letterSpacing="0.04em" 
                textTransform="uppercase"
              >
                PATIENT REGISTRATION 🌿
              </Badge>
              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }} 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                color="#263A33" 
                fontWeight="600" 
                lineHeight="1.25" 
                letterSpacing="-0.015em"
              >
                Register New Client
              </Heading>
              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Create a global patient record and initialize clinical onboarding documentation.
              </Text>
            </VStack>
          </HStack>
        )}
      </Flex>
    </Box>
  );

  const renderClientDetail = () => {
    if (fetchingDetails) return <Center py={20}><VStack><Spinner color="teal.500" /><Text>Syncing Clinical Record...</Text></VStack></Center>;
    
    return (
      <Grid templateColumns={{ base: "1fr", lg: "240px minmax(0,1fr)" }} gap={{ base: 4, md: 8 }}>
        {/* Sidebar Nav */}
        <GridItem>
          <VStack align="stretch" spacing={2} bg="white" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
            <NavButton icon={FiUser} label="Clinical Details" active={activeSection === "details"} onClick={() => setActiveSection("details")} />
            <NavButton icon={FiActivity} label="Clinical Intake" active={activeSection === "intake"} onClick={() => setActiveSection("intake")} />
            <NavButton icon={FiClipboard} label="Session Notes" active={activeSection === "notes"} count={clientNotes.length} onClick={() => setActiveSection("notes")} />
            <NavButton icon={FiPaperclip} label="Record Vault" active={activeSection === "files"} count={clientFiles.length} onClick={() => setActiveSection("files")} />
            <NavButton icon={FiCalendar} label="Appointments" active={activeSection === "appointments"} count={clientAppointments.length} onClick={() => setActiveSection("appointments")} />
            <NavButton icon={FiFileText} label="Assigned Forms" active={activeSection === "forms"} count={clientFormAssignments.length} onClick={() => setActiveSection("forms")} />
            <NavButton icon={FiCreditCard} label="Billing & Invoices" active={activeSection === "billing"} onClick={() => setActiveSection("billing")} />
          </VStack>
        </GridItem>

        {/* Main Content Area */}
        <GridItem overflow="hidden">
           {activeSection === "details" && renderDetailsSection()}
           {activeSection === "intake" && renderIntakeSection()}
           {activeSection === "notes" && renderNotesSection()}
           {activeSection === "files" && renderFilesSection()}
           {activeSection === "appointments" && renderAppointmentsSection()}
           {activeSection === "forms" && renderFormsSection()}
           {activeSection === "billing" && renderBillingSection()}
        </GridItem>
      </Grid>
    );
  };

  const assignClientForm = async (formType) => {
    if (!selectedClient?.id) return;
    try {
      setAssigningFormType(formType);
      await apiPost("client-form-assignments/", {
        assigned_to: selectedClient.id,
        form_type: formType,
        title: formType === "consent" ? "Client Consent Form" : "Client Assessment Form",
        instructions:
          formType === "consent"
            ? "Please review and confirm consent statements before your next session."
            : "Please complete this assessment to support our clinical planning.",
      });
      toast({
        title: formType === "consent" ? "Consent form assigned" : "Assessment form assigned",
        status: "success",
      });
      await fetchFullClientDetails(selectedClient.id);
    } catch (e) {
      toast({ title: "Could not assign form", status: "error" });
    } finally {
      setAssigningFormType("");
    }
  };

  const assignAssessment = async () => {
    if (!selectedClient?.id || !selectedAssessmentId) return;
    try {
      setAssigningFormType("assessment_spec");
      await resourcesApi.assignAssessment({
        assigned_to: selectedClient.id,
        assessment_id: selectedAssessmentId,
      });
      toast({ title: "Assessment assigned", status: "success" });
      await fetchFullClientDetails(selectedClient.id);
    } catch (_e) {
      toast({ title: "Could not assign assessment", status: "error" });
    } finally {
      setAssigningFormType("");
    }
  };

  const regenerateAssessmentReport = async (form) => {
    if (!form?.id || !selectedClient?.id) return;
    try {
      setRegeneratingFormId(form.id);
      await resourcesApi.regenerateAssessmentReport(form.id);
      toast({ title: "Assessment report regenerated", status: "success" });
      await fetchFullClientDetails(selectedClient.id);
    } catch (_e) {
      toast({ title: "Could not regenerate assessment report", status: "error" });
    } finally {
      setRegeneratingFormId(null);
    }
  };

  const renderDetailsSection = () => (
    <VStack align="stretch" spacing={6} animation="fadeIn 0.5s">
      <DetailCard title="Personal Information" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="First Name" value={editClient.first_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, first_name: v})} />
            <DataField label="Last Name" value={editClient.last_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, last_name: v})} />
            <DataField label="Preferred Name" value={editClient.preferred_first_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, preferred_first_name: v})} />
            <DataField label="Date of Birth" value={editClient.date_of_birth} type="date" isEditing={isEditing} onChange={(v) => setEditClient({...editClient, date_of_birth: v})} />
            <DataField label="Sex" value={editClient.sex} isEditing={isEditing} type="select" options={["Female", "Male", "Intersex", "Other"]} onChange={(v) => setEditClient({...editClient, sex: v})} />
            <DataField label="Gender Identity" value={editClient.gender_identity} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, gender_identity: v})} />
         </SimpleGrid>
      </DetailCard>

      <DetailCard title="Contact & Address" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="Email" value={editClient.email} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, email: v})} />
            <DataField label="Phone" value={editClient.phone_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, phone_number: v})} />
            <DataField label="Address Line 1" value={editClient.address_line1} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, address_line1: v})} />
            <DataField label="City" value={editClient.city} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, city: v})} />
            <DataField label="Nationality" value={editClient.nationality} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, nationality: v})} />
            <DataField label="Civil ID Number" value={editClient.civil_id_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, civil_id_number: v})} />
         </SimpleGrid>
      </DetailCard>

      <DetailCard title="Clinical Administrative" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="Occupation" value={editClient.occupation} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, occupation: v})} />
            <DataField label="Emergency Contact" value={editClient.emergency_contact} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, emergency_contact: v})} />
            <DataField label="Referral Source" value={editClient.referral_type} isEditing={isEditing} type="select" options={["None", "Google", "Friend", "Doctor", "Other"]} onChange={(v) => setEditClient({...editClient, referral_type: v})} />
            <DataField label="Patient File #" value={editClient.client_file_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, client_file_number: v})} />
         </SimpleGrid>
         <Box mt={6}>
            <Text fontWeight="bold" fontSize="sm" mb={2}>Clinical Overview / Intake Notes</Text>
            {isEditing ? (
              <Textarea value={editClient.extra_information || ""} onChange={(e) => setEditClient({...editClient, extra_information: e.target.value})} borderRadius="xl" />
            ) : (
              <Text color="gray.600" bg="gray.50" p={4} borderRadius="xl" fontSize="sm">{editClient.extra_information || "No additional info."}</Text>
            )}
         </Box>
      </DetailCard>
    </VStack>
  );

  const RenderClinicalData = ({ note }) => {
    const template = noteTemplates.find(t => String(t.id) === String(note.template));
    if (!template) return <Text fontSize="xs" color="gray.400">Legacy Data: {JSON.stringify(note.data)}</Text>;

    const fieldsByRef = {};
    (template.fields || []).forEach(f => { 
      if (f.field_key) fieldsByRef[f.field_key] = f;
      fieldsByRef[f.id] = f; 
    });

    // Bundle by sections
    const sections = template.sections && template.sections.length > 0
      ? template.sections
      : [{ title: "General Observations", fields: template.fields }];

    return (
      <VStack align="stretch" spacing={6} mt={4}>
         {sections.map((section, idx) => {
           const sectionFields = section.fields || [];
           // Check if this section has ANY data
           const hasData = sectionFields.some(sf => note.data[sf.field_key] || note.data[sf.id]);

           if (!hasData) return null;

           return (
            <Box key={idx} bg="gray.50" p={{ base: 3, md: 5 }} borderRadius="2xl" border="1px solid" borderColor="teal.50" overflow="hidden">
               <Text fontWeight="bold" fontSize="xs" color="teal.700" textTransform="uppercase" mb={4} letterSpacing="widest" whiteSpace="normal" wordBreak="break-word">{section.title || "Observation"}</Text>
                <SimpleGrid columns={1} spacing={4}>
                   {sectionFields.map(field => {
                      const val = note.data[field.field_key] || note.data[field.id];
                      if (val === undefined || val === null || val === "") return null;
                      return (
                        <Box key={field.id || field.field_key} pb={2} minW={0}>
                           <Text fontSize="2xs" color="gray.400" fontWeight="bold" textTransform="uppercase" whiteSpace="normal" wordBreak="break-word">{field.label}</Text>
                           {Array.isArray(val) ? (
                              <HStack spacing={2} mt={1} flexWrap="wrap">
                                 {val.map((v, i) => <Badge key={i} bg="white" color="teal.600" border="1px solid" borderColor="teal.100" borderRadius="full" px={2} textTransform="none" fontSize="xs">{v}</Badge>)}
                              </HStack>
                           ) : (
                              <Text fontSize="sm" color="gray.800" whiteSpace="pre-wrap" wordBreak="break-word" overflowWrap="anywhere" lineHeight="tall">{String(val)}</Text>
                           )}
                        </Box>
                      );
                   })}
                </SimpleGrid>
             </Box>
           );
         })}
      </VStack>
    );
  };

  const renderNotesSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
      <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
          <Heading fontSize="16px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">Session Documentation</Heading>
          <Button 
            leftIcon={<FiClipboard />} 
            bg="#56756D" 
            color="white" 
            size="sm" 
            h="36px"
            borderRadius="full"
            fontSize="12.5px"
            fontWeight="600"
            _hover={{ bg: "#263A33" }}
            onClick={() => router.push(`/dashboard/therapist/notes/edit?clientId=${selectedClient?.id}`)}
          >
            New Clinical Note
          </Button>
       </HStack>
       {clientNotes.length === 0 ? (
         <Center py={20} bg="white" borderRadius="2xl" border="1px dashed" borderColor="rgba(86, 117, 109, 0.2)">
            <VStack spacing={2}>
               <Icon as={FiEdit3} w={8} h={8} color="#56756D" />
               <Text color="#5A6E65" fontSize="13px">No session notes for this patient yet.</Text>
            </VStack>
         </Center>
       ) : (
         clientNotes.map(note => (
            <Box 
              key={note.id} 
              bg="white" 
              p={{ base: 4, md: 5 }} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.14)" 
              boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
              cursor="pointer"
              _hover={{ borderColor: 'rgba(86, 117, 109, 0.35)' }}
              transition="0.15s"
              onClick={() => router.push(`/dashboard/therapist/notes/edit?clientId=${selectedClient?.id}&noteId=${note.id}`)}
            >
              <Stack direction={{ base: "column", md: "row" }} justify="space-between" mb={4} spacing={3}>
                 <VStack align="start" spacing={1} minW={0}>
                    <HStack>
                       <Icon as={FiFileText} color="teal.500" />
                       <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="gray.800" wordBreak="break-word">{note.template_name || "Clinical Note"}</Text>
                    </HStack>
                    <HStack fontSize="xs" color="gray.400" spacing={3} flexWrap="wrap">
                       <HStack><Icon as={FiClock} /> <Text>{new Date(note.created_at).toLocaleString()}</Text></HStack>
                       <Text>•</Text>
                       <Text>{note.status.toUpperCase()}</Text>
                    </HStack>
                 </VStack>
                 <HStack spacing={3} flexWrap="wrap">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      leftIcon={<FiDownload />} 
                      borderRadius="full"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const tpl = noteTemplates.find(t => String(t.id) === String(note.template));
                        exportNoteToPDF(selectedClient, note, "MLC Professional", tpl); 
                      }}
                    >
                      Export PDF
                    </Button>
                    <Badge borderRadius="full" px={4} py={1} colorScheme={note.status === 'final' ? 'green' : 'orange'} variant="subtle" fontSize="2xs">
                       {note.status === 'final' ? 'FINALIZED' : 'DRAFT'}
                    </Badge>
                 </HStack>
              </Stack>
              <Divider mb={6} />
              <RenderClinicalData note={note} />
            </Box>
         ))
       )}
    </VStack>
  );

  const renderFilesSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
       <HStack justify="space-between" mb={4} flexWrap="wrap" gap={3}>
         <Heading fontSize="16px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">Clinical Vault</Heading>
         <Button 
           leftIcon={<FiPaperclip />} 
           variant="outline" 
           borderColor="rgba(86, 117, 109, 0.25)" 
           color="#263A33" 
           size="sm" 
           h="36px"
           borderRadius="full" 
           fontSize="12.5px"
           fontWeight="600"
           _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
           onClick={() => uploadInputRef.current?.click()} 
           isLoading={uploadingFile}
         >
           Upload Document
         </Button>
         <Input ref={uploadInputRef} type="file" display="none" onChange={handleUploadDocument} />
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
         {activeFiles.length === 0 ? <Text color="#5A6E65" fontSize="13px">No documents found.</Text> : activeFiles.map(file => (
            <Box key={file.id} p={{ base: 3.5, md: 4 }} bg="white" borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)">
               <HStack align="start" spacing={3}>
                  <Circle size="30px" bg="rgba(86, 117, 109, 0.1)" color="#56756D"><Icon as={FiPaperclip} boxSize="15px" /></Circle>
                  <VStack align="start" spacing={1} flex="1" minW={0}>
                     {renamingFileId === file.id ? (
                      <Stack direction={{ base: "column", sm: "row" }} w="full" spacing={2}>
                        <Input size="xs" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                        <HStack>
                          <Button size="xs" onClick={() => saveRename(file.id)}>Save</Button>
                          <Button size="xs" variant="ghost" onClick={() => { setRenamingFileId(null); setRenameValue(""); }}>Cancel</Button>
                        </HStack>
                      </Stack>
                     ) : (
                      <Text fontSize="13.5px" fontWeight="600" color="#263A33" wordBreak="break-word" whiteSpace="normal">
                        {file.display_name || file.file?.split('/').pop() || "Document"}
                      </Text>
                     )}
                     <Text fontSize="11.5px" color="#718096" whiteSpace="normal">{new Date(file.uploaded_at).toLocaleDateString()}</Text>
                  </VStack>
               </HStack>
               <Stack direction={{ base: "column", sm: "row" }} spacing={2} mt={3}>
                 <Button size="xs" variant="ghost" color="#56756D" borderRadius="full" onClick={() => openFileWithAuth(file)}>View</Button>
                 <Button size="xs" variant="ghost" borderRadius="full" onClick={() => startRename(file)}>Rename</Button>
                 <Button size="xs" variant="ghost" color="orange.600" borderRadius="full" onClick={() => archiveFile(file.id, true)}>Archive</Button>
                 <Button size="xs" variant="ghost" color="red.600" borderRadius="full" onClick={() => deleteFile(file.id)}>Delete</Button>
               </Stack>
            </Box>
         ))}
      </SimpleGrid>
      {archivedFiles.length > 0 && (
        <Box mt={2} border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" borderRadius="2xl" p={4} bg="rgba(250, 248, 245, 0.85)">
          <HStack justify="space-between">
            <Heading fontSize="12px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em">Archived Files</Heading>
            <Button size="xs" variant="ghost" borderRadius="full" onClick={() => setShowArchivedFiles((v) => !v)}>
              {showArchivedFiles ? "Collapse" : "Expand"}
            </Button>
          </HStack>
          <Collapse in={showArchivedFiles} animateOpacity>
            <VStack align="stretch" mt={3} spacing={2}>
              {archivedFiles.map((file) => (
                <Box key={file.id} p={3} bg="white" borderRadius="xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="13px" fontWeight="600" color="#263A33" wordBreak="break-word" whiteSpace="normal">{file.display_name || file.file?.split('/').pop() || "Document"}</Text>
                    <Text fontSize="11px" color="#718096">{new Date(file.uploaded_at).toLocaleDateString()}</Text>
                  </VStack>
                  <Stack direction={{ base: "column", sm: "row" }} spacing={2} mt={3}>
                    <Button size="xs" variant="ghost" color="#56756D" borderRadius="full" onClick={() => openFileWithAuth(file)}>View</Button>
                    <Button size="xs" variant="ghost" color="green.600" borderRadius="full" onClick={() => archiveFile(file.id, false)}>Restore</Button>
                    <Button size="xs" variant="ghost" color="red.600" borderRadius="full" onClick={() => deleteFile(file.id)}>Delete</Button>
                  </Stack>
                </Box>
              ))}
            </VStack>
          </Collapse>
        </Box>
      )}
    </VStack>
  );

  const renderAppointmentsSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
      <Heading fontSize="16px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33" mb={4}>Service History</Heading>
      {clientAppointments.length === 0 ? <Text color="#5A6E65" fontSize="13px">No scheduled sessions.</Text> : clientAppointments.map(appt => (
         <HStack key={appt.id} p={4} bg="white" borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" justify="space-between">
            <HStack spacing={3.5}>
               <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D"><Icon as={FiCalendar} boxSize="18px" /></Circle>
               <VStack align="start" spacing={0}>
                  <Text fontWeight="600" fontSize="13.5px" color="#263A33">{new Date(appt.date || appt.start_time).toLocaleString()}</Text>
                  <Text fontSize="12px" color="#5A6E65">{appt.status_label || appt.status}</Text>
               </VStack>
            </HStack>
            <Badge bg="rgba(86, 117, 109, 0.12)" color="#263A33" borderRadius="full" px={2.5} py={0.5} fontSize="10.5px" fontWeight="700">{appt.status}</Badge>
         </HStack>
      ))}
    </VStack>
  );

  const renderFormsSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
      <HStack justify="space-between" mb={3} flexWrap="wrap" gap={3}>
        <Heading fontSize="16px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33">Assigned Client Forms</Heading>
        <HStack flexWrap="wrap" w={{ base: "full", md: "auto" }}>
          <Button
            size="sm"
            variant="outline"
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            borderRadius="full"
            h="36px"
            fontSize="12.5px"
            fontWeight="600"
            _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
            w={{ base: "full", sm: "auto" }}
            onClick={() => assignClientForm("consent")}
            isLoading={assigningFormType === "consent"}
          >
            Assign Consent Form
          </Button>
          <Button
            size="sm"
            bg="#56756D"
            color="white"
            borderRadius="full"
            h="36px"
            fontSize="12.5px"
            fontWeight="600"
            _hover={{ bg: "#263A33" }}
            w={{ base: "full", sm: "auto" }}
            onClick={() => assignClientForm("assessment")}
            isLoading={assigningFormType === "assessment"}
          >
            Assign Assessment Form
          </Button>
        </HStack>
      </HStack>
      <Box bg="purple.50" border="1px solid" borderColor="purple.100" borderRadius="xl" p={4}>
        <Text fontSize="xs" color="purple.700" fontWeight="700" mb={2}>Assign structured assessment</Text>
        <Stack direction={{ base: "column", md: "row" }} spacing={3} align="center">
          <ModernSelect
            value={selectedAssessmentId}
            onChange={(val) => setSelectedAssessmentId(val)}
            options={assessmentCatalog.map((a) => ({ label: a.name, value: a.id }))}
            placeholder="Select an assessment..."
            w={{ base: "full", md: "320px" }}
          />
          <Button
            size="sm"
            colorScheme="purple"
            borderRadius="full"
            onClick={assignAssessment}
            isLoading={assigningFormType === "assessment_spec"}
            isDisabled={!selectedAssessmentId}
          >
            Assign selected assessment
          </Button>
        </Stack>
      </Box>

      {clientFormAssignments.length === 0 ? (
        <Text color="gray.500">No forms assigned yet.</Text>
      ) : (
        <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" overflowX="auto">
          <Table variant="simple" size="sm" minW="760px">
            <Thead>
              <Tr>
                <Th whiteSpace="nowrap">Form</Th>
                <Th whiteSpace="nowrap">Status</Th>
                <Th whiteSpace="nowrap">Assigned</Th>
                <Th whiteSpace="nowrap">Due</Th>
                <Th whiteSpace="nowrap">Submitted</Th>
                <Th whiteSpace="nowrap">Report</Th>
              </Tr>
            </Thead>
            <Tbody>
              {clientFormAssignments.map((form) => {
                const resultPdfFileId = form?.response_data?.resultPdfFileId;
                const reportFile = clientFiles.find((file) => String(file.id) === String(resultPdfFileId));
                return (
                <Tr key={form.id}>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="700" whiteSpace="normal" wordBreak="break-word">{form.title}</Text>
                      <Text fontSize="xs" color="gray.500">{form.form_type_label || form.form_type}</Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      borderRadius="full"
                      colorScheme={
                        form.status === "reviewed"
                          ? "green"
                          : form.status === "submitted"
                            ? "blue"
                            : form.status === "started"
                              ? "orange"
                              : "gray"
                      }
                    >
                      {form.status_label || form.status}
                    </Badge>
                  </Td>
                  <Td>{form.assigned_at ? new Date(form.assigned_at).toLocaleDateString() : "—"}</Td>
                  <Td>{form.due_date || "—"}</Td>
                  <Td>{form.submitted_at ? new Date(form.submitted_at).toLocaleDateString() : "—"}</Td>
                  <Td>
                    {form.form_type === "assessment" && (form.status === "submitted" || form.status === "reviewed") ? (
                      <HStack spacing={2}>
                        {reportFile ? (
                          <Button
                            size="xs"
                            colorScheme="teal"
                            variant="outline"
                            borderRadius="full"
                            onClick={() => openFileWithAuth(reportFile)}
                          >
                            Open report
                          </Button>
                        ) : (
                          <Text fontSize="xs" color="gray.500">Missing file</Text>
                        )}
                        <Button
                          size="xs"
                          variant="ghost"
                          borderRadius="full"
                          isLoading={regeneratingFormId === form.id}
                          onClick={() => regenerateAssessmentReport(form)}
                        >
                          Regenerate
                        </Button>
                      </HStack>
                    ) : (
                      <Text fontSize="xs" color="gray.500">—</Text>
                    )}
                  </Td>
                </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </VStack>
  );

  const renderIntakeSection = () => (
    <VStack align="stretch" spacing={6} animation="fadeIn 0.5s">
       <DetailCard title="Initial Screening Results (DASS-21)">
          {!selectedClient?.dass_scores ? (
            <Center py={10} bg="gray.50" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
              <VStack spacing={2}>
                <Icon as={FiActivity} w={8} h={8} color="gray.300" />
                <Text color="gray.500" fontSize="sm">No DASS-21 screening data available for this profile.</Text>
              </VStack>
            </Center>
          ) : (
            <VStack align="stretch" spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                 <Box p={4} bg="#FEF2F2" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="rgba(239, 68, 68, 0.25)">
                    <Text fontSize="10.5px" fontWeight="700" color="#B91C1C" letterSpacing="0.06em">DEPRESSION</Text>
                    <Heading fontSize="26px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#991B1B">{selectedClient.dass_scores?.depression}</Heading>
                    <Badge bg="rgba(239, 68, 68, 0.15)" color="#B91C1C" borderRadius="full" px={2.5} py={0.5} fontSize="10.5px" fontWeight="700">{selectedClient.dass_interpretations?.depression}</Badge>
                 </Box>
                 <Box p={4} bg="#FFFBEB" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="rgba(245, 158, 11, 0.25)">
                    <Text fontSize="10.5px" fontWeight="700" color="#B45309" letterSpacing="0.06em">ANXIETY</Text>
                    <Heading fontSize="26px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#92400E">{selectedClient.dass_scores?.anxiety}</Heading>
                    <Badge bg="rgba(245, 158, 11, 0.15)" color="#B45309" borderRadius="full" px={2.5} py={0.5} fontSize="10.5px" fontWeight="700">{selectedClient.dass_interpretations?.anxiety}</Badge>
                 </Box>
                 <Box p={4} bg="#EFF6FF" borderRadius="2xl" textAlign="center" border="1px solid" borderColor="rgba(59, 130, 246, 0.25)">
                    <Text fontSize="10.5px" fontWeight="700" color="#1D4ED8" letterSpacing="0.06em">STRESS</Text>
                    <Heading fontSize="26px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#1E40AF">{selectedClient.dass_scores?.stress}</Heading>
                    <Badge bg="rgba(59, 130, 246, 0.15)" color="#1D4ED8" borderRadius="full" px={2.5} py={0.5} fontSize="10.5px" fontWeight="700">{selectedClient.dass_interpretations?.stress}</Badge>
                 </Box>
              </SimpleGrid>

              <Box bg="rgba(250, 248, 245, 0.9)" p={5} borderRadius="2xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
                 <Heading fontSize="12px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="700" color="#56756D" textTransform="uppercase" mb={2.5} letterSpacing="0.08em">Clinical Discovery Summary</Heading>
                 <Text fontSize="13px" color="#263A33" lineHeight="tall" whiteSpace="pre-wrap">
                    {selectedClient.summary || "No automated summary provided."}
                 </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                 <DataPiece label="Primary Concern" value={selectedClient.primary_concern} />
                 <DataPiece label="Daily Impact" value={selectedClient.impairment_level} />
                 <DataPiece label="Life Context" value={selectedClient.life_stage_context} />
                 <DataPiece label="Support Level" value={selectedClient.support_level} />
              </SimpleGrid>
            </VStack>
          )}
       </DetailCard>

       <DetailCard title="Health & Background">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
             <DataPiece label="Prior Therapy" value={selectedClient.prior_therapy} />
             <DataPiece label="On Medication" value={selectedClient.on_medication} />
             <DataPiece label="Existing Diagnosis" value={selectedClient.has_diagnosis} />
             <DataPiece label="Psychiatry History" value={selectedClient.psychiatry_history} />
          </SimpleGrid>
       </DetailCard>
    </VStack>
  );

  const DataPiece = ({ label, value }) => (
    <Box>
       <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>{label}</Text>
       <Text fontSize="sm" fontWeight="600" color="gray.700">{value || "—"}</Text>
    </Box>
  );

  const renderBillingSection = () => (
    <VStack align="stretch" spacing={6} animation="fadeIn 0.5s">
       <DetailCard title="Financial Configuration" isEditing={isEditing}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
             <DataField label="Hourly Rate (INR)" value={editClient.hourly_rate} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, hourly_rate: v})} />
             <DataField label="Concession Type" value={editClient.concession_type} isEditing={isEditing} type="select" options={["None", "Student", "Healthcare Card", "Sliding Scale"]} onChange={(v) => setEditClient({...editClient, concession_type: v})} />
             <DataField label="Invoice Email" value={editClient.invoice_email_to} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, invoice_email_to: v})} />
          </SimpleGrid>
          <Box mt={4}>
             <Text fontWeight="bold" fontSize="sm" mb={2}>Default Invoice Label</Text>
             {isEditing ? <Textarea value={editClient.invoice_to} onChange={(e) => setEditClient({...editClient, invoice_to: e.target.value})} borderRadius="xl" /> : <Text fontSize="sm" color="gray.600">{editClient.invoice_to || "No custom label."}</Text>}
          </Box>
       </DetailCard>

       <Box bg="white" p={{ base: 4, md: 5 }} borderRadius="2xl" boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
          <Heading fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" color="#263A33" mb={5} letterSpacing="-0.01em">Session Invoices</Heading>
          {clientAppointments.length === 0 ? (
            <Text color="#5A6E65" fontSize="13px">No billed sessions yet.</Text>
          ) : (
            <VStack align="stretch" spacing={2.5}>
              {clientAppointments.slice(0, 10).map(appt => {
                const apptId = String(appt?.id ?? '');
                const status = String(appt?.status || "").toLowerCase();
                const paymentStatus = String(appt?.payment_status || "").toLowerCase();
                const isCancelled = status === "cancelled";
                const isPaid = !isCancelled && (paymentStatus === "paid" || status === "completed");
                const invoiceState = isCancelled ? "CANCELLED" : (isPaid ? "PAID" : "PENDING");
                const invoiceBg = isCancelled ? "rgba(239, 68, 68, 0.1)" : (isPaid ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)");
                const invoiceColor = isCancelled ? "#B91C1C" : (isPaid ? "#047857" : "#B45309");
                return (
                <Flex key={appt.id} p={3.5} borderRadius="xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.1)" bg="rgba(250, 248, 245, 0.85)" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} justify="space-between" _hover={{ bg: 'white', borderColor: "rgba(86, 117, 109, 0.2)" }} transition="0.15s">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="600" fontSize="13px" color="#263A33">{new Date(appt.start_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    <Text fontSize="11px" color="#718096">MLC-INV-{apptId.slice(0, 8) || 'N/A'}</Text>
                  </VStack>
                  <HStack spacing={3} w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                    <Badge bg={invoiceBg} color={invoiceColor} borderRadius="full" px={2.5} py={0.5} fontSize="10.5px" fontWeight="700">
                      {invoiceState}
                    </Badge>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      borderColor="rgba(86, 117, 109, 0.25)" 
                      color="#263A33" 
                      borderRadius="full"
                      as={Link}
                      href={`/dashboard/client/invoice/${appt.id}`}
                      isExternal
                      _hover={{ bg: "rgba(169, 203, 183, 0.1)" }}
                    >
                      View
                    </Button>
                  </HStack>
                </Flex>
                );
              })}
            </VStack>
          )}
          <Text mt={5} fontSize="11.5px" color="#718096">
            Note: All invoices include clinical liability disclaimers and MLC professional branding.
          </Text>
       </Box>
    </VStack>
  );

  if (!mounted) return (
    <Center minH="400px">
      <VStack spacing={3}>
        <Spinner size="xl" color="#56756D" thickness="3px" />
        <Text color="#5A6E65" fontWeight="500" fontSize="13px">Restoring Patient Dossiers...</Text>
      </VStack>
    </Center>
  );

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {renderClientHeader()}

      {viewMode === "list" && (
        <Box 
          bg="white" 
          p={{ base: 4, md: 5 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          {/* Search & Filter Bar */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'stretch', md: 'center' }} 
            gap={3} 
            mb={5}
          >
            <InputGroup maxW={{ base: 'full', md: '380px' }}>
              <InputLeftElement pointerEvents="none" h="40px" pl={3}>
                <Icon as={FiSearch} color="#56756D" />
              </InputLeftElement>
              <Input 
                placeholder="Search patient by name, email, or file #..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                bg="rgba(250, 248, 245, 0.85)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.15)"
                borderRadius="full"
                h="40px"
                fontSize="13px"
                pl="38px"
                pr={search ? "38px" : "12px"}
                _focus={{ borderColor: "#56756D", bg: "white", boxShadow: "0 0 0 1px #56756D" }}
              />
              {search && (
                <InputRightElement h="40px" pr={2}>
                  <IconButton 
                    icon={<FiX />} 
                    size="xs" 
                    variant="ghost" 
                    aria-label="Clear search" 
                    borderRadius="full"
                    onClick={() => setSearch("")} 
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <HStack spacing={2} overflowX="auto" py={1}>
              {[
                { key: "all", label: "All Patients", count: filteredClients.length },
                { key: "active", label: "Active", count: activeClients.length },
                { key: "archived", label: "Archived", count: terminatedClients.length },
              ].map((tab) => {
                const isSelected = filterTab === tab.key;
                return (
                  <Button
                    key={tab.key}
                    size="sm"
                    borderRadius="full"
                    h="34px"
                    px={3.5}
                    fontSize="12.5px"
                    fontWeight="600"
                    bg={isSelected ? "#56756D" : "rgba(250, 248, 245, 0.9)"}
                    color={isSelected ? "white" : "#5A6E65"}
                    border="1px solid"
                    borderColor={isSelected ? "#56756D" : "rgba(86, 117, 109, 0.15)"}
                    _hover={{ bg: isSelected ? "#263A33" : "rgba(86, 117, 109, 0.08)" }}
                    onClick={() => setFilterTab(tab.key)}
                    transition="0.15s"
                  >
                    {tab.label} ({tab.count})
                  </Button>
                );
              })}
            </HStack>
          </Flex>

          {loading ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Spinner color="#56756D" size="xl" thickness="3px" />
                <Text color="#5A6E65" fontSize="13px" fontWeight="500">Retrieving Caseload...</Text>
              </VStack>
            </Center>
          ) : displayedClients.length === 0 ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Circle size="52px" bg="rgba(86, 117, 109, 0.08)" color="#56756D">
                  <Icon as={FiUsers} boxSize="24px" />
                </Circle>
                <Text fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" fontSize="16px" color="#263A33">
                  No Patient Records Found
                </Text>
                <Text fontSize="13px" color="#5A6E65" maxW="360px" textAlign="center">
                  {search ? `No patients match "${search}". Try searching another name or file number.` : `No ${filterTab} patients in your clinical caseload.`}
                </Text>
                {search && (
                  <Button 
                    variant="outline" 
                    borderColor="rgba(86, 117, 109, 0.25)" 
                    color="#263A33" 
                    borderRadius="full" 
                    size="sm" 
                    h="34px" 
                    fontSize="12.5px"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </Button>
                )}
              </VStack>
            </Center>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box display={{ base: "none", md: "block" }} overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" color="#56756D" borderColor="rgba(86, 117, 109, 0.12)" py={3.5}>
                        PATIENT NAME
                      </Th>
                      <Th fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" color="#56756D" borderColor="rgba(86, 117, 109, 0.12)" py={3.5}>
                        CONTACT DETAILS
                      </Th>
                      <Th fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" color="#56756D" borderColor="rgba(86, 117, 109, 0.12)" py={3.5}>
                        FILE NUMBER
                      </Th>
                      <Th fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" color="#56756D" borderColor="rgba(86, 117, 109, 0.12)" py={3.5}>
                        INTAKE STATUS
                      </Th>
                      <Th textAlign="right" fontSize="10.5px" fontWeight="700" letterSpacing="0.08em" color="#56756D" borderColor="rgba(86, 117, 109, 0.12)" py={3.5}>
                        ACTIONS
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedClients.map((client) => {
                      const isTerminated = !!client.terminated_patient;
                      return (
                        <Tr 
                          key={client.id} 
                          _hover={{ bg: "rgba(250, 248, 245, 0.85)" }} 
                          transition="0.15s" 
                          cursor="pointer" 
                          onClick={() => { setSelectedClient(client); setViewMode("detail"); }}
                        >
                          <Td borderColor="rgba(86, 117, 109, 0.08)" py={3.5}>
                            <HStack spacing={3}>
                              <Avatar 
                                size="sm" 
                                name={client.name} 
                                bg={isTerminated ? "rgba(239, 68, 68, 0.1)" : "rgba(86, 117, 109, 0.12)"} 
                                color={isTerminated ? "#B91C1C" : "#263A33"} 
                                fontWeight="600" 
                                border="1px solid"
                                borderColor={isTerminated ? "rgba(239, 68, 68, 0.2)" : "rgba(86, 117, 109, 0.2)"}
                              />
                              <VStack align="start" spacing={0}>
                                <Text 
                                  fontWeight="600" 
                                  color="#263A33" 
                                  fontSize="13.5px" 
                                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                                >
                                  {client.name}
                                </Text>
                                {client.preferred_first_name && (
                                  <Text fontSize="11px" color="#718096">
                                    Prefers: {client.preferred_first_name}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Td>
                          <Td borderColor="rgba(86, 117, 109, 0.08)" py={3.5}>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="13px" color="#5A6E65">{client.email || "—"}</Text>
                              {client.phone_number && (
                                <Text fontSize="11.5px" color="#718096">{client.phone_number}</Text>
                              )}
                            </VStack>
                          </Td>
                          <Td borderColor="rgba(86, 117, 109, 0.08)" py={3.5}>
                            <Badge 
                              bg="rgba(86, 117, 109, 0.08)" 
                              color="#263A33" 
                              borderRadius="md" 
                              px={2} 
                              py={0.5} 
                              fontSize="11.5px" 
                              fontWeight="600"
                            >
                              {client.client_file_number || "—"}
                            </Badge>
                          </Td>
                          <Td borderColor="rgba(86, 117, 109, 0.08)" py={3.5}>
                            {isTerminated ? (
                              <Badge 
                                bg="rgba(239, 68, 68, 0.1)" 
                                color="#B91C1C" 
                                border="1px solid rgba(239, 68, 68, 0.25)" 
                                fontSize="10.5px" 
                                fontWeight="700" 
                                borderRadius="full" 
                                px={2.5} 
                                py="2px"
                              >
                                ARCHIVED
                              </Badge>
                            ) : (
                              <Badge 
                                bg="rgba(16, 185, 129, 0.12)" 
                                color="#047857" 
                                border="1px solid rgba(16, 185, 129, 0.25)" 
                                fontSize="10.5px" 
                                fontWeight="700" 
                                borderRadius="full" 
                                px={2.5} 
                                py="2px"
                              >
                                ACTIVE
                              </Badge>
                            )}
                          </Td>
                          <Td textAlign="right" borderColor="rgba(86, 117, 109, 0.08)" py={3.5}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              borderColor="rgba(86, 117, 109, 0.25)" 
                              color="#263A33" 
                              borderRadius="full" 
                              h="32px" 
                              fontSize="12px" 
                              fontWeight="600" 
                              px={3.5}
                              _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                              rightIcon={<FiArrowRight />}
                            >
                              Open File
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>

              {/* Mobile Card List */}
              <VStack display={{ base: "flex", md: "none" }} spacing={3} align="stretch">
                {displayedClients.map((client) => {
                  const isTerminated = !!client.terminated_patient;
                  return (
                    <Box 
                      key={client.id} 
                      p={4} 
                      borderRadius="xl" 
                      border="1px solid" 
                      borderColor="rgba(86, 117, 109, 0.12)" 
                      bg="rgba(250, 248, 245, 0.85)"
                      onClick={() => { setSelectedClient(client); setViewMode("detail"); }}
                      cursor="pointer"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={2.5}>
                          <Avatar 
                            size="sm" 
                            name={client.name} 
                            bg={isTerminated ? "rgba(239, 68, 68, 0.1)" : "rgba(86, 117, 109, 0.15)"} 
                            color={isTerminated ? "#B91C1C" : "#263A33"} 
                            fontWeight="600" 
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600" fontSize="13.5px" fontFamily="'Outfit', sans-serif" color="#263A33">
                              {client.name}
                            </Text>
                            <Text fontSize="12px" color="#5A6E65">{client.email}</Text>
                          </VStack>
                        </HStack>
                        <Badge 
                          bg={isTerminated ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.12)"} 
                          color={isTerminated ? "#B91C1C" : "#047857"} 
                          borderRadius="full" 
                          px={2} 
                          fontSize="10px" 
                          fontWeight="700" 
                        >
                          {isTerminated ? "ARCHIVED" : "ACTIVE"}
                        </Badge>
                      </Flex>
                      <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.08)">
                        <Text fontSize="11px" color="#718096" fontWeight="600">
                          FILE: {client.client_file_number || "—"}
                        </Text>
                        <Button size="xs" variant="ghost" color="#56756D" fontWeight="600" rightIcon={<FiArrowRight />}>
                          Open File
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </>
          )}
        </Box>
      )}

      {viewMode === "add" && (
        <Box 
          bg="white" 
          p={{ base: 5, md: 6 }} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
          maxW="4xl" 
          mx="auto"
        >
          <Heading 
            fontSize="18px" 
            fontFamily="'Outfit', var(--font-outfit), sans-serif" 
            fontWeight="600" 
            color="#263A33" 
            mb={6}
          >
            Clinical Registration Form
          </Heading>
          <VStack spacing={6} align="stretch">
             <DetailCard title="Identity Basics">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                   <FormControl isRequired>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">First Name</FormLabel>
                     <Input placeholder="Legal First Name" value={newClient.first_name} onChange={(e) => setNewClient({...newClient, first_name: e.target.value})} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.18)" fontSize="13px" h="38px" _focus={{ borderColor: "#56756D", bg: "white" }} />
                   </FormControl>
                   <FormControl isRequired>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">Last Name</FormLabel>
                     <Input placeholder="Legal Surname" value={newClient.last_name} onChange={(e) => setNewClient({...newClient, last_name: e.target.value})} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.18)" fontSize="13px" h="38px" _focus={{ borderColor: "#56756D", bg: "white" }} />
                   </FormControl>
                   <FormControl isRequired>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">Professional Email</FormLabel>
                     <Input type="email" placeholder="patient@example.com" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.18)" fontSize="13px" h="38px" _focus={{ borderColor: "#56756D", bg: "white" }} />
                   </FormControl>
                   <FormControl>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">Phone Number</FormLabel>
                     <Input placeholder="+965" value={newClient.phone_number} onChange={(e) => setNewClient({...newClient, phone_number: e.target.value})} borderRadius="xl" bg="rgba(250, 248, 245, 0.85)" border="1px solid rgba(86, 117, 109, 0.18)" fontSize="13px" h="38px" _focus={{ borderColor: "#56756D", bg: "white" }} />
                   </FormControl>
                </SimpleGrid>
             </DetailCard>
             
             <DetailCard title="Clinical Specifics">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                   <FormControl>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">Date of Birth</FormLabel>
                     <ModernDatePicker
                        value={newClient.date_of_birth}
                        onChange={(val) => setNewClient({ ...newClient, date_of_birth: val })}
                        placeholder="Select Date of Birth"
                        minYear={1920}
                        maxYear={new Date().getFullYear()}
                        h="38px"
                      />
                   </FormControl>
                   <FormControl>
                     <FormLabel fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em">Sex</FormLabel>
                     <ModernSelect
                       value={newClient.sex}
                       onChange={(val) => setNewClient({...newClient, sex: val})}
                       options={["Female", "Male", "Intersex", "Other"]}
                       placeholder="Select"
                     />
                   </FormControl>
                </SimpleGrid>
             </DetailCard>
             
             <Flex justify="flex-end" pt={2}>
                <HStack spacing={3}>
                   <Button variant="outline" borderColor="rgba(86, 117, 109, 0.25)" color="#263A33" borderRadius="full" h="38px" fontSize="12.5px" fontWeight="600" px={4} onClick={() => setViewMode("list")}>
                     Discard
                   </Button>
                   <Button 
                     bg="#56756D" 
                     color="white" 
                     px={6} 
                     borderRadius="full" 
                     h="38px" 
                     fontSize="13px" 
                     fontWeight="600" 
                     onClick={handleAddClient} 
                     _hover={{ bg: '#263A33' }}
                     _active={{ bg: '#263A33' }}
                     boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                   >
                     Save Global Client File
                   </Button>
                </HStack>
             </Flex>
          </VStack>
        </Box>
      )}

      {viewMode === "detail" && renderClientDetail()}
    </Box>
  );
}

function NavButton({ icon, label, count, active, onClick }) {
  return (
    <HStack 
      justify="space-between" 
      p={2.5} 
      px={3.5} 
      borderRadius="xl" 
      bg={active ? "rgba(86, 117, 109, 0.08)" : "transparent"} 
      color={active ? "#263A33" : "#5A6E65"}
      fontWeight={active ? "600" : "500"}
      fontSize="13px"
      _hover={{ bg: "rgba(86, 117, 109, 0.06)", color: "#263A33" }}
      cursor="pointer"
      onClick={onClick}
      transition="0.15s"
      position="relative"
    >
      {active && (
        <Box 
          position="absolute" 
          left="0" 
          top="50%" 
          transform="translateY(-50%)" 
          w="3px" 
          h="16px" 
          borderRadius="full" 
          bg="#56756D" 
        />
      )}
      <HStack spacing={2.5} minW={0}>
         <Circle size="28px" bg={active ? "#56756D" : "rgba(86, 117, 109, 0.08)"} color={active ? "white" : "#56756D"} transition="0.15s">
           <Icon as={icon} boxSize="13px" />
         </Circle>
         <Text fontSize="13px" whiteSpace="normal" wordBreak="break-word">{label}</Text>
      </HStack>
      {count !== undefined && (
        <Badge bg={active ? "#56756D" : "rgba(86, 117, 109, 0.12)"} color={active ? "white" : "#56756D"} borderRadius="full" px={2} fontSize="10px" fontWeight="700">
          {count}
        </Badge>
      )}
    </HStack>
  );
}

function DetailCard({ title, children, isEditing }) {
  return (
    <Box 
      bg="white" 
      p={{ base: 4, md: 5 }} 
      borderRadius="2xl" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
      border="1px solid" 
      borderColor={isEditing ? "rgba(86, 117, 109, 0.4)" : "rgba(86, 117, 109, 0.14)"}
    >
       <Heading 
         fontSize="15px" 
         fontFamily="'Outfit', var(--font-outfit), sans-serif" 
         fontWeight="600" 
         color="#263A33" 
         mb={5} 
         letterSpacing="-0.01em"
       >
         {title}
       </Heading>
       {children}
    </Box>
  );
}

function DataField({ label, value, isEditing, onChange, type = "text", options = [] }) {
  return (
    <Box>
       <Text fontSize="11px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
         {label}
       </Text>
       {isEditing ? (
         type === "select" ? (
           <ModernSelect
             value={value || ""} 
             onChange={(val) => onChange(val)} 
             options={options}
             placeholder="Select"
           />
         ) : type === "date" ? (
           <ModernDatePicker
             value={value || ""}
             onChange={(val) => onChange(val)}
             placeholder="Select date"
             minYear={1920}
             maxYear={new Date().getFullYear()}
             h="38px"
           />
         ) : (
           <Input 
             type={type} 
             value={value || ""} 
             onChange={(e) => onChange(e.target.value)} 
             borderRadius="xl"
             bg="rgba(250, 248, 245, 0.85)"
             border="1px solid rgba(86, 117, 109, 0.18)"
             fontSize="13px"
             h="38px"
             _focus={{ borderColor: "#56756D", bg: "white" }}
           />
         )
       ) : (
         <Text fontSize="13.5px" fontWeight="500" color="#263A33">
           {value || "—"}
         </Text>
       )}
    </Box>
  );
}

function ModernSelect({ value, onChange, options = [], placeholder = "Select", isDisabled = false, w = "full", minW = "160px" }) {
  const formattedOptions = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
  const selectedOption = formattedOptions.find((o) => String(o.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const hasValue = !!selectedOption && selectedOption.value !== "";

  return (
    <Menu placement="bottom-start" matchWidth autoSelect={false}>
      {({ isOpen }) => (
        <Box w={w}>
          <MenuButton
            as={Button}
            isDisabled={isDisabled}
            w="full"
            h="38px"
            px={3.5}
            borderRadius="xl"
            bg={isOpen ? "white" : "rgba(250, 248, 245, 0.85)"}
            border="1px solid"
            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.18)"}
            boxShadow={isOpen ? "0 0 0 1px #56756D" : "none"}
            _hover={{ bg: "white", borderColor: "#56756D" }}
            _active={{ bg: "white" }}
            textAlign="left"
            rightIcon={
              <Icon
                as={FiChevronDown}
                transition="transform 0.2s"
                transform={isOpen ? "rotate(180deg)" : "none"}
                color="#56756D"
                boxSize="14px"
              />
            }
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text
              as="span"
              fontSize="13px"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontWeight={hasValue ? "500" : "400"}
              color={hasValue ? "#263A33" : "#718096"}
              isTruncated
            >
              {displayText}
            </Text>
          </MenuButton>
          <MenuList
            bg="white"
            borderRadius="xl"
            p={1.5}
            border="1px solid rgba(86, 117, 109, 0.15)"
            boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
            zIndex={1400}
            minW={minW}
            maxH="240px"
            overflowY="auto"
          >
            {placeholder && (
              <MenuItem
                borderRadius="lg"
                px={3}
                py={2}
                fontSize="12.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="500"
                color="#718096"
                _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                onClick={() => onChange("")}
              >
                {placeholder}
              </MenuItem>
            )}
            {formattedOptions.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <MenuItem
                  key={opt.value}
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="13px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight={active ? "600" : "500"}
                  color={active ? "#263A33" : "#5A6E65"}
                  bg={active ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                  _hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}
                  onClick={() => onChange(opt.value)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="span" isTruncated>{opt.label}</Text>
                  {active && <Icon as={FiCheck} color="#56756D" boxSize="13px" />}
                </MenuItem>
              );
            })}
          </MenuList>
        </Box>
      )}
    </Menu>
  );
}
