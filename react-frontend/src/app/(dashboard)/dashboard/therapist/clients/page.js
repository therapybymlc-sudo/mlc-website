import ClientsClient from './ClientsClient';

export const metadata = {
  title: 'Client Caseload | MLC Health',
  description: 'Manage your clinical caseload and access client records securely.',
};

export default function Page() {
  return <ClientsClient />;
}
