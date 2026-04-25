'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { apiGet } from "../../api.js";

export default function TeamClient() {
  const [team, setTeam] = useState([]);
  const [activeMember, setActiveMember] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("team-members/");
        const data = res.results ?? res;
        setTeam(Array.isArray(data) ? data : []);
      } catch {
        setTeam([]);
      }
    })();
  }, []);

  return (
    <Box>
      {/* HERO SECTION */}
      <Box bg="#F9F9F9" py={24}>
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center" mb={10}>
            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#2E2E2E"
              fontWeight="600"
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              Meet Our Team
            </Heading>
            <Text
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontSize="lg"
              lineHeight="1.8"
            >
              At MLC Therapy, our strength lies in collaboration — between
              clinicians, supervisors, and the dedicated operations team that
              keeps our ecosystem thriving. Each individual plays a key role in
              ensuring that care remains human, ethical, and sustainable.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* TEAM PROFILES */}
      <Box bg="#E9F2ED" py={24}>
        <Container maxW="6xl">
          {team.length === 0 ? (
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="md"
              p={{ base: 8, md: 12 }}
              textAlign="center"
            >
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
                color="#2E2E2E"
                mb={4}
              >
                Team Profiles Coming Soon
              </Heading>
              <Text
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                maxW="3xl"
                mx="auto"
                lineHeight="1.8"
              >
                We’re finalizing our team profiles to share the clinicians, supervisors,
                and operations leaders behind MLC. Please check back shortly.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {team.map((member) => (
                <Box
                  key={member.id}
                  bg="white"
                  borderRadius="2xl"
                  boxShadow="md"
                  p={6}
                  cursor="pointer"
                  transition="transform 0.2s ease, box-shadow 0.2s ease"
                  _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                  onClick={() => setActiveMember(member)}
                >
                    <Image
                      src={member.photo_url}
                      alt={`Professional profile photo of ${member.name}, ${member.title} at MLC Health and Wellness Centre`}
                      borderRadius="xl"
                      mb={4}
                    />
                  <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif">
                    {member.name}
                  </Heading>
                  {member.title && (
                    <Text color="#56756D" fontWeight="semibold" mb={2}>
                      {member.title}
                    </Text>
                  )}
                  <Text fontSize="sm" color="#56756D">
                    Tap to view full profile
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#56756D" py={20} textAlign="center" color="white">
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            mb={6}
            letterSpacing="-0.5px"
          >
            The Heart Behind MLC Therapy
          </Heading>
          <Text
            maxW="3xl"
            mx="auto"
            mb={8}
            fontFamily="'Inter', var(--font-inter), sans-serif"
            lineHeight="1.8"
          >
            Every member of MLC shares a common goal — to create a space that
            nurtures both client and clinician. Together, we are redefining what
            compassionate and sustainable therapy can look like.
          </Text>
        </Container>
      </Box>

      {activeMember && (
        <Box
          position="fixed"
          inset={0}
          bg="rgba(15, 16, 20, 0.45)"
          backdropFilter="blur(6px)"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          onClick={() => setActiveMember(null)}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            maxW="680px"
            w="100%"
            p={{ base: 6, md: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
              <Image
                src={activeMember.photo_url}
                alt={`Full profile portrait of ${activeMember.name}, specialized ${activeMember.title} at MLC Health`}
                borderRadius="xl"
                mb={5}
                maxH="320px"
                w="100%"
                objectFit="cover"
              />
            <Heading size="lg" fontFamily="'Playfair Display', serif" mb={2}>
              {activeMember.name}
            </Heading>
            {activeMember.title && (
              <Text color="#56756D" fontWeight="semibold" mb={4}>
                {activeMember.title}
              </Text>
            )}
            {activeMember.bio && (
              <Box
                fontSize="sm"
                color="#2E2E2E"
                lineHeight="1.7"
                dangerouslySetInnerHTML={{ __html: activeMember.bio }}
              />
            )}
            <HStack mt={6} justify="space-between">
              <Button variant="ghost" onClick={() => setActiveMember(null)}>
                Close
              </Button>
              <Button
                as={NextLink}
                href="/book"
                bg="#A9CBB7" color="#2E2E2E" _hover={{ bg: "#56756D", color: "white" }}
              >
                Book a session
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
