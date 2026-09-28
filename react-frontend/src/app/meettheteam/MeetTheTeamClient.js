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
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { apiGet } from "../../api.js";
import LinkButton from "../../components/LinkButton";

export default function MeetTheTeamClient() {
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
    <Box bg="#FDFBFA">
      {/* HERO SECTION */}
      <Box bg="#FDFBFA" py={{ base: 10, md: 14 }} borderBottom="1px solid" borderColor="gray.100">
        <Container maxW="6xl">
          <VStack spacing={3.5} textAlign="center">
            <Badge bg="#56756D" color="white" px={3.5} py={1} borderRadius="full" fontSize="xs" fontWeight="800">
              CLINICAL LEADERSHIP
            </Badge>
            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              color="#263A33"
              fontWeight="600"
              fontSize={{ base: "32px", md: "44px" }}
            >
              Meet Our Team
            </Heading>
            <Text
              maxW="3xl"
              color="rgba(46,46,46,0.75)"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              fontSize={{ base: "15px", md: "16px" }}
              lineHeight="1.7"
            >
              At MLC Therapy, our strength lies in collaboration, between
              clinicians, supervisors, and the dedicated operations team that
              keeps our ecosystem thriving. Each individual plays a key role in
              ensuring that care remains human, ethical, and sustainable.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* TEAM PROFILES */}
      <Box bg="#F5F9F7" py={{ base: 12, md: 16 }}>
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
                  boxShadow="sm"
                  border="1px solid"
                  borderColor="gray.100"
                  p={6}
                  cursor="pointer"
                  transition="all 0.25s ease"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 25px -5px rgba(86, 117, 109, 0.12)" }}
                  onClick={() => setActiveMember(member)}
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  h="full"
                >
                  <Box>
                    {member.photo_url && (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        borderRadius="xl"
                        mb={4}
                        w="full"
                        h="260px"
                        objectFit="cover"
                      />
                    )}
                    <Heading size="md" fontFamily="'Playfair Display', var(--font-playfair), serif" mb={1}>
                      {member.name}
                    </Heading>
                    {member.title && (
                      <Text color="#56756D" fontWeight="600" fontSize="sm" mb={2}>
                        {member.title}
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="xs" color="#56756D" fontWeight="500" pt={2}>
                    Tap to view full profile →
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
            Every member of MLC shares a common goal, to create a space that
            nurtures both client and clinician. Together, we are redefining what
            compassionate and sustainable therapy can look like.
          </Text>
        </Container>
      </Box>

      {activeMember ? (
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
            transform="translateY(-6px)"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMember.photo_url && (
              <Image
                src={activeMember.photo_url}
                alt={activeMember.name}
                borderRadius="xl"
                mb={5}
                maxH="320px"
                w="100%"
                objectFit="cover"
              />
            )}
            <Heading size="lg" fontFamily="'Playfair Display', var(--font-playfair), serif" mb={2}>
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
                sx={{
                  "p + p": { marginTop: "0.75rem" },
                  "ul, ol": { paddingLeft: "1.1rem", marginTop: "0.5rem" },
                  li: { marginBottom: "0.25rem" },
                }}
                dangerouslySetInnerHTML={{ __html: activeMember.bio }}
              />
            )}
            {activeMember.specialties && (
              <Text fontSize="sm" color="#2E2E2E" mt={4}>
                {activeMember.specialties}
              </Text>
            )}
            <HStack mt={6} justify="space-between">
              <Button variant="ghost" onClick={() => setActiveMember(null)}>
                Close
              </Button>
              <LinkButton
                href="/book"
                bg="#56756D"
                color="white"
                borderRadius="full"
                h="46px"
                px={7}
                fontSize="14px"
                fontWeight="700"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Book a session now
              </LinkButton>
            </HStack>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
