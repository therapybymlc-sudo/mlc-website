import dynamic from 'next/dynamic';

const DashboardLayoutClient = dynamic(() => import('./DashboardLayoutClient'), {
  ssr: false,
});

export const metadata = {
  title: {
    default: 'Dashboard | MLC Health',
    template: '%s | MLC Health'
  },
  description: 'Your personal space for healing and growth.',
}

export default function Layout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
