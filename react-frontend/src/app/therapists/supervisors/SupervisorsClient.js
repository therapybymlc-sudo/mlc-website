'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, Heading, Text, SimpleGrid, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Icon, Badge, Circle, Spinner, Center
} from "@chakra-ui/react";
import { FiArrowRight, FiAward, FiShield } from "react-icons/fi";
import { apiGet } from "../../../api.js";
import TherapistCard from "../../../components/TherapistCard";
import NextLink from "next/link";

export default function SupervisorsClient() {
  const [supervisors, setSupervisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("therapists/?is_supervisor=true&supervision_status=approved");
        const data = res.results ?? res;
        setSupervisors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load supervisors", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Box bg="#FDFBFA" minH="100vh" pt={{ base: 24, md: 32 }} pb={40}>
      <Container maxW="7xl">
        <VStack spacing={16} align="stretch">
          {/* Breadcrumbs & Header */}
          <VStack align="start" spacing={6}>
            <Breadcrumb fontSize="xs" fontWeight="800" color="teal.600" textTransform="uppercase" letterSpacing="widest">
              <BreadcrumbItem>
                <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={NextLink} href="/therapists">For Therapists</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink>Supervisors</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <VStack align="start" spacing={4} maxW="3xl">
              <Badge bg="teal.800" color="white" px={4} py={1} borderRadius="full" fontSize="xs">CLINICAL MENTORSHIP</Badge>
              <Heading size="2xl" fontFamily="'Playfair Display', serif" color="teal.900">Senior Clinical Supervisors</Heading>
              <Text fontSize="lg" color="gray.600" lineHeight="1.8">
                Our network of approved supervisors represents the highest tier of clinical mastery at MLC. 
                Each mentor is verified for modality-specific depth and professional stewardship, ensuring 
                your clinical growth is held in safe, expert hands.
              </Text>
            </VStack>
          </VStack>

          {/* Supervisors Grid */}
          {isLoading ? (
            <Center py={40}>
              <VStack spacing={4}>
                <Spinner size="xl" color="teal.600" thickness="4px" />
                <Text color="gray.500" fontWeight="600">Retrieving senior clinicians...</Text>
              </VStack>
            </Center>
          ) : (
            <Box>
              {supervisors.length === 0 ? (
                <Center py={20} bg="white" borderRadius="3rem" border="1px dashed" borderColor="teal.100">
                  <VStack spacing={4}>
                    <Icon as={FiShield} w={10} h={10} color="teal.200" />
                    <Text color="gray.400">Our supervisor network is currently undergoing quarterly verification. Please check back shortly.</Text>
                  </VStack>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                  {supervisors.map(s => (
                    <TherapistCard key={s.id} therapist={s} isMatch={false} />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}

          {/* Final CTA */}
          <Box p={{ base: 10, md: 20 }} bg="teal.900" borderRadius="3rem" color="white" position="relative" overflow="hidden">
             <Box position="absolute" top="-10%" right="-10%" w="300px" h="300px" bg="teal.800" borderRadius="full" filter="blur(80px)" opacity="0.4" />
             <VStack spacing={8} align="start" position="relative" zIndex={1}>
                <Circle size="60px" bg="teal.700" color="teal.300"><Icon as={FiAward} w={6} h={6} /></Circle>
                <VStack align="start" spacing={4} maxW="2xl">
                   <Heading size="lg" fontFamily="'Playfair Display', serif">Seeking a specific board certification?</Heading>
                   <Text fontSize="md" opacity="0.8" lineHeight="1.7">
                      If you are a supervisee working towards specific institutional licensing or board certifications, 
                      we recommend matching via our clinical alignment quiz for a more precise match.
                   </Text>
                </VStack>
                <HStack spacing={4}>
                   <Button as={NextLink} href="/therapists/supervision-discovery" bg="white" color="teal.900" borderRadius="full" px={10} fontWeight="900" _hover={{ bg: 'teal.50' }}>Start Discovery Quiz</Button>
                </HStack>
             </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
