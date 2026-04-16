// src/pages/dashboards/EventTypes.jsx
import { useEffect, useState } from "react";
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, Input, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, useToast, Spinner,
} from "@chakra-ui/react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api.js";

export default function EventTypes() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, name: "", color: "#A9CBB7" });

  const load = async () => {
    try {
      const res = await apiGet("/event-types/");
      setTypes(res.results ?? res);
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't load event types" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ id: null, name: "", color: "#A9CBB7" });
    onOpen();
  };

  const openEdit = (t) => {
    setForm({ id: t.id, name: t.name, color: t.color || "#A9CBB7" });
    onOpen();
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ status: "warning", title: "Name is required" });
      return;
    }
    try {
      if (form.id) {
        await apiPut(`/event-types/${form.id}/`, { name: form.name, color: form.color });
      } else {
        await apiPost("/event-types/", { name: form.name, color: form.color });
      }
      toast({ status: "success", title: "Saved successfully" });
      onClose();
      load();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Failed to save event type" });
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this type?")) return;
    try {
      await apiDelete(`/event-types/${id}/`);
      toast({ status: "info", title: "Deleted" });
      load();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Failed to delete" });
    }
  };

  if (loading) {
    return (
      <Box py={20} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" borderRadius="xl" boxShadow="sm">
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Event Types</Heading>
        <Button onClick={openNew} colorScheme="green" variant="solid">
          + New Type
        </Button>
      </HStack>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr><Th>Name</Th><Th>Color</Th><Th isNumeric>Actions</Th></Tr>
        </Thead>
        <Tbody>
          {types.map((t) => (
            <Tr key={t.id}>
              <Td>{t.name}</Td>
              <Td>
                <Box
                  w="16"
                  h="6"
                  bg={t.color}
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                />
              </Td>
              <Td isNumeric>
                <HStack justify="flex-end">
                  <Button size="sm" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => remove(t.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{form.id ? "Edit Type" : "New Type"}</ModalHeader>
          <ModalBody>
            <HStack>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                type="color"
                w="70px"
                p={0}
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={save}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
