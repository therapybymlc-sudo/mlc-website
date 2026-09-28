'use client';
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
  Tag, 
  TagLabel, 
  Circle, 
  Flex,
  Wrap,
  IconButton,
} from "@chakra-ui/react";
import { 
  FiCheckCircle, 
  FiClock, 
  FiVideo, 
  FiGlobe, 
  FiMessageCircle, 
  FiCalendar,
  FiArrowRight,
  FiArrowLeft,
  FiAward,
  FiShield,
  FiMapPin,
  FiActivity,
  FiUserCheck,
  FiBriefcase,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiCheck
} from "react-icons/fi";

function formatBioParagraphs(bioText) {
  if (!bioText) return ["A dedicated mental health professional committed to providing empathetic, evidence-informed care and holding space for clinical healing and self-discovery."];
  if (bioText.includes('\n\n')) {
    return bioText.split(/\n\s*\n/).filter(Boolean);
  }
  if (bioText.includes('\n')) {
    return bioText.split('\n').filter(Boolean);
  }
  const sentences = bioText.match(/[^.!?]+[.!?]+(\s|$)/g) || [bioText];
  if (sentences.length <= 3) return [bioText];
  if (sentences.length <= 6) {
    const mid = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, mid).join('').trim(),
      sentences.slice(mid).join('').trim()
    ].filter(Boolean);
  }
  const third = Math.ceil(sentences.length / 3);
  return [
    sentences.slice(0, third).join('').trim(),
    sentences.slice(third, third * 2).join('').trim(),
    sentences.slice(third * 2).join('').trim()
  ].filter(Boolean);
}

