import dynamic from 'next/dynamic';
const AppointmentsClient = dynamic(() => import('./AppointmentsClient'), { ssr: false });

export const metadata = {
  title: 'My Appointments | MLC Health',
  description: 'View your session history, manage upcoming appointments, and keep track of your therapeutic journey.',
};

export default function Page() {
  return <AppointmentsClient />;
}
