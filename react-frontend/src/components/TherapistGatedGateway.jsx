'use client';

import TherapistSubscriptionGateway from './TherapistSubscriptionGateway';
import { useTherapistRazorpayCheckout } from '../hooks/useTherapistRazorpayCheckout';

/**
 * Subscription gateway modal wired to live Razorpay checkout (or external payment links).
 * Use anywhere `useTherapistSubscriptionGate()` opens `gateModal`.
 */
export default function TherapistGatedGateway(props) {
  const { startSubscription, loadingPlan } = useTherapistRazorpayCheckout();

  return (
    <TherapistSubscriptionGateway
      {...props}
      onSelectPlan={startSubscription}
      onSelectPremium={startSubscription}
      loadingPlan={loadingPlan}
    />
  );
}
