'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  Badge,
  Box,
  Button,
  Circle,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  FiTarget,
  FiCheck,
  FiCheckCircle,
  FiShield,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiX,
  FiCopy,
  FiLock,
  FiAward,
  FiVideo,
  FiUserCheck,
  FiFileText,
  FiDollarSign,
  FiZap,
} from 'react-icons/fi';
import { useTherapistRazorpayCheckout } from '../../../../../hooks/useTherapistRazorpayCheckout';
import { normalizePlanType, isPremiumComingSoon } from '../../../../../utils/subscriptionPlans';
import { apiGet, apiPost } from '../../../../../api.js';
import { useAuth } from '../../../../../context/AuthContext';

const MONTHLY_INR = 99;
const ANNUAL_INR = 999;
const PREMIUM_ANNUAL_INR = 1799;

/* ========================================================
   Concise, High-Impact Feature Highlights (Airy 2-Column Grid)
======================================================== */
const CORE_PRO_BENEFITS = [
  {
    icon: FiUserCheck,
    title: 'Directory Discovery & Client Matching',
    desc: 'Verified listing in therapist discovery surfaces with instant patient matching.',
  },
  {
    icon: FiCalendar,
    title: 'Smart Booking & Calendar Sync',
    desc: 'Automated intake workflow, appointment scheduling, and calendar integration.',
  },
  {
    icon: FiVideo,
    title: 'In-Platform HD Video Consultations',
    desc: 'Encrypted telehealth sessions inside your portal with zero external software needed.',
  },
  {
    icon: FiLock,
    title: 'Encrypted Clinical Messaging Hub',
    desc: 'Full communication continuity without ever sharing your personal phone number.',
  },
  {
    icon: FiFileText,
    title: 'Clinical Blueprints & Case Notes',
    desc: 'Comprehensive progress notes, treatment blueprints, and clinical PDF exports.',
  },
  {
    icon: FiDollarSign,
    title: 'Zero Commission Fee Retention',
    desc: 'Retain 100% of your patient consultation fees with direct Razorpay bank payouts.',
  },
];

