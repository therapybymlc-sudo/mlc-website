import { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Text,
  Textarea,
  VStack,
  Switch,
} from "@chakra-ui/react";
import { resourcesApi } from "../../../api/resources";
import { apiGet } from "../../../api.js";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

const RESOURCE_TYPES = [
  { value: "file", label: "File" },
  { value: "link", label: "Link" },
  { value: "text", label: "Text" },
];

export default function TherapistResources() {
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    resource_type: "file",
    url: "",
    text_content: "",
    file: null,
    is_active: true,
  });

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const [resourceData, clientData] = await Promise.all([
        resourcesApi.listResources(),
        apiGet("clients/"),
      ]);
      setResources(Array.isArray(resourceData) ? resourceData : []);
      const list = Array.isArray(clientData) ? clientData : clientData?.results || [];
      setClients(list);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load resources."));
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (clientId) => {
    if (!clientId) {
      setAssignments([]);
      return;
    }
    try {
      const data = await resourcesApi.listAssignments(clientId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load assignments."));
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    loadAssignments(selectedClientId);
  }, [selectedClientId]);

  const resetForm = () => {
    setEditingResource(null);
    setFormState({
      title: "",
      description: "",
      resource_type: "file",
      url: "",
      text_content: "",
      file: null,
      is_active: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: formState.title,
        description: formState.description,
        resource_type: formState.resource_type,
        url: formState.resource_type === "link" ? formState.url : undefined,
        text_content: formState.resource_type === "text" ? formState.text_content : undefined,
        file: formState.resource_type === "file" ? formState.file : undefined,
        is_active: formState.is_active,
      };

      if (editingResource) {
        await resourcesApi.updateResource(editingResource.id, payload);
      } else {
        await resourcesApi.createResource(payload);
      }
      await loadResources();
      resetForm();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to save resource."));
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormState({
      title: resource.title || "",
      description: resource.description || "",
      resource_type: resource.resource_type || "file",
      url: resource.url || "",
      text_content: resource.text_content || "",
      file: null,
      is_active: resource.is_active,
    });
  };

  const handleDeactivate = async (resourceId) => {
    try {
      await resourcesApi.deactivateResource(resourceId);
      await loadResources();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to deactivate resource."));
    }
  };

  const handleAssign = async (resourceId) => {
    if (!selectedClientId) return;
    try {
      await resourcesApi.assignResource({
        resource: resourceId,
        assigned_to: Number(selectedClientId),
        therapist_note: assignmentNote || undefined,
      });
      await loadAssignments(selectedClientId);
      setAssignmentNote("");
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to assign resource."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading resources…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadResources} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Resources"
        subtitle="Create reusable resources and assign them to clients."
      />

      <ScheduleSectionCard
        title={editingResource ? "Edit resource" : "Create a new resource"}
        subtitle="Resources can be files, links, or text notes."
      >
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Title</FormLabel>
              <Input
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Description</FormLabel>
              <Textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Resource type</FormLabel>
              <Select
                value={formState.resource_type}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, resource_type: event.target.value }))
                }
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            {formState.resource_type === "link" ? (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Resource URL</FormLabel>
                <Input
                  value={formState.url}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, url: event.target.value }))
                  }
                  placeholder="https://"
                />
              </FormControl>
            ) : null}
            {formState.resource_type === "text" ? (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Text content</FormLabel>
                <Textarea
                  value={formState.text_content}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, text_content: event.target.value }))
                  }
                />
              </FormControl>
            ) : null}
            {formState.resource_type === "file" ? (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Upload file</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      file: event.target.files?.[0] || null,
                    }))
                  }
                />
              </FormControl>
            ) : null}
            <HStack justify="space-between">
              <HStack>
                <Switch
                  isChecked={formState.is_active}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      is_active: event.target.checked,
                    }))
                  }
                />
                <Text fontSize="sm">Active</Text>
              </HStack>
              <ScheduleActionBar>
                <Button colorScheme="teal" borderRadius="full" type="submit">
                  {editingResource ? "Save changes" : "Create resource"}
                </Button>
                {editingResource ? (
                  <Button variant="ghost" borderRadius="full" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </ScheduleActionBar>
            </HStack>
          </VStack>
        </form>
      </ScheduleSectionCard>

      <ScheduleSectionCard title="My resources" subtitle="Manage what you’ve created.">
        {resources.length === 0 ? (
          <ScheduleEmptyState
            title="No resources yet"
            description="Create your first resource to share with clients."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {resources.map((resource) => (
              <VStack key={resource.id} align="stretch" spacing={2}>
                <HStack justify="space-between" align="flex-start" flexWrap="wrap">
                  <VStack align="start" spacing={1} flex={1} minW="200px">
                    <Text fontWeight="semibold">{resource.title}</Text>
                    {resource.description ? (
                      <Text fontSize="sm" color="gray.600">
                        {resource.description}
                      </Text>
                    ) : null}
                  </VStack>
                  <ScheduleStatusBadge
                    status={resource.is_active ? "assigned" : "blocked"}
                    label={resource.is_active ? "Active" : "Inactive"}
                  />
                </HStack>
                <ScheduleActionBar>
                  <Button size="sm" variant="outline" borderRadius="full" onClick={() => handleEdit(resource)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    onClick={() => handleDeactivate(resource.id)}
                  >
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    borderRadius="full"
                    isDisabled={!selectedClientId}
                    onClick={() => handleAssign(resource.id)}
                  >
                    Assign to client
                  </Button>
                </ScheduleActionBar>
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>

      <ScheduleSectionCard
        title="Assignments"
        subtitle="See which resources are shared with a specific client."
      >
        <VStack align="stretch" spacing={3}>
          <FormControl>
            <FormLabel fontSize="sm">Select client</FormLabel>
            <Select
              placeholder="Select client"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || client.preferred_first_name || client.email}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Therapist note (optional)</FormLabel>
            <Textarea
              value={assignmentNote}
              onChange={(event) => setAssignmentNote(event.target.value)}
              placeholder="Add a note for this client..."
            />
          </FormControl>
          {selectedClientId && assignments.length === 0 ? (
            <ScheduleEmptyState
              title="No resources assigned"
              description="Assign a resource above to start sharing."
            />
          ) : null}
          {assignments.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {assignments.map((assignment) => (
                <HStack key={assignment.id} justify="space-between" align="flex-start">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">{assignment.resource_title}</Text>
                    {assignment.therapist_note ? (
                      <Text fontSize="xs" color="gray.500">
                        Note: {assignment.therapist_note}
                      </Text>
                    ) : null}
                  </VStack>
                  <ScheduleStatusBadge status={assignment.status} label={assignment.status_label} />
                </HStack>
              ))}
            </VStack>
          ) : null}
        </VStack>
      </ScheduleSectionCard>
    </VStack>
  );
}
