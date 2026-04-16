import ScheduleClient from "./ScheduleClient";

export const metadata = {
  title: 'Clinical Schedule | Therapist Dashboard',
  description: 'Manage your clinical appointments, availability, and session bookings securely.',
}

export default function TherapistSchedulePage() {
  return <ScheduleClient />;
}
