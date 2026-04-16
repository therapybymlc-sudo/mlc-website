import ResourcesClient from './ResourcesClient';

export const metadata = {
  title: 'Clinical Resources | MLC Health',
  description: 'Access therapeutic tools, clinical guides, and shared resources for your practice.',
};

export default function Page() {
  return <ResourcesClient />;
}
