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
} from '@chakra-ui/react';
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
      <Box id={id} bg="white" p={{ base: 6, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="green.100">
        <Alert status="success" borderRadius="xl" bg="green.50">
          <AlertIcon />
          <Box>
            <Text fontWeight="700" color="green.800">Registration received</Text>
            <Text fontSize="sm" color="green.700" mt={1}>
              Thank you for joining the pre-release list. You will receive a major discount when{' '}
              {audience === 'client' ? 'Lux Studio' : 'Therapist OS'} launches.
            </Text>
          </Box>
        </Alert>
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
      borderColor="gray.200"
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={5} as="form" onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="xs" fontWeight="700" color="#56756D" letterSpacing="0.12em" textTransform="uppercase">
            Pre-release registration
          </Text>
          <Text fontWeight="700" fontSize="lg" color="gray.800" mt={1}>
            Get a major discount at launch
          </Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Premium is coming soon. Register now as a {audience === 'client' ? 'client' : 'therapist'} and we will
            email you exclusive early-access pricing when {audience === 'client' ? 'Lux Studio' : 'Therapist OS'} goes live.
          </Text>
        </Box>

        <FormControl isRequired>
          <FormLabel>Full name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </FormControl>
        <FormControl>
          <FormLabel>Phone (optional)</FormLabel>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
        </FormControl>
        <FormControl>
          <FormLabel>Anything you are most excited about? (optional)</FormLabel>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tell us what you hope Premium will help you with…"
            rows={3}
          />
        </FormControl>
        <Button
          type="submit"
          bg="#56756D"
          color="white"
          borderRadius="full"
          size="lg"
          isLoading={submitting}
          _hover={{ bg: '#3E5B54' }}
        >
          Join pre-release list
        </Button>
      </VStack>
    </Box>
  );
}