function toLocalDateKey(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
        } catch (err) { 
          console.error("Profile fallback failed", err); 
        } finally { 
          setIsLoadingProfile(false); 
        }
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

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0..3 (4 weeks)

  useEffect(() => {
    // Extract unique days that actually have slots
    const uniqueDates = [...new Set(slots.map(s => toLocalDateKey(s.start_time)).filter(Boolean))];
    setAvailableDates(uniqueDates);
    // Auto-select first available date if not already selected
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
      const firstDate = new Date(uniqueDates[0]);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      firstDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((firstDate - todayDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 7) {
        setCurrentWeekOffset(Math.min(3, Math.floor(diffDays / 7)));
      }
    }
  }, [slots]);

  const slotsForSelectedDate = slots.filter(s => {
    if (!selectedDate) return false;
    return toLocalDateKey(s.start_time) === selectedDate;
  });

  // Compact Week Logic: 7 days for the active week view
  const visibleDays = React.useMemo(() => {
    const baseDate = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(baseDate.getDate() + (currentWeekOffset * 7) + i);
      return d;
    });
  }, [currentWeekOffset]);

  if (!isMounted) return <Box h="100vh" bg="#FDFBFA" />;
  
  if (isLoadingProfile) {
    return (
      <Center p={20} h="60vh" bg="#FDFBFA">
        <VStack spacing={4}>
          <Spinner size="xl" thickness="3px" speed="0.7s" color="#56756D" />
          <Text fontSize="14px" fontWeight="600" color="rgba(46,46,46,0.7)">
            Retrieving specialist credentials...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!profile) {
    return (
      <Box p={20} textAlign="center" bg="#FDFBFA" minH="70vh">
        <VStack spacing={4} maxW="md" mx="auto" pt={16}>
          <Icon as={FiHelpCircle} boxSize={12} color="#56756D" />
          <Heading size="md" color="#263A33" fontFamily="'Playfair Display', serif">
            Specialist Profile Syncing
          </Heading>
          <Text fontSize="13.5px" color="rgba(46,46,46,0.65)">
            We couldn't retrieve this clinical profile right now. The record may be updating.
          </Text>
          <Button as={Link} href="/therapists/directory" variant="outline" borderRadius="full" px={6} fontSize="13px" borderColor="rgba(86,117,109,0.3)">
            Return to Directory
          </Button>
        </VStack>
      </Box>
    );
  }

  const isSupervisor = Boolean(profile.is_supervisor || profile.is_supervisor_licensed || profile.supervision_status === 'approved');
  const directoryHref = isSupervisor ? "/therapists/supervisors/directory" : "/therapists/directory";
  const directoryLabel = isSupervisor ? "Supervisors" : "Specialists";
  
  // Clean specialties and modalities arrays
  const specialtiesList = Array.isArray(profile.specialties) ? profile.specialties : [];
  const concernsList = Array.isArray(profile.concerns) ? profile.concerns : [];
  const allExpertise = [...new Set([...specialtiesList, ...concernsList])];

  const modalitiesList = Array.isArray(profile.modalities) 
    ? profile.modalities 
    : (Array.isArray(profile.modality) 
        ? profile.modality 
        : (profile.modality ? [profile.modality] : []));

  const languagesList = Array.isArray(profile.languages) ? profile.languages : ["English", "Hindi"];

  return (
    <Box bg="#FDFBFA" minH="100vh" pb={20}>
      <Script 
        id="therapist-schema" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify({ 
            "@context": "https://schema.org", 
            "@type": isSupervisor ? "EducationalOrganization" : "Psychologist", 
            "name": profile.name,
            "description": profile.bio || profile.headline,
            "image": profile.profile_image_url
          }) 
        }} 
      />
      
      {/* 🧭 BREADCRUMBS & TOP NAV */}
      <Box bg="white" borderBottom="1px solid" borderColor="rgba(86,117,109,0.1)" py={3}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center">
            <Breadcrumb fontSize="12px" color="rgba(46,46,46,0.6)">
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href="/" _hover={{ color: "#263A33" }}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} href={directoryHref} _hover={{ color: "#263A33" }}>{directoryLabel}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink fontWeight="700" color="#263A33">{profile.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Button 
              as={Link} 
              href={directoryHref} 
              size="xs" 
              variant="ghost" 
              color="#56756D" 
              fontSize="12px"
              fontWeight="600"
              leftIcon={<FiArrowLeft />}
              _hover={{ bg: "rgba(169,203,183,0.12)", color: "#263A33" }}
            >
              Back to {directoryLabel}
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* 🌿 HERO SHOWCASE CARD */}
      <Container maxW="6xl" px={{ base: 4, md: 6 }} pt={{ base: 5, md: 6 }} pb={{ base: 6, md: 8 }}>
        <Box 
          bg="white" 
          borderRadius="24px" 
          p={{ base: 5, md: 7, lg: 8 }} 
          border="1px solid" 
          borderColor="rgba(86,117,109,0.14)" 
          shadow="0 8px 30px -4px rgba(38,58,51,0.05)"
        >
          <Flex 
            direction={{ base: "column-reverse", lg: "row" }} 
            gap={{ base: 6, lg: 8 }} 
            align={{ base: "stretch", lg: "center" }} 
            justify="space-between"
          >
            {/* Left Content Column */}
            <VStack align="start" spacing={4} flex="1">
              {/* Badges Row */}
              <Wrap spacing={2}>
                <Badge 
                  bg="rgba(86,117,109,0.08)" 
                  color="#263A33" 
                  borderRadius="full" 
                  px={3} 
                  py={1} 
                  fontSize="10.5px" 
                  fontWeight="700" 
                  letterSpacing="0.04em"
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                >
                  <Icon as={FiCheckCircle} color="blue.500" boxSize="11px" />
                  VERIFIED CLINICIAN
                </Badge>

                {isSupervisor && (
                  <Badge 
                    bg="rgba(201,169,96,0.18)" 
                    color="#8C6E2D" 
                    border="1px solid rgba(201,169,96,0.35)" 
                    borderRadius="full" 
                    px={3} 
                    py={1} 
                    fontSize="10.5px" 
                    fontWeight="800"
                    letterSpacing="0.04em"
                  >
                    CLINICAL SUPERVISOR
                  </Badge>
                )}

                {profile.is_accepting_new !== false && (
                  <Badge 
                    bg="green.50" 
                    color="green.700" 
                    border="1px solid rgba(72,187,120,0.3)" 
                    borderRadius="full" 
                    px={3} 
                    py={1} 
                    fontSize="10.5px" 
                    fontWeight="700"
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                  >
                    <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
                    ACCEPTING CLIENTS
                  </Badge>
                )}
              </Wrap>

              {/* Specialist Name & Title */}
              <VStack align="start" spacing={1}>
                <Heading 
                  as="h1" 
                  fontSize={{ base: "26px", md: "34px", lg: "38px" }} 
                  color="#263A33" 
                  fontFamily="'Playfair Display', serif" 
                  lineHeight="1.15"
                  fontWeight="600"
                >
                  {profile.name}
                </Heading>
                <Text fontSize={{ base: "14px", md: "15.5px" }} color="#56756D" fontWeight="600">
                  {profile.title || "Psychotherapist"}
                  {isSupervisor && " • Clinical Supervisor"}
                  {profile.affiliations && ` (${profile.affiliations})`}
                </Text>
              </VStack>

              {/* Headline / Clinical Philosophy */}
              {profile.headline && (
                <Box pl={3.5} py={0.5} borderLeft="3px solid" borderColor="rgba(201,169,96,0.8)">
                  <Text fontSize="13.5px" color="rgba(46,46,46,0.75)" fontStyle="italic" lineHeight="1.6">
                    "{profile.headline}"
                  </Text>
                </Box>
              )}

              {/* At A Glance Quick Spec Pills */}
              <Wrap spacing={2.5} pt={1}>
                <HStack spacing={1.5} bg="rgba(86,117,109,0.06)" px={3} py={1.5} borderRadius="full" fontSize="12px" color="#263A33">
                  <Icon as={FiAward} color="#56756D" boxSize="13px" />
                  <Text fontWeight="600">{profile.years_experience || 0}+ Years Practice</Text>
                </HStack>

                <HStack spacing={1.5} bg="rgba(86,117,109,0.06)" px={3} py={1.5} borderRadius="full" fontSize="12px" color="#263A33">
                  <Icon as={FiGlobe} color="#56756D" boxSize="13px" />
                  <Text fontWeight="600">{languagesList.join(", ")}</Text>
                </HStack>

                <HStack spacing={1.5} bg="rgba(86,117,109,0.06)" px={3} py={1.5} borderRadius="full" fontSize="12px" color="#263A33">
                  <Icon as={FiVideo} color="#56756D" boxSize="13px" />
                  <Text fontWeight="600">Video & Online Sessions</Text>
                </HStack>

                {profile.city && (
                  <HStack spacing={1.5} bg="rgba(86,117,109,0.06)" px={3} py={1.5} borderRadius="full" fontSize="12px" color="#263A33">
                    <Icon as={FiMapPin} color="#56756D" boxSize="13px" />
                    <Text fontWeight="600">{profile.city}</Text>
                  </HStack>
                )}
              </Wrap>

              {/* Primary Call To Actions */}
              <HStack spacing={3} pt={2}>
                <Button 
                  as="a" 
                  href="#booking-calendar" 
                  h="38px" 
                  px={6} 
                  bg="#56756D" 
                  color="white" 
                  borderRadius="full" 
                  fontSize="12.5px" 
                  fontWeight="600" 
                  rightIcon={<FiCalendar boxSize="12px" />}
                  _hover={{ bg: "#425C55", shadow: "0 6px 16px rgba(86,117,109,0.25)" }}
                  transition="all 0.2s ease"
                >
                  {isSupervisor ? "Book Session / Supervision" : "Book a Session"}
                </Button>

                <Button 
                  as={Link} 
                  href="/contactus" 
                  h="38px" 
                  px={5} 
                  variant="outline" 
                  borderColor="rgba(86,117,109,0.3)" 
                  color="#263A33" 
                  borderRadius="full" 
                  fontSize="12.5px" 
                  fontWeight="600" 
                  leftIcon={<FiMessageCircle boxSize="12px" />}
                  _hover={{ bg: "rgba(169,203,183,0.12)", borderColor: "#56756D" }}
                >
                  Inquire
                </Button>
              </HStack>
            </VStack>

            {/* Right Portrait Frame (Proportioned & Cleanly Sized) */}
            <Box 
              flexShrink={0} 
              w={{ base: "full", sm: "260px", md: "250px", lg: "270px" }}
              alignSelf={{ base: "center", lg: "stretch" }}
            >
              <Box 
                position="relative" 
                w="full" 
                h={{ base: "260px", md: "290px", lg: "310px" }} 
                borderRadius="20px" 
                overflow="hidden" 
                shadow="sm" 
                border="1px solid" 
                borderColor="rgba(86,117,109,0.18)"
              >
                <Image 
                  src={profile.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600"} 
                  alt={profile.name}
                  w="full" 
                  h="full" 
                  objectFit="cover" 
                />
                <Box 
                  position="absolute" 
                  inset={0} 
                  bgGradient="linear(to-t, rgba(38,58,51,0.45) 0%, transparent 50%)" 
                />
                
                {/* Floating Bottom Badge */}
                <HStack 
                  position="absolute" 
                  bottom={3} 
                  left={3} 
                  right={3} 
                  justify="center" 
                  bg="rgba(255,255,255,0.92)" 
                  backdropFilter="blur(8px)" 
                  py={1.5} 
                  px={3} 
                  borderRadius="full" 
                  shadow="xs"
                >
                  <Icon as={FiShield} color="#56756D" boxSize="12px" />
                  <Text fontSize="10.5px" fontWeight="700" color="#263A33" letterSpacing="0.04em">
                    {isSupervisor ? "BOARD APPROVED SUPERVISOR" : "LICENSED CLINICAL ASSOCIATE"}
                  </Text>
                </HStack>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Container>

      {/* 📖 MAIN PROFILE CONTENT & BOOKING SECTION */}
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 6, lg: 8 }} alignItems="start">
          
          {/* LEFT COLUMN: Practice Info, Specialties, Supervision, and Session Safeguards */}
          <Box gridColumn={{ lg: "span 7" }}>
            <VStack align="stretch" spacing={6}>
              
              {/* 1. About My Practice Card */}
              <Box 
                bg="white" 
                p={{ base: 5, md: 6 }} 
                borderRadius="20px" 
                border="1px solid" 
                borderColor="rgba(86,117,109,0.12)" 
                shadow="xs"
              >
                <VStack align="start" spacing={4} w="full">
                  <HStack spacing={2.5}>
                    <Circle size="32px" bg="rgba(86,117,109,0.08)">
                      <Icon as={FiUserCheck} color="#56756D" boxSize="16px" />
                    </Circle>
                    <Heading size="sm" color="#263A33" fontFamily="'Playfair Display', serif" fontSize="18px">
                      About My Practice
                    </Heading>
                  </HStack>

                  <VStack align="start" spacing={3.5} w="full">
                    {formatBioParagraphs(profile.bio).map((paragraph, idx) => (
                      <Text key={idx} color="rgba(46,46,46,0.82)" fontSize="13.5px" lineHeight="1.75">
                        {paragraph}
                      </Text>
                    ))}
                  </VStack>

                  {/* Supervisory Approach if supervisor */}
                  {isSupervisor && profile.supervision_bio && (
                    <Box 
                      mt={2} 
                      p={4} 
                      bg="rgba(201,169,96,0.06)" 
                      borderRadius="14px" 
                      border="1px solid" 
                      borderColor="rgba(201,169,96,0.25)" 
                      w="full"
                    >
                      <HStack spacing={2} mb={1.5}>
                        <Icon as={FiAward} color="#8C6E2D" boxSize="14px" />
                        <Text fontSize="12px" fontWeight="700" color="#8C6E2D" textTransform="uppercase" letterSpacing="0.05em">
                          Supervisory Philosophy & Approach
                        </Text>
                      </HStack>
                      <Text fontSize="13px" color="rgba(46,46,46,0.78)" lineHeight="1.65">
                        {profile.supervision_bio}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>

              {/* 2. Clinical Expertise & Modalities Card */}
              {(allExpertise.length > 0 || modalitiesList.length > 0) && (
                <Box 
                  bg="white" 
                  p={{ base: 5, md: 6 }} 
                  borderRadius="20px" 
                  border="1px solid" 
                  borderColor="rgba(86,117,109,0.12)" 
                  shadow="xs"
                >
                  <VStack align="start" spacing={4} w="full">
                    {allExpertise.length > 0 && (
                      <VStack align="start" spacing={2.5} w="full">
                        <HStack spacing={2}>
                          <Icon as={FiActivity} color="#56756D" boxSize="15px" />
                          <Heading size="xs" color="#263A33" textTransform="uppercase" letterSpacing="0.06em" fontWeight="700">
                            Areas of Clinical Focus & Concerns
                          </Heading>
                        </HStack>
                        <Wrap spacing={2}>
                          {allExpertise.map(e => (
                            <Tag 
                              key={e} 
                              size="sm" 
                              variant="subtle" 
                              bg="rgba(86,117,109,0.08)" 
                              color="#263A33" 
                              borderRadius="full" 
                              px={3} 
                              py={1}
                            >
                              <TagLabel fontSize="11.5px" fontWeight="600">{e}</TagLabel>
                            </Tag>
                          ))}
                        </Wrap>
                      </VStack>
                    )}

                    {modalitiesList.length > 0 && (
                      <>
                        <Divider borderColor="rgba(86,117,109,0.08)" />
                        <VStack align="start" spacing={2.5} w="full">
                          <HStack spacing={2}>
                            <Icon as={FiShield} color="#56756D" boxSize="15px" />
                            <Heading size="xs" color="#263A33" textTransform="uppercase" letterSpacing="0.06em" fontWeight="700">
                              Therapeutic Approaches & Modalities
                            </Heading>
                          </HStack>
                          <Wrap spacing={2}>
                            {modalitiesList.map(m => (
                              <Tag 
                                key={m} 
                                size="sm" 
                                variant="outline" 
                                borderColor="rgba(86,117,109,0.25)" 
                                color="#263A33" 
                                borderRadius="full" 
                                px={3} 
                                py={1}
                              >
                                <TagLabel fontSize="11.5px" fontWeight="600">{m}</TagLabel>
                              </Tag>
                            ))}
                          </Wrap>
                        </VStack>
                      </>
                    )}

                    {/* Supervision Areas if Supervisor */}
                    {isSupervisor && Array.isArray(profile.supervision_areas) && profile.supervision_areas.length > 0 && (
                      <>
                        <Divider borderColor="rgba(86,117,109,0.08)" />
                        <VStack align="start" spacing={2.5} w="full">
                          <HStack spacing={2}>
                            <Icon as={FiBriefcase} color="#8C6E2D" boxSize="15px" />
                            <Heading size="xs" color="#8C6E2D" textTransform="uppercase" letterSpacing="0.06em" fontWeight="700">
                              Supervision Focus Areas
                            </Heading>
                          </HStack>
                          <Wrap spacing={2}>
                            {profile.supervision_areas.map(sa => (
                              <Tag 
                                key={sa} 
                                size="sm" 
                                bg="rgba(201,169,96,0.12)" 
                                color="#8C6E2D" 
                                borderRadius="full" 
                                px={3} 
                                py={1}
                              >
                                <TagLabel fontSize="11.5px" fontWeight="700">{sa}</TagLabel>
                              </Tag>
                            ))}
                          </Wrap>
                        </VStack>
                      </>
                    )}
                  </VStack>
                </Box>
              )}

              {/* 3. What to Expect & Clinical Safeguards Card */}
              <Box 
                bg="white" 
                p={{ base: 5, md: 6 }} 
                borderRadius="20px" 
                border="1px solid" 
                borderColor="rgba(86,117,109,0.12)" 
                shadow="xs"
              >
                <VStack align="start" spacing={4} w="full">
                  <HStack spacing={2.5}>
                    <Circle size="32px" bg="rgba(86,117,109,0.08)">
                      <Icon as={FiShield} color="#56756D" boxSize="16px" />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Heading size="sm" color="#263A33" fontFamily="'Playfair Display', serif" fontSize="17px">
                        What to Expect in Your Sessions
                      </Heading>
                      <Text fontSize="12px" color="rgba(46,46,46,0.6)">
                        A collaborative, client-led framework focused on safety and real progress
                      </Text>
                    </VStack>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} w="full" pt={1}>
                    <Box p={3.5} bg="rgba(86,117,109,0.03)" borderRadius="12px" border="1px solid" borderColor="rgba(86,117,109,0.08)">
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiCheck} color="#56756D" boxSize="14px" />
                        <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                          Initial Discovery
                        </Text>
                      </HStack>
                      <Text fontSize="11.5px" color="rgba(46,46,46,0.7)" lineHeight="1.5">
                        Exploring your history, immediate concerns, and outlining achievable therapeutic goals together.
                      </Text>
                    </Box>

                    <Box p={3.5} bg="rgba(86,117,109,0.03)" borderRadius="12px" border="1px solid" borderColor="rgba(86,117,109,0.08)">
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiCheck} color="#56756D" boxSize="14px" />
                        <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                          Tailored Modalities
                        </Text>
                      </HStack>
                      <Text fontSize="11.5px" color="rgba(46,46,46,0.7)" lineHeight="1.5">
                        Evidence-informed interventions structured around your learning and reflection pace.
                      </Text>
                    </Box>

                    <Box p={3.5} bg="rgba(86,117,109,0.03)" borderRadius="12px" border="1px solid" borderColor="rgba(86,117,109,0.08)">
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiCheck} color="#56756D" boxSize="14px" />
                        <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                          Confidential & Secure
                        </Text>
                      </HStack>
                      <Text fontSize="11.5px" color="rgba(46,46,46,0.7)" lineHeight="1.5">
                        High-standard telehealth security ensuring your conversations and clinical notes stay strictly private.
                      </Text>
                    </Box>

                    <Box p={3.5} bg="rgba(86,117,109,0.03)" borderRadius="12px" border="1px solid" borderColor="rgba(86,117,109,0.08)">
                      <HStack spacing={2} mb={1}>
                        <Icon as={FiCheck} color="#56756D" boxSize="14px" />
                        <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                          Collaborative Reviews
                        </Text>
                      </HStack>
                      <Text fontSize="11.5px" color="rgba(46,46,46,0.7)" lineHeight="1.5">
                        Ongoing progress check-ins to calibrate coping strategies, emotional growth, and session frequency.
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>

            </VStack>
          </Box>

          {/* RIGHT COLUMN: Sticky Reservation & Fee Hub */}
          <Box gridColumn={{ lg: "span 5" }}>
            <Box 
              id="booking-calendar" 
              bg="white" 
              p={{ base: 5, md: 6 }} 
              borderRadius="20px" 
              border="1px solid" 
              borderColor="rgba(86,117,109,0.14)" 
              shadow="0 8px 30px -4px rgba(38,58,51,0.06)"
              position={{ lg: "sticky" }}
              top={{ lg: "85px" }}
            >
              <VStack align="stretch" spacing={5}>
                
                {/* 1. Header & Fee Structure */}
                <Box>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Heading size="xs" color="#263A33" textTransform="uppercase" letterSpacing="0.08em" fontWeight="800">
                      Session & Fee Structure
                    </Heading>
                    <HStack spacing={1.5} fontSize="11px" color="#56756D" bg="rgba(86,117,109,0.08)" px={2.5} py={0.5} borderRadius="full">
                      <Box w="6px" h="6px" borderRadius="full" bg="#56756D" />
                      <Text fontWeight="700">Online Intake</Text>
                    </HStack>
                  </Flex>

                  {/* Rates */}
                  <VStack align="stretch" spacing={2} bg="rgba(86,117,109,0.03)" p={3.5} borderRadius="14px" border="1px solid" borderColor="rgba(86,117,109,0.08)">
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="13px" fontWeight="700" color="#263A33">Individual Therapy</Text>
                        <Text fontSize="11px" color="gray.500">{profile.session_duration || 50}-60 minute consultation</Text>
                      </VStack>
                      <Text fontSize="16px" fontWeight="800" color="#263A33">
                        ₹{profile.hourly_rate || "1200"}
                        <Text as="span" fontSize="11px" fontWeight="500" color="gray.500">/hr</Text>
                      </Text>
                    </Flex>

                    {isSupervisor && (
                      <>
                        <Divider borderColor="rgba(86,117,109,0.1)" />
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="13px" fontWeight="700" color="#8C6E2D">Clinical Supervision</Text>
                            <Text fontSize="11px" color="gray.500">60 minute mentorship & case review</Text>
                          </VStack>
                          <Text fontSize="16px" fontWeight="800" color="#8C6E2D">
                            ₹{profile.supervision_hourly_rate || profile.hourly_rate || "1500"}
                            <Text as="span" fontSize="11px" fontWeight="500" color="gray.500">/hr</Text>
                          </Text>
                        </Flex>
                      </>
                    )}
                  </VStack>
                </Box>

                <Divider borderColor="rgba(86,117,109,0.1)" />

                {/* 2. Select Date (7-Day Compact Week Strip with Controls) */}
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="13px" fontWeight="700" color="#263A33">
                        Select Appointment Date
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        {visibleDays[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {visibleDays[6]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </VStack>

                    {/* Week Pagination Controls */}
                    <HStack spacing={1}>
                      <IconButton 
                        icon={<FiChevronLeft />} 
                        size="xs" 
                        variant="outline" 
                        borderColor="rgba(86,117,109,0.25)" 
                        color="#263A33" 
                        isDisabled={currentWeekOffset === 0}
                        onClick={() => setCurrentWeekOffset(prev => Math.max(0, prev - 1))}
                        aria-label="Previous week"
                        _hover={{ bg: "rgba(86,117,109,0.08)" }}
                      />
                      <Text fontSize="10.5px" fontWeight="700" color="#56756D" px={1}>
                        W{currentWeekOffset + 1}/4
                      </Text>
                      <IconButton 
                        icon={<FiChevronRight />} 
                        size="xs" 
                        variant="outline" 
                        borderColor="rgba(86,117,109,0.25)" 
                        color="#263A33" 
                        isDisabled={currentWeekOffset >= 3}
                        onClick={() => setCurrentWeekOffset(prev => Math.min(3, prev + 1))}
                        aria-label="Next week"
                        _hover={{ bg: "rgba(86,117,109,0.08)" }}
                      />
                    </HStack>
                  </Flex>

                  {/* 7-Day Day Selector Buttons */}
                  <SimpleGrid columns={7} spacing={1.5}>
                    {visibleDays.map((day, idx) => {
                      const dateStr = toLocalDateKey(day);
                      const isAvailable = availableDates.includes(dateStr);
                      const isSelected = selectedDate === dateStr;
                      const dayShort = day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
                      const dayNum = day.getDate();

                      return (
                        <VStack 
                          key={idx} 
                          py={2} 
                          px={1}
                          borderRadius="10px" 
                          transition="all 0.15s ease"
                          cursor={isAvailable ? "pointer" : "default"}
                          bg={isSelected ? "#56756D" : isAvailable ? "rgba(86,117,109,0.06)" : "transparent"}
                          color={isSelected ? "white" : isAvailable ? "#263A33" : "gray.300"}
                          border="1px solid" 
                          borderColor={isSelected ? "#56756D" : isAvailable ? "rgba(86,117,109,0.25)" : "gray.100"}
                          _hover={isAvailable ? { transform: 'translateY(-1px)', borderColor: '#56756D' } : {}}
                          onClick={() => isAvailable && setSelectedDate(dateStr)}
                          spacing={0.5}
                          opacity={isAvailable ? 1 : 0.45}
                        >
                          <Text fontSize="9px" fontWeight="700" letterSpacing="0.02em">
                            {dayShort.toUpperCase()}
                          </Text>
                          <Text fontSize="13px" fontWeight="800">
                            {dayNum}
                          </Text>
                          <Box 
                            w="4px" 
                            h="4px" 
                            borderRadius="full" 
                            bg={isSelected ? "white" : isAvailable ? "#56756D" : "transparent"} 
                            mt={0.5} 
                          />
                        </VStack>
                      );
                    })}
                  </SimpleGrid>

                  <Flex justify="flex-end" align="center" fontSize="10.5px" color="gray.500">
                    <HStack spacing={1}>
                      <Box w="6px" h="6px" borderRadius="full" bg="#56756D" />
                      <Text>Available Date</Text>
                    </HStack>
                  </Flex>
                </VStack>

                <Divider borderColor="rgba(86,117,109,0.1)" />

                {/* 3. Available Time Slots for Selected Date */}
                <VStack align="stretch" spacing={2.5}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                      {selectedDate 
                        ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
                        : "Select a Date"}
                    </Text>
                    {selectedDate && (
                      <Badge size="sm" borderRadius="full" px={2} py={0.5} bg="rgba(86,117,109,0.08)" color="#56756D" fontSize="10.5px">
                        {slotsForSelectedDate.length} {slotsForSelectedDate.length === 1 ? "Slot" : "Slots"}
                      </Badge>
                    )}
                  </Flex>

                  {isLoadingSlots ? (
                    <Center py={6}>
                      <Spinner size="sm" color="#56756D" />
                    </Center>
                  ) : selectedDate ? (
                    slotsForSelectedDate.length > 0 ? (
                      <SimpleGrid columns={3} spacing={2} maxH="220px" overflowY="auto" pr={1}>
                        {slotsForSelectedDate.map(slot => (
                          <Button
                            key={slot.id} 
                            variant="outline" 
                            size="sm"
                            h="34px" 
                            borderColor="rgba(86,117,109,0.3)" 
                            borderRadius="10px" 
                            fontSize="11.5px"
                            fontWeight="700" 
                            color="#263A33"
                            _hover={{ bg: '#56756D', color: 'white', borderColor: '#56756D' }}
                            onClick={() => window.location.href = `/book/checkout?therapist=${profile.id}&slot=${slot.id}`}
                            transition="all 0.15s ease"
                            px={1}
                          >
                            {new Date(slot.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </Button>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Center p={4} bg="gray.50" borderRadius="12px" border="1px dashed" borderColor="gray.200">
                        <Text color="gray.500" fontSize="11.5px" textAlign="center">
                          No slots on this day. Please pick an adjacent highlighted date.
                        </Text>
                      </Center>
                    )
                  ) : (
                    <Center p={4} bg="gray.50" borderRadius="12px" border="1px dashed" borderColor="gray.200">
                      <Text color="gray.500" fontSize="11.5px" textAlign="center">
                        Please click any highlighted date above to see available times.
                      </Text>
                    </Center>
                  )}
                </VStack>

                <Divider borderColor="rgba(86,117,109,0.1)" />

                {/* 4. Trust Badges & Clinical Safeguards Checklist */}
                <VStack align="stretch" spacing={2} fontSize="11.5px" color="gray.600">
                  <HStack spacing={2}>
                    <Icon as={FiVideo} color="#56756D" boxSize="12px" flexShrink={0} />
                    <Text>100% Confidential Telehealth Session</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="#56756D" boxSize="12px" flexShrink={0} />
                    <Text>Flexible Online Rescheduling (24h Notice)</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="#56756D" boxSize="12px" flexShrink={0} />
                    <Text>Verified Professional Credentials</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiShield} color="#56756D" boxSize="12px" flexShrink={0} />
                    <Text>Strict Clinical Safety & Ethics Standards</Text>
                  </HStack>
                </VStack>

                {/* Intake Support Note */}
                <Text fontSize="10.5px" color="gray.500" textAlign="center" pt={1}>
                  Have intake questions? <Link href="/contactus" style={{ textDecoration: 'underline', color: '#56756D', fontWeight: '600' }}>Contact Support</Link>
                </Text>

              </VStack>
            </Box>
          </Box>

        </SimpleGrid>
      </Container>
    </Box>
  );
}
