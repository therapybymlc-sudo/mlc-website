import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  SimpleGrid,
  Container,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import theme from "../theme/theme";
import { Helmet } from "react-helmet-async";
import { FiUsers, FiCompass, FiCheckCircle, FiFeather } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api";

const MotionBox = motion(Box);

const fallbackHome = {
  hero: {
    title: "MLC Therapy",
    tagline: "A space to feel, to heal, to become.",
    paragraph_one:
      "Therapy is a space where you can slow down, speak openly, and begin to understand what you're going through.",
    paragraph_two:
      "At MLC Therapy, we offer thoughtful online therapy across India in spaces designed to help you feel heard, supported, and respected.",
    primary_label: "Find My Therapist",
    primary_link: "/therapists/discovery",
    secondary_label: "I'm a Therapist",
    secondary_link: "/therapists",
    background_image: "/hero-bg.jpg",
    logo_url: "/logo_tra.png",
  },
  portal: {
    title: "Your MLC Portal",
    body:
      "A gentle, private space for clients — and a structured workspace for therapists. Choose your path below to get started.",
    client_title: "Client Workspace",
    client_body:
      "A dedicated environment for your healing journey. Track your goals, access shared resources, and collaborate securely with your therapist.",
    client_primary_label: "Create Client Account",
    client_primary_link: "/signup/client",
    client_secondary_label: "Find a therapist",
    client_secondary_link: "/therapists/discovery",
    therapist_title: "Therapist Workspace",
    therapist_body:
      "A professional environment for clinical excellence. Manage your practice, collaborate with clients, and focus on the clinical work.",
    therapist_primary_label: "Apply as a therapist",
    therapist_primary_link: "/therapist-apply",
    therapist_secondary_label: "Sign in",
    therapist_secondary_link: "/login/therapist",
  },
  bubbles: [
    {
      icon: "users",
      title: "A Space Where You Can Speak Freely",
      body:
        "Therapy here is a place where you can talk about what’s on your mind without feeling judged.",
    },
    {
      icon: "compass",
      title: "Thoughtful Guidance",
      body:
        "Your therapist works with you to understand what you're experiencing and how to move forward.",
    },
    {
      icon: "check",
      title: "Finding the Right Fit",
      body:
        "Your first few sessions help you decide whether the therapist feels like the right fit for you. You are always free to choose what feels best for you.",
    },
    {
      icon: "feather",
      title: "Move at Your Own Pace",
      body:
        "There is no pressure to rush therapy. The process always respects your comfort and readiness.",
    },
  ],
};

const iconMap = {
  users: FiUsers,
  compass: FiCompass,
  check: FiCheckCircle,
  feather: FiFeather,
};

