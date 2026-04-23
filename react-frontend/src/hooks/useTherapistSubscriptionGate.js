'use client';

import { useMemo } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export function useTherapistSubscriptionGate() {
  const { isAdmin, roles = [], therapistProfile, isTherapistPremium } = useAuth();
  const disclosure = useDisclosure();

  const hasBasicAccess = useMemo(() => {
    if (isAdmin) return true;
    if (isTherapistPremium) return true;
    if (roles.includes('therapist_basic')) return true;
    if (therapistProfile?.is_basic_subscribed === true) return true;
    if (therapistProfile?.subscription_status === 'active') return true;
    return false;
  }, [isAdmin, isTherapistPremium, roles, therapistProfile]);

  const requireBasicAccess = (onAllowed) => {
    if (hasBasicAccess) {
      if (typeof onAllowed === 'function') onAllowed();
      return true;
    }
    disclosure.onOpen();
    return false;
  };

  return {
    hasBasicAccess,
    requireBasicAccess,
    gateModal: disclosure,
  };
}

