import { Suspense } from 'react';
import TherapistSubscriptionClient from './TherapistSubscriptionClient';

export const metadata = {
  title: 'MLC Pro Subscription',
  description: 'Activate MLC Pro — live monthly and annual plans for therapist platform access.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TherapistSubscriptionClient />
    </Suspense>
  );
}

