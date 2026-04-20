'use client'

import dynamic from 'next/dynamic'

/**
 * DiscoveryBridge handles the dynamic loading of the DiscoveryClient with SSR disabled.
 * This prevents Server vs Client component conflicts (Hydration Error #418) 
 * during the build process and initial page load.
 */
const DiscoveryClient = dynamic(() => import('./DiscoveryClient'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#FAFAFA',
      fontFamily: 'serif'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #56756D',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p style={{ color: '#666' }}>Finding your recommended specialists...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
});

export default function DiscoveryBridge() {
  return <DiscoveryClient />;
}
