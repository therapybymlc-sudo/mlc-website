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
  Container,
  useToast,
  SimpleGrid,
  Icon,
  Link,
  Badge,
  Circle,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "../../api.js";
import {
  FiClock, FiMail, FiGlobe, FiPhone,
  FiSend, FiUser, FiMessageSquare,
  FiArrowRight, FiShield, FiMapPin,
  FiLock, FiHeart, FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import FeedbackWidget from "../../components/FeedbackWidget.jsx";
import ModernSelect from "../../components/ModernSelect.jsx";

const MotionBox = motion(Box);

const topicOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "therapy", label: "Therapy Consultation" },
  { value: "supervision", label: "Supervision & Training" },
  { value: "collaboration", label: "Partnership / Collaboration" },
  { value: "careers", label: "Careers & Joining MLC" },
];

const defaultContactContent = {
  hero: {
    title: "We'd Love to Hear from You",
    body:
      "<p>Whether you're reaching out about online therapy, professional collaborations, therapist supervision, or joining our team, we're here to listen. Every message is reviewed and responded to personally by our coordination team.</p>",
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
    text: "\u201CEvery connection begins with a conversation. We\u2019re listening.\u201D",
  },
  hours: {
    title: "Our Office Hours & Response Policy",
    items: [
      "Monday to Friday: 10:00 AM to 9:00 PM IST",
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const hoursIcons = [FiClock, FiMail, FiGlobe];

export default function ContactClient() {
  const form = useRef();
  const toast = useToast();
  const [content, setContent] = useState(defaultContactContent);
  const [topic, setTopic] = useState("general");

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
        description: "We'll get back to you within 2\u20134 days 🌿",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      form.current.reset();
      setTopic("general");
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

  const contactCards = [
    {
      icon: FiMail,
      label: "Email",
      value: content.hero.email || "therapy@mlchealth.in",
      href: `mailto:${content.hero.email || "therapy@mlchealth.in"}`,
      color: "#56756D",
    },
    {
      icon: FiPhone,
      label: "Phone",
      value: "+91 9901619968",
      href: "tel:+919901619968",
      color: "#56756D",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      value: "Start Chat",
      href: "https://wa.me/919901619968",
      color: "#25D366",
    },
    {
      icon: FiMapPin,
      label: "Coverage",
      value: "Pan-India & International",
      href: null,
      color: "#C9A960",
    },
  ];

  return (
    <Box bg="#FDFBFA" overflowX="hidden" color="#263A33">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <Box
        position="relative"
        py={{ base: 20, md: 28 }}
        overflow="hidden"
      >
        {/* Background gradient */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(135deg, #FDFBFA 0%, #F4F1EC 40%, #E9F2ED 100%)"
          zIndex={0}
        />
        {/* Ambient glow */}
        <Box
          position="absolute"
          top="-100px"
          right="15%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.2) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="-80px"
          left="10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(201,169,96,0.1) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
          zIndex={0}
        />

        <Container maxW="6xl" position="relative" zIndex={1}>
          <MotionBox
            textAlign="center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="3px"
              textTransform="uppercase"
              color="#C9A960"
              fontFamily="'Inter', var(--font-inter), sans-serif"
              mb={4}
            >
              Get In Touch
            </Text>
            <Heading
              fontFamily="'Playfair Display', var(--font-playfair), serif"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="600"
              lineHeight="1.15"
              color="#263A33"
              mb={6}
            >
              {content.hero.title}
            </Heading>
            <Box
              fontFamily="'Inter', var(--font-inter), sans-serif"
              color="rgba(46,46,46,0.75)"
              lineHeight="1.85"
              fontSize={{ base: "md", md: "lg" }}
              maxW="3xl"
              mx="auto"
              sx={richTextStyles}
              dangerouslySetInnerHTML={{ __html: content.hero.body }}
            />
          </MotionBox>

          {/* Contact Info Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} mt={{ base: 10, md: 14 }}>
            {contactCards.map((card, index) => (
              <MotionBox
                key={card.label}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
              >
                <Box
                  as={card.href ? "a" : "div"}
                  href={card.href || undefined}
                  target={card.href && card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href && card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  bg="rgba(255,255,255,0.7)"
                  backdropFilter="blur(12px)"
                  borderRadius="2xl"
                  p={6}
                  textAlign="center"
                  boxShadow="0 4px 24px rgba(86,117,109,0.07)"
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.08)"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(86,117,109,0.12)",
                    borderColor: "#A9CBB7",
                  }}
                  transition="all 0.4s cubic-bezier(0.4,0,0.2,1)"
                  cursor={card.href ? "pointer" : "default"}
                  textDecoration="none"
                  display="block"
                >
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    bg={`${card.color}15`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    mb={3}
                  >
                    <Icon as={card.icon} boxSize={5} color={card.color} />
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="rgba(46,46,46,0.5)"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                    textTransform="uppercase"
                    letterSpacing="1px"
                    mb={1}
                  >
                    {card.label}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                  >
                    {card.value}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ FORM + SIDEBAR ═══════════════ */}
      <Box py={{ base: 10, md: 14 }} bg="#FDFBFA" position="relative">
        <Box
          position="absolute"
          top="50%"
          left="-100px"
          transform="translateY(-50%)"
          w="350px"
          h="350px"
          borderRadius="full"
          bg="radial-gradient(circle, rgba(169,203,183,0.12) 0%, transparent 70%)"
          filter="blur(60px)"
          pointerEvents="none"
        />

        <Container maxW="6xl" position="relative" zIndex={1}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 10 }} alignItems="stretch">

            {/* Contact Form */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Box
                as="form"
                ref={form}
                onSubmit={sendEmail}
                bg="rgba(255,255,255,0.92)"
                backdropFilter="blur(16px)"
                p={{ base: 5, md: 7 }}
                borderRadius="2xl"
                boxShadow="0 16px 40px -10px rgba(86,117,109,0.12)"
                border="1px solid"
                borderColor="rgba(86,117,109,0.12)"
                h="full"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box>
                  <Box borderBottom="1px solid" borderColor="rgba(86, 117, 109, 0.12)" pb={3} mb={4}>
                    <Heading
                      fontSize={{ base: "21px", md: "24px" }}
                      fontFamily="'Playfair Display', var(--font-playfair), serif"
                      color="#263A33"
                      fontWeight="600"
                    >
                      {content.form.title}
                    </Heading>
                    <Text
                      fontSize="13.5px"
                      color="rgba(46,46,46,0.65)"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      mt={1}
                    >
                      Reach out to our care team. We respond to every inquiry personally.
                    </Text>
                  </Box>

                  {/* Row 1: Full Name & Email */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={3.5}>
                    <StyledField 
                      label="Full Name" 
                      name="full_name" 
                      isRequired 
                      icon={FiUser} 
                      placeholder="e.g. Jane Sharma" 
                    />
                    <StyledField 
                      label="Email Address" 
                      name="email" 
                      type="email" 
                      isRequired 
                      icon={FiMail} 
                      placeholder="jane@example.com" 
                    />
                  </SimpleGrid>

                  {/* Row 2: Phone & Topic */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={3.5}>
                    <StyledField 
                      label="Phone Number" 
                      name="phone" 
                      icon={FiPhone} 
                      placeholder="+91 98765 43210" 
                    />
                    <FormControl>
                      <FormLabel
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                        color="#263A33"
                        fontSize="13.5px"
                        fontWeight="600"
                        letterSpacing="0.01em"
                        mb={1.5}
                        requiredIndicator={<></>}
                      >
                        <HStack spacing={1.5}>
                          <Icon as={FiMessageSquare} boxSize="14px" color="#56756D" />
                          <Text>Inquiry Topic</Text>
                        </HStack>
                      </FormLabel>
                      <ModernSelect
                        name="topic"
                        value={topic}
                        onChange={setTopic}
                        options={topicOptions}
                        placeholder="Select topic"
                        h="46px"
                        fontSize="14.5px"
                        borderRadius="12px"
                      />
                    </FormControl>
                  </SimpleGrid>

                  {/* Row 3: Message */}
                  <FormControl isRequired mb={5}>
                    <FormLabel
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      color="#263A33"
                      fontSize="13.5px"
                      fontWeight="600"
                      letterSpacing="0.01em"
                      mb={1.5}
                      requiredIndicator={<></>}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={FiMessageSquare} boxSize="14px" color="#56756D" />
                        <Text>Message</Text>
                      </HStack>
                    </FormLabel>
                    <Textarea
                      name="message"
                      required
                      placeholder={content.form.message_placeholder}
                      bg="#FDFBFA"
                      borderRadius="12px"
                      borderColor="rgba(86,117,109,0.22)"
                      fontSize="14.5px"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      rows={4}
                      minH="95px"
                      _focus={{
                        borderColor: "#56756D",
                        boxShadow: "0 0 0 1px #56756D",
                      }}
                      _hover={{ borderColor: "rgba(86,117,109,0.4)" }}
                      _placeholder={{ color: "gray.400" }}
                      transition="all 0.2s"
                    />
                  </FormControl>
                </Box>

                <Button
                  type="submit"
                  w="full"
                  bg="linear-gradient(135deg, #56756D 0%, #6B8B7B 100%)"
                  color="white"
                  borderRadius="full"
                  h="48px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight="600"
                  fontSize="15px"
                  shadow="md"
                  _hover={{
                    bg: "linear-gradient(135deg, #C9A960 0%, #D4B872 100%)",
                    transform: "translateY(-1px)",
                    shadow: "lg",
                  }}
                  transition="all 0.25s ease"
                  rightIcon={<FiSend />}
                >
                  {content.form.button_label}
                </Button>
              </Box>
            </MotionBox>

            {/* Sidebar */}
            <VStack spacing={5} align="stretch" justify="space-between" h="full">
              {/* Inspirational Quote */}
              <MotionBox
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Box
                  bg="linear-gradient(135deg, rgba(253,251,250,0.98) 0%, rgba(244,241,236,0.92) 100%)"
                  borderRadius="2xl"
                  p={{ base: 5, md: 6 }}
                  border="1px solid"
                  borderColor="rgba(201,169,96,0.25)"
                  boxShadow="0 8px 24px rgba(86,117,109,0.06)"
                  position="relative"
                  overflow="hidden"
                >
                  <Text
                    fontSize="44px"
                    color="rgba(201,169,96,0.22)"
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    position="absolute"
                    top={1}
                    left={3}
                    lineHeight="1"
                    userSelect="none"
                  >
                    &ldquo;
                  </Text>
                  <Text
                    fontFamily="'Playfair Display', var(--font-playfair), serif"
                    fontStyle="italic"
                    fontSize={{ base: "15px", md: "16.5px" }}
                    color="#263A33"
                    lineHeight="1.6"
                    pl={6}
                    pt={1}
                  >
                    {content.quote.text}
                  </Text>
                </Box>
              </MotionBox>

              {/* Office Hours & Response Policy + Coverage Card */}
              <MotionBox
                custom={2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                flex="1"
                display="flex"
              >
                <Box
                  bg="rgba(255,255,255,0.92)"
                  backdropFilter="blur(16px)"
                  p={{ base: 6, md: 7 }}
                  borderRadius="2xl"
                  boxShadow="0 16px 40px -10px rgba(86,117,109,0.12)"
                  border="1px solid"
                  borderColor="rgba(86,117,109,0.12)"
                  w="full"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <Box>
                    {/* Office Hours Header */}
                    <HStack spacing={3} mb={4}>
                      <Box
                        w="38px"
                        h="38px"
                        borderRadius="12px"
                        bg="rgba(169,203,183,0.2)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon as={FiClock} boxSize="18px" color="#56756D" />
                      </Box>
                      <Box>
                        <Heading
                          fontFamily="'Playfair Display', var(--font-playfair), serif"
                          fontWeight="600"
                          fontSize={{ base: "16.5px", md: "18px" }}
                          color="#263A33"
                          lineHeight="1.3"
                        >
                          {content.hours.title}
                        </Heading>
                        <Text
                          fontSize="12.5px"
                          color="rgba(46,46,46,0.6)"
                          fontFamily="'Inter', var(--font-inter), sans-serif"
                        >
                          Compassionate care & prompt assistance
                        </Text>
                      </Box>
                    </HStack>

                    {/* Schedule / Hours List */}
                    <VStack align="start" spacing={3} mb={5}>
                      {(content.hours.items || []).map((item, idx) => {
                        const ItemIcon = hoursIcons[idx] || FiClock;
                        return (
                          <HStack spacing={3} key={`hours-${idx}`} align="center">
                            <Box
                              w="30px"
                              h="30px"
                              borderRadius="9px"
                              bg="rgba(169,203,183,0.14)"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Icon as={ItemIcon} boxSize="14px" color="#56756D" />
                            </Box>
                            <Text
                              fontFamily="'Inter', var(--font-inter), sans-serif"
                              color="#263A33"
                              fontSize="13.5px"
                              fontWeight="500"
                              lineHeight="1.45"
                            >
                              {item}
                            </Text>
                          </HStack>
                        );
                      })}
                    </VStack>

                    {/* Elegant Divider */}
                    <Box h="1px" bg="rgba(86,117,109,0.12)" my={5} />

                    {/* Pan-India & Global Reach */}
                    <Box>
                      <HStack spacing={2.5} mb={2}>
                        <Icon as={FiMapPin} boxSize="16px" color="#C9A960" />
                        <Text
                          fontFamily="'Playfair Display', var(--font-playfair), serif"
                          fontSize="15.5px"
                          fontWeight="600"
                          color="#263A33"
                        >
                          Pan-India & Global Accessibility
                        </Text>
                      </HStack>
                      <Text
                        fontSize="13px"
                        color="rgba(46,46,46,0.7)"
                        fontFamily="'Inter', var(--font-inter), sans-serif"
                        lineHeight="1.55"
                        mb={3}
                      >
                        Operating remotely across major cities and worldwide via secure platforms:
                      </Text>

                      {/* City Badges */}
                      <HStack wrap="wrap" spacing={2} mb={4}>
                        {["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "International"].map((loc) => (
                          <Badge
                            key={loc}
                            bg="rgba(86,117,109,0.08)"
                            color="#263A33"
                            fontSize="12px"
                            fontWeight="500"
                            borderRadius="full"
                            px={2.5}
                            py={1}
                            textTransform="none"
                            border="1px solid"
                            borderColor="rgba(86,117,109,0.16)"
                            fontFamily="'Inter', var(--font-inter), sans-serif"
                          >
                            {loc === "International" ? "🌐 " : "📍 "}{loc}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  </Box>

                  {/* Trust & Confidentiality Footer */}
                  <HStack
                    bg="rgba(169,203,183,0.14)"
                    borderRadius="xl"
                    p={3}
                    spacing={2.5}
                    border="1px solid"
                    borderColor="rgba(86,117,109,0.12)"
                    mt={3}
                  >
                    <Icon as={FiShield} boxSize="16px" color="#56756D" flexShrink={0} />
                    <Text
                      fontSize="12.5px"
                      color="#2D4840"
                      fontWeight="500"
                      fontFamily="'Inter', var(--font-inter), sans-serif"
                      lineHeight="1.4"
                    >
                      Strict clinical confidentiality guaranteed across all consultations.
                    </Text>
                  </HStack>
                </Box>
              </MotionBox>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>


      {/* ═══════════════ CLOSING TRUST BANNER ═══════════════ */}
      <Box
        py={{ base: 12, md: 16 }}
        bg="#FDFBFA"
        position="relative"
        borderTop="1px solid"
        borderColor="rgba(86,117,109,0.08)"
      >
        <Container maxW="4xl" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box
              bg="white"
              borderRadius="24px"
              p={{ base: 7, md: 12 }}
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.16)"
              boxShadow="0 18px 45px -12px rgba(38, 58, 51, 0.08), 0 2px 6px -1px rgba(38, 58, 51, 0.02)"
              textAlign="center"
              position="relative"
              overflow="hidden"
            >
              {/* Subtle background ambient accents */}
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="180px"
                h="180px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(86,117,109,0.07) 0%, transparent 70%)"
                pointerEvents="none"
              />
              <Box
                position="absolute"
                bottom="-40px"
                left="-40px"
                w="160px"
                h="160px"
                borderRadius="full"
                bg="radial-gradient(circle, rgba(201,169,96,0.08) 0%, transparent 70%)"
                pointerEvents="none"
              />

              <VStack spacing={{ base: 4, md: 5 }} align="center" position="relative" zIndex={1}>
                {/* Pill Badge */}
                <HStack spacing={2} bg="#EAF2EE" px={3.5} py={1.5} borderRadius="full">
                  <Icon as={FiShield} boxSize="13px" color="#56756D" />
                  <Text
                    fontSize="11.5px"
                    fontWeight="700"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color="#56756D"
                    fontFamily="'Inter', var(--font-inter), sans-serif"
                  >
                    Clinical Privacy & Discretion
                  </Text>
                </HStack>

                {/* Title */}
                <Heading
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontWeight="600"
                  fontSize={{ base: "22px", md: "28px" }}
                  color="#263A33"
                  lineHeight="1.3"
                  maxW="2xl"
                >
                  {content.closing.title}
                </Heading>

                {/* Body Text */}
                <Box
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontSize={{ base: "13.5px", md: "14.5px" }}
                  color="rgba(46, 46, 46, 0.72)"
                  maxW="640px"
                  mx="auto"
                  lineHeight="1.75"
                  sx={richTextStyles}
                  dangerouslySetInnerHTML={{ __html: content.closing.body }}
                />

                {/* 3 Trust Pillars */}
                <SimpleGrid
                  columns={{ base: 1, sm: 3 }}
                  spacing={{ base: 3, md: 4 }}
                  pt={{ base: 4, md: 6 }}
                  mt={2}
                  borderTop="1px solid"
                  borderColor="rgba(86, 117, 109, 0.1)"
                  w="100%"
                >
                  <HStack
                    p={3.5}
                    bg="#FBFDFB"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.12)"
                    spacing={3}
                    align="center"
                    textAlign="left"
                  >
                    <Circle size="34px" bg="#EAF2EE" color="#56756D" flexShrink={0}>
                      <Icon as={FiLock} boxSize="15px" />
                    </Circle>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                        Strict Privacy
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        Encrypted records
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack
                    p={3.5}
                    bg="#FBFDFB"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.12)"
                    spacing={3}
                    align="center"
                    textAlign="left"
                  >
                    <Circle size="34px" bg="rgba(201, 169, 96, 0.12)" color="#B89342" flexShrink={0}>
                      <Icon as={FiHeart} boxSize="15px" />
                    </Circle>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                        Personal Care
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        Intake team review
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack
                    p={3.5}
                    bg="#FBFDFB"
                    borderRadius="14px"
                    border="1px solid"
                    borderColor="rgba(86, 117, 109, 0.12)"
                    spacing={3}
                    align="center"
                    textAlign="left"
                  >
                    <Circle size="34px" bg="#EAF2EE" color="#56756D" flexShrink={0}>
                      <Icon as={FiCheckCircle} boxSize="15px" />
                    </Circle>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                        Zero Obligation
                      </Text>
                      <Text fontSize="11px" color="gray.500">
                        Guidance at your pace
                      </Text>
                    </VStack>
                  </HStack>
                </SimpleGrid>
              </VStack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* ═══════════════ FEEDBACK WIDGET ═══════════════ */}
      <Box py={{ base: 10, md: 14 }} bg="#FDFBFA">
        <Container maxW="4xl">
          <FeedbackWidget variant="inline" />
        </Container>
      </Box>
    </Box>
  );
}


/* ───── Styled Form Field ───── */
function StyledField({ label, name, type = "text", isRequired = false, placeholder, icon, mb = 0 }) {
  return (
    <FormControl isRequired={isRequired} mb={mb}>
      <FormLabel
        fontFamily="'Inter', var(--font-inter), sans-serif"
        color="#263A33"
        fontSize="13.5px"
        fontWeight="600"
        letterSpacing="0.01em"
        mb={1.5}
        requiredIndicator={<></>}
      >
        <HStack spacing={1.5}>
          {icon && <Icon as={icon} boxSize="14px" color="#56756D" />}
          <Text>{label}</Text>
        </HStack>
      </FormLabel>
      <Input
        name={name}
        type={type}
        required={isRequired}
        placeholder={placeholder}
        bg="#FDFBFA"
        h="46px"
        borderRadius="12px"
        borderColor="rgba(86,117,109,0.22)"
        fontSize="14.5px"
        fontFamily="'Inter', var(--font-inter), sans-serif"
        _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
        _hover={{ borderColor: "rgba(86,117,109,0.4)" }}
        _placeholder={{ color: "gray.400" }}
        transition="all 0.2s"
      />
    </FormControl>
  );
}
