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
  Circle,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiAlertTriangle, 
  FiHeart, 
  FiPhone, 
  FiShield, 
  FiSave, 
  FiInfo, 
  FiDownload, 
  FiUsers, 
  FiLifeBuoy, 
  FiSun, 
  FiHome 
} from "react-icons/fi";
import { apiGet, apiGetBlob, apiPut } from "../../../../../api.js";
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

  const handleExportPdf = async () => {
    try {
      const blob = await apiGetBlob("safety-plans/current/export-pdf/");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "safety-plan.pdf";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          if (document.body.contains(link)) document.body.removeChild(link);
        } catch {}
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      toast({ title: "Failed to export safety plan", status: "error" });
    }
  };

  const handleChange = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box maxW="1240px" mx="auto" pb={12} fontFamily="'Inter', var(--font-inter), sans-serif">
      {/* 🌿 Framed Header Card */}
      <Box 
        id="tour-safety-header"
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', md: 'center' }} 
          gap={4}
        >
          {/* Identity & Title */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiHeart} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(86, 117, 109, 0.12)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  textTransform="uppercase" 
                  letterSpacing="0.08em"
                >
                  Crisis Support
                </Badge>
              </HStack>
              <Heading 
                as="h1"
                fontSize={{ base: "21px", sm: "25px" }} 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                lineHeight="1.25"
              >
                Personal Safety Plan
              </Heading>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                A proactive, personalized guide to help you stay grounded and safe during difficult moments.
              </Text>
            </VStack>
          </HStack>

          <Button
            size="sm"
            height="38px"
            variant="outline"
            borderRadius="full"
            borderColor="rgba(86, 117, 109, 0.25)"
            color="#263A33"
            fontSize="12.5px"
            fontWeight="600"
            px={4}
            leftIcon={<Icon as={FiDownload} boxSize="13px" />}
            onClick={handleExportPdf}
            _hover={{ bg: "rgba(86, 117, 109, 0.06)", borderColor: "#56756D" }}
            transition="all 0.2s"
            whiteSpace="nowrap"
            flexShrink={0}
          >
            Export PDF
          </Button>
        </Flex>
      </Box>

      {/* 🌿 Clinical Recommendation Callout */}
      <Box 
        borderRadius="2xl" 
        mb={6} 
        p={{ base: 4, md: 5 }}
        bg="linear-gradient(135deg, rgba(86, 117, 109, 0.08) 0%, rgba(169, 203, 183, 0.06) 100%)"
        border="1px solid rgba(86, 117, 109, 0.18)"
      >
        <HStack align="flex-start" spacing={3.5}>
          <Circle size="34px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0} mt={0.5}>
            <Icon as={FiInfo} boxSize="16px" />
          </Circle>
          <VStack align="start" spacing={1} flex="1">
            <Text 
              fontWeight="600" 
              fontSize="14px" 
              color="#263A33" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              Clinical Guidance
            </Text>
            <Text fontSize="13px" color="#5A6E65" lineHeight="1.5">
              This plan is most effective when completed during a time of relative calm. You can update and adapt it whenever your circumstances or needs evolve.
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* 📋 Safety Sections */}
      <VStack align="stretch" spacing={6}>
        <Box id="tour-safety-sections">
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
              icon={FiUsers} 
              title="3. Social Distractions" 
              desc="People and social settings that provide distraction (places to go, people to talk to casually)."
              value={plan.social_distractions}
              onChange={(val) => handleChange('social_distractions', val)}
            />

            <SafetySection 
              icon={FiPhone} 
              title="4. Social Supports" 
              desc="Friends and family members who I can reach out to for help during a difficult moment."
              value={plan.social_supports}
              onChange={(val) => handleChange('social_supports', val)}
            />

            <SafetySection 
              icon={FiLifeBuoy} 
              title="5. Professionals & Agencies" 
              desc="Who to contact in an emergency (MLC Crisis line, Local Emergency services, therapist)."
              value={plan.professional_supports}
              onChange={(val) => handleChange('professional_supports', val)}
            />

            <SafetySection 
              icon={FiHome} 
              title="6. Making the Environment Safe" 
              desc="Steps I can take to limit access to items or spaces that could compromise my safety."
              value={plan.environment_safety}
              onChange={(val) => handleChange('environment_safety', val)}
            />

            <SafetySection 
              icon={FiSun} 
              title="7. One Thing Important to Me" 
              desc="A reason for living, a core value, or something meaningful I want to keep working toward."
              value={plan.reason_for_living}
              onChange={(val) => handleChange('reason_for_living', val)}
            />
          </Accordion>
        </Box>

        {/* 💾 Actions & Security Note */}
        <Box id="tour-safety-save" pt={4}>
          <HStack spacing={3} justify="flex-start" flexWrap="wrap">
            <Button
              height="42px"
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={7}
              fontSize="13px"
              fontWeight="600"
              leftIcon={<Icon as={FiSave} boxSize="14px" />}
              isLoading={saving}
              loadingText="Saving Plan..."
              onClick={handleSave}
              _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
              boxShadow="0 2px 8px rgba(38, 58, 51, 0.12)"
            >
              Save Safety Plan
            </Button>

            <Button
              height="42px"
              variant="outline"
              borderRadius="full"
              borderColor="rgba(86, 117, 109, 0.3)"
              color="#263A33"
              px={6}
              fontSize="13px"
              fontWeight="600"
              leftIcon={<Icon as={FiDownload} boxSize="14px" />}
              onClick={handleExportPdf}
              _hover={{ bg: "rgba(86, 117, 109, 0.06)", borderColor: "#56756D" }}
              transition="all 0.2s"
            >
              Export as PDF
            </Button>
          </HStack>

          <HStack spacing={2} mt={4} color="#718096" align="center">
            <Icon as={FiShield} boxSize="13px" color="#56756D" />
            <Text fontSize="12px" fontWeight="500">
              Encrypted & Private: Only you and your primary therapist have access to your personal safety plan.
            </Text>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}

