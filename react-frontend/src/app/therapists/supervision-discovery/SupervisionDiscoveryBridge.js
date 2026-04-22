'use client'

import dynamic from 'next/dynamic'

/**
 * SupervisionDiscoveryBridge handles the dynamic loading of the SupervisionDiscoveryClient with SSR disabled.
 * This prevents Server vs Client component conflicts (Hydration Error #418) 
 * during the build process and initial page load.
 */
const SupervisionDiscoveryClient = dynamic(() => import('./SupervisionDiscoveryClient'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#FDFBFA',
      fontFamily: 'serif'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1A365D', // Dark Blue for Clinical focus
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p style={{ color: '#1A365D', fontWeight: 'bold' }}>Aligning your clinical mastery path...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
});

export default function SupervisionDiscoveryBridge() {
  return <SupervisionDiscoveryClient />;
}