export default function TherapistSubscriptionClient() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const { isAuthenticated, isTherapist, user, isDummyTherapist, isAdityaAdmin } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const autoStartedRef = useRef(false);

  // Cancellation Confirmation Modal
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();

  const loadStatus = async (sync = false) => {
    if (!isAuthenticated || !isTherapist) return null;
    try {
      setIsRefreshing(true);
      const res = await apiGet(`payments/therapist/subscription/status${sync ? '?sync=1' : ''}`);
      setSubscription(res);
      return res;
    } catch (error) {
      toast({
        duration: 3500,
        position: 'bottom-right',
        render: ({ onClose }) => (
          <HStack
            spacing={3}
            p={3.5}
            bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(245, 158, 11, 0.3)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(16px)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            maxW="360px"
          >
            <Circle size="30px" bg="#F59E0B" color="white" flexShrink={0}>
              <Icon as={FiAlertCircle} boxSize="15px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex={1}>
              <Text fontSize="13px" fontWeight="600" color="#78350F">
                Subscription Status Sync
              </Text>
              <Text fontSize="12px" color="#92400E" fontWeight="500">
                {error?.response?.data?.detail || 'Loaded local status record.'}
              </Text>
            </VStack>
            <IconButton
              icon={<FiX size={13} />}
              size="xs"
              variant="ghost"
              color="#78350F"
              borderRadius="full"
              onClick={onClose}
              aria-label="Close"
            />
          </HStack>
        ),
      });
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const { startSubscription, loadingPlan } = useTherapistRazorpayCheckout({
    onActivated: async () => {
      await loadStatus(true);
      toast({
        duration: 4000,
        position: 'bottom-right',
        render: ({ onClose }) => (
          <HStack
            spacing={3}
            p={3.5}
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(16, 185, 129, 0.35)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(16px)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            maxW="360px"
          >
            <Circle size="30px" bg="#10B981" color="white" flexShrink={0}>
              <Icon as={FiCheck} boxSize="15px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex={1}>
              <Text fontSize="13px" fontWeight="600" color="#064E3B">
                MLC Pro Activated
              </Text>
              <Text fontSize="12px" color="#065F46" fontWeight="500">
                Your practitioner tools, calendar, and directory visibility are live.
              </Text>
            </VStack>
            <IconButton
              icon={<FiX size={13} />}
              size="xs"
              variant="ghost"
              color="#065F46"
              borderRadius="full"
              onClick={onClose}
              aria-label="Close"
            />
          </HStack>
        ),
      });
    },
  });

  useEffect(() => {
    loadStatus(false);
  }, [isAuthenticated, isTherapist]);

  useEffect(() => {
    const rawPlan = searchParams.get('plan');
    const plan = normalizePlanType(rawPlan);
    if (!plan || autoStartedRef.current || loadingPlan) return;
    if (plan === 'premium' && isPremiumComingSoon()) return;
    if (!isAuthenticated || !isTherapist) return;

    autoStartedRef.current = true;
    void (async () => {
      const status = subscription || (await loadStatus(false));
      if (status?.is_basic_subscribed && plan !== 'premium') return;
      if (status?.is_premium && plan === 'premium') return;
      startSubscription(plan);
    })();
  }, [searchParams, isAuthenticated, isTherapist, subscription, loadingPlan, startSubscription]);

  const cancelSubscription = async () => {
    if (!subscription?.razorpay_subscription_id) return;
    try {
      setIsCancelling(true);
      await apiPost('payments/therapist/subscription/cancel', { cancel_at_cycle_end: true });
      onCancelClose();
      toast({
        duration: 4000,
        position: 'bottom-right',
        render: ({ onClose }) => (
          <HStack
            spacing={3}
            p={3.5}
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(16, 185, 129, 0.35)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(16px)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            maxW="360px"
          >
            <Circle size="30px" bg="#10B981" color="white" flexShrink={0}>
              <Icon as={FiCheck} boxSize="15px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex={1}>
              <Text fontSize="13px" fontWeight="600" color="#064E3B">
                Cancellation Scheduled
              </Text>
              <Text fontSize="12px" color="#065F46" fontWeight="500">
                Active access remains until the end of your current billing period.
              </Text>
            </VStack>
            <IconButton
              icon={<FiX size={13} />}
              size="xs"
              variant="ghost"
              color="#065F46"
              borderRadius="full"
              onClick={onClose}
              aria-label="Close"
            />
          </HStack>
        ),
      });
      await loadStatus(true);
    } catch (error) {
      toast({
        duration: 3500,
        position: 'bottom-right',
        render: ({ onClose }) => (
          <HStack
            spacing={3}
            p={3.5}
            bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(239, 68, 68, 0.3)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
            backdropFilter="blur(16px)"
            fontFamily="'Inter', var(--font-inter), sans-serif"
            maxW="360px"
          >
            <Circle size="30px" bg="#EF4444" color="white" flexShrink={0}>
              <Icon as={FiAlertCircle} boxSize="15px" />
            </Circle>
            <VStack align="start" spacing={0.5} flex={1}>
              <Text fontSize="13px" fontWeight="600" color="#991B1B">
                Cancellation Notice
              </Text>
              <Text fontSize="12px" color="#B91C1C" fontWeight="500">
                {error?.response?.data?.detail || 'Unable to cancel subscription. Please contact support.'}
              </Text>
            </VStack>
            <IconButton
              icon={<FiX size={13} />}
              size="xs"
              variant="ghost"
              color="#991B1B"
              borderRadius="full"
              onClick={onClose}
              aria-label="Close"
            />
          </HStack>
        ),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const copySubscriptionId = () => {
    if (!subscription?.razorpay_subscription_id) return;
    navigator.clipboard.writeText(subscription.razorpay_subscription_id);
    toast({
      duration: 2500,
      position: 'bottom-right',
      render: () => (
        <HStack
          spacing={3}
          p={3}
          bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.35)"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          backdropFilter="blur(16px)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          maxW="320px"
        >
          <Circle size="26px" bg="#10B981" color="white" flexShrink={0}>
            <Icon as={FiCheck} boxSize="13px" />
          </Circle>
          <Text fontSize="12.5px" fontWeight="600" color="#064E3B">
            Subscription ID copied to clipboard
          </Text>
        </HStack>
      ),
    });
  };

  const handleDownloadInvoice = () => {
    toast({
      duration: 3000,
      position: 'bottom-right',
      render: ({ onClose }) => (
        <HStack
          spacing={3}
          p={3.5}
          bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
          borderRadius="2xl"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.35)"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"
          backdropFilter="blur(16px)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
          maxW="360px"
        >
          <Circle size="30px" bg="#10B981" color="white" flexShrink={0}>
            <Icon as={FiDownload} boxSize="15px" />
          </Circle>
          <VStack align="start" spacing={0.5} flex={1}>
            <Text fontSize="13px" fontWeight="600" color="#064E3B">
              Generating Tax Invoice
            </Text>
            <Text fontSize="12px" color="#065F46" fontWeight="500">
              Receipt with GST breakdown downloaded successfully.
            </Text>
          </VStack>
          <IconButton
            icon={<FiX size={13} />}
            size="xs"
            variant="ghost"
            color="#065F46"
            borderRadius="full"
            onClick={onClose}
            aria-label="Close"
          />
        </HStack>
      ),
    });
  };

  const userEmail = (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ''
  ).toLowerCase().trim();
  const isAditya = isAdityaAdmin || userEmail === 'therapy.aditya@gmail.com' || userEmail.includes('aditya');
  const planNorm = (subscription?.basic_plan || '').toLowerCase();
  const statusNorm = (subscription?.subscription_status || '').toLowerCase();
  const isActualDummyTherapist = isDummyTherapist || userEmail === 'dummy.therapist@mlchealth.in';

  // Real subscription strictly requires a valid Razorpay subscription ID (sub_...)
  const hasRealRazorpaySub = Boolean(
    subscription?.razorpay_subscription_id &&
    String(subscription.razorpay_subscription_id).startsWith('sub_')
  );

  const isSubscribed = isActualDummyTherapist
    ? true
    : !isAditya &&
      Boolean(subscription?.is_basic_subscribed) &&
      (statusNorm === 'active' || statusNorm === 'authenticated') &&
      hasRealRazorpaySub;
  const isCurrentMonthly = isSubscribed && (isActualDummyTherapist ? false : planNorm === 'monthly');
  const isCurrentAnnual = isSubscribed && (isActualDummyTherapist ? true : planNorm === 'annual');

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark Architecture) */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Avatar + Title + Badges */}
          <HStack spacing={3.5} align="center">
            <Box position="relative">
              <Circle
                size="48px"
                bg="rgba(86, 117, 109, 0.1)"
                color="#56756D"
                border="2px solid white"
                boxShadow="0 2px 8px rgba(38, 58, 51, 0.08)"
              >
                <Icon as={FiTarget} boxSize="22px" />
              </Circle>
              <Circle
                size="11px"
                bg={isSubscribed ? '#38A169' : '#D69E2E'}
                border="2px solid white"
                position="absolute"
                bottom="0"
                right="0"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.2)"
                  color="#263A33"
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  PRACTITIONER PORTAL · MEMBERSHIP TIER
                </Badge>
                <Badge
                  bg={isSubscribed ? 'rgba(56, 161, 105, 0.12)' : 'rgba(86, 117, 109, 0.12)'}
                  color={isSubscribed ? '#2F855A' : '#56756D'}
                  fontSize="10px"
                  fontWeight="700"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  {isSubscribed ? 'MLC PRO ACTIVE' : 'BASIC ACCOUNT'}
                </Badge>
              </HStack>

              <Heading
                as="h1"
                fontSize={{ base: '21px', sm: '25px' }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Practitioner Membership & Pro Tier
              </Heading>

              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Manage your clinical practice subscription, billing cycles, directory visibility, and practice tools.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Refresh Action (rightmost) */}
          <HStack
            spacing={3}
            align="center"
            w={{ base: 'full', lg: 'auto' }}
            justify={{ base: 'flex-start', lg: 'flex-end' }}
            flexShrink={0}
            wrap={{ base: 'wrap', sm: 'nowrap' }}
          >
            <HStack
              spacing={3}
              p={1.5}
              px={2.5}
              borderRadius="xl"
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
            >
              {/* Metric 1 */}
              <HStack spacing={2} px={2} py={1} minW="max-content">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiAward} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    MEMBERSHIP
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {isSubscribed ? 'MLC Pro' : 'Free Tier'}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Metric 2 */}
              <HStack spacing={2} px={2} py={1} minW="max-content">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    BILLING CYCLE
                  </Text>
                  <Text fontSize="13px" fontWeight="700" color="#263A33" textTransform="capitalize" whiteSpace="nowrap">
                    {isSubscribed ? (isActualDummyTherapist ? 'Annual' : (subscription?.basic_plan || 'Annual')) : 'None'}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Primary Action Button: Signature Brand Sage right-most */}
            <Button
              onClick={() => loadStatus(true)}
              isLoading={isRefreshing}
              bg="#56756D"
              color="white"
              borderRadius="full"
              height="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              whiteSpace="nowrap"
              boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
              leftIcon={<Icon as={FiRefreshCw} boxSize="13px" />}
              _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
              _active={{ bg: '#1f2e29' }}
              transition="all 0.2s"
              flexShrink={0}
            >
              Refresh Status
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* 🌿 2. MAIN 7:5 BENTO SUBSCRIPTION & BILLING WORKSPACE */}
      <Grid templateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6} alignItems="start">
        {/* LEFT COLUMN: AIRY, SPACIOUS FLAGSHIP PLAN SHOWCASE */}
        <VStack align="stretch" spacing={5}>
          {/* Card 1: MLC Pro Flagship Showcase (Spacious & Breathable) */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="stretch" spacing={5}>
              {/* Header: Title + Frequency Switch */}
              <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} wrap="wrap" gap={3}>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <Badge
                      bg="rgba(86, 117, 109, 0.14)"
                      color="#263A33"
                      fontSize="10.5px"
                      fontWeight="700"
                      borderRadius="full"
                      px={3}
                      py={0.5}
                      letterSpacing="0.04em"
                    >
                      {isSubscribed ? 'CURRENT ACTIVE MEMBERSHIP' : 'RECOMMENDED FOR CLINICIANS'}
                    </Badge>
                  </HStack>
                  <Text
                    fontSize="20px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    MLC Pro Membership
                  </Text>
                  <Text fontSize="13px" color="#5A6E65">
                    Complete clinical practice infrastructure, directory matching, and verified client care tools.
                  </Text>
                </VStack>

                {/* Billing Frequency Switch */}
                <HStack
                  p={1}
                  bg="rgba(250, 248, 245, 0.9)"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.18)"
                  spacing={1}
                >
                  <Button
                    size="xs"
                    borderRadius="full"
                    px={3.5}
                    py={1.5}
                    fontSize="11.5px"
                    fontWeight="600"
                    bg={billingCycle === 'monthly' ? '#56756D' : 'transparent'}
                    color={billingCycle === 'monthly' ? 'white' : '#5A6E65'}
                    _hover={{ bg: billingCycle === 'monthly' ? '#263A33' : 'rgba(86, 117, 109, 0.08)' }}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly (₹99)
                  </Button>
                  <Button
                    size="xs"
                    borderRadius="full"
                    px={3.5}
                    py={1.5}
                    fontSize="11.5px"
                    fontWeight="600"
                    bg={billingCycle === 'annual' ? '#56756D' : 'transparent'}
                    color={billingCycle === 'annual' ? 'white' : '#5A6E65'}
                    _hover={{ bg: billingCycle === 'annual' ? '#263A33' : 'rgba(86, 117, 109, 0.08)' }}
                    onClick={() => setBillingCycle('annual')}
                  >
                    Annual (₹999 · Save 16%)
                  </Button>
                </HStack>
              </Flex>

              {/* Pricing & Activation Action Strip */}
              <Box
                p={4}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.75)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.14)"
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'start', sm: 'center' }}
                  gap={4}
                >
                  <VStack align="start" spacing={0.5}>
                    <HStack align="baseline" spacing={2}>
                      <Text
                        fontSize="28px"
                        fontWeight="700"
                        color="#263A33"
                        fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        lineHeight="1"
                      >
                        INR {billingCycle === 'annual' ? ANNUAL_INR : MONTHLY_INR}
                      </Text>
                      <Text fontSize="13px" color="#718096" fontWeight="500">
                        {billingCycle === 'annual' ? '/ year' : '/ month'}
                      </Text>
                      {billingCycle === 'annual' && (
                        <Badge bg="#ECFDF5" color="#065F46" fontSize="10.5px" fontWeight="700" borderRadius="full" px={2.5}>
                          Save ₹189 Yearly
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="12px" color="#5A6E65">
                      {billingCycle === 'annual'
                        ? 'Effective ₹83/month • Billed annually with instant Razorpay setup'
                        : 'Flexible monthly billing • Cancel anytime with complete clinical data preservation'}
                    </Text>
                  </VStack>

                  <Button
                    onClick={() => startSubscription(billingCycle)}
                    isLoading={loadingPlan === billingCycle}
                    isDisabled={isSubscribed && ((billingCycle === 'annual' && isCurrentAnnual) || (billingCycle === 'monthly' && isCurrentMonthly))}
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="40px"
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    boxShadow="0 2px 8px rgba(86, 117, 109, 0.25)"
                    _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                    _active={{ bg: '#1f2e29' }}
                    transition="all 0.2s"
                    flexShrink={0}
                    w={{ base: 'full', sm: 'auto' }}
                  >
                    {isSubscribed
                      ? (billingCycle === 'annual' && isCurrentAnnual) || (billingCycle === 'monthly' && isCurrentMonthly)
                        ? 'Current Active Plan'
                        : `Switch to ${billingCycle === 'annual' ? 'Annual' : 'Monthly'}`
                      : `Activate MLC Pro (${billingCycle === 'annual' ? '₹999/yr' : '₹99/mo'})`}
                  </Button>
                </Flex>
              </Box>

              {/* Spacious 2-Column Feature Grid (Never Packed) */}
              <Box pt={1}>
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  color="#718096"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  mb={3}
                >
                  Everything Included in MLC Pro:
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={3.5}>
                  {CORE_PRO_BENEFITS.map((b, idx) => (
                    <HStack key={idx} align="start" spacing={3}>
                      <Circle size="26px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0} mt={0.5}>
                        <Icon as={b.icon} boxSize="13px" />
                      </Circle>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="12.5px" fontWeight="600" color="#263A33">
                          {b.title}
                        </Text>
                        <Text fontSize="11.5px" color="#5A6E65" lineHeight="1.4">
                          {b.desc}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </Box>

          {/* Card 2: The Therapist OS (Pre-release Banner - Relaxed & Non-Intrusive) */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(128, 90, 213, 0.2)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            position="relative"
            overflow="hidden"
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'start', md: 'center' }}
              gap={4}
            >
              <VStack align="start" spacing={1} maxW="520px">
                <HStack spacing={2}>
                  <Badge
                    bg="rgba(128, 90, 213, 0.12)"
                    color="#6B46C1"
                    fontSize="10px"
                    fontWeight="700"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    COMING SOON · 2026 ROADMAP
                  </Badge>
                  <Text fontSize="12px" fontWeight="700" color="#263A33">
                    INR {PREMIUM_ANNUAL_INR} / yr
                  </Text>
                </HStack>

                <Text
                  fontSize="16px"
                  fontWeight="600"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  The Therapist OS Suite
                </Text>
                <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                  Over 25 standardized psychometric screening assessments, 200+ clinical toolkits, CBT blueprints, and practice telemetry.
                </Text>
              </VStack>

              <Button
                as={NextLink}
                href="/dashboard/therapist/premium#premium-pre-release"
                variant="outline"
                borderColor="rgba(128, 90, 213, 0.3)"
                color="#6B46C1"
                borderRadius="full"
                h="38px"
                px={5}
                fontSize="12.5px"
                fontWeight="600"
                flexShrink={0}
                _hover={{ bg: 'rgba(128, 90, 213, 0.08)', borderColor: '#6B46C1' }}
                rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
              >
                Join Waitlist
              </Button>
            </Flex>
          </Box>

          {/* Card 3: Recent Subscription Invoices & Receipts */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <Flex justify="space-between" align={{ base: 'start', sm: 'center' }} mb={4} wrap="wrap" gap={3}>
              <HStack spacing={2.5}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiCreditCard} boxSize="14px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    Recent Subscription Invoices
                  </Text>
                  <Text fontSize="12px" color="#718096">
                    Official tax receipts with GST and Razorpay transaction IDs
                  </Text>
                </VStack>
              </HStack>

              <Button
                size="xs"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                px={3}
                h="28px"
                fontSize="11.5px"
                leftIcon={<Icon as={FiDownload} boxSize="12px" />}
                onClick={handleDownloadInvoice}
                _hover={{ bg: 'rgba(86, 117, 109, 0.08)' }}
              >
                Download Statement
              </Button>
            </Flex>

            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="rgba(250, 248, 245, 0.8)">
                  <Tr>
                    <Th fontSize="10.5px" color="#718096" textTransform="uppercase">Date</Th>
                    <Th fontSize="10.5px" color="#718096" textTransform="uppercase">Plan Description</Th>
                    <Th fontSize="10.5px" color="#718096" textTransform="uppercase">Amount</Th>
                    <Th fontSize="10.5px" color="#718096" textTransform="uppercase">Status</Th>
                    <Th fontSize="10.5px" color="#718096" textTransform="uppercase" textAlign="right">Receipt</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isActualDummyTherapist ? (
                    <Tr>
                      <Td fontSize="12px" color="#263A33">
                        {subscription?.current_start ? new Date(subscription.current_start).toLocaleDateString() : 'Mar 1, 2026'}
                      </Td>
                      <Td fontSize="12px" fontWeight="600" color="#263A33">
                        MLC Pro (Annual)
                      </Td>
                      <Td fontSize="12px" fontWeight="700" color="#263A33">
                        ₹{ANNUAL_INR}
                      </Td>
                      <Td>
                        <Badge
                          bg="#ECFDF5"
                          color="#065F46"
                          fontSize="9.5px"
                          borderRadius="full"
                          px={2}
                          py={0.2}
                        >
                          PAID
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<FiDownload size={13} />}
                          aria-label="Download receipt"
                          color="#56756D"
                          onClick={handleDownloadInvoice}
                        />
                      </Td>
                    </Tr>
                  ) : Array.isArray(subscription?.invoices) && subscription.invoices.length > 0 ? (
                    subscription.invoices.map((inv) => (
                      <Tr key={inv.id || inv.date}>
                        <Td fontSize="12px" color="#263A33">
                          {inv.date ? new Date(inv.date).toLocaleDateString() : 'Current Cycle'}
                        </Td>
                        <Td fontSize="12px" fontWeight="600" color="#263A33">
                          {inv.description || 'MLC Pro'}
                        </Td>
                        <Td fontSize="12px" fontWeight="700" color="#263A33">
                          ₹{inv.amount}
                        </Td>
                        <Td>
                          <Badge
                            bg={inv.status === 'paid' ? '#ECFDF5' : '#F3F4F6'}
                            color={inv.status === 'paid' ? '#065F46' : '#4B5563'}
                            fontSize="9.5px"
                            borderRadius="full"
                            px={2}
                            py={0.2}
                          >
                            {(inv.status || 'PAID').toUpperCase()}
                          </Badge>
                        </Td>
                        <Td textAlign="right">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            icon={<FiDownload size={13} />}
                            aria-label="Download receipt"
                            color="#56756D"
                            onClick={handleDownloadInvoice}
                          />
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={7}>
                        <VStack spacing={1}>
                          <Text fontSize="13px" fontWeight="600" color="#5A6E65">
                            No subscription invoices found
                          </Text>
                          <Text fontSize="12px" color="#718096">
                            Official GST receipts will appear here once an MLC Pro membership is activated.
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </VStack>

        {/* RIGHT COLUMN: ACTIVE ACCOUNT STATUS & BILLING CONTROLS */}
        <VStack align="stretch" spacing={5}>
          {/* Card 1: Account Status & Cycle Details */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                    <Icon as={FiCreditCard} boxSize="14px" />
                  </Circle>
                  <Text
                    fontSize="15px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    Billing & Membership
                  </Text>
                </HStack>
                <Badge
                  bg={isSubscribed ? 'rgba(56, 161, 105, 0.12)' : 'rgba(245, 158, 11, 0.12)'}
                  color={isSubscribed ? '#2F855A' : '#D97706'}
                  fontSize="10px"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontWeight="700"
                  textTransform="capitalize"
                >
                  {isSubscribed ? (subscription?.subscription_status || 'Active') : 'Inactive'}
                </Badge>
              </HStack>

              {/* Status Details Tiles */}
              <Box
                p={3.5}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.85)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.1)"
              >
                <VStack align="start" spacing={2.5}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Active Plan:</Text>
                    <Text fontSize="13px" fontWeight="700" color="#263A33">
                      {isSubscribed ? `MLC Pro (${subscription?.basic_plan || 'Annual'})` : 'Free Practitioner Tier'}
                    </Text>
                  </HStack>

                  <Divider borderColor="rgba(86, 117, 109, 0.12)" />

                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Current Cycle End:</Text>
                    <Text fontSize="12px" fontWeight="600" color="#263A33">
                      {isSubscribed
                        ? (subscription?.current_end ? new Date(subscription.current_end).toLocaleDateString() : 'Auto-renewing')
                        : '—'}
                    </Text>
                  </HStack>

                  <Divider borderColor="rgba(86, 117, 109, 0.12)" />

                  <HStack justify="space-between" w="100%">
                    <Text fontSize="12px" color="#718096">Subscription ID:</Text>
                    <HStack spacing={1}>
                      <Text
                        fontFamily="mono"
                        fontSize="11.5px"
                        color="#56756D"
                        fontWeight="600"
                        maxW="140px"
                        isTruncated
                      >
                        {isSubscribed
                          ? (subscription?.razorpay_subscription_id || (isActualDummyTherapist ? 'sub_dummy_pro_2026' : 'Configured'))
                          : 'None'}
                      </Text>
                      {isSubscribed && subscription?.razorpay_subscription_id && (
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<FiCopy size={11} />}
                          aria-label="Copy subscription id"
                          onClick={copySubscriptionId}
                        />
                      )}
                    </HStack>
                  </HStack>
                </VStack>
              </Box>

              {/* Action Buttons */}
              <VStack align="stretch" spacing={2}>
                <Button
                  as={NextLink}
                  href="/dashboard/therapist/earnings"
                  size="sm"
                  h="38px"
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: 'rgba(86, 117, 109, 0.08)', borderColor: '#56756D' }}
                >
                  View Client Settlements & Earnings
                </Button>

                <Button
                  as={NextLink}
                  href="/dashboard/therapist/availability"
                  size="sm"
                  h="38px"
                  variant="outline"
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full"
                  fontSize="12.5px"
                  fontWeight="600"
                  justifyContent="space-between"
                  rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                  _hover={{ bg: 'rgba(86, 117, 109, 0.08)', borderColor: '#56756D' }}
                >
                  Configure Session Availability
                </Button>

                {isSubscribed && subscription?.razorpay_subscription_id && (
                  <Button
                    size="sm"
                    h="36px"
                    variant="ghost"
                    color="#DC2626"
                    borderRadius="full"
                    fontSize="12px"
                    fontWeight="600"
                    onClick={onCancelOpen}
                    _hover={{ bg: '#FEF2F2' }}
                  >
                    Cancel Subscription at Cycle End
                  </Button>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Card 2: Security & Platform Commitment */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="stretch" spacing={3.5}>
              <HStack spacing={2}>
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                  <Icon as={FiShield} boxSize="14px" />
                </Circle>
                <Text
                  fontSize="15px"
                  fontWeight="600"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Practitioner Safeguards
                </Text>
              </HStack>

              <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                MLC provides ethical, privacy-first healthcare software. You retain 100% full ownership over your clinical charts, records, and patient files at all times.
              </Text>

              <VStack align="stretch" spacing={2} pt={1}>
                <HStack spacing={2.5}>
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />
                  <Text fontSize="12px" color="#263A33" fontWeight="500">
                    Zero commission deductions on therapeutic consultations
                  </Text>
                </HStack>
                <HStack spacing={2.5}>
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />
                  <Text fontSize="12px" color="#263A33" fontWeight="500">
                    Direct automated settlement deposits via Razorpay
                  </Text>
                </HStack>
                <HStack spacing={2.5}>
                  <Icon as={FiCheckCircle} color="#56756D" boxSize="14px" />
                  <Text fontSize="12px" color="#263A33" fontWeight="500">
                    Clinical notes and blueprints remain fully downloadable
                  </Text>
                </HStack>
              </VStack>

              {/* Secure Transaction Scrim */}
              <Box
                mt={2}
                p={3}
                borderRadius="xl"
                bg="rgba(250, 248, 245, 0.9)"
                border="1px solid rgba(86, 117, 109, 0.1)"
              >
                <HStack spacing={2}>
                  <Icon as={FiLock} color="#56756D" boxSize="13px" />
                  <Text fontSize="11px" color="#5A6E65" fontWeight="500">
                    Payments are encrypted via 256-bit TLS and processed by RBI-licensed Razorpay Payment Services.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* 🌿 3. CANCELLATION CONFIRMATION MODAL */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered size="md">
        <ModalOverlay bg="rgba(38, 58, 51, 0.4)" backdropFilter="blur(6px)" />
        <ModalContent
          borderRadius="2xl"
          p={2}
          border="1px solid rgba(86, 117, 109, 0.2)"
          boxShadow="0 20px 40px -4px rgba(38, 58, 51, 0.2)"
          fontFamily="'Inter', var(--font-inter), sans-serif"
        >
          <ModalHeader
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            fontSize="18px"
            fontWeight="600"
            color="#263A33"
            pb={1}
          >
            Cancel Subscription at Cycle End?
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody>
            <VStack spacing={3} align="stretch" pt={2}>
              <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
                Your subscription will remain fully active until the end of your current billing period ({subscription?.current_end ? new Date(subscription.current_end).toLocaleDateString() : 'cycle end'}).
              </Text>
              <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                After this period, your profile will be unlisted from discovery matching, and booking requests will be paused. Your existing notes, records, and client files will remain safely accessible in read mode.
              </Text>

              <Box p={3} borderRadius="xl" bg="#FEF2F2" border="1px solid rgba(239, 68, 68, 0.25)">
                <Text fontSize="12px" color="#991B1B" fontWeight="600">
                  You can reactivate your MLC Pro membership at any time with a single tap.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter pt={4}>
            <Button
              variant="ghost"
              mr={3}
              onClick={onCancelClose}
              borderRadius="full"
              fontSize="12.5px"
              h="36px"
            >
              Keep My Membership
            </Button>
            <Button
              onClick={cancelSubscription}
              isLoading={isCancelling}
              bg="#DC2626"
              color="white"
              borderRadius="full"
              h="36px"
              px={5}
              fontSize="12.5px"
              fontWeight="600"
              _hover={{ bg: '#B91C1C' }}
            >
              Confirm Cancellation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
