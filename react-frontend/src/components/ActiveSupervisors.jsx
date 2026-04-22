'use client'

import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Spinner,
  Center,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiStar } from 'react-icons/fi';
import { apiGet } from '../api';
import TherapistCard from './TherapistCard';

export default function ActiveSupervisors() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await apiGet('therapists/?is_supervisor=true');
        setSupervisors(data.results || data || []);
      } catch (error) {
        console.error('Failed to fetch supervisors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupervisors();
  }, []);

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="mlc.green" thickness="4px" />
          <Text color="gray.500">Connecting with our senior supervisors...</Text>
        </VStack>
      </Center>
    );
  }

  if (supervisors.length === 0) {
    return (
      <Center py={20} bg="white" borderRadius="3rem" border="1px dashed" borderColor="teal.100">
        <VStack spacing={4}>
          <Icon as={FiUsers} w={10} h={10} color="teal.200" />
          <Text color="gray.400">Our supervisors are currently in high demand. Manual matching is available via contact.</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      <VStack spacing={12} align="stretch">
        <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto">
           <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize={{ base: "3xl", md: "4xl" }}>
             Meet Our Active Supervisors
           </Heading>
           <Text color="gray.600" fontSize="lg">
             Senior clinicians dedicated to the development of therapeutic excellence and ethical depth.
           </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {supervisors.map((supervisor) => (
            <TherapistCard key={supervisor.id} therapist={supervisor} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
