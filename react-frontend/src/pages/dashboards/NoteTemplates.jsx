// src/pages/dashboards/NoteTemplates.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, VStack, FormControl, FormLabel, Input,
  Select, Checkbox, IconButton, useToast, Divider, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Spinner, Text, Textarea, Tag, TagLabel
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";
import { useAuth } from "../../context/AuthContext";

/**
 * Field types supported on the front-end.
 * - "checkboxes": multi-select with many visible checkboxes
 * - "select": classic single-select dropdown (kept for parity)
 * - "likert": a scale with min/max and labels
 * Other types unchanged.
 */
const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "checkboxes", label: "Checkbox group (multi)" },
  { value: "select", label: "Dropdown (single)" },
  { value: "likert", label: "Likert scale" },
  { value: "section", label: "--- SECTION HEADING ---" },
];

export default function NoteTemplates() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const manageModal = useDisclosure();
  const editorModal = useDisclosure();
  const { isOpen: isManageOpen, onOpen: openManage, onClose: closeManage } = manageModal;
  const { isOpen: isEditorOpen, onOpen: openEditor, onClose: closeEditor } = editorModal;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    fields: [],
  });

  const load = async () => {
    try {
      const res = await apiGet("/note-templates/");
      setTemplates(res.results ?? res);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't load templates" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // -------- Movement & Logic ----------
  const addField = (atIndex = -1) => {
    const newField = {
      label: "",
      field_type: "text",
      is_required: false,
      order: 0,
      options: { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
    };
    
    setForm((p) => {
      const fields = [...p.fields];
      if (atIndex === -1) fields.push(newField);
      else fields.splice(atIndex + 1, 0, newField);
      
      return { ...p, fields: fields.map((f, i) => ({ ...f, order: i })) };
    });
  };

  const moveField = (index, direction) => {
    setForm(p => {
      const fields = [...p.fields];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= fields.length) return p;
      [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
      return { ...p, fields: fields.map((f, i) => ({ ...f, order: i })) };
    });
  };

  const rmField = (i) =>
    setForm((p) => ({
      ...p,
      fields: p.fields.filter((_, idx) => idx !== i).map((f, i2) => ({ ...f, order: i2 })),
    }));

  const setField = (i, key, val) => {
    const next = [...form.fields];
    next[i][key] = val;
    if (key === "field_type" && !next[i].options) {
      next[i].options = { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" };
    }
    setForm((p) => ({ ...p, fields: next }));
  };

  const setOptions = (i, key, val) => {
    const next = [...form.fields];
    next[i].options = { ...(next[i].options || {}), [key]: val };
    setForm((p) => ({ ...p, fields: next }));
  };

  const readChoices = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
  const writeChoices = (str) =>
    (str || "").split(",").map((s) => s.trim()).filter(Boolean);

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      fields: [{ label: "", field_type: "text", is_required: false, order: 0, options: {} }],
    });
    closeManage();
    openEditor();
  };

  const openEdit = (tpl) => {
    setEditing(tpl);
    setForm({
      name: tpl.name,
      description: tpl.description || "",
      fields: (tpl.fields || []).sort((a,b) => (a.order||0) - (b.order||0)).map((f, i) => ({
          label: f.label,
          field_type: f.field_type,
          is_required: !!f.is_required,
          order: i,
          options: f.options || { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
      })),
    });
    closeManage();
    openEditor();
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ status: "warning", title: "Template name required" });
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      new_fields: form.fields.map((f, i) => ({
        label: f.label,
        field_type: f.field_type,
        is_required: !!f.is_required,
        order: i,
        options: f.options || {},
      })),
    };
    try {
      if (editing) await apiPut(`/note-templates/${editing.id}/`, payload);
      else await apiPost("/note-templates/", payload);
      toast({ status: "success", title: "Template saved" });
      closeEditor();
      await load();
      openManage();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Save failed" });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await apiDelete(`/note-templates/${id}/`);
      toast({ status: "info", title: "Template deleted" });
      load();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Failed to delete" });
    }
  };

  if (loading) return <Box py={20} textAlign="center"><Spinner /></Box>;

  return (
    <Box p={6} bg="white" borderRadius="xl" shadow="sm">
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="mlc.greenDark">Clinical Note Templates</Heading>
        {isAdmin && (
          <HStack>
            <Button variant="outline" onClick={openManage} borderRadius="full">Manage</Button>
            <Button leftIcon={<AddIcon />} onClick={openNew} bg="mlc.green" color="white" borderRadius="full">New Template</Button>
          </HStack>
        )}
      </HStack>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Fields</Th>
            <Th isNumeric>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((t) => (
            <Tr key={t.id}>
              <Td fontWeight="600">{t.name}</Td>
              <Td>{t.description || "-"}</Td>
              <Td>{t.fields?.length || 0}</Td>
              <Td isNumeric>
                <HStack justify="flex-end">
                  {isAdmin && (
                    <>
                      <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" onClick={() => openEdit(t)} borderRadius="full" />
                      <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" colorScheme="red" variant="ghost" onClick={() => remove(t.id)} />
                    </>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isManageOpen} onClose={closeManage} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="3xl">
          <ModalHeader>Manage Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              <Table size="sm">
                <Thead>
                  <Tr><Th>Name</Th><Th>Fields</Th><Th textAlign="right">Actions</Th></Tr>
                </Thead>
                <Tbody>
                  {templates.map((t) => (
                    <Tr key={t.id}>
                      <Td fontWeight="600">{t.name}</Td>
                      <Td>{t.fields?.length || 0}</Td>
                      <Td><HStack justify="flex-end"><Button size="sm" onClick={() => openEdit(t)} borderRadius="full">Edit</Button><Button size="sm" colorScheme="red" variant="ghost" onClick={() => remove(t.id)}>Delete</Button></HStack></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </ModalBody>
          <ModalFooter><Button variant="ghost" onClick={closeManage} borderRadius="full">Close</Button></ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditorOpen} onClose={closeEditor} size="4xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius="3xl">
          <ModalHeader>{editing ? `Editing: ${form.name}` : "Architect New Template"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={10}>
            <VStack spacing={6} align="stretch">
              <Box p={6} bg="gray.50" borderRadius="2xl">
                <SimpleGrid columns={2} spacing={4}>
                   <FormControl isRequired>
                    <FormLabel fontWeight="700">Template Name</FormLabel>
                    <Input bg="white" borderRadius="xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="700">Internal Description</FormLabel>
                    <Input bg="white" borderRadius="xl" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />
              
              <VStack align="stretch" spacing={4}>
                {form.fields.map((f, i) => (
                  <Box key={i} border="1px solid" borderColor={f.field_type === 'section' ? 'mlc.green' : 'gray.100'} p={4} borderRadius="2xl" position="relative" bg={f.field_type === 'section' ? 'rgba(86, 117, 109, 0.03)' : 'white'}>
                    <HStack spacing={4} align="flex-end">
                      <VStack spacing={1}>
                         <IconButton size="xs" icon={<Text fontSize="10px">▲</Text>} onClick={() => moveField(i, -1)} isDisabled={i === 0} aria-label="up" />
                         <IconButton size="xs" icon={<Text fontSize="10px">▼</Text>} onClick={() => moveField(i, 1)} isDisabled={i === form.fields.length - 1} aria-label="down" />
                      </VStack>

                      <FormControl flex={1}>
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.500">{f.field_type === 'section' ? 'SECTION TITLE' : 'QUESTION LABEL'}</FormLabel>
                        <Input fontWeight={f.field_type === 'section' ? '700' : '400'} size="sm" borderRadius="lg" value={f.label} onChange={(e) => setField(i, "label", e.target.value)} />
                      </FormControl>

                      <FormControl w="180px">
                        <FormLabel fontSize="xs" fontWeight="700" color="gray.500">TYPE</FormLabel>
                        <Select size="sm" borderRadius="lg" value={f.field_type} onChange={(e) => setField(i, "field_type", e.target.value)}>
                          {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </Select>
                      </FormControl>

                      {f.field_type !== 'section' && (
                        <FormControl w="90px">
                           <FormLabel fontSize="xs" fontWeight="700" color="gray.500">REQ</FormLabel>
                           <Checkbox isChecked={!!f.is_required} onChange={(e) => setField(i, "is_required", e.target.checked)}>Yes</Checkbox>
                        </FormControl>
                      )}

                      <IconButton aria-label="Remove" icon={<DeleteIcon />} size="sm" colorScheme="red" variant="ghost" onClick={() => rmField(i)} />
                    </HStack>

                    {["checkboxes", "select"].includes(f.field_type) && (
                      <Box mt={4} pl={10}>
                        <Input size="xs" placeholder="Comma-separated choices..." value={readChoices(f.options?.choices)} onChange={(e) => setOptions(i, "choices", writeChoices(e.target.value))} />
                        <Checkbox mt={2} size="sm" isChecked={!!f.options?.allow_other} onChange={(e) => setOptions(i, "allow_other", e.target.checked)}>Allow "Other"</Checkbox>
                      </Box>
                    )}

                    <Box position="absolute" right="-20px" top="50%" transform="translateY(-50%)" opacity={0} _groupHover={{ opacity: 1 }}>
                       <IconButton size="xs" icon={<AddIcon />} colorScheme="teal" borderRadius="full" onClick={() => addField(i)} />
                    </Box>
                    
                    {/* Inline Insertion Button */}
                    <HStack justify="center" position="absolute" bottom="-15px" left="0" right="0" zIndex={2} opacity={0} _hover={{ opacity: 1 }}>
                        <Button size="xs" leftIcon={<AddIcon />} colorScheme="teal" variant="solid" height="20px" borderRadius="full" fontSize="9px" onClick={() => addField(i)}>
                          Insert Question/Section Here
                        </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>

              <Button leftIcon={<AddIcon />} onClick={() => addField()} variant="dashed" py={8} borderColor="gray.300" borderRadius="2xl">
                Add to Bottom
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.50">
            <HStack spacing={3}>
              <Button variant="ghost" onClick={closeEditor} borderRadius="full">Cancel</Button>
              <Button bg="mlc.green" color="white" px={10} onClick={save} borderRadius="full">Save Template Schema</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
