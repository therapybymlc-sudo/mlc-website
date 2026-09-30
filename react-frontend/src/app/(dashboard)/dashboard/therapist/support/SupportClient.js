'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Icon,
  Circle,
  Link,
  Badge,
  Divider,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { 
  FiMail, 
  FiPhone, 
  FiSend, 
  FiHelpCircle,
  FiShield,
  FiChevronDown,
  FiCheck,
  FiCalendar,
  FiCreditCard,
  FiUsers,
  FiVideo,
  FiMessageSquare,
  FiClock,
  FiActivity,
  FiInbox,
  FiAlertCircle
} from "react-icons/fi";
import { apiPost, apiGet } from "../../../../../api.js";

const THERAPIST_CATEGORIES = [
  { value: "general", label: "General Clinical Query", icon: FiHelpCircle },
  { value: "schedule", label: "Schedule & Booking Issues", icon: FiCalendar },
  { value: "billing", label: "Payouts & Subscription", icon: FiCreditCard },
  { value: "supervision", label: "Clinical Supervision Suite", icon: FiUsers },
  { value: "technical", label: "Video Room / Portal Bug", icon: FiVideo },
  { value: "other", label: "Other Inquiries", icon: FiMessageSquare },
];

const FAQS = [
  {
    q: "What should I do if a client has trouble joining a video session?",
    a: "Verify that your session is started from 'My Schedule'. If the client cannot connect, you can share a backup Google Meet link via WhatsApp/SMS, or call our clinical desk at +91 99016 19968 for real-time connection reset."
  },
  {
    q: "When and how are session earnings disbursed?",
    a: "Therapist payouts are processed automatically on the 1st and 15th of every month directly to your verified bank account. Full payout breakdowns can be reviewed under the 'Earnings' tab."
  },
  {
    q: "How do I update my recurring slots or block holiday leave?",
    a: "Navigate to 'Availability' in your sidebar to adjust recurring weekly hours or add custom blackouts. Changes apply immediately to new bookings while existing confirmed sessions remain preserved."
  },
  {
    q: "How do I escalate an ethical dilemma or emergency high-risk case?",
    a: "If a client presents with active self-harm or acute suicidality, refer to the client emergency protocols documented under their profile, notify our clinical desk immediately via priority WhatsApp (+91 99016 19968), and log an incident report."
  }
];

