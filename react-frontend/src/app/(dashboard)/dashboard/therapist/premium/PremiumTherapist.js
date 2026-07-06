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
} from "@chakra-ui/react";
import { FiTarget, FiZap, FiBook, FiActivity, FiLock, FiRepeat } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthContext";
import { useTherapistSubscriptionGate } from "../../../../../hooks/useTherapistSubscriptionGate";
import { useTherapistRazorpayCheckout } from "../../../../../hooks/useTherapistRazorpayCheckout";
import TherapistGatedGateway from "../../../../../components/TherapistGatedGateway";

export default function PremiumTherapist() {
  const { isPremium, isTherapistPremium } = useAuth();
  const { hasPremiumAccess, premiumGateModal } = useTherapistSubscriptionGate();
  const { startSubscription, loadingPlan } = useTherapistRazorpayCheckout();
  const unlocked = isPremium || isTherapistPremium || hasPremiumAccess;

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
        {/* Decorative elements */}
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
              <Tag 
                bg="#A9CBB7" 
                color="#120F1B" 
                borderRadius="full" 
                mb={6} 
                px={4} 
                py={1} 
                fontSize="xs" 
                fontWeight="800"
                letterSpacing="widest"
              >
                THERAPIST PREMIUM
              </Tag>
              <Heading size="3xl" fontFamily="'Playfair Display', serif" mb={6}>
                The Therapist OS
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" lineHeight="tall">
                Your unified clinical command center. Designed for practitioners who 
                value clinical depth, seamless client engagement, and a calm, 
                organized practice flow.
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
                        onClick={() => startSubscription('premium')}
                        isLoading={loadingPlan === 'premium'}
                    >
                      Unlock Practitioner Suite
                    </Button>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      Standard tools included. OS is for scaling excellence.
                    </Text>
                </VStack>
              )}
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
            <FeatureCard 
                icon={FiActivity} 
                title="Client Journey Hub" 
                description="A unified view of goals, journal intensity, and shared resources. See the 'whole person' in a single clinical snapshot." 
                action="Explore Hub"
            />
            <FeatureCard 
                icon={FiZap} 
                title="Assessments & Outcomes" 
                description="Assign, track, and visualize clinical assessments (PHQ-9, GAD-7, etc.) with automated progress scoring." 
                action="Setup Assessments"
            />
            <FeatureCard 
                icon={FiRepeat} 
                title="Reminders & Rituals" 
                description="Automate gentle nudges for client session prep and post-session reflections. Keep the work alive between meetings." 
                action="Manage Rituals"
            />
            <FeatureCard 
                icon={FiBook} 
                title="The MLC Library" 
                description="Access a curated vault of worksheets, exercises, and audio tools shared across the MLC clinician network." 
                action="Browse Library"
            />
          </SimpleGrid>
        </VStack>
      </Box>

      {!unlocked && (
        <Center mt={12} p={10} bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
            <VStack spacing={4}>
                <Icon as={FiLock} boxSize={8} color="gray.300" />
                <Text color="gray.500" fontWeight="500">Upgrade to Premium to unlock the full Therapist OS suite.</Text>
                <Button
                  bg="#56756D"
                  color="white"
                  borderRadius="full"
                  onClick={() => startSubscription('premium')}
                  isLoading={loadingPlan === 'premium'}
                >
                  Subscribe — INR 1799/year
                </Button>
            </VStack>
        </Center>
      )}

      <TherapistGatedGateway
        isOpen={premiumGateModal.isOpen}
        onClose={premiumGateModal.onClose}
        contextLabel="Premium unlocks advanced analytics, priority listing, and Therapist OS tools."
      />
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
            <Icon as={icon} boxSize={8} color="#A9CBB7" mb={6} />
            <Heading size="md" mb={4}>{title}</Heading>
            <Text color="whiteAlpha.700" mb={6} lineHeight="tall">{description}</Text>
            <Button variant="outline" colorScheme="teal" borderRadius="full" px={8} size="sm">
                {action}
            </Button>
        </Box>
    );
}
