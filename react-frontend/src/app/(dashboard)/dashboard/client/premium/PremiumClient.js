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
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiStar, FiCloud, FiActivity, FiBook, FiTrendingUp, FiLock } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";

export default function PremiumClient() {
  const { isPremium } = useAuth();

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
        {/* Decorative elements */}
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
              <Tag 
                bg="#C9A960" 
                color="black" 
                borderRadius="full" 
                mb={6} 
                px={4} 
                py={1} 
                fontSize="xs" 
                fontWeight="800"
                letterSpacing="widest"
              >
                PREMIUM STUDIO
              </Tag>
              <Heading size="3xl" fontFamily="'Playfair Display', serif" mb={6}>
                The Lux Studio
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall">
                A refined, cloud‑synced experience for clients who want deeper
                support, beautiful rituals, and clinical continuity across every device.
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
                    >
                      Upgrade Your Journey
                    </Button>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Standard therapy included. Lux is an optional expansion.
                    </Text>
                </VStack>
              )}
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
            {[
              { label: "Cloud Journal", value: "End-to-End Encryption", icon: FiCloud },
              { label: "Clinical Rituals", value: "Morning + Evening Flows", icon: FiActivity },
              { label: "Wellness Library", value: "Gated Audio + Rituals", icon: FiBook },
            ].map((feature) => (
              <Box
                key={feature.label}
                bg="rgba(255,255,255,0.06)"
                p={6}
                borderRadius="3xl"
                border="1px solid rgba(255,255,255,0.1)"
                transition="0.3s"
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
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
                icon={FiCloud} 
                title="Synced Reflections" 
                description="Keep your journal encrypted and available everywhere. Perfect for capturing insights on the go." 
                action="Explore Sync"
            />
            <FeatureCard 
                icon={FiActivity} 
                title="Daily Rituals" 
                description="Gentle reminders, morning grounding, and evening reflections. Build sustainable emotional health." 
                action="Configure Rituals"
            />
            <FeatureCard 
                icon={FiBook} 
                title="Wellbeing Library" 
                description="Breathwork, meditations, and therapy tools curated specifically for your clinical path." 
                action="Open Library"
            />
            <FeatureCard 
                icon={FiTrendingUp} 
                title="Evolution Tracker" 
                description="Visualize clinical patterns and celebrate your emotional evolution over weeks and months." 
                action="View Insights"
            />
          </SimpleGrid>
        </VStack>
      </Box>

      {!isPremium && (
        <Center mt={12} p={10} bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
            <VStack spacing={4}>
                <Icon as={FiLock} boxSize={8} color="gray.300" />
                <Text color="gray.500" fontWeight="500">Upgrade to Premium to unlock these experimental features.</Text>
            </VStack>
        </Center>
      )}
    </Box>
  );
}

function FeatureCard({ icon, title, description, action }) {
    return (
        <Box 
            bg="rgba(255,255,255,0.04)" 
            p={8} 
            borderRadius="4xl" 
            border="1px solid" 
            borderColor="rgba(255,255,255,0.08)"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', bg: 'rgba(255,255,255,0.08)' }}
        >
            <Icon as={icon} boxSize={8} color="#C9A960" mb={6} />
            <Heading size="md" mb={4}>{title}</Heading>
            <Text color="whiteAlpha.700" mb={6} lineHeight="tall">{description}</Text>
            <Button variant="outline" colorScheme="yellow" borderRadius="full" px={8} size="sm">
                {action}
            </Button>
        </Box>
    );
}