export default function TherapistSupportClient() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("form"); // "form" | "history"
  const [loading, setLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    urgency: "routine",
    description: "",
  });

  const selectedCategory = THERAPIST_CATEGORIES.find(c => c.value === formData.category) || THERAPIST_CATEGORIES[0];

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const data = await apiGet("support-tickets/");
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data?.results && Array.isArray(data.results)) {
        setTickets(data.results);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please provide both a subject and details.",
        status: "warning",
        duration: 3500,
        isClosable: true
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        subject: formData.urgency === "urgent" ? `[URGENT] ${formData.subject}` : formData.subject,
        category: formData.category,
        description: formData.description,
      };

      await apiPost("support-tickets/", payload);
      
      toast({
        title: "Support Ticket Logged",
        description: "Your request has been routed to our clinical coordination team. We'll update you shortly.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setFormData({ subject: "", category: "general", urgency: "routine", description: "" });
      fetchTickets();
      setActiveTab("history");
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "Could not log your ticket. Please reach out via WhatsApp or email directly.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD */}
      <Box
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr auto" }}
          gap={{ base: 4, lg: 6 }}
          alignItems="center"
        >
          {/* Left: Avatar + Heading + Subtitle */}
          <HStack spacing={4} align="center">
            <Box position="relative">
              <Circle size="48px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                <Icon as={FiHelpCircle} boxSize="22px" />
              </Circle>
              <Circle
                size="11px"
                bg="#10B981"
                border="2px solid white"
                position="absolute"
                bottom="1px"
                right="1px"
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Text
                  fontSize="10.5px"
                  fontWeight="700"
                  color="#56756D"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  PRACTITIONER ASSISTANCE DESK
                </Text>
                <Badge
                  bg="rgba(16, 185, 129, 0.1)"
                  color="#059669"
                  fontSize="10px"
                  fontWeight="700"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  LIVE QUEUE
                </Badge>
              </HStack>

              <Heading
                as="h1"
                fontSize={{ base: "22px", md: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33"
                fontWeight="600"
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Therapist Support & Care
              </Heading>

              <Text fontSize="13px" color="#5A6E65" fontWeight="400">
                Direct priority assistance for clinical workflows, scheduling sync, client access, and platform operations.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip */}
          <HStack
            spacing={3}
            p={1.5}
            px={2.5}
            borderRadius="xl"
            bg="rgba(250, 248, 245, 0.9)"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.1)"
            alignSelf={{ base: "stretch", lg: "auto" }}
            justify="space-between"
          >
            {/* Metric 1 */}
            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                <Icon as={FiClock} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  RESPONSE TIME
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33">
                  &lt; 2 Hours
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            {/* Metric 2 */}
            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669">
                <Icon as={FiActivity} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  DESK STATUS
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33">
                  Online
                </Text>
              </VStack>
            </HStack>

            <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

            {/* Metric 3 */}
            <HStack spacing={2} px={2} py={1}>
              <Circle size="28px" bg="rgba(59, 130, 246, 0.12)" color="#2563EB">
                <Icon as={FiShield} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                  PRIVACY
                </Text>
                <Text fontSize="13px" fontWeight="700" color="#263A33">
                  Encrypted
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Grid>
      </Box>

      {/* 🌿 2. MAIN BENTO GRID (7fr : 5fr) */}
      <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start">
        {/* LEFT COLUMN: TICKET WORKSPACE */}
        <VStack align="stretch" spacing={5}>
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            {/* Header + Sub-tab Switcher */}
            <HStack justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
              <VStack align="start" spacing={0.5}>
                <Heading
                  fontSize="16px"
                  fontWeight="600"
                  color="#263A33"
                  letterSpacing="-0.01em"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Clinical Support Desk
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65">
                  Log clinical system issues, schedule sync faults, or billing queries.
                </Text>
              </VStack>

              {/* Pill Switcher */}
              <HStack
                p={1}
                borderRadius="full"
                bg="rgba(250, 248, 245, 0.95)"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.14)"
              >
                <Button
                  size="sm"
                  h="28px"
                  borderRadius="full"
                  px={3.5}
                  fontSize="12px"
                  fontWeight="600"
                  bg={activeTab === "form" ? "#56756D" : "transparent"}
                  color={activeTab === "form" ? "white" : "#5A6E65"}
                  _hover={activeTab === "form" ? {} : { color: "#263A33" }}
                  onClick={() => setActiveTab("form")}
                  boxShadow={activeTab === "form" ? "0 1px 4px rgba(86, 117, 109, 0.2)" : "none"}
                >
                  Create Ticket
                </Button>
                <Button
                  size="sm"
                  h="28px"
                  borderRadius="full"
                  px={3.5}
                  fontSize="12px"
                  fontWeight="600"
                  bg={activeTab === "history" ? "#56756D" : "transparent"}
                  color={activeTab === "history" ? "white" : "#5A6E65"}
                  _hover={activeTab === "history" ? {} : { color: "#263A33" }}
                  onClick={() => setActiveTab("history")}
                  boxShadow={activeTab === "history" ? "0 1px 4px rgba(86, 117, 109, 0.2)" : "none"}
                  rightIcon={
                    tickets.length > 0 ? (
                      <Badge
                        borderRadius="full"
                        bg={activeTab === "history" ? "white" : "rgba(86, 117, 109, 0.15)"}
                        color={activeTab === "history" ? "#56756D" : "#263A33"}
                        fontSize="10px"
                        px={1.5}
                        py={0}
                      >
                        {tickets.length}
                      </Badge>
                    ) : undefined
                  }
                >
                  Ticket History
                </Button>
              </HStack>
            </HStack>

            <Divider borderColor="rgba(86, 117, 109, 0.1)" mb={5} />

            {/* TAB CONTENT: FORM */}
            {activeTab === "form" && (
              <VStack as="form" onSubmit={handleSubmit} spacing={4.5} align="stretch">
                {/* Subject */}
                <FormControl isRequired>
                  <FormLabel fontSize="13px" fontWeight="600" color="#263A33" mb={1.5}>
                    Ticket Subject
                  </FormLabel>
                  <Input
                    placeholder="Brief summary of the inquiry or issue..."
                    borderRadius="xl"
                    borderColor="rgba(86, 117, 109, 0.2)"
                    h="40px"
                    fontSize="13px"
                    color="#263A33"
                    _placeholder={{ color: "#8C9E96" }}
                    _hover={{ borderColor: "#56756D" }}
                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </FormControl>

                {/* Category & Urgency Grid */}
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                  {/* Category */}
                  <FormControl isRequired>
                    <FormLabel fontSize="13px" fontWeight="600" color="#263A33" mb={1.5}>
                      Category
                    </FormLabel>
                    <Menu matchWidth gutter={6}>
                      {({ isOpen }) => (
                        <>
                          <MenuButton
                            as={Button}
                            w="full"
                            h="40px"
                            bg="white"
                            border="1px solid"
                            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
                            borderRadius="xl"
                            px={3.5}
                            textAlign="left"
                            fontWeight="400"
                            fontSize="13px"
                            color="#263A33"
                            _hover={{ borderColor: "#56756D" }}
                            _active={{ bg: "white" }}
                            _focus={{ boxShadow: "0 0 0 1px #56756D" }}
                            transition="all 0.2s"
                          >
                            <HStack justify="space-between" w="full">
                              <HStack spacing={2.5}>
                                <Icon as={selectedCategory.icon} boxSize="13px" color="#56756D" />
                                <Text as="span" fontSize="13px" color="#263A33" fontWeight="500">
                                  {selectedCategory.label}
                                </Text>
                              </HStack>
                              <Icon
                                as={FiChevronDown}
                                boxSize="14px"
                                color="#56756D"
                                transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                                transition="transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                              />
                            </HStack>
                          </MenuButton>

                          <MenuList
                            bg="white"
                            border="1px solid rgba(86, 117, 109, 0.16)"
                            borderRadius="xl"
                            boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
                            p={1.5}
                            zIndex={25}
                          >
                            {THERAPIST_CATEGORIES.map((cat) => {
                              const isSelected = formData.category === cat.value;
                              const CatIcon = cat.icon;
                              return (
                                <MenuItem
                                  key={cat.value}
                                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                                  borderRadius="lg"
                                  py={2}
                                  px={3}
                                  fontSize="12.5px"
                                  fontWeight={isSelected ? "600" : "400"}
                                  color="#263A33"
                                  bg={isSelected ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                                  _hover={{ bg: "rgba(86, 117, 109, 0.08)", color: "#263A33" }}
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <HStack spacing={2.5}>
                                    <Icon
                                      as={CatIcon}
                                      boxSize="13px"
                                      color={isSelected ? "#56756D" : "#8C9E96"}
                                    />
                                    <Text as="span">{cat.label}</Text>
                                  </HStack>
                                  {isSelected && <Icon as={FiCheck} color="#56756D" boxSize="13px" />}
                                </MenuItem>
                              );
                            })}
                          </MenuList>
                        </>
                      )}
                    </Menu>
                  </FormControl>

                  {/* Urgency */}
                  <FormControl>
                    <FormLabel fontSize="13px" fontWeight="600" color="#263A33" mb={1.5}>
                      Urgency
                    </FormLabel>
                    <HStack spacing={2} h="40px">
                      <Button
                        size="sm"
                        flex="1"
                        h="38px"
                        borderRadius="xl"
                        fontSize="12px"
                        fontWeight="600"
                        border="1px solid"
                        borderColor={formData.urgency === "routine" ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
                        bg={formData.urgency === "routine" ? "rgba(86, 117, 109, 0.1)" : "white"}
                        color={formData.urgency === "routine" ? "#263A33" : "#718096"}
                        onClick={() => setFormData({ ...formData, urgency: "routine" })}
                      >
                        Routine
                      </Button>
                      <Button
                        size="sm"
                        flex="1"
                        h="38px"
                        borderRadius="xl"
                        fontSize="12px"
                        fontWeight="600"
                        border="1px solid"
                        borderColor={formData.urgency === "urgent" ? "#EF4444" : "rgba(86, 117, 109, 0.2)"}
                        bg={formData.urgency === "urgent" ? "rgba(239, 68, 68, 0.1)" : "white"}
                        color={formData.urgency === "urgent" ? "#DC2626" : "#718096"}
                        onClick={() => setFormData({ ...formData, urgency: "urgent" })}
                      >
                        Session Urgent
                      </Button>
                    </HStack>
                  </FormControl>
                </Grid>

                {/* Description */}
                <FormControl isRequired>
                  <FormLabel fontSize="13px" fontWeight="600" color="#263A33" mb={1.5}>
                    Detailed Description
                  </FormLabel>
                  <Textarea
                    placeholder="Provide context, client identifiers (if relevant), error screenshots or description..."
                    borderRadius="xl"
                    borderColor="rgba(86, 117, 109, 0.2)"
                    p={3.5}
                    minH="130px"
                    fontSize="13px"
                    color="#263A33"
                    _placeholder={{ color: "#8C9E96" }}
                    _hover={{ borderColor: "#56756D" }}
                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormControl>

                {/* Actions */}
                <HStack justify="space-between" pt={2} align="center" wrap="wrap" gap={3}>
                  <HStack spacing={2} color="#5A6E65">
                    <Icon as={FiShield} boxSize="13px" color="#56756D" />
                    <Text fontSize="12px">Routed with clinical confidentiality</Text>
                  </HStack>

                  <Button
                    type="submit"
                    bg="#56756D"
                    color="white"
                    h="38px"
                    px={6}
                    borderRadius="full"
                    fontSize="13px"
                    fontWeight="600"
                    isLoading={loading}
                    loadingText="Submitting..."
                    rightIcon={<Icon as={FiSend} boxSize="13px" />}
                    _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                    boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                    transition="all 0.2s"
                  >
                    Submit Ticket
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === "history" && (
              <VStack align="stretch" spacing={3.5}>
                {ticketsLoading ? (
                  <HStack justify="center" py={12} spacing={3}>
                    <Spinner size="sm" thickness="2px" color="#56756D" />
                    <Text fontSize="13px" color="#5A6E65">Loading your tickets...</Text>
                  </HStack>
                ) : tickets.length === 0 ? (
                  <VStack py={10} spacing={3} textAlign="center">
                    <Circle size="44px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiInbox} boxSize="20px" />
                    </Circle>
                    <Text fontSize="14px" fontWeight="600" color="#263A33">
                      No tickets raised yet
                    </Text>
                    <Text fontSize="12.5px" color="#5A6E65" maxW="320px">
                      When you submit queries or report technical issues, their progress and resolution will be tracked here.
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="rgba(86, 117, 109, 0.25)"
                      color="#263A33"
                      borderRadius="full"
                      h="34px"
                      fontSize="12.5px"
                      fontWeight="600"
                      mt={1}
                      onClick={() => setActiveTab("form")}
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                    >
                      Create First Ticket
                    </Button>
                  </VStack>
                ) : (
                  tickets.map((t) => {
                    const isResolved = t.status === "resolved" || t.status === "closed";
                    const isInProgress = t.status === "in_progress";
                    const statusColor = isResolved ? "#059669" : isInProgress ? "#2563EB" : "#D97706";
                    const statusBg = isResolved
                      ? "rgba(16, 185, 129, 0.1)"
                      : isInProgress
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(245, 158, 11, 0.12)";

                    return (
                      <Box
                        key={t.id}
                        p={4}
                        borderRadius="xl"
                        bg="rgba(250, 248, 245, 0.85)"
                        border="1px solid"
                        borderColor="rgba(86, 117, 109, 0.12)"
                        transition="all 0.15s"
                        _hover={{ borderColor: "#56756D", bg: "white" }}
                      >
                        <HStack justify="space-between" align="start" mb={2}>
                          <VStack align="start" spacing={0.5}>
                            <HStack spacing={2}>
                              <Badge
                                bg={statusBg}
                                color={statusColor}
                                fontSize="10.5px"
                                fontWeight="700"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                textTransform="uppercase"
                              >
                                {t.status?.replace("_", " ") || "Open"}
                              </Badge>
                              <Badge
                                variant="outline"
                                borderColor="rgba(86, 117, 109, 0.2)"
                                color="#56756D"
                                fontSize="10.5px"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                              >
                                {t.category || "General"}
                              </Badge>
                            </HStack>
                            <Text fontSize="14px" fontWeight="600" color="#263A33" pt={1}>
                              {t.subject}
                            </Text>
                          </VStack>

                          <Text fontSize="11.5px" color="#718096" whiteSpace="nowrap">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                          </Text>
                        </HStack>

                        <Text fontSize="12.5px" color="#5A6E65" lineHeight="1.5">
                          {t.description}
                        </Text>

                        {t.admin_notes && (
                          <Box
                            mt={3}
                            p={3}
                            borderRadius="lg"
                            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
                            border="1px solid rgba(16, 185, 129, 0.25)"
                          >
                            <HStack spacing={2} mb={1}>
                              <Icon as={FiCheck} boxSize="12px" color="#059669" />
                              <Text fontSize="11px" fontWeight="700" color="#064E3B" textTransform="uppercase">
                                Clinical Support Resolution
                              </Text>
                            </HStack>
                            <Text fontSize="12px" color="#065F46">
                              {t.admin_notes}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    );
                  })
                )}
              </VStack>
            )}
          </Box>

          {/* Practitioner FAQ Accordion */}
          <Box
            bg="white"
            p={{ base: 5, md: 6 }}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <HStack spacing={2} mb={3.5}>
              <Icon as={FiHelpCircle} boxSize="15px" color="#56756D" />
              <Heading
                fontSize="15px"
                fontWeight="600"
                color="#263A33"
                letterSpacing="-0.01em"
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                Practitioner Quick FAQs
              </Heading>
            </HStack>

            <Accordion allowMultiple>
              {FAQS.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  border="none"
                  borderBottom="1px solid"
                  borderColor="rgba(86, 117, 109, 0.1)"
                  py={1}
                >
                  <h2>
                    <AccordionButton
                      px={1}
                      py={3}
                      _hover={{ bg: "transparent", color: "#56756D" }}
                      textAlign="left"
                    >
                      <Box flex="1" fontSize="13px" fontWeight="600" color="#263A33">
                        {faq.q}
                      </Box>
                      <AccordionIcon color="#56756D" />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel px={1} pb={3} pt={0} fontSize="12.5px" color="#5A6E65" lineHeight="1.6">
                    {faq.a}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </VStack>

        {/* RIGHT COLUMN: DIRECT CHANNELS & SAFEGUARDS */}
        <VStack align="stretch" spacing={5}>
          {/* Direct Clinical Channels Card */}
          <Box
            bg="white"
            p={5}
            borderRadius="2xl"
            border="1px solid"
            borderColor="rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <VStack align="start" spacing={4}>
              <Box>
                <Heading
                  fontSize="15px"
                  fontWeight="600"
                  color="#263A33"
                  letterSpacing="-0.01em"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Direct Clinical Channels
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                  For urgent session support or direct clinician coordination.
                </Text>
              </Box>

              <VStack align="stretch" spacing={2.5} w="full">
                {/* Email Tile */}
                <HStack
                  spacing={3}
                  p={3.5}
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.12)"
                  transition="0.2s"
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                >
                  <Circle size="34px" bg="white" color="#56756D" shadow="xs" flexShrink={0}>
                    <Icon as={FiMail} boxSize="14px" />
                  </Circle>
                  <VStack align="start" spacing={0} minW={0} flex="1">
                    <Text fontSize="10px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                      Clinical Support Email
                    </Text>
                    <Link
                      href="mailto:support@mlchealth.in"
                      fontSize="12.5px"
                      fontWeight="600"
                      color="#263A33"
                      _hover={{ color: "#56756D" }}
                      noOfLines={1}
                    >
                      support@mlchealth.in
                    </Link>
                  </VStack>
                </HStack>

                {/* WhatsApp & Phone Tile */}
                <HStack
                  spacing={3}
                  p={3.5}
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.12)"
                  transition="0.2s"
                  _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                >
                  <Circle size="34px" bg="white" color="#56756D" shadow="xs" flexShrink={0}>
                    <Icon as={FiPhone} boxSize="14px" />
                  </Circle>
                  <VStack align="start" spacing={0} flex="1">
                    <Text fontSize="10px" fontWeight="700" color="#56756D" letterSpacing="0.08em" textTransform="uppercase">
                      Phone & Priority WhatsApp
                    </Text>
                    <HStack spacing={2} pt={0.5}>
                      <Link
                        href="tel:+919901619968"
                        fontSize="12.5px"
                        fontWeight="600"
                        color="#263A33"
                        _hover={{ color: "#56756D" }}
                      >
                        +91 99016 19968
                      </Link>
                      <Link
                        href="https://wa.me/919901619968"
                        isExternal
                        color="#25D366"
                        display="inline-flex"
                        alignItems="center"
                        _hover={{ transform: "scale(1.15)" }}
                        transition="0.2s"
                        title="Chat on WhatsApp"
                      >
                        <Icon as={FaWhatsapp} boxSize="15px" />
                      </Link>
                    </HStack>
                  </VStack>
                </HStack>

                {/* Hours Tile */}
                <HStack
                  spacing={3}
                  p={3}
                  borderRadius="xl"
                  bg="rgba(250, 248, 245, 0.6)"
                  border="1px solid"
                  borderColor="rgba(86, 117, 109, 0.08)"
                >
                  <Circle size="30px" bg="white" color="#718096" shadow="xs" flexShrink={0}>
                    <Icon as={FiClock} boxSize="13px" />
                  </Circle>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase">
                      COORDINATION HOURS
                    </Text>
                    <Text fontSize="12px" fontWeight="600" color="#263A33">
                      Mon – Sat · 9:00 AM – 8:00 PM IST
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Ethics & Clinical Safeguard Card */}
          <Box
            p={5}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
            border="1px solid rgba(16, 185, 129, 0.35)"
            boxShadow="0 4px 16px -2px rgba(6, 78, 59, 0.05)"
          >
            <HStack spacing={2.5} mb={2}>
              <Circle size="26px" bg="rgba(16, 185, 129, 0.2)" color="#059669">
                <Icon as={FiShield} boxSize="13px" />
              </Circle>
              <Text fontSize="11px" fontWeight="700" color="#064E3B" letterSpacing="0.08em" textTransform="uppercase">
                Confidentiality & Ethical Promise
              </Text>
            </HStack>
            <Text fontSize="12px" color="#065F46" lineHeight="1.6">
              All practitioner tickets, supervision questions, and clinical correspondence are encrypted and handled exclusively by senior clinical coordinators under strict ethical non-disclosure protocols.
            </Text>
          </Box>

          {/* Emergency Escalation Notice */}
          <Box
            p={4.5}
            borderRadius="2xl"
            bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
            border="1px solid rgba(245, 158, 11, 0.3)"
          >
            <HStack spacing={2.5} align="start">
              <Circle size="24px" bg="rgba(245, 158, 11, 0.2)" color="#D97706" flexShrink={0} mt={0.5}>
                <Icon as={FiAlertCircle} boxSize="13px" />
              </Circle>
              <VStack align="start" spacing={0.5}>
                <Text fontSize="12px" fontWeight="700" color="#78350F" textTransform="uppercase" letterSpacing="0.05em">
                  High-Risk Client Protocol
                </Text>
                <Text fontSize="12px" color="#92400E" lineHeight="1.5">
                  If a client is experiencing active distress or imminent harm outside of session, initiate local emergency referral protocols immediately and alert the clinical desk via WhatsApp.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
}
