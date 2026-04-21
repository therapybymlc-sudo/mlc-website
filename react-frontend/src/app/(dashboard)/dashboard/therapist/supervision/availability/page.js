import { Suspense } from 'react';
import SupervisionAvailabilityClient from './SupervisionAvailabilityClient';

export const metadata = {
  title: 'Supervision Availability | Stewardship | MLC',
  description: 'Manage your hybrid clinical and supervision calendar.',
};

export default function SupervisionAvailabilityPage() {
  return (
    <Suspense fallback={null}>
      <SupervisionAvailabilityClient />
    </Suspense>
  );
}
