'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, SimpleGrid, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Icon, Badge, Circle, Spinner, Center, Button
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
    <Box bg="#FDFBFA" minH="100vh" pt={{ base: 8, md: 12 }} pb={{ base: 12, md: 16 }}>
      <Container maxW="6xl">
        <VStack spacing={10} align="stretch">
          {/* Breadcrumbs & Header */}
          <VStack align="start" spacing={4}>
            <Breadcrumb fontSize="xs" fontWeight="800" color="#56756D" textTransform="uppercase" letterSpacing="widest">
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

            <VStack align="start" spacing={3} maxW="3xl">
              <Badge bg="#56756D" color="white" px={3.5} py={1} borderRadius="full" fontSize="xs" fontWeight="800">CLINICAL MENTORSHIP</Badge>
              <Heading fontSize={{ base: "32px", md: "44px" }} fontFamily="'Playfair Display', serif" color="#263A33" fontWeight="600">Senior Clinical Supervisors</Heading>
              <Text fontSize="15px" color="rgba(46,46,46,0.75)" lineHeight="1.7">
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
                <Spinner size="xl" color="#56756D" thickness="4px" />
                <Text color="rgba(46,46,46,0.6)" fontWeight="600">Retrieving senior clinicians...</Text>
              </VStack>
            </Center>
          ) : (
            <Box>
              {supervisors.length === 0 ? (
                <Center py={20} bg="white" borderRadius="2xl" border="1px dashed" borderColor="rgba(169,203,183,0.15)">
                  <VStack spacing={4}>
                    <Icon as={FiShield} w={10} h={10} color="rgba(86,117,109,0.15)" />
                    <Text color="gray.400">Our supervisor network is currently undergoing quarterly verification. Please check back shortly.</Text>
                  </VStack>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {supervisors.map(s => (
                    <TherapistCard key={s.id} therapist={s} isMatch={false} />
                  ))}
                </SimpleGrid>
              )}
            </Box>
          )}

          {/* Final CTA */}
          <Box p={{ base: 6, md: 10 }} bg="#263A33" borderRadius="2xl" color="white" position="relative" overflow="hidden">
             <Box position="absolute" top="-10%" right="-10%" w="300px" h="300px" bg="#56756D" borderRadius="full" filter="blur(80px)" opacity="0.4" />
             <VStack spacing={5} align="start" position="relative" zIndex={1}>
                <Circle size="52px" bg="#56756D" color="#A9CBB7"><Icon as={FiAward} w={6} h={6} /></Circle>
                <VStack align="start" spacing={2.5} maxW="2xl">
                   <Heading fontSize={{ base: "22px", md: "26px" }} fontFamily="'Playfair Display', serif" fontWeight="600">Seeking a specific board certification?</Heading>
                   <Text fontSize="15px" opacity="0.85" lineHeight="1.7">
                      If you are a supervisee working towards specific institutional licensing or board certifications, 
                      we recommend matching via our clinical alignment quiz for a more precise match.
                   </Text>
                </VStack>
                <HStack spacing={4} pt={1}>
                   <Button as={NextLink} href="/therapists/supervision-discovery" bg="white" color="#263A33" borderRadius="full" h="46px" px={8} fontSize="14px" fontWeight="700" _hover={{ bg: 'rgba(169,203,183,0.1)', transform: 'translateY(-1px)' }} transition="all 0.2s">Start Discovery Quiz</Button>
                </HStack>
             </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
