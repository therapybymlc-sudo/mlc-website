'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  SimpleGrid,
  Image,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  RadioGroup,
  Radio,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  EMAIL_SERVICE_ID,
  EMAIL_TEMPLATE_ID,
  EMAIL_PUBLIC_KEY,
} from "../../emailConfig";
import { apiGet } from "../../api.js";

const defaultCareersContent = {
  hero: {
    title: "Join Our Team of Dedicated Therapists",
    body:
      "<p>At MLC Health & Wellness Centre, we are building a space that values both clients and clinicians. We seek professionals who believe in collaboration, ethical standards, structured care, and sustainable growth. Healing that holds the healer is not a slogan. It is our foundation.</p>",
    image_url: "/careers1.jpg",
  },
  why: {
    title: "Why Work With MLC Health & Wellness Centre",
    body:
      "<p>We invest in therapist wellbeing, ethical practice, and community. Our systems are designed to support clinicians so they can do their best work.</p>",
    items: [
      {
        title: "Therapist-First Model",
        body:
          "<p>A structured system that protects boundaries and ensures sustainable caseloads. Ethical care begins with supported clinicians.</p>",
      },
      {
        title: "Clinical Supervision & Mentorship",
        body:
          "<p>Guided spaces for case reflection, ethical consultation, and professional development. Growth through structured mentorship, not micromanagement.</p>",
      },
      {
        title: "Flexible Work Options",
        body:
          "<p>Remote opportunities across India that respect your time, geography, and lifestyle while maintaining high clinical standards.</p>",
      },
      {
        title: "Meaningful Collaboration",
        body:
          "<p>Join a growing network of professionals committed to raising the standards of therapy in India through clarity, ethics, and relational depth.</p>",
      },
    ],
  },
  openings: {
    title: "Current Openings",
    subtitle:
      "<p>We’re growing thoughtfully. Explore the roles below and apply if one feels aligned.</p>",
    apply_label: "Apply to this role",
    cards: [
      {
        title: "Clinical Therapist (Online)",
        location: "Remote · India",
        type: "Contract",
        summary:
          "<p>Provide ethical therapy within our structured and supportive system.</p>",
        details:
          "<p><strong>Responsibilities:</strong></p><ul><li>Deliver client‑centered sessions</li><li>Maintain timely documentation</li><li>Participate in supervision</li></ul><p><strong>Requirements:</strong> Licensed clinician with experience in individual therapy.</p>",
      },
    ],
  },
  opportunities: {
    title: "Opportunities at MLC",
    cards: [
      {
        title: "Therapist Positions",
        body:
          "<p>Flexible, structured, and ethically aligned roles for professionals who value balance and meaningful client work.</p>",
      },
      {
        title: "Supervisor Network",
        body:
          "<p>Mentor and guide therapists through reflective supervision and structured case consultation.</p>",
      },
      {
        title: "Internships",
        body:
          "<p>Hands-on exposure, guided mentorship, and meaningful learning within a structured clinical framework.</p>",
      },
    ],
  },
  form: {
    title: "Apply Now",
    subtitle:
      "<p>Share your details and we’ll reach out with next steps. We review every application with care.</p>",
    name_label: "Full name",
    email_label: "Email address",
    phone_label: "Phone number",
    role_label: "Position applying for",
    resume_label: "Link to CV or LinkedIn Profile",
    resume_hint: "Paste your CV or LinkedIn link",
    message_label: "Cover Letter",
    submit_label: "Send Application",
    success_title: "Application Sent!",
    success_body: "Thank you for applying, we’ll get back to you soon 🌿",
  },
  footer: {
    title: "A Space That Holds the Healer Too",
    body:
      "<p>MLC Health & Wellness Centre was built on the belief that sustainability and empathy are inseparable. Join a team redefining what it means to care for others and for ourselves.</p>",
    cta_label: "Email us at therapy@mlchealth.in",
    cta_link: "mailto:therapy@mlchealth.in",
  },
};

const richTextStyles = {
  "p + p": { marginTop: "0.75rem" },
  "ul, ol": { paddingLeft: "1.25rem", marginTop: "0.5rem" },
  li: { marginBottom: "0.35rem" },
};

