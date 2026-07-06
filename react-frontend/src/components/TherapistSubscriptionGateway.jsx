'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Badge,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { FiArrowRight } from 'react-icons/fi';
import { isPremiumComingSoon } from '../utils/subscriptionPlans';

const MONTHLY_INR = 99;
const ANNUAL_INR = 999;
const PREMIUM_ANNUAL_INR = 1799;
const MONTHLY_IF_PAID_MONTHLY_YEAR = MONTHLY_INR * 12;

const BASIC_PLAN_FEATURES = [
  'Appear in therapist discovery & client matching',
  'Structured booking requests & clinical calendar',
  'In-platform secure video sessions',
  'Encrypted messaging & Care Space workflows',
  'Goals, journals, resources & supervision tools',
  'Billing, invoicing & payment link automation',
];

const PREMIUM_EXTRA_FEATURES = [
  'Everything in Basic, plus the full Therapist OS suite',
  'Over 25 screening assessments with automated scoring & tracking',
  'Over 200 therapist resources, worksheets & clinical tools',
  'Therapist self-care checks & burnout-aware wellness prompts',
  'Complete in-platform chat — full privacy; never share your number with a client again',
  'Advanced practice analytics with conversion insights',
  'Priority listing boosts in therapist discovery surfaces',
  'Premium automation workflows for follow-ups and retention',
];

