import { useEffect, useState } from "react";
import { useParams, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Box, Flex, Heading, Text, VStack, HStack, Divider, Spinner, Badge, Button, Link,
} from "@chakra-ui/react";
import { apiGet } from "../../api";

export default function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [data, n, f] = await Promise.all([
          apiGet(`/clients/${id}/`),
          apiGet(`/notes/?client=${id}`),
          apiGet(`/files/?client=${id}`),
        ]);
        if (mounted) {
          setClient(data);
          const nList = Array.isArray(n) ? n : n.results || [];
          const fList = Array.isArray(f) ? f : f.results || [];
          setNotes(
            [...nList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          );
          setFiles(
            [...fList].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
          );
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner />
      </Flex>
    );
  }

  if (!client) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Text>Client not found.</Text>
      </Flex>
    );
  }

  const fileLabel = (f) =>
    f.file_name || f.original_name || (f.file ? f.file.split("/").pop() : "Untitled");
  const fileUrl = (f) => f.file_url || f.file || "";

  return (
    <Flex gap={6} px={{ base: 4, md: 8 }} py={8} direction={{ base: "column", lg: "row" }}>
      {/* Sidebar */}
      <Box w={{ base: "100%", lg: "280px" }} flexShrink={0}>
        <Box bg="white" borderRadius="lg" p={5} boxShadow="sm">
          <Heading size="md" fontFamily="Playfair Display">{client.name}</Heading>
          <VStack align="start" spacing={1} mt={2}>
            <Text fontSize="sm" color="gray.600">{client.email}</Text>
            {client.therapist?.name && (
              <Badge colorScheme="green" mt={1}>
                Therapist: {client.therapist.name}
              </Badge>
            )}
          </VStack>

          <Divider my={4} />

          <VStack align="stretch" spacing={2}>
            <NavItem to="info" current={location.pathname.endsWith("/info")}>Client Details</NavItem>
            <NavItem to="notes" current={location.pathname.endsWith("/notes")}>Notes</NavItem>
            <NavItem to="files" current={location.pathname.endsWith("/files")}>Files / Documents</NavItem>
            <NavItem to="appointments" current={location.pathname.endsWith("/appointments")}>Appointments</NavItem>
          </VStack>
        </Box>
      </Box>

      {/* Main content */}
      <Box flex="1" bg="white" borderRadius="lg" p={{ base: 4, md: 6 }} boxShadow="sm">
        <Outlet context={{ client }} />
      </Box>

      {/* Right panel */}
      <Box w={{ base: "100%", lg: "320px" }} flexShrink={0}>
        <Box bg="white" borderRadius="lg" p={5} boxShadow="sm">
          <Heading size="sm" mb={3}>Client Snapshot</Heading>

          <Text fontSize="sm" color="gray.600" mb={2}>Recent Notes</Text>
          <VStack align="stretch" spacing={2} mb={4}>
            {notes.length === 0 ? (
              <Text fontSize="sm" color="gray.500">No notes yet.</Text>
            ) : (
              notes.slice(0, 6).map((n) => (
                <Box key={n.id} p={2} borderRadius="md" bg="gray.50">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      {n.template_name || "Note"}
                    </Text>
                    <Badge colorScheme={n.status === "final" ? "green" : "yellow"}>{n.status}</Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.600">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                  </Text>
                </Box>
              ))
            )}
          </VStack>

          <Text fontSize="sm" color="gray.600" mb={2}>Files</Text>
          <VStack align="stretch" spacing={2} mb={4}>
            {files.length === 0 ? (
              <Text fontSize="sm" color="gray.500">No files uploaded.</Text>
            ) : (
              files.slice(0, 6).map((f) => (
                <HStack key={f.id} justify="space-between">
                  <Text fontSize="sm" noOfLines={1}>{fileLabel(f)}</Text>
                  {fileUrl(f) && (
                    <Link href={fileUrl(f)} target="_blank">
                      <Button size="xs" variant="outline">View</Button>
                    </Link>
                  )}
                </HStack>
              ))
            )}
          </VStack>

          <Divider my={3} />
          <Text fontSize="xs" color="gray.500">
            Notes and files are ordered by most recent save/upload.
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}

function NavItem({ to, children, current }) {
  return (
    <NavLink to={to}>
      <Box
        px={3}
        py={2}
        borderRadius="md"
        bg={current ? "green.50" : "transparent"}
        _hover={{ bg: "green.50" }}
        transition="all .15s ease"
      >
        {children}
      </Box>
    </NavLink>
  );
}
