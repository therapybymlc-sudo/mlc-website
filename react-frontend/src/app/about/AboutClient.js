'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, SimpleGrid, Heading, Text, Image, Button, VStack, HStack, Icon, Divider, Badge, Stack, chakra, useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiShield, FiHeart, FiActivity, FiArrowRight, FiTarget, FiUsers } from "react-icons/fi";
import { apiGet } from "../../api.js";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const defaultAboutContent = {
  hero: {
    title: "Highest Quality Therapy, Vetted for Excellence.",
    body: "At MLC Therapy, we don't just provide therapy; we curate it. Our collective is built on a foundation of rigorous clinical vetting, relational depth, and unwavering ethical standards. We believe that for therapy to be effective, it must be structured, safe, and deeply aligned with your unique story.",
    cta_label: "Meet the Collective",
    cta_link: "/meettheteam",
    image_url: "serene_therapy_office_1776423989664", // Using generated image
  },
  pillars: [
    {
      title: "Vetted Clinicians",
      icon: FiShield,
      body: "Every therapist in our collective undergoes a multi-stage clinical review. We verify credentials, supervise practice, and ensure they meet our 'MLC Standard' of excellence.",
    },
    {
      title: "Relational Safety",
      icon: FiHeart,
      body: "Beyond skills, we value attunement. Our process ensures you are paired with a human being who can hold your story with the respect and depth it deserves.",
    },
    {
      title: "Clinical Integrity",
      icon: FiActivity,
      body: "We move away from improvisation. Every session is grounded in evidence-informed frameworks like CBT, DBT, and Psychodynamic therapy, tailored to your needs.",
    },
  ],
};

