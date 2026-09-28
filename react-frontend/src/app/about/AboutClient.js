'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, SimpleGrid, Heading, Text, Image, Button, VStack, HStack, Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiShield, FiHeart, FiActivity, FiArrowRight, FiTarget, FiSun, FiZap } from "react-icons/fi";
import { apiGet } from "../../api.js";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const defaultAboutContent = {
  hero: {
    title: "Highest Quality Therapy, Vetted for Excellence",
    body: "At MLC Therapy, we don\u2019t just provide therapy; we curate it. Our collective is built on a foundation of rigorous clinical vetting, relational depth, and unwavering ethical standards. We believe that for therapy to be effective, it must be structured, safe, and deeply aligned with your unique story.",
    cta_label: "Meet the Collective",
    cta_link: "/meettheteam",
  },
  pillars: [
    {
      title: "Vetted Clinicians",
      icon: FiShield,
      body: "Every therapist in our collective undergoes a multi-stage clinical review. We verify credentials, supervise practice, and ensure they meet our \u2018MLC Standard\u2019 of excellence.",
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const mlcParts = [
  { icon: FiTarget, label: "Mind", desc: "The exploration of our internal landscape: our thoughts, emotional structures, and the psychological patterns that shape our experience of the world." },
  { icon: FiSun, label: "Light", desc: "The illuminating power of insight, clinical awareness, and intentional presence that brings clarity to areas of distress and fosters conscious change." },
  { icon: FiZap, label: "Body", desc: "The tangible needs of our bodies as a vessel for growth." },
];

export default function AboutClient() {
  const [content, setContent] = useState(defaultAboutContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await apiGet("about-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
           setContent(prev => ({...prev, ...data[0]}));
        }
      } catch (err) {
        console.error("Failed to fetch about content", err);
      }
    };
    fetchContent();
  }, []);

  return (
    <Box bg="#FDFBFA" overflowX="hidden" color="#263A33">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <Box
        position="relative"
        py={{ base: 12, md: 16 }}
        overflow="hidden"
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, #FDFBFA 0%, #F4F1EC 40%, #E9F2ED 100%)"
          zIndex={0}
        />
        <Box
          position="absolute"
          top="-80px"
          right="10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.2) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
          zIndex={0}
        />

        <Container maxW="6xl" position="relative" zIndex={1}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 12 }} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VStack align="start" spacing={{ base: 3.5, md: 4.5 }}>
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="2.5px"
                  textTransform="uppercase"
                  color="#C9A960"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  The MLC Promise
                </Text>
                <Heading
                  as="h1"
                  fontSize={{ base: "28px", md: "38px" }}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  color="#263A33"
                  lineHeight="1.25"
                  fontWeight="600"
                >
                  {content.hero.title}
                </Heading>
                <Text
                  fontSize={{ base: "14px", md: "15px" }}
                  color="rgba(46,46,46,0.74)"
                  lineHeight="1.8"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  maxW="xl"
                >
                  {content.hero.body}
                </Text>
                <HStack spacing={3} pt={2} flexWrap="wrap">
                  <LinkButton
                    href="/therapists/discovery"
                    bg="#56756D"
                    color="white"
                    borderRadius="full"
                    h="42px"
                    px={7}
                    fontSize="13.5px"
                    fontWeight="600"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    shadow="md"
                    _hover={{ bg: "#C9A960", transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.3s ease"
                  >
                    Find Your Match
                  </LinkButton>
                  <LinkButton
                    href="/meettheteam"
                    variant="ghost"
                    color="#56756D"
                    h="42px"
                    px={5}
                    fontSize="13.5px"
                    fontWeight="600"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    rightIcon={<FiArrowRight />}
                    _hover={{ color: "#C9A960" }}
                  >
                    Meet the Team
                  </LinkButton>
                </HStack>
              </VStack>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src="/about_serene_therapy_office.png"
                alt="Modern, professional therapy office at MLC Health and Wellness Centre"
                borderRadius="2xl"
                shadow="0 12px 40px rgba(86,117,109,0.15)"
                objectFit="cover"
                h={{ base: "280px", md: "380px" }}
                w="full"
                fallback={<Box h="380px" w="full" bg="gray.100" borderRadius="2xl" />}
              />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ OUR PILLARS ═══════════════ */}
      <Box py={{ base: 12, md: 16 }} bg="#FDFBFA" position="relative">
        <Box
          position="absolute"
          bottom="-100px"
          left="5%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201,169,96,0.08) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="6xl">
          <VStack spacing={{ base: 8, md: 10 }}>
            <VStack spacing={2.5} textAlign="center" maxW="2xl">
              <Text
                fontSize="11px"
                fontWeight="700"
                letterSpacing="2.5px"
                textTransform="uppercase"
                color="#56756D"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Our Foundation
              </Text>
              <Heading
                color="#263A33"
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontSize={{ base: "24px", md: "32px" }}
                fontWeight="600"
              >
                The Pillars of Our Collective
              </Heading>
              <Text
                color="rgba(46,46,46,0.7)"
                fontSize="14.5px"
                lineHeight="1.7"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                We&apos;ve moved away from the &lsquo;marketplace&rsquo; model to a supervised clinical collective. This is how we ensure the highest standard of care.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
              {content.pillars.map((pillar, i) => (
                <MotionBox
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                >
                  <Box
                    bg="white"
                    borderRadius="2xl"
                    p={{ base: 6, md: 7 }}
                    boxShadow="0 4px 24px rgba(86,117,109,0.07)"
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.08)"
                    _hover={{ transform: "translateY(-5px)", boxShadow: "0 12px 40px rgba(86,117,109,0.12)" }}
                    transition="all 0.4s cubic-bezier(0.4,0,0.2,1)"
                    h="100%"
                  >
                    <Box
                      w="42px"
                      h="42px"
                      borderRadius="xl"
                      bg="rgba(169,203,183,0.15)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb={3.5}
                    >
                      <Icon as={pillar.icon || FiCheckCircle} boxSize={5} color="#56756D" />
                    </Box>
                    <Heading
                      fontSize="17px"
                      color="#263A33"
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      fontWeight="600"
                      mb={2}
                    >
                      {pillar.title}
                    </Heading>
                    <Text
                      color="rgba(46,46,46,0.7)"
                      fontSize="13.5px"
                      lineHeight="1.7"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                    >
                      {pillar.body}
                    </Text>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>


      {/* ═══════════════ MLC IDENTITY ═══════════════ */}
      <Box
        py={{ base: 12, md: 16 }}
        color="white"
        position="relative"
        overflow="hidden"
        bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)"
      >
        <Box
          position="absolute"
          top="-10%"
          right="-10%"
          w="40%"
          h="40%"
          bg="rgba(169,203,183,0.1)"
          borderRadius="full"
          filter="blur(100px)"
          pointerEvents="none"
        />

        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 12 }} alignItems="center">
            <MotionBox
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <VStack align="start" spacing={4.5}>
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="2.5px"
                  textTransform="uppercase"
                  color="rgba(201,169,96,0.95)"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  Our Philosophy
                </Text>
                <Heading
                  fontSize={{ base: "24px", md: "32px" }}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontWeight="600"
                  lineHeight="1.25"
                >
                  The Meaning Behind MLC
                </Heading>
                <Text
                  fontSize={{ base: "14px", md: "14.5px" }}
                  opacity={0.92}
                  lineHeight="1.75"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  <strong>MLC</strong> stands for <strong>Mentis, Lumine et Corpus</strong>, Latin for Mind, Light, and Body. Our name encapsulates our philosophy: that true healing happens when we bring the <strong>&lsquo;Light&rsquo;</strong> of insight, awareness and intentional presence, in line with the work on our <strong>&lsquo;Mind&rsquo;</strong> and the <strong>&lsquo;Body&rsquo;</strong>.
                </Text>

                <VStack align="start" spacing={3.5} w="full" pt={1}>
                  {mlcParts.map((part, idx) => (
                    <HStack key={idx} spacing={3.5} align="start">
                      <Box
                        w="34px"
                        h="34px"
                        minW="34px"
                        borderRadius="xl"
                        bg="rgba(169,203,183,0.2)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mt={0.5}
                      >
                        <Icon as={part.icon} boxSize={3.5} color="rgba(169,203,183,0.9)" />
                      </Box>
                      <VStack align="start" spacing={0.5}>
                        <Text fontWeight="700" fontSize="14px" fontFamily="'Inter', var(--font-inter), sans-serif">
                          {part.label}
                        </Text>
                        <Text fontSize="13px" opacity={0.82} lineHeight="1.65" fontFamily="'Inter', var(--font-inter), sans-serif">
                          {part.desc}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Image
                src="/about_mlc_philosophy.png"
                alt="Visual representing Mentis, Lumine et Corpus philosophy"
                borderRadius="2xl"
                shadow="0 12px 40px rgba(0,0,0,0.2)"
                objectFit="cover"
                h={{ base: "280px", md: "380px" }}
                w="full"
                fallback={<Box h="380px" w="full" bg="rgba(169,203,183,0.2)" borderRadius="2xl" />}
              />
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ FOUNDER MESSAGE ═══════════════ */}
      <Box
        py={{ base: 12, md: 16 }}
        position="relative"
        overflow="hidden"
        bg="linear-gradient(180deg, #FDFBFA 0%, #F4F1EC 100%)"
      >
        <Container maxW="2xl" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <VStack
              spacing={4}
              textAlign="center"
              p={{ base: 6, md: 8 }}
              bg="rgba(255,255,255,0.9)"
              backdropFilter="blur(16px)"
              borderRadius="2xl"
              boxShadow="0 4px 24px rgba(86,117,109,0.06)"
              border="1px solid"
              borderColor="rgba(86,117,109,0.08)"
            >
              <Heading
                fontSize={{ base: "18px", md: "22px" }}
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                color="#263A33"
                fontWeight="600"
              >
                A Message from the Founder
              </Heading>
              <Text
                fontSize={{ base: "14px", md: "14.5px" }}
                color="rgba(46,46,46,0.72)"
                lineHeight="1.8"
                fontStyle="italic"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                maxW="xl"
              >
                &ldquo;When I began my journey, I saw countless skilled therapists leave the field not because they lacked passion, but because they lacked support. MLC Therapy is a response to that; a community where therapists feel as held as the clients they serve. For you, it means therapy that is structured, ethical, and deeply human.&rdquo;
              </Text>
              <VStack spacing={0.5} pt={1}>
                <Text
                  fontWeight="600"
                  fontSize="13.5px"
                  color="#263A33"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  Asma, B.A(Hons), M.Sc
                </Text>
                <Text
                  color="#C9A960"
                  fontWeight="700"
                  letterSpacing="2px"
                  fontSize="10px"
                  textTransform="uppercase"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                >
                  Founder & Clinical Lead
                </Text>
              </VStack>
            </VStack>
          </MotionBox>
        </Container>
      </Box>


      {/* ═══════════════ CTA ═══════════════ */}
      <Box
        py={{ base: 12, md: 16 }}
        bg="linear-gradient(135deg, #3A5A50 0%, #56756D 50%, #4A6B62 100%)"
        color="white"
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-80px"
          right="-60px"
          w="250px"
          h="250px"
          borderRadius="full"
          bg="rgba(169,203,183,0.1)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-60px"
          left="-40px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(201,169,96,0.1)"
          pointerEvents="none"
        />

        <Container maxW="3xl" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <VStack spacing={4.5}>
              <Heading
                fontSize={{ base: "24px", md: "32px" }}
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
                lineHeight="1.25"
              >
                Ready to find the right care?
              </Heading>
              <Text
                fontSize={{ base: "14px", md: "14.5px" }}
                opacity={0.92}
                maxW="lg"
                lineHeight="1.7"
                fontFamily="'Inter', var(--font-inter), sans-serif"
              >
                Start our clinical discovery quiz to be matched with a vetted specialist tailored to your specific needs.
              </Text>
              <LinkButton
                href="/therapists/discovery"
                bg="white"
                color="#263A33"
                borderRadius="full"
                h="44px"
                px={8}
                fontWeight="600"
                fontSize="13.5px"
                fontFamily="'Inter', var(--font-inter), sans-serif"
                shadow="md"
                _hover={{ bg: "rgba(255,255,255,0.9)", transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.3s ease"
              >
                Start Your Discovery
              </LinkButton>
            </VStack>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  );
}
