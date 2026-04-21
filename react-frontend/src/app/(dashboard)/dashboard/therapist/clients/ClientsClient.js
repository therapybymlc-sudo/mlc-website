'use client'

import {
  Box, Heading, Text, Input, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner, SimpleGrid, FormControl, FormLabel, Badge, Divider, Icon, Stack, Grid, GridItem, Progress, Flex, Avatar, Center,
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

  const [clientNotes, setClientNotes] = useState([]);
  const [fetchingNotes, setFetchingNotes] = useState(false);

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

  const fetchClientNotes = async (clientId) => {
    try {
      setFetchingNotes(true);
      const res = await apiGet(`notes/?client=${clientId}`);
      setClientNotes(res.results || res || []);
    } catch (e) {
      toast({ title: "Error fetching clinical notes", status: "error" });
    } finally {
      setFetchingNotes(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient && viewMode === "detail") {
      fetchClientNotes(selectedClient.id);
    }
  }, [selectedClient, viewMode]);

  const handleLinkClient = async (email) => {
    try {
      setLoading(true);
      await apiPost("clients/link_by_email/", { email });
      setNewClient(initialClient); // Reset
      setViewMode("list");
      fetchClients();
      toast({ title: "Relationship Secured", description: "This client is now linked to your caseload.", status: "success" });
    } catch (e) {
      toast({ 
        title: "Search Failed", 
        description: e.response?.data?.detail || "Could not find a record with this email. Try registering them as a new client.", 
        status: "info" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({ title: "Please fill required fields", status: "warning" });
      return;
    }
    try {
      // First, try linking in case they exist
      await handleLinkClient(newClient.email);
    } catch (err) {
      // If linking fails, proceed with registration
      try {
        await apiPost("clients/", {
          ...newClient,
          name: `${newClient.first_name} ${newClient.last_name}`.trim(),
        });
        setNewClient(initialClient);
        setViewMode("list");
        fetchClients();
        toast({ title: "New File Created", status: "success" });
      } catch (e) {
        toast({ title: "Registration Error", description: "This profile could not be created.", status: "error" });
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderClientDetail = () => {
    if (!selectedClient) return null;
    
    // Prioritize new clinical note fields over legacy screening results
    const screening = selectedClient.intake_clinical_notes || selectedClient.screening_results || selectedClient.last_quiz || null;
    const dass = selectedClient.dass_scores || (screening?.dass_scores ? { ...screening.dass_scores, ...screening.dass_interpretations } : null);

    return (
      <Box animation="fadeIn 0.5s">
        <Button leftIcon={<FiArrowLeft />} variant="ghost" mb={6} onClick={() => setViewMode("list")}>Back to List</Button>
        
        <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
          {/* Left Column: Profile Card */}
          <GridItem>
            <VStack spacing={6} align="stretch">
               <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                  <VStack spacing={2} align="center" py={4}>
                     <Box p={4} bg="teal.50" borderRadius="full"><Icon as={FiUser} w={8} h={8} color="teal.500" /></Box>
                     <Heading size="md">{selectedClient.name}</Heading>
                     <Text color="gray.500" fontSize="sm">{selectedClient.email}</Text>
                     <Badge colorScheme="green" borderRadius="full" px={3}>ACTIVE CLIENT</Badge>
                  </VStack>
                  
                  <Divider my={6} />
                  
                  <VStack align="start" spacing={4}>
                     <Heading size="xs" textTransform="uppercase" color="gray.400">Clinical Basics</Heading>
                     <Box w="full">
                        <HStack justify="space-between" fontSize="sm">
                           <Text fontWeight="bold" color="gray.500">Gender</Text>
                           <Text>{screening?.gender || "—"}</Text>
                        </HStack>
                     </Box>
                     <Box w="full">
                        <HStack justify="space-between" fontSize="sm">
                           <Text fontWeight="bold" color="gray.500">Age</Text>
                           <Text>{screening?.age || "—"}</Text>
                        </HStack>
                     </Box>
                  </VStack>
               </Box>

               <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" borderTop="4px solid" borderTopColor="teal.500">
                  <HStack mb={6}><Icon as={FiFileText} color="teal.500" /><Heading size="sm">Session Notes</Heading></HStack>
                  <VStack align="stretch" spacing={4}>
                     {fetchingNotes ? <Spinner size="sm" /> : clientNotes.length > 0 ? clientNotes.map(note => (
                        <Box key={note.id} p={3} bg="gray.50" borderRadius="xl" cursor="pointer" _hover={{ bg: 'gray.100' }}>
                           <HStack justify="space-between">
                              <VStack align="start" spacing={0}>
                                 <Text fontSize="xs" fontWeight="bold">{note.template_name || "Clinical Note"}</Text>
                                 <Text fontSize="2xs" color="gray.500">{new Date(note.created_at).toLocaleDateString()}</Text>
                              </VStack>
                              <Badge size="xs" colorScheme={note.status === 'final' ? 'green' : 'orange'}>{note.status}</Badge>
                           </HStack>
                        </Box>
                     )) : (
                        <Text fontSize="xs" color="gray.400" fontStyle="italic">No notes recorded in this file yet.</Text>
                     )}
                     <Button size="sm" colorScheme="teal" variant="ghost" borderRadius="full" leftIcon={<FiActivity />}>Add Clinical Note</Button>
                  </VStack>
               </Box>
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
                   
                   {dass ? (
                     <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                        {["depression", "anxiety", "stress"].map(scale => {
                           // Use either the score directly or look in nested objects
                           const score = dass[`${scale}_score`] ?? dass[scale];
                           const interpret = dass[`${scale}_level`] ?? (screening?.dass_interpretations ? screening.dass_interpretations[scale] : null);
                           
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
                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Suicidal Ideation</Text>
                         <Text fontWeight="600" color={screening?.suicidal_thoughts === "No" ? "green.500" : "red.500"}>{screening?.suicidal_thoughts || "—"}</Text>
                      </Box>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Feels Safe at Home</Text>
                         <Text fontWeight="600" color={screening?.feels_safe === "No" ? "red.500" : "green.500"}>{screening?.feels_safe || "—"}</Text>
                      </Box>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Physical Health Factors</Text>
                         <Text fontSize="sm">{screening?.health_factors || "—"}</Text>
                      </Box>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Support System</Text>
                         <Text fontSize="sm">{screening?.support_sources?.join(", ") || "—"}</Text>
                      </Box>
                   </SimpleGrid>
                </Box>

                {/* 📝 Identity & Life Context */}
                <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
                   <HStack mb={6}><Icon as={FiUser} color="teal.500" /><Heading size="sm">Identity & Contextual Factors</Heading></HStack>
                   <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Life Stage</Text>
                         <Text fontSize="sm">{screening?.life_stage_context || "—"}</Text>
                      </Box>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Cultural Context</Text>
                         <Text fontSize="sm">{screening?.cultural_social_context || "—"}</Text>
                      </Box>
                      <Box>
                         <Text fontSize="xs" fontWeight="bold" color="gray.500">Identity / Lived Experience</Text>
                         <Text fontSize="sm">{screening?.identity_lived_experience || "—"}</Text>
                      </Box>
                      {screening?.other_identity_details && (
                        <Box gridColumn="span 2">
                           <Text fontSize="xs" fontWeight="bold" color="gray.500">Additional Context</Text>
                           <Text fontSize="sm">{screening.other_identity_details}</Text>
                        </Box>
                      )}
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
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'flex-end' }} mb={8} gap={4}>
          <VStack align={{ base: "center", md: "start" }} spacing={1} textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
              Client Caseload
            </Heading>
            <Text color="gray.500">Manage your clinical records and documentation.</Text>
          </VStack>
          <Button 
            onClick={() => setViewMode(viewMode === 'list' ? 'add' : 'list')}
            colorScheme={viewMode === 'list' ? 'teal' : 'gray'}
            borderRadius="full"
            px={8}
            w={{ base: "full", md: "auto" }}
          >
            {viewMode === 'list' ? '+ Add New Client' : 'Back to List'}
          </Button>
        </Flex>
      )}

      {viewMode === "list" && (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Input 
            placeholder="Search by name or email..." 
            mb={6} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            borderRadius="xl"
            bg="gray.50"
            border="none"
          />
          {loading ? (
            <VStack py={10}><Spinner color="#56756D" /></VStack>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              <Box display={{ base: "none", md: "block" }} mb={2}>
                 <Table variant="simple" size="sm">
                   <Thead>
                     <Tr>
                       <Th color="gray.400" fontWeight="800">NAME</Th>
                       <Th color="gray.400" fontWeight="800">STATUS</Th>
                       <Th color="gray.400" fontWeight="800">SCREENING</Th>
                       <Th textAlign="right" color="gray.400" fontWeight="800">ACTIONS</Th>
                     </Tr>
                   </Thead>
                 </Table>
              </Box>
              
              {filteredClients.map((client) => (
                <Flex 
                   key={client.id} 
                   p={4} 
                   direction={{ base: "column", md: "row" }}
                   align={{ base: "start", md: "center" }}
                   justify="space-between"
                   gap={{ base: 3, md: 4 }}
                   _hover={{ bg: 'gray.50' }}
                   transition="0.2s"
                   wrap="nowrap"
                >
                   <HStack spacing={4} flex="1" overflow="hidden">
                      <Avatar size="sm" name={client.name} bg="teal.50" color="teal.500" />
                      <VStack align="start" spacing={0} overflow="hidden">
                         <Text fontWeight="700" color="#2E2E2E" noOfLines={1}>{client.name}</Text>
                         <Text fontSize="xs" color="gray.400" noOfLines={1} display={{ base: "block", md: "none" }}>{client.email}</Text>
                      </VStack>
                   </HStack>

                   <HStack spacing={4} justify={{ base: "space-between", md: "flex-end" }} w={{ base: "full", md: "auto" }}>
                      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} whiteSpace="nowrap">ACTIVE</Badge>
                      <Text fontSize="xs" color="gray.500" whiteSpace="nowrap" display={{ base: "none", md: "block" }} minW="120px">
                         {client.last_quiz ? "COMPLETED" : "PENDING"}
                      </Text>
                      <Button size="xs" variant="outline" colorScheme="teal" borderRadius="full" px={4} whiteSpace="nowrap" onClick={() => {
                        setSelectedClient(client);
                        setViewMode("detail");
                      }}>Record</Button>
                   </HStack>
                </Flex>
              ))}
              {filteredClients.length === 0 && (
                <Center py={10}><Text color="gray.500">No clients found.</Text></Center>
              )}
            </VStack>
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
