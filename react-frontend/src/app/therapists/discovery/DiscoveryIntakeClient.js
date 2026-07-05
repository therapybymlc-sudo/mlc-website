'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Progress,
  Radio, RadioGroup, Stack, Checkbox, Input, Select, useToast, Icon,
  Tag, Wrap, Textarea, FormControl, FormLabel, Alert, AlertIcon, Center, Spinner, Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiLogIn, FiHeart,
} from 'react-icons/fi';
import { apiPost, apiGet } from '../../../api.js';
import { useAuth } from '../../../context/AuthContext';
import NextLink from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Select as ChakraReactSelect } from 'chakra-react-select';

const MotionBox = motion(Box);

const SECTIONS = ['Privacy', 'About You', 'Your Needs', 'Contact'];

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi']
  .sort()
  .map((lang) => ({ label: lang, value: lang }));

const CONCERNS = [
  'Anxiety', 'Depression & Low Mood', 'Trauma', 'Relationships', 'Workplace Burnout',
  'Grief & Loss', 'Self-esteem', 'Sleep Issues', 'Life transitions', 'Other',
];

function AuthGate() {
  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 12, md: 20 }}>
      <Container maxW="lg">
        <VStack spacing={8} p={{ base: 8, md: 12 }} bg="white" borderRadius="3xl" shadow="2xl" textAlign="center">
          <Center w="80px" h="80px" borderRadius="full" bg="teal.50">
            <Icon as={FiLock} w={8} h={8} color="teal.600" />
          </Center>
          <VStack spacing={3}>
            <Heading size="lg" color="teal.800" fontFamily="'Playfair Display', serif">Sign In to Begin</Heading>
            <Text color="gray.600" fontSize="sm">
              Create a free account so we can save your enquiry and follow up with your therapist recommendation.
            </Text>
          </VStack>
          <VStack spacing={3} w="full" maxW="xs">
            <Button as={NextLink} href="/login/client" bg="teal.800" color="white" borderRadius="full" w="full" h="54px" leftIcon={<FiLogIn />}>
              Sign In
            </Button>
            <Button as={NextLink} href="/signup/client" variant="outline" borderColor="teal.800" color="teal.800" borderRadius="full" w="full" h="54px">
              Create Account
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}

