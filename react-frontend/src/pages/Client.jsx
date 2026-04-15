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
  FiWind,
  FiActivity,
  FiBook,
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
              fontFamily="'Inter', sans-serif"
              fontSize={{ base: "md", md: "lg" }}
              maxW="2xl"
            >
              Starting therapy can feel like a big step. You don’t need to have
              everything figured out before beginning.
            </Text>
            <Text
              color="#2E2E2E"
              fontFamily="'Inter', sans-serif"
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
                fontFamily="'Inter', sans-serif"
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
                fontFamily="'Inter', sans-serif"
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
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
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
            fontFamily="'Inter', sans-serif"
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
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CLIENT DASHBOARD CTA */}
      <Box bg="white" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <VStack spacing={6} textAlign="center">
            <Heading
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              fontWeight="600"
            >
              Your Client Dashboard
            </Heading>
            <Text maxW="2xl" color="#2E2E2E" fontFamily="'Inter', sans-serif">
              Sign up to access your private space: daily check‑ins, reflections,
              therapy notes, shared resources, and (if you choose) premium tools
              that sync across devices.
            </Text>
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button as="a" href="/signup/client" bg="#A9CBB7" color="#2E2E2E">
                Sign up as a client
              </Button>
              <Button as="a" href="/client-checkin" variant="outline" colorScheme="teal">
                Take a quick check‑in
              </Button>
              <Button as="a" href="/login/therapist" variant="ghost">
                Already have an account? Sign in
              </Button>
            </HStack>
          </VStack>
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
            fontFamily="'Inter', sans-serif"
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
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {item.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* TYPES OF THERAPY */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            Different Types of Therapy We Offer
          </Heading>
          <Text
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            Different people benefit from different kinds of support. MLC Therapy
            offers individual, couples, and group therapy depending on your needs.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                icon: FiMessageCircle,
                title: "Individual Therapy",
                body: "A private one-on-one space where you can explore your thoughts, emotions, and life experiences with a therapist.",
                bullets: [
                  "anxiety",
                  "stress",
                  "emotional overwhelm",
                  "life transitions",
                  "personal growth",
                ],
                link: "/individual-therapy",
              },
              {
                icon: FiUsers,
                title: "Couples Therapy",
                body: "A supportive space for partners to improve communication, rebuild trust, and better understand each other.",
                link: "/couples-therapy",
              },
              {
                icon: FiUsers,
                title: "Group Therapy",
                body: "Group sessions where people facing similar challenges can reflect, learn, and grow together with professional guidance.",
                link: "/group-therapy",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="white"
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
                transition="all 0.2s ease"
                _hover={{ transform: "translateY(-4px)" }}
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={3}>
                  {card.body}
                </Text>
                {card.bullets && (
                  <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" fontSize="sm" mb={3}>
                    Common topics include: {card.bullets.join(", ")}.
                  </Text>
                )}
                <Button
                  size="sm"
                  bg="#A9CBB7"
                  color="#2E2E2E"
                  borderRadius="12px"
                  _hover={{ bg: "#97BFA9" }}
                  as="a"
                  href={card.link}
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                >
                  Learn More
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* MINDFULNESS */}
      <Box bg="#FFFFFF" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            Mindfulness and Emotional Wellbeing Sessions
          </Heading>
          <Text
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            Some people are not looking for full therapy but want practical ways
            to manage stress, anxiety, or emotional overwhelm. MLC offers
            mindfulness-based sessions that help people slow down, regulate
            emotions, and reconnect with calm.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                icon: FiWind,
                title: "1-on-1 Mindfulness Sessions",
                body: "Individual sessions focused on calming the mind, developing emotional awareness, and learning grounding practices.",
                cta: "Explore Mindfulness Sessions",
                link: "/mindfulness",
              },
              {
                icon: FiActivity,
                title: "Mindfulness Group Sessions",
                body: "Small group spaces where participants learn calming practices together.",
                cta: "View Mindfulness Groups",
                link: "/mindfulness",
              },
            ].map((card) => (
              <Box
                key={card.title}
                bg="#FBF8F3"
                borderRadius="20px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.06)"
              >
                <Icon as={card.icon} boxSize={7} color="#A9CBB7" mb={3} />
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {card.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {card.body}
                </Text>
                <Button
                  mt={4}
                  size="sm"
                  bg="#A9CBB7"
                  color="#2E2E2E"
                  borderRadius="12px"
                  _hover={{ bg: "#97BFA9" }}
                  as="a"
                  href={card.link}
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                >
                  {card.cta}
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* WORKSHOPS */}
      <Box bg="#FBF8F3" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={6}
            fontWeight="600"
          >
            Workshops & Skill-Building Sessions
          </Heading>
          <Text
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            textAlign="center"
            maxW="2xl"
            mx="auto"
            mb={10}
            lineHeight="1.6"
          >
            MLC is also developing workshops designed to help people learn
            practical psychological skills that improve everyday wellbeing.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
            {[
              { title: "Managing Anxiety", body: "Learning ways to calm anxious thoughts and reduce overwhelm." },
              { title: "Stress Management", body: "Tools for responding to stress in healthier ways." },
              { title: "Emotional Regulation", body: "Techniques for understanding and managing strong emotions." },
              { title: "Healthy Boundaries", body: "Learning how to say no and protect emotional wellbeing." },
              { title: "Communication Skills", body: "Improving how you express thoughts and feelings in relationships." },
              { title: "Behaviour Change", body: "Small practical steps that help build healthier habits." },
            ].map((bubble) => (
              <Box
                key={bubble.title}
                bg="white"
                borderRadius="18px"
                p={6}
                boxShadow="0px 6px 18px rgba(0,0,0,0.05)"
              >
                <Heading
                  size="sm"
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                  mb={2}
                >
                  {bubble.title}
                </Heading>
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
                  {bubble.body}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
          <HStack justify="center">
            <Button
              bg="#A9CBB7"
              color="#2E2E2E"
              borderRadius="12px"
              px={8}
              py={6}
              _hover={{ bg: "#97BFA9" }}
              as="a"
              href="/workshops"
              fontFamily="'Inter', sans-serif"
              fontWeight="600"
              leftIcon={<Icon as={FiBook} />}
            >
              Explore Workshops
            </Button>
          </HStack>
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
                <Text fontFamily="'Inter', sans-serif" color="#2E2E2E">
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
              fontFamily="'Inter', sans-serif"
              fontWeight="600"
            >
              Book Your First Session
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* SEO FAQ */}
      <Box bg="#F2F8F5" py={{ base: 16, md: 20 }} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            textAlign="center"
            mb={8}
            fontWeight="600"
          >
            Questions People in India Often Ask Before Starting Therapy
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
              {
                q: "How do I know if I need therapy?",
                a: "People seek therapy for many reasons. You do not need to be in crisis. Therapy can help when you feel overwhelmed, stuck, emotionally exhausted, or simply want to understand yourself better.",
              },
              {
                q: "What problems can therapy help with?",
                a: "Therapy can support people dealing with anxiety and panic, stress and burnout, relationship conflicts, communication difficulties, grief and loss, loneliness, emotional overwhelm, life transitions, low confidence, self-esteem struggles, work stress, family conflicts, trauma and difficult past experiences, managing anger, decision-making difficulties, and building healthier habits.",
              },
              {
                q: "Can I take therapy online in India?",
                a: "Yes. Online therapy allows you to speak with a therapist from the comfort of your home and is widely used across India. MLC Therapy provides online counselling services across India.",
              },
              {
                q: "How long does therapy take?",
                a: "Therapy is different for everyone. Some people benefit from a few sessions while others continue longer depending on their goals.",
              },
              {
                q: "How do I choose the right therapist?",
                a: "The relationship between therapist and client is important. Your first few sessions help you understand whether the therapist feels like the right fit for you.",
              },
              {
                q: "Is therapy confidential?",
                a: "Yes. Sessions are confidential except in rare situations required by law related to safety.",
              },
              {
                q: "Do I need therapy or mindfulness sessions?",
                a: "Therapy focuses on deeper emotional exploration and psychological patterns. Mindfulness sessions focus on practical techniques to calm the mind and regulate emotions.",
              },
              {
                q: "Can couples take therapy online?",
                a: "Yes. Many couples attend online sessions together to improve communication and work through relationship challenges.",
              },
              {
                q: "Is therapy only for people with serious mental illness?",
                a: "No. Many people attend therapy simply to understand themselves better, improve relationships, or manage stress.",
              },
              {
                q: "Is therapy worth the cost?",
                a: "Many people find therapy helpful because it helps them understand patterns, manage emotions, and improve quality of life.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} border="none" mb={4} bg="white" borderRadius="lg">
                <AccordionButton _expanded={{ bg: "#E8ECE8" }}>
                  <Box flex="1" textAlign="left" fontFamily="'Inter', sans-serif" color="#2E2E2E">
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Inter', sans-serif" color="#555">
                  {item.a}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
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
                  <Box flex="1" textAlign="left" fontFamily="'Inter', sans-serif" color="#2E2E2E">
                    {item.q}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} fontFamily="'Inter', sans-serif" color="#555">
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
          <Text fontFamily="'Inter', sans-serif" color="#2E2E2E" mb={6}>
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
            fontFamily="'Inter', sans-serif"
            fontWeight="600"
          >
            Book Your First Session
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
