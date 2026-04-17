'use client'

import {
  Box, Heading, Text, Input, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner, SimpleGrid, FormControl, FormLabel, Badge, Divider, Icon, Stack, Grid, GridItem, Progress,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiUser, FiActivity, FiShield, FiClipboard, FiFileText } from "react-icons/fi";
import { apiGet, apiPost } from "../../../../../api.js";

const initialClient = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
};

export default function ClientsClient() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list, add, detail
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState(initialClient);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiGet("clients/");
      setClients(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      toast({ title: "Error fetching clients", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({ title: "Please fill required fields", status: "warning" });
      return;
    }
    try {
      await apiPost("clients/", {
        ...newClient,
        name: `${newClient.first_name} ${newClient.last_name}`,
      });
      setNewClient(initialClient);
      setViewMode("list");
      fetchClients();
      toast({ title: "Client added", status: "success" });
    } catch (e) {
      toast({ title: "Error adding client", status: "error" });
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderClientDetail = () => {
    if (!selectedClient) return null;
    const screening = selectedClient.screening_results || selectedClient.last_quiz || null;

    return (
      <Box animation="fadeIn 0.5s">
        <Button leftIcon={<FiArrowLeft />} variant="ghost" mb={6} onClick={() => setViewMode("list")}>Back to List</Button>
        
        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
          {/* Left Column: Profile Card */}
          <GridItem>
            <VStack spacing={6} align="stretch" bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
               <VStack spacing={2} align="center" py={4}>
                  <Box p={4} bg="teal.50" borderRadius="full"><Icon as={FiUser} w={8} h={8} color="teal.500" /></Box>
                  <Heading size="md">{selectedClient.name}</Heading>
                  <Text color="gray.500" fontSize="sm">{selectedClient.email}</Text>
                  <Badge colorScheme="green" borderRadius="full" px={3}>ACTIVE CLIENT</Badge>
               </VStack>
               
               <Divider />
               
               <VStack align="start" spacing={4}>
                  <Heading size="xs" textTransform="uppercase" color="gray.400">Basic Info</Heading>
                  <Box>
                     <Text fontSize="xs" fontWeight="bold" color="gray.500">Age</Text>
                     <Text fontSize="sm">{screening?.age || "—"}</Text>
                  </Box>
                  <Box>
                     <Text fontSize="xs" fontWeight="bold" color="gray.500">Gender</Text>
                     <Text fontSize="sm">{screening?.gender || "—"}</Text>
                  </Box>
                  <Box>
                     <Text fontSize="xs" fontWeight="bold" color="gray.500">Preferred Language</Text>
                     <Text fontSize="sm">{screening?.languages?.join(", ") || "—"}</Text>
                  </Box>
               </VStack>
            </VStack>
          </GridItem>

          {/* Right Column: Clinical Data */}
          <GridItem>
            <VStack spacing={8} align="stretch">
               {/* 📊 DASS-21 Section */}
               <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack justify="space-between" mb={6}>
                     <HStack><Icon as={FiActivity} color="teal.500" /><Heading size="sm">DASS-21 Score & Interpretation</Heading></HStack>
                     <Badge variant="subtle" colorScheme="teal">Clinical Screening</Badge>
                  </HStack>
                  
                  {screening?.dass_scores ? (
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                       {["depression", "anxiety", "stress"].map(scale => {
                          const score = screening.dass_scores[scale];
                          const interpret = screening.dass_interpretations[scale];
                          let color = "gray";
                          if (interpret === "Moderate") color = "orange";
                          if (interpret === "Severe" || interpret === "Extremely Severe") color = "red";
                          
                          return (
                            <VStack key={scale} align="start" p={6} bg={`${color}.50`} borderRadius="2xl" border="1px solid" borderColor={`${color}.100`}>
                               <Text textTransform="uppercase" fontSize="xs" fontWeight="bold" color={`${color}.600`}>{scale}</Text>
                               <Heading size="lg" color={`${color}.700`}>{score}</Heading>
                               <Badge colorScheme={color} borderRadius="full">{interpret}</Badge>
                            </VStack>
                          );
                       })}
                    </SimpleGrid>
                  ) : (
                    <Text color="gray.500" fontStyle="italic">No screening data available for this client.</Text>
                  )}
               </Box>

               {/* 🧠 Presenting Concerns */}
               <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack mb={6}><Icon as={FiFileText} color="teal.500" /><Heading size="sm">Clinical Scope & Concerns</Heading></HStack>
                  <VStack align="start" spacing={6}>
                     <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3}>Primary Concern</Text>
                        <Badge fontSize="md" colorScheme="purple" p={2} px={4} borderRadius="full">{screening?.primary_concern || "Not Specified"}</Badge>
                     </Box>
                     <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3}>Areas of Focus</Text>
                        <HStack spacing={2} wrap="wrap">
                           {screening?.presenting_concerns?.map(c => <Badge key={c} variant="outline" borderRadius="full" px={3} colorScheme="gray">{c}</Badge>)}
                        </HStack>
                     </Box>
                  </VStack>
               </Box>

               {/* 🛡️ Risk & Safety */}
               <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <HStack mb={6}><Icon as={FiShield} color="red.500" /><Heading size="sm">Risk Assessment Summary</Heading></HStack>
                  <SimpleGrid columns={2} spacing={10}>
                     <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Suicidal Ideation</Text>
                        <Text fontWeight="600" color={screening?.suicidal_thoughts === "No" ? "green.500" : "red.500"}>{screening?.suicidal_thoughts || "—"}</Text>
                     </Box>
                     <Box>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Feels Safe at Home</Text>
                        <Text fontWeight="600" color={screening?.feels_safe === "No" ? "red.500" : "green.500"}>{screening?.feels_safe || "—"}</Text>
                     </Box>
                  </SimpleGrid>
               </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {viewMode !== "detail" && (
        <HStack justify="space-between" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
              Client Caseload
            </Heading>
            <Text color="gray.500">Manage your clinical records and documentation.</Text>
          </VStack>
          <Button 
            onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
            colorScheme={viewMode === 'list' ? 'teal' : 'gray'}
            borderRadius="full"
            px={6}
          >
            {viewMode === 'list' ? '+ Add New Client' : 'Back to List'}
          </Button>
        </HStack>
      )}

      {viewMode === "list" && (
        <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Input 
            placeholder="Search by name or email..." 
            mb={6} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            borderRadius="xl"
          />
          {loading ? (
            <VStack py={10}><Spinner color="#56756D" /></VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>Last Assessment</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="600">{client.name}</Td>
                    <Td><Badge colorScheme="green" variant="subtle">ACTIVE</Badge></Td>
                    <Td fontSize="sm" color="gray.600">
                       {client.last_quiz ? "Completed Screening" : "Pending Intake"}
                    </Td>
                    <Td textAlign="right">
                      <Button size="sm" variant="outline" colorScheme="teal" borderRadius="full" onClick={() => {
                        setSelectedClient(client);
                        setViewMode("detail");
                      }}>View Record</Button>
                    </Td>
                  </Tr>
                ))}
                {filteredClients.length === 0 && (
                  <Tr><Td colSpan={4} textAlign="center"><Text color="gray.500" py={4}>No clients found.</Text></Td></Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      )}

      {viewMode === "add" && (
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" maxW="2xl">
          <Heading size="md" mb={6}>Register New Client</Heading>
          <VStack spacing={4}>
            <SimpleGrid columns={2} spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>First Name</FormLabel>
                <Input value={newClient.first_name} onChange={(e) => setNewClient({...newClient, first_name: e.target.value})} borderRadius="xl" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>Last Name</FormLabel>
                <Input value={newClient.last_name} onChange={(e) => setNewClient({...newClient, last_name: e.target.value})} borderRadius="xl" />
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>Email Address</FormLabel>
              <Input type="email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} borderRadius="xl" />
            </FormControl>
            <Button w="100%" bg="#56756D" color="white" _hover={{ bg: '#C9A960' }} borderRadius="full" py={6} mt={4} onClick={handleAddClient}>Save Client Record</Button>
          </VStack>
        </Box>
      )}

      {viewMode === "detail" && renderClientDetail()}
    </Box>
  );
}
