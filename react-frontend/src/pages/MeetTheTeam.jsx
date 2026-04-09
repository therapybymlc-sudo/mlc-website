import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { apiGet } from "../api";

export default function MeetTheTeam() {
  const [team, setTeam] = useState([]);

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
      <Helmet>
        <title>Meet the Team | MLC Health & Wellness Centre</title>
        <meta
          name="description"
          content="Meet the team behind MLC Health & Wellness Centre. Our profiles will be available soon."
        />
        <meta property="og:image" content="https://mlchealth.in/founder_portrait_new.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/founder_portrait_new.jpg" />
      </Helmet>
      {/* HERO SECTION */}
      <Box bg="#F6F6F4" py={24}>
        <Container maxW="7xl">
          <VStack spacing={6} textAlign="center" mb={10}>
            <Heading
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              fontWeight="600"
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              Meet Our Team
            </Heading>
            <Text
              maxW="3xl"
              color="#2E2E2E"
              fontFamily="'Lato', sans-serif"
              fontSize="lg"
              lineHeight="1.8"
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
      <Box bg="#E8ECE8" py={24}>
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
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
                color="#2E2E2E"
                mb={4}
              >
                Team Profiles Coming Soon
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
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
                >
                  {member.photo_url && (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      borderRadius="xl"
                      mb={4}
                    />
                  )}
                  <Heading size="md" fontFamily="'Playfair Display', serif">
                    {member.name}
                  </Heading>
                  {member.title && (
                    <Text color="#56756D" fontWeight="semibold" mb={2}>
                      {member.title}
                    </Text>
                  )}
                  {member.bio && (
                    <Text fontSize="sm" color="#2E2E2E" lineHeight="1.7">
                      {member.bio}
                    </Text>
                  )}
                  {member.specialties && (
                    <Text fontSize="sm" color="#2E2E2E" mt={3}>
                      {member.specialties}
                    </Text>
                  )}
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
            fontFamily="'Playfair Display', serif"
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
            fontFamily="'Lato', sans-serif"
            lineHeight="1.8"
          >
            Every member of MLC shares a common goal, to create a space that
            nurtures both client and clinician. Together, we are redefining what
            compassionate and sustainable therapy can look like.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
