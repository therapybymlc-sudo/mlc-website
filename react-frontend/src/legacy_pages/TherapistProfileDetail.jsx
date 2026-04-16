import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Button,
  Icon,
  Badge,
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiVideo, FiClock, FiShield, FiHeart, FiGlobe } from "react-icons/fi";
import { apiGet } from "../api.js";

export default function TherapistProfileDetail() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const res = await apiGet(`therapists/${id}/`);
        setTherapist(res);
      } catch (err) {
        console.error("Error fetching therapist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapist();
  }, [id]);

  if (loading) {
    return (
      <Box pt={40} textAlign="center">
        <Spinner size="xl" color="mlc.green" />
      </Box>
    );
  }

  if (!therapist) {
    return (
      <Box pt={40} textAlign="center">
        <Heading color="gray.500">Therapist not found.</Heading>
        <Button as={Link} to="/therapists/discovery" mt={4} variant="link">Back to directory</Button>
      </Box>
    );
  }

  return (
    <Box pt={24} pb={20} bg="white">
      <Container maxW="6xl">
        {/* Breadcrumb */}
        <Breadcrumb fontSize="xs" color="gray.500" mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/therapists/discovery">Therapists</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{therapist.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12}>
          {/* Main Content */}
          <Box gridColumn={{ lg: "span 2" }}>
            <HStack spacing={6} align="start" mb={10}>
              <Image
                src={therapist.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400"}
                alt={therapist.name}
                boxSize="180px"
                borderRadius="3xl"
                objectFit="cover"
              />
              <VStack align="flex-start" spacing={1} pt={2}>
                <HStack spacing={2}>
                  <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                    {therapist.name}
                  </Heading>
                  {therapist.is_verified && <Icon as={FiCheckCircle} color="blue.400" />}
                </HStack>
                <Text fontSize="lg" fontWeight="500" color="gray.600">
                  {therapist.years_experience}+ years of experience
                </Text>
                <HStack spacing={4} mt={3}>
                  <Badge bg="mlc.sageTint" color="mlc.greenDark" px={3} py={1} borderRadius="full">
                    <HStack spacing={1}>
                      <Icon as={FiVideo} />
                      <Text fontSize="2xs">Video Session</Text>
                    </HStack>
                  </Badge>
                  {therapist.is_queer_affirmative && (
                    <Badge variant="outline" colorScheme="pink" px={3} py={1} borderRadius="full" fontSize="2xs">
                      Queer-Affirmative
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>

            <VStack align="stretch" spacing={12}>
              {/* Bio */}
              <Box>
                <Heading size="md" mb={4} color="mlc.greenDark">About Me</Heading>
                <Text color="gray.700" lineHeight="1.8" whiteSpace="pre-line">
                  {therapist.bio || "Hi there! I'm dedicated to providing a safe, ethical, and compassionate space for your healing journey."}
                </Text>
              </Box>

              {/* Concerns */}
              <Box>
                <HStack spacing={2} mb={4}>
                  <Icon as={FiHeart} color="mlc.gold" />
                  <Heading size="md" color="mlc.greenDark">Concerns I can help with</Heading>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {(therapist.concerns || therapist.specialties || ["General Wellness"]).map((c) => (
                    <HStack key={c} p={4} bg="#FBF8F3" borderRadius="2xl" border="1px solid" borderColor="mlc.gold">
                      <Icon as={FiCheckCircle} color="mlc.gold" />
                      <Text fontSize="sm" fontWeight="500">{c}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Specializations/Modalities */}
              <Box>
                <HStack spacing={2} mb={4}>
                  <Icon as={FiShield} color="mlc.green" />
                  <Heading size="md" color="mlc.greenDark">I Specialise in</Heading>
                </HStack>
                <HStack spacing={3} flexWrap="wrap">
                  {(therapist.modalities || ["CBT", "Person-Centered"]).map((m) => (
                    <Badge key={m} variant="subtle" bg="teal.50" color="teal.700" px={4} py={2} borderRadius="xl" textTransform="none">
                      {m}
                    </Badge>
                  ))}
                </HStack>
              </Box>

              {/* Languages */}
              <Box>
                <HStack spacing={2} mb={4}>
                  <Icon as={FiGlobe} color="mlc.green" />
                  <Heading size="md" color="mlc.greenDark">Languages I speak</Heading>
                </HStack>
                <HStack spacing={3}>
                  {(therapist.languages || ["English"]).map((l) => (
                    <Badge key={l} variant="outline" colorScheme="gray" px={4} py={2} borderRadius="full">
                      {l}
                    </Badge>
                  ))}
                </HStack>
              </Box>

              {/* Affiliations */}
              {therapist.affiliations && (
                <Box>
                  <Heading size="md" mb={4} color="mlc.greenDark">My Affiliations</Heading>
                  <Text color="gray.600" fontSize="sm">
                    {therapist.affiliations}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Right Sidebar: Booking & Info */}
          <Box>
            <VStack
              position="sticky"
              top="100px"
              bg="white"
              p={8}
              borderRadius="3xl"
              boxShadow="2xl"
              border="1px solid"
              borderColor="gray.100"
              align="stretch"
              spacing={6}
            >
              <Box>
                <HStack justify="space-between" align="baseline">
                  <Text fontWeight="700" fontSize="2xl" color="mlc.greenDark">
                    ${therapist.hourly_rate || "80"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">/ session</Text>
                </HStack>
                <Text fontSize="xs" color="gray.400" mt={1}>Session duration: {therapist.session_duration || 50} minutes</Text>
              </Box>

              <Box p={4} bg="mlc.sageTint" borderRadius="2xl">
                <VStack align="flex-start" spacing={1}>
                  <Text fontWeight="600" fontSize="sm" color="mlc.greenDark">Check available slots</Text>
                  <HStack color="gray.600">
                    <Icon as={FiClock} />
                    <Text fontSize="xs">Next available: <Text as="span" fontWeight="700">Today, 02:30 PM</Text></Text>
                  </HStack>
                </VStack>
              </Box>

              <Button
                as={Link}
                to={`/booking?therapist=${therapist.id}`}
                size="lg"
                bg="mlc.gold"
                color="white"
                borderRadius="full"
                _hover={{ bg: "mlc.green" }}
                fontWeight="700"
              >
                Proceed to Book
              </Button>

              <VStack spacing={4} pt={4}>
                <HStack spacing={3} w="100%">
                  <Box p={3} bg="gray.50" borderRadius="full">
                    <Icon as={FiVideo} color="mlc.green" />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="700">Online Session</Text>
                    <Text fontSize="2xs" color="gray.500">Secure video link provided</Text>
                  </Box>
                </HStack>
                <HStack spacing={3} w="100%">
                  <Box p={3} bg="gray.50" borderRadius="full">
                    <Icon as={FiHeart} color="mlc.gold" />
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="700">First Session Trial</Text>
                    <Text fontSize="2xs" color="gray.500">15 min discovery call available</Text>
                  </Box>
                </HStack>
              </VStack>

              <Divider />
              
              <Text fontSize="2xs" color="gray.400" textAlign="center">
                All MLC therapists are verified and undergo regular supervision cohort cycles.
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
