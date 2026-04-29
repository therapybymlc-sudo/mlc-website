'use client'

import {
  Box, Heading, Text, VStack, HStack, Stack, Button, Table, Thead, Tbody, Tr, Th, Td,
  FormControl, FormLabel, Input, Textarea, Select, useToast, Spinner, Divider, Checkbox, Badge,
  SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, InputLeftElement,
  Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, IconButton, Icon, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Flex,
  Center, Grid, GridItem
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { FiArrowLeft, FiSave, FiCheckCircle, FiCopy, FiClock, FiSearch, FiUser, FiCalendar, FiAlertCircle, FiClipboard, FiDownload } from "react-icons/fi";
import { apiGet, apiPost, apiPut } from "../../../../../../api.js";
import { useRouter, useSearchParams } from "next/navigation";
import { exportNoteToPDF } from "../../../../../../utils/ClinicalPDFService.js";

/* =========================================
   Structured Field Renderer
========================================= */
/* =========================================
   Finalized Note Viewer (Non-Editable)
========================================= */
function FinalizedNoteView({ template, values, providerName, linkedAppointment }) {
  const fieldsByRef = {};
  if (template?.fields) {
    template.fields.forEach(f => {
      if (f.field_key) fieldsByRef[f.field_key] = f;
      fieldsByRef[f.id] = f;
    });
  }
  if (template?.sections) {
    template.sections.forEach(s => {
      if (s.fields) {
        s.fields.forEach(f => {
          if (f.field_key) fieldsByRef[f.field_key] = f;
          if (f.id) fieldsByRef[f.id] = f;
        });
      }
    });
  }

  // Group current values by section for rendering
  const sections = (template?.sections && template.sections.length > 0) 
    ? template.sections 
    : [{ title: "Clinical Record", fields: template?.fields || [] }];

  return (
    <VStack align="stretch" spacing={8} pb={20}>
      <Box bg="white" borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
         <Box bg="gray.50" px={8} py={4} borderBottom="1px solid" borderColor="gray.100">
            <Heading size="xs" color="gray.600" textTransform="uppercase" letterSpacing="widest">Session Context</Heading>
         </Box>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} p={8}>
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1} textTransform="uppercase">Provider</Text>
              <Text fontSize="md" color="gray.800">{providerName || "—"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1} textTransform="uppercase">Session</Text>
              <Text fontSize="md" color="gray.800">
                {linkedAppointment
                  ? `${new Date(linkedAppointment.date || linkedAppointment.start_time).toLocaleString()}`
                  : "—"}
              </Text>
            </Box>
         </SimpleGrid>
      </Box>

      {sections.map((section, idx) => (
        <Box key={idx} bg="white" borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
           <Box bg="gray.50" px={8} py={4} borderBottom="1px solid" borderColor="gray.100">
              <Heading size="xs" color="gray.600" textTransform="uppercase" letterSpacing="widest">{section.title || "Section"}</Heading>
           </Box>
           <SimpleGrid columns={1} spacing={6} p={8}>
              {(section.fields || []).map(f => {
                const val = values[f.field_key] ?? values[String(f.id)] ?? values[f.id];
                const display = Array.isArray(val) ? val.join(", ") : (val === undefined || val === null || val === "" ? "—" : String(val));
                return (
                  <Box key={f.id || f.field_key} pb={4} borderBottom="1px solid" borderColor="gray.50" _last={{ borderBottom: "none" }}>
                     <Text fontSize="xs" fontWeight="bold" color="teal.600" mb={1} textTransform="uppercase">{f.label}</Text>
                     <Text fontSize="md" color="gray.800" whiteSpace="pre-wrap" lineHeight="tall">
                        {display}
                     </Text>
                  </Box>
                );
              })}
           </SimpleGrid>
        </Box>
      ))}
      
      {/* Fallback for orphaned data points (data in values but not in current template) */}
      {Object.entries(values).some(([k]) => !fieldsByRef[k]) && (
        <Box bg="orange.50" borderRadius="3xl" p={8} border="1px dashed" borderColor="orange.200">
           <Heading size="xs" color="orange.700" mb={4}>LEGACY / UNMAPPED DATA POINTS</Heading>
           <SimpleGrid columns={1} spacing={4}>
              {Object.entries(values).map(([k, v]) => {
                if (fieldsByRef[k]) return null;
                return (
                  <HStack key={k} justify="space-between" align="start">
                     <Text fontSize="xs" fontWeight="bold" color="orange.400">{k.toUpperCase()}</Text>
                     <Text fontSize="sm" color="orange.800">{Array.isArray(v) ? v.join(", ") : String(v)}</Text>
                  </HStack>
                );
              })}
           </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}

function FieldInput({ field, value, onChange, isReadOnly = false }) {
  const { field_type, options = {} } = field;
  const set = (val) => onChange(field.field_key || field.id, val);
  const choices = Array.isArray(options.choices) ? options.choices : [];

  switch (field_type) {
    case "textarea":
      return <Textarea value={value ?? ""} onChange={(e) => set(e.target.value)} isReadOnly={isReadOnly} borderRadius="xl" bg="gray.50" rows={4} />;
    case "select":
      return (
        <Select value={value ?? ""} onChange={(e) => set(e.target.value)} isReadOnly={isReadOnly} borderRadius="xl" bg="gray.50">
          <option value="">Select Option...</option>
          {choices.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
        </Select>
      );
    case "checkboxes":
      const currentValues = Array.isArray(value) ? value : [];
      const toggle = (choice) => {
        if (isReadOnly) return;
        const next = currentValues.includes(choice) ? currentValues.filter(v => v !== choice) : [...currentValues, choice];
        set(next);
      };
      return (
        <Wrap spacing={3}>
          {choices.map((c, idx) => (
            <WrapItem key={idx}>
              <Button 
                size="sm" 
                variant={currentValues.includes(c) ? "solid" : "outline"} 
                colorScheme={currentValues.includes(c) ? "teal" : "gray"}
                borderRadius="full"
                onClick={() => toggle(c)}
                isDisabled={isReadOnly}
              >
                {c}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      );
    case "likert":
      const min = Number(options.min) || 1;
      const max = Number(options.max) || 5;
      return (
        <VStack align="stretch" spacing={4} p={2}>
           <HStack justify="space-between" fontSize="xs" color="gray.500" fontWeight="bold">
              <Text>{options.min_label || "LOW"}</Text>
              <Text>{options.max_label || "HIGH"}</Text>
           </HStack>
           <Slider value={Number(value) || min} min={min} max={max} step={1} onChange={val => set(val)} isDisabled={isReadOnly}>
              <SliderTrack bg="teal.50"><SliderFilledTrack bg="teal.500" /></SliderTrack>
              <SliderThumb boxSize={6}><Box color="teal.500" as={FiCheckCircle} /></SliderThumb>
              {Array.from({ length: max - min + 1 }).map((_, i) => (
                <SliderMark key={i} value={min + i} mt={2} ml={-1} fontSize="xs">{min + i}</SliderMark>
              ))}
           </Slider>
        </VStack>
      );
    default:
      return <Input value={value ?? ""} onChange={(e) => set(e.target.value)} isReadOnly={isReadOnly} borderRadius="xl" bg="gray.50" />;
  }
}

/* =========================================
   Note Editor (The Clinical Cockpit)
========================================= */
export default function NoteEditorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const clientId = searchParams.get("clientId");
  const noteId = searchParams.get("noteId");
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [pastNotes, setPastNotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [providerName, setProviderName] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentId || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [values, setValues] = useState({});
  const [noteStatus, setNoteStatus] = useState("draft");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [searchNotes, setSearchNotes] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 5;

  const appointmentId = searchParams.get("appointmentId");
  const eventTypeId = searchParams.get("eventTypeId");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tpls, clnt, prev, appts, therapistMe] = await Promise.all([
        apiGet("note-templates/"),
        clientId ? apiGet(`clients/${clientId}/`) : Promise.resolve(null),
        clientId ? apiGet(`notes/?client=${clientId}`) : Promise.resolve([]),
        clientId ? apiGet(`appointments/?client=${clientId}`) : Promise.resolve([]),
        apiGet("therapists/me/").catch(() => null),
      ]);
      const templatesList = Array.isArray(tpls) ? tpls : tpls.results || [];
      setTemplates(templatesList);
      setClient(clnt);
      setPastNotes(Array.isArray(prev) ? prev : prev.results || []);
      setAppointments(Array.isArray(appts) ? appts : appts.results || []);
      setProviderName(therapistMe?.name || therapistMe?.first_name || "");
      
      // 🚀 Clinical Hot-Link: MISSION AUTO-PILOT
      if (!noteId && eventTypeId && templatesList.length > 0) {
        // Find template where event_type matches missionTypeId
        const matching = templatesList.find(t => {
          const tTypeId = (t.event_type && typeof t.event_type === 'object') ? t.event_type.id : t.event_type;
          return String(tTypeId) === String(eventTypeId);
        });

        if (matching) {
          setSelectedTemplateId(String(matching.id));
        }
      }

      if (noteId) {
        const n = await apiGet(`notes/${noteId}/`);
        setSelectedTemplateId(String(n.template));
        setValues(n.data || {});
        setNoteStatus(n.status);
        setIsReadOnly(n.status === "final");
        setSelectedAppointmentId(n.appointment ? String(n.appointment) : (appointmentId || ""));
      } else {
        setSelectedAppointmentId(appointmentId || "");
      }
    } catch (e) {
      toast({ title: "Clinical Sync Error", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); loadData(); }, [clientId, noteId]);

  const selectedTemplate = useMemo(() => 
    templates.find(t => String(t.id) === String(selectedTemplateId)), 
  [templates, selectedTemplateId]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const aTs = new Date(a.date || a.start_time || 0).getTime();
      const bTs = new Date(b.date || b.start_time || 0).getTime();
      return bTs - aTs;
    });
  }, [appointments]);

  const sortedPastNotes = useMemo(() => {
    return [...pastNotes].sort((a, b) => {
      const aTs = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTs = new Date(b.updated_at || b.created_at || 0).getTime();
      return bTs - aTs;
    });
  }, [pastNotes]);

  const filteredPastNotes = useMemo(() => {
    const q = searchNotes.trim().toLowerCase();
    if (!q) return sortedPastNotes;
    return sortedPastNotes.filter((n) => {
      const name = String(n.template_name || "").toLowerCase();
      const status = String(n.status || "").toLowerCase();
      const text = JSON.stringify(n.data || {}).toLowerCase();
      return name.includes(q) || status.includes(q) || text.includes(q);
    });
  }, [sortedPastNotes, searchNotes]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredPastNotes.length / HISTORY_PAGE_SIZE));
  const pagedPastNotes = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return filteredPastNotes.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredPastNotes, historyPage]);

  useEffect(() => {
    setHistoryPage(1);
  }, [searchNotes, pastNotes.length]);

  useEffect(() => {
    if (historyPage > totalHistoryPages) setHistoryPage(totalHistoryPages);
  }, [historyPage, totalHistoryPages]);

  const renderHistoryData = (note) => {
    const tpl = templates.find((t) => String(t.id) === String(note.template));
    const noteValues = note.data || {};
    const groupedSections = (tpl?.sections && tpl.sections.length > 0)
      ? tpl.sections
      : [{ title: "Clinical Record", fields: tpl?.fields || [] }];

    return (
      <VStack align="stretch" spacing={3}>
        {groupedSections.map((section, idx) => (
          <Box key={`${note.id}-sec-${idx}`} bg="gray.50" borderRadius="lg" p={3}>
            <Text fontSize="2xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={2}>
              {section.title || "Section"}
            </Text>
            <VStack align="stretch" spacing={2}>
              {(section.fields || []).map((field) => {
                const val = noteValues[field.field_key] ?? noteValues[String(field.id)] ?? noteValues[field.id];
                const display = Array.isArray(val) ? val.join(", ") : (val === undefined || val === null || val === "" ? "—" : String(val));
                return (
                  <Box key={`${note.id}-${field.id || field.field_key}`}>
                    <Text fontSize="2xs" color="teal.600" fontWeight="700">{field.label}</Text>
                    <Text fontSize="xs" color="gray.700" whiteSpace="pre-wrap">{display}</Text>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        ))}
      </VStack>
    );
  };

  const handleSave = async (statusOverride) => {
    try {
      const status = statusOverride || noteStatus;
      const payload = {
        client: Number(clientId),
        template: Number(selectedTemplateId),
        data: {
          ...values,
          provider_name: providerName || values.provider_name,
        },
        status: status,
        appointment: selectedAppointmentId ? Number(selectedAppointmentId) : null,
      };
      if (noteId) await apiPut(`notes/${noteId}/`, payload);
      else {
        const res = await apiPost("notes/", payload);
        router.replace(`/dashboard/therapist/notes/edit?clientId=${clientId}&noteId=${res.id}`);
      }
      toast({ title: status === "final" ? "Note Finalized" : "Draft Secure", status: "success" });
      if (status === "final") setIsReadOnly(true);
    } catch (e) {
      toast({ title: "Save Failed", status: "error" });
    }
  };

  const linkedAppointment = useMemo(() => 
    appointments.find(a => String(a.id) === String(selectedAppointmentId)),
  [appointments, selectedAppointmentId]);

  if (!mounted || loading) return <Center py={20}><Spinner color="teal.500" size="xl" /></Center>;

  return (
    <Box>
      {/* Top Cockpit Bar */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" mb={8} gap={4} bg="white" p={6} borderRadius="3xl" shadow="sm">
         <HStack spacing={4}>
            <IconButton icon={<FiArrowLeft />} onClick={() => router.back()} borderRadius="full" variant="ghost" />
            <VStack align="start" spacing={0}>
               <Heading size="md" fontFamily="'Playfair Display', serif">{client?.name || "New Record"}</Heading>
               <HStack>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="full">{noteStatus.toUpperCase()}</Badge>
                  <Text fontSize="xs" color="gray.400">Clinical Session Documentation</Text>
                  {linkedAppointment && (
                    <Badge colorScheme="purple" variant="outline" borderRadius="full" px={3}>
                      Linked to Session: {new Date(linkedAppointment.date || linkedAppointment.start_time).toLocaleDateString()}
                    </Badge>
                  )}
               </HStack>
            </VStack>
         </HStack>
         <HStack spacing={3}>
                <Button
                  leftIcon={<FiPlus />}
                  variant="ghost"
                  borderRadius="full"
                  onClick={() => router.push(`/dashboard/therapist/notes/edit?clientId=${clientId}`)}
                >
                  New Note
                </Button>
          </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 380px" }} gap={8}>
         {/* LEFT: Structured Entry Workstation */}
         <GridItem>
            <VStack align="stretch" spacing={6}>
               <Box bg="blue.50" p={6} borderRadius="2xl" border="1px dashed" borderColor="blue.100">
                  <VStack align="stretch" spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold" color="blue.600">PROVIDER</FormLabel>
                        <Input bg="white" borderRadius="xl" value={providerName || "—"} isReadOnly />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="bold" color="blue.600">SESSION</FormLabel>
                        <Select
                          bg="white"
                          borderRadius="xl"
                          placeholder="Select session"
                          value={selectedAppointmentId}
                          onChange={(e) => setSelectedAppointmentId(e.target.value)}
                          isDisabled={isReadOnly}
                        >
                          {sortedAppointments.map((a) => (
                            <option key={a.id} value={a.id}>
                              {new Date(a.date || a.start_time).toLocaleString()} - {a.status_label || a.status || "Session"}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    <FormControl>
                       <FormLabel fontSize="xs" fontWeight="bold" color="blue.600">SELECTED CLINICAL TEMPLATE</FormLabel>
                       <Select bg="white" borderRadius="xl" placeholder="Choose a structural model..." value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} isDisabled={isReadOnly}>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </Select>
                    </FormControl>
                  </VStack>
               </Box>

               <Button variant="link" color="red.400" size="xs" leftIcon={<FiAlertCircle />} alignSelf="start" mb={2}>+ ADD MEDICAL ALERT</Button>

               {!selectedTemplate ? (
                 <Center py={20} bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100">
                    <VStack spacing={2} color="gray.400">
                       <Icon as={FiClipboard} w={8} h={8} />
                       <Text fontSize="sm">Please select a clinical template to begin session documentation.</Text>
                    </VStack>
                 </Center>
               ) : (
                 isReadOnly ? (
                  <FinalizedNoteView
                    template={selectedTemplate}
                    values={values}
                    providerName={providerName || values.provider_name}
                    linkedAppointment={linkedAppointment}
                  />
                 ) : (
                   (selectedTemplate.sections && selectedTemplate.sections.length > 0 
                     ? selectedTemplate.sections 
                     : [{ title: "General Assessment", fields: selectedTemplate.fields }]
                   ).map((section, si) => (
                     <Box key={si} bg="white" borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
                        <Box bg="teal.50" px={8} py={3} borderBottom="1px solid" borderColor="teal.50">
                           <Heading size="xs" color="teal.700" letterSpacing="wider">{section.title || "Observation"}</Heading>
                        </Box>
                        <VStack p={8} align="stretch" spacing={6}>
                           {(section.fields || []).map(f => (
                             <FormControl key={f.id}>
                                <FormLabel fontSize="sm" fontWeight="bold">{f.label}</FormLabel>
                                <FieldInput field={f} value={values[f.field_key] || values[f.id]} onChange={(fid, val) => setValues({...values, [fid]: val})} isReadOnly={isReadOnly} />
                             </FormControl>
                           ))}
                        </VStack>
                     </Box>
                   ))
                 )
                )}
                
                {selectedTemplate && (
                  <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" mt={4}>
                    <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} spacing={6}>
                       <VStack align="start" spacing={1}>
                          <Text fontWeight="bold" fontSize="sm" color="gray.600">Session Status: {noteStatus.toUpperCase()}</Text>
                          <Text fontSize="xs" color="gray.400">Ensure all clinical fields are accurate before finalization.</Text>
                       </VStack>
                       <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                          <Button
                            leftIcon={<FiDownload />}
                            variant="outline"
                            borderColor="teal.200"
                            color="teal.600"
                            borderRadius="full"
                            onClick={() =>
                              exportNoteToPDF(
                                client,
                                { data: values, template: selectedTemplateId, template_name: selectedTemplate?.name },
                                "MLC Professional",
                                selectedTemplate
                              )
                            }
                            isDisabled={!selectedTemplateId}
                          >
                            Export PDF
                          </Button>
                          <Button 
                            leftIcon={<FiSave />} 
                            variant="ghost" 
                            color="gray.500" 
                            onClick={() => handleSave('draft')} 
                            isDisabled={isReadOnly}
                            _hover={{ bg: 'gray.50' }}
                          >
                            Save Draft
                          </Button>
                          <Button 
                            leftIcon={<FiCheckCircle />} 
                            bg="#2C8B9A" 
                            color="white" 
                            px={10} 
                            borderRadius="full" 
                            onClick={() => handleSave('final')}
                            isDisabled={isReadOnly}
                            _hover={{ bg: '#236e7a' }}
                            shadow="lg"
                          >
                            {isReadOnly ? "Record Finalized" : "Finalize Clinical Record"}
                          </Button>
                       </Stack>
                    </Stack>
                  </Box>
                )}
             </VStack>
          </GridItem>

         {/* RIGHT: Clinical Reference Sidebar */}
         <GridItem>
            <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" position="sticky" top="20px">
               <Tabs variant="soft-rounded" colorScheme="teal" size="sm">
                  <TabList mb={4} bg="gray.50" p={1} borderRadius="full">
                     <Tab flex="1">Clinical History</Tab>
                     <Tab flex="1">Client Bio</Tab>
                  </TabList>
                  <TabPanels>
                     <TabPanel p={0}>
                        <VStack align="stretch" spacing={4}>
                           <HStack p={3} bg="gray.50" borderRadius="xl">
                              <Icon as={FiSearch} color="gray.400" />
                              <Input variant="unstyled" fontSize="xs" placeholder="Filter history..." value={searchNotes} onChange={e => setSearchNotes(e.target.value)} />
                           </HStack>
                           {filteredPastNotes.length === 0 ? <Text fontSize="xs" color="gray.400" textAlign="center">No prior session records.</Text> : (
                             <>
                               <VStack align="stretch" spacing={3} maxH="68vh" overflowY="auto" pr={1}>
                               {pagedPastNotes.map(n => (
                               <Box key={n.id} p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100" _hover={{ bg: 'gray.50' }}>
                                  <HStack justify="space-between" mb={2}>
                                     <Text fontWeight="bold" fontSize="xs">{n.template_name}</Text>
                                     <Badge size="xs" colorScheme={n.status === 'final' ? 'green' : 'orange'}>{n.status}</Badge>
                                  </HStack>
                                  <Text fontSize="2xs" color="gray.400" mb={3}>
                                    {new Date(n.updated_at || n.created_at).toLocaleString()}
                                  </Text>
                                  {renderHistoryData(n)}
                                  <HStack mt={3}>
                                    <Button size="xs" variant="outline" borderRadius="full" leftIcon={<FiCopy />} onClick={() => { setValues(n.data || {}); toast({ title: "Clinical Data Cloned", status: "info" }); }}>
                                      Copy to Current
                                    </Button>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      borderRadius="full"
                                      onClick={() => router.push(`/dashboard/therapist/notes/edit?clientId=${clientId}&noteId=${n.id}`)}
                                    >
                                      Open note
                                    </Button>
                                  </HStack>
                               </Box>
                               ))}
                               </VStack>
                               <HStack justify="space-between" pt={1}>
                                 <Text fontSize="2xs" color="gray.500">
                                   Page {historyPage} of {totalHistoryPages}
                                 </Text>
                                 <HStack>
                                   <Button
                                     size="xs"
                                     variant="outline"
                                     borderRadius="full"
                                     onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                                     isDisabled={historyPage <= 1}
                                   >
                                     Previous
                                   </Button>
                                   <Button
                                     size="xs"
                                     variant="outline"
                                     borderRadius="full"
                                     onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                                     isDisabled={historyPage >= totalHistoryPages}
                                   >
                                     Next
                                   </Button>
                                 </HStack>
                               </HStack>
                             </>
                           )}
                        </VStack>
                     </TabPanel>
                     <TabPanel p={0}>
                        <VStack align="stretch" spacing={6}>
                           <DataPiece label="Date of Birth" value={client?.date_of_birth} />
                           <DataPiece label="Sex / Identity" value={`${client?.sex || '-'} / ${client?.gender_identity || '-'}`} />
                           <DataPiece label="Emergency Contact" value={client?.emergency_contact} />
                           <Divider />
                           <Text fontSize="xs" fontWeight="bold" color="gray.300">UPCOMING APPOINTMENTS</Text>
                           {appointments.slice(0, 3).map(a => (
                             <HStack key={a.id} spacing={3}>
                                <Icon as={FiCalendar} color="teal.500" />
                                <Text fontSize="xs" fontWeight="bold">{new Date(a.date).toLocaleDateString()}</Text>
                             </HStack>
                           ))}
                        </VStack>
                     </TabPanel>
                  </TabPanels>
               </Tabs>
            </Box>
         </GridItem>
      </Grid>
    </Box>
  );
}

function DataPiece({ label, value }) {
  return (
    <Box>
       <Text fontSize="2xs" fontWeight="bold" color="gray.400" textTransform="uppercase">{label}</Text>
       <Text fontSize="sm" fontWeight="600">{value || "—"}</Text>
    </Box>
  )
}
