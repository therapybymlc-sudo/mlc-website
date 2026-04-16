import AvailabilityClient from './AvailabilityClient';

export const metadata = {
  title: 'Manage Availability | MLC Health',
  description: 'Set and update your clinical hours and session availability for clients.',
};

export default function Page() {
  return <AvailabilityClient />;
}
