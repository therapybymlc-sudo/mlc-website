import DashboardLayoutClient from './DashboardLayoutClient';
import ClientOnly from '../../../components/ClientOnly';

export const metadata = {
  title: {
    default: 'Dashboard | MLC Health',
    template: '%s | MLC Health'
  },
  description: 'Your personal space for healing and growth.',
}

export default function Layout({ children }) {
  return (
    <ClientOnly>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </ClientOnly>
  );
}
