import dynamic from 'next/dynamic';

const SafetyClient = dynamic(() => import('./SafetyClient'), {});

export const metadata = {
  title: 'Safety Plan | MLC Health',
  description: 'Your proactive guide to staying grounded and safe during difficult moments.',
};

export default function Page() {
  return <SafetyClient />;
}
