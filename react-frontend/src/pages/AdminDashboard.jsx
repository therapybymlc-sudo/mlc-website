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
  VStack,
  HStack,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
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

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, login, loading } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await apiGet("team-members/");
      const data = res.results ?? res;
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ status: "error", title: "Failed to load team members" });
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchMembers();
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
              <Textarea
                rows={4}
                value={draft.bio}
                onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
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

        <Divider my={10} />
        <Text color="gray.500">
          Next: Services + Pages editor (we can add after team).
        </Text>
      </Container>
    </Box>
  );
}
