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
    primary_label: "I'm Looking for Therapy",
    primary_link: "/client-checkin",
    secondary_label: "I'm a Therapist",
    secondary_link: "/therapists",
    background_image: "/hero-bg.jpg",
    logo_url: "/logo_tra.png",
  },
  portal: {
    title: "Your MLC Portal",
    body:
      "A gentle, private space for clients — and a structured workspace for therapists. Choose your path below to get started.",
    client_title: "Client Dashboard",
    client_body:
      "Daily check‑ins, private journaling, session notes, shared materials, and premium tools when you’re ready.",
    client_primary_label: "Sign up as a client",
    client_primary_link: "/signup/client",
    client_secondary_label: "Take a quick check‑in",
    client_secondary_link: "/client-checkin",
    therapist_title: "Therapist Workspace",
    therapist_body:
      "Apply to join MLC and access therapist tools, client collaboration, and a calm workspace designed for your practice.",
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
        minH={{ base: "100svh", md: "100vh" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        px={6}
        py={10}
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
          bg: "rgba(255, 255, 255, 0.7)", // Translucent white layer
          zIndex: 1,
        }}
      >
        <Box position="relative" zIndex={2} maxW="4xl">
          <Image
            src={homeContent.hero.logo_url || "/logo_tra.png"}
            alt="MLC Therapy Logo"
            boxSize={{ base: "100px", sm: "120px", md: "140px" }}
            mb={6}
            mx="auto"
          />
          <Heading
            as="h1"
            className="hero-title"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
            color="#2E2E2E"
            letterSpacing="-0.5px"
            lineHeight="1.2"
            mb={4}
          >
            MLC Health & Wellness Centre
          </Heading>
          <Text
            mt={4}
            fontSize="xl"
            color="#56756D"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
          >
            {homeContent.hero.tagline}
          </Text>
          <Text
            mt={4}
            color="rgba(46, 46, 46, 0.9)"
            fontFamily="'Inter', sans-serif"
            fontSize="lg"
            lineHeight="1.7"
            dangerouslySetInnerHTML={{ __html: homeContent.hero.paragraph_one || "" }}
          />
          <Text
            mt={2}
            color="rgba(46, 46, 46, 0.9)"
            fontFamily="'Inter', sans-serif"
            fontSize="lg"
            lineHeight="1.7"
            dangerouslySetInnerHTML={{ __html: homeContent.hero.paragraph_two || "" }}
          />
          <HStack
            mt={8}
            spacing={4}
            flexWrap="wrap"
            justify="center"
          >
            <Button
              size="lg"
              bg="#56756D"
              color="white"
              borderRadius="full"
              _hover={{ bg: "#C9A960", color: "white" }}
              as="a"
              href={homeContent.hero.primary_link}
              fontWeight="500"
              px={10}
              py={7}
            >
              {homeContent.hero.primary_label}
            </Button>
            <Button
              size="lg"
              bg="#C9A960"
              color="white"
              borderRadius="full"
              _hover={{ bg: "#56756D", color: "white" }}
              _active={{ bg: "#56756D" }}
              as="a"
              href={homeContent.hero.secondary_link}
              fontWeight="500"
              px={10}
              py={7}
            >
              {homeContent.hero.secondary_label}
            </Button>
          </HStack>
        </Box>
      </MotionBox>

      {/* PORTAL CTA */}
      <Box bg="#F2F8F5" py={16} px={6}>
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
                  <Button as="a" href={homeContent.portal.client_primary_link} colorScheme="teal">
                    {homeContent.portal.client_primary_label}
                  </Button>
                  <Button
                    as="a"
                    href={homeContent.portal.client_secondary_link}
                    variant="outline"
                    colorScheme="teal"
                  >
                    {homeContent.portal.client_secondary_label}
                  </Button>
                </HStack>
              </Box>
              <Box bg="white" p={6} borderRadius="2xl" boxShadow="md">
                <Heading size="md" mb={2}>
                  {homeContent.portal.therapist_title}
                </Heading>
                <Text
                  color="gray.600"
                  mb={4}
                  dangerouslySetInnerHTML={{ __html: homeContent.portal.therapist_body || "" }}
                />
                <HStack spacing={3} flexWrap="wrap">
                  <Button as="a" href={homeContent.portal.therapist_primary_link} colorScheme="purple">
                    {homeContent.portal.therapist_primary_label}
                  </Button>
                  <Button
                    as="a"
                    href={homeContent.portal.therapist_secondary_link}
                    variant="outline"
                    colorScheme="purple"
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
      <Box bg="#F6F6F4" py={20} textAlign="center" px={6}>
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

      <Box bg="#F6F6F4" py={6} px={6} textAlign="center">
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
