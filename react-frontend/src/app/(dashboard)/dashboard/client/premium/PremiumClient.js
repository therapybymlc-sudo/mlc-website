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
import { FiStar, FiCloud, FiActivity, FiBook, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import PremiumPreReleaseForm from "../../../../../components/PremiumPreReleaseForm";

export default function PremiumClient() {
  const { isPremium } = useAuth();

  const scrollToWaitlist = () => {
    document.getElementById('premium-pre-release')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box maxW="1100px" mx="auto">
      <Box
        bg="linear-gradient(135deg, #130F1B 0%, #241C33 50%, #3A2C4A 100%)"
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
          w="300px"
          h="300px"
          bg="rgba(201, 169, 96, 0.1)"
          borderRadius="full"
          filter="blur(80px)"
        />

        <VStack align="start" spacing={10} position="relative" zIndex={1}>
          <HStack justify="space-between" w="100%" flexWrap="wrap" spacing={6}>
            <Box maxW="2xl">
              <HStack spacing={2} mb={6} flexWrap="wrap">
                <Tag
                  bg="#C9A960"
                  color="black"
                  borderRadius="full"
                  px={4}
                  py={1}
                  fontSize="xs"
                  fontWeight="800"
                  letterSpacing="widest"
                >
                  PREMIUM STUDIO
                </Tag>
                {!isPremium && (
                  <Tag colorScheme="orange" borderRadius="full" px={4} py={1} fontSize="xs" fontWeight="800">
                    COMING SOON
                  </Tag>
                )}
              </HStack>
              <Heading size="3xl" fontFamily="'Playfair Display', serif" mb={6}>
                The Lux Studio
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall">
                A refined, cloud-synced experience for clients who want deeper support between sessions —
                with rituals, resources, and continuity across every device.
              </Text>
            </Box>

            <Box textAlign={{ base: "left", md: "right" }}>
              {isPremium ? (
                <Button
                  bg="white"
                  color="black"
                  borderRadius="full"
                  px={10}
                  h={14}
                  _hover={{ transform: 'scale(1.05)' }}
                >
                  Premium Access Active
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

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
            {[
              { label: "Resource Library", value: "200+ guided tools", icon: FiBook },
              { label: "Daily Skills", value: "Arsenal for each day", icon: FiActivity },
              { label: "Cloud Journal", value: "Secure sync everywhere", icon: FiCloud },
            ].map((feature) => (
              <Box
                key={feature.label}
                bg="rgba(255,255,255,0.06)"
                p={6}
                borderRadius="3xl"
                border="1px solid rgba(255,255,255,0.1)"
              >
                <HStack spacing={4} mb={2}>
                  <Icon as={feature.icon} color="#C9A960" />
                  <Text fontSize="xs" fontWeight="800" color="whiteAlpha.500" letterSpacing="widest">
                    {feature.label.toUpperCase()}
                  </Text>
                </HStack>
                <Text fontWeight="600" fontSize="lg">{feature.value}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
            <FeatureCard
              icon={FiBook}
              title="200+ Resources for Your Journey"
              description="Access over 200 resources to support your therapy journey — a complete arsenal of skills and knowledge to help you do better each day."
            />
            <FeatureCard
              icon={FiCloud}
              title="Synced Reflections"
              description="Keep your journal encrypted and available everywhere. Capture insights on the go with clinical continuity."
            />
            <FeatureCard
              icon={FiActivity}
              title="Daily Rituals"
              description="Gentle reminders, morning grounding, and evening reflections. Build sustainable emotional health between sessions."
            />
            <FeatureCard
              icon={FiTrendingUp}
              title="Evolution Tracker"
              description="Visualize patterns and celebrate your emotional evolution over weeks and months with your care team."
            />
          </SimpleGrid>
        </VStack>
      </Box>

      {!isPremium && (
        <Box mt={12}>
          <PremiumPreReleaseForm audience="client" id="premium-pre-release" />
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
      <Icon as={icon} boxSize={8} color="#C9A960" mb={6} />
      <Heading size="md" mb={4} color="white">
        {title}
      </Heading>
      <Text color="whiteAlpha.700" lineHeight="tall">
        {description}
      </Text>
    </Box>
  );
}
