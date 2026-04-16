import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Select,
  useToast,
  Spinner,
  IconButton,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { DeleteIcon, DownloadIcon, AddIcon, RepeatIcon, ViewIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { apiGet, apiDelete, apiUpload } from "../../api.js";

export default function ClientFiles() {
  const [clients, setClients] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fileUpload, setFileUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const toast = useToast();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [c, f] = await Promise.all([
        apiGet("/clients/"),
        apiGet("/files/"),
      ]);
      setClients(Array.isArray(c) ? c : c.results || []);
      setFiles(Array.isArray(f) ? f : f.results || []);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error fetching files or clients",
        description: "Check backend or authentication",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpload = async () => {
    if (!fileUpload || !selectedClient) {
      toast({
        title: "Missing details",
        description: "Select a client and a file before uploading.",
        status: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("client", selectedClient);
    formData.append("file", fileUpload);

    try {
      await apiUpload("/files/", formData);
      toast({ title: "File uploaded successfully", status: "success" });
      setFileUpload(null);
      fetchAll();
    } catch (e) {
      console.error(e);
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await apiDelete(`/files/${id}/`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "File deleted", status: "info" });
    } catch (e) {
      console.error(e);
      toast({ title: "Delete failed", status: "error" });
    }
  };

  const fileLabel = (f) =>
    f.file_name || f.original_name || (f.file ? f.file.split("/").pop() : "Untitled");

  const fileUrl = (f) => f.file_url || f.file || "";

  const canPreviewImage = (f) =>
    /\.(png|jpe?g|gif|webp)$/i.test(fileLabel(f)) || /\.(png|jpe?g|gif|webp)$/i.test(fileUrl(f));

  const canPreviewPdf = (f) =>
    /\.pdf$/i.test(fileLabel(f)) || /\.pdf$/i.test(fileUrl(f));

  if (loading)
    return (
      <Box py={20} textAlign="center">
        <Spinner />
      </Box>
    );

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <Heading>Client Files</Heading>
        <HStack>
          <IconButton
            aria-label="refresh"
            icon={<RepeatIcon />}
            onClick={fetchAll}
            variant="outline"
            borderColor="#A9CBB7"
            _hover={{ bg: "#A9CBB7", color: "white" }}
          />
        </HStack>
      </HStack>

      {/* Upload Section */}
      <Box
        bg="white"
        p={8}
        borderRadius="2xl"
        boxShadow="lg"
        border="1px solid #E2E8F0"
        mb={10}
      >
        <Heading size="md" mb={4}>
          Upload New File
        </Heading>
        <VStack align="stretch" spacing={4}>
          <Select
            placeholder="Select Client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFileUpload(e.target.files[0])}
          />

          <Button
            leftIcon={<AddIcon />}
            bg="#A9CBB7"
            color="black"
            borderRadius="full"
            fontWeight="medium"
            _hover={{ bg: "#C9A960", color: "white" }}
            onClick={handleUpload}
          >
            Upload File
          </Button>
        </VStack>
      </Box>

      {/* File List */}
      <Box bg="white" p={8} borderRadius="2xl" boxShadow="lg">
        <Heading size="md" mb={4}>
          Uploaded Files
        </Heading>
        <Divider mb={4} />

        {files.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            No files uploaded yet.
          </Text>
        ) : (
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>File Name</Th>
                <Th>Client</Th>
                <Th>Uploaded On</Th>
                <Th>Type</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {files.map((f) => (
                <Tr key={f.id}>
                  <Td>{fileLabel(f)}</Td>
                  <Td>{f.client_name || f.client || "—"}</Td>
                  <Td>
                    {f.uploaded_at
                      ? new Date(f.uploaded_at).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    <Badge colorScheme="green">
                      {f.file_type || (f.file ? f.file.split(".").pop().toUpperCase() : "FILE")}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Preview"
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewFile(f)}
                      />
                      <IconButton
                        aria-label="Download"
                        icon={<DownloadIcon />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        as="a"
                        href={f.file_url || f.file}
                        target="_blank"
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(f.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Preview Modal */}
      <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{previewFile ? fileLabel(previewFile) : "Preview"}</ModalHeader>
          <ModalBody>
            {previewFile && (canPreviewPdf(previewFile) || canPreviewImage(previewFile)) ? (
              canPreviewPdf(previewFile) ? (
                <Box as="iframe" src={fileUrl(previewFile)} w="100%" h="70vh" />
              ) : (
                <Box as="img" src={fileUrl(previewFile)} maxW="100%" maxH="70vh" />
              )
            ) : (
              <Text color="gray.600">
                Preview not available for this file type. Use Download instead.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setPreviewFile(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
