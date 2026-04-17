import CheckinClient from './CheckinClient';

export const metadata = {
  title: 'Daily Check-in | MLC Health',
  description: 'Take a moment to reflect on your mood and energy today.',
};

export default function Page() {
  return <CheckinClient />;
}