export default function DiscoveryIntakeClient() {
  const toast = useToast();
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { user: authUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState('checking');
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);

  const [formData, setFormData] = useState({
    consent: false,
    first_name: authUser?.firstName || '',
    last_name: authUser?.lastName || '',
    age: '',
    gender: '',
    location: { country: 'India', city: '', timezone: '' },
    languages: ['English'],
    session_type_pref: 'No preference',
    therapist_gender_pref: 'No preference',
    urgency: 'Within the next week',
    presenting_concerns: [],
    problem_description: '',
    email: authUser?.email || '',
    phone: '',
    email_marketing_consent: false,
    whatsapp_marketing_consent: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!clerkLoaded || !isMounted) return;
    if (!isSignedIn) {
      setView('auth_gate');
      return;
    }

    async function initialize() {
      try {
        const res = await apiGet('therapists/match/');
        if (res?.intake_pending || res?.intake_mode === 'manual') {
          setSubmittedAt(res.submitted_at || null);
          setView('submitted');
          return;
        }
      } catch (err) {
        console.warn('Intake status check failed', err);
      }
      setView('form');
    }
    initialize();
  }, [clerkLoaded, isSignedIn, isMounted]);

  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress && !formData.email) {
      setFormData((prev) => ({ ...prev, email: clerkUser.primaryEmailAddress.emailAddress }));
    }
  }, [clerkUser, formData.email]);

  const progress = (currentSection / (SECTIONS.length - 1)) * 100;

  const toggleConcern = (concern) => {
    setFormData((prev) => ({
      ...prev,
      presenting_concerns: prev.presenting_concerns.includes(concern)
        ? prev.presenting_concerns.filter((c) => c !== concern)
        : [...prev.presenting_concerns, concern],
    }));
  };

  const validateStep = () => {
    if (currentSection === 0 && !formData.consent) {
      toast({ title: 'Consent required', status: 'warning' });
      return false;
    }
    if (currentSection === 1) {
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.age || !formData.gender) {
        toast({ title: 'Please complete your basic details', status: 'warning' });
        return false;
      }
    }
    if (currentSection === 2) {
      if (!formData.problem_description.trim()) {
        toast({ title: 'Please describe what you need support with', status: 'warning' });
        return false;
      }
    }
    if (currentSection === 3) {
      if (!formData.email.trim()) {
        toast({ title: 'Email is required so we can reach you', status: 'warning' });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      submitIntake();
    }
  };

  const prevStep = () => {
    if (currentSection > 0) setCurrentSection((s) => s - 1);
  };

  const submitIntake = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        intake_mode: 'manual',
        name: `${formData.first_name} ${formData.last_name}`.trim(),
      };
      await apiPost('therapists/match/', payload);
      setSubmittedAt(new Date().toISOString());
      setView('submitted');
      window.scrollTo(0, 0);
    } catch (err) {
      toast({
        title: 'Could not submit your enquiry',
        description: err.response?.data?.detail || 'Please try again.',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <VStack spacing={6} align="start">
            <Heading size="md" color="teal.900">Privacy & Consent</Heading>
            <Text color="gray.600" fontSize="sm" lineHeight="tall">
              Your responses are confidential. Our clinical team will review your enquiry and contact you with a therapist recommendation matched to your needs.
            </Text>
            <Checkbox
              isChecked={formData.consent}
              onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
              colorScheme="teal"
            >
              I consent to MLC Health storing this information to arrange therapy support.
            </Checkbox>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={5} align="stretch">
            <Heading size="md" color="teal.900">About You</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>First name</FormLabel>
                <Input value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last name</FormLabel>
                <Input value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Age</FormLabel>
                <Input type="number" value={formData.age} onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select value={formData.gender} onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))} placeholder="Select">
                  {['Woman', 'Man', 'Non-binary', 'Prefer not to say'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  value={formData.location.city}
                  onChange={(e) => setFormData((p) => ({ ...p, location: { ...p.location, city: e.target.value } }))}
                  placeholder="e.g. Mumbai"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Languages</FormLabel>
                <ChakraReactSelect
                  isMulti
                  options={LANGUAGE_OPTIONS}
                  value={LANGUAGE_OPTIONS.filter((o) => formData.languages.includes(o.value))}
                  onChange={(selected) => setFormData((p) => ({ ...p, languages: (selected || []).map((s) => s.value) }))}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={5} align="stretch">
            <Heading size="md" color="teal.900">What brings you here?</Heading>
            <FormControl isRequired>
              <FormLabel>Describe your problem or what you need support with</FormLabel>
              <Textarea
                value={formData.problem_description}
                onChange={(e) => setFormData((p) => ({ ...p, problem_description: e.target.value }))}
                placeholder="Share what you have been going through, what kind of support you are looking for, and anything else that would help us match you well..."
                minH="160px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Areas of concern (optional)</FormLabel>
              <Wrap spacing={2}>
                {CONCERNS.map((c) => (
                  <Tag
                    key={c}
                    size="md"
                    variant={formData.presenting_concerns.includes(c) ? 'solid' : 'outline'}
                    colorScheme="teal"
                    cursor="pointer"
                    onClick={() => toggleConcern(c)}
                  >
                    {c}
                  </Tag>
                ))}
              </Wrap>
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Session preference</FormLabel>
                <Select value={formData.session_type_pref} onChange={(e) => setFormData((p) => ({ ...p, session_type_pref: e.target.value }))}>
                  {['Online Video (Individual)', 'In-person (Select Locations)', 'No preference'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Therapist gender preference</FormLabel>
                <RadioGroup value={formData.therapist_gender_pref} onChange={(v) => setFormData((p) => ({ ...p, therapist_gender_pref: v }))}>
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                    {['No preference', 'Woman', 'Man'].map((o) => (
                      <Radio key={o} value={o} colorScheme="teal">{o}</Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>
            </SimpleGrid>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={5} align="stretch">
            <Heading size="md" color="teal.900">How can we reach you?</Heading>
            <Alert status="info" borderRadius="xl">
              <AlertIcon />
              <Text fontSize="sm">
                We will personally review your enquiry and email you with a therapist recommendation. This usually takes 1–2 business days.
              </Text>
            </Alert>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Phone / WhatsApp (recommended)</FormLabel>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 ..."
              />
            </FormControl>
            <FormControl>
              <FormLabel>How soon do you hope to begin?</FormLabel>
              <Select value={formData.urgency} onChange={(e) => setFormData((p) => ({ ...p, urgency: e.target.value }))}>
                {['Within the next week', 'Within the next month', 'Just exploring for now'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  };

  const renderSubmitted = () => (
    <Container maxW="3xl" py={{ base: 10, md: 20 }}>
      <VStack spacing={8} p={{ base: 8, md: 12 }} bg="white" borderRadius="3xl" shadow="2xl" textAlign="center">
        <Icon as={FiCheck} w={16} h={16} color="teal.500" />
        <VStack spacing={4}>
          <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">Thank you for reaching out</Heading>
          <Text color="gray.600" fontSize="lg" lineHeight="tall">
            Our clinical team is reviewing what you shared. We will reach out to you at{' '}
            <Box as="span" fontWeight="700" color="teal.800">{formData.email || 'your email'}</Box>
            {' '}with a personalized therapist recommendation matched to your needs.
          </Text>
          {submittedAt && (
            <Text fontSize="sm" color="gray.500">Submitted {new Date(submittedAt).toLocaleString()}</Text>
          )}
        </VStack>
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button as={NextLink} href="/" variant="outline" borderRadius="full">Back to Home</Button>
          <Button as={NextLink} href="/book" bg="teal.800" color="white" borderRadius="full">Book a Consultation</Button>
        </HStack>
      </VStack>
    </Container>
  );

  if (view === 'checking' || !isMounted) {
    return (
      <Box py={40} textAlign="center">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4} color="gray.500">Loading...</Text>
      </Box>
    );
  }
  if (view === 'auth_gate') return <AuthGate />;
  if (view === 'submitted') return renderSubmitted();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 10, md: 20 }}>
      <Container maxW="3xl">
        <VStack spacing={2} mb={8} textAlign="center">
          <Heading size="lg" color="teal.900" fontFamily="'Playfair Display', serif">Find Your Therapist</Heading>
          <Text color="gray.600" fontSize="sm">Tell us about your needs — our team will match you personally.</Text>
        </VStack>
        <Box bg="white" p={{ base: 5, md: 10 }} borderRadius="3xl" shadow="2xl" border="1px solid" borderColor="gray.50">
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontWeight="800" color="teal.600">STEP {currentSection + 1} / {SECTIONS.length}</Text>
                <Text fontSize="xs" color="gray.400">{Math.round(progress)}%</Text>
              </HStack>
              <Progress value={progress} size="xs" colorScheme="teal" borderRadius="full" />
            </Box>
            <AnimatePresence mode="wait">
              <MotionBox key={currentSection} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                {renderSection()}
              </MotionBox>
            </AnimatePresence>
            <Flex justify="space-between" pt={4}>
              <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={prevStep} isDisabled={currentSection === 0}>
                Back
              </Button>
              <Button
                bg="teal.800"
                color="white"
                borderRadius="full"
                rightIcon={currentSection === SECTIONS.length - 1 ? <FiHeart /> : <FiArrowRight />}
                onClick={nextStep}
                isLoading={isLoading}
              >
                {currentSection === SECTIONS.length - 1 ? 'Submit Enquiry' : 'Continue'}
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
