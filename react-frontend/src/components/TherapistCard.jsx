import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { FiClock, FiVideo, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function TherapistCard({ therapist, isMatch = false }) {
  return (
    <Box
      bg="white"
      borderRadius="24px"
      overflow="hidden"
      border="1px solid"
      borderColor={isMatch ? "mlc.green" : "gray.100"}
      boxShadow="sm"
      transition="all 0.3s ease"
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
      display="flex"
      flexDirection={{ base: "column", sm: "row" }}
      position="relative"
    >
      {isMatch && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="teal"
          borderRadius="full"
          px={3}
          py={1}
          fontSize="xs"
          zIndex={2}
        >
          Top Match
        </Badge>
      )}

      {/* Image Section */}
      <Box w={{ base: "100%", sm: "35%" }} position="relative" bg="gray.50">
        <Image
          src={therapist.profile_image_url || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400"}
          alt={therapist.name}
          w="100%"
          h="100%"
          maxH={{ base: "250px", sm: "none" }}
          objectFit="cover"
        />
      </Box>

      {/* Content Section */}
      <Box p={6} flex="1">
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="center">
            <Box>
              <HStack spacing={2} align="center">
                <Heading size="md" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
                  {therapist.name}
                </Heading>
                {therapist.is_verified && (
                  <Icon as={FiCheckCircle} color="blue.400" />
                )}
              </HStack>
              <Text fontSize="sm" color="gray.500" fontWeight="500">
                {therapist.years_experience}+ years of experience
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="lg" fontWeight="bold" color="mlc.greenDark">
                ${therapist.hourly_rate || "80"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                for {therapist.session_duration || 50} mins
              </Text>
            </Box>
          </HStack>

          <HStack spacing={2} flexWrap="wrap">
            {(therapist.specialties || therapist.concerns || []).slice(0, 3).map((s) => (
              <Badge
                key={s}
                variant="subtle"
                bg="#E9F2ED"
                color="mlc.greenDark"
                borderRadius="full"
                px={3}
                fontSize="2xs"
                textTransform="none"
              >
                {s}
              </Badge>
            ))}
          </HStack>

          <VStack align="stretch" spacing={1} mt={2}>
            <HStack spacing={2} color="gray.600">
              <Icon as={FiVideo} color="mlc.green" />
              <Text fontSize="xs">Available Online via Video</Text>
            </HStack>
            <HStack spacing={2} color="gray.600">
              <Icon as={FiClock} color="mlc.green" />
              <Text fontSize="xs">Next available: <Text as="span" fontWeight="600" color="mlc.greenDark">Today, 02:30 PM</Text></Text>
            </HStack>
            {therapist.city && (
              <HStack spacing={2} color="gray.600">
                <Icon as={FiMapPin} color="mlc.green" />
                <Text fontSize="xs">{therapist.city}</Text>
              </HStack>
            )}
          </VStack>

          <Divider my={2} />

          <HStack spacing={4}>
            <Button
              as={Link}
              to={`/therapists/${therapist.id}`}
              variant="outline"
              flex="1"
              borderRadius="full"
              fontSize="sm"
              borderColor="mlc.green"
              color="mlc.greenDark"
              _hover={{ bg: "gray.50" }}
            >
              View Profile
            </Button>
            <Button
              as={Link}
              to={`/booking?therapist=${therapist.id}`}
              flex="1"
              borderRadius="full"
              fontSize="sm"
              bg="mlc.gold"
              color="white"
              _hover={{ bg: "mlc.green" }}
            >
              Book Now
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
