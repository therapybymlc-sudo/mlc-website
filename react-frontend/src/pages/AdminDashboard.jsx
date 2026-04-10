import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Switch,
  Text,
  Textarea,
  Image,
  VStack,
  HStack,
  Divider,
  useToast,
  FormHelperText,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

const emptyMember = {
  name: "",
  title: "",
  email: "",
  photo_url: "",
  specialties: "",
  bio: "",
  sort_order: 0,
  is_active: true,
};

const emptyService = {
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  cta_label: "",
  cta_link: "",
  sort_order: 0,
  is_active: true,
};

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const applyCommand = (command, arg = null) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <VStack align="stretch" spacing={2}>
      <HStack spacing={2} wrap="wrap">
        <Button size="sm" variant="outline" onClick={() => applyCommand("bold")}
          >Bold</Button>
        <Button size="sm" variant="outline" onClick={() => applyCommand("italic")}
          >Italic</Button>
        <Button size="sm" variant="outline" onClick={() => applyCommand("underline")}
          >Underline</Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("insertUnorderedList")}
        >
          Bullets
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("insertOrderedList")}
        >
          Numbers
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => applyCommand("removeFormat")}
        >
          Clear
        </Button>
      </HStack>
      <Box
        border="1px solid #E2E8F0"
        borderRadius="lg"
        px={4}
        py={3}
        bg="white"
        minH="140px"
        _focusWithin={{ borderColor: "#5FA093", boxShadow: "0 0 0 1px #5FA093" }}
      >
        <Box
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          minH="100px"
          fontSize="sm"
          color="#2E2E2E"
          sx={{
            "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
            li: { marginBottom: "0.25rem" },
          }}
        />
      </Box>
      <FormHelperText color="gray.500">
        Basic formatting supported (bold, italic, underline, bullets).
      </FormHelperText>
    </VStack>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, login, loading } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceDraft, setServiceDraft] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await apiGet("team-members/");
      const data = res.results ?? res;
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Failed to load team members" });
    }
  };

  const fetchServices = async () => {
    try {
      const res = await apiGet("services/");
      const data = res.results ?? res;
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Failed to load services" });
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchMembers();
      fetchServices();
    }
  }, [isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <Box py={20} textAlign="center">
        <Text>Loading…</Text>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box py={20} textAlign="center">
        <Heading size="lg" mb={4}>
          Admin login required
        </Heading>
        <Text mb={6}>Sign in with your admin account to edit the website.</Text>
        <Button colorScheme="teal" onClick={login}>
          Sign in as admin
        </Button>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box py={20} textAlign="center">
        <Heading size="lg" mb={4}>
          Access denied
        </Heading>
        <Text>You’re signed in but don’t have admin privileges.</Text>
      </Box>
    );
  }

  return (
    <Box bg="#F6F6F4" py={12}>
      <Container maxW="6xl">
        <Heading mb={8} fontFamily="'Playfair Display', serif">
          Admin Dashboard
        </Heading>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={4}>
            {editingId ? "Edit team member" : "Add team member"}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Full name</FormLabel>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Title / Role</FormLabel>
              <Input
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={draft.email}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Photo URL</FormLabel>
              <Input
                value={draft.photo_url}
                onChange={(e) => setDraft((p) => ({ ...p, photo_url: e.target.value }))}
              />
              <FormHelperText color="gray.500">
                Use a direct image URL (ends with .jpg/.png). Share the file
                publicly before pasting the link.
              </FormHelperText>
              {draft.photo_url ? (
                <Box mt={3} borderRadius="lg" overflow="hidden" border="1px solid #E2E8F0">
                  <Image
                    src={draft.photo_url}
                    alt="Team member preview"
                    maxH="180px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="https://mlchealth.in/founder_portrait_new.jpg"
                  />
                </Box>
              ) : null}
            </FormControl>
            <FormControl>
              <FormLabel>Specialties (comma‑separated)</FormLabel>
              <Input
                value={draft.specialties}
                onChange={(e) => setDraft((p) => ({ ...p, specialties: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Sort order</FormLabel>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Bio</FormLabel>
              <RichTextEditor
                value={draft.bio}
                onChange={(value) => setDraft((p) => ({ ...p, bio: value }))}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={draft.is_active}
                onChange={(e) => setDraft((p) => ({ ...p, is_active: e.target.checked }))}
              />
            </FormControl>
          </SimpleGrid>
          <HStack mt={6} spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                if (!draft.name.trim()) {
                  toast({ status: "warning", title: "Name is required" });
                  return;
                }
                try {
                  if (editingId) {
                    await apiPut(`team-members/${editingId}/`, draft);
                  } else {
                    await apiPost("team-members/", draft);
                  }
                  setDraft(emptyMember);
                  setEditingId(null);
                  await fetchMembers();
                  toast({ status: "success", title: "Saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              {editingId ? "Update member" : "Add member"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setDraft(emptyMember);
                }}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Team members
          </Heading>
          {members.length === 0 ? (
            <Text color="gray.500">No team members added yet.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {members.map((member) => (
                <Box key={member.id} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="sm">{member.name}</Heading>
                      {member.title && <Text color="gray.600">{member.title}</Text>}
                      {member.email && <Text fontSize="sm">{member.email}</Text>}
                      {member.specialties && (
                        <Text fontSize="sm" color="gray.600">
                          {member.specialties}
                        </Text>
                      )}
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingId(member.id);
                          setDraft({
                            name: member.name || "",
                            title: member.title || "",
                            email: member.email || "",
                            photo_url: member.photo_url || "",
                            specialties: member.specialties || "",
                            bio: member.bio || "",
                            sort_order: member.sort_order || 0,
                            is_active: member.is_active ?? true,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={async () => {
                          if (!window.confirm("Delete this team member?")) return;
                          try {
                            await apiDelete(`team-members/${member.id}/`);
                            await fetchMembers();
                          } catch {
                            toast({ status: "error", title: "Delete failed" });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Divider my={12} />

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" mb={10}>
          <Heading size="md" mb={4}>
            {editingServiceId ? "Edit service" : "Add service"}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={serviceDraft.title}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, title: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Input
                value={serviceDraft.subtitle}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, subtitle: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                value={serviceDraft.image_url}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, image_url: e.target.value }))
                }
              />
              <FormHelperText color="gray.500">
                Use a direct image URL (ends with .jpg/.png).
              </FormHelperText>
              {serviceDraft.image_url ? (
                <Box mt={3} borderRadius="lg" overflow="hidden" border="1px solid #E2E8F0">
                  <Image
                    src={serviceDraft.image_url}
                    alt="Service preview"
                    maxH="180px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="https://mlchealth.in/service1_new.jpg"
                  />
                </Box>
              ) : null}
            </FormControl>
            <FormControl>
              <FormLabel>CTA label</FormLabel>
              <Input
                value={serviceDraft.cta_label}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, cta_label: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>CTA link</FormLabel>
              <Input
                value={serviceDraft.cta_link}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, cta_link: e.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Sort order</FormLabel>
              <Input
                type="number"
                value={serviceDraft.sort_order}
                onChange={(e) =>
                  setServiceDraft((p) => ({
                    ...p,
                    sort_order: Number(e.target.value) || 0,
                  }))
                }
              />
            </FormControl>
            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel>Description</FormLabel>
              <RichTextEditor
                value={serviceDraft.description}
                onChange={(value) =>
                  setServiceDraft((p) => ({ ...p, description: value }))
                }
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Active</FormLabel>
              <Switch
                isChecked={serviceDraft.is_active}
                onChange={(e) =>
                  setServiceDraft((p) => ({ ...p, is_active: e.target.checked }))
                }
              />
            </FormControl>
          </SimpleGrid>
          <HStack mt={6} spacing={3}>
            <Button
              colorScheme="teal"
              onClick={async () => {
                if (!serviceDraft.title.trim()) {
                  toast({ status: "warning", title: "Title is required" });
                  return;
                }
                try {
                  if (editingServiceId) {
                    await apiPut(`services/${editingServiceId}/`, serviceDraft);
                  } else {
                    await apiPost("services/", serviceDraft);
                  }
                  setServiceDraft(emptyService);
                  setEditingServiceId(null);
                  await fetchServices();
                  toast({ status: "success", title: "Saved" });
                } catch {
                  toast({ status: "error", title: "Save failed" });
                }
              }}
            >
              {editingServiceId ? "Update service" : "Add service"}
            </Button>
            {editingServiceId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingServiceId(null);
                  setServiceDraft(emptyService);
                }}
              >
                Cancel
              </Button>
            )}
          </HStack>
        </Box>

        <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
          <Heading size="md" mb={4}>
            Services
          </Heading>
          {services.length === 0 ? (
            <Text color="gray.500">No services added yet.</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              {services.map((service) => (
                <Box key={service.id} p={4} border="1px solid #E2E8F0" borderRadius="xl">
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Heading size="sm">{service.title}</Heading>
                      {service.subtitle && (
                        <Text color="#56756D" fontWeight="semibold" mb={1}>
                          {service.subtitle}
                        </Text>
                      )}
                      {service.cta_link && (
                        <Text fontSize="sm" color="gray.600">
                          {service.cta_label ? `${service.cta_label}: ` : ""}{service.cta_link}
                        </Text>
                      )}
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingServiceId(service.id);
                          setServiceDraft({
                            title: service.title || "",
                            subtitle: service.subtitle || "",
                            description: service.description || "",
                            image_url: service.image_url || "",
                            cta_label: service.cta_label || "",
                            cta_link: service.cta_link || "",
                            sort_order: service.sort_order || 0,
                            is_active: service.is_active ?? true,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        onClick={async () => {
                          if (!window.confirm("Delete this service?")) return;
                          try {
                            await apiDelete(`services/${service.id}/`);
                            await fetchServices();
                          } catch {
                            toast({ status: "error", title: "Delete failed" });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Divider my={10} />
        <Text color="gray.500">
          Next: Services + Pages editor (we can add after team).
        </Text>
      </Container>
    </Box>
  );
}
