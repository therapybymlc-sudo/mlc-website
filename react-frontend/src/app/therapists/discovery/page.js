import dynamic from 'next/dynamic'

const DiscoveryBridgeClient = dynamic(() => import('./DiscoveryBridge'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading...</p>
    </div>
  ),
})

export const metadata = {
  title: 'Find Your Therapist | MLC Health & Wellness Centre',
  description: 'Tell us about your needs and our clinical team will reach out with a personalized therapist recommendation.',
}

export default function DiscoveryPage() {
  return <DiscoveryBridgeClient />
}
