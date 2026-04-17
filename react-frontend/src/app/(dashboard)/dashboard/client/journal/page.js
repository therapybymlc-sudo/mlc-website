import dynamic from 'next/dynamic';
const JournalClient = dynamic(() => import('./JournalClient'), { ssr: false });

export const metadata = {
  title: 'Private Journal | MLC Health',
  description: 'A secure and private space for your therapeutic reflections, clinical notes, and daily insights.',
};

export default function Page() {
  return <JournalClient />;
}
