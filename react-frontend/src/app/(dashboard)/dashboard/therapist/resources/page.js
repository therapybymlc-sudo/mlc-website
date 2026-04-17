import TherapistResourcesClient from "./ResourcesClient";

export const metadata = {
  title: 'Clinical Resources | Therapist Dashboard | MLC Health',
  description: 'Access organizational and therapeutic resources.',
}

export default function TherapistResourcesPage() {
  return <TherapistResourcesClient />;
}
