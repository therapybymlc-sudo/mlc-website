'use client'

import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  useToast,
  Spinner,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { apiGet } from "../../../../../api.js";

export default function NotesClient() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiGet("note-templates/");
      setTemplates(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      toast({ title: "Couldn't load templates", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            Clinical Note Templates
          </Heading>
          <Text color="gray.500">Design and manage structured forms for your clinical documentation.</Text>
        </VStack>
        <Button 
          leftIcon={<FiPlus />} 
          bg="#56756D" 
          color="white" 
          _hover={{ bg: "#C9A960" }}
          borderRadius="full"
          px={6}
        >
          New Template
        </Button>
      </HStack>

      <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
        {loading ? (
          <VStack py={10}><Spinner color="#56756D" /></VStack>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Template Name</Th>
                <Th>Description</Th>
                <Th>Fields</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {templates.map((t) => (
                <Tr key={t.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="600">{t.name}</Td>
                  <Td fontSize="sm" color="gray.600">{t.description || "—"}</Td>
                  <Td>{t.fields?.length || 0}</Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end" spacing={1}>
                       <Button size="xs" variant="ghost">Edit</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {templates.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    <Text color="gray.500" py={6}>No templates created yet. Click "New Template" to start.</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}
