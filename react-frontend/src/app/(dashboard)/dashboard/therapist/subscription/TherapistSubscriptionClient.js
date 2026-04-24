'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  SimpleGrid,
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
    <Box maxW="1160px" mx="auto" px={{ base: 1, sm: 0 }}>
      <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="#1a202c" fontWeight="700" letterSpacing="-0.02em">
            Subscription
          </Heading>
          <Text color="gray.600" fontSize="md" maxW="2xl">
            Prices and plan comparison first—then review billing status and controls below.
          </Text>
        </VStack>

        <Box
          borderRadius="3xl"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          px={{ base: 4, md: 8, lg: 10 }}
          py={{ base: 8, md: 10 }}
          boxShadow="0 4px 40px -16px rgba(15, 23, 42, 0.12)"
        >
          <TherapistSubscriptionGateway
            variant="embedded"
            mode="inline"
            subscription={subscription}
            onSelectPlan={startSubscription}
            loadingPlan={loadingPlan}
          />
        </Box>

        <Box
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          bg="gray.50"
          p={{ base: 5, md: 6 }}
        >
          <HStack justify="space-between" align="start" flexWrap="wrap" gap={4} mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.1em" textTransform="uppercase">
                Account status
              </Text>
              <Heading size="sm" color="#1a202c">
                Billing & access
              </Heading>
            </VStack>
            <HStack spacing={2} flexWrap="wrap" w={{ base: 'full', md: 'auto' }}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadStatus(true)}
                isLoading={isRefreshing}
                borderRadius="lg"
                minH="44px"
                w={{ base: 'full', sm: 'auto' }}
              >
                Refresh status
              </Button>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={cancelSubscription}
                isLoading={isCancelling}
                isDisabled={!subscription?.razorpay_subscription_id}
                borderRadius="lg"
                minH="44px"
                w={{ base: 'full', sm: 'auto' }}
                whiteSpace="normal"
              >
                Cancel at cycle end
              </Button>
            </HStack>
          </HStack>

          <HStack spacing={2} flexWrap="wrap" mb={4}>
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

          <Divider borderColor="gray.200" mb={4} />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" p={3}>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.08em" mb={1}>
                Subscription ID
              </Text>
              <Text
                fontFamily="mono"
                fontSize={{ base: '11px', sm: 'xs' }}
                color="gray.700"
                wordBreak="break-all"
                lineHeight="1.4"
              >
                {subscription?.razorpay_subscription_id || '—'}
              </Text>
            </Box>
            <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" p={3}>
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.08em" mb={1}>
                Current cycle
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="1.4">
                {subscription?.current_end ? new Date(subscription.current_end).toLocaleString() : 'Not available yet'}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
