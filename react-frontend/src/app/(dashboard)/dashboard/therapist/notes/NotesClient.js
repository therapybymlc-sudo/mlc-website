'use client'

import {
  Box, Heading, Text, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, useDisclosure, useToast,
  Spinner, Divider, Checkbox, Badge, CheckboxGroup, Stack, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, Tag, TagLabel, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, InputLeftElement,
  Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, IconButton, Icon, SliderMark, Flex, Center,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiClipboard, FiClock, FiCheckCircle, FiCopy, FiRefreshCcw, FiAlertCircle, FiChevronUp, FiChevronDown, FiPlusCircle } from "react-icons/fi";
import { apiGet, apiPost, apiPut } from "../../../../../api.js";
import { useRouter } from "next/navigation";

/* =========================================
   Field Renderer (Structured)
========================================= */
function FieldInput({ field, value, onChange, isReadOnly = false }) {
  const { field_type, options = {} } = field;
  const set = (val) => onChange(field.id, val);

  switch (field_type) {
    case "textarea":
      return (
        <Textarea
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          isReadOnly={isReadOnly}
          borderRadius="xl"
          bg="gray.50"
          _focus={{ bg: 'white', borderColor: 'teal.500' }}
          rows={4}
        />
      );
    case "likert":
      const min = Number(options.min ?? 1);
      const max = Number(options.max ?? 5);
      const numeric = Number(value ?? min);
      return (
        <Box px={2} pt={4} pb={2}>
           <Slider min={min} max={max} value={numeric} onChange={set} isDisabled={isReadOnly}>
              <SliderTrack bg="teal.50"><SliderFilledTrack bg="teal.500" /></SliderTrack>
              <SliderThumb boxSize={6}><Box color="teal.500" as={FiCheckCircle} /></SliderThumb>
              <SliderMark value={min} mt={2} ml={-2} fontSize="xs">{options.min_label || "Low"}</SliderMark>
              <SliderMark value={max} mt={2} ml={-8} fontSize="xs">{options.max_label || "High"}</SliderMark>
           </Slider>
           <Text fontSize="xs" mt={6} textAlign="center" fontWeight="bold" color="teal.600">Selected Intensity: {numeric}</Text>
        </Box>
      );
    case "checkboxes":
      const choices = options.choices || [];
      const current = Array.isArray(value) ? value : [];
      return (
        <VStack align="start" spacing={2} bg="gray.50" p={4} borderRadius="xl">
          <CheckboxGroup value={current} onChange={set} isDisabled={isReadOnly}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} w="full">
               {choices.map((c, i) => (
                 <Checkbox key={i} value={c} colorScheme="teal">{c}</Checkbox>
               ))}
            </SimpleGrid>
          </CheckboxGroup>
        </VStack>
      );
    default:
      return <Input value={value ?? ""} onChange={(e) => set(e.target.value)} isReadOnly={isReadOnly} borderRadius="xl" bg="gray.50" />;
  }
}