export default function AboutClient() {
  const [content, setContent] = useState(defaultAboutContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiGet("about-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
           // We'll merge with our new refined logic
           setContent(prev => ({...prev, ...data[0]}));
        }
      } catch (err) {
        console.error("Failed to fetch about content", err);
      }
    };
    fetchContent();
  }, []);

  const bgGradient = "linear(to-br, #FDFBFA, #F5F9F7)";

  return (
    <Box bg="#FDFBFA" minH="100vh">
      {/* 🌟 HERO SECTION */}
      <Box pt={32} pb={20} px={6} bgGradient={bgGradient}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16} alignItems="center">
            <VStack align="start" spacing={8}>
              <Badge colorScheme="teal" px={4} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest">THE MLC PROMISE</Badge>
              <Heading as="h1" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} fontFamily="'Playfair Display', serif" color="teal.900" lineHeight="1.1" fontWeight="600">
                {content.hero.title}
              </Heading>
              <Text fontSize="xl" color="gray.600" lineHeight="tall" maxW="xl">
                {content.hero.body}
              </Text>
              <HStack spacing={4}>
                <LinkButton href="/therapists/discovery" bg="teal.800" color="white" borderRadius="full" px={10} py={7} _hover={{ bg: "teal.900", transform: "translateY(-2px)" }} transition="all 0.3s">
                  Find Your Match
                </LinkButton>
                <LinkButton href="/meettheteam" variant="ghost" color="teal.800" rightIcon={<FiArrowRight />}>
                  Meet the Team
                </LinkButton>
              </HStack>
            </VStack>
            <MotionBox initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
              <Image 
                src={`/api/media_proxy?path=${encodeURIComponent('/Users/asma02/.gemini/antigravity/brain/2bfefee7-901c-4f8a-baad-d895398db39d/serene_therapy_office_1776423989664.png')}`} 
                alt="MLC Serene Office" 
                borderRadius="3rem" 
                shadow="2xl" 
                objectFit="cover"
                h={{ base: "400px", md: "600px" }}
                w="full"
              />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 🏛️ OUR PILLARS */}
      <Box py={24} px={6}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading color="teal.900" fontFamily="'Playfair Display', serif" fontSize="4xl">The Pillars of Our Collective</Heading>
              <Text color="gray.600" fontSize="lg">We’ve moved away from the 'marketplace' model to a supervised clinical collective. This is how we ensure the highest standard of care.</Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
              {content.pillars.map((pillar, i) => (
                <VStack key={i} align="start" p={10} bg="white" borderRadius="2rem" shadow="sm" border="1px solid" borderColor="teal.50" transition="all 0.3s" _hover={{ shadow: "xl", transform: "translateY(-5px)" }}>
                  <Icon as={pillar.icon || FiCheckCircle} w={10} h={10} color="teal.500" mb={4} />
                  <Heading size="md" color="teal.800" mb={2}>{pillar.title}</Heading>
                  <Text color="gray.600" lineHeight="relaxed">{pillar.body}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 💡 THE MLC IDENTITY */}
      <Box bg="teal.900" py={24} color="white" position="relative" overflow="hidden">
        <Box position="absolute" top="-10%" right="-10%" w="40%" h="40%" bg="teal.800" borderRadius="full" filter="blur(100px)" opacity="0.3" />
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16} alignItems="center">
            <MotionBox initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <VStack align="start" spacing={8}>
                <Heading fontSize="4xl" fontFamily="'Playfair Display', serif">The Meaning Behind MLC</Heading>
                <Text fontSize="lg" opacity="0.9" lineHeight="1.8">
                  <b>MLC</b> stands for <b>Mentis, Lumine et Corpus</b>—Latin for Mind, Light, and Body. Our name encapsulates our philosophy: that true healing happens when we bring the <b>'Light'</b> of clinical clarity to the complexities of the <b>'Mind'</b> and the <b>'Body'</b>.
                </Text>
                <VStack align="start" spacing={4}>
                  <HStack spacing={4}><Icon as={FiTarget} color="teal.300" /><Text fontWeight="600">Mind: Psychological and emotional structure.</Text></HStack>
                  <HStack spacing={4}><Icon as={FiActivity} color="teal.300" /><Text fontWeight="600">Light: Clarity, insight, and clinical truth.</Text></HStack>
                  <HStack spacing={4}><Icon as={FiHeart} color="teal.300" /><Text fontWeight="600">Body: Physical grounding and nervous system safety.</Text></HStack>
                </VStack>
              </VStack>
            </MotionBox>
            <MotionBox initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
               <Image 
                 src={`/api/media_proxy?path=${encodeURIComponent('/Users/asma02/.gemini/antigravity/brain/2bfefee7-901c-4f8a-baad-d895398db39d/clinical_matching_graph_1776424018069.png')}`} 
                 alt="Clinical Insight" 
                 borderRadius="3rem"
               />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* 👩‍💼 FOUNDER MESSAGE */}
      <Box py={24} px={6}>
        <Container maxW="7xl">
          <Box p={{ base: 8, md: 16 }} bg="white" borderRadius="4rem" shadow="2xl" border="1px solid" borderColor="gray.100">
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={16} alignItems="center">
                <Box order={{ base: 2, md: 1 }}>
                  <Heading size="xl" fontFamily="'Playfair Display', serif" color="teal.900" mb={8}>A Message from the Founder</Heading>
                  <Text fontSize="lg" color="gray.600" lineHeight="1.8" fontStyle="italic">
                    “I saw countless skilled therapists leave the field not because they lacked passion, but because they lacked support. MLC Therapy is a response to that; a community where therapists feel as held as the clients they serve. For you, it means therapy that is structured, ethical, and deeply human.”
                  </Text>
                  <Box mt={8}>
                    <Text fontWeight="800" fontSize="xl" color="teal.800">Asma Imadi</Text>
                    <Text color="gray.500" fontWeight="600">Founder, Psychologist & Clinical Lead</Text>
                  </Box>
                </Box>
                <Box order={{ base: 1, md: 2 }}>
                   <Image src="/founder_portrait_new.jpg" alt="Asma Imadi" borderRadius="3rem" shadow="xl" h="500px" w="full" objectFit="cover" />
                </Box>
             </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {/* 🚀 CTA */}
      <Box py={24} bgGradient="linear(to-r, teal.800, teal.900)" color="white" textAlign="center">
         <Container maxW="3xl">
            <VStack spacing={8}>
              <Heading fontSize="4xl" fontFamily="'Playfair Display', serif">Ready to find the right care?</Heading>
              <Text fontSize="lg" opacity="0.8">Start our clinical discovery quiz to be matched with a vetted specialist tailored to your specific needs.</Text>
              <LinkButton href="/therapists/discovery" bg="white" color="teal.900" borderRadius="full" px={12} py={8} height="auto" fontWeight="800" fontSize="lg" _hover={{ bg: "teal.50", transform: "scale(1.05)" }}>
                 Start Your Discovery
              </LinkButton>
            </VStack>
         </Container>
      </Box>
    </Box>
  );
}
