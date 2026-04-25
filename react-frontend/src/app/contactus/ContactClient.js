'use client'

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
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../../api.js";
import { FaClock, FaEnvelope, FaGlobe } from "react-icons/fa";

const defaultContactContent = {
  hero: {
    title: "We’d Love to Hear from You",
    body:
      "<p>Whether you’re reaching out about online therapy, professional collaborations, therapist supervision, or joining our team, we’re here to listen. Every message is reviewed and responded to personally by our coordination team.</p>",
    email_label: "Email",
    email: "therapy@mlchealth.in",
    subtext:
      "<p>Operating remotely across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata and other major cities.</p><p>Virtual therapy sessions available internationally via secure platforms.</p>",
    image_url: "/contact-illustration.jpg",
  },
  form: {
    title: "Contact Us",
    button_label: "Send Message",
    message_placeholder: "How can we help you?",
  },
  quote: {
    text: "“Every connection begins with a conversation. We’re listening.”",
  },
  hours: {
    title: "Our Office Hours & Response Policy",
    items: [
      "Monday to Friday — 10:00 AM to 9:00 PM IST",
      "Responses within 2 to 4 business days.",
      "Virtual consultations available worldwide.",
    ],
  },
  closing: {
    title: "Your Message is Safe with Us",
    body:
      "<p>All communications are received securely and handled with strict confidentiality. We respond personally to every inquiry because at MLC Health & Wellness Centre, healing begins with being heard.</p>",
  },
};

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.35rem" },
};

export default function ContactClient() {
  const form = useRef();
  const toast = useToast();
  const [content, setContent] = useState(defaultContactContent);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("contact-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultContactContent.hero, ...(entry.hero || {}) },
            form: { ...defaultContactContent.form, ...(entry.form || {}) },
            quote: { ...defaultContactContent.quote, ...(entry.quote || {}) },
            hours: { ...defaultContactContent.hours, ...(entry.hours || {}) },
            closing: { ...defaultContactContent.closing, ...(entry.closing || {}) },
          });
        }
      } catch {
        setContent(defaultContactContent);
      }
    })();
  }, []);

  const sendEmail = async (e) => {
    e.preventDefault();
    const formData = new FormData(form.current);
    const data = Object.fromEntries(formData.entries());

    try {
      await apiPost("contact-messages/", data);
      toast({
        title: "Message Sent!",
        description: "We’ll get back to you within 2–4 days 🌿",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      form.current.reset();
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong, please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box
        bgGradient="linear(to-b, #F6F6F4, #E8ECE8)"
        py={20}
        px={8}
      >
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="start" spacing={5}>
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontWeight="600"
                color="#2E2E2E"
              >
                {content.hero.title}
              </Heading>
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                maxW="3xl"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: content.hero.body }}
              />
              <Text
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                fontWeight="500"
              >
                📧 {content.hero.email_label}: <strong>{content.hero.email}</strong>
              </Text>
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                fontSize="sm"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: content.hero.subtext }}
              />
            </VStack>

            <Image
              src={content.hero.image_url || "/contact-illustration.jpg"}
              alt="A peaceful and professional illustration representing secure communication and empathetic connection at MLC Health"
              borderRadius="2xl"
              boxShadow="md"
              maxH="400px"
              objectFit="cover"
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Box bg="white" py={24}>
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={14} alignItems="flex-start">
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
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                color="#2E2E2E"
              >
                {content.form.title}
              </Heading>

              <FormField label="Full Name" name="full_name" isRequired />
              <FormField label="Email Address" name="email" type="email" isRequired />
              <FormField label="Phone Number" name="phone" />
              <FormControl mb={4}>
                <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                  Message
                </FormLabel>
                <Textarea
                  name="message"
                  placeholder={content.form.message_placeholder}
                  borderColor="gray.300"
                  bg="white"
                  borderRadius="lg"
                  _focus={{
                    borderColor: "#C9A960",
                    boxShadow: "0 0 0 1px #C9A960",
                  }}
                />
              </FormControl>

              <Button
                mt={6}
                type="submit"
                bg="#56756D"
                borderRadius="full"
                px={12}
                py={6}
                fontFamily="'Inter', var(--font-inter), sans-serif"
                fontWeight="600"
                color="white"
                _hover={{ bg: "#C9A960" }}
              >
                {content.form.button_label}
              </Button>
            </Box>

            <VStack spacing={8} align="start">
              <Text
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                fontStyle="italic"
                fontSize="xl"
                color="#2E2E2E"
                lineHeight="1.6"
              >
                {content.quote.text}
              </Text>

              <Box bg="#E9F2ED" p={8} borderRadius="2xl" w="100%">
                <Heading
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontWeight="600"
                  fontSize="lg"
                  mb={4}
                  color="#2E2E2E"
                >
                  {content.hours.title}
                </Heading>
                <VStack align="start" spacing={3}>
                  {(content.hours.items || []).map((item, idx) => {
                    const icons = [FaClock, FaEnvelope, FaGlobe];
                    const ItemIcon = icons[idx] || FaClock;
                    return (
                      <HStack spacing={3} key={`hours-${idx}`}>
                        <Icon as={ItemIcon} color="#56756D" />
                        <Text fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
                          {item}
                        </Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      <Box
        bg="#56756D"
        color="white"
        textAlign="center"
        py={20}
        px={8}
      >
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            mb={4}
          >
            {content.closing.title}
          </Heading>
          <Box
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize="md"
            maxW="3xl"
            mx="auto"
            lineHeight="1.8"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.closing.body }}
          />
        </Container>
      </Box>
    </Box>
  );
}

function FormField({ label, name, type = "text", isRequired = false }) {
  return (
    <FormControl isRequired={isRequired} mb={4}>
      <FormLabel fontFamily="'Inter', var(--font-inter), sans-serif" color="#2E2E2E">
        {label}
      </FormLabel>
      <Input
        name={name}
        type={type}
        bg="white"
        borderRadius="lg"
        borderColor="gray.300"
        _focus={{ borderColor: "#C9A960", boxShadow: "0 0 0 1px #C9A960" }}
      />
    </FormControl>
  );
}
