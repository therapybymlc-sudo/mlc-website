import TherapistAppointmentsClient from "./AppointmentsClient";

export const metadata = {
  title: 'My Appointments | Therapist Dashboard | MLC Health',
  description: 'Manage clinical appointments and session history.',
}

export default function TherapistAppointmentsPage() {
  return <TherapistAppointmentsClient />;
}
