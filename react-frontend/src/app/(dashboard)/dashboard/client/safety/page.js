'use client'

import dynamic from 'next/dynamic';
const SafetyClient = dynamic(() => import('./SafetyClient'), { ssr: false });

export default function Page() {
  return <SafetyClient />;
}
