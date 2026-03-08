import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import {
  FiCloud,
  FiHeart,
  FiMeh,
  FiShuffle,
  FiClock,
  FiUser,
  FiMessageCircle,
  FiNavigation,
  FiCheckCircle,
  FiCompass,
  FiCheck,
  FiUsers,
} from "react-icons/fi";

const bubbleTints = ["#F2F8F5", "#FBF8F3", "#EEF4F2", "#F8F5ED"];

export default function Client() {
  return (
    <Box bg="#F9F9F9">
      <Helmet>
        <title>Looking for Therapy? | MLC Therapy</title>
        <meta
          name="description"
          content="Warm, reassuring online therapy across India. Learn what therapy is like, how to begin, and how to find the right fit."
        />
        <meta property="og:image" content="https://mlchealth.in/hero-bg.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/hero-bg.jpg" />
      </Helmet>

      {/* HERO */}
      <Box bg="#F9F9F9" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="600"
            >
              Looking for Therapy?
            </Heading>
            <Text
              color="#2E2E2E"
              fontFamily="'Lato', sans-serif"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
            >
              Starting therapy can feel like a big step. You don’t need to have
              everything figured out before beginning.
            </Text>
            <Text
              color="#2E2E2E"
              fontFamily="'Lato', sans-serif"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
            >
              At MLC Therapy, we offer a space where you can talk openly,
              understand what you're going through, and begin finding ways
              forward.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                bg="#A9CBB7"
                color="#2E2E2E"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#97BFA9" }}
                as="a"
                href="/book"
                fontFamily="'Lato', sans-serif"
                fontWeight="600"
              >
                Book Your First Session
              </Button>
              <Button
                bg="#C9A960"
                color="white"
                borderRadius="14px"
                px={8}
                py={6}
                _hover={{ bg: "#B8954E" }}
                as="a"
                href="/meettheteam"
                fontFamily="'Lato', sans-serif"
                fontWeight="600"
              >
                Meet Our Therapists
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* WHAT BRINGS PEOPLE */}
      <Box bg="#FFFFFF" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="600"
          >
            Many People Come to Therapy Because…
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[
              {
                icon: FiCloud,
                title: "Anxiety or constant worry",
                body: "When your mind feels like it never slows down.",
              },
              {
                icon: FiHeart,
                title: "Relationship struggles",
                body: "When communication, trust, or emotional connection feels difficult.",
              },
              {
                icon: FiMeh,
                title: "Burnout or emotional exhaustion",
                body: "When life starts to feel overwhelming or draining.",
              },
              {
                icon: FiShuffle,
                title: "Feeling stuck or confused",
                body: "When you're unsure about your direction or next steps.",
              },
              {
                icon: FiClock,
                title: "Difficult past experiences",
                body: "When old experiences still affect how you feel today.",
              },
              {
                icon: FiUser,
                title: "Wanting to understand yourself better",
                body: "Therapy can also be a space for reflection and personal growth.",
              },
            ].map((item, idx) => (
              <Box
                key={item.title}
                bg={bubbleTints[idx % bubbleTints.length]}
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                _hover={{ transform: "translateY(-4px)" }}
                transition="all 0.2s ease"
              >
                <Icon as={item.icon} boxSize={7} color="#56756D" mb={3} />
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {item.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* WHAT HAPPENS */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            What Happens in a Therapy Session?
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
          >
            A therapy session is simply a conversation. You and your therapist
            talk about what has been on your mind, what feels difficult right
            now, and what you would like to understand or change.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiMessageCircle,
                title: "You talk openly",
                body: "There is no right or wrong way to begin.",
              },
              {
                icon: FiNavigation,
                title: "Your therapist helps guide the conversation",
                body: "Helping you explore patterns, thoughts, and feelings.",
              },
              {
                icon: FiCompass,
                title: "Together you work toward change",
                body: "Small insights and steps that help things feel more manageable.",
              },
            ].map((item, idx) => (
              <Box
                key={item.title}
                bg={bubbleTints[idx % bubbleTints.length]}
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Icon as={item.icon} boxSize={7} color="#56756D" mb={3} />
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {item.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* RIGHT FIT */}
      <Box bg="#FFFFFF" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            Finding the Right Therapist Matters
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
          >
            It is important that therapy feels comfortable and supportive. Your
            first few sessions are also a chance for you to see whether the
            therapist feels like the right fit for you.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiCheckCircle,
                title: "You are free to decide",
                body: "You can always decide whether you want to continue.",
              },
              {
                icon: FiUsers,
                title: "The relationship matters",
                body: "Feeling understood by your therapist is an important part of therapy.",
              },
              {
                icon: FiCompass,
                title: "We help guide the process",
                body: "Your therapist will help you understand how therapy can support you.",
              },
            ].map((item, idx) => (
              <Box
                key={item.title}
                bg={bubbleTints[idx % bubbleTints.length]}
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Icon as={item.icon} boxSize={7} color="#56756D" mb={3} />
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {item.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* HOW TO BEGIN */}
      <Box bg="#FBF8F3" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={10}
            fontWeight="600"
          >
            Starting Therapy Is Simple
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
            {[
              {
                title: "Book your first session",
                body: "Choose a time that works for you.",
              },
              {
                title: "Meet your therapist",
                body: "Talk about what has been going on in your life.",
              },
              {
                title: "Decide what feels right",
                body: "You can choose whether to continue therapy after your first sessions.",
              },
            ].map((item) => (
              <Box
                key={item.title}
                bg="#FFFFFF"
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {item.title}
                </Heading>
                <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
          <HStack justify="center">
            <Button
              bg="#A9CBB7"
              color="#2E2E2E"
              borderRadius="14px"
              px={8}
              py={6}
              _hover={{ bg: "#97BFA9" }}
              as="a"
              href="/book"
              fontFamily="'Lato', sans-serif"
              fontWeight="600"
            >
              Book Your First Session
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* FAQ */}
      <Box bg="#FFFFFF" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={8}
            fontWeight="600"
          >
            Questions People Often Have Before Starting Therapy
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
              {
                q: "Do I need to be in crisis to start therapy?",
                a: "No. Many people come to therapy simply because something in life feels difficult, confusing, or overwhelming. Therapy can also be a space for reflection and personal growth.",
              },
              {
                q: "What if I don't know what to say?",
                a: "That’s completely okay. Your therapist will help guide the conversation and support you in expressing what you’re feeling.",
              },
              {
                q: "How long does therapy take?",
                a: "Therapy is different for everyone. Some people benefit from a few sessions, while others continue longer depending on their goals.",
              },
              {
                q: "What if I feel the therapist is not the right fit?",
                a: "Finding the right therapist matters. If it does not feel like the right fit, you are always free to explore other options.",
              },
              {
                q: "Is therapy confidential?",
                a: "Yes. Sessions are private and confidential except in rare situations required by law related to safety.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} border="none" mb={4} bg="#F9F9F9" borderRadius="lg">
                <AccordionButton _expanded={{ bg: "#E8ECE8" }}>
                  <Box flex="1" textAlign="left" fontFamily="'Lato', sans-serif" color="#2E2E2E">
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Lato', sans-serif" color="#555">
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6} textAlign="center">
        <Container maxW="4xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={4}
            fontWeight="600"
          >
            Ready to begin?
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" mb={6}>
            You don’t have to go through things alone.
          </Text>
          <Button
            bg="#A9CBB7"
            color="#2E2E2E"
            borderRadius="14px"
            px={8}
            py={6}
            _hover={{ bg: "#97BFA9" }}
            as="a"
            href="/book"
            fontFamily="'Lato', sans-serif"
            fontWeight="600"
          >
            Book Your First Session
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
