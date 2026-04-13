import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { schedulingApi } from "../../../api/scheduling";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleStatusBadge from "../../../components/scheduling/ScheduleStatusBadge";
import ScheduleDateTimeCard from "../../../components/scheduling/ScheduleDateTimeCard";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toISOFromLocal = (value) => {
  if (!value) return "";
  return new Date(value).toISOString();
};

export default function TherapistAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingSlot, setEditingSlot] = useState(null);
  const [formState, setFormState] = useState({
    start_time: "",
    end_time: "",
    visible_to_clients: true,
  });

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listAvailabilitySlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load availability slots."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const filteredSlots = useMemo(() => {
    if (statusFilter === "all") return slots;
    return slots.filter((slot) => slot.status === statusFilter);
  }, [slots, statusFilter]);

  const resetForm = () => {
    setEditingSlot(null);
    setFormState({ start_time: "", end_time: "", visible_to_clients: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        start_time: toISOFromLocal(formState.start_time),
        end_time: toISOFromLocal(formState.end_time),
        visible_to_clients: formState.visible_to_clients,
      };

      if (editingSlot) {
        await schedulingApi.updateAvailabilitySlot(editingSlot.id, payload);
      } else {
        await schedulingApi.createAvailabilitySlot(payload);
      }
      await loadSlots();
      resetForm();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to save availability slot."));
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormState({
      start_time: toLocalInputValue(slot.start_time),
      end_time: toLocalInputValue(slot.end_time),
      visible_to_clients: slot.visible_to_clients,
    });
  };

  const handleDelete = async (slotId) => {
    try {
      await schedulingApi.deleteAvailabilitySlot(slotId);
      await loadSlots();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to delete slot."));
    }
  };

  const handleToggleBlock = async (slot) => {
    try {
      if (slot.status === "blocked") {
        await schedulingApi.unblockAvailabilitySlot(slot.id);
      } else {
        await schedulingApi.blockAvailabilitySlot(slot.id);
      }
      await loadSlots();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to update slot."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading availability…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadSlots} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Availability"
        subtitle="Add and manage your future slots in a simple list."
      />

      <ScheduleSectionCard
        title={editingSlot ? "Edit slot" : "Add a new slot"}
        subtitle="Keep only the windows you’re open to receive requests."
      >
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Start time</FormLabel>
              <Input
                type="datetime-local"
                value={formState.start_time}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    start_time: event.target.value,
                  }))
                }
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm">End time</FormLabel>
              <Input
                type="datetime-local"
                value={formState.end_time}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    end_time: event.target.value,
                  }))
                }
              />
            </FormControl>
            <Checkbox
              isChecked={formState.visible_to_clients}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  visible_to_clients: event.target.checked,
                }))
              }
            >
              Visible to clients
            </Checkbox>
            <ScheduleActionBar>
              <Button
                type="submit"
                colorScheme="teal"
                borderRadius="full"
              >
                {editingSlot ? "Save changes" : "Create slot"}
              </Button>
              {editingSlot ? (
                <Button variant="ghost" borderRadius="full" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </ScheduleActionBar>
          </VStack>
        </form>
      </ScheduleSectionCard>

      <ScheduleSectionCard
        title="Your slots"
        subtitle="Filter and manage upcoming availability."
        rightSlot={
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            size="sm"
            borderRadius="full"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="held">Held</option>
            <option value="blocked">Blocked</option>
            <option value="booked">Booked</option>
            <option value="expired">Expired</option>
          </Select>
        }
      >
        {filteredSlots.length === 0 ? (
          <ScheduleEmptyState
            title="No slots yet"
            description="Create availability so clients can request a time."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredSlots.map((slot) => (
              <VStack key={slot.id} align="stretch" spacing={3}>
                <ScheduleDateTimeCard
                  title={slot.therapist_display_name || "Availability"}
                  start={slot.start_time}
                  end={slot.end_time}
                  rightSlot={<ScheduleStatusBadge status={slot.status} label={slot.status_label} />}
                  description={slot.visible_to_clients ? "Visible to clients" : "Hidden from clients"}
                />
                <HStack spacing={2} flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    onClick={() => handleEdit(slot)}
                    isDisabled={slot.status === "booked"}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    onClick={() => handleToggleBlock(slot)}
                    isDisabled={slot.status === "booked"}
                  >
                    {slot.status === "blocked" ? "Unblock" : "Block"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    colorScheme="red"
                    onClick={() => handleDelete(slot.id)}
                    isDisabled={slot.status === "booked"}
                  >
                    Delete
                  </Button>
                </HStack>
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
