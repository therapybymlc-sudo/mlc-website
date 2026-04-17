'use client'

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
  if (!therapist) return <Box p={20} textAlign="center"><Text>Therapist not found.</Text></Box>;

  // Schema.org Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Psychologist",
    "name": therapist.name,
    "description": therapist.headline || therapist.bio?.substring(0, 160),
    "image": therapist.profile_image_url,
    "jobTitle": therapist.title || "Psychotherapist",
    "knowsAbout": therapist.specialties || therapist.focus_areas,
    "knowsLanguage": therapist.languages,
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
      
      {/* 🧭 Breadcrumbs for SEO */}
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
                <Button as={NextLink} href={`/book?therapist=${therapist.id}`} size="lg" bg="mlc.green" color="white" borderRadius="full" px={10} _hover={{ bg: 'mlc.greenDark' }} shadow="xl">
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
              {/* About Section */}
              <Box>
                <Heading as="h2" size="lg" mb={6} color="mlc.greenDark">About My Practice</Heading>
                <Text fontSize="md" color="gray.600" lineHeight="1.8" whiteSpace="pre-wrap">
                  {therapist.bio || "No biography provided yet."}
                </Text>
              </Box>

              {/* Specializations for SEO */}
              <Box>
                <Heading as="h2" size="lg" mb={6} color="mlc.greenDark">Clinical Focus & Expertise</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontWeight="bold" mb={3} color="mlc.gold">Main Concerns Treated</Text>
                    <List spacing={3}>
                      {(therapist.focus_areas || therapist.specialties || []).map(topic => (
                        <ListItem key={topic} fontSize="sm" color="gray.600" display="flex" alignItems="center">
                          <ListIcon as={FiHeart} color="mlc.green" />
                          {topic}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={3} color="mlc.gold">Therapeutic Modalities</Text>
                    <Wrap spacing={2}>
                      {(therapist.modalities || []).map(m => (
                        <WrapItem key={m}>
                          <Tag variant="subtle" colorScheme="teal" borderRadius="full" px={3} py={1}>{m}</Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* FAQ Section for SEO */}
              <Box>
                <Heading as="h2" size="lg" mb={6} color="mlc.greenDark">Frequently Asked Questions</Heading>
                <Accordion allowMultiple>
                  <AccordionItem border="none" mb={4} p={2} bg="#F9FBFA" borderRadius="xl">
                    <AccordionButton _hover={{ bg: 'transparent' }}>
                      <Box flex="1" textAlign="left" fontWeight="700">What can I expect in the first session?</Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} color="gray.600" fontSize="sm">
                      The first session is an opportunity for us to explore your goals, discuss your history, and see if we are a good fit for working together. It's a safe, non-judgmental space to begin your journey.
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem border="none" mb={4} p={2} bg="#F9FBFA" borderRadius="xl">
                    <AccordionButton _hover={{ bg: 'transparent' }}>
                      <Box flex="1" textAlign="left" fontWeight="700">How long does therapy usually take?</Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} color="gray.600" fontSize="sm">
                      Every journey is unique. Some clients find short-term support helpful for specific goals, while others prefer longer-term exploratory work. We will regularly review our progress together.
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
            </VStack>
          </Box>

          {/* 🏷️ Sidebar / Highlights */}
          <Box>
            <VStack align="stretch" spacing={6}>
              <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100" position="sticky" top="100px">
                <Heading size="md" mb={6} color="mlc.greenDark">Session Details</Heading>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiClock} color="mlc.green" />
                      <Text fontSize="sm">Duration</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700">50 Minutes</Text>
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
                  <HStack justify="space-between">
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiMapPin} color="mlc.green" />
                      <Text fontSize="sm">Location</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="700">{therapist.city || "Online"}</Text>
                  </HStack>
                  <Divider my={4} />
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="2xl" fontWeight="800" color="mlc.greenDark">KD {therapist.hourly_rate || "45"}</Text>
                    <Text fontSize="xs" color="gray.500">Per individual session</Text>
                  </VStack>
                  <Button as={NextLink} href={`/book?therapist=${therapist.id}`} mt={4} size="lg" bg="mlc.gold" color="white" borderRadius="full" _hover={{ bg: 'mlc.green' }}>
                    Reserve a Slot
                  </Button>
                  <Text textAlign="center" fontSize="xs" color="gray.400" mt={2}>Secure payment via Stripe/Tap</Text>
                </VStack>
              </Box>

              <Box p={6} bg="#F2F8F5" borderRadius="3xl" textAlign="center">
                 <Icon as={FiAward} boxSize={8} color="mlc.green" mb={2} />
                 <Heading size="xs" mb={2}>{therapist.education || "Qualified Professional"}</Heading>
                 <Text fontSize="xs" color="gray.500">{therapist.experience_years}+ Years Clinical Experience</Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
