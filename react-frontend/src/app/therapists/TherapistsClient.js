'use client'

import React from "react";
import {
  Box, Container, VStack, HStack, Heading, Text, Button, SimpleGrid, Icon, Image, Badge, Stack, Circle, Flex, Divider, 
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { 
  FiActivity, FiVideo, FiBookOpen, FiUsers, FiAward,
  FiClipboard, FiZap, FiBarChart2, FiGlobe, FiWind, FiSun, FiNavigation, FiMessageSquare
} from "react-icons/fi";
import NextLink from "next/link";
import LinkButton from "../../components/LinkButton";

const MotionBox = motion(Box);

const ECOSYSTEM_FEATURES = [
  {
    title: "Clinical Admin Command Center",
    icon: FiClipboard,
    desc: "From SOAP notes and scheduling to consent workflows and smart documentation, your entire practice stack runs in one place."
  },
  {
    title: "In-House Secure Video Sessions",
    icon: FiVideo,
    desc: "Host therapy sessions directly inside MLC with a stable, privacy-first environment designed specifically for clinical conversations."
  },
  {
    title: "Secure Clinical Chat",
    icon: FiMessageSquare,
    desc: "Coordinate with clients safely without exposing your personal number, while keeping all communication linked to care workflows."
  },
  {
    title: "Billing & Invoicing Automation",
    icon: FiBarChart2,
    desc: "Generate invoices, track payments, and cut repetitive admin work so you can reclaim hours each week for high-value clinical care."
  },
  {
    title: "The Shared Therapeutic Journey",
    icon: FiGlobe,
    desc: "Clients get a connected care dashboard for goals, resources, and reflections, so continuity and collaboration stay strong between sessions."
  }
];

const SELF_CARE_TOOLS = [
  { title: "Mindfulness Practices", icon: FiWind, desc: "Breath-work and presence tools to anchor yourself between sessions." },
  { title: "Guided Meditations", icon: FiSun, desc: "A library of auditory journeys to restore calm and focus." },
  { title: "Body Scans", icon: FiActivity, desc: "Somatic check-ins to release physical tension held from clinical sessions." },
  { title: "Grounding Exercises", icon: FiNavigation, desc: "Tactile and visual techniques for nervous system regulation." },
  { title: "MHP Support Events", icon: FiUsers, desc: "Dedicated virtual and in-person events focused on holding space for you." }
];

export default function TherapistsClient() {
  return (
    <Box bg="#FDFBFA" minH="100vh" overflowX="hidden">
      {/* 🌿 VISIONARY HERO WITH ADJUSTED OVERLAY */}
      <Box 
        position="relative" 
        pt={{ base: 8, md: 12 }} 
        pb={{ base: 10, md: 14 }} 
        px={6} 
        minH={{ base: "auto", lg: "85vh" }}
        display="flex"
        alignItems="center"
      >
        <Box position="absolute" inset={0} zIndex={0}>
          <Image src="/serene_therapy_office_1776423989664.png" alt="" w="full" h="full" objectFit="cover" opacity="0.8" />
        </Box>
        <Box position="absolute" inset={0} bg="rgba(255, 255, 255, 0.92)" zIndex={1} />

        <Container maxW="6xl" position="relative" zIndex={2}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 16 }} alignItems="center">
            <VStack align="start" spacing={5}>
              <Badge bg="#56756D" color="white" px={3.5} py={1} borderRadius="full" fontSize="xs" fontWeight="800" letterSpacing="widest">THE THERAPY ECOSYSTEM</Badge>
              <Heading as="h1" fontSize={{ base: "32px", md: "44px", lg: "54px" }} fontFamily="'Playfair Display', serif" color="#263A33" lineHeight="1.15" fontWeight="600">
                Holding Space <br /> for You.
              </Heading>
              <Text fontSize={{ base: "15px", md: "16.5px" }} color="rgba(46,46,46,0.75)" fontWeight="400" lineHeight="1.7" maxW="xl">
                A complete therapy operating system designed to protect your boundaries, elevate your outcomes, and reduce admin fatigue.
              </Text>
              <Stack direction={{ base: "column", sm: "row" }} spacing={3.5} pt={2} w={{ base: "full", sm: "auto" }}>
                <LinkButton href="/therapists/supervision-discovery" bg="mlc.gold" color="#263A33" h="46px" px={7} borderRadius="full" fontSize="14px" fontWeight="700" _hover={{ bg: "#b99647" }}>
                  Find a Mentor
                </LinkButton>
                <LinkButton href="/therapist-apply" bg="#56756D" color="white" h="46px" px={7} borderRadius="full" fontSize="14px" fontWeight="700" _hover={{ bg: "#263A33" }}>
                  Join the Collective
                </LinkButton>
                <LinkButton href="/login/therapist" variant="ghost" color="#56756D" h="46px" px={5} fontSize="14px" fontWeight="700">
                  Therapist Sign In
                </LinkButton>
              </Stack>
            </VStack>

            <VStack align="center" spacing={0} position="relative">
               <Box w="280px" mb={-4}>
                 <Image 
                    src="/therapy_cat_final.png" 
                    alt="Therapy Cat" 
                    w="full" 
                    filter="brightness(0) saturate(100%) invert(43%) sepia(16%) saturate(693%) hue-rotate(117deg) brightness(96%) contrast(88%)"
                    opacity="0.9"
                 />
               </Box>
               
               <VStack align="stretch" spacing={2} position="relative" mt={-4}>
                  <Box position="absolute" left="30px" top="0" bottom="0" w="2.5px" bg="#56756D" opacity="0.4" zIndex={0} />
                  
                  {[
                    "Clinical Admin & Suite",
                    "Shared Client Journey",
                    "Well-being & Self-Care",
                    "Community & Growth"
                  ].map((label, i) => (
                    <MotionBox key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i*0.2 }}>
                      <HStack spacing={6} align="center" py={3}>
                        <Box position="relative" w="50px" h="50px">
                          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 10 C20 20 10 50 40 70 C70 90 90 60 60 40 C30 20 20 80 50 90 C80 100 100 30 70 10 C40 -10 10 30 30 60 C50 90 90 70 80 40 C70 10 20 20 10 50" stroke="#56756D" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                          </svg>
                        </Box>
                        <VStack align="start" spacing={0}>
                           <Text fontSize="xs" fontWeight="900" color="#56756D" letterSpacing="widest">SECTION 0{i+1}</Text>
                           <Text fontSize="sm" fontWeight="700" color="#263A33" fontFamily="'Playfair Display', serif">{label}</Text>
                        </VStack>
                      </HStack>
                    </MotionBox>
                  ))}
               </VStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Mentor discovery surfaced early */}
      <Box py={{ base: 6, md: 8 }} px={6} bg="white">
        <Container maxW="6xl">
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "start", md: "center" }}
            justify="space-between"
            gap={6}
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            bg="rgba(169,203,183,0.1)"
            border="1px solid"
            borderColor="rgba(169,203,183,0.15)"
          >
            <VStack align="start" spacing={1.5} maxW="3xl">
              <Badge colorScheme="green" borderRadius="full" px={3}>EARLY ACCESS</Badge>
              <Heading fontSize={{ base: "18px", md: "20px" }} color="#263A33" fontFamily="'Playfair Display', serif" fontWeight="600">
                Find Your Supervisor or Clinical Mentor from Day One
              </Heading>
              <Text color="gray.700" fontSize="14.5px" lineHeight="1.6">
                Get matched with senior, verified professionals who can support your growth through structured supervision, reflective practice, and real-world clinical guidance.
              </Text>
            </VStack>
            <LinkButton href="/therapists/supervision-discovery" bg="#56756D" color="white" h="44px" px={6} borderRadius="full" fontSize="14px" fontWeight="700" _hover={{ bg: "#263A33" }} flexShrink={0}>
              Start Mentor Matching
            </LinkButton>
          </Flex>
        </Container>
      </Box>

      {/* 💠 THE CLINICAL DASHBOARD SUITE */}
      <Box py={{ base: 12, md: 16 }} px={6} bg="white">
        <Container maxW="6xl">
          <VStack spacing={10}>
             <VStack spacing={3} textAlign="center" maxW="3xl">
                <Heading color="#263A33" fontFamily="'Playfair Display', serif" fontSize={{ base: "26px", md: "36px" }} fontWeight="600">Your Complete Clinical Suite</Heading>
                <Text color="rgba(46,46,46,0.75)" fontSize="15px" lineHeight="1.7">Align with best practices effortlessly with a dashboard that handles the complexity of therapy administration.</Text>
             </VStack>
             <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 6 }} w="full">
                {ECOSYSTEM_FEATURES.map((f, i) => (
                  <HStack key={i} align="start" p={{ base: 5, md: 6 }} bg="#FDFBFA" borderRadius="2xl" shadow="sm" border="1px solid" borderColor="rgba(169,203,183,0.1)" spacing={5} transition="all 0.3s" _hover={{ shadow: "md" }}>
                    <Circle size="50px" bg="rgba(169,203,183,0.1)" color="#56756D" flexShrink={0}><Icon as={f.icon} w={5} h={5} /></Circle>
                    <VStack align="start" spacing={1.5}>
                      <Heading fontSize="17px" color="#56756D" fontWeight="600">{f.title}</Heading>
                      <Text color="rgba(46,46,46,0.6)" fontSize="14px" lineHeight="1.6">{f.desc}</Text>
                    </VStack>
                  </HStack>
                ))}
             </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* 🧘 WELL-BEING: PRACTICING WHAT YOU PREACH */}
      <Box bg="#263A33" py={{ base: 12, md: 16 }} color="white" position="relative" overflow="hidden">
         <Box position="absolute" top="-10%" left="-10%" w="50%" h="50%" bg="#56756D" borderRadius="full" filter="blur(120px)" opacity="0.4" />
         <Container maxW="6xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 14 }} alignItems="center">
               <VStack align="start" spacing={6}>
                  <Badge bg="#56756D" color="rgba(169,203,183,0.15)" px={3.5} py={1} borderRadius="full" fontSize="xs">CLINICIAN CARE</Badge>
                  <Heading fontSize={{ base: "26px", md: "36px" }} fontFamily="'Playfair Display', serif" lineHeight="1.2" fontWeight="600">
                    Taking Care of You, So Burnout Stays at Bay.
                  </Heading>
                  <Text fontSize={{ base: "15px", md: "16px" }} opacity="0.9" lineHeight="1.7">
                    MLC helps you practice what you preach by bringing therapist well-being directly into your workflow. Track burnout signals early and maintain a healthier pace of practice.
                  </Text>
                  
                  <VStack align="start" spacing={4} w="full">
                    <Text fontWeight="800" color="#A9CBB7" textTransform="uppercase" letterSpacing="widest" fontSize="xs">Self-Care & Resource Library</Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} w="full">
                       {SELF_CARE_TOOLS.map((tool, idx) => (
                         <HStack key={idx} p={3.5} bg="rgba(255,255,255,0.05)" borderRadius="xl" border="1px solid rgba(255,255,255,0.1)">
                            <Icon as={tool.icon} color="#A9CBB7" />
                            <Text fontSize="xs" fontWeight="600">{tool.title}</Text>
                         </HStack>
                       ))}
                    </SimpleGrid>
                  </VStack>
               </VStack>
               <Image src="/human_connection_therapy_1776424085531.png" alt="Self Care" borderRadius="2xl" shadow="2xl" maxH="440px" objectFit="cover" w="full" />
            </SimpleGrid>
         </Container>
      </Box>

      {/* 📈 COMPREHENSIVE GROWTH & SUPERVISION */}
      <Box py={{ base: 12, md: 16 }} px={6} bg="white">
         <Container maxW="6xl">
            <VStack spacing={10}>
               <VStack spacing={3} textAlign="center" maxW="4xl">
                  <Badge colorScheme="green" px={3.5} py={1} borderRadius="full" fontSize="xs">PROFESSIONAL STEWARDSHIP</Badge>
                  <Heading color="#263A33" fontFamily="'Playfair Display', serif" fontSize={{ base: "26px", md: "36px" }} fontWeight="600">Continuing Education & Holistic Growth</Heading>
                  <Text color="rgba(46,46,46,0.75)" fontSize="15px" lineHeight="1.7">
                    At MLC, we believe the therapist’s growth is never "finished." We are building a structured ecosystem where clinical supervision, professional development, and community connection happen in one seamless experience.
                  </Text>
               </VStack>

               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  {/* Supervision Cohorts */}
                  <VStack align="start" p={{ base: 6, md: 8 }} bg="rgba(169,203,183,0.1)" borderRadius="2xl" spacing={6} border="1px solid" borderColor="rgba(169,203,183,0.15)">
                     <Circle size="56px" bg="#56756D" color="white" shadow="md"><Icon as={FiAward} w={6} h={6} /></Circle>
                     <VStack align="start" spacing={3}>
                        <Heading fontSize={{ base: "20px", md: "22px" }} color="#263A33" fontFamily="'Playfair Display', serif" fontWeight="600">Supervision Cohorts & 1:1 Labs</Heading>
                        <Text color="gray.700" fontSize="15px" lineHeight="1.7">
                          Experience a seamless clinical journey where your <b>supervisor is on the same platform</b>. Conduct your reflective sessions through our secure video tools, tracks goals together, and share clinical resources in one unified space.
                        </Text>
                        <Text color="rgba(46,46,46,0.75)" fontSize="14px" lineHeight="1.6">
                          Our cohorts transcend simple case-by-case troubleshooting, as they are designed for the <b>holistic evolution of your therapeutic identity</b>, helping you cultivate the clinical depth and personal presence required to truly hold space for the human experience.
                        </Text>
                     </VStack>
                     <VStack align="stretch" spacing={4} w="full" bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="rgba(169,203,183,0.15)">
                        <HStack spacing={3}>
                           <Icon as={FiZap} color="mlc.gold" boxSize={4} />
                           <Heading size="xs" color="#56756D" textTransform="uppercase" letterSpacing="widest" fontWeight="800">Find Your Mentor</Heading>
                        </HStack>
                        
                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                           <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" fontWeight="800" color="gray.400" letterSpacing="wider">FOCUS AREA</Text>
                              <Box w="full" border="1px solid" borderColor="gray.100" p={2.5} borderRadius="lg" fontSize="xs" color="rgba(46,46,46,0.75)">Clinical Supervision</Box>
                           </VStack>
                           <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" fontWeight="800" color="gray.400" letterSpacing="wider">MODALITY</Text>
                              <Box w="full" border="1px solid" borderColor="gray.100" p={2.5} borderRadius="lg" fontSize="xs" color="rgba(46,46,46,0.75)">Integrative Therapy</Box>
                           </VStack>
                           <VStack align="start" spacing={1}>
                              <Text fontSize="2xs" fontWeight="800" color="gray.400" letterSpacing="wider">EXPERIENCE</Text>
                              <Box w="full" border="1px solid" borderColor="gray.100" p={2.5} borderRadius="lg" fontSize="xs" color="rgba(46,46,46,0.75)">10+ Years Mastery</Box>
                           </VStack>
                        </SimpleGrid>

                        <Button 
                           as={NextLink} 
                           href="/therapists/supervision-discovery" 
                           bg="mlc.green" 
                           color="white" 
                           borderRadius="full" 
                           h="46px"
                           fontSize="14px"
                           fontWeight="700"
                           boxShadow="0 4px 15px rgba(86, 117, 109, 0.2)"
                           _hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}
                           transition="all 0.2s"
                        >
                           Match with Supervisor
                        </Button>
                     </VStack>
                  </VStack>

                  {/* Therapist Community */}
                  <VStack align="start" p={{ base: 6, md: 8 }} bg="#263A33" color="white" borderRadius="2xl" spacing={6} shadow="xl" position="relative" overflow="hidden">
                     <Box position="absolute" top="-20%" right="-20%" w="200px" h="200px" bg="#56756D" borderRadius="full" filter="blur(60px)" opacity="0.3" />
                     <Circle size="56px" bg="#56756D" color="#A9CBB7" shadow="md"><Icon as={FiUsers} w={6} h={6} /></Circle>
                     <VStack align="start" spacing={3}>
                        <Heading fontSize={{ base: "20px", md: "22px" }} fontFamily="'Playfair Display', serif" fontWeight="600">A Global Collective of Peers</Heading>
                        <Text opacity="0.9" fontSize="15px" lineHeight="1.7">
                          Break the isolation of private practice. Connect with a community of therapists who connect, grow, and support one another in ways that were previously impossible.
                        </Text>
                        <Text opacity="0.8" fontSize="14px" lineHeight="1.6">
                          From peer-led learning circles to holistic wellness events, we are creating a world where your practice is held by a healthy, professional community.
                        </Text>
                     </VStack>
                     <Button 
                       as="a" 
                       href="https://forms.office.com/r/MF2yHPLsz3" 
                       target="_blank" 
                       bg="white" 
                       color="#263A33" 
                       borderRadius="full" 
                       h="46px"
                       px={8} 
                       fontSize="14px"
                       fontWeight="700"
                       _hover={{ bg: "rgba(169,203,183,0.15)", transform: "translateY(-1px)" }}
                       transition="all 0.25s ease"
                     >
                       Join the Community
                     </Button>
                  </VStack>
               </SimpleGrid>

               {/* Continuing Education */}
               <Box w="full" p={{ base: 5, md: 7 }} bg="rgba(201, 169, 96, 0.05)" borderRadius="2xl" border="1px dashed" borderColor="#C9A960">
                 <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="center">
                    <VStack align="start" gridColumn={{ md: "span 2" }}>
                       <HStack color="#C9A960" spacing={3}>
                         <Icon as={FiBookOpen} w={5} h={5} />
                         <Heading fontSize="18px" fontWeight="600">Lifelong Clinical Learning</Heading>
                       </HStack>
                       <Text color="rgba(46,46,46,0.75)" fontSize="14.5px" mt={1}>
                         Access curated workshops and structured training programs designed to deepen your therapeutic identity and refine your clinical formulations across various modalities.
                       </Text>
                    </VStack>
                    <Box textAlign={{ md: "right" }}>
                       <LinkButton href="/workshops" variant="outline" borderColor="#C9A960" color="#C9A960" h="44px" px={6} borderRadius="full" fontSize="14px" fontWeight="700">View Workshops</LinkButton>
                    </Box>
                 </SimpleGrid>
               </Box>
            </VStack>
         </Container>
      </Box>

      {/* 🚀 FINAL CALL TO ACTION */}
      <Box py={{ base: 10, md: 12 }} bg="rgba(169,203,183,0.1)" textAlign="center" borderTop="1px solid" borderColor="rgba(169,203,183,0.15)">
         <Container maxW="4xl">
            <VStack spacing={5}>
               <Heading fontSize={{ base: "24px", md: "32px" }} fontFamily="'Playfair Display', serif" color="#263A33" fontWeight="600">Build Your Practice Within a Healthy Ecosystem</Heading>
               <Text fontSize="15px" color="rgba(46,46,46,0.75)" maxW="xl">We are creating a world where mental healthcare is sustainable for everyone. Join the MLC collective today.</Text>
               <LinkButton href="/therapist-apply" bg="#56756D" color="white" borderRadius="full" h="46px" px={8} fontSize="14px" fontWeight="700" _hover={{ bg: "#263A33", transform: "translateY(-1px)", shadow: "md" }} transition="all 0.25s ease">
                  Join the Collective
               </LinkButton>
            </VStack>
         </Container>
      </Box>
    </Box>
  );
}