function SafetySection({ icon, title, desc, value, onChange }) {
  return (
    <AccordionItem border="none" mb={3.5}>
      {({ isExpanded }) => (
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor={isExpanded ? "rgba(86, 117, 109, 0.28)" : "rgba(86, 117, 109, 0.14)"}
          boxShadow={isExpanded ? "0 4px 18px -2px rgba(38, 58, 51, 0.06)" : "0 2px 6px rgba(38, 58, 51, 0.02)"}
          transition="all 0.2s ease"
          overflow="hidden"
        >
          <AccordionButton 
            p={{ base: 4, md: 5 }}
            bg={isExpanded ? "rgba(86, 117, 109, 0.03)" : "white"}
            _hover={{ bg: "rgba(86, 117, 109, 0.04)" }}
            transition="all 0.2s"
          >
            <HStack flex="1" spacing={3.5} align="center">
              <Circle 
                size="38px" 
                bg={isExpanded ? "rgba(86, 117, 109, 0.12)" : "rgba(86, 117, 109, 0.07)"}
                color="#56756D"
                flexShrink={0}
              >
                <Icon as={icon} boxSize="17px" />
              </Circle>
              <VStack align="start" spacing={0.5} flex="1">
                <Text 
                  fontWeight="600" 
                  color="#263A33"
                  fontSize="15px"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  letterSpacing="-0.01em"
                >
                  {title}
                </Text>
                <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.4">
                  {desc}
                </Text>
              </VStack>
            </HStack>
            <AccordionIcon color="#56756D" />
          </AccordionButton>
          <AccordionPanel 
            p={{ base: 4, md: 5 }} 
            pt={2} 
            bg="white"
            borderTop="1px solid"
            borderColor="rgba(86, 117, 109, 0.08)"
          >
            <Textarea 
              placeholder="Type your notes and thoughts here..." 
              bg="#FAF8F5" 
              borderRadius="xl" 
              minH="110px"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              fontSize="13.5px"
              color="#263A33"
              border="1px solid rgba(86, 117, 109, 0.16)"
              _placeholder={{ color: "rgba(90, 110, 101, 0.6)" }}
              _focus={{ 
                bg: "white", 
                borderColor: "#56756D", 
                boxShadow: "0 0 0 1px #56756D" 
              }}
              lineHeight="1.6"
              p={3.5}
            />
          </AccordionPanel>
        </Box>
      )}
    </AccordionItem>
  );
}

