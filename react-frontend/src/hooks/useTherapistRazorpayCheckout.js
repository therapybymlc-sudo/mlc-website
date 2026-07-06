'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { apiPost } from '../api.js';
import { useAuth } from '../context/AuthContext';
import {
  getTherapistPlanUrl,
  isExternalPaymentLink,
  isPremiumComingSoon,
  normalizePlanType,
  THERAPIST_PLANS,
} from '../utils/subscriptionPlans';

function loadRazorpayScript() {
  if (typeof window === 'undefined' || window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function useTherapistRazorpayCheckout({ onActivated } = {}) {
  const toast = useToast();
  const { isAuthenticated, isTherapist } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState('');

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const startSubscription = useCallback(
    async (planTypeRaw) => {
      const planKey = normalizePlanType(planTypeRaw);
      if (!planKey) {
        toast({ title: 'Unknown plan selected.', status: 'warning' });
        return;
      }

      if (planKey === 'premium' && isPremiumComingSoon()) {
        toast({
          title: 'Premium is coming soon',
          description: 'Join the pre-release list on the Premium page for a major launch discount.',
          status: 'info',
          duration: 6000,
        });
        window.location.href = '/dashboard/therapist/premium#premium-pre-release';
        return;
      }

      const externalUrl = getTherapistPlanUrl(planKey);
      if (isExternalPaymentLink(externalUrl)) {
        window.location.href = externalUrl;
        return;
      }

      if (!isAuthenticated) {
        toast({ title: 'Please sign in to continue.', status: 'info' });
        window.location.href = `/login/therapist?redirect_url=${encodeURIComponent(
          `/dashboard/therapist/subscription?plan=${planKey}`
        )}`;
        return;
      }
      if (!isTherapist) {
        toast({ title: 'Therapist account required.', status: 'warning' });
        return;
      }

      try {
        await loadRazorpayScript();
      } catch {
        toast({ title: 'Payment system failed to load.', status: 'error' });
        return;
      }

      if (!window.Razorpay) {
        toast({ title: 'Payment system loading…', status: 'info' });
        return;
      }

      const checkoutPlanType = THERAPIST_PLANS[planKey]?.checkoutPlanType || planKey;

      try {
        setLoadingPlan(planKey);
        const payload = await apiPost('payments/razorpay/subscriptions/create', {
          plan_type: checkoutPlanType,
        });

        if (payload.short_url && isExternalPaymentLink(payload.short_url)) {
          window.location.href = payload.short_url;
          return;
        }

        const planLabel =
          planKey === 'premium'
            ? 'MLC Therapist Premium (Annual)'
            : planKey === 'annual'
            ? 'MLC Therapist Basic Plan (Annual)'
            : 'MLC Therapist Basic Plan (Monthly)';

        const options = {
          key: payload.key_id,
          subscription_id: payload.subscription_id,
          name: 'MLC Health',
          description: planLabel,
          image: 'https://www.mlchealth.in/logo.png',
          handler: async (response) => {
            try {
              await apiPost('payments/razorpay/subscriptions/verify', {
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast({
                title: planKey === 'premium' ? 'Premium activated!' : 'MLC Pro activated!',
                description:
                  planKey === 'premium'
                    ? 'Your Therapist OS Premium access is now active.'
                    : 'Your MLC Pro access is now active.',
                status: 'success',
                duration: 5000,
              });
              if (typeof onActivated === 'function') onActivated(planKey);
            } catch (error) {
              toast({
                title: 'Verification pending',
                description:
                  error?.response?.data?.detail ||
                  'Payment received but verification is pending. Please refresh in a moment.',
                status: 'warning',
                duration: 8000,
              });
            } finally {
              setLoadingPlan('');
            }
          },
          modal: {
            ondismiss: () => setLoadingPlan(''),
          },
          theme: { color: '#56756D' },
        };

        const checkout = new window.Razorpay(options);
        checkout.open();
      } catch (error) {
        toast({
          title: 'Unable to start subscription',
          description: error?.response?.data?.detail || 'Please try again.',
          status: 'error',
          duration: 7000,
        });
        setLoadingPlan('');
      }
    },
    [isAuthenticated, isTherapist, onActivated, toast]
  );

  return { startSubscription, loadingPlan };
}
