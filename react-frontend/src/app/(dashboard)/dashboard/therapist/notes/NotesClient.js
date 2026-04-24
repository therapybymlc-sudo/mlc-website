'use client'

import {
  Box, Heading, Text, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, useDisclosure, useToast,
  Spinner, Divider, Checkbox, Badge, CheckboxGroup, Stack, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, Tag, TagLabel, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, InputLeftElement,
  Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, IconButton, Icon, SliderMark, Flex, Center,
  Menu, MenuButton, MenuList, MenuItem, Portal
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiClipboard, FiClock, FiCheckCircle, FiCopy, FiRefreshCcw, FiAlertCircle, FiChevronUp, FiChevronDown, FiPlusCircle, FiChevronRight, FiList, FiCheck } from "react-icons/fi";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../../../api.js";
import { useRouter } from "next/navigation";

/* =========================================
   Clinical Architect Hub
========================================= */
export default function NotesClient() {
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list, builder
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Builder State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "",
    fields: [{ label: "Section 1", field_type: "section", order: 0 }]
  });

  const [eventTypes, setEventTypes] = useState([]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [tpls, ets] = await Promise.all([
        apiGet("note-templates/"),
        apiGet("event-types/"),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : tpls.results || []);
      setEventTypes(Array.isArray(ets) ? ets : ets.results || []);
    } catch (e) {
      toast({ title: "Sync Error", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); loadTemplates(); }, []);

  /* ---------- Architect Logic ---------- */
  const addField = (atIndex = -1) => {
    const newField = {
      label: "New Question",
      field_type: "text",
      is_required: false,
      order: 0,
      options: { choices: [], allow_other: false, min: 1, max: 5 },
    };
    const fields = [...form.fields];
    if (atIndex === -1) fields.push(newField);
    else fields.splice(atIndex + 1, 0, newField);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const addSection = (atIndex = -1) => {
    const newSection = {
      label: "New Section",
      field_type: "section",
      order: 0,
    };
    const fields = [...form.fields];
    if (atIndex === -1) fields.push(newSection);
    else fields.splice(atIndex + 1, 0, newSection);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const moveField = (index, direction) => {
    const fields = [...form.fields];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const removeField = (index) => {
    const fields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: fields.map((f, i) => ({ ...f, order: i })) });
  };

  const updateField = (index, key, val) => {
    const fields = [...form.fields];
    fields[index][key] = val;
    setForm({ ...form, fields });
  };

  const saveTemplate = async () => {
    if (!form.name.trim()) return toast({ title: "Name Required", status: "warning" });
    try {
      const payload = {
        name: form.name,
        description: form.description,
        event_type: form.event_type || null,
        new_fields: form.fields
      };
      if (editingTemplate) await apiPut(`note-templates/${editingTemplate.id}/`, payload);
      else await apiPost("note-templates/", payload);
      toast({ title: "Template Architected", status: "success" });
      setViewMode("list");
      loadTemplates();
    } catch (e) {
      toast({ title: "Save Failed", status: "error" });
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm("Permanently delete this clinical blueprint?")) return;
    try {
      await apiDelete(`note-templates/${id}/`);
      toast({ title: "Template Removed", status: "info" });
      loadTemplates();
    } catch (e) {
      toast({ title: "Delete Failed", status: "error" });
    }
  };

  if (!mounted) return <Center py={20}><Spinner color="teal.500" size="xl" /></Center>;

  /* ---------- Renderers ---------- */

  const renderArchitect = () => (
    <VStack align="stretch" spacing={8} maxW="4xl" mx="auto" animation="fadeIn 0.5s">
      <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
         <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
               <FormControl isRequired>
                  <FormLabel fontWeight="bold">Template Identity</FormLabel>
                  <Input fontSize="lg" fontWeight="bold" placeholder="e.g., SOAP Progress Note" value={form.name} onChange={e => setForm({...form, name: e.target.value})} variant="flushed" />
               </FormControl>
               <FormControl>
                  <FormLabel fontWeight="bold">Associated Appointment Type</FormLabel>
                  <Select borderRadius="xl" placeholder="Generic (Use anywhere)" value={form.event_type || ""} onChange={e => setForm({...form, event_type: e.target.value})}>
                     {eventTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                  </Select>
               </FormControl>
            </SimpleGrid>
            <FormControl>
               <FormLabel fontWeight="bold">Clinical Intent (Description)</FormLabel>
               <Textarea placeholder="Explain when to use this clinical blueprint..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} borderRadius="xl" />
            </FormControl>
         </VStack>
      </Box>

      <VStack align="stretch" spacing={4}>
         {form.fields.map((f, i) => (
           <Box key={i} position="relative" group="architect-field" py={1}>
              <Box 
                bg={f.field_type === 'section' ? 'teal.50' : 'white'} 
                p={4} 
                borderRadius="2xl" 
                shadow={f.field_type === 'section' ? 'none' : 'sm'} 
                border="1px solid" 
                borderColor={f.field_type === 'section' ? 'teal.100' : 'gray.100'}
              >
                <HStack spacing={4} align="center">
                   <VStack spacing={0}>
                      <IconButton icon={<FiChevronUp />} size="xs" variant="ghost" isDisabled={i === 0} onClick={() => moveField(i, -1)} />
                      <IconButton icon={<FiChevronDown />} size="xs" variant="ghost" isDisabled={i === form.fields.length - 1} onClick={() => moveField(i, 1)} />
                   </VStack>
                   
                   <VStack align="stretch" flex="1" spacing={2}>
                      <HStack>
                         <Input 
                           variant="unstyled" 
                           fontWeight="bold" 
                           fontSize={f.field_type === 'section' ? 'md' : 'sm'}
                           placeholder={f.field_type === 'section' ? 'SECTION TITLE' : 'Question Label'} 
                           value={f.label} 
                           onChange={e => updateField(i, 'label', e.target.value)}
                         />
                         {f.field_type !== 'section' && (
                            <Select size="xs" borderRadius="full" w="120px" value={f.field_type} onChange={e => updateField(i, 'field_type', e.target.value)}>
                               <option value="text">Text</option>
                               <option value="textarea">Large Area</option>
                               <option value="checkboxes">Multi-Check</option>
                               <option value="likert">Likert Scale</option>
                            </Select>
                         )}
                         <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeField(i)} />
                      </HStack>
                   </VStack>
                </HStack>
              </Box>

              {/* Insertion Buttons */}
              <HStack 
                position="absolute" 
                bottom="-16px" 
                left="0" 
                right="0" 
                justify="center" 
                zIndex={5} 
                opacity={0} 
                _hover={{ opacity: 1 }}
                spacing={2}
              >
                 <Button size="xs" leftIcon={<FiPlus />} bg="teal.400" color="white" borderRadius="full" px={4} onClick={() => addField(i)}>Add Question</Button>
                 <Button size="xs" leftIcon={<FiList />} bg="teal.600" color="white" borderRadius="full" px={4} onClick={() => addSection(i)}>Add Section</Button>
              </HStack>
           </Box>
         ))}
      </VStack>

      <HStack justify="center" py={10} spacing={4}>
         <Button leftIcon={<FiPlus />} variant="outline" colorScheme="teal" borderRadius="full" onClick={() => addField()}>Add Question to End</Button>
         <Button leftIcon={<FiList />} variant="outline" colorScheme="teal" borderRadius="full" onClick={() => addSection()}>Add Section to End</Button>
      </HStack>

      <Flex justify="flex-end" pt={10} borderTop="1px solid" borderColor="gray.100">
         <HStack spacing={4}>
            <Button variant="ghost" onClick={() => setViewMode("list")}>Discard Blueprint</Button>
            <Button bg="teal.500" color="white" px={10} borderRadius="full" leftIcon={<FiSave />} onClick={saveTemplate}>Finalize Architect</Button>
         </HStack>
      </Flex>
    </VStack>
  );

  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
            Clinical Blueprints
          </Heading>
          <Text color="gray.500">Configure structured session models and documentation standards.</Text>
        </VStack>
        
        {viewMode === "list" && (
          <Menu>
            <MenuButton as={Button} leftIcon={<FiPlus />} bg="teal.500" color="white" _hover={{ bg: "teal.600" }} borderRadius="full" px={8} rightIcon={<FiChevronDown />}>
              Template Actions
            </MenuButton>
            <Portal>
              <MenuList borderRadius="2xl" shadow="xl" border="none" py={2}>
                <MenuItem icon={<FiPlusCircle />} fontWeight="bold" color="teal.600" onClick={() => { setEditingTemplate(null); setForm({ name: "", description: "", fields: [{ label: "Primary Assessment", field_type: "section", order: 0 }] }); setViewMode("builder"); }}>
                  Architect New Model
                </MenuItem>
                <Box h="1px" bg="gray.100" my={2} />
                <Text px={4} py={2} fontSize="10px" fontWeight="bold" color="gray.400" letterSpacing="widest">HOSPITAL STANDARDS</Text>
                {templates.slice(0, 5).map(t => (
                  <MenuItem key={t.id} icon={<FiCopy />} onClick={() => { setEditingTemplate(null); setForm({...t, name: `Copy of ${t.name}`}); setViewMode("builder"); }}>
                    Clone {t.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
        )}
      </Flex>

      {loading ? (
        <Center py={20}><VStack><Spinner color="teal.500" /><Text>Syncing Clinical Library...</Text></VStack></Center>
      ) : (
        viewMode === "list" ? (
          <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <VStack align="stretch" spacing={2} divider={<Divider />}>
              {templates.map(t => (
                <Stack 
                  key={t.id} 
                  p={4} 
                  direction={{ base: "column", md: "row" }}
                  justify="space-between" 
                  align={{ base: "start", md: "center" }} 
                  _hover={{ bg: 'gray.50' }} 
                  transition="0.2s" 
                  borderRadius="2xl"
                  gap={4}
                >
                   <VStack align="start" spacing={0} maxW={{ base: "full", md: "60%" }}>
                      <Text fontWeight="bold" color="gray.800" fontSize={{ base: "sm", md: "md" }}>{t.name}</Text>
                      <Text fontSize="xs" color="gray.400">{t.description || "Structured clinical form."}</Text>
                   </VStack>
                   <HStack w={{ base: "full", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
                      <Badge bg="teal.50" color="teal.700" borderRadius="full" px={3} variant="subtle" whiteSpace="nowrap">{t.fields?.length || 0} DATA POINTS</Badge>
                      <HStack>
                        <IconButton icon={<FiEdit2 />} aria-label="Edit" size="sm" variant="ghost" onClick={() => { setEditingTemplate(t); setForm(t); setViewMode("builder"); }} />
                        <IconButton icon={<FiTrash2 />} aria-label="Delete" size="sm" variant="ghost" colorScheme="red" onClick={() => deleteTemplate(t.id)} />
                      </HStack>
                   </HStack>
                </Stack>
              ))}
              {templates.length === 0 && <Center py={10}><Text color="gray.400">Your clinical library is empty. Start architecting above.</Text></Center>}
            </VStack>
          </Box>
        ) : renderArchitect()
      )}
    </Box>
  );
}
