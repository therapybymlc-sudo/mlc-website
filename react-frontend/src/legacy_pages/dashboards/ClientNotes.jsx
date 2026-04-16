// src/pages/dashboards/ClientNotes.jsx
import {
  Box, Heading, Text, VStack, HStack, Button, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, useDisclosure, useToast,
  Spinner, Divider, Checkbox, Badge, CheckboxGroup, Stack, Slider, SliderTrack,
  SliderFilledTrack, SliderThumb, Tag, TagLabel, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, InputGroup, InputLeftElement,
  Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, IconButton
} from "@chakra-ui/react";
import { AddIcon, RepeatIcon, CopyIcon, ViewIcon, DeleteIcon, SearchIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../api.js";
import {
  getNoteTemplates,
  createNoteTemplate,
  updateNoteTemplate,
  deleteNoteTemplate,
} from "../../api.js";

/* =========================================
   Helpers
========================================= */
const normalizeChoices = (raw) => {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

// When backend has no sections, fall back to a single anonymous section
const asSections = (tpl) => {
  if (tpl?.sections && Array.isArray(tpl.sections) && tpl.sections.length > 0) {
    return tpl.sections;
  }
  return [{ title: "", description: "", fields: tpl?.fields || [] }];
};

/* =========================================
   Field renderer for note entry
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
          rows={4}
          whiteSpace="pre-wrap"
          resize="vertical"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          isReadOnly={isReadOnly}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          isReadOnly={isReadOnly}
        />
      );

    case "select":
    case "choice": {
      const choices = options.choices || [];
      return (
        <Select
          placeholder="Select…"
          value={value ?? ""}
          onChange={(e) => set(e.target.value)}
          isDisabled={isReadOnly}
        >
          {choices.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
          {options.allow_other && <option value="__OTHER__">Other…</option>}
        </Select>
      );
    }

    case "checkboxes": {
      const choices = options.choices || [];
      const current = Array.isArray(value) ? value : [];
      return (
        <VStack align="start" spacing={2}>
          <CheckboxGroup value={current} onChange={(vals) => set(vals)} isDisabled={isReadOnly}>
            <Stack direction="column" spacing={1}>
              {choices.map((c, i) => (
                <Checkbox key={i} value={c} isDisabled={isReadOnly}>{c}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>

          {options.allow_other && (
            <Input
              placeholder="Other (optional)"
              value={current.find((v) => !choices.includes(v)) || ""}
              onChange={(e) => {
                const other = e.target.value;
                const kept = current.filter((v) => choices.includes(v));
                set(other ? [...kept, other] : kept);
              }}
              isReadOnly={isReadOnly}
            />
          )}

          {current.length > 0 && (
            <HStack wrap="wrap" spacing={1}>
              {current.map((c, idx) => (
                <Tag key={idx} size="sm" variant="subtle" mb={1}>
                  <TagLabel>{c}</TagLabel>
                </Tag>
              ))}
            </HStack>
          )}
        </VStack>
      );
    }

    case "likert": {
      const min = Number(options.min ?? 1);
      const max = Number(options.max ?? 5);
      const minLabel = options.min_label ?? "Low";
      const maxLabel = options.max_label ?? "High";
      const numeric = Number(value ?? min);

      return (
        <VStack align="stretch" spacing={1}>
          <HStack justify="space-between" fontSize="sm" color="gray.600">
            <Text>{minLabel} ({min})</Text>
            <Text>{maxLabel} ({max})</Text>
          </HStack>
          <Slider
            min={min}
            max={max}
            value={isNaN(numeric) ? min : numeric}
            onChange={(val) => set(val)}
            isDisabled={isReadOnly}
          >
            <SliderTrack><SliderFilledTrack /></SliderTrack>
            <SliderThumb />
          </Slider>
          <Text fontSize="sm">Selected: {isNaN(numeric) ? min : numeric}</Text>
        </VStack>
      );
    }

    case "section":
      return (
        <Box pt={6} pb={2} borderBottom="2px solid" borderColor="mlc.green" mb={2}>
           <Heading size="xs" color="mlc.greenDark" letterSpacing="widest" textTransform="uppercase">
             {field.label}
           </Heading>
        </Box>
      );
    default:
      return <Input value={value ?? ""} onChange={(e) => set(e.target.value)} isReadOnly={isReadOnly} />;
  }
}

/* =========================================
   Main Page
========================================= */
export default function ClientNotes() {
  const toast = useToast();
  const manageModal = useDisclosure();
  const editorModal = useDisclosure();
  const copyModal = useDisclosure();
  const clientNavDrawer = useDisclosure();
  const { id: routeClientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(routeClientId || "");
  const [selectedClient, setSelectedClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");
  const [notesSearch, setNotesSearch] = useState("");
  const [activeSection, setActiveSection] = useState("notes");

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [values, setValues] = useState({});
  const [noteStatus, setNoteStatus] = useState("draft");
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [isNoteReadOnly, setIsNoteReadOnly] = useState(false);

    // 🔹 Co-sign state
  const [requireCosign, setRequireCosign] = useState(false);
  const [cosigners, setCosigners] = useState([]);
  const [therapists, setTherapists] = useState([]);


  /* ---------- Template Builder State ---------- */
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    sections: [
      {
        title: "Section 1",
        description: "",
        fields: [
          {
            label: "",
            field_type: "text",
            is_required: false,
            order: 0,
            options: { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
          },
        ],
      },
    ],
  });

  /* ----------------- Autosave ----------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      if (noteStatus === "draft" && Object.keys(values).length > 0) autoSaveNote();
    }, 10000);
    return () => clearInterval(interval);
  });

  const autoSaveNote = async () => {
    if (!selectedClientId || !selectedTemplateId) return;
    try {
      const payload = {
        client: Number(selectedClientId),
        template: Number(selectedTemplateId),
        data: values,
        status: "draft",
      };
      if (currentNoteId) await apiPut(`notes/${currentNoteId}/`, payload);
      else {
        const created = await apiPost("notes/", payload);
        setCurrentNoteId(created.id);
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  };

  /* ----------------- Load Data ----------------- */
  const loadInitial = async () => {
    try {
      const [tpls, clnts, ths, clientDetail] = await Promise.all([
        getNoteTemplates(),
        routeClientId ? Promise.resolve([]) : apiGet("clients/"),
        apiGet("therapists/"), // adjust endpoint name if needed
        routeClientId ? apiGet(`clients/${routeClientId}/`) : Promise.resolve(null),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : tpls.results || []);
      if (!routeClientId) setClients(Array.isArray(clnts) ? clnts : clnts.results || []);
      setTherapists(Array.isArray(ths) ? ths : ths.results || []);

      setTemplates(Array.isArray(tpls) ? tpls : tpls.results || []);
      if (!routeClientId) setClients(Array.isArray(clnts) ? clnts : clnts.results || []);
      if (clientDetail) setSelectedClient(clientDetail);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't load templates/clients" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadInitial(); }, [routeClientId]);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      try {
        const n = await apiGet(`notes/?client=${selectedClientId}`);
        setNotes(Array.isArray(n) ? n : n.results || []);
      } catch (e) {
        console.error(e);
        toast({ status: "error", title: "Couldn't load notes" });
      }
    })();
  }, [selectedClientId, toast]);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      try {
        const a = await apiGet(`appointments/?client=${selectedClientId}`);
        setAppointments(Array.isArray(a) ? a : a.results || []);
      } catch (e) {
        console.error(e);
        toast({ status: "error", title: "Couldn't load appointments" });
      }
    })();
  }, [selectedClientId, toast]);

  useEffect(() => {
    if (routeClientId || !selectedClientId) return;
    const found = clients.find((c) => String(c.id) === String(selectedClientId));
    if (found) setSelectedClient(found);
  }, [clients, routeClientId, selectedClientId]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => String(t.id) === String(selectedTemplateId)),
    [templates, selectedTemplateId]
  );

  const handleTemplateChange = (e) => {
    const nextId = e.target.value;
    setSelectedTemplateId(nextId);
    setValues({});
    setAppointmentId("");
    setCurrentNoteId(null);
    setNoteStatus("draft");
    setIsNoteReadOnly(false);
  };

  const setFieldValue = (fieldId, val) => setValues((v) => ({ ...v, [fieldId]: val }));

  /* ---------- Template Movement Helpers ---------- */
  const moveSection = (index, direction) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= sections.length) return prev;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
  };

  const moveFieldInSection = (si, fi, direction) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      const fields = [...sections[si].fields];
      const newIndex = fi + direction;
      if (newIndex < 0 || newIndex >= fields.length) return prev;
      [fields[fi], fields[newIndex]] = [fields[newIndex], fields[fi]];
      sections[si].fields = fields.map((f, i) => ({ ...f, order: i }));
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setTemplateForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: `New Section`, description: "", fields: [] }],
    }));
  };

  const removeSection = (index) =>
    setTemplateForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));

  const addFieldToSection = (sectionIndex) =>
    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex].fields.push({
        label: "",
        field_type: "text",
        is_required: false,
        order: sections[sectionIndex].fields.length,
        options: { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
      });
      return { ...prev, sections };
    });

  const removeFieldFromSection = (sectionIndex, fieldIndex) =>
    setTemplateForm((prev) => {
      const sections = [...prev.sections];
      sections[sectionIndex].fields.splice(fieldIndex, 1);
      return { ...prev, sections };
    });

  /* ----------------- Manage Templates ----------------- */
  const resetTemplateForm = () =>
    setTemplateForm({
      name: "",
      description: "",
      sections: [
        {
          title: "Section 1",
          description: "",
          fields: [
            {
              label: "",
              field_type: "text",
              is_required: false,
              order: 0,
              options: { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
            },
          ],
        },
      ],
    });

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    resetTemplateForm();
    manageModal.onClose();
    editorModal.onOpen();
  };

  const handleEditTemplate = (tpl) => {
    // Backend doesn’t persist sections yet; show a single section with all fields
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      description: tpl.description || "",
      sections: [
        {
          title: "Section 1",
          description: "",
          fields: (tpl.fields || []).map((f, i) => ({
            label: f.label,
            field_type: f.field_type,
            is_required: !!f.is_required,
            order: typeof f.order === "number" ? f.order : i,
            options: f.options || { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
            id: f.id, // keep id if present
          })),
        },
      ],
    });
    manageModal.onClose();
    editorModal.onOpen();
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    await deleteNoteTemplate(id);
    toast({ status: "info", title: "Template deleted" });
    loadInitial();
  };

  /* ----------------- Template Save ----------------- */
  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim())
      return toast({ status: "warning", title: "Template name required" });

    const payload = {
      name: templateForm.name,
      description: templateForm.description,
      sections: templateForm.sections,
    };

    try {
      if (editingTemplate) await updateNoteTemplate(editingTemplate.id, payload);
      else await createNoteTemplate(payload);
      toast({ status: "success", title: "Template saved" });
      editorModal.onClose();
      manageModal.onOpen();
      loadInitial();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't save template" });
    }
  };

  /* ---------- Note Actions ---------- */


  const handleCreateOrUpdateNote = async (statusOverride) => {
    const statusToUse = statusOverride || noteStatus;
    if (!selectedClientId) return toast({ title: "Select a client first", status: "warning" });
    if (!selectedTemplateId) return toast({ title: "Select a template", status: "warning" });

    try {
      const dataWithMeta = {
        ...values,
        _appointment_id: appointmentId ? Number(appointmentId) : null,
      };
      const payload = {
        client: Number(selectedClientId),
        template: Number(selectedTemplateId),
        data: dataWithMeta,
        status: statusToUse,
        require_cosign: requireCosign,     // your toggle
        cosigner_ids: cosigners, // match your actual state name
      };

      if (currentNoteId) await apiPut(`notes/${currentNoteId}/`, payload);
      else {
        const created = await apiPost("notes/", payload);
        setCurrentNoteId(created.id);
      }
      toast({ status: "success", title: statusToUse === "final" ? "Note finalized" : "Draft saved" });
      setIsNoteReadOnly(statusToUse === "final");
      const n = await apiGet(`notes/?client=${selectedClientId}`);
      setNotes(Array.isArray(n) ? n : n.results || []);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Could not save note" });
    }
  };

  const handleOpenNote = (note, readOnly = false) => {
    setSelectedTemplateId(String(note.template));
    setValues(note.data || {});
    setAppointmentId(note.data?._appointment_id ? String(note.data._appointment_id) : "");
    setCurrentNoteId(note.id);
    setNoteStatus(note.status || "draft");
    setIsNoteReadOnly(readOnly);
  };

  const handleResetNote = () => {
    setSelectedTemplateId("");
    setValues({});
    setAppointmentId("");
    setNoteStatus("draft");
    setCurrentNoteId(null);
    setIsNoteReadOnly(false);
  };

  useEffect(() => {
    if (routeClientId) return;
    const params = new URLSearchParams(location.search);
    const noteClientId = params.get("noteClientId");
    const newNote = params.get("newNote");
    if (noteClientId) {
      setSelectedClientId(String(noteClientId));
    }
    if (newNote === "1") {
      handleResetNote();
    }
  }, [location.search, routeClientId]);

  const handleCopyPrevious = () => {
    if (notes.length === 0) return;
    copyModal.onOpen();
  };

  /* ---------- Render helper for sections in Note Modal ---------- */
  const renderNoteSections = (template) => {
    const sections = asSections(template);
    return (
      <VStack align="stretch" spacing={6}>
        {sections.map((section, si) => (
          <Box key={si} borderRadius="lg" bg="white" border="1px solid #E2E8F0" overflow="hidden">
            {(section.title || section.description) && (
              <Box bg="blue.50" px={4} py={2} borderBottom="1px solid #E2E8F0">
                {section.title && <Heading size="sm">{section.title}</Heading>}
                {section.description && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {section.description}
                  </Text>
                )}
              </Box>
            )}
            <Box p={4}>
            <VStack align="stretch" spacing={4}>
              {(section.fields || [])
                .sort((a,b) => (a.order||0) - (b.order||0))
                .map((f) => (
                <FormControl key={f.id || `${si}-${f.label}`} isRequired={f.is_required && f.field_type !== 'section'}>
                  {f.field_type !== "section" && <FormLabel fontSize="sm" fontWeight="600">{f.label}</FormLabel>}
                  <FieldInput field={f} value={values[f.id]} onChange={setFieldValue} isReadOnly={isNoteReadOnly} />
                </FormControl>
              ))}
            </VStack>
            </Box>
          </Box>
        ))}
      </VStack>
    );
  };

  /* ----------------- UI ----------------- */
  if (loading) return <Box py={20} textAlign="center"><Spinner /></Box>;

  const summarize = (data) => {
    if (!data) return "";
    const first = Object.values(data)[0];
    if (!first) return "";
    return String(first).slice(0, 80);
  };

  const filteredNotes = notes.filter((n) => {
    if (!notesSearch.trim()) return true;
    const q = notesSearch.trim().toLowerCase();
    const name = (n.template_name || "").toLowerCase();
    const preview = summarize(n.data).toLowerCase();
    return name.includes(q) || preview.includes(q);
  });

  return (
    <Box bg="gray.50" borderRadius="xl" p={{ base: 4, md: 8 }}>
      {!routeClientId && (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="lg" p={8} mb={6}>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Select a client to view notes.
          </Text>
          <FormControl maxW="420px">
            <FormLabel>Select Client</FormLabel>
            <Select
              placeholder="Pick a client"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Client menu drawer (mobile/tablet) */}
      <Drawer placement="right" onClose={clientNavDrawer.onClose} isOpen={clientNavDrawer.isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Client menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              <ClientNavButton
                label="Client details"
                active={activeSection === "details"}
                onClick={() => {
                  navigate(`/dashboard/therapist?tab=clients`);
                  clientNavDrawer.onClose();
                }}
              />
              <ClientNavButton
                label="Treatment notes"
                count={notes.length}
                active={activeSection === "notes"}
                onClick={() => {
                  setActiveSection("notes");
                  clientNavDrawer.onClose();
                }}
              />
              <ClientNavButton
                label="Files"
                count={0}
                active={activeSection === "files"}
                onClick={() => {
                  navigate(`/dashboard/therapist?tab=files`);
                  clientNavDrawer.onClose();
                }}
              />
              <ClientNavButton
                label="Appointments"
                count={appointments.length}
                active={activeSection === "appointments"}
                onClick={() => {
                  navigate(`/dashboard/therapist?tab=schedule&newAppointmentClientId=${selectedClientId}`);
                  clientNavDrawer.onClose();
                }}
              />
              <ClientNavButton label="Forms" count={0} active={false} onClick={() => {}} />
              <ClientNavButton label="Letters" count={0} active={false} onClick={() => {}} />
              <ClientNavButton label="Cases" count={0} active={false} onClick={() => {}} />
              <ClientNavButton label="Recalls" count={0} active={false} onClick={() => {}} />
              <ClientNavButton label="Communications" count={0} active={false} onClick={() => {}} />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {!selectedClientId ? (
        <Box bg="white" border="1px solid #E2E8F0" borderRadius="lg" p={10} textAlign="center">
          <Text color="gray.600">Select a client to view notes.</Text>
        </Box>
      ) : (
        <>
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" mb={3} align="flex-start" spacing={3}>
            <Box>
              <Text fontSize="sm" color="gray.500">Treatment Notes</Text>
              <Heading size={{ base: "md", md: "lg" }} wordBreak="break-word">
                {selectedClient?.name || "Client"} / New treatment note
              </Heading>
            </Box>
            <Wrap spacing={2}>
              <WrapItem>
                <IconButton
                  aria-label="Open client menu"
                  icon={<HamburgerIcon />}
                  size="sm"
                  display={{ base: "inline-flex", xl: "none" }}
                  onClick={clientNavDrawer.onOpen}
                />
              </WrapItem>
              <WrapItem>
                <Button size="sm" variant="outline" onClick={manageModal.onOpen}>
                  Manage Templates
                </Button>
              </WrapItem>
              <WrapItem>
                <Button size="sm" variant="outline" onClick={handleResetNote}>
                  New Note
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  onClick={() => handleCreateOrUpdateNote("draft")}
                  isDisabled={isNoteReadOnly || !selectedTemplateId}
                >
                  Save Draft
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  size="sm"
                  bg="#E45353"
                  color="white"
                  _hover={{ bg: "#C74343" }}
                  onClick={() => handleCreateOrUpdateNote("final")}
                  isDisabled={isNoteReadOnly || !selectedTemplateId}
                >
                  Save Final
                </Button>
              </WrapItem>
            </Wrap>
          </Stack>
          <Button variant="link" color="#C74343" mb={4}>
            + Add medical alert
          </Button>

          <HStack align="start" spacing={6} flexDir={{ base: "column", xl: "row" }}>
            {/* Main content + right panel */}
            <HStack align="start" spacing={6} flex="1" flexDir={{ base: "column", xl: "row" }}>
              {/* Left / Main */}
              <Box flex="1">
                <Box bg="blue.50" border="1px solid #D7E6F4" borderRadius="lg" p={4} mb={6}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Template</FormLabel>
                      <Select
                        placeholder="Select template"
                        value={selectedTemplateId}
                        onChange={handleTemplateChange}
                        isDisabled={isNoteReadOnly || !selectedClientId}
                      >
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Appointment</FormLabel>
                      <Select
                        placeholder="Link to appointment"
                        value={appointmentId}
                        onChange={(e) => setAppointmentId(e.target.value)}
                        isDisabled={!selectedClientId}
                      >
                        {appointments.map((a) => (
                          <option key={a.id} value={a.id}>
                            {new Date(a.date).toLocaleString()}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Actions</FormLabel>
                      <HStack>
                        <Button size="sm" leftIcon={<CopyIcon />} variant="outline" onClick={handleCopyPrevious} isDisabled={isNoteReadOnly}>
                          Copy Previous
                        </Button>
                        <Button size="sm" leftIcon={<RepeatIcon />} variant="outline" onClick={() => window.location.reload()}>
                          Refresh
                        </Button>
                      </HStack>
                    </FormControl>
                  </SimpleGrid>
                  <HStack mt={4} justify="space-between">
                    <Checkbox
                      isChecked={requireCosign}
                      onChange={(e) => setRequireCosign(e.target.checked)}
                      isDisabled={isNoteReadOnly}
                    >
                      Require Co-sign
                    </Checkbox>
                    {requireCosign && (
                      <FormControl maxW="360px">
                        <Select
                          multiple
                          value={cosigners}
                          onChange={(e) => setCosigners([...e.target.selectedOptions].map((o) => o.value))}
                          disabled={isNoteReadOnly}
                        >
                          {therapists.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </HStack>
                </Box>

                {!selectedTemplate ? (
                  <Box bg="white" borderRadius="lg" p={8} border="1px solid #E2E8F0">
                    <Text color="gray.500">Select a template to begin documentation.</Text>
                    {selectedTemplateId && (
                      <Box mt={3}>
                        <Text color="red.500" fontSize="sm">
                          Selected template not found. Reload templates and try again.
                        </Text>
                        <Button mt={2} size="sm" variant="outline" onClick={loadInitial}>
                          Reload templates
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  renderNoteSections(selectedTemplate)
                )}
              </Box>

              {/* Right / Context Panel */}
              <Box w={{ base: "100%", xl: "360px" }} bg="white" borderRadius="lg" border="1px solid #E2E8F0" p={4}>
                <Tabs variant="enclosed">
                  <TabList>
                    <Tab>Previous notes</Tab>
                    <Tab>Client info</Tab>
                    <Tab>Appointments</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <InputGroup mb={3}>
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Filter treatment notes..."
                          value={notesSearch}
                          onChange={(e) => setNotesSearch(e.target.value)}
                        />
                      </InputGroup>
                      <VStack align="stretch" spacing={3}>
                        {filteredNotes.length === 0 ? (
                          <Box bg="gray.50" borderRadius="md" p={4} textAlign="center">
                            <Text color="gray.500">There are no treatment notes.</Text>
                          </Box>
                        ) : (
                          filteredNotes.map((n) => (
                            <Box key={n.id} border="1px solid #E2E8F0" borderRadius="md" p={3}>
                              <HStack justify="space-between" mb={1}>
                                <Text fontWeight="semibold">{n.template_name || "Treatment note"}</Text>
                                <Badge colorScheme={n.status === "final" ? "green" : "yellow"}>{n.status}</Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(n.created_at).toLocaleString()}
                              </Text>
                              <Text fontSize="sm" mt={2} color="gray.700">
                                {summarize(n.data)}
                              </Text>
                              <Button
                                size="xs"
                                leftIcon={<ViewIcon />}
                                mt={3}
                                onClick={() => handleOpenNote(n, n.status !== "draft")}
                              >
                                {n.status === "draft" ? "Edit" : "View"}
                              </Button>
                            </Box>
                          ))
                        )}
                      </VStack>
                    </TabPanel>
                    <TabPanel px={0}>
                      {selectedClient ? (
                        <VStack align="stretch" spacing={3}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Date of birth</Text>
                            <Text>{selectedClient.date_of_birth || "—"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Sex</Text>
                            <Text>{selectedClient.sex || "—"}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">Gender identity</Text>
                            <Text>{selectedClient.gender_identity || "—"}</Text>
                          </Box>
                        </VStack>
                      ) : (
                        <Text color="gray.500">Select a client to view details.</Text>
                      )}
                    </TabPanel>
                    <TabPanel px={0}>
                      {appointments.length === 0 ? (
                        <Text color="gray.500">No upcoming appointments.</Text>
                      ) : (
                        <VStack align="stretch" spacing={3}>
                          {appointments.map((a) => (
                            <Box key={a.id} border="1px solid #E2E8F0" borderRadius="md" p={3}>
                              <Text fontWeight="semibold">
                                {new Date(a.date).toLocaleDateString()}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {new Date(a.date).toLocaleTimeString()}
                              </Text>
                              {a.notes && (
                                <Text fontSize="sm" color="gray.700" mt={1}>
                                  {a.notes}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      )}
                      <Button
                        mt={4}
                        variant="outline"
                        colorScheme="red"
                        onClick={() =>
                          navigate(`/dashboard/therapist?tab=schedule&newAppointmentClientId=${selectedClientId}`)
                        }
                      >
                        Book a new appointment
                      </Button>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </HStack>

            {/* Client context sidebar (right) */}
            <Box
              w={{ base: "100%", xl: "220px" }}
              bg="white"
              borderRadius="lg"
              border="1px solid #E2E8F0"
              p={3}
              display={{ base: "none", xl: "block" }}
            >
              <VStack align="stretch" spacing={2}>
                <ClientNavButton
                  label="Client details"
                  active={activeSection === "details"}
                  onClick={() => navigate(`/dashboard/therapist?tab=clients`)}
                />
                <ClientNavButton
                  label="Treatment notes"
                  count={notes.length}
                  active={activeSection === "notes"}
                  onClick={() => setActiveSection("notes")}
                />
                <ClientNavButton
                  label="Files"
                  count={0}
                  active={activeSection === "files"}
                  onClick={() => navigate(`/dashboard/therapist?tab=files`)}
                />
                <ClientNavButton
                  label="Appointments"
                  count={appointments.length}
                  active={activeSection === "appointments"}
                  onClick={() =>
                    navigate(`/dashboard/therapist?tab=schedule&newAppointmentClientId=${selectedClientId}`)
                  }
                />
                <ClientNavButton label="Forms" count={0} active={false} onClick={() => {}} />
                <ClientNavButton label="Letters" count={0} active={false} onClick={() => {}} />
                <ClientNavButton label="Cases" count={0} active={false} onClick={() => {}} />
                <ClientNavButton label="Recalls" count={0} active={false} onClick={() => {}} />
                <ClientNavButton label="Communications" count={0} active={false} onClick={() => {}} />
              </VStack>
            </Box>
          </HStack>
        </>
      )}
      {/* Manage Templates Modal */}
      <Modal isOpen={manageModal.isOpen} onClose={manageModal.onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Templates</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between">
                <Heading size="sm">Existing Templates</Heading>
                <Button leftIcon={<AddIcon />} onClick={openCreateTemplate} variant="outline">New Template</Button>
              </HStack>

              {templates.length === 0 ? (
                <Text color="gray.500">No templates yet.</Text>
              ) : (
                <Table size="sm">
                  <Thead><Tr><Th>Name</Th><Th>Description</Th><Th textAlign="right">Actions</Th></Tr></Thead>
                  <Tbody>
                    {templates.map((t) => (
                      <Tr key={t.id}>
                        <Td>{t.name}</Td>
                        <Td>{t.description || "-"}</Td>
                        <Td>
                          <HStack justify="flex-end" spacing={2}>
                            <Button size="sm" onClick={() => handleEditTemplate(t)}>Edit</Button>
                            <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteTemplate(t.id)}>Delete</Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={manageModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create/Edit Template Modal (Sections + Fields) */}
      <Modal isOpen={editorModal.isOpen} onClose={editorModal.onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingTemplate ? "Edit Template" : "New Template"}</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={8}>
                <VStack align="stretch" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="bold">Template Name</FormLabel>
                    <Input
                      bg="white"
                      size="lg"
                      borderRadius="xl"
                      placeholder="e.g., Initial Clinical Intake"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold">Internal Description</FormLabel>
                    <Textarea
                      bg="white"
                      borderRadius="xl"
                      placeholder="Optional notes for other therapists about when to use this template..."
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </FormControl>
                </VStack>

                <Divider />

                <VStack align="stretch" spacing={8}>
                  {templateForm.sections.map((section, si) => (
                    <Box key={si} p={5} border="1px solid #E2E8F0" borderRadius="2xl" bg="white" shadow="sm" position="relative">
                      <HStack justify="space-between" mb={4}>
                         <HStack flex="1">
                            <VStack spacing={0}>
                               <IconButton size="xs" variant="ghost" icon={<Text fontSize="xs">▲</Text>} onClick={() => moveSection(si, -1)} isDisabled={si === 0} aria-label="up" />
                               <IconButton size="xs" variant="ghost" icon={<Text fontSize="xs">▼</Text>} onClick={() => moveSection(si, 1)} isDisabled={si === templateForm.sections.length - 1} aria-label="down" />
                            </VStack>
                            <Box flex="1">
                               <Input
                                 fontWeight="bold"
                                 variant="unstyled"
                                 fontSize="lg"
                                 placeholder="Section Title (e.g. Risk Assessment)"
                                 value={section.title}
                                 onChange={(e) => {
                                   const val = e.target.value;
                                   setTemplateForm((p) => {
                                     const s = [...p.sections];
                                     s[si].title = val;
                                     return { ...p, sections: s };
                                   });
                                 }}
                               />
                               <Input
                                 variant="unstyled"
                                 fontSize="xs"
                                 color="gray.500"
                                 placeholder="Describe the purpose of this section..."
                                 value={section.description}
                                 onChange={(e) => {
                                   const val = e.target.value;
                                   setTemplateForm((p) => {
                                     const s = [...p.sections];
                                     s[si].description = val;
                                     return { ...p, sections: s };
                                   });
                                 }}
                               />
                            </Box>
                         </HStack>
                         <Button size="xs" colorScheme="red" variant="ghost" onClick={() => removeSection(si)}>Remove Section</Button>
                      </HStack>

                      <VStack align="stretch" spacing={3} pl={6} borderLeft="2px solid" borderColor="gray.100">
                        {section.fields.map((f, fi) => (
                          <Box key={fi} p={3} bg="gray.50" borderRadius="xl" position="relative" role="group">
                            <HStack spacing={3} align="flex-end">
                              <VStack spacing={0}>
                                 <IconButton size="xs" variant="ghost" icon={<Text fontSize="9px">▲</Text>} onClick={() => moveFieldInSection(si, fi, -1)} isDisabled={fi === 0} aria-label="up" />
                                 <IconButton size="xs" variant="ghost" icon={<Text fontSize="9px">▼</Text>} onClick={() => moveFieldInSection(si, fi, 1)} isDisabled={fi === section.fields.length - 1} aria-label="down" />
                              </VStack>

                              <FormControl flex={1}>
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500">QUESTION LABEL</FormLabel>
                                <Input
                                  bg="white"
                                  size="sm"
                                  borderRadius="md"
                                  value={f.label}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTemplateForm((prev) => {
                                      const sections = [...prev.sections];
                                      sections[si].fields[fi].label = val;
                                      return { ...prev, sections };
                                    });
                                  }}
                                />
                              </FormControl>

                              <FormControl w="140px">
                                <FormLabel fontSize="xs" fontWeight="700" color="gray.500">TYPE</FormLabel>
                                <Select
                                  bg="white"
                                  size="sm"
                                  borderRadius="md"
                                  value={f.field_type}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTemplateForm((prev) => {
                                      const sections = [...prev.sections];
                                      sections[si].fields[fi].field_type = val;
                                      return { ...prev, sections };
                                    });
                                  }}
                                >
                                  <option value="text">Text</option>
                                  <option value="textarea">Large Text</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date</option>
                                  <option value="choice">Choice</option>
                                  <option value="select">Dropdown</option>
                                  <option value="checkboxes">Checkboxes</option>
                                  <option value="likert">Likert</option>
                                  <option value="section">--- SECTION HEADER ---</option>
                                </Select>
                              </FormControl>

                              <IconButton aria-label="Remove" icon={<DeleteIcon />} size="xs" colorScheme="red" variant="ghost" onClick={() => removeFieldFromSection(si, fi)} />
                            </HStack>

                            {/* Options for multi-choice */}
                            {["choice", "select", "checkboxes"].includes(f.field_type) && (
                                <Box mt={3} pl={8}>
                                    <Textarea
                                        size="xs"
                                        bg="white"
                                        placeholder="Choices, separated by commas or new lines..."
                                        defaultValue={(f.options?.choices || []).join(", ")}
                                        onBlur={(e) => {
                                          const newChoices = normalizeChoices(e.target.value);
                                          setTemplateForm((p) => {
                                            const s = [...p.sections];
                                            s[si].fields[fi].options = { ...s[si].fields[fi].options, choices: newChoices };
                                            return { ...p, sections: s };
                                          });
                                        }}
                                    />
                                </Box>
                            )}

                            {f.field_type === "likert" && (
                                <HStack mt={3} pl={8} spacing={4}>
                                   <FormControl>
                                      <FormLabel fontSize="xs">Min</FormLabel>
                                      <Input size="xs" type="number" value={f.options?.min ?? 1} onChange={(e) => {
                                         const val = Number(e.target.value);
                                         setTemplateForm(p => {
                                            const s = [...p.sections];
                                            s[si].fields[fi].options = { ...s[si].fields[fi].options, min: val };
                                            return { ...p, sections: s };
                                         });
                                      }} />
                                   </FormControl>
                                   <FormControl>
                                      <FormLabel fontSize="xs">Max</FormLabel>
                                      <Input size="xs" type="number" value={f.options?.max ?? 5} onChange={(e) => {
                                         const val = Number(e.target.value);
                                         setTemplateForm(p => {
                                            const s = [...p.sections];
                                            s[si].fields[fi].options = { ...s[si].fields[fi].options, max: val };
                                            return { ...p, sections: s };
                                         });
                                      }} />
                                   </FormControl>
                                   <FormControl>
                                      <FormLabel fontSize="xs">Min Label</FormLabel>
                                      <Input size="xs" value={f.options?.min_label || "Low"} onChange={(e) => {
                                         const val = e.target.value;
                                         setTemplateForm(p => {
                                            const s = [...p.sections];
                                            s[si].fields[fi].options = { ...s[si].fields[fi].options, min_label: val };
                                            return { ...p, sections: s };
                                         });
                                      }} />
                                   </FormControl>
                                   <FormControl>
                                      <FormLabel fontSize="xs">Max Label</FormLabel>
                                      <Input size="xs" value={f.options?.max_label || "High"} onChange={(e) => {
                                         const val = e.target.value;
                                         setTemplateForm(p => {
                                            const s = [...p.sections];
                                            s[si].fields[fi].options = { ...s[si].fields[fi].options, max_label: val };
                                            return { ...p, sections: s };
                                         });
                                      }} />
                                   </FormControl>
                                </HStack>
                            )}
                            
                            {/* Insertion button below field */}
                            <HStack justify="center" position="absolute" bottom="-12px" left="0" right="0" opacity={0} _groupHover={{ opacity: 1 }} zIndex={5}>
                                <Button size="xs" variant="solid" bg="teal.400" color="white" height="18px" fontSize="8px" borderRadius="full" onClick={() => insertFieldAt(si, fi)}>
                                    Insert Question After
                                </Button>
                            </HStack>
                          </Box>
                        ))}

                        <Button size="xs" variant="dashed" leftIcon={<AddIcon />} onClick={() => addFieldToSection(si)} py={4} borderRadius="xl">
                          Add Question to Section
                        </Button>
                      </VStack>
                    </Box>
                  ))}

                  <Button leftIcon={<AddIcon />} variant="solid" bg="mlc.green" color="white" onClick={addSection} py={6} borderRadius="2xl">
                    Add New Large Section
                  </Button>
                </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button colorScheme="green" onClick={handleSaveTemplate}>Save Template</Button>
              <Button variant="ghost" onClick={() => { editorModal.onClose(); manageModal.onOpen(); }}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Copy Previous Note Modal */}
      <Modal isOpen={copyModal.isOpen} onClose={copyModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Copy previous note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {notes.length === 0 ? (
              <Text color="gray.500">No notes to copy.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {notes.map((n) => (
                  <Box key={n.id} border="1px solid #E2E8F0" borderRadius="md" p={3}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="semibold">{n.template_name || "Treatment note"}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(n.created_at).toLocaleString()}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        onClick={() => {
                          setValues(n.data || {});
                          setAppointmentId(n.data?._appointment_id ? String(n.data._appointment_id) : "");
                          copyModal.onClose();
                          toast({ title: "Copied note content", status: "info" });
                        }}
                      >
                        Use
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={copyModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function ClientNavButton({ label, count, active, onClick }) {
  return (
    <Button
      size="sm"
      justifyContent="space-between"
      variant={active ? "solid" : "ghost"}
      bg={active ? "#E2EEF7" : "transparent"}
      color={active ? "#1A365D" : "gray.700"}
      _hover={{ bg: "#E2EEF7" }}
      onClick={onClick}
    >
      <Text>{label}</Text>
      {typeof count === "number" && (
        <Badge bg="#F3E8B7" color="gray.800" borderRadius="md" px={2}>
          {count}
        </Badge>
      )}
    </Button>
  );
}
