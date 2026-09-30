'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Progress,
  Radio, RadioGroup, Checkbox, Input, useToast, Icon,
  Tag, Textarea, FormControl, FormLabel, Center, Spinner, Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiArrowRight, FiCheck, FiHeart, FiCompass, FiShield,
} from 'react-icons/fi';
import { apiPost, apiGet } from '../../../api.js';
import { useAuth } from '../../../context/AuthContext';
import NextLink from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Select as ChakraReactSelect } from 'chakra-react-select';
import ModernSelect from '../../../components/ModernSelect';

const MotionBox = motion(Box);

const SECTIONS = ['Privacy', 'About You', 'Your Needs', 'Contact'];

const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Malayalam', 'Punjabi'
].sort().map((lang) => ({ label: lang, value: lang }));

const CONCERNS = [
  'Anxiety & Stress', 'Depression & Low Mood', 'Trauma & PTSD', 'Relationships', 'Workplace Burnout',
  'Grief & Loss', 'Self-Esteem & Identity', 'Sleep Issues', 'Life Transitions', 'Other',
];

export default function DiscoveryIntakeClient() {
  const toast = useToast();
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { user: authUser } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  // ⚡ Default directly to 'form' so the user NEVER faces an infinite loading screen
  const [view, setView] = useState('form');
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedAt, setSubmittedAt] = useState(null);

  const [formData, setFormData] = useState({
    consent: true,
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

  // 🔄 Silent background sync if user is signed in
  useEffect(() => {
    if (!isMounted || !clerkLoaded || !isSignedIn) return;

    let isSubscribed = true;
    async function checkPendingIntake() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 4000)
        );
        const res = await Promise.race([apiGet('therapists/match/'), timeoutPromise]);
        if (isSubscribed && (res?.intake_pending || res?.status === 'submitted')) {
          setSubmittedAt(res.submitted_at || null);
          setView('submitted');
        }
      } catch (err) {
        // Fail silently and keep form available
        console.warn('Background intake check skipped', err);
      }
    }
    checkPendingIntake();

    return () => {
      isSubscribed = false;
    };
  }, [clerkLoaded, isSignedIn, isMounted]);

  useEffect(() => {
    if (clerkUser?.primaryEmailAddress?.emailAddress && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: clerkUser.primaryEmailAddress.emailAddress,
        first_name: prev.first_name || clerkUser.firstName || '',
        last_name: prev.last_name || clerkUser.lastName || '',
      }));
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
      toast({ title: 'Consent required', description: 'Please review and accept consent to continue.', status: 'warning' });
      return false;
    }
    if (currentSection === 1) {
      if (!formData.first_name.trim()) {
        toast({ title: 'Please enter your first name', status: 'warning' });
        return false;
      }
    }
    if (currentSection === 2) {
      if (!formData.problem_description.trim() && formData.presenting_concerns.length === 0) {
        toast({ title: 'Please select a concern or describe your reason for seeking therapy', status: 'warning' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitIntake();
    }
  };

  const prevStep = () => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast({
        title: 'Could not submit enquiry',
        description: err.response?.data?.detail || 'Please try again or email us directly at therapy@mlchealth.in',
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
            <VStack align="start" spacing={2}>
              <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
                Privacy & Confidentiality
              </Heading>
              <Text color="#5A6E65" fontSize="14px" lineHeight="1.65">
                At MLC Health, we take confidentiality seriously. Everything you share is strictly protected and reviewed solely by our licensed clinical leads to match you with the best practitioner for your needs.
              </Text>
            </VStack>

            <Box p={4} borderRadius="xl" bg="#F4F7F5" border="1px solid" borderColor="rgba(86, 117, 109, 0.16)" w="full">
              <HStack spacing={3} align="start">
                <Icon as={FiShield} color="#56756D" boxSize="20px" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="600" fontSize="14px" color="#263A33">DISHA & HIPAA Aligned Data Standards</Text>
                  <Text fontSize="12.5px" color="#5A6E65">Zero third-party data sharing. Your personal details are only used for clinical matching.</Text>
                </VStack>
              </HStack>
            </Box>

            <Checkbox
              isChecked={formData.consent}
              onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
              colorScheme="teal"
              size="lg"
            >
              <Text fontSize="13.5px" color="#263A33">
                I consent to MLC Health securely storing this information to arrange therapeutic matching.
              </Text>
            </Checkbox>
          </VStack>
        );

      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Heading fontSize={{ base: "18px", md: "20px" }} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
              About You
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
              <FormControl isRequired>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">First Name</FormLabel>
                <Input
                  h="40px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={formData.first_name}
                  onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                  placeholder="e.g. Priya"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Last Name</FormLabel>
                <Input
                  h="40px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={formData.last_name}
                  onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                  placeholder="e.g. Sharma"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3.5}>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Age</FormLabel>
                <Input
                  h="40px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((p) => ({ ...p, age: e.target.value }))}
                  placeholder="e.g. 28"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">City / Location</FormLabel>
                <Input
                  h="40px"
                  borderRadius="xl"
                  borderColor="rgba(86, 117, 109, 0.2)"
                  bg="white"
                  fontSize="13px"
                  color="#263A33"
                  _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                  value={formData.location.city}
                  onChange={(e) => setFormData((p) => ({ ...p, location: { ...p.location, city: e.target.value } }))}
                  placeholder="e.g. Mumbai, Bangalore, Online"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Preferred Languages</FormLabel>
              <ChakraReactSelect
                isMulti
                options={LANGUAGE_OPTIONS}
                value={formData.languages.map((l) => ({ label: l, value: l }))}
                onChange={(selected) => setFormData((p) => ({ ...p, languages: selected.map((s) => s.value) }))}
                placeholder="Select one or more languages..."
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <Heading fontSize={{ base: "18px", md: "20px" }} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
              What brings you to therapy?
            </Heading>
            <Text color="#5A6E65" fontSize="13px">Select any areas you would like to explore or focus on:</Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2.5}>
              {CONCERNS.map((c) => {
                const active = formData.presenting_concerns.includes(c);
                return (
                  <Button
                    key={c}
                    variant={active ? 'solid' : 'outline'}
                    bg={active ? '#56756D' : 'rgba(250, 248, 245, 0.85)'}
                    color={active ? 'white' : '#263A33'}
                    borderColor={active ? '#56756D' : 'rgba(86, 117, 109, 0.2)'}
                    borderRadius="xl"
                    justifyContent="flex-start"
                    fontSize="12.5px"
                    fontWeight="500"
                    h="40px"
                    onClick={() => toggleConcern(c)}
                    _hover={{ bg: active ? '#263A33' : 'white' }}
                  >
                    {c}
                  </Button>
                );
              })}
            </SimpleGrid>

            <FormControl mt={2}>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Tell us a little more (in your own words)</FormLabel>
              <Textarea
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="white"
                fontSize="13px"
                color="#263A33"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                rows={3}
                value={formData.problem_description}
                onChange={(e) => setFormData((p) => ({ ...p, problem_description: e.target.value }))}
                placeholder="What have you been feeling or experiencing recently? (Optional, but helps us match you accurately)"
              />
            </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <Heading fontSize={{ base: "18px", md: "20px" }} color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
              How can our team reach you?
            </Heading>
            <FormControl isRequired>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Email Address</FormLabel>
              <Input
                h="40px"
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="white"
                fontSize="13px"
                color="#263A33"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="name@example.com"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">Phone / WhatsApp Number</FormLabel>
              <Input
                h="40px"
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="white"
                fontSize="13px"
                color="#263A33"
                _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" mb={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">How soon do you hope to begin?</FormLabel>
              <ModernSelect
                value={formData.urgency}
                onChange={(val) => setFormData((p) => ({ ...p, urgency: val }))}
                h="40px"
                options={['Within the next few days', 'Within the next week', 'Within this month', 'Just exploring options']}
              />
            </FormControl>
          </VStack>
        );

      default:
        return null;
    }
  };

  const renderSubmitted = () => (
    <Container maxW="2xl" py={{ base: 10, md: 16 }}>
      <VStack spacing={7} p={{ base: 8, md: 12 }} bg="white" borderRadius="28px" shadow="xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.16)" textAlign="center">
        <Center w="72px" h="72px" borderRadius="full" bg="#EBF3EE" border="1px solid" borderColor="rgba(86, 117, 109, 0.25)">
          <Icon as={FiCheck} w={9} h={9} color="#56756D" />
        </Center>
        <VStack spacing={3}>
          <Heading size="lg" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
            Thank you for reaching out
          </Heading>
          <Text color="#5A6E65" fontSize="15px" lineHeight="1.65" maxW="480px">
            Our clinical team is reviewing your intake. We will reach out to you directly at{' '}
            <Box as="span" fontWeight="700" color="#56756D">{formData.email || 'your email'}</Box>
            {' '}with a personalized therapist recommendation.
          </Text>
          {submittedAt && (
            <Text fontSize="12px" color="gray.400">Submitted {new Date(submittedAt).toLocaleString()}</Text>
          )}
        </VStack>
        <HStack spacing={4} flexWrap="wrap" justify="center" pt={2}>
          <Button as={NextLink} href="/" variant="outline" borderRadius="full" px={6}>
            Back to Home
          </Button>
          <Button as={NextLink} href="/therapists/directory" bg="#56756D" color="white" borderRadius="full" px={6} _hover={{ bg: "#425C55" }}>
            Browse Therapist Directory
          </Button>
        </HStack>
      </VStack>
    </Container>
  );

  if (view === 'submitted') return renderSubmitted();

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 10, md: 16 }} px={4}>
      <Container maxW="3xl">
        
        {/* 🌿 Directory Helper Banner */}
        <Box 
          mb={8} 
          p={3.5} 
          borderRadius="2xl" 
          bg="rgba(86, 117, 109, 0.07)" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.16)"
        >
          <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={2}>
            <HStack spacing={2.5}>
              <Icon as={FiCompass} color="#56756D" boxSize="18px" />
              <Text fontSize="13px" color="#374A43" fontWeight="500">
                Prefer to choose and browse all verified practitioners directly?
              </Text>
            </HStack>
            <Button
              as={NextLink}
              href="/therapists/directory"
              size="sm"
              variant="outline"
              borderColor="#56756D"
              color="#56756D"
              borderRadius="full"
              px={4}
              fontSize="12.5px"
              fontWeight="600"
              _hover={{ bg: "#56756D", color: "white" }}
            >
              View Directory
            </Button>
          </Flex>
        </Box>

        <VStack spacing={2} mb={8} textAlign="center">
          <Heading size="xl" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" letterSpacing="-0.015em">
            Find Your Therapist
          </Heading>
          <Text color="#5A6E65" fontSize="15px">
            Tell us about your needs, and our clinical team will personally recommend the right practitioner for you.
          </Text>
        </VStack>

        <Box bg="white" p={{ base: 6, md: 10 }} borderRadius="28px" shadow="xl" border="1px solid" borderColor="rgba(86, 117, 109, 0.14)">
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="12px" fontWeight="700" color="#56756D" letterSpacing="0.08em">
                  STEP {currentSection + 1} OF {SECTIONS.length}: {SECTIONS[currentSection].toUpperCase()}
                </Text>
                <Text fontSize="12px" color="gray.400" fontWeight="600">{Math.round(progress)}%</Text>
              </HStack>
              <Progress value={progress} size="xs" borderRadius="full" sx={{ '& > div': { bg: '#56756D' } }} />
            </Box>

            <AnimatePresence mode="wait">
              <MotionBox key={currentSection} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                {renderSection()}
              </MotionBox>
            </AnimatePresence>

            <Flex justify="space-between" pt={4} borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.12)" align="center">
              <Button
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                onClick={prevStep}
                isDisabled={currentSection === 0}
                borderRadius="full"
                h="38px"
                fontSize="13px"
                fontWeight="600"
                color="#5A6E65"
                px={4}
                _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
              >
                Back
              </Button>
              <Button
                bg="#56756D"
                color="white"
                borderRadius="full"
                px={6}
                h="38px"
                fontSize="13px"
                fontWeight="600"
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                rightIcon={currentSection === SECTIONS.length - 1 ? <FiHeart /> : <FiArrowRight />}
                onClick={nextStep}
                isLoading={isLoading}
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
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
