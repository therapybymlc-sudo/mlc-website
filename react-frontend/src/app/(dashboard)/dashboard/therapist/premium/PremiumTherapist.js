'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Tag,
  Icon,
} from "@chakra-ui/react";
import { FiTarget, FiZap, FiBook, FiActivity, FiMessageCircle, FiHeart } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import PremiumPreReleaseForm from "../../../../../components/PremiumPreReleaseForm";

export default function PremiumTherapist() {
  const { isPremium, isTherapistPremium, therapistProfile } = useAuth();
  const unlocked = isPremium || isTherapistPremium || therapistProfile?.is_premium;

  const scrollToWaitlist = () => {
    document.getElementById('premium-pre-release')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box maxW="1100px" mx="auto">
      <Box
        bg="linear-gradient(135deg, #120F1B 0%, #2B223B 60%, #3A2C4A 100%)"
        color="white"
        p={{ base: 8, md: 16 }}
        borderRadius="4xl"
        shadow="2xl"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-10%"
          right="-5%"
          w="350px"
          h="350px"
          bg="rgba(169, 203, 183, 0.15)"
          borderRadius="full"
          filter="blur(100px)"
        />

        <VStack align="start" spacing={12} position="relative" zIndex={1}>
          <HStack justify="space-between" w="100%" flexWrap="wrap" spacing={6}>
            <Box maxW="2xl">
              <HStack spacing={2} mb={6} flexWrap="wrap">
                <Tag
                  bg="#A9CBB7"
                  color="#120F1B"
                  borderRadius="full"
                  px={4}
                  py={1}
                  fontSize="xs"
                  fontWeight="800"
                  letterSpacing="widest"
                >
                  THERAPIST PREMIUM
                </Tag>
                {!unlocked && (
                  <Tag colorScheme="orange" borderRadius="full" px={4} py={1} fontSize="xs" fontWeight="800">
                    COMING SOON
                  </Tag>
                )}
              </HStack>
              <Heading size="3xl" fontFamily="'Playfair Display', serif" mb={6}>
                The Therapist OS
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall">
                Your unified clinical command center — assessments, resources, private messaging,
                and self-care tools designed for practitioners who want depth without burnout.
              </Text>
            </Box>

            <Box textAlign={{ base: "left", md: "right" }}>
              {unlocked ? (
                <Button
                  bg="white"
                  color="black"
                  borderRadius="full"
                  px={10}
                  h={14}
                  _hover={{ transform: 'scale(1.05)' }}
                >
                  Premium Activated
                </Button>
              ) : (
                <VStack align={{ base: "start", md: "end" }} spacing={2}>
                  <Button
                    bg="#C9A960"
                    color="black"
                    borderRadius="full"
                    px={10}
                    h={14}
                    _hover={{ bg: "#E3C77B", transform: 'scale(1.05)' }}
                    onClick={scrollToWaitlist}
                  >
                    Join pre-release list
                  </Button>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    Major launch discount for early registrants.
                  </Text>
                </VStack>
              )}
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
            <FeatureCard
              icon={FiZap}
              title="25+ Screening Assessments"
              description="Assign, track, and visualize over 25 clinical screening tools with automated scoring and progress insights."
            />
            <FeatureCard
              icon={FiBook}
              title="200+ Therapist Resources"
              description="A curated vault of worksheets, exercises, psychoeducation, and audio tools built for real clinical practice."
            />
            <FeatureCard
              icon={FiHeart}
              title="Therapist Self-Care Checks"
              description="Burnout-aware wellness prompts and self-care rituals so you can sustain the work you do for others."
            />
            <FeatureCard
              icon={FiMessageCircle}
              title="Private In-Platform Chat"
              description="Complete chat with full privacy — you never have to share your personal number with a client again."
            />
            <FeatureCard
              icon={FiActivity}
              title="Client Journey Hub"
              description="Goals, journal intensity, and shared resources in one calm clinical snapshot."
            />
            <FeatureCard
              icon={FiTarget}
              title="Practice Growth Suite"
              description="Advanced analytics, priority discovery visibility, and automation for follow-ups and retention."
            />
          </SimpleGrid>
        </VStack>
      </Box>

      {!unlocked && (
        <Box mt={12}>
          <PremiumPreReleaseForm audience="therapist" id="premium-pre-release" />
        </Box>
      )}
    </Box>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Box
      bg="rgba(255,255,255,0.04)"
      p={8}
      borderRadius="4xl"
      border="1px solid"
      borderColor="rgba(255,255,255,0.08)"
    >
      <Icon as={icon} boxSize={8} color="#A9CBB7" mb={6} />
      <Heading size="md" mb={4} color="white">
        {title}
      </Heading>
      <Text color="whiteAlpha.700" lineHeight="tall">
        {description}
      </Text>
    </Box>
  );
}
