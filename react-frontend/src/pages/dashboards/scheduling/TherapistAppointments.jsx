import { useEffect, useMemo, useState } from "react";
import { Button, Text, VStack } from "@chakra-ui/react";
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
import { isUpcomingAppointment, isPastAppointment } from "../../../utils/scheduling";

export default function TherapistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listTherapistAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load appointments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const upcomingAppointments = useMemo(
    () => appointments.filter((appt) => isUpcomingAppointment(appt)),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments.filter(
        (appt) => !isUpcomingAppointment(appt) && (isPastAppointment(appt) || appt.status)
      ),
    [appointments]
  );

  const handleCancel = async (appointmentId) => {
    try {
      await schedulingApi.cancelTherapistAppointment(appointmentId, "");
      await loadAppointments();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to cancel appointment."));
    }
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading appointments…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadAppointments} />;
  }

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Appointments"
        subtitle="See upcoming sessions and your appointment history."
      />

      <ScheduleSectionCard title="Upcoming appointments" subtitle="Scheduled and confirmed sessions ahead.">
        {upcomingAppointments.length === 0 ? (
          <ScheduleEmptyState
            title="No upcoming appointments"
            description="Confirmed sessions will appear here."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {upcomingAppointments.map((appt) => (
              <VStack key={appt.id} align="stretch" spacing={3}>
                <ScheduleDateTimeCard
                  title={appt.client_display_name || `Client #${appt.client}`}
                  start={appt.start_time}
                  end={appt.end_time}
                  rightSlot={<ScheduleStatusBadge status={appt.status} label={appt.status_label} />}
                />
                <ScheduleActionBar>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    borderRadius="full"
                    onClick={() => handleCancel(appt.id)}
                  >
                    Cancel appointment
                  </Button>
                </ScheduleActionBar>
              </VStack>
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>

      <ScheduleSectionCard title="Past appointments" subtitle="Completed, cancelled, or past sessions.">
        {pastAppointments.length === 0 ? (
          <ScheduleEmptyState
            title="No past appointments"
            description="Past sessions will be listed here for reference."
          />
        ) : (
          <VStack spacing={4} align="stretch">
            {pastAppointments.map((appt) => (
              <ScheduleDateTimeCard
                key={appt.id}
                title={appt.client_display_name || `Client #${appt.client}`}
                start={appt.start_time}
                end={appt.end_time}
                rightSlot={<ScheduleStatusBadge status={appt.status} label={appt.status_label} />}
                description={appt.cancellation_reason || ""}
              />
            ))}
          </VStack>
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
