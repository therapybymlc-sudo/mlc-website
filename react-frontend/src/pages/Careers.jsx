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
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  EMAIL_SERVICE_ID,
  EMAIL_TEMPLATE_ID,
  EMAIL_PUBLIC_KEY,
} from "../emailConfig";
import { Helmet } from "react-helmet-async";

export default function Careers() {
  const form = useRef();
  const toast = useToast();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, form.current, EMAIL_PUBLIC_KEY)
      .then(() => {
        toast({
          title: "Application Sent!",
          description: "Thank you for applying, we’ll get back to you soon 🌿",
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
          Careers at MLC Health & Wellness Centre | Therapist, Supervisor &
          Internship Opportunities
        </title>
        <meta
          name="description"
          content="Join MLC Health & Wellness Centre’s growing therapist network. We offer structured online therapy roles, supervision opportunities, and internships across India with ethical practice, mentorship, and sustainable workloads."
        />
              <meta property="og:image" content="https://mlchealth.in/careers1.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/careers1.jpg" />
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
                Join Our Team of Dedicated Therapists
              </Heading>
              <Text
                fontFamily="'Lato', sans-serif"
                color="#2E2E2E"
                lineHeight="1.8"
                fontSize="lg"
              >
                At MLC Health & Wellness Centre, we are building a space that
                values both clients and clinicians. We seek professionals who
                believe in collaboration, ethical standards, structured care, and
                sustainable growth. Healing that holds the healer is not a slogan.
                It is our foundation.
              </Text>
            </Box>
            <Image
              src="/careers1.jpg"
              alt="Calm therapy room"
              borderRadius="2xl"
              boxShadow="md"
              maxW="400px"
            />
          </HStack>
        </Container>
      </Box>

      {/* WHY WORK WITH US */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={12}
            fontWeight="600"
          >
            Why Work With MLC Health & Wellness Centre
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {[
              {
                title: "Therapist-First Model",
                desc: "A structured system that protects boundaries and ensures sustainable caseloads. Ethical care begins with supported clinicians.",
              },
              {
                title: "Clinical Supervision & Mentorship",
                desc: "Guided spaces for case reflection, ethical consultation, and professional development. Growth through structured mentorship, not micromanagement.",
              },
              {
                title: "Flexible Work Options",
                desc: "Remote and hybrid opportunities across India that respect your time, geography, and lifestyle while maintaining high clinical standards.",
              },
              {
                title: "Meaningful Collaboration",
                desc: "Join a growing network of professionals committed to raising the standards of therapy in India through clarity, ethics, and relational depth.",
              },
            ].map((item) => (
              <Box
                key={item.title}
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
                <Text
                  fontFamily="'Lato', sans-serif"
                  color="#2E2E2E"
                  lineHeight="1.7"
                  fontSize="sm"
                >
                  {item.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* OPPORTUNITIES SECTION */}
      <Box bg="#F6F6F4" py={24} px={8}>
        <Container maxW="7xl" textAlign="center">
          <Heading
            fontFamily="'Playfair Display', serif"
            color="#2E2E2E"
            mb={10}
            fontWeight="600"
          >
            Opportunities at MLC
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <PositionCard
              title="Therapist Positions"
              desc="Flexible, structured, and ethically aligned roles for professionals who value balance and meaningful client work."
            />
            <PositionCard
              title="Supervisor Network"
              desc="Mentor and guide therapists through reflective supervision and structured case consultation."
            />
            <PositionCard
              title="Internships"
              desc="Hands-on exposure, guided mentorship, and meaningful learning within a structured clinical framework."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* APPLICATION FORM */}
      <Box bg="#E8ECE8" py={24} px={8}>
        <Container maxW="5xl">
          <Heading
            textAlign="center"
            mb={10}
            fontFamily="'Playfair Display', serif"
            fontWeight="600"
            color="#2E2E2E"
          >
            Apply Now
          </Heading>

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

            <SimpleField label="Full name" name="full_name" isRequired />
            <SimpleField label="Email address" name="email" type="email" isRequired />
            <SimpleField
              label="Position applying for"
              name="position"
              placeholder="Therapist / Supervisor / Intern"
            />

            <FormControl isRequired mb={4}>
              <FormLabel fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Are you comfortable being contacted via phone?
              </FormLabel>
              <RadioGroup defaultValue="Yes" name="comfortable">
                <HStack spacing={6}>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <SimpleField label="Phone Number" name="phone" type="tel" />
            <FormControl mb={4}>
              <FormLabel fontFamily="'Lato', sans-serif" color="#2E2E2E">
                Cover Letter
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
              label="Link to CV or LinkedIn Profile"
              name="link"
              placeholder="Paste your CV or LinkedIn link"
            />

            <Button
              mt={6}
              type="submit"
              bg="#56756D"
              color="white"
              borderRadius="full"
              px={8}
              py={6}
              fontFamily="'Lato', sans-serif"
              fontWeight="500"
              _hover={{ bg: "#C9A960", color: "white" }}
            >
              Send Application
            </Button>
          </Box>

          <Box textAlign="center" mt={12}>
            <Text color="#2E2E2E" mb={4} fontFamily="'Lato', sans-serif">
              Prefer email?
            </Text>
            <Button
              as="a"
              href="mailto:therapy@mlchealth.in"
              variant="outline"
              borderColor="#C9A960"
              _hover={{ bg: "#C9A960", color: "white" }}
              borderRadius="full"
            >
              Email us at therapy@mlchealth.in
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
            A Space That Holds the Healer Too
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="md"
            maxW="3xl"
            mx="auto"
            lineHeight="1.8"
          >
            MLC Health & Wellness Centre was built on the belief that
            sustainability and empathy are inseparable. Join a team redefining
            what it means to care for others and for ourselves.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}

/* 🔸 Reusable Components */

function SimpleField({ label, name, type = "text", isRequired = false, placeholder }) {
  return (
    <FormControl isRequired={isRequired} mb={4}>
      <FormLabel fontFamily="'Lato', sans-serif" color="#2E2E2E">
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

function PositionCard({ title, desc }) {
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
      <Text
        fontFamily="'Lato', sans-serif"
        color="#2E2E2E"
        lineHeight="1.7"
      >
        {desc}
      </Text>
    </Box>
  );
}
