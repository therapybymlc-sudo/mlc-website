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
];

export default function NoteTemplates() {
  const toast = useToast();
  const { isAdmin } = useAuth(); // role gating (unchanged)
  const manageModal = useDisclosure();       // list modal
  const editorModal = useDisclosure();       // create/edit modal
  const { isOpen: isManageOpen, onOpen: openManage, onClose: closeManage } = manageModal;
  const { isOpen: isEditorOpen, onOpen: openEditor, onClose: closeEditor } = editorModal;

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    fields: [
      {
        label: "",
        field_type: "text",
        is_required: false,
        order: 0,
        // "options" is used by checkboxes/select/likert
        options: {
          choices: [],        // for checkboxes/select
          allow_other: false, // for checkboxes/select
          min: 1,             // for likert
          max: 5,             // for likert
          min_label: "Low",   // for likert
          max_label: "High",  // for likert
        },
      },
    ],
  });

  // -------- data load ----------
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

  // -------- helpers ----------
  const addField = () =>
    setForm((p) => ({
      ...p,
      fields: [
        ...p.fields,
        {
          label: "",
          field_type: "text",
          is_required: false,
          order: p.fields.length,
          options: { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
        },
      ],
    }));

  const rmField = (i) =>
    setForm((p) => ({
      ...p,
      fields: p.fields.filter((_, idx) => idx !== i).map((f, i2) => ({ ...f, order: i2 })),
    }));

  const setField = (i, key, val) => {
    const next = [...form.fields];
    next[i][key] = val;
    // if field type changes, ensure options object exists
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

  // helpers for editing comma separated choices
  const readChoices = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
  const writeChoices = (str) =>
    (str || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // -------- modal actions ----------
  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
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
    });
    // only one modal open at a time
    closeManage();
    openEditor();
  };

  const openEdit = (tpl) => {
    setEditing(tpl);
    setForm({
      name: tpl.name,
      description: tpl.description || "",
      fields:
        (tpl.fields || []).map((f, i) => ({
          label: f.label,
          field_type: f.field_type,
          is_required: !!f.is_required,
          order: typeof f.order === "number" ? f.order : i,
          options: f.options || { choices: [], allow_other: false, min: 1, max: 5, min_label: "Low", max_label: "High" },
        })) || [],
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
        order: typeof f.order === "number" ? f.order : i,
        options: f.options || {},
      })),
    };
    try {
      if (editing) await apiPut(`/note-templates/${editing.id}/`, payload);
      else await apiPost("/note-templates/", payload);
      toast({ status: "success", title: "Template saved" });
      closeEditor();
      await load();
      openManage(); // return to list
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

  // -------- UI ----------
  if (loading)
    return (
      <Box py={20} textAlign="center">
        <Spinner />
      </Box>
    );

  return (
    <Box p={6} bg="white" borderRadius="xl" shadow="sm">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Note Templates</Heading>
        {isAdmin && (
          <HStack>
            <Button variant="outline" onClick={openManage}>Manage</Button>
            <Button leftIcon={<AddIcon />} onClick={openNew} colorScheme="green">New Template</Button>
          </HStack>
        )}
      </HStack>

      {/* quick list (read-only table) */}
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
              <Td>{t.name}</Td>
              <Td>{t.description || "-"}</Td>
              <Td>{t.fields?.length || 0}</Td>
              <Td isNumeric>
                <HStack justify="flex-end">
                  {isAdmin && (
                    <>
                      <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" onClick={() => openEdit(t)} />
                      <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => remove(t.id)} />
                    </>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Manage Modal (list) */}
      <Modal isOpen={isManageOpen} onClose={closeManage} size="3xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Templates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              <HStack justify="space-between">
                <Heading size="sm">Existing</Heading>
                <Button leftIcon={<AddIcon />} onClick={openNew} variant="outline">New Template</Button>
              </HStack>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Fields</Th>
                    <Th textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {templates.map((t) => (
                    <Tr key={t.id}>
                      <Td>{t.name}</Td>
                      <Td>{t.description || "-"}</Td>
                      <Td>{t.fields?.length || 0}</Td>
                      <Td>
                        <HStack justify="flex-end" spacing={2}>
                          <Button size="sm" onClick={() => openEdit(t)}>Edit</Button>
                          <Button size="sm" colorScheme="red" variant="outline" onClick={() => remove(t.id)}>
                            Delete
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeManage}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Editor Modal (create/edit) */}
      <Modal isOpen={isEditorOpen} onClose={closeEditor} size="3xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "Edit Template" : "New Template"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </FormControl>

              <Divider />
              <Heading size="sm">Fields</Heading>

              {form.fields.map((f, i) => (
                <Box key={i} p={3} border="1px solid #E2E8F0" borderRadius="lg">
                  <HStack spacing={3} align="start">
                    <FormControl>
                      <FormLabel>Label</FormLabel>
                      <Input value={f.label} onChange={(e) => setField(i, "label", e.target.value)} />
                    </FormControl>

                    <FormControl w="200px">
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={f.field_type}
                        onChange={(e) => setField(i, "field_type", e.target.value)}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl w="110px">
                      <FormLabel>Order</FormLabel>
                      <Input type="number" value={f.order} onChange={(e) => setField(i, "order", Number(e.target.value))} />
                    </FormControl>

                    <FormControl w="130px" pt={6}>
                      <Checkbox
                        isChecked={!!f.is_required}
                        onChange={(e) => setField(i, "is_required", e.target.checked)}
                      >
                        Required
                      </Checkbox>
                    </FormControl>

                    <IconButton aria-label="Remove field" icon={<DeleteIcon />} colorScheme="red" onClick={() => rmField(i)} />
                  </HStack>

                  {/* Options section (conditional) */}
                  {["checkboxes", "select"].includes(f.field_type) && (
                    <Box mt={3} pl={1}>
                      <FormLabel mb={1}>Choices (comma-separated)</FormLabel>
                      <Input
                        placeholder="e.g. Calm, Anxious, Irritable"
                        value={readChoices(f.options?.choices)}
                        onChange={(e) => setOptions(i, "choices", writeChoices(e.target.value))}
                      />
                      <Checkbox mt={2}
                        isChecked={!!f.options?.allow_other}
                        onChange={(e) => setOptions(i, "allow_other", e.target.checked)}
                      >
                        Allow “Other” text
                      </Checkbox>
                      <HStack mt={2} spacing={1}>
                        {(f.options?.choices || []).map((c, idx) => (
                          <Tag key={idx} size="sm" variant="subtle">
                            <TagLabel>{c}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {f.field_type === "likert" && (
                    <HStack mt={3} spacing={3}>
                      <FormControl w="110px">
                        <FormLabel>Min</FormLabel>
                        <Input
                          type="number"
                          value={f.options?.min ?? 1}
                          onChange={(e) => setOptions(i, "min", Number(e.target.value))}
                        />
                      </FormControl>
                      <FormControl w="110px">
                        <FormLabel>Max</FormLabel>
                        <Input
                          type="number"
                          value={f.options?.max ?? 5}
                          onChange={(e) => setOptions(i, "max", Number(e.target.value))}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Min label</FormLabel>
                        <Input
                          value={f.options?.min_label ?? "Low"}
                          onChange={(e) => setOptions(i, "min_label", e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Max label</FormLabel>
                        <Input
                          value={f.options?.max_label ?? "High"}
                          onChange={(e) => setOptions(i, "max_label", e.target.value)}
                        />
                      </FormControl>
                    </HStack>
                  )}
                </Box>
              ))}

              <Button leftIcon={<AddIcon />} onClick={addField} variant="outline">
                Add Field
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={closeEditor}>Close</Button>
              <Button colorScheme="green" onClick={save}>Save</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
