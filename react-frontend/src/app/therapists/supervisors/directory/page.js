import dynamic from 'next/dynamic'

const DirectoryClient = dynamic(() => import('./DirectoryClient'), { ssr: false })

export const metadata = {
  title: 'Clinical Supervisors | MLC Collective',
  description: 'Connect with senior, board-approved clinical supervisors. Elevate your therapeutic practice with expert mentorship and professional stewardship.',
}

export default function SupervisorDirectoryPage() {
  return <DirectoryClient />
}
