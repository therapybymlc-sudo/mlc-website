'use client'

import {
  Box, Heading, Text, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
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
function FieldInput({ field, value, onChange, isReadOnly = false }) {
  const { field_type, options = {} } = field;
  const set = (val) => onChange(field.id, val);
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
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [values, setValues] = useState({});
  const [noteStatus, setNoteStatus] = useState("draft");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [searchNotes, setSearchNotes] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tpls, clnt, prev, appts] = await Promise.all([
        apiGet("note-templates/"),
        clientId ? apiGet(`clients/${clientId}/`) : Promise.resolve(null),
        clientId ? apiGet(`notes/?client=${clientId}`) : Promise.resolve([]),
        clientId ? apiGet(`appointments/?client=${clientId}`) : Promise.resolve([]),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : tpls.results || []);
      setClient(clnt);
      setPastNotes(Array.isArray(prev) ? prev : prev.results || []);
      setAppointments(Array.isArray(appts) ? appts : appts.results || []);
      
      if (noteId) {
        const n = await apiGet(`notes/${noteId}/`);
        setSelectedTemplateId(String(n.template));
        setValues(n.data || {});
        setNoteStatus(n.status);
        setIsReadOnly(n.status === "final");
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

  const handleSave = async (statusOverride) => {
    try {
      const status = statusOverride || noteStatus;
      const payload = {
        client: Number(clientId),
        template: Number(selectedTemplateId),
        data: values,
        status: status,
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
               </HStack>
            </VStack>
         </HStack>
              <HStack spacing={3}>
                <Button 
                  leftIcon={<FiDownload />} 
                  variant="outline" 
                  borderColor="teal.200" 
                  color="teal.600" 
                  borderRadius="full"
                  onClick={() => exportNoteToPDF(client, { data: values, template: selectedTemplateId, template_name: selectedTemplate?.name }, "MLC Professional", selectedTemplate)}
                  isDisabled={!selectedTemplateId}
                >
                  Export PDF
                </Button>
                <Button leftIcon={<FiSave />} variant="ghost" color="gray.500" onClick={() => handleSave('draft')} isDisabled={isReadOnly}>
                  Save Draft
                </Button>
                <Button 
                  leftIcon={<FiCheckCircle />} 
                  bg="#DB4437" 
                  color="white" 
                  px={8} 
                  borderRadius="full" 
                  onClick={() => handleSave('final')}
                  isDisabled={isReadOnly}
                >
                  {isReadOnly ? "Record Finalized" : "Finalize Record"}
                </Button>
              </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 380px" }} gap={8}>
         {/* LEFT: Structured Entry Workstation */}
         <GridItem>
            <VStack align="stretch" spacing={6}>
               <Box bg="blue.50" p={6} borderRadius="2xl" border="1px dashed" borderColor="blue.100">
                  <FormControl>
                     <FormLabel fontSize="xs" fontWeight="bold" color="blue.600">SELECTED CLINICAL TEMPLATE</FormLabel>
                     <Select bg="white" borderRadius="xl" placeholder="Choose a structural model..." value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} isDisabled={isReadOnly}>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                     </Select>
                  </FormControl>
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
                              <FieldInput field={f} value={values[f.id]} onChange={(fid, val) => setValues({...values, [fid]: val})} isReadOnly={isReadOnly} />
                           </FormControl>
                         ))}
                      </VStack>
                   </Box>
                 ))
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
                           {pastNotes.length === 0 ? <Text fontSize="xs" color="gray.400" textAlign="center">No prior session records.</Text> : (
                             pastNotes.map(n => (
                               <Box key={n.id} p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100" _hover={{ bg: 'gray.50' }}>
                                  <HStack justify="space-between" mb={2}>
                                     <Text fontWeight="bold" fontSize="xs">{n.template_name}</Text>
                                     <Badge size="xs" colorScheme={n.status === 'final' ? 'green' : 'orange'}>{n.status}</Badge>
                                  </HStack>
                                  <Text fontSize="2xs" color="gray.400" mb={3}>{new Date(n.created_at).toLocaleDateString()}</Text>
                                  <Button size="xs" variant="outline" borderRadius="full" leftIcon={<FiCopy />} onClick={() => { setValues(n.data || {}); toast({ title: "Clinical Data Cloned", status: "info" }); }}>Copy to Current</Button>
                               </Box>
                             ))
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
