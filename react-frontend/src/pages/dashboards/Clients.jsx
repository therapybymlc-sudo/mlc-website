import {
  Box,
  Heading,
  Text,
  Input,
  Textarea,
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
  Divider,
  Badge,
  Link,
  SimpleGrid,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../api";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientNotes, setClientNotes] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [noteTemplates, setNoteTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
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
    related_patients: [],
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
    patient_file_number: "",
    terminated_patient: false,
    termination_reasons: [],
    termination_notes: "",
  };
  const [newClient, setNewClient] = useState(initialClient);
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editClient, setEditClient] = useState(initialClient);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list | profile | add
  const [activeSection, setActiveSection] = useState("details");
  const toast = useToast();

  // Fetch all clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/clients/");
      const list = Array.isArray(res) ? res : res.results || [];
      setClients(list);
      if (!selectedClientId && list.length > 0) {
        setSelectedClientId(String(list[0].id));
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error fetching clients",
        description: "Check your backend or authentication.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setSelectedClient(null);
      setClientNotes([]);
      setClientFiles([]);
      setClientAppointments([]);
      setNoteTemplates([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [c, n, f, a, t] = await Promise.all([
          apiGet(`/clients/${selectedClientId}/`),
          apiGet(`/notes/?client=${selectedClientId}`),
          apiGet(`/files/?client=${selectedClientId}`),
          apiGet(`/appointments/?client=${selectedClientId}`),
          apiGet("/note-templates/"),
        ]);
        if (!mounted) return;
        const nList = Array.isArray(n) ? n : n.results || [];
        const fList = Array.isArray(f) ? f : f.results || [];
        const aList = Array.isArray(a) ? a : a.results || [];
        const tList = Array.isArray(t) ? t : t.results || [];
        setSelectedClient(c);
        setEditClient(normalizeClient(c));
        setIsEditing(false);
        setClientNotes(
          [...nList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
        setClientFiles(
          [...fList].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
        );
        setClientAppointments(
          [...aList].sort((a, b) => new Date(a.date) - new Date(b.date))
        );
        setNoteTemplates(tList);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedClientId]);

  const fileLabel = (f) =>
    f.file_name || f.original_name || (f.file ? f.file.split("/").pop() : "Untitled");
  const fileUrl = (f) => f.file_url || f.file || "";
  const filteredClients = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const templateById = (id) =>
    noteTemplates.find((t) => String(t.id) === String(id));

  const renderNoteContent = (note) => {
    const tpl = templateById(note.template);
    const data = note.data || {};
    if (!tpl || !Array.isArray(tpl.fields)) {
      return (
        <Box bg="gray.50" p={3} borderRadius="md" fontSize="sm">
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Box>
      );
    }
    return (
      <VStack align="stretch" spacing={3}>
        {tpl.fields.map((f) => {
          const val = data?.[f.id];
          if (val === undefined || val === null || val === "") return null;
          return (
            <Box key={f.id}>
              <Text fontWeight="semibold">{f.label}</Text>
              <Text fontSize="sm" color="gray.700">
                {Array.isArray(val) ? val.join(", ") : String(val)}
              </Text>
            </Box>
          );
        })}
      </VStack>
    );
  };

  const normalizeClient = (c) => ({
    ...initialClient,
    ...c,
    pronouns: c?.pronouns || [],
    related_patients: c?.related_patients || [],
    termination_reasons: c?.termination_reasons || [],
  });

  const renderInfoRows = (pairs) => {
    const filtered = pairs.filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && String(value).trim() !== "";
    });
    if (filtered.length === 0) {
      return <Text color="gray.500" fontStyle="italic">No information added.</Text>;
    }
    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {filtered.map(([label, value]) => (
          <InfoRow
            key={label}
            label={label}
            value={Array.isArray(value) ? value.join(", ") : value}
          />
        ))}
      </SimpleGrid>
    );
  };

  const buildDateOfBirth = () => {
    if (!dobDay || !dobMonth || !dobYear) return null;
    const mm = String(dobMonth).padStart(2, "0");
    const dd = String(dobDay).padStart(2, "0");
    return `${dobYear}-${mm}-${dd}`;
  };

  const handleAddClient = async () => {
    const firstName = newClient.first_name?.trim();
    const lastName = newClient.last_name?.trim();
    const email = newClient.email?.trim();
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing fields",
        description: "First name, last name, and email are required.",
        status: "warning",
      });
      return;
    }
    try {
      const dob = buildDateOfBirth();
      const payload = {
        ...newClient,
        name: `${firstName} ${lastName}`.trim(),
        date_of_birth: dob,
      };
      await apiPost("/clients/", payload);
      setNewClient(initialClient);
      setDobDay("");
      setDobMonth("");
      setDobYear("");
      setViewMode("list");
      fetchClients();
      toast({ title: "Client added successfully", status: "success" });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error adding client",
        description: "Please try again.",
        status: "error",
      });
    }
  };

  const handleSaveEdit = async () => {
    const firstName = editClient.first_name?.trim();
    const lastName = editClient.last_name?.trim();
    const email = editClient.email?.trim();
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing fields",
        description: "First name, last name, and email are required.",
        status: "warning",
      });
      return;
    }
    try {
      const payload = {
        ...editClient,
        name: `${firstName} ${lastName}`.trim(),
        date_of_birth: editClient.date_of_birth || null,
      };
      await apiPut(`/clients/${selectedClientId}/`, payload);
      const refreshed = await apiGet(`/clients/${selectedClientId}/`);
      setSelectedClient(refreshed);
      setEditClient(normalizeClient(refreshed));
      setIsEditing(false);
      fetchClients();
      toast({ title: "Client updated", status: "success" });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error updating client",
        description: "Please try again.",
        status: "error",
      });
    }
  };

  return (
    <Box>
      {viewMode === "list" ? (
        <>
          <HStack justify="space-between" mb={6}>
            <Heading>Patients</Heading>
            <Button
              onClick={() => setViewMode("add")}
              bg="#D14D72"
              color="white"
              borderRadius="md"
              _hover={{ bg: "#B83D60" }}
            >
              + Add client
            </Button>
          </HStack>

          <HStack align="start" spacing={8} flexDir={{ base: "column", xl: "row" }}>
            {/* MIDDLE — Client list + search */}
            <Box flex="1" bg="white" borderRadius="lg" p={6} boxShadow="sm">
              <HStack justify="space-between" mb={4}>
                <Heading size="md">Registered Clients</Heading>
                <Button
                  size="sm"
                  onClick={fetchClients}
                  variant="outline"
                  borderColor="#A9CBB7"
                  _hover={{ bg: "#A9CBB7", color: "white" }}
                >
                  Refresh
                </Button>
              </HStack>
              <Input
                placeholder="Search clients by name or email..."
                mb={4}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Divider mb={4} />

              {loading ? (
                <Spinner />
              ) : filteredClients.length === 0 ? (
                <Text color="gray.500" fontStyle="italic">
                  No clients found.
                </Text>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Date Added</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredClients.map((client) => (
                      <Tr
                        key={client.id}
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        onClick={() => {
                          setSelectedClientId(String(client.id));
                          setActiveSection("details");
                          setViewMode("profile");
                        }}
                      >
                        <Td>{client.name}</Td>
                        <Td>{client.email}</Td>
                        <Td>
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString()
                            : "—"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </HStack>
        </>
      ) : viewMode === "add" ? (
        <>
          <HStack justify="space-between" mb={6}>
            <Heading>Add a new patient</Heading>
            <HStack>
              <Button
                onClick={handleAddClient}
                bg="#2F80ED"
                color="white"
                _hover={{ bg: "#276FD1" }}
              >
                Save patient
              </Button>
              <Button variant="outline" onClick={() => setViewMode("list")}>
                Cancel
              </Button>
            </HStack>
          </HStack>

          <Box bg="white" borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="sm">
            <VStack align="stretch" spacing={8}>
              {/* Section 1: General Information */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  General information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Select
                      value={newClient.title}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, title: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Mr">Mr</option>
                      <option value="Dr">Dr</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>First name</FormLabel>
                    <Input
                      value={newClient.first_name}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, first_name: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Last name</FormLabel>
                    <Input
                      value={newClient.last_name}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, last_name: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Preferred first name</FormLabel>
                    <Input
                      value={newClient.preferred_first_name}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          preferred_first_name: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
                  <FormControl>
                    <FormLabel>Date of birth — Day</FormLabel>
                    <Select value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Month</FormLabel>
                    <Select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                    >
                      <option value="">Month</option>
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <FormControl>
                    <FormLabel>Sex</FormLabel>
                    <Select
                      value={newClient.sex}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, sex: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Intersex">Intersex</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Gender identity</FormLabel>
                    <Input
                      value={newClient.gender_identity}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          gender_identity: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>Pronouns</FormLabel>
                  <CheckboxGroup
                    value={newClient.pronouns}
                    onChange={(vals) =>
                      setNewClient((c) => ({ ...c, pronouns: vals }))
                    }
                  >
                    <Stack direction={{ base: "column", md: "row" }}>
                      <Checkbox value="She/Her">She/Her</Checkbox>
                      <Checkbox value="He/Him">He/Him</Checkbox>
                      <Checkbox value="They/Them">They/Them</Checkbox>
                      <Checkbox value="Other">Other</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>

                <FormControl mt={4}>
                  <FormLabel>Extra information</FormLabel>
                  <Textarea
                    value={newClient.extra_information}
                    onChange={(e) =>
                      setNewClient((c) => ({
                        ...c,
                        extra_information: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </Box>

              {/* Section 2: Appointment Notes */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Appointment notes
                </Heading>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={newClient.appointment_notes}
                    onChange={(e) =>
                      setNewClient((c) => ({
                        ...c,
                        appointment_notes: e.target.value,
                      }))
                    }
                  />
                  <FormHelperText>
                    These notes will be shown on this patient’s appointments in the calendar.
                  </FormHelperText>
                </FormControl>
              </Box>

              {/* Section 3: Privacy Policy */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Privacy policy
                </Heading>
                <FormControl>
                  <FormLabel>Does the patient consent to your privacy policy?</FormLabel>
                  <RadioGroup
                    value={newClient.privacy_policy_status}
                    onChange={(val) =>
                      setNewClient((c) => ({ ...c, privacy_policy_status: val }))
                    }
                  >
                    <Stack direction={{ base: "column", md: "row" }}>
                      <Radio value="no_response">No response</Radio>
                      <Radio value="accepted">Accepted</Radio>
                      <Radio value="rejected">Rejected</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </Box>

              {/* Section 4: Related Patients */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Related patients
                </Heading>
                <Button variant="outline">Add relationship</Button>
              </Box>

              {/* Section 5: Contact Information */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Contact information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Phone number</FormLabel>
                    <Input
                      value={newClient.phone_number}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, phone_number: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone type</FormLabel>
                    <Select
                      value={newClient.phone_type}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, phone_type: e.target.value }))
                      }
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={newClient.email}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, email: e.target.value }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                  <FormControl>
                    <FormLabel>Address line 1</FormLabel>
                    <Input
                      value={newClient.address_line1}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, address_line1: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address line 2</FormLabel>
                    <Input
                      value={newClient.address_line2}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, address_line2: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address line 3</FormLabel>
                    <Input
                      value={newClient.address_line3}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, address_line3: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={newClient.city}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, city: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={newClient.state}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, state: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Post code</FormLabel>
                    <Input
                      value={newClient.post_code}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, post_code: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={newClient.country}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, country: e.target.value }))
                      }
                    >
                      <option value="Kuwait">Kuwait</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="UAE">UAE</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Time zone</FormLabel>
                    <Select
                      value={newClient.time_zone}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, time_zone: e.target.value }))
                      }
                    >
                      <option value="Use account time zone">Use account time zone</option>
                      <option value="Asia/Kuwait">Asia/Kuwait</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Section 6: Communication Preferences */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Communication preferences
                </Heading>
                <FormControl>
                  <FormLabel>Appointment reminders</FormLabel>
                  <HStack spacing={6}>
                    <Checkbox
                      isChecked={newClient.reminder_sms}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, reminder_sms: e.target.checked }))
                      }
                    >
                      SMS
                    </Checkbox>
                    <Checkbox
                      isChecked={newClient.reminder_email}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, reminder_email: e.target.checked }))
                      }
                    >
                      Email
                    </Checkbox>
                  </HStack>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Follow-up messages</FormLabel>
                  <HStack spacing={6}>
                    <Checkbox
                      isChecked={newClient.followup_sms}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, followup_sms: e.target.checked }))
                      }
                    >
                      SMS
                    </Checkbox>
                    <Checkbox
                      isChecked={newClient.followup_email}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, followup_email: e.target.checked }))
                      }
                    >
                      Email
                    </Checkbox>
                  </HStack>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Marketing messages</FormLabel>
                  <HStack spacing={6}>
                    <Checkbox
                      isChecked={newClient.marketing_sms}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, marketing_sms: e.target.checked }))
                      }
                    >
                      SMS
                    </Checkbox>
                    <Checkbox
                      isChecked={newClient.marketing_email}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, marketing_email: e.target.checked }))
                      }
                    >
                      Email
                    </Checkbox>
                  </HStack>
                  <FormHelperText>
                    They will receive any messages you send for marketing purposes.
                  </FormHelperText>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>System email notifications</FormLabel>
                  <VStack align="start">
                    <Checkbox
                      isChecked={newClient.receive_booking_confirmation}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          receive_booking_confirmation: e.target.checked,
                        }))
                      }
                    >
                      Receive booking confirmation emails
                    </Checkbox>
                    <Checkbox
                      isChecked={newClient.receive_booking_cancellation}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          receive_booking_cancellation: e.target.checked,
                        }))
                      }
                    >
                      Receive booking cancellation emails
                    </Checkbox>
                  </VStack>
                </FormControl>
              </Box>

              {/* Section 7: Billing Information */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Billing information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Concession type</FormLabel>
                    <Select
                      value={newClient.concession_type}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, concession_type: e.target.value }))
                      }
                    >
                      <option value="None">None</option>
                      <option value="Student">Student</option>
                      <option value="Senior">Senior</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email invoice to</FormLabel>
                    <Input
                      value={newClient.invoice_email_to}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, invoice_email_to: e.target.value }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Invoice to</FormLabel>
                  <Textarea
                    value={newClient.invoice_to}
                    onChange={(e) =>
                      setNewClient((c) => ({ ...c, invoice_to: e.target.value }))
                    }
                  />
                  <FormHelperText>
                    This is the default used on new invoices.
                  </FormHelperText>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Invoice extra information</FormLabel>
                  <Input
                    placeholder="eg. Claim number #000000"
                    value={newClient.invoice_extra_information}
                    onChange={(e) =>
                      setNewClient((c) => ({
                        ...c,
                        invoice_extra_information: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </Box>

              {/* Section 8: Other Information */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Other information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Occupation</FormLabel>
                    <Input
                      value={newClient.occupation}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, occupation: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Emergency contact</FormLabel>
                    <Input
                      value={newClient.emergency_contact}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          emergency_contact: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Medicare number</FormLabel>
                    <Input
                      value={newClient.medicare_number}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, medicare_number: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Reference number</FormLabel>
                    <Input
                      value={newClient.reference_number}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, reference_number: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Referring doctor</FormLabel>
                    <Input
                      value={newClient.referring_doctor}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, referring_doctor: e.target.value }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Section 9: Referral Source */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Referral source
                </Heading>
                <FormControl>
                  <FormLabel>Referral type</FormLabel>
                  <Select
                    value={newClient.referral_type}
                    onChange={(e) =>
                      setNewClient((c) => ({ ...c, referral_type: e.target.value }))
                    }
                  >
                    <option value="None">None</option>
                    <option value="Google">Google</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Doctor</option>
                  </Select>
                </FormControl>
              </Box>

              {/* Section 10: Additional Administrative Information */}
              <Box>
                <Heading size="sm" bg="#E8F1FA" p={3} borderRadius="md" mb={4}>
                  Additional administrative information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Nationality</FormLabel>
                    <Input
                      value={newClient.nationality}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, nationality: e.target.value }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Civil ID number</FormLabel>
                    <Input
                      value={newClient.civil_id_number}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          civil_id_number: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Patient file number</FormLabel>
                    <Input
                      value={newClient.patient_file_number}
                      onChange={(e) =>
                        setNewClient((c) => ({
                          ...c,
                          patient_file_number: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Terminated patient</FormLabel>
                  <RadioGroup
                    value={newClient.terminated_patient ? "yes" : "no"}
                    onChange={(val) =>
                      setNewClient((c) => ({
                        ...c,
                        terminated_patient: val === "yes",
                      }))
                    }
                  >
                    <Stack direction={{ base: "column", md: "row" }}>
                      <Radio value="no">No</Radio>
                      <Radio value="yes">Yes</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Reason for termination</FormLabel>
                  <CheckboxGroup
                    value={newClient.termination_reasons}
                    onChange={(vals) =>
                      setNewClient((c) => ({ ...c, termination_reasons: vals }))
                    }
                  >
                    <Stack direction={{ base: "column", md: "row" }}>
                      <Checkbox value="Completed treatment">Completed treatment</Checkbox>
                      <Checkbox value="Patient request">Patient request</Checkbox>
                      <Checkbox value="Non-compliance">Non-compliance</Checkbox>
                      <Checkbox value="Insurance coverage ended">Insurance coverage ended</Checkbox>
                      <Checkbox value="Ethical concerns">Ethical concerns</Checkbox>
                      <Checkbox value="Other">Other</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Additional notes</FormLabel>
                  <Textarea
                    value={newClient.termination_notes}
                    onChange={(e) =>
                      setNewClient((c) => ({
                        ...c,
                        termination_notes: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </Box>

              {/* Footer actions */}
              <HStack justify="flex-end">
                <Button
                  onClick={handleAddClient}
                  bg="#2F80ED"
                  color="white"
                  _hover={{ bg: "#276FD1" }}
                >
                  Save patient
                </Button>
                <Button variant="outline" onClick={() => setViewMode("list")}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </Box>
        </>
      ) : (
        <>
          <HStack justify="space-between" mb={6}>
            <Heading>
              {selectedClient?.name || "Patient"}
            </Heading>
            <HStack>
              {isEditing ? (
                <>
                  <Button size="sm" colorScheme="blue" onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditClient(normalizeClient(selectedClient));
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveSection("details");
                    setEditClient(normalizeClient(selectedClient));
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline">History</Button>
              <Button size="sm" variant="outline">Merge</Button>
              <Button size="sm" variant="outline">Archive</Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => {
                  if (!selectedClientId) return;
                  navigate(
                    `/dashboard/therapist?tab=schedule&newAppointmentClientId=${selectedClientId}`
                  );
                }}
              >
                Book appt.
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setViewMode("list")}>
                Back to list
              </Button>
            </HStack>
          </HStack>

          <HStack align="start" spacing={8} flexDir={{ base: "column", xl: "row" }}>
            {/* LEFT — contextual nav */}
            <Box w={{ base: "100%", xl: "240px" }} bg="white" borderRadius="lg" p={4} boxShadow="sm">
              <VStack align="stretch" spacing={2}>
                <NavButton label="Patient details" active={activeSection === "details"} onClick={() => setActiveSection("details")} />
                <NavButton label="Treatment notes" count={clientNotes.length} active={activeSection === "notes"} onClick={() => setActiveSection("notes")} />
                <NavButton label="Files" count={clientFiles.length} active={activeSection === "files"} onClick={() => setActiveSection("files")} />
                <NavButton label="Appointments" count={clientAppointments.length} active={activeSection === "appointments"} onClick={() => setActiveSection("appointments")} />
              </VStack>
            </Box>

            {/* CENTER — main content */}
            <Box flex="1" bg="white" borderRadius="lg" p={6} boxShadow="sm">
              {activeSection === "details" && (
                <VStack align="stretch" spacing={6}>
                  {isEditing ? (
                    <>
                      <SectionCard title="General information">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Title</FormLabel>
                            <Select
                              value={editClient.title || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, title: e.target.value }))
                              }
                            >
                              <option value="">Select</option>
                              <option value="Ms">Ms</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Mr">Mr</option>
                              <option value="Dr">Dr</option>
                            </Select>
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>First name</FormLabel>
                            <Input
                              value={editClient.first_name || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, first_name: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel>Last name</FormLabel>
                            <Input
                              value={editClient.last_name || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, last_name: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Preferred first name</FormLabel>
                            <Input
                              value={editClient.preferred_first_name || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  preferred_first_name: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Date of birth</FormLabel>
                            <Input
                              type="date"
                              value={editClient.date_of_birth || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  date_of_birth: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Sex</FormLabel>
                            <Select
                              value={editClient.sex || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, sex: e.target.value }))
                              }
                            >
                              <option value="">Select</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Intersex">Intersex</option>
                              <option value="Other">Other</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Gender identity</FormLabel>
                            <Input
                              value={editClient.gender_identity || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  gender_identity: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                        </SimpleGrid>
                        <FormControl mt={4}>
                          <FormLabel>Pronouns</FormLabel>
                          <CheckboxGroup
                            value={editClient.pronouns || []}
                            onChange={(vals) =>
                              setEditClient((c) => ({ ...c, pronouns: vals }))
                            }
                          >
                            <Stack direction={{ base: "column", md: "row" }}>
                              <Checkbox value="She/Her">She/Her</Checkbox>
                              <Checkbox value="He/Him">He/Him</Checkbox>
                              <Checkbox value="They/Them">They/Them</Checkbox>
                              <Checkbox value="Other">Other</Checkbox>
                            </Stack>
                          </CheckboxGroup>
                        </FormControl>
                        <FormControl mt={4}>
                          <FormLabel>Extra information</FormLabel>
                          <Textarea
                            value={editClient.extra_information || ""}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                extra_information: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                      </SectionCard>

                      <SectionCard title="Contact information">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                              value={editClient.email || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, email: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Phone number</FormLabel>
                            <Input
                              value={editClient.phone_number || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, phone_number: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Phone type</FormLabel>
                            <Select
                              value={editClient.phone_type || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, phone_type: e.target.value }))
                              }
                            >
                              <option value="">Select</option>
                              <option value="Mobile">Mobile</option>
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Address line 1</FormLabel>
                            <Input
                              value={editClient.address_line1 || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, address_line1: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Address line 2</FormLabel>
                            <Input
                              value={editClient.address_line2 || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, address_line2: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Address line 3</FormLabel>
                            <Input
                              value={editClient.address_line3 || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, address_line3: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>City</FormLabel>
                            <Input
                              value={editClient.city || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, city: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>State</FormLabel>
                            <Input
                              value={editClient.state || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, state: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Post code</FormLabel>
                            <Input
                              value={editClient.post_code || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, post_code: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Country</FormLabel>
                            <Input
                              value={editClient.country || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, country: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Time zone</FormLabel>
                            <Input
                              value={editClient.time_zone || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, time_zone: e.target.value }))
                              }
                            />
                          </FormControl>
                        </SimpleGrid>
                      </SectionCard>

                      <SectionCard title="Appointment notes">
                        <Textarea
                          value={editClient.appointment_notes || ""}
                          onChange={(e) =>
                            setEditClient((c) => ({
                              ...c,
                              appointment_notes: e.target.value,
                            }))
                          }
                        />
                      </SectionCard>

                      <SectionCard title="Privacy policy">
                        <RadioGroup
                          value={editClient.privacy_policy_status || "no_response"}
                          onChange={(val) =>
                            setEditClient((c) => ({
                              ...c,
                              privacy_policy_status: val,
                            }))
                          }
                        >
                          <Stack direction={{ base: "column", md: "row" }}>
                            <Radio value="no_response">No response</Radio>
                            <Radio value="accepted">Accepted</Radio>
                            <Radio value="rejected">Rejected</Radio>
                          </Stack>
                        </RadioGroup>
                      </SectionCard>

                      <SectionCard title="Communication preferences">
                        <HStack spacing={6} mb={3}>
                          <Checkbox
                            isChecked={editClient.reminder_sms}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                reminder_sms: e.target.checked,
                              }))
                            }
                          >
                            Reminder SMS
                          </Checkbox>
                          <Checkbox
                            isChecked={editClient.reminder_email}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                reminder_email: e.target.checked,
                              }))
                            }
                          >
                            Reminder Email
                          </Checkbox>
                        </HStack>
                        <HStack spacing={6} mb={3}>
                          <Checkbox
                            isChecked={editClient.followup_sms}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                followup_sms: e.target.checked,
                              }))
                            }
                          >
                            Follow-up SMS
                          </Checkbox>
                          <Checkbox
                            isChecked={editClient.followup_email}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                followup_email: e.target.checked,
                              }))
                            }
                          >
                            Follow-up Email
                          </Checkbox>
                        </HStack>
                        <HStack spacing={6} mb={3}>
                          <Checkbox
                            isChecked={editClient.marketing_sms}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                marketing_sms: e.target.checked,
                              }))
                            }
                          >
                            Marketing SMS
                          </Checkbox>
                          <Checkbox
                            isChecked={editClient.marketing_email}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                marketing_email: e.target.checked,
                              }))
                            }
                          >
                            Marketing Email
                          </Checkbox>
                        </HStack>
                        <VStack align="start">
                          <Checkbox
                            isChecked={editClient.receive_booking_confirmation}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                receive_booking_confirmation: e.target.checked,
                              }))
                            }
                          >
                            Receive booking confirmation emails
                          </Checkbox>
                          <Checkbox
                            isChecked={editClient.receive_booking_cancellation}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                receive_booking_cancellation: e.target.checked,
                              }))
                            }
                          >
                            Receive booking cancellation emails
                          </Checkbox>
                        </VStack>
                      </SectionCard>

                      <SectionCard title="Billing information">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Concession type</FormLabel>
                            <Input
                              value={editClient.concession_type || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  concession_type: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Email invoice to</FormLabel>
                            <Input
                              value={editClient.invoice_email_to || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  invoice_email_to: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                        </SimpleGrid>
                        <FormControl mt={4}>
                          <FormLabel>Invoice to</FormLabel>
                          <Textarea
                            value={editClient.invoice_to || ""}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                invoice_to: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                        <FormControl mt={4}>
                          <FormLabel>Invoice extra information</FormLabel>
                          <Input
                            value={editClient.invoice_extra_information || ""}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                invoice_extra_information: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                      </SectionCard>

                      <SectionCard title="Other information">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Occupation</FormLabel>
                            <Input
                              value={editClient.occupation || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({ ...c, occupation: e.target.value }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Emergency contact</FormLabel>
                            <Input
                              value={editClient.emergency_contact || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  emergency_contact: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Medicare number</FormLabel>
                            <Input
                              value={editClient.medicare_number || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  medicare_number: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Reference number</FormLabel>
                            <Input
                              value={editClient.reference_number || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  reference_number: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Referring doctor</FormLabel>
                            <Input
                              value={editClient.referring_doctor || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  referring_doctor: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                        </SimpleGrid>
                      </SectionCard>

                      <SectionCard title="Referral source">
                        <FormControl>
                          <FormLabel>Referral type</FormLabel>
                          <Input
                            value={editClient.referral_type || ""}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                referral_type: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                      </SectionCard>

                      <SectionCard title="Additional administrative information">
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Nationality</FormLabel>
                            <Input
                              value={editClient.nationality || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  nationality: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Civil ID number</FormLabel>
                            <Input
                              value={editClient.civil_id_number || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  civil_id_number: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Patient file number</FormLabel>
                            <Input
                              value={editClient.patient_file_number || ""}
                              onChange={(e) =>
                                setEditClient((c) => ({
                                  ...c,
                                  patient_file_number: e.target.value,
                                }))
                              }
                            />
                          </FormControl>
                        </SimpleGrid>
                        <FormControl mt={4}>
                          <FormLabel>Terminated patient</FormLabel>
                          <RadioGroup
                            value={editClient.terminated_patient ? "yes" : "no"}
                            onChange={(val) =>
                              setEditClient((c) => ({
                                ...c,
                                terminated_patient: val === "yes",
                              }))
                            }
                          >
                            <Stack direction={{ base: "column", md: "row" }}>
                              <Radio value="no">No</Radio>
                              <Radio value="yes">Yes</Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>
                        <FormControl mt={4}>
                          <FormLabel>Reason for termination</FormLabel>
                          <CheckboxGroup
                            value={editClient.termination_reasons || []}
                            onChange={(vals) =>
                              setEditClient((c) => ({
                                ...c,
                                termination_reasons: vals,
                              }))
                            }
                          >
                            <Stack direction={{ base: "column", md: "row" }}>
                              <Checkbox value="Completed treatment">Completed treatment</Checkbox>
                              <Checkbox value="Patient request">Patient request</Checkbox>
                              <Checkbox value="Non-compliance">Non-compliance</Checkbox>
                              <Checkbox value="Insurance coverage ended">Insurance coverage ended</Checkbox>
                              <Checkbox value="Ethical concerns">Ethical concerns</Checkbox>
                              <Checkbox value="Other">Other</Checkbox>
                            </Stack>
                          </CheckboxGroup>
                        </FormControl>
                        <FormControl mt={4}>
                          <FormLabel>Additional notes</FormLabel>
                          <Textarea
                            value={editClient.termination_notes || ""}
                            onChange={(e) =>
                              setEditClient((c) => ({
                                ...c,
                                termination_notes: e.target.value,
                              }))
                            }
                          />
                        </FormControl>
                      </SectionCard>
                    </>
                  ) : (
                    <>
                      <SectionCard title="Contact information">
                        {renderInfoRows([
                          ["Email", selectedClient?.email],
                          ["Phone number", selectedClient?.phone_number],
                          ["Phone type", selectedClient?.phone_type],
                          ["Address line 1", selectedClient?.address_line1],
                          ["Address line 2", selectedClient?.address_line2],
                          ["Address line 3", selectedClient?.address_line3],
                          ["City", selectedClient?.city],
                          ["State", selectedClient?.state],
                          ["Post code", selectedClient?.post_code],
                          ["Country", selectedClient?.country],
                          ["Time zone", selectedClient?.time_zone],
                        ])}
                      </SectionCard>

                      <SectionCard title="Appointment notes">
                        {selectedClient?.appointment_notes ? (
                          <Text fontSize="sm" color="gray.700">
                            {selectedClient.appointment_notes}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.500" fontStyle="italic">
                            No appointment notes yet.
                          </Text>
                        )}
                      </SectionCard>

                      <SectionCard title="Related patients">
                        {renderInfoRows([["Related patients", selectedClient?.related_patients]])}
                      </SectionCard>

                      <SectionCard title="General information">
                        {renderInfoRows([
                          ["Title", selectedClient?.title],
                          ["First name", selectedClient?.first_name],
                          ["Last name", selectedClient?.last_name],
                          ["Preferred first name", selectedClient?.preferred_first_name],
                          ["Date of birth", selectedClient?.date_of_birth],
                          ["Sex", selectedClient?.sex],
                          ["Gender identity", selectedClient?.gender_identity],
                          ["Pronouns", selectedClient?.pronouns],
                          ["Extra information", selectedClient?.extra_information],
                        ])}
                      </SectionCard>

                      <SectionCard title="Communication preferences">
                        {renderInfoRows([
                          ["Reminder SMS", selectedClient?.reminder_sms ? "Yes" : ""],
                          ["Reminder Email", selectedClient?.reminder_email ? "Yes" : ""],
                          ["Follow-up SMS", selectedClient?.followup_sms ? "Yes" : ""],
                          ["Follow-up Email", selectedClient?.followup_email ? "Yes" : ""],
                          ["Marketing SMS", selectedClient?.marketing_sms ? "Yes" : ""],
                          ["Marketing Email", selectedClient?.marketing_email ? "Yes" : ""],
                          ["Booking confirmation emails", selectedClient?.receive_booking_confirmation ? "Yes" : ""],
                          ["Booking cancellation emails", selectedClient?.receive_booking_cancellation ? "Yes" : ""],
                        ])}
                      </SectionCard>

                      <SectionCard title="Billing information">
                        {renderInfoRows([
                          ["Concession type", selectedClient?.concession_type],
                          ["Invoice to", selectedClient?.invoice_to],
                          ["Email invoice to", selectedClient?.invoice_email_to],
                          ["Invoice extra information", selectedClient?.invoice_extra_information],
                        ])}
                      </SectionCard>

                      <SectionCard title="Other information">
                        {renderInfoRows([
                          ["Occupation", selectedClient?.occupation],
                          ["Emergency contact", selectedClient?.emergency_contact],
                          ["Medicare number", selectedClient?.medicare_number],
                          ["Reference number", selectedClient?.reference_number],
                          ["Referring doctor", selectedClient?.referring_doctor],
                        ])}
                      </SectionCard>

                      <SectionCard title="Referral source">
                        {renderInfoRows([["Referral type", selectedClient?.referral_type]])}
                      </SectionCard>

                      <SectionCard title="Additional administrative information">
                        {renderInfoRows([
                          ["Nationality", selectedClient?.nationality],
                          ["Civil ID number", selectedClient?.civil_id_number],
                          ["Patient file number", selectedClient?.patient_file_number],
                          ["Terminated patient", selectedClient?.terminated_patient ? "Yes" : ""],
                          ["Termination reasons", selectedClient?.termination_reasons],
                          ["Additional notes", selectedClient?.termination_notes],
                        ])}
                      </SectionCard>
                    </>
                  )}
                </VStack>
              )}

              {activeSection === "notes" && (
                <VStack align="stretch" spacing={4}>
                  <Input placeholder="Filter treatment notes by any word or phrase..." />
                  {clientNotes.length === 0 ? (
                    <Text color="gray.500" fontStyle="italic">No notes yet.</Text>
                  ) : (
                    clientNotes.map((n) => (
                      <Box key={n.id} border="1px solid #E2E8F0" borderRadius="md" p={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold">{n.template_name || "Treatment note"}</Text>
                          <Badge colorScheme={n.status === "final" ? "green" : "yellow"}>{n.status}</Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.600" mb={3}>
                          {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                        </Text>
                        {renderNoteContent(n)}
                      </Box>
                    ))
                  )}
                </VStack>
              )}

              {activeSection === "files" && (
                <VStack align="stretch" spacing={4}>
                  <Input placeholder="Search files by any word or phrase..." />
                  {clientFiles.length === 0 ? (
                    <Text color="gray.500" fontStyle="italic">No files uploaded.</Text>
                  ) : (
                    clientFiles.map((f) => (
                      <HStack
                        key={f.id}
                        justify="space-between"
                        p={3}
                        border="1px solid #E2E8F0"
                        borderRadius="md"
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold">{fileLabel(f)}</Text>
                          <Text fontSize="xs" color="gray.600">
                            {f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : ""}
                          </Text>
                        </VStack>
                        {fileUrl(f) && (
                          <Link href={fileUrl(f)} target="_blank">
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        )}
                      </HStack>
                    ))
                  )}
                </VStack>
              )}

              {activeSection === "appointments" && (
                <VStack align="stretch" spacing={4}>
                  {clientAppointments.length === 0 ? (
                    <Text color="gray.500" fontStyle="italic">No appointments yet.</Text>
                  ) : (
                    clientAppointments.map((a) => (
                      <Box key={a.id} p={3} border="1px solid #E2E8F0" borderRadius="md">
                        <Text fontWeight="medium">
                          {a.date ? new Date(a.date).toLocaleString() : "Appointment"}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {a.notes || "—"}
                        </Text>
                      </Box>
                    ))
                  )}
                </VStack>
              )}
            </Box>

            {/* RIGHT — appointments panel */}
            <Box w={{ base: "100%", xl: "320px" }} bg="white" borderRadius="lg" p={6} boxShadow="sm">
              <Heading size="sm" mb={3}>Next appointment</Heading>
              {clientAppointments.filter((a) => new Date(a.date) > new Date())[0] ? (
                <AppointmentCard appt={clientAppointments.filter((a) => new Date(a.date) > new Date())[0]} />
              ) : (
                <Text fontSize="sm" color="gray.500">No upcoming appointments.</Text>
              )}

              <Button mt={3} size="sm" variant="outline" w="100%">
                Book a new appointment
              </Button>

              <Divider my={4} />
              <Heading size="sm" mb={3}>Previous appointments</Heading>
              <VStack align="stretch" spacing={3}>
                {clientAppointments.filter((a) => new Date(a.date) <= new Date()).slice(0, 5).map((a) => (
                  <AppointmentCard key={a.id} appt={a} compact />
                ))}
              </VStack>
            </Box>
          </HStack>
        </>
      )}

      <Box textAlign="center" color="gray.500" fontSize="sm">
        All client information is stored securely and visible only to authorized
        therapists.
      </Box>
    </Box>
  );
}

function NavButton({ label, count, active, onClick }) {
  return (
    <HStack
      justify="space-between"
      px={3}
      py={2}
      borderRadius="md"
      bg={active ? "blue.50" : "transparent"}
      color={active ? "blue.700" : "gray.700"}
      _hover={{ bg: "blue.50" }}
      cursor="pointer"
      onClick={onClick}
    >
      <Text fontWeight={active ? "semibold" : "normal"}>{label}</Text>
      {typeof count === "number" && <Badge colorScheme="blue">{count}</Badge>}
    </HStack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Box border="1px solid #E2E8F0" borderRadius="md" p={4} bg="white">
      <Text fontWeight="semibold" mb={3}>{title}</Text>
      {children}
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <HStack justify="space-between">
      <Text fontSize="sm" color="gray.600">{label}</Text>
      <Text fontSize="sm" color="gray.800">{value || "—"}</Text>
    </HStack>
  );
}

function AppointmentCard({ appt, compact }) {
  const dt = appt?.date ? new Date(appt.date) : null;
  const dateLabel = dt ? dt.toLocaleDateString() : "—";
  const timeLabel = dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <Box border="1px solid #E2E8F0" borderRadius="md" p={3} bg="gray.50">
      <Text fontWeight="medium">{dateLabel} {timeLabel}</Text>
      {!compact && (
        <Text fontSize="sm" color="gray.600">
          {appt?.notes || "Appointment"}
        </Text>
      )}
      {compact && (
        <Text fontSize="sm" color="gray.600">Go to appointment</Text>
      )}
    </Box>
  );
}
