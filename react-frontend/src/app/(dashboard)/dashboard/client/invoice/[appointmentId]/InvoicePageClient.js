"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
  Image,
  Icon,
  Flex,
  Container,
  Badge,
  Circle,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { apiGet } from "../../../../../../api.js";
import { 
  FiPrinter, 
  FiArrowLeft, 
  FiShield, 
  FiFileText, 
  FiCheckCircle, 
  FiCopy, 
  FiLock,
  FiCalendar,
  FiUser
} from "react-icons/fi";

export default function InvoicePageClient() {
  const params = useParams();
  const appointmentId = params?.appointmentId;
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      if (!appointmentId) return;
      try {
        setLoading(true);
        let appt = null;
        try {
          appt = await apiGet(`client-appointments/${appointmentId}/`);
        } catch (_clientScopeError) {
          // Therapist-side or Admin-side invoice view can access generic appointments endpoint
          appt = await apiGet(`appointments/${appointmentId}/`);
        }
        setAppointment(appt);
        if (appt?.therapist) {
          const t = await apiGet(`therapists/${appt.therapist}/`);
          setTherapist(t);
        }
      } catch (err) {
        console.error("Failed to load invoice data", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [appointmentId]);

  const safeAppointmentId = String(appointmentId || "");
  const invoiceNo = `MLC-INV-${safeAppointmentId.slice(0, 8).toUpperCase() || "PENDING"}`;
  
  const amount = Number(
    appointment?.booking_request?.hourly_rate || 
    therapist?.hourly_rate || 
    appointment?.hourly_rate || 
    2000
  );

  const status = String(appointment?.status || "").toLowerCase();
  const paymentStatus = String(appointment?.payment_status || "").toLowerCase();
  const isCancelled = status === "cancelled";
  const isPaid = !isCancelled && (paymentStatus === "paid" || status === "completed");

  const invoiceBadge = isCancelled
    ? { label: "CANCELLED", bg: "rgba(239, 68, 68, 0.12)", color: "#DC2626" }
    : isPaid
    ? { label: "PAID IN FULL", bg: "rgba(16, 185, 129, 0.12)", color: "#059669" }
    : { label: "PAYMENT PENDING", bg: "rgba(245, 158, 11, 0.12)", color: "#D97706" };

  const sessionDateFormatted = appointment?.start_time
    ? new Date(appointment.start_time).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Scheduled Session";

  const sessionTimeFormatted = appointment?.start_time
    ? new Date(appointment.start_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const issueDateFormatted = appointment?.created_at
    ? new Date(appointment.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard?.writeText(invoiceNo);
    toast({
      render: () => (
        <HStack
          spacing={2.5}
          p={3}
          px={4}
          bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
          border="1px solid rgba(16, 185, 129, 0.35)"
          borderRadius="2xl"
          boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)"
        >
          <Circle size="22px" bg="#10B981" color="white">
            <Icon as={FiCheckCircle} boxSize="12px" />
          </Circle>
          <Text fontSize="12.5px" fontWeight="600" color="#065F46">
            Invoice reference {invoiceNo} copied
          </Text>
        </HStack>
      ),
      duration: 2500,
      position: "bottom-right",
    });
  };

  if (loading) {
    return (
      <Flex minH="70vh" justify="center" align="center" bg="#FAF8F5">
        <VStack spacing={3}>
          <Spinner thickness="3px" speed="0.7s" emptyColor="rgba(86, 117, 109, 0.12)" color="#56756D" size="xl" />
          <Text fontSize="13px" color="#5A6E65" fontWeight="500">
            Loading official clinical invoice...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!appointment) {
    return (
      <Box minH="80vh" bg="#FAF8F5" py={20} px={4}>
        <Container maxW="500px">
          <VStack
            spacing={4}
            bg="white"
            p={8}
            borderRadius="2xl"
            border="1px solid rgba(86, 117, 109, 0.14)"
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            textAlign="center"
          >
            <Circle size="52px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={FiFileText} boxSize="22px" />
            </Circle>
            <Heading
              fontSize="18px"
              fontWeight="600"
              color="#263A33"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
            >
              Invoice Not Available
            </Heading>
            <Text fontSize="13px" color="#5A6E65" lineHeight="1.6">
              We couldn't retrieve the clinical invoice for this session. It may still be generating or require active session confirmation.
            </Text>
            <Button
              as={NextLink}
              href="/dashboard/client/appointments"
              bg="#56756D"
              color="white"
              borderRadius="full"
              h="38px"
              fontSize="13px"
              fontWeight="600"
              px={5}
              _hover={{ bg: "#263A33" }}
            >
              Back to Appointments
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      pb={20} 
      bg="#FAF8F5" 
      minH="100vh" 
      fontFamily="'Inter', var(--font-inter), sans-serif"
    >
      {/* 🚀 Header Action Toolbar (Hidden in Print) */}
      <Box 
        pt={{ base: 4, md: 6 }} 
        pb={4} 
        className="no-print" 
        sx={{ "@media print": { display: "none" } }}
      >
        <Container maxW="840px" px={{ base: 4, sm: 6 }}>
          <Flex 
            justify="space-between" 
            align="center" 
            bg="white" 
            p={{ base: 3, md: 3.5 }} 
            px={{ base: 4, md: 5 }} 
            borderRadius="2xl" 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
            wrap="wrap"
            gap={3}
          >
            <Button 
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/dashboard";
                }
              }}
              leftIcon={<FiArrowLeft />} 
              variant="outline"
              borderColor="rgba(86, 117, 109, 0.25)"
              color="#263A33"
              borderRadius="full"
              h="36px"
              fontSize="12.5px"
              fontWeight="600"
              px={4}
              _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
            >
              Back
            </Button>

            <HStack spacing={2.5}>
              <Button
                onClick={handleCopyInvoiceNumber}
                leftIcon={<FiCopy size={13} />}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.2)"
                color="#5A6E65"
                borderRadius="full"
                h="36px"
                fontSize="12px"
                fontWeight="600"
                px={3.5}
                _hover={{ bg: "rgba(86, 117, 109, 0.06)", color: "#263A33" }}
              >
                Copy Ref
              </Button>

              <Button 
                onClick={() => window.print()} 
                leftIcon={<FiPrinter size={14} />} 
                bg="#56756D" 
                color="white" 
                borderRadius="full" 
                h="36px"
                fontSize="12.5px"
                fontWeight="600"
                px={5}
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Print / Save PDF
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* 📄 The Official Clinical Tax Invoice Document Sheet */}
      <Container 
        maxW="840px" 
        px={{ base: 3, sm: 6 }}
      >
        <Box
          bg="white" 
          borderRadius="2xl" 
          border="1px solid rgba(86, 117, 109, 0.16)"
          boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)"
          p={{ base: 6, sm: 8, md: 10 }}
          position="relative"
          id="invoice-document"
        >
          {/* Top Brand & Title Header */}
          <Flex 
            direction={{ base: "column", sm: "row" }} 
            justify="space-between" 
            align={{ base: "flex-start", sm: "flex-start" }} 
            gap={6} 
            borderBottom="1px solid rgba(86, 117, 109, 0.12)"
            pb={7}
            mb={7}
          >
            {/* Left: Organization Identity */}
            <VStack align="start" spacing={1.5} maxW="400px">
              <HStack spacing={3} align="center">
                <Image 
                  src="/logo_tra.png" 
                  alt="MLC Health and Wellness Centre Official Logo" 
                  h="42px" 
                  objectFit="contain" 
                  fallbackSrc="/favicon.png"
                />
                <VStack align="start" spacing={0}>
                  <Text 
                    fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                    fontWeight="600" 
                    fontSize="17px" 
                    color="#263A33" 
                    lineHeight="1.2"
                    letterSpacing="-0.015em"
                  >
                    MLC Health & Wellness
                  </Text>
                  <Text fontSize="11px" color="#56756D" fontWeight="600" letterSpacing="0.06em" textTransform="uppercase">
                    Clinical Telehealth Ecosystem
                  </Text>
                </VStack>
              </HStack>
              <Text fontSize="12px" color="#718096" lineHeight="1.5" pt={1}>
                MLC Health &amp; Wellness Centre Collective<br />
                Registered Healthcare Facilitation Desk · India<br />
                Official Care Support: therapy@mlchealth.in
              </Text>
            </VStack>

            {/* Right: Invoice Reference & Stamp */}
            <VStack align={{ base: "flex-start", sm: "flex-end" }} spacing={1.5}>
              <Badge 
                bg={invoiceBadge.bg} 
                color={invoiceBadge.color} 
                borderRadius="full" 
                px={3} 
                py={0.8} 
                fontSize="10.5px" 
                fontWeight="700" 
                letterSpacing="0.08em"
              >
                {invoiceBadge.label}
              </Badge>
              
              <Text 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                fontSize="22px" 
                fontWeight="600" 
                color="#263A33" 
                letterSpacing="-0.015em"
                mt={1}
              >
                Session Tax Invoice
              </Text>
              
              <HStack spacing={2} fontSize="12px">
                <Text color="#718096" fontWeight="500">Invoice Ref:</Text>
                <Text color="#263A33" fontWeight="700" fontFamily="monospace">
                  {invoiceNo}
                </Text>
              </HStack>
              
              <HStack spacing={2} fontSize="12px">
                <Text color="#718096" fontWeight="500">Date Issued:</Text>
                <Text color="#263A33" fontWeight="600">
                  {issueDateFormatted}
                </Text>
              </HStack>
            </VStack>
          </Flex>

          {/* 2-Column Bento Grid: Billed To (Client) & Clinical Provider (Therapist) */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={7}>
            {/* Tile 1: Client Details */}
            <Box 
              bg="rgba(250, 248, 245, 0.85)" 
              border="1px solid rgba(86, 117, 109, 0.12)" 
              borderRadius="xl" 
              p={4}
            >
              <HStack spacing={1.5} mb={2}>
                <Icon as={FiUser} color="#56756D" boxSize="13px" />
                <Text 
                  fontSize="10.5px" 
                  fontWeight="700" 
                  textTransform="uppercase" 
                  color="#56756D" 
                  letterSpacing="0.08em"
                >
                  Billed To (Client)
                </Text>
              </HStack>
              <Text 
                fontSize="15px" 
                fontWeight="600" 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                {appointment.client_name || appointment.client_display_name || "Valued MLC Client"}
              </Text>
              <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                {appointment.client_email || "Registered Patient Portal Account"}
              </Text>
              <HStack spacing={2} mt={2.5} pt={2} borderTop="1px dashed rgba(86, 117, 109, 0.12)">
                <Text fontSize="11px" color="#718096">Format:</Text>
                <Badge bg="white" color="#263A33" border="1px solid rgba(86, 117, 109, 0.18)" fontSize="10px" px={2} borderRadius="full">
                  Secure Video Telehealth
                </Badge>
              </HStack>
            </Box>

            {/* Tile 2: Clinical Provider Details */}
            <Box 
              bg="rgba(250, 248, 245, 0.85)" 
              border="1px solid rgba(86, 117, 109, 0.12)" 
              borderRadius="xl" 
              p={4}
            >
              <HStack spacing={1.5} mb={2}>
                <Icon as={FiShield} color="#56756D" boxSize="13px" />
                <Text 
                  fontSize="10.5px" 
                  fontWeight="700" 
                  textTransform="uppercase" 
                  color="#56756D" 
                  letterSpacing="0.08em"
                >
                  Clinical Provider
                </Text>
              </HStack>
              <Text 
                fontSize="15px" 
                fontWeight="600" 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
              >
                {appointment.therapist_name || therapist?.name || "Licensed MLC Clinician"}
              </Text>
              <Text fontSize="12.5px" color="#5A6E65" mt={0.5}>
                {therapist?.title || therapist?.qualifications || "Licensed Mental Health Practitioner"}
              </Text>
              <HStack spacing={2} mt={2.5} pt={2} borderTop="1px dashed rgba(86, 117, 109, 0.12)">
                <Text fontSize="11px" color="#718096">Affiliation:</Text>
                <Text fontSize="11px" color="#263A33" fontWeight="600">
                  MLC Clinical Collective
                </Text>
              </HStack>
            </Box>
          </Grid>

          {/* Itemized Clinical Services Table */}
          <Box 
            border="1px solid rgba(86, 117, 109, 0.14)" 
            borderRadius="xl" 
            overflow="hidden" 
            mb={7}
          >
            {/* Table Header */}
            <Grid 
              templateColumns={{ base: "2.5fr 1.2fr 0.8fr 1fr", md: "3fr 1.5fr 0.8fr 1.2fr" }} 
              bg="rgba(250, 248, 245, 0.95)" 
              p={3.5} 
              px={4}
              borderBottom="1px solid rgba(86, 117, 109, 0.12)"
              gap={2}
            >
              <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                Service &amp; Modality
              </Text>
              <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                Session Time
              </Text>
              <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" textAlign="center">
                Qty
              </Text>
              <Text fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" textAlign="right">
                Amount (INR)
              </Text>
            </Grid>

            {/* Table Row */}
            <Grid 
              templateColumns={{ base: "2.5fr 1.2fr 0.8fr 1fr", md: "3fr 1.5fr 0.8fr 1.2fr" }} 
              p={4} 
              alignItems="center"
              gap={2}
            >
              <VStack align="start" spacing={1}>
                <Text fontSize="13.5px" fontWeight="600" color="#263A33">
                  {appointment.service_type || "Individual Clinical Psychotherapy"}
                </Text>
                <Text fontSize="11.5px" color="#718096">
                  Standard 50-Minute Clinical Telehealth Consultation
                </Text>
              </VStack>

              <VStack align="start" spacing={0.5}>
                <HStack spacing={1.5}>
                  <Icon as={FiCalendar} color="#56756D" boxSize="11px" />
                  <Text fontSize="12px" color="#263A33" fontWeight="600">
                    {sessionDateFormatted}
                  </Text>
                </HStack>
                {sessionTimeFormatted && (
                  <Text fontSize="11px" color="#718096" pl={4}>
                    {sessionTimeFormatted}
                  </Text>
                )}
              </VStack>

              <Text fontSize="13px" fontWeight="600" color="#263A33" textAlign="center">
                1.0
              </Text>

              <Text fontSize="13.5px" fontWeight="700" color="#263A33" textAlign="right">
                ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </Text>
            </Grid>
          </Box>

          {/* Financial Breakdown & Summary Box */}
          <Flex justify="flex-end" mb={8}>
            <VStack 
              align="stretch" 
              w={{ base: "full", sm: "320px" }} 
              spacing={2.5}
              p={4}
              bg="rgba(250, 248, 245, 0.65)"
              border="1px solid rgba(86, 117, 109, 0.12)"
              borderRadius="xl"
            >
              <HStack justify="space-between" fontSize="12.5px">
                <Text color="#5A6E65">Session Fee</Text>
                <Text fontWeight="600" color="#263A33">
                  ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </HStack>

              <HStack justify="space-between" fontSize="12.5px">
                <Text color="#5A6E65">Encrypted Platform Care</Text>
                <Text fontWeight="600" color="#059669">
                  Included (₹0.00)
                </Text>
              </HStack>

              <HStack justify="space-between" fontSize="12.5px">
                <Text color="#5A6E65">Healthcare GST</Text>
                <Text fontWeight="600" color="#718096">
                  Exempt (Sec 66D)
                </Text>
              </HStack>

              <Divider borderColor="rgba(86, 117, 109, 0.15)" my={1} />

              <HStack justify="space-between">
                <Text 
                  fontSize="14px" 
                  fontWeight="600" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Total Settled
                </Text>
                <Text 
                  fontSize="17px" 
                  fontWeight="700" 
                  color="#263A33" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </HStack>

              <HStack justify="space-between" pt={1}>
                <HStack spacing={1.5} color="#059669" fontSize="11px" fontWeight="600">
                  <Icon as={FiCheckCircle} boxSize="12px" />
                  <Text>Settled &amp; Verified</Text>
                </HStack>
                <HStack spacing={1} color="#718096" fontSize="11px">
                  <Icon as={FiLock} boxSize="10px" />
                  <Text>Encrypted Payout</Text>
                </HStack>
              </HStack>
            </VStack>
          </Flex>

          {/* Clinical & Regulatory Disclaimers */}
          <Box 
            borderTop="1px solid rgba(86, 117, 109, 0.12)" 
            pt={6} 
            mt={4}
          >
            <HStack spacing={2} mb={3.5}>
              <Icon as={FiShield} color="#56756D" boxSize="14px" />
              <Heading 
                fontSize="12.5px" 
                fontWeight="600" 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                letterSpacing="0.04em"
                textTransform="uppercase"
              >
                Clinical Healthcare Notice &amp; Ethics Disclaimers
              </Heading>
            </HStack>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3} mb={6}>
              <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.7)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="11px" fontWeight="700" color="#263A33" mb={0.5}>
                  1. Clinical Facilitation
                </Text>
                <Text fontSize="11px" color="#5A6E65" lineHeight="1.5">
                  MLC Health acts as an integrated clinical enablement ecosystem. The therapeutic relationship and clinical choices exist strictly between client and practitioner.
                </Text>
              </Box>

              <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.7)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="11px" fontWeight="700" color="#263A33" mb={0.5}>
                  2. Attendance Policy
                </Text>
                <Text fontSize="11px" color="#5A6E65" lineHeight="1.5">
                  This invoice confirms reserved clinical consulting time. Cancellations under 24 hours notice are billed in accordance with the MLC Clinical Attendance Standard.
                </Text>
              </Box>

              <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.7)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="11px" fontWeight="700" color="#263A33" mb={0.5}>
                  3. Indian DPDP Ethics
                </Text>
                <Text fontSize="11px" color="#5A6E65" lineHeight="1.5">
                  All clinical documentation, identifiers, and invoices are protected under the Digital Personal Data Protection (DPDP) Act and strict medical non-disclosure protocols.
                </Text>
              </Box>

              <Box p={3} borderRadius="lg" bg="rgba(250, 248, 245, 0.7)" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="11px" fontWeight="700" color="#263A33" mb={0.5}>
                  4. Emergency Non-Substitute
                </Text>
                <Text fontSize="11px" color="#5A6E65" lineHeight="1.5">
                  This financial invoice is not an emergency psychiatric intake document. If experiencing acute distress, call 112 or the Vandrevala Foundation at 9999 666 555.
                </Text>
              </Box>
            </Grid>

            {/* Document Verification Signoff */}
            <Flex 
              direction={{ base: "column", sm: "row" }} 
              justify="space-between" 
              align="center" 
              pt={4} 
              borderTop="1px dashed rgba(86, 117, 109, 0.12)"
              gap={3}
            >
              <HStack spacing={2.5}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiShield} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="11.5px" fontWeight="600" color="#263A33">
                    MLC Health &amp; Wellness Centre
                  </Text>
                  <Text fontSize="10.5px" color="#718096">
                    A space to feel, to heal, to become.
                  </Text>
                </VStack>
              </HStack>

              <Text fontSize="10.5px" color="#718096" textAlign={{ base: "center", sm: "right" }}>
                Digitally authenticated document · Generated by MLC Health Ecosystem
              </Text>
            </Flex>
          </Box>
        </Box>
      </Container>

      {/* 🖨️ Clean Print Styling */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: #263A33 !important;
          }
          nav, footer, .no-print {
            display: none !important;
          }
          #invoice-document {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            padding: 24px !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          @page {
            margin: 1.2cm;
            size: A4 portrait;
          }
        }
      `}</style>
    </Box>
  );
}
