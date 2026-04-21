'use client'

import {
  Box, Heading, Text, Input, Button, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Spinner, SimpleGrid, FormControl, FormLabel, Badge, Divider, Icon, Stack, Grid, GridItem, Progress, Flex, Avatar, Center, Select, Textarea, Checkbox, CheckboxGroup, Radio, RadioGroup, Link,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiUser, FiActivity, FiShield, FiClipboard, FiFileText, FiCalendar, FiCreditCard, FiClock, FiEdit3, FiPaperclip, FiSearch, FiSave, FiX, FiCheckCircle } from "react-icons/fi";
import { apiGet, apiPost, apiPut } from "../../../../../api.js";
import { useRouter } from "next/navigation";

const initialClient = {
  name: "",
  title: "",
  first_name: "",
  last_name: "",
  preferred_first_name: "",
  date_of_birth: "",
  sex: "",
  gender_identity: "",
  pronouns: [],
  extra_information: "",
  email: "",
  phone_number: "",
  phone_type: "Mobile",
  address_line1: "",
  address_line2: "",
  address_line3: "",
  city: "",
  state: "",
  post_code: "",
  country: "Kuwait",
  time_zone: "Use account time zone",
  appointment_notes: "",
  privacy_policy_status: "no_response",
  related_clients: [],
  reminder_sms: false,
  reminder_email: false,
  followup_sms: false,
  followup_email: false,
  marketing_sms: false,
  marketing_email: false,
  receive_booking_confirmation: false,
  receive_booking_cancellation: false,
  concession_type: "None",
  invoice_to: "",
  invoice_email_to: "",
  invoice_extra_information: "",
  occupation: "",
  emergency_contact: "",
  medicare_number: "",
  reference_number: "",
  referring_doctor: "",
  referral_type: "None",
  nationality: "",
  civil_id_number: "",
  client_file_number: "",
  terminated_client: false,
  termination_reasons: [],
  termination_notes: "",
};