function PlanCard({
  planKey,
  name,
  billingLabel,
  priceMain,
  priceUnit,
  compareAt,
  compareLabel,
  subline,
  isRecommended,
  badgeLabel,
  onSelectPlan,
  loadingPlan,
  monthlyUrl,
  annualUrl,
  premiumUrl,
  isCurrent,
  emphasized,
  featureLines,
  ctaLabel,
  onSelectPremium,
  comingSoon = false,
}) {
  const bg = isRecommended ? 'linear-gradient(180deg, #FFFCF5 0%, #FFFFFF 40%)' : 'white';

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      borderWidth={isRecommended ? '2px' : '1px'}
      borderColor={isRecommended ? 'transparent' : 'gray.200'}
      bg={bg}
      boxShadow={emphasized ? '0 20px 50px -24px rgba(46, 74, 68, 0.35)' : '0 4px 24px -12px rgba(15, 23, 42, 0.12)'}
      overflow="hidden"
      transition="box-shadow 0.2s ease, transform 0.2s ease"
      _hover={{ boxShadow: '0 24px 56px -20px rgba(46, 74, 68, 0.28)' }}
      pl={isRecommended ? '3px' : 0}
    >
      {isRecommended ? (
        <Box position="absolute" left={0} top={0} bottom={0} w="4px" bgGradient="linear(to-b, #C9A960, #56756D)" />
      ) : null}
      <Box p={{ base: 6, md: 8 }}>
        <VStack align="center" spacing={1} mb={5} minH="52px" justify="center">
          {badgeLabel ? (
            <Badge
              colorScheme={
                badgeLabel === 'Recommended' ? 'green' : badgeLabel === 'Current plan' ? 'teal' : 'gray'
              }
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="600"
              textTransform="none"
              letterSpacing="0.02em"
            >
              {badgeLabel}
            </Badge>
          ) : (
            <Box h="24px" />
          )}
          <Text fontSize="xs" fontWeight="600" color="gray.500" letterSpacing="0.12em" textTransform="uppercase">
            {name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {billingLabel}
          </Text>
        </VStack>

        <VStack spacing={1} mb={1} align="center">
          <HStack align="baseline" spacing={1}>
            <Text fontSize={{ base: '4xl', md: '5xl' }} fontWeight="700" color="#1a202c" letterSpacing="-0.03em" lineHeight="1">
              INR {priceMain}
            </Text>
            <Text fontSize="lg" color="gray.500" fontWeight="500">
              {priceUnit}
            </Text>
          </HStack>
          {compareAt != null ? (
            <HStack spacing={2} fontSize="sm">
              <Text as="span" color="gray.400" textDecoration="line-through">
                INR {compareAt}
              </Text>
              <Text as="span" color="green.600" fontWeight="600">
                {compareLabel}
              </Text>
            </HStack>
          ) : null}
          {subline ? (
            <Text fontSize="sm" color="gray.500" textAlign="center" pt={1}>
              {subline}
            </Text>
          ) : null}
        </VStack>

        <Button
          as={comingSoon ? NextLink : onSelectPlan || onSelectPremium ? 'button' : NextLink}
          href={
            comingSoon
              ? '/dashboard/therapist/premium#premium-pre-release'
              : onSelectPlan || onSelectPremium
              ? undefined
              : planKey === 'monthly'
              ? monthlyUrl
              : planKey === 'annual'
              ? annualUrl
              : premiumUrl
          }
          mt={6}
          w="full"
          minH={{ base: '48px', md: '52px' }}
          size="lg"
          borderRadius="xl"
          fontWeight="600"
          whiteSpace="normal"
          textAlign="center"
          isDisabled={isCurrent}
          variant={comingSoon ? 'outline' : isRecommended ? 'solid' : 'outline'}
          bg={comingSoon ? undefined : isRecommended ? '#56756D' : undefined}
          color={comingSoon ? 'gray.600' : isRecommended ? 'white' : '#56756D'}
          borderColor={comingSoon ? 'gray.300' : '#56756D'}
          _hover={
            comingSoon
              ? { bg: 'gray.50' }
              : isRecommended
              ? { bg: '#3E5B54' }
              : { bg: 'rgba(86, 117, 109, 0.06)' }
          }
          rightIcon={isCurrent || comingSoon ? undefined : <Icon as={FiArrowRight} />}
          onClick={
            comingSoon
              ? undefined
              : !isCurrent && planKey === 'premium' && onSelectPremium
              ? () => onSelectPremium('premium')
              : onSelectPlan && !isCurrent && (planKey === 'monthly' || planKey === 'annual')
              ? () => onSelectPlan(planKey)
              : undefined
          }
          isLoading={!comingSoon && loadingPlan === planKey}
          loadingText="Starting…"
        >
          {isCurrent ? 'Current plan' : comingSoon ? 'Coming soon — join waitlist' : ctaLabel || 'Continue'}
        </Button>

        <Divider my={8} borderColor="gray.100" />

        <Text fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.08em" textTransform="uppercase" mb={4}>
          Everything included
        </Text>
        <List spacing={3}>
          {(featureLines || BASIC_PLAN_FEATURES).map((line) => (
            <ListItem key={line} display="flex" alignItems="flex-start" fontSize="sm" color="gray.700" lineHeight="1.45">
              <ListIcon as={CheckCircleIcon} color="#56756D" mt={0.5} flexShrink={0} />
              {line}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default function TherapistSubscriptionGateway({
  isOpen = false,
  onClose,
  title = 'Unlock MLC Therapist Platform',
  contextLabel = 'Compare plans and activate your therapist operating system.',
  mode = 'modal',
  variant = 'default',
  onSelectPlan,
  onSelectPremium,
  loadingPlan = '',
  subscription = null,
}) {
  const [billingFocus, setBillingFocus] = useState('annual');

  const monthlyUrl =
    process.env.NEXT_PUBLIC_THERAPIST_BASIC_MONTHLY_URL || '/dashboard/therapist/subscription?plan=monthly';
  const annualUrl =
    process.env.NEXT_PUBLIC_THERAPIST_BASIC_ANNUAL_URL || '/dashboard/therapist/subscription?plan=annual';
  const premiumUrl =
    process.env.NEXT_PUBLIC_THERAPIST_PREMIUM_ANNUAL_URL ||
    process.env.NEXT_PUBLIC_RAZORPAY_THERAPIST_PREMIUM_ANNUAL_LINK ||
    process.env.NEXT_PUBLIC_THERAPIST_PREMIUM_URL ||
    '/dashboard/therapist/subscription?plan=premium';

  const planNorm = (subscription?.basic_plan || '').toLowerCase();
  const statusNorm = (subscription?.subscription_status || '').toLowerCase();
  const isActiveish =
    subscription?.is_basic_subscribed &&
    (statusNorm === 'active' || statusNorm === 'pending' || statusNorm === 'created');
  const isCurrentMonthly = isActiveish && planNorm === 'monthly';
  const isCurrentAnnual = isActiveish && planNorm === 'annual';
  const premiumSoon = isPremiumComingSoon();

  const showHeader = variant !== 'embedded';

  const ComparisonBody = (
    <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
      {showHeader ? (
        <VStack spacing={2} align={{ base: 'center', md: 'start' }} textAlign={{ base: 'center', md: 'left' }}>
          <Text fontSize="xs" fontWeight="700" letterSpacing="0.14em" color="#56756D" textTransform="uppercase">
            MLC therapist access
          </Text>
          <Heading size="lg" color="#1a202c" fontWeight="700" letterSpacing="-0.02em">
            {title}
          </Heading>
          <Text color="gray.600" fontSize="md" maxW="640px">
            {contextLabel}
          </Text>
        </VStack>
      ) : null}

      <Flex justify="center" w="full">
        <HStack
          role="group"
          spacing={{ base: 2, md: 0 }}
          p={1}
          bg="gray.100"
          borderRadius={{ base: 'xl', md: 'full' }}
          border="1px solid"
          borderColor="gray.200"
          w={{ base: 'full', md: 'auto' }}
          flexDir={{ base: 'column', md: 'row' }}
        >
          <Button
            size="sm"
            borderRadius="full"
            px={{ base: 4, md: 6 }}
            w={{ base: 'full', md: 'auto' }}
            minH="44px"
            variant={billingFocus === 'monthly' ? 'solid' : 'ghost'}
            bg={billingFocus === 'monthly' ? 'white' : 'transparent'}
            color={billingFocus === 'monthly' ? '#1a202c' : 'gray.600'}
            boxShadow={billingFocus === 'monthly' ? 'sm' : 'none'}
            fontWeight="600"
            onClick={() => setBillingFocus('monthly')}
          >
            Pay monthly
          </Button>
          <Button
            size="sm"
            borderRadius="full"
            px={{ base: 4, md: 6 }}
            w={{ base: 'full', md: 'auto' }}
            minH="44px"
            variant={billingFocus === 'annual' ? 'solid' : 'ghost'}
            bg={billingFocus === 'annual' ? 'white' : 'transparent'}
            color={billingFocus === 'annual' ? '#1a202c' : 'gray.600'}
            boxShadow={billingFocus === 'annual' ? 'sm' : 'none'}
            fontWeight="600"
            onClick={() => setBillingFocus('annual')}
          >
            Pay annually
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 6, lg: 8 }} alignItems="stretch">
        <PlanCard
          planKey="monthly"
          name="Basic Monthly"
          billingLabel="Flexible · cancel anytime"
          priceMain={MONTHLY_INR}
          priceUnit="/ month"
          compareAt={null}
          compareLabel={null}
          subline="Full platform access, billed each month."
          isRecommended={false}
          badgeLabel={isCurrentMonthly ? 'Current plan' : billingFocus === 'monthly' ? 'Popular for trying MLC' : null}
          onSelectPlan={onSelectPlan}
          onSelectPremium={onSelectPremium}
          loadingPlan={loadingPlan}
          monthlyUrl={monthlyUrl}
          annualUrl={annualUrl}
          premiumUrl={premiumUrl}
          isCurrent={isCurrentMonthly}
          emphasized={billingFocus === 'monthly'}
          featureLines={BASIC_PLAN_FEATURES}
          ctaLabel="Start monthly"
        />
        <PlanCard
          planKey="annual"
          name="Basic Annual"
          billingLabel="Best value · one payment per year"
          priceMain={ANNUAL_INR}
          priceUnit="/ year"
          compareAt={MONTHLY_IF_PAID_MONTHLY_YEAR}
          compareLabel={`Save INR ${MONTHLY_IF_PAID_MONTHLY_YEAR - ANNUAL_INR}`}
          subline={`Equivalent to ~INR ${Math.round(ANNUAL_INR / 12)} / month when billed annually.`}
          isRecommended
          badgeLabel={isCurrentAnnual ? 'Current plan' : 'Recommended'}
          onSelectPlan={onSelectPlan}
          onSelectPremium={onSelectPremium}
          loadingPlan={loadingPlan}
          monthlyUrl={monthlyUrl}
          annualUrl={annualUrl}
          premiumUrl={premiumUrl}
          isCurrent={isCurrentAnnual}
          emphasized={billingFocus === 'annual'}
          featureLines={BASIC_PLAN_FEATURES}
          ctaLabel="Start annual"
        />
        <PlanCard
          planKey="premium"
          name="Premium Annual"
          billingLabel="Advanced growth · launching soon"
          priceMain={PREMIUM_ANNUAL_INR}
          priceUnit="/ year"
          compareAt={null}
          compareLabel={null}
          subline={
            premiumSoon
              ? 'Register for pre-release access and a major launch discount.'
              : `Includes Basic access plus premium capabilities at ~INR ${Math.round(PREMIUM_ANNUAL_INR / 12)} / month.`
          }
          isRecommended={false}
          badgeLabel={premiumSoon ? 'Coming soon' : 'Premium tier'}
          onSelectPlan={onSelectPlan}
          onSelectPremium={premiumSoon ? undefined : onSelectPremium}
          comingSoon={premiumSoon}
          loadingPlan={loadingPlan}
          monthlyUrl={monthlyUrl}
          annualUrl={annualUrl}
          premiumUrl={premiumUrl}
          isCurrent={false}
          emphasized={false}
          featureLines={PREMIUM_EXTRA_FEATURES}
          ctaLabel={premiumSoon ? 'Coming soon — join waitlist' : 'Unlock premium'}
        />
      </SimpleGrid>

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
        pt={2}
        borderTop="1px solid"
        borderColor="gray.100"
      >
        <Text fontSize="sm" color="gray.500" maxW="lg">
          {premiumSoon
            ? 'Premium (Therapist OS) is coming soon — join the pre-release list for a major discount at launch.'
            : 'Premium tier unlocks advanced growth, priority support, and therapist OS capabilities for INR 1799/year.'}
        </Text>
        <Button as={NextLink} href="/dashboard/therapist/premium#premium-pre-release" variant="outline" colorScheme="purple" size="sm" borderRadius="lg">
          {premiumSoon ? 'Join pre-release list' : 'Explore Premium Gateway'}
        </Button>
      </Flex>
    </VStack>
  );

  if (mode === 'inline') {
    return <Box>{ComparisonBody}</Box>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent
        borderRadius={{ base: 'none', md: '3xl' }}
        overflow="hidden"
        m={{ base: 0, md: 4 }}
        maxH={{ base: '100vh', md: '92vh' }}
        boxShadow="0 25px 80px -20px rgba(0,0,0,0.35)"
      >
        <ModalCloseButton
          zIndex={2}
          top="14px"
          right="14px"
          borderRadius="full"
          bg="gray.100"
          _hover={{ bg: 'gray.200' }}
        />
        <ModalBody p={{ base: 5, md: 10 }} overflowY="auto">
          {ComparisonBody}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
