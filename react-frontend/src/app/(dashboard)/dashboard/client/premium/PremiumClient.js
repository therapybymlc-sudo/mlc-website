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
  Circle,
  Badge,
} from "@chakra-ui/react";
import { FiStar, FiCloud, FiActivity, FiBook, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import PremiumPreReleaseForm from "../../../../../components/PremiumPreReleaseForm";

export default function PremiumClient() {
  const { isPremium } = useAuth();

  const scrollToWaitlist = () => {
    document.getElementById('premium-pre-release')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box maxW="1100px" mx="auto" pb={16} fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* 🌿 Main Hero Banner */}
      <Box
        bg="linear-gradient(135deg, #1A2823 0%, #263A33 55%, #2F453D 100%)"
        color="white"
        p={{ base: 6, sm: 8, md: 12 }}
        borderRadius="3xl"
        boxShadow="0 16px 40px -8px rgba(26, 40, 35, 0.25)"
        position="relative"
        overflow="hidden"
        border="1px solid rgba(169, 203, 183, 0.15)"
      >
        {/* Ambient Subtle Glow */}
        <Box
          position="absolute"
          top="-15%"
          right="-5%"
          w="380px"
          h="380px"
          bg="radial-gradient(circle, rgba(169, 203, 183, 0.12) 0%, transparent 70%)"
          borderRadius="full"
          pointerEvents="none"
        />

        <VStack align="start" spacing={8} position="relative" zIndex={1}>
          {/* Top Row: Title, Copy & CTA */}
          <HStack justify="space-between" w="100%" flexWrap="wrap" spacing={6} align="start">
            <Box maxW="2xl">
              <HStack spacing={2.5} mb={4} flexWrap="wrap">
                <Badge
                  bg="rgba(169, 203, 183, 0.15)"
                  color="#A9CBB7"
                  border="1px solid"
                  borderColor="rgba(169, 203, 183, 0.3)"
                  borderRadius="full"
                  px={3}
                  py={0.8}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  PREMIUM STUDIO
                </Badge>
                {!isPremium && (
                  <Badge 
                    bg="rgba(255, 255, 255, 0.1)"
                    color="white"
                    border="1px solid"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    borderRadius="full" 
                    px={3} 
                    py={0.8} 
                    fontSize="10px" 
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    COMING SOON
                  </Badge>
                )}
              </HStack>

              <Heading 
                fontSize={{ base: "26px", md: "34px" }} 
                fontWeight="600" 
                color="white" 
                letterSpacing="-0.02em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                mb={3}
              >
                The Lux Studio
              </Heading>

              <Text fontSize="14px" color="rgba(255, 255, 255, 0.82)" lineHeight="1.65" maxW="600px">
                A refined, cloud-synced experience for clients seeking deeper continuity between sessions—with 
                mindful rituals, guided clinical tools, and secure access across every device.
              </Text>
            </Box>

            <Box textAlign={{ base: "left", md: "right" }} pt={{ base: 2, md: 6 }}>
              {isPremium ? (
                <Button
                  bg="#A9CBB7"
                  color="#1A2823"
                  borderRadius="full"
                  px={6}
                  height="40px"
                  fontSize="13px"
                  fontWeight="600"
                  _hover={{ bg: "#C2DECF" }}
                >
                  Premium Active
                </Button>
              ) : (
                <VStack align={{ base: "start", md: "end" }} spacing={1.5}>
                  <Button
                    bg="#A9CBB7"
                    color="#1A2823"
                    borderRadius="full"
                    px={7}
                    height="42px"
                    fontSize="13px"
                    fontWeight="600"
                    rightIcon={<Icon as={FiArrowRight} boxSize="13px" />}
                    _hover={{ bg: "#C2DECF", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                    boxShadow="0 4px 14px rgba(0, 0, 0, 0.15)"
                    onClick={scrollToWaitlist}
                  >
                    Join Pre-Release List
                  </Button>
                  <Text fontSize="11.5px" color="rgba(255, 255, 255, 0.6)">
                    Exclusive launch pricing for early registrants.
                  </Text>
                </VStack>
              )}
            </Box>
          </HStack>

          {/* 🌟 3 Quick Highlights Bento */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
            {[
              { label: "Resource Library", value: "200+ guided tools", icon: FiBook },
              { label: "Daily Practices", value: "Toolkit for everyday calm", icon: FiActivity },
              { label: "Cloud Journal", value: "Private sync across devices", icon: FiCloud },
            ].map((feature) => (
              <Box
                key={feature.label}
                bg="rgba(255, 255, 255, 0.05)"
                p={4}
                borderRadius="2xl"
                border="1px solid rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(6px)"
              >
                <HStack spacing={3} mb={1.5}>
                  <Circle size="28px" bg="rgba(169, 203, 183, 0.15)" color="#A9CBB7">
                    <Icon as={feature.icon} boxSize="13px" />
                  </Circle>
                  <Text fontSize="10px" fontWeight="700" color="rgba(255, 255, 255, 0.55)" letterSpacing="0.08em" textTransform="uppercase">
                    {feature.label}
                  </Text>
                </HStack>
                <Text fontWeight="600" fontSize="14px" color="white" pl={1}>
                  {feature.value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>

          {/* 🏛️ 4 Detailed Feature Bento Grid */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
            <FeatureCard
              icon={FiBook}
              title="200+ Guided Therapeutic Resources"
              description="Explore comprehensive clinical exercises, breathwork modules, and psychoeducational workbooks designed to sustain progress between visits."
            />
            <FeatureCard
              icon={FiCloud}
              title="Encrypted Cloud Reflections"
              description="Keep your private journal seamlessly synced and safeguarded. Capture moments of insight with end-to-end clinical privacy."
            />
            <FeatureCard
              icon={FiActivity}
              title="Daily Grounding Rituals"
              description="Morning intentions, mid-day mindful breath pauses, and evening check-ins crafted to build resilient emotional balance."
            />
            <FeatureCard
              icon={FiTrendingUp}
              title="Evolution Roadmap"
              description="Follow your emotional trends, track clinical milestones, and celebrate personal growth alongside your care team."
            />
          </SimpleGrid>
        </VStack>
      </Box>

      {/* 📝 Registration Waitlist Form */}
      {!isPremium && (
        <Box mt={8}>
          <PremiumPreReleaseForm audience="client" id="premium-pre-release" />
        </Box>
      )}
    </Box>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Box
      bg="rgba(255, 255, 255, 0.04)"
      p={5}
      borderRadius="2xl"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.08)"
      transition="all 0.2s"
      _hover={{ borderColor: "rgba(169, 203, 183, 0.25)" }}
    >
      <Circle size="36px" bg="rgba(169, 203, 183, 0.12)" color="#A9CBB7" mb={3.5}>
        <Icon as={icon} boxSize="16px" />
      </Circle>
      <Heading 
        fontSize="15px" 
        fontWeight="600"
        mb={2} 
        color="white"
        fontFamily="'Outfit', var(--font-outfit), sans-serif"
        letterSpacing="-0.01em"
      >
        {title}
      </Heading>
      <Text color="rgba(255, 255, 255, 0.72)" fontSize="13px" lineHeight="1.6">
        {description}
      </Text>
    </Box>
  );
}