export default function ClientsClient() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list, add, detail
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState(initialClient);
  const [editClient, setEditClient] = useState(initialClient);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("details"); // details, notes, files, appointments
  const [search, setSearch] = useState("");
  const [clientNotes, setClientNotes] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [fetchingDetails, setFetchingDetails] = useState(false);
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

  const fetchFullClientDetails = async (clientId) => {
    try {
      setFetchingDetails(true);
      const [c, n, f, a, t] = await Promise.all([
        apiGet(`clients/${clientId}/`),
        apiGet(`notes/?client=${clientId}`),
        apiGet(`files/?client=${clientId}`),
        apiGet(`appointments/?client=${clientId}`),
        apiGet("note-templates/"),
      ]);
      setSelectedClient(c);
      setEditClient(c);
      setClientNotes(Array.isArray(n) ? n : n.results || []);
      setClientFiles(Array.isArray(f) ? f : f.results || []);
      setClientAppointments(Array.isArray(a) ? a : a.results || []);
      setNoteTemplates(Array.isArray(t) ? t : t.results || []);
    } catch (e) {
      toast({ title: "Error loading client file", status: "error" });
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient && viewMode === "detail") {
      fetchFullClientDetails(selectedClient.id);
    }
  }, [viewMode]);

  const handleLinkClient = async (email) => {
    try {
      await apiPost("clients/link_by_email/", { email });
      setNewClient(initialClient);
      setViewMode("list");
      fetchClients();
      toast({ title: "Relationship Secured", description: "This client is now linked to your caseload.", status: "success" });
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAddClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({ title: "Clinical Requirement", description: "Name and Email are mandatory.", status: "warning" });
      return;
    }
    
    // Try linking first
    const linked = await handleLinkClient(newClient.email);
    if (linked) return;

    try {
      const payload = {
        ...newClient,
        name: `${newClient.first_name} ${newClient.last_name}`.trim(),
      };
      await apiPost("clients/", payload);
      setNewClient(initialClient);
      setViewMode("list");
      fetchClients();
      toast({ title: "New File Created", status: "success" });
    } catch (e) {
      toast({ title: "Registration Error", status: "error" });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        ...editClient,
        name: `${editClient.first_name} ${editClient.last_name}`.trim(),
      };
      const res = await apiPut(`clients/${selectedClient.id}/`, payload);
      setSelectedClient(res);
      setIsEditing(false);
      fetchClients();
      toast({ title: "Profile Updated", status: "success" });
    } catch (e) {
      toast({ title: "Update Failed", status: "error" });
    }
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const renderClientHeader = () => (
    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} gap={4}>
      <HStack spacing={4}>
        {viewMode === "detail" && (
          <Button variant="ghost" onClick={() => setViewMode("list")} leftIcon={<FiArrowLeft />}>Back</Button>
        )}
        <VStack align="start" spacing={0}>
          <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', var(--font-playfair), serif">
            {viewMode === "detail" ? selectedClient?.name : "Clinical Caseload"}
          </Heading>
          <Text color="gray.500">
            {viewMode === "detail" ? selectedClient?.email : "Manage patient documentation and clinical history."}
          </Text>
        </VStack>
      </HStack>

      <HStack spacing={3}>
        {viewMode === "detail" ? (
          <>
            <Button leftIcon={<FiCalendar />} colorScheme="teal" borderRadius="full" onClick={() => router.push('/dashboard/therapist/schedule')}>Book Appointment</Button>
            <Button leftIcon={isEditing ? <FiCheckCircle /> : <FiEdit3 />} variant={isEditing ? "solid" : "outline"} colorScheme={isEditing ? "green" : "gray"} borderRadius="full" onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </>
        ) : (
          <Button leftIcon={<FiUser />} colorScheme="teal" borderRadius="full" px={8} onClick={() => setViewMode("add")}>+ Add New Client</Button>
        )}
      </HStack>
    </Flex>
  );

  const renderClientDetail = () => {
    if (fetchingDetails) return <Center py={20}><VStack><Spinner color="teal.500" /><Text>Syncing Clinical Record...</Text></VStack></Center>;
    
    return (
      <Grid templateColumns={{ base: "1fr", lg: "240px 1fr" }} gap={8}>
        {/* Sidebar Nav */}
        <GridItem>
          <VStack align="stretch" spacing={2} bg="white" p={4} borderRadius="2xl" border="1px solid" borderColor="gray.100">
            <NavButton icon={FiUser} label="Clinical Details" active={activeSection === "details"} onClick={() => setActiveSection("details")} />
            <NavButton icon={FiClipboard} label="Session Notes" active={activeSection === "notes"} count={clientNotes.length} onClick={() => setActiveSection("notes")} />
            <NavButton icon={FiPaperclip} label="Record Vault" active={activeSection === "files"} count={clientFiles.length} onClick={() => setActiveSection("files")} />
            <NavButton icon={FiCalendar} label="Appointments" active={activeSection === "appointments"} count={clientAppointments.length} onClick={() => setActiveSection("appointments")} />
            <NavButton icon={FiCreditCard} label="Billing & Invoices" active={activeSection === "billing"} onClick={() => setActiveSection("billing")} />
          </VStack>
        </GridItem>

        {/* Main Content Area */}
        <GridItem overflow="hidden">
           {activeSection === "details" && renderDetailsSection()}
           {activeSection === "notes" && renderNotesSection()}
           {activeSection === "files" && renderFilesSection()}
           {activeSection === "appointments" && renderAppointmentsSection()}
           {activeSection === "billing" && renderBillingSection()}
        </GridItem>
      </Grid>
    );
  };

  const renderDetailsSection = () => (
    <VStack align="stretch" spacing={6} animation="fadeIn 0.5s">
      <DetailCard title="Personal Information" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="First Name" value={editClient.first_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, first_name: v})} />
            <DataField label="Last Name" value={editClient.last_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, last_name: v})} />
            <DataField label="Preferred Name" value={editClient.preferred_first_name} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, preferred_first_name: v})} />
            <DataField label="Date of Birth" value={editClient.date_of_birth} type="date" isEditing={isEditing} onChange={(v) => setEditClient({...editClient, date_of_birth: v})} />
            <DataField label="Sex" value={editClient.sex} isEditing={isEditing} type="select" options={["Female", "Male", "Intersex", "Other"]} onChange={(v) => setEditClient({...editClient, sex: v})} />
            <DataField label="Gender Identity" value={editClient.gender_identity} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, gender_identity: v})} />
         </SimpleGrid>
      </DetailCard>

      <DetailCard title="Contact & Address" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="Email" value={editClient.email} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, email: v})} />
            <DataField label="Phone" value={editClient.phone_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, phone_number: v})} />
            <DataField label="Address Line 1" value={editClient.address_line1} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, address_line1: v})} />
            <DataField label="City" value={editClient.city} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, city: v})} />
            <DataField label="Nationality" value={editClient.nationality} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, nationality: v})} />
            <DataField label="Civil ID Number" value={editClient.civil_id_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, civil_id_number: v})} />
         </SimpleGrid>
      </DetailCard>

      <DetailCard title="Clinical Administrative" isEditing={isEditing}>
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <DataField label="Occupation" value={editClient.occupation} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, occupation: v})} />
            <DataField label="Emergency Contact" value={editClient.emergency_contact} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, emergency_contact: v})} />
            <DataField label="Referral Source" value={editClient.referral_type} isEditing={isEditing} type="select" options={["None", "Google", "Friend", "Doctor", "Other"]} onChange={(v) => setEditClient({...editClient, referral_type: v})} />
            <DataField label="Patient File #" value={editClient.client_file_number} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, client_file_number: v})} />
         </SimpleGrid>
         <Box mt={6}>
            <Text fontWeight="bold" fontSize="sm" mb={2}>Clinical Overview / Intake Notes</Text>
            {isEditing ? (
              <Textarea value={editClient.extra_information} onChange={(e) => setEditClient({...editClient, extra_information: e.target.value})} borderRadius="xl" />
            ) : (
              <Text color="gray.600" bg="gray.50" p={4} borderRadius="xl" fontSize="sm">{editClient.extra_information || "No additional info."}</Text>
            )}
         </Box>
      </DetailCard>
    </VStack>
  );

  const renderNotesSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
      <HStack justify="space-between" mb={4}>
         <Heading size="md">Session Documentation</Heading>
         <Button 
           leftIcon={<FiClipboard />} 
           colorScheme="teal" 
           size="sm" 
           borderRadius="full"
           onClick={() => router.push(`/dashboard/therapist/notes/edit?clientId=${selectedClient?.id}`)}
         >
           New Clinical Note
         </Button>
      </HStack>
      {clientNotes.length === 0 ? (
        <Center py={20} bg="white" borderRadius="3xl" border="1px dashed" borderColor="gray.200">
           <VStack spacing={2}>
              <Icon as={FiEdit3} w={8} h={8} color="gray.300" />
              <Text color="gray.500">No session notes for this patient yet.</Text>
           </VStack>
        </Center>
      ) : (
        clientNotes.map(note => (
          <Box key={note.id} bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm">
             <HStack justify="space-between" mb={3}>
                <VStack align="start" spacing={0}>
                   <Text fontWeight="bold">{note.template_name || "Note"}</Text>
                   <Text fontSize="xs" color="gray.400">{new Date(note.created_at).toLocaleString()}</Text>
                </VStack>
                <Badge borderRadius="full" px={3} colorScheme={note.status === 'final' ? 'green' : 'orange'}>{note.status}</Badge>
             </HStack>
             <Divider py={2} />
             <Box mt={4} fontSize="sm">
                <Text noOfLines={3}>{JSON.stringify(note.data)}</Text>
             </Box>
          </Box>
        ))
      )}
    </VStack>
  );

  const renderFilesSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
       <HStack justify="space-between" mb={4}>
         <Heading size="md">Clinical Vault</Heading>
         <Button leftIcon={<FiPaperclip />} variant="outline" size="sm" borderRadius="full">Upload Document</Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
         {clientFiles.length === 0 ? <Text color="gray.500">No documents found.</Text> : clientFiles.map(file => (
            <HStack key={file.id} p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.100" justify="space-between">
               <HStack>
                  <Icon as={FiPaperclip} color="teal.500" />
                  <VStack align="start" spacing={0}>
                     <Text fontSize="sm" fontWeight="bold">{file.file?.split('/').pop() || "Document"}</Text>
                     <Text fontSize="xs" color="gray.400">{new Date(file.uploaded_at).toLocaleDateString()}</Text>
                  </VStack>
               </HStack>
               <Button size="xs" variant="ghost" colorScheme="teal">View</Button>
            </HStack>
         ))}
      </SimpleGrid>
    </VStack>
  );

  const renderAppointmentsSection = () => (
    <VStack align="stretch" spacing={4} animation="fadeIn 0.5s">
      <Heading size="md" mb={4}>Service History</Heading>
      {clientAppointments.length === 0 ? <Text color="gray.500">No scheduled sessions.</Text> : clientAppointments.map(appt => (
         <HStack key={appt.id} p={5} bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" justify="space-between">
            <HStack spacing={4}>
               <Box p={3} bg="teal.50" borderRadius="xl"><Icon as={FiCalendar} color="teal.500" /></Box>
               <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{new Date(appt.date || appt.start_time).toLocaleString()}</Text>
                  <Text fontSize="xs" color="gray.500">{appt.status_label || appt.status}</Text>
               </VStack>
            </HStack>
            <Badge colorScheme="blue" variant="subtle" borderRadius="full">{appt.status}</Badge>
         </HStack>
      ))}
    </VStack>
  );

  const renderBillingSection = () => (
    <VStack align="stretch" spacing={6} animation="fadeIn 0.5s">
       <DetailCard title="Invoicing & Payments">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
             <DataField label="Concession Type" value={editClient.concession_type} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, concession_type: v})} />
             <DataField label="Invoice Email" value={editClient.invoice_email_to} isEditing={isEditing} onChange={(v) => setEditClient({...editClient, invoice_email_to: v})} />
          </SimpleGrid>
          <Box mt={4}>
             <Text fontWeight="bold" fontSize="sm" mb={2}>Default Invoice Label</Text>
             {isEditing ? <Textarea value={editClient.invoice_to} onChange={(e) => setEditClient({...editClient, invoice_to: e.target.value})} borderRadius="xl" /> : <Text fontSize="sm" color="gray.600">{editClient.invoice_to || "No custom label."}</Text>}
          </Box>
       </DetailCard>
    </VStack>
  );

  return (
    <Box>
      {renderClientHeader()}

      {viewMode === "list" && (
        <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack mb={8} bg="gray.50" p={2} px={4} borderRadius="full">
             <Icon as={FiSearch} color="gray.400" />
             <Input 
               placeholder="Find patient by name or professional email..." 
               variant="unstyled"
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               fontSize="sm"
             />
          </HStack>
          
          {loading ? (
            <VStack py={20}><Spinner color="teal.500" size="xl" /><Text color="gray.500">Retrieving Caseload...</Text></VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.400">PATIENT NAME</Th>
                  <Th color="gray.400">CONTACT</Th>
                  <Th color="gray.400">FILE #</Th>
                  <Th color="gray.400">STATUS</Th>
                  <Th textAlign="right" color="gray.400">ACTIONS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id} _hover={{ bg: "gray.50" }} transition="0.2s" cursor="pointer" onClick={() => { setSelectedClient(client); setViewMode("detail"); }}>
                    <Td>
                      <HStack>
                         <Avatar size="sm" name={client.name} bg="teal.100" color="teal.600" />
                         <Text fontWeight="bold">{client.name}</Text>
                      </HStack>
                    </Td>
                    <Td><Text fontSize="sm">{client.email}</Text></Td>
                    <Td><Text fontSize="xs" fontWeight="bold" color="gray.400">{client.client_file_number || "—"}</Text></Td>
                    <Td><Badge colorScheme="green" variant="subtle" borderRadius="full" px={3}>ACTIVE</Badge></Td>
                    <Td textAlign="right"><Button size="sm" variant="ghost" colorScheme="teal" borderRadius="full">Open File</Button></Td>
                </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      )}

      {viewMode === "add" && (
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" maxW="4xl" mx="auto">
          <Heading size="md" mb={8}>Clinical Registration Form</Heading>
          <VStack spacing={10} align="stretch">
             {/* Same structure as detail sections but editable by default */}
             <DetailCard title="Identity Basics">
                <SimpleGrid columns={2} spacing={6}>
                   <FormControl isRequired><FormLabel fontSize="xs">First Name</FormLabel><Input placeholder="Legal First Name" value={newClient.first_name} onChange={(e) => setNewClient({...newClient, first_name: e.target.value})} borderRadius="xl" /></FormControl>
                   <FormControl isRequired><FormLabel fontSize="xs">Last Name</FormLabel><Input placeholder="Legal Surname" value={newClient.last_name} onChange={(e) => setNewClient({...newClient, last_name: e.target.value})} borderRadius="xl" /></FormControl>
                   <FormControl isRequired><FormLabel fontSize="xs">Profession Email</FormLabel><Input type="email" placeholder="patient@example.com" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} borderRadius="xl" /></FormControl>
                   <FormControl><FormLabel fontSize="xs">Phone Number</FormLabel><Input placeholder="+965" value={newClient.phone_number} onChange={(e) => setNewClient({...newClient, phone_number: e.target.value})} borderRadius="xl" /></FormControl>
                </SimpleGrid>
             </DetailCard>
             
             <DetailCard title="Clinical Specifics">
                <SimpleGrid columns={2} spacing={6}>
                   <FormControl><FormLabel fontSize="xs">Date of Birth</FormLabel><Input type="date" value={newClient.date_of_birth} onChange={(e) => setNewClient({...newClient, date_of_birth: e.target.value})} borderRadius="xl" /></FormControl>
                   <FormControl><FormLabel fontSize="xs">Sex</FormLabel><Select value={newClient.sex} onChange={(e) => setNewClient({...newClient, sex: e.target.value})} borderRadius="xl"><option value="">Select</option><option value="Female">Female</option><option value="Male">Male</option></Select></FormControl>
                </SimpleGrid>
             </DetailCard>
             
             <Flex justify="flex-end" pt={4}>
                <HStack spacing={4}>
                   <Button variant="ghost" onClick={() => setViewMode("list")}>Discard</Button>
                   <Button bg="teal.500" color="white" px={10} borderRadius="full" onClick={handleAddClient} _hover={{ bg: 'teal.600' }}>Save Global Client File</Button>
                </HStack>
             </Flex>
          </VStack>
        </Box>
      )}

      {viewMode === "detail" && renderClientDetail()}
    </Box>
  );
}

