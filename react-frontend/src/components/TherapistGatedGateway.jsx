'use client';

import TherapistSubscriptionGateway from './TherapistSubscriptionGateway';
import { useTherapistRazorpayCheckout } from '../hooks/useTherapistRazorpayCheckout';
import { isPremiumComingSoon } from '../utils/subscriptionPlans';

/**
 * Subscription gateway modal wired to live Razorpay checkout for Basic plans only.
 * Premium is coming soon — waitlist link only.
 */
export default function TherapistGatedGateway(props) {
  const { startSubscription, loadingPlan } = useTherapistRazorpayCheckout();
  const premiumSoon = isPremiumComingSoon();

  return (
    <TherapistSubscriptionGateway
      {...props}
      onSelectPlan={startSubscription}
      onSelectPremium={premiumSoon ? undefined : startSubscription}
      loadingPlan={loadingPlan}
    />
  );
}
