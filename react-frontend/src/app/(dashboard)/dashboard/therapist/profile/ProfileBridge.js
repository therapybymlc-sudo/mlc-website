'use client'
import dynamic from 'next/dynamic';

/**
 * The Bridge: A Client Component that safely handles the dynamic import 
 * with ssr: false. This satisfies Next.js build rules while preventing 
 * hydration errors.
 */
const ProfileClient = dynamic(() => import('./ProfileClient'), { 
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
      <p style={{ color: '#666' }}>Initializing Identity Hub...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
});

export default function ProfileBridge() {
  return <ProfileClient />;
}
