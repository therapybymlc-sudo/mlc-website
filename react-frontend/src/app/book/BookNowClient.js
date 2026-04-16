'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useState } from "react";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementation for booking submission can be added here
    console.log("Booking submitted:", formData);
  };

  return (
    <Box>
      {/* HERO SECTION */}
      <Box bg="#F9F9F9" py={20} px={8}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
                mb={4}
                color="#2E2E2E"
              >
                Book a Session
              </Heading>
              <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E" lineHeight="1.8">
                Taking the first step toward therapy is an act of courage and care.
                Fill in your details below, and our coordination team will reach out
                to schedule your free 30 minute screening call. We’ll help you find
                the right therapist so your journey begins with comfort, clarity,
                and relational safety.
              </Text>
              <Text
                mt={4}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
              >
                We offer secure online therapy across India, including Mumbai,
                Delhi, Bangalore, Hyderabad, Chennai, Pune, and other major
                cities.
              </Text>
            </Box>
            <Image
              src="/therapy-room.jpg"
              alt="MLC Therapy Room"
              borderRadius="2xl"
              boxShadow="md"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* HOW IT WORKS */}
      <Box bg="#E9F2ED" py={20} px={8}>
        <Container maxW="6xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            color="#2E2E2E"
            mb={10}
            fontWeight="600"
          >
            How It Works
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
            {[
              {
                title: "1. Fill the Form",
                desc: "Share your basic details and preferences so we can understand your needs clearly.",
              },
              {
                title: "2. Free Screening Call",
                desc: "A structured conversation to understand your goals, answer questions, assess risk where necessary, and ensure you are matched appropriately.",
              },
              {
                title: "3. Get Matched",
                desc: "Our coordination team assigns you a therapist suited to your goals, therapeutic needs, and preferences.",
              },
              {
                title: "4. Begin Your Journey",
                desc: "Start therapy in a confidential, safe, and structured environment designed to support long-term growth.",
              },
            ].map((step) => (
              <Box
                key={step.title}
                bg="white"
                p={8}
                borderRadius="2xl"
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-4px)" }}
                transition="0.3s ease"
              >
                <Heading
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontSize="xl"
                  color="#2E2E2E"
                  mb={3}
                >
                  {step.title}
                </Heading>
                <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                  {step.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* BOOKING FORM */}
      <Box bg="white" py={24} px={8}>
        <Container maxW="5xl">
          <Heading
            textAlign="center"
            mb={10}
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            color="#2E2E2E"
          >
            Fill Your Details
          </Heading>

          <VStack
            as="form"
            onSubmit={handleSubmit}
            spacing={6}
            bg="#F9F9F9"
            p={10}
            borderRadius="2xl"
            boxShadow="md"
          >
            <FormControl isRequired>
              <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Full Name
              </FormLabel>
              <Input 
                placeholder="Enter your name" 
                bg="white" 
                borderRadius="lg" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Email Address
              </FormLabel>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                bg="white" 
                borderRadius="lg" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Phone Number
              </FormLabel>
              <Input 
                placeholder="Enter your number" 
                bg="white" 
                borderRadius="lg" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
              <FormControl>
                <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                  Preferred Date
                </FormLabel>
                <Input 
                  type="date" 
                  bg="white" 
                  borderRadius="lg" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                  Preferred Time
                </FormLabel>
                <Input 
                  type="time" 
                  bg="white" 
                  borderRadius="lg" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Type of Service
              </FormLabel>
              <Select 
                placeholder="Select a service" 
                bg="white" 
                borderRadius="lg"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                <option>Individual Therapy</option>
                <option>Couples Therapy</option>
                <option>Adolescent Therapy</option>
                <option>Group & Support Circles</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                Additional Notes (optional)
              </FormLabel>
              <Textarea
                placeholder="Share anything you'd like us to know"
                bg="white"
                borderRadius="lg"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </FormControl>

            <Button
              type="submit"
              mt={4}
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={12}
              py={6}
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontWeight="600"
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              Submit Booking Request
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* FAQ */}
      <Box bg="#E9F2ED" py={24} px={8}>
        <Container maxW="6xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            color="#2E2E2E"
            mb={8}
            fontWeight="600"
          >
            Not Sure If You’re Ready Yet?
          </Heading>
          <Accordion allowToggle maxW="3xl" mx="auto">
            <AccordionItem border="none" mb={4} bg="white" borderRadius="lg">
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="600">
                  Do I need to know what’s wrong before I book?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                No. Many clients begin therapy with uncertainty. The screening call and first session are spaces to clarify your concerns together.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem border="none" mb={4} bg="white" borderRadius="lg">
              <AccordionButton py={4}>
                <Box flex="1" textAlign="left" fontWeight="600">
                  What happens in the screening call?
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                The screening call is a brief structured conversation to understand your needs, explain how therapy works at MLC, and match you with the right therapist.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Container>
      </Box>
    </Box>
  );
}
