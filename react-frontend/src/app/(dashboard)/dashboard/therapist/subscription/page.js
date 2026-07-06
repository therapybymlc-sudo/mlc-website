import { Suspense } from 'react';
import TherapistSubscriptionClient from './TherapistSubscriptionClient';

export const metadata = {
  title: 'Therapist Subscription',
  description: 'Choose your MLC therapist subscription plan.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TherapistSubscriptionClient />
    </Suspense>
  );
}

