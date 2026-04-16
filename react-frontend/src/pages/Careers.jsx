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
} from "../emailConfig";
import { Helmet } from "react-helmet-async";
import { apiGet } from "../api.js";

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
          "<p>Remote and hybrid opportunities across India that respect your time, geography, and lifestyle while maintaining high clinical standards.</p>",
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
          "<p>Provide online therapy within our structured and supportive system.</p>",
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

export default function Careers() {
  const form = useRef();
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
      .sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form.current, EMAIL_PUBLIC_KEY)
      .then(() => {
        toast({
          title: content.form.success_title || "Application Sent!",
          description: content.form.success_body || "Thank you for applying, we’ll get back to you soon 🌿",
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

  const scrollToApply = () => {
    applySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box>
      <Helmet>
        <title>
          Careers at MLC Health & Wellness Centre | Therapist, Supervisor &
          Internship Opportunities
        </title>
        <meta
          name="description"
          content="Join MLC Health & Wellness Centre’s growing therapist network. We offer structured online therapy roles, supervision opportunities, and internships across India with ethical practice, mentorship, and sustainable workloads."
        />
        <meta
          property="og:image"
          content={content.hero.image_url || "https://mlchealth.in/careers1.jpg"}
        />
        <meta
          name="twitter:image"
          content={content.hero.image_url || "https://mlchealth.in/careers1.jpg"}
        />
      </Helmet>
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
                fontFamily="'Playfair Display', serif"
                mb={4}
                color="#2E2E2E"
                fontWeight="600"
              >
                {content.hero.title}
              </Heading>
              <Box
                fontFamily="'Inter', sans-serif"
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
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={6}
            fontWeight="600"
          >
            {content.why.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
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
                _hover={{ transform: "translateY(-6px)", boxShadow: "xl" }}
                transition="all 0.3s ease"
              >
                <Heading
                  fontFamily="'Playfair Display', serif"
                  fontSize="lg"
                  mb={3}
                  color="#2E2E2E"
                >
                  {item.title}
                </Heading>
                <Box
                  fontFamily="'Inter', sans-serif"
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

      {/* OPPORTUNITIES SECTION */}
      <Box bg="#F9F9F9" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={10}
            fontWeight="600"
          >
            {content.opportunities.title}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {(content.opportunities.cards || []).map((card, index) => (
              <PositionCard
                key={`${card.title}-${index}`}
                title={card.title}
                body={card.body}
              />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* OPENINGS SECTION */}
      <Box bg="white" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={4}
            fontWeight="600"
          >
            {content.openings.title}
          </Heading>
          <Box
            maxW="3xl"
            mx="auto"
            mb={12}
            color="#2E2E2E"
            fontFamily="'Inter', sans-serif"
            lineHeight="1.8"
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.openings.subtitle || "" }}
          />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {(content.openings.cards || []).map((opening, index) => (
              <Box
                key={`${opening.title}-${index}`}
                bg="#F8F8F4"
                borderRadius="2xl"
                p={6}
                boxShadow="md"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
                onClick={() => setActiveOpening(opening)}
              >
                <Heading
                  size="md"
                  mb={3}
                  fontFamily="'Playfair Display', serif"
                  color="#2E2E2E"
                >
                  {opening.title}
                </Heading>
                <HStack spacing={2} justify="center" flexWrap="wrap">
                  {opening.location ? (
                    <Text fontSize="sm" color="#56756D">
                      {opening.location}
                    </Text>
                  ) : null}
                  {opening.type ? (
                    <Text fontSize="sm" color="#56756D">
                      · {opening.type}
                    </Text>
                  ) : null}
                </HStack>
                <Text mt={4} fontSize="sm" color="#56756D">
                  Tap to view details
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* APPLICATION FORM */}
      <Box bg="#E9F2ED" py={24} px={8} ref={applySectionRef} id="careers-apply">
        <Container maxW="5xl">
          <Heading
            textAlign="center"
            mb={4}
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            color="#2E2E2E"
          >
            {content.form.title}
          </Heading>
          <Box
            textAlign="center"
            fontFamily="'Inter', sans-serif"
            color="#2E2E2E"
            lineHeight="1.8"
            maxW="3xl"
            mx="auto"
            mb={10}
            sx={richTextStyles}
            dangerouslySetInnerHTML={{ __html: content.form.subtitle || "" }}
          />

          <Box
            as="form"
            ref={form}
            onSubmit={sendEmail}
            bg="white"
            p={10}
            borderRadius="2xl"
            boxShadow="md"
          >
            <input type="hidden" name="form_type" value="Careers Form" />

            <SimpleField label={content.form.name_label} name="full_name" isRequired />
            <SimpleField
              label={content.form.email_label}
              name="email"
              type="email"
              isRequired
            />
            <SimpleField
              label={content.form.role_label}
              name="position"
              placeholder="Therapist / Supervisor / Intern"
            />

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

            <SimpleField label={content.form.phone_label} name="phone" type="tel" />
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
            <SimpleField
              label={content.form.resume_label}
              name="link"
              placeholder={content.form.resume_hint}
            />

            <Button
              mt={6}
              type="submit"
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={8}
              py={6}
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              {content.form.submit_label}
            </Button>
          </Box>

          <Box textAlign="center" mt={12}>
            <Text color="#2E2E2E" mb={4} fontFamily="'Inter', sans-serif">
              Prefer email?
            </Text>
            <Button
              as="a"
              href={content.footer.cta_link}
              variant="outline"
              borderColor="#C9A960"
              _hover={{ bg: "#C9A960", color: "white" }}
              borderRadius="full"
            >
              {content.footer.cta_label}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FOOTER BANNER */}
      <Box bg="#56756D" py={20} textAlign="center" color="white">
        <Container maxW="6xl">
          <Heading
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            mb={6}
          >
            {content.footer.title}
          </Heading>
          <Box
            fontFamily="'Inter', sans-serif"
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
            px={8}
            py={6}
            fontFamily="'Inter', sans-serif"
            _hover={{ bg: "#F2F2F0" }}
          >
            {content.footer.cta_label}
          </Button>
        </Container>
      </Box>

      {activeOpening ? (
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
          onClick={() => setActiveOpening(null)}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            maxW="680px"
            w="100%"
            p={{ base: 6, md: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Heading size="lg" fontFamily="'Playfair Display', serif" mb={2}>
              {activeOpening.title}
            </Heading>
            <Text color="#56756D" mb={4}>
              {[activeOpening.location, activeOpening.type].filter(Boolean).join(" · ")}
            </Text>
            {activeOpening.summary ? (
              <Box
                fontFamily="'Inter', sans-serif"
                color="#2E2E2E"
                lineHeight="1.7"
                mb={4}
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: activeOpening.summary }}
              />
            ) : null}
            {activeOpening.details ? (
              <Box
                fontFamily="'Inter', sans-serif"
                color="#2E2E2E"
                lineHeight="1.7"
                sx={richTextStyles}
                dangerouslySetInnerHTML={{ __html: activeOpening.details }}
              />
            ) : null}
            <HStack mt={6} justify="space-between">
              <Button variant="ghost" onClick={() => setActiveOpening(null)}>
                Close
              </Button>
              <Button
                bg="#A9CBB7" color="#2E2E2E" _hover={{ bg: "#56756D", color: "white" }}
                onClick={() => {
                  setActiveOpening(null);
                  scrollToApply();
                }}
              >
                {content.openings.apply_label || "Apply to this role"}
              </Button>
            </HStack>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

/* 🔸 Reusable Components */

function SimpleField({ label, name, type = "text", isRequired = false, placeholder }) {
  return (
    <FormControl isRequired={isRequired} mb={4}>
      <FormLabel fontFamily="'Inter', sans-serif" color="#2E2E2E">
        {label}
      </FormLabel>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        bg="white"
        borderRadius="lg"
        borderColor="gray.300"
        _focus={{ borderColor: "#A9CBB7", boxShadow: "0 0 0 1px #A9CBB7" }}
      />
    </FormControl>
  );
}

function PositionCard({ title, body }) {
  return (
    <Box
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
        fontFamily="'Playfair Display', serif"
        color="#2E2E2E"
      >
        {title}
      </Heading>
      <Box
        fontFamily="'Inter', sans-serif"
        color="#2E2E2E"
        lineHeight="1.7"
        sx={richTextStyles}
        dangerouslySetInnerHTML={{ __html: body || "" }}
      />
    </Box>
  );
}
