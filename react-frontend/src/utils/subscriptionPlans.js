/** Shared therapist/client subscription plan helpers. */

export const THERAPIST_PLANS = {
  monthly: {
    key: 'monthly',
    label: 'Basic Monthly',
    checkoutPlanType: 'monthly',
  },
  annual: {
    key: 'annual',
    label: 'Basic Annual',
    checkoutPlanType: 'annual',
  },
  premium: {
    key: 'premium',
    label: 'Premium Annual',
    checkoutPlanType: 'premium',
  },
};

export function normalizePlanType(raw) {
  const value = String(raw || '').toLowerCase().trim();
  if (!value) return null;
  if (value === 'basic_monthly' || value === 'monthly') return 'monthly';
  if (value === 'basic_annual' || value === 'annual') return 'annual';
  if (value === 'premium' || value === 'premium_annual' || value === 'basic_premium') return 'premium';
  return null;
}

/** Premium checkout disabled until launch (set NEXT_PUBLIC_PREMIUM_COMING_SOON=false to enable). */
export function isPremiumComingSoon() {
  return process.env.NEXT_PUBLIC_PREMIUM_COMING_SOON !== 'false';
}

export function isExternalPaymentLink(url) {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  return !url.includes('/dashboard/');
}

export function getTherapistPlanUrl(planKey) {
  const map = {
    monthly:
      process.env.NEXT_PUBLIC_THERAPIST_BASIC_MONTHLY_URL ||
      process.env.NEXT_PUBLIC_RAZORPAY_THERAPIST_BASIC_MONTHLY_LINK ||
      '/dashboard/therapist/subscription?plan=monthly',
    annual:
      process.env.NEXT_PUBLIC_THERAPIST_BASIC_ANNUAL_URL ||
      process.env.NEXT_PUBLIC_RAZORPAY_THERAPIST_BASIC_ANNUAL_LINK ||
      '/dashboard/therapist/subscription?plan=annual',
    premium:
      process.env.NEXT_PUBLIC_THERAPIST_PREMIUM_ANNUAL_URL ||
      process.env.NEXT_PUBLIC_RAZORPAY_THERAPIST_PREMIUM_ANNUAL_LINK ||
      process.env.NEXT_PUBLIC_THERAPIST_PREMIUM_URL ||
      '/dashboard/therapist/subscription?plan=premium',
  };
  return map[planKey] || '/dashboard/therapist/subscription';
}

export function getClientPremiumUrl() {
  return (
    process.env.NEXT_PUBLIC_CLIENT_PREMIUM_ANNUAL_URL ||
    process.env.NEXT_PUBLIC_RAZORPAY_CLIENT_PREMIUM_ANNUAL_LINK ||
    '/dashboard/client/premium'
  );
}
