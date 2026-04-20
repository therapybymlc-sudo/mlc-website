'use client'
import React from 'react';

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
  List, 
  ListItem, 
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { 
  FiCheckCircle, FiClock, FiVideo, FiMapPin, FiAward, 
  FiGlobe, FiMessageCircle, FiHeart, FiCalendar 
} from "react-icons/fi";
import NextLink from "next/link";
import Script from "next/script";

export default function PublicProfileClient({ therapist }) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [slots, setSlots] = React.useState([]);
  const [profile, setProfile] = React.useState(therapist);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(!therapist);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(true);
  const toast = useToast();

  React.useEffect(() => {
    setIsMounted(true);
    if (!profile) {
      const fetchProfile = async () => {
        try {
          const idFromUrl = window.location.pathname.split('/').pop();
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

  React.useEffect(() => {
     if (!profile?.id) return;
     const fetchSlots = async () => {
       try {
         const res = await fetch(`https://api.mlchealth.in/api/availability-slots/public/?therapist=${profile.id}`);
         if (res.ok) {
           const data = await res.json();
           setSlots(data.results || data);
         }
       } catch (err) {
         console.error("Failed to fetch slots", err);
       } finally {
         setIsLoadingSlots(false);
       }
     };
     fetchSlots();
  }, [profile?.id]);

  if (!isMounted) return <Box h="100vh" bg="white" />;
  if (isLoadingProfile) return <Center p={20} h="60vh"><VStack><Spinner size="xl" color="mlc.green" /><Text>Loading specialist profile...</Text></VStack></Center>;
  if (!profile) return (
    <Box p={20} textAlign="center">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="700">Specialist Profile Currently Syncing</Text>
        <Text color="gray.500">We are retrieving the latest clinical credentials. Please refresh in a moment!</Text>
        <Button as={NextLink} href="/therapists/discovery" variant="outline" borderRadius="full">Return to Discovery</Button>
      </VStack>
    </Box>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Psychologist",
    "name": profile.name,
    "description": profile.headline || profile.bio?.substring(0, 160),
    "image": profile.profile_image_url,
    "jobTitle": profile.title || "Psychotherapist",
    "knowsAbout": profile.specialties || profile.focus_areas,
    "knowsLanguage": profile.languages,
    "provider": {
      "@type": "MedicalOrganization",
      "name": "MLC Health and Wellness Centre",
      "url": "https://www.mlchealth.in"
    }
  };

  return (
    <Box bg="white" pb={20}>
      <Script
        id="therapist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 🧭 Breadcrumbs */}
      <Box bg="#F9FBFA" py={4} borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <Breadcrumb fontSize="xs" color="gray.500">
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={NextLink} href="/therapists/discovery">Find a Therapist</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink fontWeight="bold" color="mlc.greenDark">{therapist.name}</BreadcrumbLink>
            </BreadcrumbItem>
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
                {therapist.is_accepting_new && <Badge bg="green.50" color="green.600" borderRadius="full" px={4} py={1} fontSize="xs">ACCEPTING NEW CLIENTS</Badge>}
              </HStack>
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="2xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                  {therapist.name}
                </Heading>
                <Text fontSize="xl" color="gray.600" fontWeight="500">{therapist.title || "Psychotherapist"}</Text>
              </VStack>
              <Text fontSize="lg" color="gray.500" fontStyle="italic" lineHeight="tall">
                "{therapist.headline || `Dedicated to supporting your mental health journey through evidence-based practice.`}"
              </Text>
              <HStack spacing={4} pt={4}>
                <Button as="a" href="#booking-calendar" size="lg" bg="mlc.green" color="white" borderRadius="full" px={10} _hover={{ bg: 'mlc.greenDark' }} shadow="xl">
                  Book a Consultation
                </Button>
                <Button size="lg" variant="outline" borderRadius="full" borderColor="mlc.green" color="mlc.green" leftIcon={<FiMessageCircle />}>
                  Send Inquiry
                </Button>
              </HStack>
            </VStack>
            
            <Box position="relative">
              <Box position="absolute" top="-20px" left="-20px" boxSize="100px" bg="mlc.gold" opacity="0.1" borderRadius="full" />
              <Image 
                src={therapist.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"}
                alt={`${therapist.name} - ${therapist.title}`}
                borderRadius="3xl"
                shadow="2xl"
                border="8px solid white"
              />
              <Box bg="white" p={4} borderRadius="2xl" shadow="xl" position="absolute" bottom="20px" right="-20px" border="1px solid" borderColor="gray.100">
                <HStack spacing={3}>
                  <Icon as={FiCheckCircle} color="blue.400" boxSize={6} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm">MLC Verified</Text>
                    <Text fontSize="xs" color="gray.500">Credentials Authenticated</Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 📖 Content Body */}
      <Container maxW="6xl" mt={-10}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12}>
          <Box gridColumn={{ lg: "span 2" }}>
            <VStack align="stretch" spacing={12}>
              {/* Live Availability Section */}
              <Box id="booking-calendar" p={8} bg="#F9FBFA" borderRadius="3rem" border="1px solid" borderColor="teal.50">
                <VStack align="stretch" spacing={6}>
                   <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                         <Heading size="md" color="mlc.greenDark">Reserve a Session</Heading>
                         <Text fontSize="xs" color="gray.500">Choose an available time slot below.</Text>
                      </VStack>
                      <Icon as={FiCalendar} color="mlc.green" boxSize={6} />
                   </HStack>
                   
                   {isLoadingSlots ? (
                     <Center py={10}><Spinner color="mlc.green" /></Center>
                   ) : slots.length === 0 ? (
                     <Box py={10} textAlign="center">
                        <Text color="gray.500" fontSize="sm">No public slots listed yet. Please contact MLC for direct booking.</Text>
                        <Button mt={4} variant="outline" colorScheme="teal" borderRadius="full" px={8}>Contact Support</Button>
                     </Box>
                   ) : (
                     <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        {slots.map(slot => (
                          <Button 
                            key={slot.id} 
                            variant="outline" 
                            borderColor="mlc.green" 
                            color="mlc.greenDark"
                            borderRadius="xl"
                            _hover={{ bg: "mlc.green", color: "white" }}
                            as={NextLink}
                            href={`/book?therapist=${therapist.id}&slot=${slot.id}`}
                          >
                             {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Button>
                        ))}
                     </SimpleGrid>
                   )}
                </VStack>
              </Box>

              {/* About Section */}
              <Box>
                <Heading as="h2" size="lg" mb={6} color="mlc.greenDark">About My Practice</Heading>
                <Text fontSize="md" color="gray.600" lineHeight="1.8" whiteSpace="pre-wrap">
                  {therapist.bio || "No biography provided yet."}
                </Text>
              </Box>

              {/* Focus areas */}
              <Box>
                <Heading as="h2" size="lg" mb={6} color="mlc.greenDark">Focus & Expertise</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontWeight="bold" mb={3} color="mlc.gold">Main Concerns</Text>
                    <VStack align="start" spacing={3}>
                      {(therapist.focus_areas || therapist.specialties || []).map(topic => (
                        <HStack key={topic} fontSize="sm" color="gray.600">
                          <Icon as={FiHeart} color="mlc.green" />
                          <Text>{topic}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={3} color="mlc.gold">Modalities</Text>
                    <HStack spacing={2} wrap="wrap">
                      {(therapist.modalities || []).map(m => (
                        <Badge key={m} variant="subtle" colorScheme="teal" borderRadius="full" px={3} py={1}>{m}</Badge>
                      ))}
                    </HStack>
                  </Box>
                </SimpleGrid>
              </Box>
            </VStack>
          </Box>

          {/* 🏷️ Sidebar Highlights */}
          <Box>
            <VStack align="stretch" spacing={6}>
              <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100" position="sticky" top="100px">
                <Heading size="md" mb={6} color="mlc.greenDark">Details</Heading>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiClock} color="mlc.green" />
                      <Text fontSize="sm">Experience</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700">{therapist.years_experience || "5"}+ Years</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiVideo} color="mlc.green" />
                      <Text fontSize="sm">Format</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700">Online Video</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiGlobe} color="mlc.green" />
                      <Text fontSize="sm">Languages</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700">{(therapist.languages || ["English"]).join(", ")}</Text>
                  </HStack>
                  <Divider my={4} />
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xl" fontWeight="800" color="mlc.greenDark">KD {therapist.hourly_rate || "45"}</Text>
                    <Text fontSize="xs" color="gray.500">Per individual session</Text>
                  </VStack>
                  <Button as="a" href="#booking-calendar" mt={4} size="lg" bg="mlc.gold" color="white" borderRadius="full" _hover={{ bg: 'mlc.green' }}>
                    View Schedule
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
