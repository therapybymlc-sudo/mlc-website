'use client'

import React, { useState } from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid,
  Image, FormControl, FormLabel, Input, Select, Textarea, useToast,
  Divider, Icon, Flex, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiCalendar, FiClock, FiCheckCircle, FiShield, FiSend, FiInfo,
  FiArrowRight, FiHeart, FiActivity,
} from "react-icons/fi";
import { apiPost } from "../../api.js";
import NextLink from "next/link";

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
    setIsLoading(true);
    try {
      await apiPost("quick-bookings/", {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferred_date: formData.date || null,
        preferred_time: formData.time || null,
        service_type: formData.service,
        notes: formData.notes,
      });
      toast({
        title: "Booking Request Sent!",
        description: "Our coordination team will reach out to you soon 🌿",
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
      toast({
        title: "Error",
        description: "Something went wrong, please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="#FDFBFA" overflowX="hidden">
      {/* 🌿 HERO SECTION */}
      <MotionBox
        position="relative"
        bgImage="url('/therapy-room.jpg')"
        bgSize="cover"
        bgPosition="center"
        minH={{ base: "60vh", md: "80vh" }}
        display="flex"
        alignItems="center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        {/* Modern Layered Overlay */}
        <Box 
          position="absolute"
          inset={0}
          bg="linear-gradient(90deg, rgba(253, 251, 250, 0.95) 30%, rgba(253, 251, 250, 0.4) 100%)"
          zIndex={1}
        />

        <Container maxW="6xl" position="relative" zIndex={2} px={6}>
          <VStack align="start" spacing={6} maxW="2xl">
            <Badge 
              bg="teal.50" 
              color="teal.700" 
              px={4} py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800"
              letterSpacing="1px"
            >
              TAKE THE FIRST STEP
            </Badge>
            <Heading
              as="h1"
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "2.5rem", sm: "3.5rem", md: "5.5rem" }}
              color="#2E2E2E"
              lineHeight="1.1"
              fontWeight="600"
            >
              Book Your <Text as="span" color="mlc.green">Session</Text>
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              lineHeight="1.8"
              maxW="xl"
            >
              Taking the first step toward therapy is an act of deep courage and care. 
              We are here to help you find the right specialist so your journey begins 
              with comfort, clarity, and relational safety.
            </Text>
            <HStack spacing={4} pt={4}>
               <Button
                 as="a"
                 href="#booking-form"
                 bg="teal.800"
                 color="white"
                 size="lg"
                 px={10}
                 borderRadius="full"
                 _hover={{ bg: "teal.900", transform: "translateY(-2px)" }}
                 transition="all 0.3s"
               >
                 Book Now
               </Button>
               <Button
                 as={NextLink}
                 href="/therapists/discovery"
                 variant="ghost"
                 color="teal.800"
                 size="lg"
                 px={8}
                 borderRadius="full"
                 rightIcon={<FiArrowRight />}
               >
                 Discovery Quiz
               </Button>
            </HStack>
          </VStack>
        </Container>
      </MotionBox>

      {/* 🧭 NAVIGATION BREADCRUMB / ANCHOR */}
      <Box id="booking-form" h="20px" />

      {/* 💠 THE BOOKING JOURNEY (How it works) */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="6xl">
           <VStack spacing={16} align="center">
              <VStack spacing={4} textAlign="center">
                 <Heading 
                   fontFamily="'Playfair Display', var(--font-playfair), serif" 
                   size="xl" 
                   color="#2E2E2E"
                 >
                   The Matching Process
                 </Heading>
                 <Text fontSize="lg" color="gray.500" maxW="2xl">
                    We've simplified the journey ensuring you find a specialist who aligns with your specific needs and values.
                 </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} w="full">
                 {[
                   {
                     icon: FiCalendar,
                     step: "01",
                     title: "Fill the Form",
                     desc: "Share your basics so we can understand your requirements clearly."
                   },
                   {
                     icon: FiActivity,
                     step: "02",
                     title: "Screening Call",
                     desc: "A brief conversation to answer questions and ensure precise matching."
                   },
                   {
                     icon: FiCheckCircle,
                     step: "03",
                     title: "Get Matched",
                     desc: "Our clinical team assigns a specialist suited to your therapeutic goals."
                   },
                   {
                     icon: FiHeart,
                     step: "04",
                     title: "Begin Therapy",
                     desc: "Start your journey in a confidential, safe, and structured environment."
                   }
                 ].map((item, idx) => (
                   <VStack 
                     key={idx} 
                     align="flex-start" 
                     spacing={5} 
                     p={8} 
                     bg="#FDFBFA" 
                     borderRadius="3xl" 
                     border="1px solid" 
                     borderColor="gray.50"
                     _hover={{ shadow: 'xl', transform: 'translateY(-6px)' }}
                     transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                   >
                      <Box 
                        p={3} 
                        bg="teal.50" 
                        borderRadius="2xl" 
                        color="teal.600"
                      >
                         <Icon as={item.icon} w={6} h={6} />
                      </Box>
                      <Heading size="md" color="teal.900" fontFamily="'Playfair Display', serif">{item.title}</Heading>
                      <Text color="gray.500" fontSize="sm" lineHeight="1.6">{item.desc}</Text>
                      <Text fontSize="4xl" fontWeight="900" color="teal.500" opacity="0.1" position="absolute" top={6} right={8}>{item.step}</Text>
                   </VStack>
                 ))}
              </SimpleGrid>
           </VStack>
        </Container>
      </Box>

      {/* 📝 BOOKING FORM SECTION */}
      <Box py={{ base: 20, md: 32 }} position="relative">
        {/* Background Accent */}
        <Box 
          position="absolute"
          top={0} left="50%"
          w="100vw" h="100%"
          bg="teal.800"
          transform="translateX(-50%)"
          zIndex={0}
          clipPath={{ base: "none", md: "polygon(0 15%, 100% 0, 100% 85%, 0 100%)" }}
        />

        <Container maxW="5xl" position="relative" zIndex={1}>
           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12} alignItems="center">
              {/* Left Side: Content */}
              <VStack align="start" spacing={8} pr={{ md: 10 }} color="white">
                 <Heading 
                   size="2xl" 
                   fontFamily="'Playfair Display', serif"
                   lineHeight="1.2"
                 >
                   Ready to <Text as="span" color="teal.300">Start?</Text>
                 </Heading>
                 <Text fontSize="lg" opacity={0.9} lineHeight="1.8">
                    Fill in your details and our coordination team will reach out within 24 hours 
                    to schedule your free 30-minute screening call.
                 </Text>
                 
                 <VStack align="start" spacing={6} w="full">
                    <HStack spacing={4}>
                       <Center w="50px" h="50px" borderRadius="full" bg="whiteAlpha.100"><Icon as={FiShield} color="teal.300" /></Center>
                       <Box>
                          <Text fontWeight="700">Confidential Space</Text>
                          <Text fontSize="sm" opacity={0.7}>Your privacy is our clinical priority.</Text>
                       </Box>
                    </HStack>
                    <HStack spacing={4}>
                       <Center w="50px" h="50px" borderRadius="full" bg="whiteAlpha.100"><Icon as={FiClock} color="teal.300" /></Center>
                       <Box>
                          <Text fontWeight="700">Swift Response</Text>
                          <Text fontSize="sm" opacity={0.7}>Get matched within 24-48 business hours.</Text>
                       </Box>
                    </HStack>
                 </VStack>
              </VStack>

              {/* Right Side: Form Card */}
              <MotionBox
                bg="white"
                p={{ base: 8, md: 12 }}
                borderRadius="3rem"
                shadow="2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                 <VStack as="form" onSubmit={handleSubmit} spacing={6}>
                    <FormControl isRequired>
                       <FormLabel fontSize="sm" fontWeight="800" color="gray.400">FULL NAME</FormLabel>
                       <Input 
                         variant="flushed" 
                         placeholder="Jane Doe" 
                         borderColor="gray.100" 
                         focusBorderColor="teal.500" 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                       <FormControl isRequired>
                          <FormLabel fontSize="sm" fontWeight="800" color="gray.400">EMAIL</FormLabel>
                          <Input 
                            type="email" 
                            variant="flushed" 
                            placeholder="jane@example.com" 
                            borderColor="gray.100" 
                            focusBorderColor="teal.500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                       </FormControl>
                       <FormControl isRequired>
                          <FormLabel fontSize="sm" fontWeight="800" color="gray.400">PHONE</FormLabel>
                          <Input 
                            variant="flushed" 
                            placeholder="+91 0000 000 000" 
                            borderColor="gray.100" 
                            focusBorderColor="teal.500"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                       </FormControl>
                    </SimpleGrid>

                    <FormControl isRequired>
                       <FormLabel fontSize="sm" fontWeight="800" color="gray.400">SERVICE TYPE</FormLabel>
                       <Select 
                         variant="flushed" 
                         placeholder="Select Service" 
                         borderColor="gray.100" 
                         focusBorderColor="teal.500"
                         value={formData.service}
                         onChange={(e) => setFormData({...formData, service: e.target.value})}
                       >
                          <option>Individual Therapy</option>
                          <option>Couples Therapy</option>
                          <option>Adolescent Therapy</option>
                          <option>Group Support</option>
                       </Select>
                    </FormControl>

                    <FormControl>
                       <FormLabel fontSize="sm" fontWeight="800" color="gray.400">NOTES (OPTIONAL)</FormLabel>
                       <Textarea 
                         variant="flushed" 
                         placeholder="Tell us a little about your journey..." 
                         borderColor="gray.100" 
                         focusBorderColor="teal.500"
                         value={formData.notes}
                         onChange={(e) => setFormData({...formData, notes: e.target.value})}
                       />
                    </FormControl>

                    <Button
                      type="submit"
                      w="full"
                      bg="teal.800"
                      color="white"
                      size="lg"
                      borderRadius="full"
                      h={16}
                      fontSize="md"
                      fontWeight="700"
                      rightIcon={<FiSend />}
                      isLoading={isLoading}
                      _hover={{ bg: "teal.900", transform: "scale(1.02)" }}
                    >
                      Submit Request
                    </Button>
                 </VStack>
              </MotionBox>
           </SimpleGrid>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box py={{ base: 20, md: 32 }} bg="white">
        <Container maxW="4xl">
           <VStack spacing={12}>
              <VStack textAlign="center" spacing={4}>
                 <Heading fontFamily="'Playfair Display', serif" size="xl">Frequently Asked</Heading>
                 <Text color="gray.500">Clarifying the first steps toward healing.</Text>
              </VStack>

              <Accordion allowToggle w="full">
                {[
                  {
                    q: "Do I need to know what’s wrong before I book?",
                    a: "Not at all. Many clients begin therapy with uncertainty or a general sense of distress. Our screening call and initial sessions are specifically designed to clarify your concerns together."
                  },
                  {
                    q: "What happens in the 30-minute screening call?",
                    a: "The screening call is a bridge. It's a structured conversation to understand your needs, explain the MLC approach, assess clinical fit, and match you with the right specialist."
                  },
                  {
                    q: "Is therapy available outside of India?",
                    a: "Yes, we offer secure online therapy globally, provided scheduling align with IST (Indian Standard Time). We've worked with clients across Europe, the Middle East, and Southeast Asia."
                  }
                ].map((item, idx) => (
                  <AccordionItem key={idx} border="none" mb={4}>
                     <AccordionButton 
                       p={6} 
                       bg="#FDFBFA" 
                       borderRadius="2xl" 
                       _hover={{ bg: "teal.50" }}
                       transition="0.3s"
                     >
                        <Box flex="1" textAlign="left" fontWeight="700" color="teal.900">
                           {item.q}
                        </Box>
                        <AccordionIcon />
                     </AccordionButton>
                     <AccordionPanel pb={8} px={6} color="gray.600" lineHeight="1.8">
                        {item.a}
                     </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
           </VStack>
        </Container>
      </Box>

      {/* 📞 CONTACT FOOTER FOOTNOTE */}
      <Box py={16} textAlign="center" borderTop="1px solid" borderColor="gray.100">
         <Text color="gray.400" fontSize="sm" mb={4}>FOR IMMEDIATE ASSISTANCE</Text>
         <Heading size="lg" color="teal.800" mb={6} fontFamily="'Playfair Display', serif">contact@mlchealth.in</Heading>
         <HStack justify="center" spacing={6}>
            <Button variant="link" color="teal.600" leftIcon={<FiInfo />}>Privacy Policy</Button>
            <Button variant="link" color="teal.600">Client Agreement</Button>
         </HStack>
      </Box>
    </Box>
  );
}
