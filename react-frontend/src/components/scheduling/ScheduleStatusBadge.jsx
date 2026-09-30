import { Badge } from "@chakra-ui/react";

const STATUS_LABELS = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  cancelled_by_client: "Cancelled",
  cancelled_by_therapist: "Cancelled",
  expired: "Expired",
  payment_failed: "Payment Failed",
  payment_pending: "Payment Pending",
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

const STATUS_STYLES = {
  pending: { bg: "rgba(245, 158, 11, 0.08)", color: "#B45309", border: "rgba(245, 158, 11, 0.25)" },
  payment_pending: { bg: "rgba(245, 158, 11, 0.08)", color: "#B45309", border: "rgba(245, 158, 11, 0.25)" },
  payment_failed: { bg: "rgba(239, 68, 68, 0.08)", color: "#DC2626", border: "rgba(239, 68, 68, 0.25)" },
  confirmed: { bg: "rgba(16, 185, 129, 0.08)", color: "#065F46", border: "rgba(16, 185, 129, 0.25)" },
  scheduled: { bg: "rgba(16, 185, 129, 0.08)", color: "#065F46", border: "rgba(16, 185, 129, 0.25)" },
  completed: { bg: "rgba(16, 185, 129, 0.08)", color: "#065F46", border: "rgba(16, 185, 129, 0.25)" },
  viewed: { bg: "rgba(86, 117, 109, 0.08)", color: "#263A33", border: "rgba(86, 117, 109, 0.25)" },
  assigned: { bg: "rgba(59, 130, 246, 0.08)", color: "#1D4ED8", border: "rgba(59, 130, 246, 0.25)" },
  open: { bg: "rgba(16, 185, 129, 0.08)", color: "#065F46", border: "rgba(16, 185, 129, 0.25)" },
  held: { bg: "rgba(245, 158, 11, 0.08)", color: "#B45309", border: "rgba(245, 158, 11, 0.25)" },
  declined: { bg: "rgba(239, 68, 68, 0.08)", color: "#B91C1C", border: "rgba(239, 68, 68, 0.25)" },
  cancelled: { bg: "rgba(239, 68, 68, 0.08)", color: "#B91C1C", border: "rgba(239, 68, 68, 0.25)" },
  cancelled_by_client: { bg: "rgba(239, 68, 68, 0.08)", color: "#B91C1C", border: "rgba(239, 68, 68, 0.25)" },
  cancelled_by_therapist: { bg: "rgba(239, 68, 68, 0.08)", color: "#B91C1C", border: "rgba(239, 68, 68, 0.25)" },
};

export default function ScheduleStatusBadge({ status, label }) {
  if (!status && !label) return null;
  const normalized = status || "";
  const display = label || STATUS_LABELS[normalized] || normalized;
  const style = STATUS_STYLES[normalized] || {
    bg: "rgba(86, 117, 109, 0.08)",
    color: "#56756D",
    border: "rgba(86, 117, 109, 0.2)",
  };

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      border={`1px solid ${style.border}`}
      borderRadius="full"
      px={2.5}
      py={0.5}
      fontSize="11px"
      fontWeight="600"
      textTransform="capitalize"
    >
      {display}
    </Badge>
  );
}
