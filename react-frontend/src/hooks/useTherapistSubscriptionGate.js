'use client';

import { useMemo } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { isPremiumComingSoon } from '../utils/subscriptionPlans';

export function useTherapistSubscriptionGate() {
  const { isAdmin, roles = [], therapistProfile, isTherapistPremium } = useAuth();
  const basicGate = useDisclosure();
  const premiumGate = useDisclosure();

  const hasPremiumAccess = useMemo(() => {
    if (isAdmin) return true;
    if (isTherapistPremium) return true;
    if (roles.includes('premium') || roles.includes('premium_therapist')) return true;
    if (therapistProfile?.is_premium === true) return true;
    return false;
  }, [isAdmin, isTherapistPremium, roles, therapistProfile]);

  const hasBasicAccess = useMemo(() => {
    if (hasPremiumAccess) return true;
    if (roles.includes('therapist_basic')) return true;
    if (therapistProfile?.is_basic_subscribed === true) return true;
    if (therapistProfile?.subscription_status === 'active') return true;
    return false;
  }, [hasPremiumAccess, roles, therapistProfile]);

  const requireBasicAccess = (onAllowed) => {
    if (hasBasicAccess) {
      if (typeof onAllowed === 'function') onAllowed();
      return true;
    }
    basicGate.onOpen();
    return false;
  };

  const requirePremiumAccess = (onAllowed) => {
    if (hasPremiumAccess) {
      if (typeof onAllowed === 'function') onAllowed();
      return true;
    }
    if (isPremiumComingSoon()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/therapist/premium#premium-pre-release';
      }
      return false;
    }
    premiumGate.onOpen();
    return false;
  };

  return {
    hasBasicAccess,
    hasPremiumAccess,
    requireBasicAccess,
    requirePremiumAccess,
    gateModal: basicGate,
    premiumGateModal: premiumGate,
  };
}
