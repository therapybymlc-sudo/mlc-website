'use client'

import dynamic from 'next/dynamic';
const JournalClient = dynamic(() => import('./JournalClient'), { ssr: false });

export default function Page() {
  return <JournalClient />;
}
