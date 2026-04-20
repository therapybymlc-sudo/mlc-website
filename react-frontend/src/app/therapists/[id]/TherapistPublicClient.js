'use client'
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Script from "next/script";

import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Image, 
  Badge, 
  SimpleGrid, 
  Icon, 
  Divider, 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  Spinner, 
  Center, 
  useToast, 
} from "@chakra-ui/react";
import { 
  FiCheckCircle, FiClock, FiVideo, 
  FiGlobe, FiMessageCircle, FiHeart, FiCalendar 
} from "react-icons/fi";

export default function TherapistPublicClient({ therapist }) {
  const [isMounted, setIsMounted] = useState(false);
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(therapist);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!therapist);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (!profile) {
      const fetchProfile = async () => {
        try {
          const pathParts = window.location.pathname.split('/').filter(Boolean);
          const idFromUrl = pathParts[pathParts.length - 1];
          const res = await fetch(`https://api.mlchealth.in/api/therapists/${idFromUrl}/`);
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          }
        } catch (err) { console.error("Profile fallback failed", err); }
        finally { setIsLoadingProfile(false); }
      };
      fetchProfile();
    }
  }, [profile]);

  useEffect(() => {
     if (!profile?.id) return;
     const fetchSlots = async () => {
       try {
             const res = await fetch(`https://api.mlchealth.in/api/availability-slots/public/?therapist=${profile.id}&cache_refresh=${Date.now()}`, { 
               next: { revalidate: 0 } 
             });
             if (res.ok) {
               const data = await res.json();
               setSlots(data.results || data);
             } else {
               const errorText = await res.text();
               console.error(`Server Error (${res.status}):`, errorText);
             }
       } catch (err) {
         console.error("Failed to fetch slots", err);
       } finally {
         setIsLoadingSlots(false);
       }
     };
     fetchSlots();
  }, [profile?.id]);

  useEffect(() => {
    // Extract unique days that actually have slots
    const uniqueDates = [...new Set(slots.map(s => {
      const d = new Date(s.start_time);
      return d.toISOString().split('T')[0];
    }))];
    setAvailableDates(uniqueDates);
  }, [slots]);

  const slotsForSelectedDate = slots.filter(s => {
    if (!selectedDate) return false;
    const d = new Date(s.start_time);
    return d.toISOString().split('T')[0] === selectedDate;
  });

  // Calendar Logic: Next 30 days
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  if (!isMounted) return <Box h="100vh" bg="white" />;
  if (isLoadingProfile) return <Center p={20} h="60vh"><VStack><Spinner size="xl" color="mlc.green" /><Text>Loading specialist profile...</Text></VStack></Center>;
  if (!profile) return (
    <Box p={20} textAlign="center">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="700">Specialist Profile Currently Syncing</Text>
        <Text color="gray.500">Retrieving latest clinical credentials...</Text>
        <Button as={Link} href="/therapists/discovery" variant="outline" borderRadius="full">Return to Discovery</Button>
      </VStack>
    </Box>
  );

  return (
    <Box bg="white" pb={20}>
      <Script id="therapist-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Psychologist", "name": profile.name }) }} />
      
      {/* 🧭 Breadcrumbs */}
      <Box bg="#F9FBFA" py={4} borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <Breadcrumb fontSize="xs" color="gray.500">
            <BreadcrumbItem><BreadcrumbLink as={Link} href="/">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbLink as={Link} href="/therapists/discovery">Experts</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem isCurrentPage><BreadcrumbLink fontWeight="bold" color="mlc.greenDark">{profile.name}</BreadcrumbLink></BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>

      {/* 🌿 Hero Section */}
      <Box pt={12} pb={20} bgGradient="linear(to-b, #F9FBFA, white)">
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
            <VStack align="start" spacing={6}>
              <HStack spacing={4}>
                <Badge bg="rgba(86, 117, 109, 0.1)" color="mlc.greenDark" borderRadius="full" px={4} py={1} fontSize="xs">ACTIVE CLINICIAN</Badge>
                {profile.is_accepting_new && <Badge bg="green.50" color="green.600" borderRadius="full" px={4} py={1} fontSize="xs">ACCEPTING NEW CLIENTS</Badge>}
              </HStack>
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="2xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">{profile.name}</Heading>
                <Text fontSize="xl" color="gray.600" fontWeight="500">{profile.title || "Psychotherapist"}</Text>
              </VStack>
              <Text fontSize="lg" color="gray.500" fontStyle="italic">"{profile.headline || `Dedicated to supporting your mental health journey.`}"</Text>
              <HStack spacing={4} pt={4}>
                <Button as="a" href="#booking-calendar" size="lg" bg="mlc.green" color="white" borderRadius="full" px={10} _hover={{ bg: 'mlc.greenDark' }}>Book Session</Button>
                <Button size="lg" variant="outline" borderRadius="full" borderColor="mlc.green" color="mlc.green" leftIcon={<FiMessageCircle />}>Inquire</Button>
              </HStack>
            </VStack>
            <Box position="relative">
              <Image src={profile.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"} borderRadius="3xl" shadow="2xl" border="8px solid white" />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 📖 Booking section */}
      <Container maxW="6xl" mt={-10}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12}>
          <Box gridColumn={{ lg: "span 2" }}>
            <VStack align="stretch" spacing={12}>
              
              {/* 🗓️ MLC Mini Calendar */}
              <Box id="booking-calendar" p={8} bg="white" borderRadius="3rem" shadow="xl" border="1px solid" borderColor="gray.50">
                <VStack align="stretch" spacing={8}>
                   <VStack align="start" spacing={1}>
                      <Heading size="lg" color="mlc.greenDark" fontFamily="'Playfair Display', serif">Reserve a Session</Heading>
                      <Text fontSize="sm" color="gray.500">Click a highlighted date to see available times.</Text>
                   </VStack>
                   
                   <Box>
                      <SimpleGrid columns={{ base: 4, md: 7 }} spacing={3}>
                         {calendarDays.map((day, idx) => {
                            const dateStr = day.toISOString().split('T')[0];
                            const isAvailable = availableDates.includes(dateStr);
                            const isSelected = selectedDate === dateStr;
                            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                            return (
                               <VStack 
                                  key={idx} p={4} borderRadius="2xl" transition="all 0.2s"
                                  cursor={isAvailable ? "pointer" : "default"}
                                  bg={isSelected ? "mlc.green" : "transparent"}
                                  color={isSelected ? "white" : isAvailable ? "mlc.black" : "gray.200"}
                                  border="1px solid" borderColor={isSelected ? "mlc.green" : isAvailable ? "mlc.green" : "gray.100"}
                                  _hover={isAvailable ? { transform: 'translateY(-2px)', bg: isSelected ? 'mlc.green' : 'teal.50' } : {}}
                                  onClick={() => isAvailable && setSelectedDate(dateStr)}
                               >
                                  <Text fontSize="2xs" fontWeight="700">{dayName.toUpperCase()}</Text>
                                  <Text fontSize="lg" fontWeight="800">{day.getDate()}</Text>
                               </VStack>
                            );
                         })}
                      </SimpleGrid>
                   </Box>

                   {selectedDate ? (
                      <VStack align="stretch" spacing={6} pt={6} borderTop="1px solid" borderColor="gray.100">
                         <Heading size="sm" color="mlc.greenDark">Available times on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Heading>
                         <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                            {slotsForSelectedDate.map(slot => (
                               <Button
                                 key={slot.id} variant="outline" py={6} borderColor="mlc.green" borderRadius="2xl"
                                 _hover={{ bg: 'mlc.green', color: 'white' }}
                                 onClick={() => window.location.href = `/book/checkout?therapist=${profile.id}&slot=${slot.id}`}
                               >
                                 <Text fontWeight="bold">{new Date(slot.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
                               </Button>
                            ))}
                         </SimpleGrid>
                      </VStack>
                   ) : (
                      <Center py={10} bg="gray.50" borderRadius="3xl" border="1px dashed" borderColor="gray.200">
                         <Text color="gray.400" fontSize="sm">Please select a highlighted date to continue</Text>
                      </Center>
                   )}
                </VStack>
              </Box>

              <Box><Heading as="h2" size="lg" mb={6} color="mlc.greenDark">About My Practice</Heading><Text color="gray.600" lineHeight="1.8">{profile.bio || "Bio coming soon."}</Text></Box>
            </VStack>
          </Box>

          <Box>
            <VStack align="stretch" spacing={6}>
              <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100" position="sticky" top="100px">
                <Heading size="md" mb={6} color="mlc.greenDark">Therapy Details</Heading>
                <VStack align="stretch" spacing={4} fontSize="sm">
                  <HStack justify="space-between"><Text color="gray.600">Rate</Text><Text fontWeight="bold">KD {profile.hourly_rate || "45"}</Text></HStack>
                  <HStack justify="space-between"><Text color="gray.600">Session</Text><Text fontWeight="bold">60 Minutes</Text></HStack>
                  <HStack justify="space-between"><Text color="gray.600">Method</Text><Badge colorScheme="teal" borderRadius="full">Online Video</Badge></HStack>
                  <Divider my={4} />
                  <Button as="a" href="#booking-calendar" w="full" bg="mlc.gold" color="white" borderRadius="full">Reserve Now</Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
