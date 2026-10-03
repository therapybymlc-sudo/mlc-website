'use client'

import React, { useState } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  FormControl, FormLabel, Input, Select, Textarea, useToast,
  Icon, Center, Tag, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiCalendar, FiClock, FiCheckCircle, FiShield, FiSend, FiInfo,
  FiArrowRight, FiHeart, FiActivity,
  FiLock, FiCompass, FiCheck, FiStar
} from "react-icons/fi";
import { apiPost } from "../../api.js";
import NextLink from "next/link";
import ModernSelect from "../../components/ModernSelect";
import ModernDatePicker from "../../components/ModernDatePicker";

const MotionBox = motion(Box);

export default function BookNowClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!formData.phone?.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your WhatsApp or phone number.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Email Address Required",
        description: "Please enter your email address so we can confirm your request.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!formData.service) {
      toast({
        title: "Care Type Required",
        description: "Please select a therapy modality or care type.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Map slot to valid TimeField format (HH:MM:SS) for PostgreSQL/Django
      let mappedTime = null;
      let slotNote = "";
      if (formData.time === "Morning") {
        mappedTime = "09:00:00";
        slotNote = "Preferred Time: Morning (9 AM – 12 PM)";
      } else if (formData.time === "Afternoon") {
        mappedTime = "13:00:00";
        slotNote = "Preferred Time: Afternoon (12 PM – 4 PM)";
      } else if (formData.time === "Evening") {
        mappedTime = "17:00:00";
        slotNote = "Preferred Time: Evening (4 PM – 8 PM)";
      } else if (formData.time === "Weekend") {
        mappedTime = null;
        slotNote = "Preferred Time: Weekend Preferred";
      } else if (formData.time && formData.time.includes(":")) {
        mappedTime = formData.time;
      }

      const combinedNotes = [slotNote, formData.notes?.trim()].filter(Boolean).join("\n");

      await apiPost("quick-bookings/", {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        preferred_date: formData.date || null,
        preferred_time: mappedTime,
        service_type: formData.service,
        notes: combinedNotes || null,
      });

      toast({
        title: "Booking Request Received 🌿",
        description: "Our clinical coordination team will reach out within 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        service: "",
        notes: "",
      });
    } catch (err) {
      console.error("Booking submission error:", err);
      const detail = err.response?.data?.preferred_time?.[0] || 
                     err.response?.data?.service_type?.[0] || 
                     err.response?.data?.email?.[0] || 
                     err.response?.data?.phone?.[0] ||
                     err.message || 
                     "Something went wrong while sending your request. Please try again or email us directly.";
      toast({
        title: "Submission Error",
        description: detail,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="#FDFBFA" overflowX="hidden" color="#263A33">

      {/* 🌿 1. HERO SECTION */}
      <MotionBox
        position="relative"
        bgImage="url('/therapy-room.jpg')"
        bgSize="cover"
        bgPosition="center"
        minH={{ base: "82vh", md: "88vh" }}
        display="flex"
        alignItems="center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0 }}
      >
        {/* Soft Multi-Layered Warm Veil */}
        <Box 
          position="absolute"
          inset={0}
          bg="linear-gradient(90deg, rgba(253, 251, 250, 0.97) 0%, rgba(253, 251, 250, 0.92) 48%, rgba(253, 251, 250, 0.45) 100%)"
          zIndex={1}
        />
        <Box 
          position="absolute"
          top="0"
          left="20%"
          w="600px"
          h="400px"
          bg="radial-gradient(circle, rgba(201, 169, 96, 0.08) 0%, rgba(253, 251, 250, 0) 70%)"
          pointerEvents="none"
          zIndex={1}
        />

        <Container maxW="6xl" position="relative" zIndex={2} px={{ base: 6, lg: 8 }}>
          <VStack align="start" spacing={{ base: 5, md: 6 }} maxW="2xl">
            
            {/* Pill Tag */}
            <HStack 
              spacing={2} 
              px={4} 
              py={1.5} 
              borderRadius="full" 
              bg="rgba(86, 117, 109, 0.09)" 
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.22)"
              backdropFilter="blur(8px)"
            >
              <Icon as={FiStar} boxSize="13px" color="#56756D" />
              <Text 
                fontSize="11.5px" 
                fontWeight="700" 
                letterSpacing="0.1em" 
                textTransform="uppercase" 
                color="#3D5A52"
                fontFamily="'Inter', sans-serif"
              >
                Take The First Step
              </Text>
            </HStack>

            {/* Main Headline */}
            <Heading
              as="h1"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "38px", sm: "48px", md: "64px", lg: "70px" }}
              color="#263A33"
              lineHeight={{ base: "1.15", md: "1.1" }}
              fontWeight="600"
              letterSpacing="-0.02em"
            >
              Book Your{" "}
              <Text as="span" color="#56756D" fontStyle="italic" fontWeight="500">
                Session
              </Text>
            </Heading>

            {/* Narrative Subtitle */}
            <Text
              fontSize={{ base: "15px", md: "17.5px" }}
              color="#5A6E65"
              lineHeight="1.8"
              fontFamily="'Inter', sans-serif"
              maxW="xl"
            >
              Taking the first step toward therapy is an act of deep courage and care. 
              We ensure you are paired with the right specialist based on clinical fit, 
              shared values, and therapeutic approach.
            </Text>

            {/* Quick Clinical Trust Badges */}
            <HStack spacing={{ base: 2, sm: 3 }} flexWrap="wrap" pt={1}>
              <Tag size="sm" variant="subtle" bg="#FFFFFF" color="#3D5A52" borderRadius="full" px={3} py={1} border="1px solid rgba(86, 117, 109, 0.16)">
                <Icon as={FiCheck} mr={1.5} color="#56756D" /> Licensed Clinicians
              </Tag>
              <Tag size="sm" variant="subtle" bg="#FFFFFF" color="#3D5A52" borderRadius="full" px={3} py={1} border="1px solid rgba(86, 117, 109, 0.16)">
                <Icon as={FiCheck} mr={1.5} color="#56756D" /> 30-Min Free Screening
              </Tag>
              <Tag size="sm" variant="subtle" bg="#FFFFFF" color="#3D5A52" borderRadius="full" px={3} py={1} border="1px solid rgba(86, 117, 109, 0.16)">
                <Icon as={FiCheck} mr={1.5} color="#56756D" /> 100% Confidential
              </Tag>
            </HStack>

            {/* Action Buttons */}
            <HStack spacing={4} pt={3}>
              <Button
                as="a"
                href="#booking-form"
                bg="#263A33"
                color="white"
                size="lg"
                h="50px"
                px={9}
                borderRadius="full"
                fontSize="14.5px"
                fontWeight="600"
                fontFamily="'Inter', sans-serif"
                boxShadow="0 6px 18px rgba(38, 58, 51, 0.22)"
                _hover={{ bg: "#182722", transform: "translateY(-2px)", boxShadow: "0 8px 22px rgba(38, 58, 51, 0.3)" }}
                transition="all 0.25s ease"
              >
                Book Now
              </Button>
              <Button
                as={NextLink}
                href="/therapists/discovery"
                variant="outline"
                bg="white"
                borderColor="rgba(86, 117, 109, 0.28)"
                color="#263A33"
                size="lg"
                h="50px"
                px={7}
                borderRadius="full"
                fontSize="14.5px"
                fontWeight="600"
                fontFamily="'Inter', sans-serif"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: "rgba(86, 117, 109, 0.06)", borderColor: "#56756D", transform: "translateY(-2px)" }}
                transition="all 0.25s ease"
              >
                Discovery Quiz
              </Button>
            </HStack>

          </VStack>
        </Container>
      </MotionBox>

      {/* 🧭 ANCHOR TARGET */}
      <Box id="booking-form" />

      {/* 💠 2. THE MATCHING PROCESS (How it works) */}
      <Box py={{ base: 16, md: 24 }} bg="white" position="relative">
        <Container maxW="6xl" px={{ base: 6, lg: 8 }}>
          <VStack spacing={{ base: 12, md: 16 }} align="center">
            
            <VStack spacing={3} textAlign="center" maxW="680px">
              <HStack 
                spacing={1.5} 
                px={3.5} 
                py={1} 
                borderRadius="full" 
                bg="rgba(86, 117, 109, 0.08)" 
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.18)"
              >
                <Icon as={FiCompass} boxSize="12px" color="#56756D" />
                <Text 
                  fontSize="11px" 
                  fontWeight="700" 
                  letterSpacing="0.1em" 
                  textTransform="uppercase" 
                  color="#425C55"
                >
                  Structured Intake Journey
                </Text>
              </HStack>

              <Heading 
                as="h2"
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                fontSize={{ base: "28px", md: "38px" }}
                color="#263A33"
                fontWeight="600"
                letterSpacing="-0.015em"
              >
                The Thoughtful Matching Process
              </Heading>
              <Text fontSize="15px" color="#5A6E65" lineHeight="1.7" fontFamily="'Inter', sans-serif">
                We believe matching is a clinical decision, not an automated algorithm. Every referral is reviewed by our intake team for true therapeutic alignment.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} w="full">
              {[
                {
                  icon: FiCalendar,
                  step: "01",
                  title: "Share Your Goals",
                  desc: "Complete our confidential form with your concerns, preferred language, and session modality."
                },
                {
                  icon: FiActivity,
                  step: "02",
                  title: "Intake Screening",
                  desc: "A brief, structured conversation to assess clinical fit, urgency, and specific therapist preferences."
                },
                {
                  icon: FiCheckCircle,
                  step: "03",
                  title: "Clinician Match",
                  desc: "Our supervisory team connects you with an accredited practitioner specialized in your exact goals."
                },
                {
                  icon: FiHeart,
                  step: "04",
                  title: "Begin Care",
                  desc: "Attend your first 50-minute session in an encrypted, private, and empathic clinical setting."
                }
              ].map((item, idx) => (
                <VStack 
                  key={idx} 
                  align="start" 
                  spacing={4} 
                  p={7} 
                  bg="#FDFBFA" 
                  borderRadius="2xl" 
                  border="1px solid" 
                  borderColor="rgba(86, 117, 109, 0.14)"
                  boxShadow="0 8px 24px -6px rgba(38, 58, 51, 0.04)"
                  position="relative"
                  _hover={{ 
                    transform: 'translateY(-6px)', 
                    borderColor: 'rgba(86, 117, 109, 0.35)', 
                    boxShadow: '0 20px 40px -10px rgba(38, 58, 51, 0.09)' 
                  }}
                  transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  <HStack justify="space-between" w="100%">
                    <Box 
                      p={3} 
                      bg="rgba(86, 117, 109, 0.1)" 
                      borderRadius="16px" 
                      color="#56756D"
                      border="1px solid rgba(86, 117, 109, 0.16)"
                    >
                      <Icon as={item.icon} w={5} h={5} />
                    </Box>
                    <Text 
                      fontSize="12px" 
                      fontWeight="700" 
                      letterSpacing="0.08em" 
                      color="#8A7032" 
                      bg="rgba(201, 169, 96, 0.12)"
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      border="1px solid rgba(201, 169, 96, 0.25)"
                    >
                      STEP {item.step}
                    </Text>
                  </HStack>

                  <Heading size="sm" color="#263A33" fontFamily="'Playfair Display', var(--font-playfair), serif" fontWeight="600" pt={1}>
                    {item.title}
                  </Heading>
                  <Text color="#5A6E65" fontSize="13px" lineHeight="1.65" fontFamily="'Inter', sans-serif">
                    {item.desc}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 📝 3. SANCTUARY BOOKING FORM SECTION */}
      <Box 
        py={{ base: 10, md: 14 }} 
        position="relative"
        bg="#0C2520"
        overflow="hidden"
      >
        {/* Ambient Glows */}
        <Box 
          position="absolute"
          top="-20%"
          left="50%"
          transform="translateX(-50%)"
          w="900px"
          h="500px"
          bg="radial-gradient(ellipse at center, rgba(86, 117, 109, 0.2) 0%, rgba(12, 37, 32, 0) 70%)"
          pointerEvents="none"
          zIndex={0}
        />
        <Box 
          position="absolute"
          bottom="-10%"
          right="-10%"
          w="500px"
          h="500px"
          bg="radial-gradient(circle, rgba(201, 169, 96, 0.08) 0%, rgba(12, 37, 32, 0) 70%)"
          pointerEvents="none"
          zIndex={0}
        />

        <Container maxW="6xl" position="relative" zIndex={1} px={{ base: 5, lg: 8 }}>
          <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 10 }} alignItems="center">
            
            {/* Left Side: Clinical Reassurance & Narrative */}
            <VStack align="start" spacing={{ base: 4, md: 5 }} color="white" gridColumn={{ lg: "span 5" }}>
              <VStack align="start" spacing={2.5}>
                <HStack 
                  spacing={1.5} 
                  px={3} 
                  py={0.5} 
                  borderRadius="full" 
                  bg="whiteAlpha.100" 
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                >
                  <Icon as={FiShield} boxSize="11px" color="#C9A960" />
                  <Text 
                    fontSize="10.5px" 
                    fontWeight="700" 
                    letterSpacing="0.08em" 
                    textTransform="uppercase" 
                    color="#C9A960"
                  >
                    Confidential Clinical Intake
                  </Text>
                </HStack>

                <Heading 
                  as="h2"
                  fontSize={{ base: "26px", md: "34px", lg: "38px" }}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  lineHeight="1.15"
                  fontWeight="600"
                  letterSpacing="-0.015em"
                >
                  Ready to Begin Your Care?
                </Heading>
                <Text fontSize="13.5px" color="whiteAlpha.800" lineHeight="1.6" fontFamily="'Inter', sans-serif">
                  Share your basics below. Our clinical care team will evaluate your needs and connect with you within 24 business hours.
                </Text>
              </VStack>
              
              <VStack align="start" spacing={3.5} w="full">
                {[
                  {
                    icon: FiShield,
                    title: "Strict Confidentiality",
                    desc: "Protected by clinical non-disclosure and Indian DPDP ethics."
                  },
                  {
                    icon: FiClock,
                    title: "Prompt Coordination",
                    desc: "Initial screening call scheduled within 24–48 business hours."
                  },
                  {
                    icon: FiHeart,
                    title: "Relational Rematch Guarantee",
                    desc: "If the initial fit does not feel right, we rematch you seamlessly."
                  }
                ].map((perk, i) => (
                  <HStack key={i} spacing={3.5} align="center">
                    <Center 
                      w="36px" 
                      h="36px" 
                      borderRadius="12px" 
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      flexShrink={0}
                    >
                      <Icon as={perk.icon} color="#C9A960" boxSize="16px" />
                    </Center>
                    <Box>
                      <Text fontWeight="600" fontSize="13.5px" color="white">{perk.title}</Text>
                      <Text fontSize="12px" color="whiteAlpha.700" lineHeight="1.4">{perk.desc}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            {/* Right Side: Elegant Form Card */}
            <MotionBox
              gridColumn={{ lg: "span 7" }}
              bg="rgba(255, 255, 255, 0.98)"
              p={{ base: 5, md: 7 }}
              borderRadius="24px"
              boxShadow="0 20px 50px -10px rgba(0, 0, 0, 0.35)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.6)"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <VStack as="form" onSubmit={handleSubmit} spacing={3.5} align="stretch">
                
                <Box borderBottom="1px solid" borderColor="rgba(86, 117, 109, 0.1)" pb={2.5} mb={0.5}>
                  <Heading as="h3" fontSize={{ base: "18px", md: "20px" }} fontFamily="'Playfair Display', var(--font-playfair), serif" color="#263A33" fontWeight="600">
                    Client Details
                  </Heading>
                  <Text fontSize="11.5px" color="#7A8D86" fontFamily="'Inter', sans-serif" mt={0.5}>
                    All fields marked with an asterisk are required for safe matching.
                  </Text>
                </Box>

                {/* Row 1: Name & Phone */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} w="full">
                  <FormControl isRequired>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      FULL NAME
                    </FormLabel>
                    <Input 
                      placeholder="e.g. Jane Sharma" 
                      borderRadius="12px"
                      borderColor="rgba(86, 117, 109, 0.22)"
                      focusBorderColor="#56756D"
                      h="40px"
                      fontSize="13px"
                      fontFamily="'Inter', sans-serif"
                      bg="#FDFBFA"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      WHATSAPP / PHONE
                    </FormLabel>
                    <Input 
                      placeholder="+91 98765 43210" 
                      borderRadius="12px"
                      borderColor="rgba(86, 117, 109, 0.22)"
                      focusBorderColor="#56756D"
                      h="40px"
                      fontSize="13px"
                      fontFamily="'Inter', sans-serif"
                      bg="#FDFBFA"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Row 2: Email & Care Type */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} w="full">
                  <FormControl isRequired>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      EMAIL ADDRESS
                    </FormLabel>
                    <Input 
                      type="email" 
                      placeholder="jane@example.com" 
                      borderRadius="12px"
                      borderColor="rgba(86, 117, 109, 0.22)"
                      focusBorderColor="#56756D"
                      h="40px"
                      fontSize="13px"
                      fontFamily="'Inter', sans-serif"
                      bg="#FDFBFA"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      CARE TYPE
                    </FormLabel>
                    <ModernSelect
                      value={formData.service}
                      onChange={(val) => setFormData({...formData, service: val})}
                      placeholder="Select therapy modality"
                      h="40px"
                      fontSize="13px"
                      borderRadius="12px"
                      options={[
                        { value: "Individual Therapy", label: "Individual Therapy (1-on-1)" },
                        { value: "Couples Therapy", label: "Couples & Relationship Therapy" },
                        { value: "Adolescent Therapy", label: "Adolescent & Young Adult Therapy" },
                        { value: "Clinical Supervision", label: "Clinical Supervision (for Therapists)" },
                        { value: "Group Support", label: "Group Support Cohort" }
                      ]}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Row 3: Preferred Day & Preferred Time */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3.5} w="full">
                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      PREFERRED DAY
                    </FormLabel>
                    <ModernDatePicker
                      value={formData.date}
                      onChange={(val) => setFormData({ ...formData, date: val })}
                      placeholder="Select preferred date"
                      h="40px"
                      borderRadius="12px"
                      bg="#FDFBFA"
                      borderColor="rgba(86, 117, 109, 0.22)"
                      fontSize="13px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                      PREFERRED TIME
                    </FormLabel>
                    <ModernSelect
                      value={formData.time}
                      onChange={(val) => setFormData({...formData, time: val})}
                      placeholder="Any time slot"
                      h="40px"
                      fontSize="13px"
                      borderRadius="12px"
                      options={[
                        { value: "Morning", label: "Morning (9 AM – 12 PM)" },
                        { value: "Afternoon", label: "Afternoon (12 PM – 4 PM)" },
                        { value: "Evening", label: "Evening (4 PM – 8 PM)" },
                        { value: "Weekend", label: "Weekend Preferred" }
                      ]}
                    />
                  </FormControl>
                </SimpleGrid>

                {/* Row 4: Notes / Primary Concerns */}
                <FormControl>
                  <FormLabel fontSize="11.5px" fontWeight="600" color="#3D5A52" fontFamily="'Inter', sans-serif" mb={1} letterSpacing="0.02em">
                    WHAT BRINGS YOU TO THERAPY? (OPTIONAL)
                  </FormLabel>
                  <Textarea 
                    placeholder="Briefly share primary concerns, symptoms, or therapist preferences..." 
                    borderRadius="12px"
                    borderColor="rgba(86, 117, 109, 0.22)"
                    focusBorderColor="#56756D"
                    rows={2}
                    minH="54px"
                    fontSize="13px"
                    fontFamily="'Inter', sans-serif"
                    bg="#FDFBFA"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    _placeholder={{ color: "gray.400" }}
                  />
                </FormControl>

                {/* Row 5: Action & Security */}
                <Button
                  type="submit"
                  w="full"
                  bg="#263A33"
                  color="white"
                  borderRadius="full"
                  h="44px"
                  fontSize="14px"
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  rightIcon={<FiSend />}
                  isLoading={isLoading}
                  boxShadow="0 4px 14px rgba(38, 58, 51, 0.25)"
                  _hover={{ bg: "#182722", transform: "translateY(-1px)", boxShadow: "0 6px 18px rgba(38, 58, 51, 0.35)" }}
                  transition="all 0.2s ease"
                  mt={1}
                >
                  Submit Booking Request
                </Button>

                <HStack justify="center" spacing={1.5} color="#7A8D86" fontSize="11px" fontFamily="'Inter', sans-serif">
                  <Icon as={FiLock} boxSize="11px" color="#56756D" />
                  <Text>100% confidential and clinically protected under Indian DPDP ethics.</Text>
                </HStack>

              </VStack>
            </MotionBox>

          </SimpleGrid>
        </Container>
      </Box>

      {/* ❔ 4. FAQ SECTION */}
      <Box py={{ base: 10, md: 14 }} bg="linear-gradient(180deg, #F4F1EC 0%, #FDFBFA 100%)" position="relative">
        <Box
          position="absolute"
          top="50%"
          right="5%"
          transform="translateY(-50%)"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.1) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="840px" position="relative" zIndex={1} px={{ base: 6, lg: 8 }}>
          <VStack spacing={6}>
            
            <VStack textAlign="center" spacing={2}>
              <Text
                fontSize="xs"
                fontWeight="700"
                letterSpacing="2.5px"
                textTransform="uppercase"
                color="#C9A960"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                FAQ
              </Text>

              <Heading 
                as="h2" 
                fontFamily="'Playfair Display', var(--font-playfair), serif" 
                fontSize={{ base: "22px", md: "28px" }}
                color="#263A33"
                fontWeight="600"
              >
                Questions Before Booking
              </Heading>
              <Text color="rgba(46,46,46,0.65)" fontSize="13.5px" fontFamily="'Inter', var(--font-inter), sans-serif">
                Everything you need to know about the onboarding and matching process
              </Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                {
                  q: "Do I need to know my exact diagnosis before booking?",
                  a: "Not at all. Most people reach out with feeling overwhelmed, relationship strain, burnout, or general emotional fatigue. The purpose of our intake and the first few sessions is to safely explore and define your needs together."
                },
                {
                  q: "What happens during the 30-minute screening call?",
                  a: "The screening is a gentle, structured conversation with our clinical intake coordinator. We listen to your goals, answer any logistical questions, discuss fee brackets and therapist approaches, and ensure you are matched with the best practitioner."
                },
                {
                  q: "What if I feel my matched therapist isn't the right fit?",
                  a: "The therapeutic alliance is central to healing. If after 1–2 sessions you feel the connection isn't optimal, our coordination team will rematch you with another specialist at no additional administrative friction."
                },
                {
                  q: "Is therapy conducted online or in person?",
                  a: "We provide encrypted high-definition video sessions globally across India and international time zones (Europe, Middle East, Southeast Asia), as well as in-person sessions at designated clinic partner locations in major metropolitan cities."
                }
              ].map((item, idx) => (
                <AccordionItem 
                  key={idx} 
                  border="1px solid" 
                  borderColor="rgba(86, 117, 109, 0.12)" 
                  borderRadius="xl" 
                  mb={2.5}
                  bg="rgba(255, 255, 255, 0.7)"
                  backdropFilter="blur(8px)"
                  overflow="hidden"
                >
                  <AccordionButton 
                    py={3.5}
                    px={5}
                    _hover={{ bg: "rgba(169, 203, 183, 0.05)" }}
                    transition="0.2s"
                  >
                    <Box flex="1" textAlign="left" fontWeight="600" fontSize="15px" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                      {item.q}
                    </Box>
                    <AccordionIcon color="#56756D" />
                  </AccordionButton>
                  <AccordionPanel pt={1} pb={4} px={5} color="rgba(46,46,46,0.7)" fontSize="13.5px" lineHeight="1.65" fontFamily="'Inter', var(--font-inter), sans-serif">
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>

          </VStack>
        </Container>
      </Box>

      {/* 📞 5. REASSURANCE & CONTACT FOOTNOTE */}
      <Box py={14} bg="white" borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.14)" textAlign="center">
        <Container maxW="xl">
          <Text color="#7A8D86" fontSize="11.5px" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" mb={2}>
            Need Help Choosing or Immediate Guidance?
          </Text>
          <Heading 
            size="md" 
            color="#263A33" 
            mb={4} 
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
          >
            We are here to support your transition into therapy.
          </Heading>
          <Text fontSize="14px" color="#5A6E65" mb={5} fontFamily="'Inter', sans-serif" whiteSpace="nowrap">
            Email us directly at{" "}
            <Text as="a" href="mailto:therapy@mlchealth.in" color="#56756D" fontWeight="600" textDecoration="underline">
              therapy@mlchealth.in
            </Text>
            {" "}or take our guided{" "}
            <Text as={NextLink} href="/therapists/discovery" color="#56756D" fontWeight="600" textDecoration="underline" whiteSpace="nowrap">
              clinician matching quiz
            </Text>.
          </Text>
          <HStack justify="center" spacing={6} fontSize="13px">
            <Button as={NextLink} href="/privacy" variant="link" color="#7A8D86" _hover={{ color: "#263A33" }}>
              Privacy Policy
            </Button>
            <Text color="gray.300">•</Text>
            <Button as={NextLink} href="/terms" variant="link" color="#7A8D86" _hover={{ color: "#263A33" }}>
              Clinical Terms
            </Button>
            <Text color="gray.300">•</Text>
            <Button as={NextLink} href="/contactus" variant="link" color="#7A8D86" _hover={{ color: "#263A33" }}>
              Contact Centre
            </Button>
          </HStack>
        </Container>
      </Box>

    </Box>
  );
}
