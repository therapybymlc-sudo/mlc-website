import { Tag, TagLabel } from "@chakra-ui/react";

const STATUS_LABELS = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  cancelled_by_client: "Cancelled",
  cancelled_by_therapist: "Cancelled",
  expired: "Expired",
  scheduled: "Scheduled",
  completed: "Completed",
  no_show: "No show",
  rescheduled: "Rescheduled",
  open: "Open",
  held: "Held",
  blocked: "Blocked",
  booked: "Booked",
  assigned: "Assigned",
  viewed: "Viewed",
};

const STATUS_COLORS = {
  pending: "orange",
  confirmed: "green",
  declined: "red",
  cancelled: "red",
  cancelled_by_client: "red",
  cancelled_by_therapist: "red",
  expired: "gray",
  scheduled: "green",
  completed: "blue",
  no_show: "red",
  rescheduled: "purple",
  open: "green",
  held: "orange",
  blocked: "gray",
  booked: "purple",
  assigned: "blue",
  viewed: "teal",
};

export default function ScheduleStatusBadge({ status, label }) {
  if (!status && !label) return null;
  const normalized = status || "";
  const display = label || STATUS_LABELS[normalized] || normalized;
  const colorScheme = STATUS_COLORS[normalized] || "gray";
  return (
    <Tag colorScheme={colorScheme} borderRadius="full" size="sm">
      <TagLabel>{display}</TagLabel>
    </Tag>
  );
}