export default function Home() {
  const [homeContent, setHomeContent] = useState(fallbackHome);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("home-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          setHomeContent({
            hero: { ...fallbackHome.hero, ...(data[0].hero || {}) },
            portal: { ...fallbackHome.portal, ...(data[0].portal || {}) },
            bubbles: Array.isArray(data[0].bubbles) ? data[0].bubbles : fallbackHome.bubbles,
          });
        }
      } catch {
        setHomeContent(fallbackHome);
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>MLC Therapy | Online Structured & Ethical Therapy Across India</title>
        <meta
          name="description"
          content="MLC Therapy provides structured, ethical online therapy across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad and more."
        />
        <meta
          name="keywords"
          content="online therapy India, therapist Mumbai, psychologist Delhi, therapy Bangalore, counselling Hyderabad, mental health Chennai, therapy Kolkata, therapy Pune, therapy Ahmedabad, structured therapy India, ethical therapy India"
        />
              <meta property="og:image" content="https://mlchealth.in/hero-bg.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/hero-bg.jpg" />
      </Helmet>
      {/* HERO SECTION */}
      <MotionBox
        position="relative"
        bgImage={`url('${homeContent.hero.background_image || "/hero-bg.jpg"}')`}
        bgSize="cover"
        bgPosition="center"
        minH={{ base: "100svh", md: "110vh" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        px={6}
        py={20}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "linear-gradient(rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.85))",
          zIndex: 1,
        }}
      >
        <Box position="relative" zIndex={2} maxW="4xl">
          <Image
            src={homeContent.hero.logo_url || "/logo_tra.png"}
            alt="MLC Therapy Logo"
            boxSize={{ base: "100px", sm: "120px", md: "140px" }}
            mb={8}
            mx="auto"
          />
          <Heading
            as="h1"
            className="hero-title"
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
            color="#2E2E2E"
            letterSpacing="-0.5px"
            lineHeight="1.1"
            mb={6}
          >
            Find the therapist meant for <Text as="span" color="mlc.green">your journey</Text>
          </Heading>
          <Text
            mt={4}
            fontSize={{ base: "lg", md: "xl" }}
            color="#56756D"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            letterSpacing="1px"
            textTransform="uppercase"
          >
            {homeContent.hero.tagline}
          </Text>
          <Text
            mt={6}
            color="rgba(46, 46, 46, 0.8)"
            fontFamily="'Inter', sans-serif"
            fontSize={{ base: "md", md: "lg" }}
            lineHeight="1.8"
            maxW="2xl"
            mx="auto"
            dangerouslySetInnerHTML={{ __html: homeContent.hero.paragraph_one || "" }}
          />

          <VStack spacing={6} mt={12} align="center">
            <Button
              size="xl"
              bg="#56756D"
              color="white"
              borderRadius="full"
              shadow="2xl"
              _hover={{ bg: "#C9A960", transform: "scale(1.05)", shadow: "dark-lg" }}
              as={Link}
              to="/therapists/discovery"
              fontWeight="600"
              fontSize="lg"
              px={12}
              py={8}
            >
              Take the Matching Quiz
            </Button>
            <HStack spacing={4}>
              <Text fontSize="sm" color="gray.500" fontWeight="500">Already know who you're looking for?</Text>
              <ChakraLink
                as={Link}
                to="/therapists"
                color="mlc.greenDark"
                fontWeight="600"
                fontSize="sm"
                textDecoration="underline"
                _hover={{ color: "mlc.gold" }}
              >
                Browse all therapists
              </ChakraLink>
            </HStack>
          </VStack>
        </Box>
      </MotionBox>


      {/* HOW TO START SECTION */}
      <Box py={24} bg="white">
        <Container maxW="6xl">
          <VStack spacing={16} align="center">
            <VStack spacing={4} textAlign="center">
              <Heading fontFamily="'Playfair Display', serif" size="xl" color="mlc.black">
                How to find your space here
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                We've simplified the journey to ensure you find a therapist who truly aligns with your needs, values, and life situation.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} w="full">
              {[
                {
                  step: "01",
                  title: "Discovery Quiz",
                  desc: "Take our 10-minute discovery quiz to share your preferences, concerns, and what you’re looking for in a therapeutic relationship.",
                },
                {
                  step: "02",
                  title: "Personalized Match",
                  desc: "Receive a curated selection of therapists who specialize in your areas of concern and meet your specific preferences.",
                },
                {
                  step: "03",
                  title: "Book & Begin",
                  desc: "Review detailed therapist profiles and book your first session directly through our secure platform.",
                },
              ].map((item, idx) => (
                <VStack key={idx} align="flex-start" spacing={6} p={8} bg="#FDFBFA" borderRadius="2xl" border="1px solid" borderColor="gray.100" _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }} transition="all 0.3s">
                   <Text fontSize="5xl" fontWeight="800" color="mlc.gold" opacity="0.3" fontFamily="'Playfair Display', serif" lineHeight="1">{item.step}</Text>
                   <Heading size="md" color="mlc.greenDark">{item.title}</Heading>
                   <Text color="gray.600" fontSize="md">{item.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>

            <Button
              as={Link}
              to="/therapists/discovery"
              variant="outline"
              borderColor="mlc.green"
              color="mlc.greenDark"
              px={10}
              py={7}
              borderRadius="full"
              _hover={{ bg: "mlc.green", color: "white" }}
            >
              Start the Discovery Quiz
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* PORTAL CTA */}

      <Box bg="#E9F2ED" py={16} px={6}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <Heading
              as="h2"
              fontFamily="'Playfair Display', serif"
              fontWeight="500"
              color="#2E2E2E"
              textAlign="center"
            >
              {homeContent.portal.title}
            </Heading>
            <Text
              color="#2E2E2E"
              textAlign="center"
              maxW="2xl"
              dangerouslySetInnerHTML={{ __html: homeContent.portal.body || "" }}
            />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={2}>
                  {homeContent.portal.client_title}
                </Heading>
                <Text
                  color="gray.600"
                  mb={4}
                  dangerouslySetInnerHTML={{ __html: homeContent.portal.client_body || "" }}
                />
                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    as={Link}
                    to="/signup/client"
                    bg="#A9CBB7"
                    color="#2E2E2E"
                    _hover={{ bg: "#56756D", color: "white" }}
                    borderRadius="full"
                    fontWeight="500"
                  >
                    Create Client Account
                  </Button>
                  <Button
                    as={Link}
                    to="/therapists/discovery"
                    variant="outline"
                    borderColor="#A9CBB7"
                    color="#56756D"
                    _hover={{ bg: "#A9CBB7", color: "#2E2E2E" }}
                    borderRadius="full"
                    fontWeight="500"
                  >
                    Find a therapist
                  </Button>
                </HStack>
              </Box>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" border="1px solid" borderColor="gray.100">
                <Heading size="md" mb={2} color="mlc.black">
                  {homeContent.portal.therapist_title}
                </Heading>
                <Text
                  color="gray.600"
                  mb={4}
                  fontSize="sm"
                  dangerouslySetInnerHTML={{ __html: homeContent.portal.therapist_body || "" }}
                />
                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    as={Link}
                    to={homeContent.portal.therapist_primary_link}
                    bg="#C9A960"
                    color="white"
                    _hover={{ bg: "#56756D", color: "white" }}
                    borderRadius="full"
                    fontWeight="500"
                  >
                    {homeContent.portal.therapist_primary_label}
                  </Button>
                  <Button
                    as={Link}
                    to={homeContent.portal.therapist_secondary_link}
                    variant="outline"
                    borderColor="#C9A960"
                    color="#C9A960"
                    _hover={{ bg: "#C9A960", color: "white" }}
                    borderRadius="full"
                    fontWeight="500"
                  >
                    {homeContent.portal.therapist_secondary_label}
                  </Button>
                </HStack>
              </Box>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CLIENT REASSURANCE BUBBLES */}
      <Box bg="white" py={16} px={6}>
        <Container maxW="6xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {homeContent.bubbles.map((item, index) => {
              const BubbleIcon = iconMap[item.icon] || FiUsers;
              return (
              <Box
                key={`${item.title}-${index}`}
                bg="#F9F9F9"
                borderRadius="2xl"
                p={6}
                boxShadow="md"
                border="1px solid"
                borderColor="blackAlpha.100"
              >
                <Icon as={BubbleIcon} boxSize={7} color="#56756D" mb={3} />
                <Heading
                  size="sm"
                  mb={2}
                  color="#2E2E2E"
                >
                  {item.title}
                </Heading>
                <Text
                  fontFamily="'Inter', sans-serif"
                  color="#2E2E2E"
                  fontSize="sm"
                  dangerouslySetInnerHTML={{ __html: item.body || "" }}
                />
              </Box>
            )})}
          </SimpleGrid>
        </Container>
      </Box>

      {/* MISSION SECTION */}
      <Container maxW="6xl" py={24}>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={10}
          alignItems="center"
        >
          <Box>
            <Heading
              as="h2"
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={4}
              lineHeight="1.3"
              fontWeight="500"
            >
              Where Healing Meets Compassion
            </Heading>
            <Text
              color="#2E2E2E"
              fontFamily="'Inter', sans-serif"
              lineHeight="1.8"
              fontSize="lg"
            >
              At MLC Therapy, we believe therapy works best when it combines
              empathy with thoughtful psychological care. Our goal is simple: to
              create spaces where you feel comfortable exploring what you're
              going through while working toward meaningful personal change.
            </Text>
            <Button
              mt={6}
              borderRadius="full"
              bg="#C9A960"
              color="white"
              _hover={{ bg: "#56756D", color: "white" }}
              as="a"
              href="/about"
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
              boxShadow="sm"
              px={8}
            >
              Learn More
            </Button>
          </Box>
          <Image
            src="/new-therapy-room.jpg"
            alt="Therapy Room"
            borderRadius="2xl"
            boxShadow="xl"
            w="100%"
            maxW={{ base: "100%", md: "520px" }}
            mx={{ base: "auto", md: "0" }}
          />
        </SimpleGrid>
      </Container>

      {/* SERVICES SECTION */}
      <Box bg="#F9F9F9" py={20} textAlign="center" px={6}>
        <Heading
          as="h2"
          fontFamily="'Playfair Display', serif"
          color="#2E2E2E"
          mb={12}
          fontWeight="500"
        >
          Our Services
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {[
            {
              title: "Counseling & Therapy",
              desc: "One-on-one therapy sessions designed to help you navigate emotional challenges, relationships, anxiety, life transitions, and personal growth.",
              img: "/service1_new.jpg",
              link: "/services",
              btn: "Learn More",
            },
            {
              title: "Workshops & Groups",
              desc: "Small group workshops and circles focused on emotional awareness, connection, and shared learning.",
              img: "/service2_new.jpg",
              link: "/services",
              btn: "Explore",
            },
            {
              title: "Internships & Supervision",
              desc: "Professional development spaces for therapists and psychology trainees who want to grow in ethical and reflective practice.",
              img: "/service3_new.jpg",
              link: "/supervision",
              btn: "View Programs",
            },
          ].map((s) => (
            <Box
              bg="white"
              borderRadius="2xl"
              p={6}
              boxShadow="md"
              key={s.title}
              _hover={{ transform: "translateY(-6px)", transition: "0.3s" }}
            >
              <Image
                src={s.img}
                alt={s.title}
                borderRadius="xl"
                mb={4}
                boxShadow="sm"
              />
              <Heading
                size="md"
                mb={2}
                color="#2E2E2E"
                fontWeight="600"
              >
                {s.title}
              </Heading>
              <Text
                mb={4}
                color="#555"
                fontFamily="'Inter', sans-serif"
                fontSize="md"
              >
                {s.desc}
              </Text>
              <Button
                borderRadius="full"
                bg="#56756D"
                color="white"
                _hover={{ bg: "#C9A960", color: "white" }}
                as="a"
                href={s.link}
                fontFamily="'Inter', sans-serif"
                fontWeight="500"
                px={8}
              >
                {s.btn}
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box bg="#F9F9F9" py={6} px={6} textAlign="center">
        <Text fontSize="sm" color="#56756D" fontFamily="'Inter', sans-serif">
          MLC Therapy provides online counselling and psychotherapy services across Mumbai, Delhi,
          Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad and throughout India.
        </Text>
      </Box>

      {/* FAQ SECTION */}
      <Box bg="white" py={20} px={6}>
        <Container maxW="6xl">
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={8}
            textAlign="center"
            fontWeight="500"
          >
            Common Questions About Starting Therapy
          </Heading>
          <Accordion allowToggle maxW="4xl" mx="auto">
            {[
              {
                q: "How do I know if therapy is right for me?",
                a: "Many people come to therapy simply because something in life feels difficult, confusing, or overwhelming. You don’t need to be in crisis to benefit from therapy. If something has been weighing on your mind, therapy can provide a space to explore it.",
              },
              {
                q: "What happens in the first session?",
                a: "The first session is a conversation where you can share what has been going on and what you hope might change. Your therapist will also help explain how therapy works and answer any questions you may have.",
              },
              {
                q: "What if I’m not sure the therapist is the right fit?",
                a: "Finding the right therapist matters. The first few sessions allow you to see whether you feel comfortable and understood. If it does not feel like the right fit, you are always free to explore other options.",
              },
              {
                q: "Do I need to prepare before my session?",
                a: "No preparation is necessary. You can simply come as you are and talk about what has been on your mind.",
              },
              {
                q: "Is therapy confidential?",
                a: "Yes. Therapy sessions are private and confidential except in rare situations required by law related to safety.",
              },
            ].map((item) => (
              <AccordionItem key={item.q} border="none" mb={4} bg="#F9F9F9" borderRadius="lg">
                <AccordionButton _expanded={{ bg: "#E8ECE8" }}>
                  <Box
                    flex="1"
                    textAlign="left"
                    fontFamily="'Inter', sans-serif"
                    color="#2E2E2E"
                    fontWeight="medium"
                  >
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
    </>
  );
}
