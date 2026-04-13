export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const formatDateRange = (start, end) => {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  if (Number.isNaN(startDate.getTime())) return start;
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const startTime = timeFormatter.format(startDate);
  const endTime = endDate && !Number.isNaN(endDate.getTime()) ? timeFormatter.format(endDate) : null;
  return endTime ? `${dateLabel} · ${startTime} – ${endTime}` : `${dateLabel} · ${startTime}`;
};

export const isFuture = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
};

export const isUpcomingAppointment = (appointment) => {
  if (!appointment?.start_time) return false;
  if (!isFuture(appointment.start_time)) return false;
  const status = appointment.status;
  return status === "scheduled" || status === "rescheduled";
};

export const isPastAppointment = (appointment) => {
  if (!appointment?.start_time) return false;
  const date = new Date(appointment.start_time);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() <= Date.now();
};
