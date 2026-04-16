import ScheduleClient from './ScheduleClient';

export const metadata = {
  title: 'My Schedule | MLC Health',
  description: 'View and manage your upcoming session appointments, clinical events, and client meetings.',
};

export default function Page() {
  return <ScheduleClient />;
}
