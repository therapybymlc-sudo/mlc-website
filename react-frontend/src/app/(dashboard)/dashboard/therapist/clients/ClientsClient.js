'use client'

import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  SimpleGrid,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
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
  const [viewMode, setViewMode] = useState("list"); 
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

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            Client Management
          </Heading>
          <Text color="gray.500">View and manage your clinical caseload.</Text>
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

      {viewMode === "list" ? (
        <Box bg="white" p={6} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <Input 
            placeholder="Search clients..." 
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
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="600">{client.name}</Td>
                    <Td>{client.email}</Td>
                    <Td><Text fontSize="xs" color="green.500" fontWeight="700">ACTIVE</Text></Td>
                    <Td textAlign="right">
                      <Button size="xs" variant="ghost">View Profile</Button>
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
      ) : (
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" maxW="2xl">
          <Heading size="md" mb={6}>Register New Client</Heading>
          <VStack spacing={4}>
            <SimpleGrid columns={2} spacing={4} w="100%">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>First Name</FormLabel>
                <Input 
                  value={newClient.first_name} 
                  onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                  borderRadius="xl"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>Last Name</FormLabel>
                <Input 
                  value={newClient.last_name} 
                  onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                  borderRadius="xl"
                />
              </FormControl>
            </SimpleGrid>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>Email Address</FormLabel>
              <Input 
                type="email"
                value={newClient.email} 
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                borderRadius="xl"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.600" mb={1}>Phone Number</FormLabel>
              <Input 
                value={newClient.phone_number} 
                onChange={(e) => setNewClient({...newClient, phone_number: e.target.value})}
                borderRadius="xl"
              />
            </FormControl>
            <Button w="100%" bg="#56756D" color="white" _hover={{ bg: '#C9A960' }} borderRadius="full" py={6} mt={4} onClick={handleAddClient}>
              Save Client Record
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
