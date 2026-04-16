import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata = {
  title: {
    default: 'Dashboard | MLC Health',
    template: '%s | Dashboard | MLC Health'
  },
  description: 'Manage your clinical workspace and therapeutic journey with MLC Health.',
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
