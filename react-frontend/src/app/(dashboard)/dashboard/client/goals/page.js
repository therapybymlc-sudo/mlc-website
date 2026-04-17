import dynamic from 'next/dynamic';
const GoalsClient = dynamic(() => import('./GoalsClient'), { ssr: false });

export const metadata = {
  title: 'My Goals | MLC Health',
  description: 'Tiered intentions and therapeutic progress tracking.',
};

export default function Page() {
  return <GoalsClient />;
}
