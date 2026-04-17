'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Textarea,
  useToast,
  Icon,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiAlertTriangle, FiHeart, FiPhone, FiShield, FiSave, FiInfo } from "react-icons/fi";
import { apiGet, apiPut } from "../../../../../api.js";
import { useAuth } from "../../../../../context/AuthContext";

export default function SafetyClient() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState({
    warning_signs: "",
    coping_strategies: "",
    social_distractions: "",
    social_supports: "",
    professional_supports: "",
    environment_safety: "",
    reason_for_living: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await apiGet("safety-plans/current/");
        if (res) setPlan(res);
      } catch (err) {
        console.warn("Could not fetch safety plan");
      } finally {
        setLoading(false);
      }
    };
    if (isMounted && !authLoading && isAuthenticated) {
      fetchPlan();
    } else if (isMounted && !authLoading && !isAuthenticated) {
        setLoading(false);
    }
  }, [isMounted, authLoading, isAuthenticated]);

  if (!isMounted) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut(`safety-plans/${plan.id}/`, plan);
      toast({ title: "Safety plan updated", status: "success" });
    } catch (err) {
      toast({ title: "Failed to update safety plan", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box maxW="900px" mx="auto">
      <VStack align="start" spacing={1} mb={8}>
        <Heading size="lg" color="#2E2E2E" fontFamily="'Playfair Display', serif">
          Personal Safety Plan
        </Heading>
        <Text color="gray.500">A proactive guide to help you stay grounded and safe during difficult moments.</Text>
      </VStack>

      <Alert status="info" borderRadius="2xl" mb={8} bg="#E9F2ED" color="#56756D" border="1px solid" borderColor="teal.100">
        <AlertIcon color="#56756D" />
        <Box>
           <Text fontWeight="700">Clinical Recommendation</Text>
           <Text fontSize="sm">This plan is most effective when completed during a time of relative calm. You can update it whenever you feel your needs have changed.</Text>
        </Box>
      </Alert>

      <VStack align="stretch" spacing={6}>
        <Accordion allowMultiple defaultIndex={[0]}>
          <SafetySection 
            icon={FiAlertTriangle} 
            title="1. Warning Signs" 
            desc="Thoughts, images, mood, or behaviors that indicate this plan should be used."
            value={plan.warning_signs}
            onChange={(val) => handleChange('warning_signs', val)}
          />
          
          <SafetySection 
            icon={FiShield} 
            title="2. Internal Coping Strategies" 
            desc="Things I can do without contacting anyone else (e.g., breathing, walking, listening to music)."
            value={plan.coping_strategies}
            onChange={(val) => handleChange('coping_strategies', val)}
          />

          <SafetySection 
            icon={FiInfo} 
            title="3. Social Distractions" 
            desc="People and social settings that provide distraction (places to go, people to talk to casually)."
            value={plan.social_distractions}
            onChange={(val) => handleChange('social_distractions', val)}
          />

          <SafetySection 
            icon={FiPhone} 
            title="4. Social Supports" 
            desc="People who I can ask for help during a crisis."
            value={plan.social_supports}
            onChange={(val) => handleChange('social_supports', val)}
          />

          <SafetySection 
            icon={FiHeart} 
            title="5. Professionals & Agencies" 
            desc="Who to call in an emergency (MLC Crisis line, Local Emergency services)."
            value={plan.professional_supports}
            onChange={(val) => handleChange('professional_supports', val)}
          />

          <SafetySection 
            icon={FiShield} 
            title="6. Making the Environment Safe" 
            desc="How I can limit access to things I might use to harm myself."
            value={plan.environment_safety}
            onChange={(val) => handleChange('environment_safety', val)}
          />

          <SafetySection 
            icon={FiHeart} 
            title="7. One Thing Important to Me" 
            desc="A reason for living, or something I want to keep working toward."
            value={plan.reason_for_living}
            onChange={(val) => handleChange('reason_for_living', val)}
          />
        </Accordion>

        <Box pt={6}>
            <Button 
                w="full" 
                h="60px" 
                bg="#56756D" 
                color="white" 
                borderRadius="2xl" 
                leftIcon={<FiSave />}
                isLoading={saving}
                onClick={handleSave}
                _hover={{ bg: '#3E5B54' }}
            >
                Save Safety Plan
            </Button>
            <Text textAlign="center" mt={4} fontSize="xs" color="gray.400">
                Only you and your primary therapist can view this plan.
            </Text>
        </Box>
      </VStack>
    </Box>
  );
}

function SafetySection({ icon, title, desc, value, onChange }) {
    return (
        <AccordionItem border="none" mb={4}>
            <AccordionButton 
                p={6} 
                bg="white" 
                borderRadius="2xl" 
                shadow="sm" 
                _expanded={{ bg: 'gray.50', borderBottomRadius: 'none' }}
                border="1px solid"
                borderColor="gray.100"
            >
                <HStack flex="1" spacing={4}>
                    <Box bg="#F2F1ED" p={2} borderRadius="lg">
                        <Icon as={icon} color="#56756D" />
                    </Box>
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="700" color="#2E2E2E">{title}</Text>
                        <Text fontSize="xs" color="gray.500">{desc}</Text>
                    </VStack>
                </HStack>
                <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={6} bg="gray.50" borderBottomRadius="2xl" border="1px solid" borderTop="none" borderColor="gray.100">
                <Textarea 
                    placeholder="Type your notes here..." 
                    bg="white" 
                    borderRadius="xl" 
                    minH="120px"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </AccordionPanel>
        </AccordionItem>
    );
}
