import AdminClient from "./AdminClient";

export const metadata = {
  title: 'Admin Dashboard | MLC Health',
  description: 'Control center for therapist directory and website content management.',
  robots: 'noindex,nofollow',
}

export default function AdminPage() {
  return <AdminClient />;
}