/* =========================================
   Main High-Fidelity Notes Engine
========================================= */
export default function NotesClient() {
  const router = useRouter();
  const toast = useToast();
  const [viewMode, setViewMode] = useState("list"); // list, builder, entry
  const [mounted, setMounted] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Builder State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: "", description: "",
    sections: [{ title: "Primary Assessment", description: "", fields: [{ label: "Clinical Observations", field_type: "textarea", is_required: false, order: 0 }] }]
  });

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiGet("note-templates/");
      setTemplates(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      toast({ title: "Sync Error", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setMounted(true); loadTemplates(); }, []);

  if (!mounted) return <Center py={20}><Spinner color="teal.500" size="xl" /></Center>;

  const handleSaveTemplate = async () => {
    try {
      const payload = { ...templateForm };
      if (editingTemplate) await apiPut(`note-templates/${editingTemplate.id}/`, payload);
      else await apiPost("note-templates/", payload);
      toast({ title: "Template Secured", status: "success" });
      setViewMode("list");
      loadTemplates();
    } catch (e) {
      toast({ title: "Save Failed", status: "error" });
    }
  };

  const addSection = () => setTemplateForm(prev => ({
    ...prev, sections: [...prev.sections, { title: "New Section", fields: [] }]
  }));

  const addField = (si) => setTemplateForm(prev => {
    const s = [...prev.sections];
    s[si].fields.push({ label: "New Field", field_type: "text", order: s[si].fields.length });
    return { ...prev, sections: s };
  });

  /* ----------------- Renderers ----------------- */

  const renderTemplateBuilder = () => (
    <VStack align="stretch" spacing={8} maxW="4xl" mx="auto" animation="fadeIn 0.5s">
      <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
         <VStack spacing={6} align="stretch">
            <FormControl isRequired>
               <FormLabel>Template Name</FormLabel>
               <Input fontSize="lg" fontWeight="bold" placeholder="e.g., Progress Note - SOAP" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} variant="flushed" />
            </FormControl>
            <FormControl>
               <FormLabel>Description</FormLabel>
               <Textarea placeholder="Instructions for therapists using this form..." value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} borderRadius="xl" />
            </FormControl>
         </VStack>
      </Box>

      {templateForm.sections.map((section, si) => (
        <Box key={si} bg="white" borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
           <Box bg="teal.50" px={8} py={4} borderBottom="1px solid" borderColor="teal.100">
              <HStack justify="space-between">
                 <Input variant="unstyled" fontWeight="bold" color="teal.700" value={section.title} onChange={e => {
                    const s = [...templateForm.sections]; s[si].title = e.target.value; setTemplateForm({...templateForm, sections: s});
                 }} />
                 <IconButton icon={<FiTrash2 />} size="xs" variant="ghost" colorScheme="red" onClick={() => {
                    const s = templateForm.sections.filter((_, i) => i !== si); setTemplateForm({...templateForm, sections: s});
                 }} />
              </HStack>
           </Box>
           <VStack p={8} align="stretch" spacing={6} divider={<Divider />}>
              {section.fields.map((field, fi) => (
                <HStack key={fi} spacing={4} align="flex-end">
                   <VStack align="stretch" flex="1" spacing={3}>
                      <HStack>
                         <Input fontSize="sm" value={field.label} onChange={e => {
                            const s = [...templateForm.sections]; s[si].fields[fi].label = e.target.value; setTemplateForm({...templateForm, sections: s});
                         }} placeholder="Field Label (e.g. Mood)" />
                         <Select size="sm" w="180px" value={field.field_type} onChange={e => {
                            const s = [...templateForm.sections]; s[si].fields[fi].field_type = e.target.value; setTemplateForm({...templateForm, sections: s});
                         }} borderRadius="full">
                            <option value="text">Text Input</option>
                            <option value="textarea">Large Text Area</option>
                            <option value="likert">Likert Scale (1-10)</option>
                            <option value="checkboxes">Multi-Checkbox</option>
                         </Select>
                      </HStack>
                   </VStack>
                   <IconButton icon={<FiTrash2 />} size="sm" variant="ghost" onClick={() => {
                      const s = [...templateForm.sections]; s[si].fields = s[si].fields.filter((_, i) => i !== fi); setTemplateForm({...templateForm, sections: s});
                   }} />
                </HStack>
              ))}
              <Button leftIcon={<FiPlusCircle />} size="sm" variant="ghost" colorScheme="teal" onClick={() => addField(si)}>Add Data Point</Button>
           </VStack>
        </Box>
      ))}

      <Button leftIcon={<FiPlus />} variant="outline" borderStyle="dashed" colorScheme="teal" borderRadius="2xl" p={10} onClick={addSection}>Add New Logical Section</Button>

      <Flex justify="flex-end" pt={10} borderTop="1px solid" borderColor="gray.100">
         <HStack spacing={4}>
            <Button variant="ghost" onClick={() => setViewMode("list")}>Discard Changes</Button>
            <Button bg="teal.500" color="white" px={10} borderRadius="full" leftIcon={<FiSave />} onClick={handleSaveTemplate}>Save Template Layout</Button>
         </HStack>
      </Flex>
    </VStack>
  );

  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} gap={4}>
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            {viewMode === "builder" ? "Note Template Builder" : "Clinical Documentation"}
          </Heading>
          <Text color="gray.500">
            {viewMode === "builder" ? "Configure structured sections for your clinical records." : "Manage structured session forms and professional documentation."}
          </Text>
        </VStack>
        {viewMode === "list" && (
          <Button leftIcon={<FiPlus />} bg="teal.500" color="white" _hover={{ bg: "teal.600" }} borderRadius="full" px={8} onClick={() => { setEditingTemplate(null); setViewMode("builder"); }}>
            New Template
          </Button>
        )}
      </Flex>

      {loading ? (
        <Center py={20}><VStack><Spinner color="teal.500" /><Text>Syncing Template Schema...</Text></VStack></Center>
      ) : (
        viewMode === "list" ? (
          <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <VStack align="stretch" spacing={2} divider={<Divider />}>
              {templates.map(t => (
                <Flex key={t.id} p={4} justify="space-between" align="center" _hover={{ bg: 'gray.50' }} transition="0.2s" borderRadius="2xl">
                   <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color="gray.700">{t.name}</Text>
                      <Text fontSize="xs" color="gray.400">{t.description || "Structured documentation form."}</Text>
                   </VStack>
                   <HStack>
                      <Badge borderRadius="full" px={3} colorScheme="teal" variant="subtle">{t.sections?.length || 1} SECTIONS</Badge>
                      <IconButton icon={<FiEdit2 />} size="sm" variant="ghost" onClick={() => { setEditingTemplate(t); setTemplateForm(t); setViewMode("builder"); }} />
                   </HStack>
                </Flex>
              ))}
            </VStack>
          </Box>
        ) : renderTemplateBuilder()
      )}
    </Box>
  );
}
