'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  Heading,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { apiPost } from '../api.js';
import { useUser } from '@clerk/nextjs';

/**
 * Pre-release registration for Premium (Therapist OS / Lux Studio).
 * Saves to Contact Inquiries in admin for follow-up and launch discount.
 */
export default function PremiumPreReleaseForm({ audience = 'therapist', id = 'premium-pre-release' }) {
  const toast = useToast();
  const { user: clerkUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (clerkUser?.fullName && !name) setName(clerkUser.fullName);
    const addr = clerkUser?.primaryEmailAddress?.emailAddress;
    if (addr && !email) setEmail(addr);
  }, [clerkUser, name, email]);

  const audienceLabel = audience === 'client' ? 'Client (Lux Studio)' : 'Therapist (Therapist OS)';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Name and email are required.', status: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('contact-messages/', {
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: [
          `Premium pre-release registration — ${audienceLabel}`,
          '',
          'Registrants receive a major discount when Premium launches.',
          note.trim() ? `\nOptional note:\n${note.trim()}` : '',
        ].join('\n'),
      });
      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: 'We will email you early access pricing when Premium launches.',
        status: 'success',
        duration: 6000,
      });
    } catch (err) {
      toast({
        title: 'Could not register',
        description: err?.response?.data?.detail || 'Please try again.',
        status: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Box 
        id={id} 
        bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" 
        p={{ base: 6, md: 8 }} 
        borderRadius="2xl" 
        border="1px solid rgba(16, 185, 129, 0.3)"
        boxShadow="0 4px 20px -2px rgba(6, 78, 59, 0.08)"
      >
        <HStack spacing={3.5} align="start">
          <Icon as={FiCheckCircle} color="#047857" boxSize="20px" mt={0.5} />
          <Box>
            <Text fontWeight="600" color="#047857" fontSize="15px" fontFamily="'Outfit', var(--font-outfit), sans-serif">
              Registration Confirmed
            </Text>
            <Text fontSize="13px" color="#065F46" mt={1} lineHeight="1.5">
              Thank you for reserving your spot. We will email you exclusive early-access pricing as soon as{' '}
              {audience === 'client' ? 'Lux Studio' : 'Therapist OS'} is ready.
            </Text>
          </Box>
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      id={id}
      bg="white"
      p={{ base: 6, md: 8 }}
      borderRadius="2xl"
      border="1px solid"
      borderColor="rgba(86, 117, 109, 0.14)"
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      fontFamily="'Inter', var(--font-inter), sans-serif"
    >
      <VStack align="stretch" spacing={5} as="form" onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="11px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
            Pre-Release Registration
          </Text>
          <Heading 
            fontSize="18px" 
            fontWeight="600" 
            color="#263A33" 
            mt={1}
            fontFamily="'Outfit', var(--font-outfit), sans-serif"
            letterSpacing="-0.01em"
          >
            Reserve Your Early-Access Pricing
          </Heading>
          <Text fontSize="13px" color="#5A6E65" mt={1.5} lineHeight="1.5">
            Register now to receive premier launch pricing and early preview access when {audience === 'client' ? 'The Lux Studio' : 'Therapist OS'} goes live.
          </Text>
        </Box>

        <FormControl isRequired>
          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Full Name</FormLabel>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name" 
            bg="#FAF8F5"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.2)"
            borderRadius="xl"
            h="42px"
            fontSize="13.5px"
            _focus={{ borderColor: "#56756D", bg: "white", boxShadow: "0 0 0 1px #56756D" }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Email Address</FormLabel>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@example.com" 
            bg="#FAF8F5"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.2)"
            borderRadius="xl"
            h="42px"
            fontSize="13.5px"
            _focus={{ borderColor: "#56756D", bg: "white", boxShadow: "0 0 0 1px #56756D" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">Phone Number (Optional)</FormLabel>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+1 … or +91 …" 
            bg="#FAF8F5"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.2)"
            borderRadius="xl"
            h="42px"
            fontSize="13.5px"
            _focus={{ borderColor: "#56756D", bg: "white", boxShadow: "0 0 0 1px #56756D" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33">What are you most looking forward to? (Optional)</FormLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share any specific tools, rituals, or features you'd love to see…"
            rows={3}
            bg="#FAF8F5"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.2)"
            borderRadius="xl"
            fontSize="13.5px"
            _focus={{ borderColor: "#56756D", bg: "white", boxShadow: "0 0 0 1px #56756D" }}
          />
        </FormControl>

        <Button
          type="submit"
          bg="#263A33"
          color="white"
          borderRadius="full"
          height="40px"
          fontSize="13px"
          fontWeight="600"
          isLoading={submitting}
          _hover={{ bg: '#182722' }}
          boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
          w="fit-content"
          px={8}
          mt={1}
        >
          Join Pre-Release List
        </Button>
      </VStack>
    </Box>
  );
}
