'use client'

import dynamic from 'next/dynamic';
const AppointmentsClient = dynamic(() => import('./AppointmentsClient'), { ssr: false });

export default function Page() {
  return <AppointmentsClient />;
}
