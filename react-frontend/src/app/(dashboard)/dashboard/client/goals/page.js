'use client'

import dynamic from 'next/dynamic';
const GoalsClient = dynamic(() => import('./GoalsClient'), { ssr: false });

export default function Page() {
  return <GoalsClient />;
}