function NavButton({ icon, label, count, active, onClick }) {
  return (
    <HStack 
      justify="space-between" 
      p={3} 
      px={4} 
      borderRadius="xl" 
      bg={active ? "teal.50" : "transparent"} 
      color={active ? "teal.700" : "gray.600"}
      _hover={{ bg: "teal.50", color: "teal.700" }}
      cursor="pointer"
      onClick={onClick}
      transition="0.2s"
    >
      <HStack>
         <Icon as={icon} />
         <Text fontSize="sm" fontWeight={active ? "bold" : "medium"}>{label}</Text>
      </HStack>
      {count !== undefined && <Badge colorScheme="teal" borderRadius="full" px={2}>{count}</Badge>}
    </HStack>
  )
}

function DetailCard({ title, children, isEditing }) {
  return (
    <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100" borderTop={isEditing ? "4px solid" : "1px solid"} borderTopColor={isEditing ? "teal.500" : "gray.100"}>
       <Heading size="xs" textTransform="uppercase" color="gray.400" mb={6} letterSpacing="wider">{title}</Heading>
       {children}
    </Box>
  )
}

function DataField({ label, value, isEditing, onChange, type = "text", options = [] }) {
  return (
    <Box>
       <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1}>{label}</Text>
       {isEditing ? (
         type === "select" ? (
           <Select value={value || ""} onChange={(e) => onChange(e.target.value)} borderRadius="xl">
             <option value="">Select</option>
             {options.map(o => <option key={o} value={o}>{o}</option>)}
           </Select>
         ) : (
           <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} borderRadius="xl" />
         )
       ) : (
         <Text fontSize="sm" fontWeight="600" color="gray.700">{value || "—"}</Text>
       )}
    </Box>
  )
}
