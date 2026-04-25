'use client'

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  SimpleGrid,
  Icon,
  Stack,
  Flex,
  Badge,
  Circle,
  Divider
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiSmile, FiCheck, FiArrowRight, FiEdit3, FiZap, 
  FiSun, FiCoffee, FiShield, FiHeart, FiUsers
} from "react-icons/fi";
import NextLink from "next/link";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function AdolescentTherapyPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <Box bg="#FDFBFA" overflow="hidden">
      {/* 🌿 HERO SECTION */}
      <Box position="relative" h={{ base: "auto", lg: "90vh" }} bg="white">
        <Flex direction={{ base: "column", lg: "row" }} h="full">
          <MotionVStack 
            flex="1" 
            justify="center" 
            align="start" 
            p={{ base: 8, md: 16, lg: 24 }} 
            spacing={8}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge 
              bg="blue.50" 
              color="blue.800" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="xs" 
              fontWeight="800" 
              letterSpacing="2px"
            >
              YOUTH SERVICES
            </Badge>
            <Heading 
              fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }} 
              fontFamily="'Forum', serif" 
              color="teal.900" 
              lineHeight="1.1"
            >
              Adolescent <br /> Therapy
            </Heading>
            <Text 
              fontSize={{ base: "lg", md: "xl" }} 
              color="gray.600" 
              maxW="500px" 
              fontFamily="'Inter', sans-serif"
              lineHeight="tall"
            >
              A space for self-expression and discovery. We provide creative, safe, and developmentally-informed therapy for teenagers and young adults navigating the complexities of modern youth.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4} w="full">
              <Button 
                as={NextLink} 
                href="/therapists/discovery" 
                size="xl" 
                bg="teal.800" 
                color="white" 
                h="64px" 
                px={10} 
                borderRadius="full" 
                _hover={{ bg: "teal.900", transform: "translateY(-2px)" }}
                transition="all 0.3s"
                rightIcon={<FiArrowRight />}
              >
                Find an Adolescent Specialist
              </Button>
              <Button 
                as={NextLink} 
                href="/contactus" 
                size="xl" 
                variant="outline" 
                borderColor="teal.100" 
                h="64px" 
                px={10} 
                borderRadius="full"
                _hover={{ bg: "teal.50" }}
              >
                Talk to a Care Coordinator
              </Button>
            </Stack>
          </MotionVStack>
          
          <Box flex="1.2" position="relative" overflow="hidden">
            <MotionBox
              h="full"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <Image 
                src="/adolescent_therapy_hero.png" 
                alt="Teenager in a creative therapy space" 
                objectFit="cover" 
                h="full" 
                w="full" 
              />
            </MotionBox>
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              w="full" 
              h="full" 
              bgGradient="linear(to-r, white, transparent 30%)" 
              display={{ base: "none", lg: "block" }}
            />
          </Box>
        </Flex>
      </Box>

      {/* 🎨 CREATIVE EXPRESSION */}
      <Container maxW="7xl" py={{ base: 20, md: 32 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={20} alignItems="center">
          <Box position="relative">
            <Image 
              src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800" 
              borderRadius="3xl" 
              shadow="2xl" 
              alt="Creative arts in therapy"
            />
            <Circle 
              position="absolute" 
              bottom="-20px" 
              right="-20px" 
              bg="mlc.gold" 
              size="150px" 
              shadow="xl"
              display={{ base: "none", md: "flex" }}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              p={4}
              textAlign="center"
            >
              <Icon as={FiZap} boxSize={8} color="teal.900" mb={2} />
              <Text fontWeight="800" fontSize="xs" color="teal.900" lineHeight="tight">CREATIVE TOOLS</Text>
            </Circle>
          </Box>

          <VStack align="start" spacing={8}>
            <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">
              Where Words <br /> Aren't Always Needed.
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Adolescent therapy at MLC recognizes that traditional talk therapy can sometimes feel daunting. We integrate art, narrative tools, and creative expression to help teens share their internal world.
            </Text>
            <Text fontSize="lg" color="gray.600" lineHeight="tall">
              Our specialists are trained in developmental psychology and relational safety, ensuring that every session is a collaborative partnership rather than an interrogation.
            </Text>
            
            <SimpleGrid columns={2} spacing={6} w="full">
              {[
                { title: "Academic Stress", icon: FiZap },
                { title: "Identity Discovery", icon: FiSun },
                { title: "Social Anxiety", icon: FiUsers },
                { title: "Emotional Literacy", icon: FiEdit3 },
              ].map((item, i) => (
                <HStack key={i} spacing={3}>
                  <Icon as={item.icon} color="teal.500" />
                  <Text fontWeight="700" color="teal.900" fontSize="sm">{item.title}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* 🛡️ SAFE HARBOR */}
      <Box bg="teal.900" py={32} color="white">
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={20} alignItems="center">
            <VStack align="start" spacing={10}>
              <VStack align="start" spacing={4}>
                <Badge colorScheme="whiteAlpha">THE MLC PROMISE</Badge>
                <Heading size="3xl" fontFamily="'Forum', serif">A Safe Harbor.</Heading>
              </VStack>
              
              <VStack align="stretch" spacing={8}>
                <Box>
                  <HStack mb={2}>
                    <Icon as={FiShield} color="mlc.gold" />
                    <Text fontWeight="800" fontSize="xs" letterSpacing="2px">CONFIDENTIALITY</Text>
                  </HStack>
                  <Text color="whiteAlpha.700">We maintain a clear framework of privacy that respects the adolescent's autonomy while ensuring safety parameters are in place.</Text>
                </Box>
                <Box>
                  <HStack mb={2}>
                    <Icon as={FiHeart} color="mlc.gold" />
                    <Text fontWeight="800" fontSize="xs" letterSpacing="2px">RELATIONAL ALLIANCE</Text>
                  </HStack>
                  <Text color="whiteAlpha.700">The therapeutic relationship is built on trust, authenticity, and a non-judgmental stance towards the teen's lived experience.</Text>
                </Box>
                <Box>
                  <HStack mb={2}>
                    <Icon as={FiCoffee} color="mlc.gold" />
                    <Text fontWeight="800" fontSize="xs" letterSpacing="2px">SYSTEMIC SUPPORT</Text>
                  </HStack>
                  <Text color="whiteAlpha.700">We provide guidance for parents and families to create a supportive environment at home without compromising the teen's privacy.</Text>
                </Box>
              </VStack>
            </VStack>
            
            <Image 
              src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800" 
              borderRadius="4xl" 
              shadow="2xl" 
              alt="Teenager feeling supported"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* ❔ FAQ SECTION */}
      <Box bg="gray.50" py={32}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" fontFamily="'Forum', serif" color="teal.900">Parent & Teen FAQ</Heading>
              <Text color="gray.500">Frequently asked questions about adolescent sessions.</Text>
            </VStack>

            <Accordion allowToggle w="full">
              {[
                { q: "What is the starting age for adolescent therapy?", a: "We typically work with adolescents from age 13 through young adulthood. For younger children, we may recommend specific play therapy specialists." },
                { q: "Will I know what my child talks about?", a: "Confidentiality is vital for the success of teen therapy. We share progress updates with parents but keep specific session details private unless there is a safety concern." },
                { q: "How involved are parents in the process?", a: "We believe in a systemic approach. While the teen has their private space, we often schedule separate parent guidance sessions to support the home environment." },
                { q: "Do you offer online sessions for teens?", a: "Yes. Many adolescents find the virtual space comfortable and familiar. We use secure, interactive platforms to keep them engaged." },
              ].map((item, i) => (
                <AccordionItem key={i} border="none" mb={4} bg="white" borderRadius="2xl" overflow="hidden" shadow="sm">
                  <AccordionButton py={6} _hover={{ bg: "teal.50" }}>
                    <Box flex="1" textAlign="left" fontWeight="700" color="teal.900">
                      {item.q}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6} color="gray.600" lineHeight="tall">
                    {item.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* 🚀 CTA SECTION */}
      <Box bg="teal.800" py={24}>
        <Container maxW="7xl">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={10}>
            <VStack align="start" spacing={4}>
              <Heading size="2xl" color="white" fontFamily="'Forum', serif">Support the next chapter.</Heading>
              <Text color="whiteAlpha.800" fontSize="lg">Give your teen the space they need to thrive.</Text>
            </VStack>
            <Button 
              as={NextLink} 
              href="/therapists/discovery" 
              size="xl" 
              bg="white" 
              color="teal.900" 
              h="64px" 
              px={12} 
              borderRadius="full" 
              fontWeight="800"
              _hover={{ transform: "scale(1.05)", bg: "teal.50" }}
              transition="all 0.3s"
            >
              Browse Youth Specialists
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
