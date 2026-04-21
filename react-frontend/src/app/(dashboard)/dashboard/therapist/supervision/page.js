import { Suspense } from 'react';
import SupervisionClient from './SupervisionClient';

export const metadata = {
  title: 'Supervision Suite | Professional Stewardship | MLC',
  description: 'Clinical supervision management and mentorship caseload.',
};

export default function SupervisionPage() {
  return (
    <Suspense fallback={null}>
      <SupervisionClient />
    </Suspense>
  );
}
