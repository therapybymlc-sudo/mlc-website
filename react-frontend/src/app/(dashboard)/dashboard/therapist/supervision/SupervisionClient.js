'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, 
  Avatar, Badge, Divider, Flex, useToast, Spinner, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Textarea, IconButton
} from "@chakra-ui/react";
import { FiUsers, FiFileText, FiUploadCloud, FiBook, FiCheckCircle, FiClock, FiPlus, FiCalendar } from "react-icons/fi";
import { apiGet, apiPatch } from "../../../../../api.js";
import NextLink from "next/link";

export default function SupervisionClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupervisee, setSelectedSupervisee] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteContent, setNoteContent] = useState("");
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
    fetchSupervisionData();
  }, []);

  const fetchSupervisionData = async () => {
    try {
      const data = await apiGet("supervisory-relationships/");
      setRelationships(data || []);
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to load supervision caseload.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (loading) return (
    <Container maxW="container.xl" py={20} centerContent>
      <Spinner size="xl" color="mlc.green" thickness="4px" />
      <Text mt={4} color="gray.500">Syncing mentorship portfolio...</Text>
    </Container>
  );

  return (
    <Box pb={20}>
      <VStack align="stretch" spacing={10}>
        {/* 🌿 Headers */}
        <HStack justify="space-between" align="end" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Badge bg="mlc.gold" color="white" px={3} py={1} borderRadius="full" fontSize="2xs">ACTIVE SUPERVISOR</Badge>
            <Heading size="xl" color="mlc.greenDark">Clinical Supervision Suite</Heading>
            <Text color="gray.500">Manage your mentorship caseload and private session records.</Text>
          </VStack>
          <Button 
            as={NextLink} 
            href="/dashboard/therapist/supervision/availability" 
            leftIcon={<FiCalendar />} 
            variant="outline" 
            borderColor="mlc.green" 
            color="mlc.green" 
            borderRadius="full"
            _hover={{ bg: 'mlc.green', color: 'white' }}
          >
            Manage Mentorship Hours
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10}>
          {/* 👥 Supervisee Caseload (Responsive Column) */}
          <VStack align="stretch" spacing={4} gridColumn={{ lg: "span 1" }}>
            <HStack justify="space-between">
              <Heading size="sm" color="gray.700">Practitioners</Heading>
              <Button size="xs" variant="ghost" colorScheme="teal" leftIcon={<FiPlus />}>Add</Button>
            </HStack>
            
            {relationships.length > 0 ? relationships.map((rel) => (
              <Box 
                key={rel.id} 
                p={4} 
                bg={selectedSupervisee?.id === rel.id ? "teal.50" : "white"}
                borderRadius="2xl" 
                border="1px solid" 
                borderColor={selectedSupervisee?.id === rel.id ? "mlc.green" : "gray.100"}
                cursor="pointer"
                onClick={() => setSelectedSupervisee(rel)}
                transition="all 0.2s"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
              >
                <HStack spacing={4}>
                  <Avatar size="md" name={rel.supervisee_name} border="2px solid white" shadow="sm" />
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontWeight="700" color="mlc.greenDark" noOfLines={1}>{rel.supervisee_name}</Text>
                    <Text fontSize="xs" color="gray.500">{rel.supervisee_title || 'Practitioner'}</Text>
                  </VStack>
                  <Icon as={FiCheckCircle} color={rel.status === 'active' ? "green.400" : "gray.300"} />
                </HStack>
              </Box>
            )) : (
              <Box p={8} bg="gray.50" borderRadius="2rem" textAlign="center" border="1px dashed" borderColor="gray.200">
                <Icon as={FiUsers} boxSize={8} color="gray.300" mb={2} />
                <Text fontSize="sm" color="gray.500">No active supervisees yet.</Text>
              </Box>
            )}
          </VStack>

          {/* 📝 Note Engine & Vault (Dynamic Grid) */}
          <Box gridColumn={{ lg: "span 2" }}>
            {selectedSupervisee ? (
              <VStack align="stretch" spacing={8}>
                <Box bg="white" p={{ base: 6, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={8} wrap="wrap" gap={4}>
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="mlc.greenDark">{selectedSupervisee.supervisee_name}</Heading>
                      <Text fontSize="sm" color="gray.500">Active Supervisory Relationship</Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button leftIcon={<FiPlus />} bg="mlc.green" color="white" borderRadius="full" size="sm" onClick={onOpen}>New Note</Button>
                      <Button leftIcon={<FiUploadCloud />} variant="outline" borderColor="mlc.green" color="mlc.green" borderRadius="full" size="sm">Vault</Button>
                    </HStack>
                  </HStack>

                  <Divider mb={8} />

                  <VStack align="stretch" spacing={6}>
                    <Heading size="xs" color="gray.400" textTransform="uppercase" letterSpacing="widest">Private Mentorship Records</Heading>
                    
                    {/* Dynamic Table for Notes */}
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Date</Th>
                            <Th>Session Focus</Th>
                            <Th textAlign="right">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td color="gray.500" py={4}>No notes recorded yet.</Td>
                            <Td></Td>
                            <Td></Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </Box>

                {/* 🛡️ Secure Shared Vault Preview */}
                <Box bg="#F9FBFA" p={8} borderRadius="3xl" border="1px dashed" borderColor="mlc.green">
                   <HStack spacing={4} mb={4}>
                      <Icon as={FiBook} boxSize={6} color="mlc.green" />
                      <Heading size="sm" color="mlc.greenDark">Clinical Case Vault</Heading>
                   </HStack>
                   <Text fontSize="sm" color="gray.600" mb={6}>
                      Shared secure area for formulations, clinical reviews, and professional development resources. 
                      Only you and {selectedSupervisee.supervisee_name} have access.
                   </Text>
                   <Button variant="link" color="mlc.green" rightIcon={<FiClock />} fontSize="xs">View Version History</Button>
                </Box>
              </VStack>
            ) : (
                <Flex direction="column" align="center" justify="center" h="400px" bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.100" p={10} textAlign="center">
                  <Icon as={FiUsers} boxSize={12} color="gray.200" mb={4} />
                  <Heading size="md" color="gray.400">Select a Supervisee</Heading>
                  <Text color="gray.400" maxW="sm" mt={2}>Select a practitioner from your caseload to view their mentorship records and secure vault.</Text>
                </Flex>
            )}
          </Box>
        </SimpleGrid>
      </VStack>

      {/* ✍️ New Supervision Note Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" p={4}>
          <ModalHeader>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" fontWeight="bold" color="mlc.gold">NEW SUPERVISION NOTE</Text>
              <Heading size="md" color="mlc.greenDark">Session with {selectedSupervisee?.supervisee_name}</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.500">
                These notes are end-to-end encrypted and visible ONLY to you. 
                They are not shared with the supervisee unless explicitly exported.
              </Text>
              <Textarea 
                placeholder="Clinical formulation, counter-transference patterns, ethical reviews..." 
                minH="300px" 
                borderRadius="2xl"
                variant="filled"
                bg="gray.50"
                _focus={{ bg: 'white', borderColor: 'mlc.green' }}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} borderRadius="full">Discard</Button>
            <Button bg="mlc.green" color="white" borderRadius="full" px={8} leftIcon={<FiCheckCircle />}>Seal Note</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
