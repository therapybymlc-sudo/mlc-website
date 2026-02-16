import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Image,
  Container,
  useToast,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  EMAIL_SERVICE_ID,
  EMAIL_TEMPLATE_ID,
  EMAIL_PUBLIC_KEY,
} from "../emailConfig";
import { FaClock, FaEnvelope, FaGlobe } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

export default function ContactUs() {
  const form = useRef();
  const toast = useToast();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form.current, EMAIL_PUBLIC_KEY)
      .then(() => {
        toast({
          title: "Message Sent!",
          description: "We’ll get back to you within 2–4 days 🌿",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        form.current.reset();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Something went wrong, please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  return (
    <Box>
      <Helmet>
        <title>
          Contact MLC Health & Wellness Centre | Online Therapy Across India
        </title>
        <meta
          name="description"
          content="Contact MLC Health & Wellness Centre for online therapy across India, collaborations, supervision inquiries, or career opportunities. Serving Mumbai, Delhi, Bangalore, Hyderabad, Chennai and more with secure virtual consultations."
        />
              <meta property="og:image" content="https://mlchealth.in/contact-illustration.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/contact-illustration.jpg" />
      </Helmet>
      {/* HERO SECTION */}
      <Box
        bgGradient="linear(to-b, #F6F6F4, #E8ECE8)"
        py={20}
        px={8}
      >
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            {/* TEXT SIDE */}
            <VStack align="start" spacing={5}>
              <Heading
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
                color="#2E2E2E"
              >
                We’d Love to Hear from You
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                maxW="3xl"
              >
                Whether you’re reaching out about online therapy, professional
                collaborations, therapist supervision, or joining our team, we’re
                here to listen. Every message is reviewed and responded to
                personally by our coordination team.
              </Text>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                fontWeight="500"
              >
                📧 Email: <strong>therapy@mlchealth.in</strong>
              </Text>
              <Text fontFamily="'Lato', sans-serif" color="#2E2E2E" fontSize="sm">
                🌍 Operating remotely across India including Mumbai, Delhi,
                Bangalore, Hyderabad, Chennai, Pune, Kolkata and other major
                cities.
                <br />Virtual therapy sessions available internationally via secure
                platforms.
              </Text>
            </VStack>

            {/* IMAGE SIDE */}
            <Image
              src="/contact-illustration.jpg"
              alt="Serene communication illustration"
              borderRadius="2xl"
              boxShadow="md"
              maxH="400px"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CONTACT FORM SECTION */}
      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={14} alignItems="flex-start">
            {/* LEFT: FORM */}
            <Box
              as="form"
              ref={form}
              onSubmit={sendEmail}
              bg="#F9F9F9"
              p={10}
              borderRadius="2xl"
              boxShadow="md"
            >
              <Heading
                size="md"
                mb={6}
                fontFamily="'Playfair Display', serif"
                color="#2E2E2E"
              >
                Contact Us
              </Heading>

              <FormField label="Full Name" name="full_name" isRequired />
              <FormField label="Email Address" name="email" type="email" isRequired />
              <FormField label="Phone Number" name="phone" />
              <FormControl mb={4}>
                <FormLabel fontFamily="'Lato', sans-serif" color="#2E2E2E">
                  Message
                </FormLabel>
                <Textarea
                  name="message"
                  placeholder="How can we help you?"
                  borderColor="gray.300"
                  bg="white"
                  borderRadius="lg"
                  _focus={{
                    borderColor: "#A9CBB7",
                    boxShadow: "0 0 0 1px #A9CBB7",
                  }}
                />
              </FormControl>

              <Button
                mt={6}
                type="submit"
                bg="#56756D"
                borderRadius="full"
                px={8}
                py={6}
                fontFamily="'Lato', sans-serif"
                fontWeight="500"
                color="white"
                _hover={{ bg: "#C9A960", color: "white" }}
              >
                Send Message
              </Button>
            </Box>

            {/* RIGHT: DETAILS & QUOTE */}
            <VStack spacing={8} align="start">
              <Text
                fontFamily="'Playfair Display', serif"
                fontStyle="italic"
                fontSize="xl"
                color="#2E2E2E"
                lineHeight="1.6"
              >
                “Every connection begins with a conversation. We’re listening.”
              </Text>

              <Box bg="#E8ECE8" p={8} borderRadius="2xl" w="100%">
                <Heading
                  fontFamily="'Playfair Display', serif"
                  fontWeight="600"
                  fontSize="lg"
                  mb={4}
                  color="#2E2E2E"
                >
                  Our Office Hours & Response Policy
                </Heading>
                <VStack align="start" spacing={3}>
                  <HStack spacing={3}>
                    <Icon as={FaClock} color="#56756D" />
                    <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                      Monday to Friday — 10:00 AM to 9:00 PM IST
                    </Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FaEnvelope} color="#56756D" />
                    <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                      Responses within 2 to 4 business days.
                    </Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FaGlobe} color="#56756D" />
                    <Text fontFamily="'Lato', sans-serif" color="#2E2E2E">
                      Virtual consultations available worldwide.
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* REASSURANCE / CLOSING BANNER */}
      <Box
        bg="#56756D"
        color="white"
        textAlign="center"
        py={20}
        px={8}
        borderTopRadius="2xl"
      >
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            mb={4}
          >
            Your Message is Safe with Us
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="md"
            maxW="3xl"
            mx="auto"
            lineHeight="1.8"
          >
            All communications are received securely and handled with strict
            confidentiality. We respond personally to every inquiry because at
            MLC Health & Wellness Centre, healing begins with being heard.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}

/* SMALL FORM FIELD COMPONENT */
function FormField({ label, name, type = "text", isRequired = false }) {
  return (
    <FormControl isRequired={isRequired} mb={4}>
      <FormLabel fontFamily="'Lato', sans-serif" color="#2E2E2E">
        {label}
      </FormLabel>
      <Input
        name={name}
        type={type}
        bg="white"
        borderRadius="lg"
        borderColor="gray.300"
        _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }}
      />
    </FormControl>
  );
}
