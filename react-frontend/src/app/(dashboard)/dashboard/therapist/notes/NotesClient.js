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
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "flex-end" }} mb={8} gap={4}>
        <VStack align={{ base: "center", md: "start" }} spacing={1} textAlign={{ base: "center", md: "left" }}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            Clinical Note Templates
          </Heading>
          <Text color="gray.500">Structured forms for your clinical documentation.</Text>
        </VStack>
        <Button 
          leftIcon={<FiPlus />} 
          bg="#56756D" 
          color="white" 
          _hover={{ bg: "#C9A960" }}
          borderRadius="full"
          px={8}
          w={{ base: "full", md: "auto" }}
        >
          New Template
        </Button>
      </Flex>

      <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
        {loading ? (
          <VStack py={10}><Spinner color="#56756D" /></VStack>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Divider />}>
            {templates.map((t) => (
              <Flex 
                key={t.id} 
                p={4} 
                direction={{ base: "column", sm: "row" }}
                align={{ base: "start", sm: "center" }}
                justify="space-between"
                gap={3}
                _hover={{ bg: 'gray.50' }}
                transition="0.2s"
              >
                <VStack align="start" spacing={0} flex="1" overflow="hidden">
                  <Text fontWeight="700" color="#2E2E2E" noOfLines={1}>{t.name}</Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{t.description || "No description provided."}</Text>
                </VStack>
                <HStack spacing={4} justify={{ base: "space-between", sm: "flex-end" }} w={{ base: "full", sm: "auto" }}>
                  <Badge variant="subtle" colorScheme="gray" borderRadius="full" px={3} whiteSpace="nowrap">
                    {t.fields?.length || 0} FIELDS
                  </Badge>
                  <Button size="xs" variant="ghost" colorScheme="teal" borderRadius="full" px={4} whiteSpace="nowrap">Edit</Button>
                </HStack>
              </Flex>
            ))}
            {templates.length === 0 && (
              <Center py={10}>
                <Text color="gray.500" fontSize="sm">No templates defined.</Text>
              </Center>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
