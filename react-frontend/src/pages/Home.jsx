import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  SimpleGrid,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import theme from "../theme/theme";
import { Helmet } from "react-helmet-async";

const MotionBox = motion(Box);

export default function Home() {
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
        bgImage="url('/hero-bg.jpg')"
        bgSize="cover"
        bgPosition={{ base: "top", md: "center" }}
        minH={{ base: "100svh", md: "100vh" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        textAlign="center"
        px={6}
        py={10}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <Image
          src="/logo_tra.png"
          alt="MLC Therapy Logo"
          boxSize={{ base: "120px", sm: "140px", md: "160px" }}
          mb={4}
          maxW="80vw"
        />
        <Heading
          fontSize={{ base: "3xl", md: "4xl" }}
          color="#2E2E2E"
          fontFamily="'Playfair Display', serif"
          fontWeight="600"
          letterSpacing="-0.5px"
        >
          MLC Therapy
        </Heading>
        <Text
          mt={3}
          fontSize="lg"
          color="#56756D"
          fontFamily="'Lato', sans-serif"
          fontStyle="italic"
        >
          A space to feel, to heal, to become.
        </Text>
        <Text
          mt={2}
          color="gray.700"
          fontFamily="'Lato', sans-serif"
          fontSize="md"
          maxW="lg"
        >
          Where healing is human, structured, and ethically grounded.
        </Text>
        <Text
          mt={2}
          color="gray.700"
          fontFamily="'Lato', sans-serif"
          fontSize="md"
          maxW="xl"
        >
          Providing online therapy across India with clearly defined approaches, emotional depth,
          and uncompromising clinical standards.
        </Text>
        <Button
          mt={6}
          size="lg"
          bg="#56756D"
          color="white"
          borderRadius="full"
          _hover={{ bg: "#C9A960", color: "white" }}
          as="a"
          href="/book"
          fontFamily="'Lato', sans-serif"
          fontWeight="500"
          px={8}
          boxShadow="md"
        >
          Book a Session
        </Button>
      </MotionBox>

      {/* VALUE SECTION */}
      <Box bg="white" py={16} px={6}>
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={10}
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="600"
            textAlign="center"
          >
            What Makes MLC Different
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                Clarity &amp; Structure
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                We do not “pull techniques out of a hat.” Every client’s work is guided by a
                defined therapeutic approach and clear case conceptualisation.
              </Text>
            </Box>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                Emotional Depth &amp; Safety
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Healing requires attuned presence. We create spaces where you feel seen, not
                managed.
              </Text>
            </Box>
            <Box bg="gray.50" p={6} borderRadius="xl" border="1px solid #E2E8F0">
              <Heading size="md" mb={2} fontFamily="'Playfair Display', serif">
                High Clinical Standards
              </Heading>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Our work is grounded in ethical frameworks, supervision, and structured
                documentation aligned with international standards.
              </Text>
            </Box>
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
              fontFamily="'Playfair Display', serif"
              color="#2E2E2E"
              mb={4}
              lineHeight="1.3"
              fontWeight="600"
            >
              Where Healing Meets Compassion
            </Heading>
            <Text
              color="#2E2E2E"
              fontFamily="'Lato', sans-serif"
              lineHeight="1.8"
              fontSize="lg"
            >
              At MLC Therapy, we build spaces grounded in empathy and
              evidence-based care, where clients feel truly seen and therapists
              are supported to bring their best selves to the room.
            </Text>
            <Button
              mt={6}
              borderRadius="full"
              bg="#C9A960"
              color="white"
              _hover={{ bg: "#56756D", color: "white" }}
              as="a"
              href="/about"
              fontFamily="'Lato', sans-serif"
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
          fontFamily="'Playfair Display', serif"
          color="#2E2E2E"
          mb={12}
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="600"
        >
          Our Services
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {[
            {
              title: "Counseling & Therapy Services",
              desc: "Evidence-based therapy that helps you heal, grow, and build resilience.",
              img: "/service1_new.jpg",
              link: "/book",
              btn: "Book a Session",
            },
            {
              title: "Workshops & Groups",
              desc: "Interactive circles and workshops designed for connection and insight.",
              img: "/service2_new.jpg",
              link: "/services",
              btn: "Join a Group",
            },
            {
              title: "Internships & Supervision",
              desc: "A therapist-first learning environment that nurtures ethical practice.",
              img: "/service3_new.jpg",
              link: "/careers",
              btn: "Start Learning",
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
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
              >
                {s.title}
              </Heading>
              <Text
                mb={4}
                color="#555"
                fontFamily="'Lato', sans-serif"
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
                fontFamily="'Lato', sans-serif"
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
        <Text fontSize="sm" color="#56756D" fontFamily="'Lato', sans-serif">
          MLC Therapy provides online counselling and psychotherapy services across Mumbai, Delhi,
          Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad and throughout India.
        </Text>
      </Box>
    </>
  );
}
