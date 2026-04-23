'use client'

import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FiUserCheck } from 'react-icons/fi';
import { apiPatch } from '../../../../api';

export default function OnboardingModal({ isOpen, onClose, profileId, currentEmail }) {
  const [formData, setFormData] = useState({
    name: '',
    email: currentEmail || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    if (!formData.name.trim() || formData.name.toLowerCase() === 'new client') {
      toast({
        title: "Name Required",
        description: "Please enter your real full name.",
        status: "warning",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiPatch(`clients/${profileId}/`, formData);
      toast({
        title: "Welcome aboard!",
        description: "Your profile has been successfully linked and verified.",
        status: "success",
      });
      onClose();
      // Force reload to sync all data after merge
      window.location.reload();
    } catch (err) {
      toast({
        title: "Setup Failed",
        description: err.response?.data?.detail || "Something went wrong. Please try again.",
        status: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="3xl" p={4}>
        <ModalHeader textAlign="center">
          <VStack spacing={4}>
            <Icon as={FiUserCheck} boxSize={12} color="#56756D" />
            <Text fontSize="2xl" fontFamily="'Playfair Display', serif">Complete Your Profile</Text>
          </VStack>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6}>
            <Text textAlign="center" color="gray.600">
              Welcome to MLC. To ensure your therapist can access your clinical records and sessions, please confirm your details.
            </Text>
            
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input 
                placeholder="e.g. John Smith" 
                borderRadius="xl"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Professional Email</FormLabel>
              <Input 
                placeholder="email@example.com" 
                borderRadius="xl"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Text fontSize="xs" mt={2} color="gray.500">
                Use the email your therapist registered you with to auto-merge your history.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter pb={8}>
          <Button 
            bg="#56756D" 
            color="white" 
            w="full" 
            borderRadius="full" 
            h="50px"
            isLoading={isSaving}
            onClick={handleSave}
            _hover={{ bg: '#455c56' }}
          >
            Finalize & Unlock Dashboard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