export default function CareersClient() {
  const formRef = useRef();
  const toast = useToast();
  const [content, setContent] = useState(defaultCareersContent);
  const [activeOpening, setActiveOpening] = useState(null);
  const applySectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("careers-content/");
        const data = res.results ?? res;
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          setContent({
            hero: { ...defaultCareersContent.hero, ...(entry.hero || {}) },
            why: { ...defaultCareersContent.why, ...(entry.why || {}) },
            openings: {
              ...defaultCareersContent.openings,
              ...(entry.openings || {}),
            },
            opportunities: {
              ...defaultCareersContent.opportunities,
              ...(entry.opportunities || {}),
            },
            form: { ...defaultCareersContent.form, ...(entry.form || {}) },
            footer: { ...defaultCareersContent.footer, ...(entry.footer || {}) },
          });
        }
      } catch {
        setContent(defaultCareersContent);
      }
    })();
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, formRef.current, EMAIL_PUBLIC_KEY)
      .then(() => {
        toast({
          title: content.form.success_title || "Application Sent!",
          description: content.form.success_body || "Thank you for applying, we’ll get back to you soon 🌿",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        formRef.current.reset();
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

  const scrollToApply = () => {
    applySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box>
      {/* HERO SECTION */}
      <Box bgGradient="linear(to-b, #F6F6F4, #E8ECE8)" py={24} px={8}>
        <Container maxW="7xl">
          <HStack
            spacing={12}
            align="start"
            flexDir={{ base: "column", md: "row" }}
          >
            <Box flex="1">
              <Heading
                fontFamily="'Playfair Display', var(--font-playfair), serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                {content.hero.title}
              </Heading>
              <Box
                fontFamily="'Inter', var(--font-inter), sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: content.hero.body || "" }}
              />
            </Box>
            <Image
              src={content.hero.image_url || "/careers1.jpg"}
              alt={content.hero.title || "Calm therapy room"}
              borderRadius="2xl"
              boxShadow="md"
              maxW="400px"
            />
          </HStack>
        </Container>
      </Box>

      {/* WHY WORK WITH US */}
      <Box bg="#E9F2ED" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            color="#2E2E2E"
            mb={6}
            fontWeight="600"
          >
            {content.why.title}
          </Heading>
          <Box
            fontFamily="'Inter', var(--font-inter), sans-serif"
            color="#2E2E2E"
            lineHeight="1.8"
            fontSize="md"
            maxW="3xl"
            mx="auto"
            mb={12}
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.why.body || "" }}
          />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {(content.why.items || []).map((item, index) => (
              <Box
                key={`${item.title}-${index}`}
                bg="white"
                borderRadius="2xl"
                p={8}
                boxShadow="md"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-6px)", boxShadow: "xl" }}
              >
                <Heading
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontSize="lg"
                  mb={3}
                  color="#2E2E2E"
                >
                  {item.title}
                </Heading>
                <Box
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  color="#2E2E2E"
                  lineHeight="1.7"
                  fontSize="sm"
                  sx={richTextStyles}
                  dangerouslySetInnerHTML={{ __html: item.body || "" }}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* OPPORTUNITIES */}
      <Box bg="#F9F9F9" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            color="#2E2E2E"
            mb={10}
            fontWeight="600"
          >
            {content.opportunities.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {(content.opportunities.cards || []).map((card, index) => (
              <Box
                key={`${card.title}-${index}`}
                bg="white"
                borderRadius="2xl"
                p={8}
                boxShadow="md"
                textAlign="center"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-6px)", boxShadow: "lg" }}
              >
                <Heading
                  size="md"
                  mb={3}
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  color="#2E2E2E"
                >
                  {card.title}
                </Heading>
                <Box
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  color="#2E2E2E"
                  lineHeight="1.7"
                  sx={richTextStyles}
                  dangerouslySetInnerHTML={{ __html: card.body || "" }}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* FORM */}
      <Box bg="#E9F2ED" py={24} px={8} ref={applySectionRef}>
        <Container maxW="5xl">
          <VStack spacing={4} mb={10} textAlign="center">
            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontWeight="600"
              color="#2E2E2E"
            >
              {content.form.title}
            </Heading>
            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="#2E2E2E"
              lineHeight="1.8"
              maxW="3xl"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.form.subtitle || "" }}
            />
          </VStack>

          <Box
            as="form"
            ref={formRef}
            onSubmit={sendEmail}
            bg="white"
            p={10}
            borderRadius="2xl"
            boxShadow="md"
          >
            <FormControl isRequired mb={4}>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                {content.form.name_label}
              </FormLabel>
              <Input
                name="full_name"
                bg="white"
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                {content.form.email_label}
              </FormLabel>
              <Input
                name="email"
                type="email"
                bg="white"
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                {content.form.role_label}
              </FormLabel>
              <Input
                name="position"
                placeholder="Therapist / Supervisor / Intern"
                bg="white"
                borderRadius="lg"
                borderColor="gray.300"
                _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }}
              />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                Are you comfortable being contacted via phone?
              </FormLabel>
              <RadioGroup defaultValue="Yes" name="comfortable">
                <HStack spacing={6}>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl mb={4}>
                <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">{content.form.phone_label}</FormLabel>
                <Input name="phone" type="tel" bg="white" borderRadius="lg" borderColor="gray.300"
                    _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }} />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
                {content.form.message_label}
              </FormLabel>
              <Textarea
                name="message"
                placeholder="Tell us why you would be a good fit"
                bg="white"
                borderRadius="lg"
                _focus={{
                  borderColor: "#A9CBB7",
                  boxShadow: "0 0 0 1px #A9CBB7",
                }}
              />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">{content.form.resume_label}</FormLabel>
                <Input name="link" placeholder={content.form.resume_hint} bg="white" borderRadius="lg" borderColor="gray.300"
                    _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }} />
            </FormControl>

            <Button
              mt={6}
              type="submit"
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={10}
              py={6}
              fontWeight="500"
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              {content.form.submit_label}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box bg="#56756D" py={20} textAlign="center" color="white">
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', var(--font-playfair), serif"
            fontWeight="600"
            mb={6}
          >
            {content.footer.title}
          </Heading>
          <Box
            fontFamily="'Inter', var(--font-inter), sans-serif"
            fontSize="md"
            maxW="3xl"
            mx="auto"
            lineHeight="1.8"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.footer.body || "" }}
          />
          <Button
            as="a"
            href={content.footer.cta_link}
            mt={8}
            bg="white"
            color="#2E2E2E"
            borderRadius="full"
            px={10}
            py={6}
            _hover={{ bg: "#F2F2F0" }}
          >
            {content.footer.cta_label}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
