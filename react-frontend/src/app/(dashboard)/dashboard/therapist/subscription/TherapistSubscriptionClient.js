'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  SimpleGrid,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import TherapistSubscriptionGateway from '../../../../../components/TherapistSubscriptionGateway';
import { apiGet, apiPost } from '../../../../../api.js';
import { useAuth } from '../../../../../context/AuthContext';

export default function TherapistSubscriptionClient() {
  const toast = useToast();
  const { isAuthenticated, isTherapist } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const loadStatus = async (sync = false) => {
    if (!isAuthenticated || !isTherapist) return;
    try {
      setIsRefreshing(true);
      const res = await apiGet(`payments/therapist/subscription/status${sync ? '?sync=1' : ''}`);
      setSubscription(res);
    } catch (error) {
      toast({
        title: 'Unable to fetch subscription status',
        description: error?.response?.data?.detail || 'Please refresh.',
        status: 'warning',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatus(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isTherapist]);

  const startSubscription = async (planType) => {
    if (!isAuthenticated) {
      toast({ title: 'Please sign in to continue.', status: 'info' });
      window.location.href = '/login/therapist?redirect_url=/dashboard/therapist/subscription';
      return;
    }
    if (!isTherapist) {
      toast({ title: 'Therapist account required.', status: 'warning' });
      return;
    }
    if (!window.Razorpay) {
      toast({ title: 'Payment system loading...', status: 'info' });
      return;
    }

    try {
      setLoadingPlan(planType);
      const payload = await apiPost('payments/razorpay/subscriptions/create', {
        plan_type: planType,
      });

      const options = {
        key: payload.key_id,
        subscription_id: payload.subscription_id,
        name: 'MLC Health',
        description:
          planType === 'annual'
            ? 'MLC Therapist Basic Plan (Annual)'
            : 'MLC Therapist Basic Plan (Monthly)',
        image: 'https://www.mlchealth.in/logo.png',
        handler: async (response) => {
          try {
            await apiPost('payments/razorpay/subscriptions/verify', {
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({
              title: 'Subscription activated!',
              description: 'Your basic therapist access is now active.',
              status: 'success',
              duration: 5000,
            });
            await loadStatus(true);
            setTimeout(() => {
              window.location.href = '/dashboard/therapist';
            }, 800);
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
          ondismiss: () => {
            setLoadingPlan('');
          },
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
  };

  const cancelSubscription = async () => {
    if (!subscription?.razorpay_subscription_id) return;
    try {
      setIsCancelling(true);
      await apiPost('payments/therapist/subscription/cancel', { cancel_at_cycle_end: true });
      toast({
        title: 'Cancellation requested',
        description: 'Your subscription will be cancelled at the end of the current billing cycle.',
        status: 'success',
      });
      await loadStatus(true);
    } catch (error) {
      toast({
        title: 'Unable to cancel subscription',
        description: error?.response?.data?.detail || 'Please try again.',
        status: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const statusColor =
    subscription?.subscription_status === 'active'
      ? 'green'
      : subscription?.subscription_status === 'pending'
      ? 'orange'
      : subscription?.subscription_status === 'cancelled'
      ? 'red'
      : 'gray';

  return (
    <Box maxW="1100px" mx="auto">
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="lg" color="#2E2E2E">
          Therapist Subscription Center
        </Heading>
        <Text color="gray.500">
          Choose your plan first, then manage subscription status and billing controls.
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} alignItems="start">
        <Box p={{ base: 5, md: 6 }} border="1px solid" borderColor="gray.200" borderRadius="2xl" bg="white" shadow="sm">
          <VStack align="start" spacing={4}>
            <HStack justify="space-between" w="full" align="start">
              <VStack align="start" spacing={0}>
                <Heading size="md" color="#2E2E2E">
                  Pricing & Plans
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Activate access to profile visibility, matching, and premium workflows.
                </Text>
              </VStack>
              <Badge colorScheme="teal" borderRadius="full" px={3} py={1}>
                Start Here
              </Badge>
            </HStack>

            <TherapistSubscriptionGateway
              mode="inline"
              title="Choose your MLC plan"
              contextLabel="Select a monthly or annual plan to unlock your therapist operating system."
              onSelectPlan={startSubscription}
              loadingPlan={loadingPlan}
            />
          </VStack>
        </Box>

        <Box p={{ base: 5, md: 6 }} border="1px solid" borderColor="gray.200" borderRadius="2xl" bg="white" shadow="sm">
          <VStack align="start" spacing={4}>
            <Heading size="md" color="#2E2E2E">
              Subscription Status
            </Heading>
            <HStack spacing={3} flexWrap="wrap">
              <Badge colorScheme={statusColor} px={2.5} py={1} borderRadius="full" textTransform="capitalize">
                {subscription?.subscription_status || 'inactive'}
              </Badge>
              <Badge colorScheme="purple" px={2.5} py={1} borderRadius="full" textTransform="capitalize">
                Plan: {subscription?.basic_plan || 'none'}
              </Badge>
              <Badge colorScheme={subscription?.is_basic_subscribed ? 'green' : 'gray'} px={2.5} py={1} borderRadius="full">
                Access: {subscription?.is_basic_subscribed ? 'Unlocked' : 'Locked'}
              </Badge>
            </HStack>

            <Divider />

            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                Subscription ID: {subscription?.razorpay_subscription_id || 'Not yet created'}
              </Text>
              {subscription?.current_end ? (
                <Text fontSize="sm" color="gray.600">
                  Current cycle ends on: {new Date(subscription.current_end).toLocaleString()}
                </Text>
              ) : null}
            </VStack>

            <HStack spacing={3} pt={1}>
              <Button size="sm" variant="outline" onClick={() => loadStatus(true)} isLoading={isRefreshing}>
                Refresh Status
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={cancelSubscription}
                isLoading={isCancelling}
                isDisabled={!subscription?.razorpay_subscription_id}
              >
                Cancel at cycle end
              </Button>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

