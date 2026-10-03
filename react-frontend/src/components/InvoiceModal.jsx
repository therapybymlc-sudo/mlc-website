"use client";

import { useEffect, useState } from "react";
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
  Badge,
  Circle,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { apiGet } from "../api.js";
import {
  FiPrinter,
  FiShield,
  FiFileText,
  FiCheckCircle,
  FiCopy,
  FiLock,
  FiCalendar,
  FiUser,
} from "react-icons/fi";

export function openInvoiceModal(appointmentId) {
  if (typeof window !== "undefined" && appointmentId) {
    window.dispatchEvent(
      new CustomEvent("mlc:open-invoice", { detail: { appointmentId: String(appointmentId) } })
    );
  }
}

export default function InvoiceModal({ isOpen, onClose, appointmentId, initialAppointment = null }) {
  const [loading, setLoading] = useState(!initialAppointment);
  const [appointment, setAppointment] = useState(initialAppointment);
  const [therapist, setTherapist] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      if (!initialAppointment) setAppointment(null);
      return;
    }

    let isSubscribed = true;

    const load = async () => {
      try {
        setLoading(true);
        let appt = null;
        try {
          appt = await apiGet(`client-appointments/${appointmentId}/`);
        } catch (_clientErr) {
          try {
            appt = await apiGet(`appointments/${appointmentId}/`);
          } catch (_apptErr) {
            console.warn("Could not fetch appointment by ID", appointmentId);
          }
        }

        if (!isSubscribed) return;
        setAppointment(appt);

        if (appt?.therapist) {
          const t = await apiGet(`therapists/${appt.therapist}/`).catch(() => null);
          if (isSubscribed) setTherapist(t);
        }
      } catch (err) {
        console.error("Failed to load invoice modal data", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    void load();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, appointmentId, initialAppointment]);

  const safeAppointmentId = String(appointmentId || appointment?.id || "");
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

  const handlePrint = () => {
    const sheet = document.getElementById("invoice-modal-sheet");
    if (!sheet) {
      window.print();
      return;
    }
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceNo} - MLC Health & Wellness</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 20px;
              color: #263A33;
              background: #fff;
            }
            * { box-sizing: border-box; }
            .no-print { display: none !important; }
            @page { margin: 1cm; size: A4 portrait; }
          </style>
        </head>
        <body>
          ${sheet.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (e) {
        console.error("Print trigger failed", e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1500);
      }
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay bg="rgba(14, 26, 22, 0.72)" backdropFilter="blur(8px)" />
      <ModalContent
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.2)"
        boxShadow="0 24px 48px -12px rgba(38, 58, 51, 0.35)"
        overflow="hidden"
        bg="#FAF8F5"
        maxH="90vh"
        my={4}
      >
        <ModalHeader
          bg="white"
          borderBottom="1px solid rgba(86, 117, 109, 0.12)"
          py={3.5}
          px={5}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3} pr={8}>
            <HStack spacing={2.5}>
              <Circle size="30px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiFileText} boxSize="15px" />
              </Circle>
              <VStack align="start" spacing={0}>
                <HStack spacing={2}>
                  <Text
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    fontSize="15px"
                    fontWeight="600"
                    color="#263A33"
                  >
                    Clinical Invoice
                  </Text>
                  <Badge
                    bg={invoiceBadge.bg}
                    color={invoiceBadge.color}
                    fontSize="10px"
                    fontWeight="700"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {invoiceBadge.label}
                  </Badge>
                </HStack>
                <Text fontSize="11px" color="#718096" fontFamily="monospace">
                  {invoiceNo}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="xs"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#5A6E65"
                borderRadius="full"
                h="30px"
                px={3}
                fontSize="11.5px"
                fontWeight="600"
                leftIcon={<FiCopy size={12} />}
                onClick={handleCopyInvoiceNumber}
                _hover={{ bg: "rgba(86, 117, 109, 0.06)", color: "#263A33" }}
              >
                Copy Ref
              </Button>
              <Button
                size="xs"
                bg="#56756D"
                color="white"
                borderRadius="full"
                h="30px"
                px={3.5}
                fontSize="11.5px"
                fontWeight="600"
                leftIcon={<FiPrinter size={12} />}
                onClick={handlePrint}
                boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                _hover={{ bg: "#263A33" }}
              >
                Print / Save PDF
              </Button>
            </HStack>
          </Flex>
          <ModalCloseButton top="14px" right="16px" color="#5A6E65" />
        </ModalHeader>

        <ModalBody p={{ base: 4, sm: 6 }} bg="#FAF8F5">
          {loading ? (
            <Flex minH="340px" justify="center" align="center">
              <VStack spacing={3}>
                <Spinner
                  thickness="3px"
                  speed="0.7s"
                  emptyColor="rgba(86, 117, 109, 0.12)"
                  color="#56756D"
                  size="xl"
                />
                <Text fontSize="13px" color="#5A6E65" fontWeight="500">
                  Retrieving official invoice...
                </Text>
              </VStack>
            </Flex>
          ) : !appointment ? (
            <Flex minH="280px" justify="center" align="center" textAlign="center">
              <VStack spacing={3} maxW="380px">
                <Circle size="46px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                  <Icon as={FiFileText} boxSize="20px" />
                </Circle>
                <Heading
                  fontSize="16px"
                  fontWeight="600"
                  color="#263A33"
                  fontFamily="'Outfit', var(--font-outfit), sans-serif"
                >
                  Invoice Not Available
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65">
                  We could not find the invoice record for this appointment. It may be generating or require session confirmation.
                </Text>
              </VStack>
            </Flex>
          ) : (
            <Box
              id="invoice-modal-sheet"
              bg="white"
              borderRadius="xl"
              border="1px solid rgba(86, 117, 109, 0.16)"
              boxShadow="0 4px 16px -2px rgba(38, 58, 51, 0.05)"
              p={{ base: 5, sm: 8 }}
            >
              {/* Brand & Organization Header */}
              <Flex
                direction={{ base: "column", sm: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "flex-start" }}
                gap={5}
                borderBottom="1px solid rgba(86, 117, 109, 0.12)"
                pb={6}
                mb={6}
              >
                <VStack align="start" spacing={1.5} maxW="360px">
                  <HStack spacing={3} align="center">
                    <Image
                      src="/logo_tra.png"
                      alt="MLC Health and Wellness"
                      h="36px"
                      objectFit="contain"
                      fallbackSrc="/favicon.png"
                    />
                    <VStack align="start" spacing={0}>
                      <Text
                        fontFamily="'Outfit', var(--font-outfit), sans-serif"
                        fontWeight="600"
                        fontSize="16px"
                        color="#263A33"
                        lineHeight="1.2"
                      >
                        MLC Health &amp; Wellness
                      </Text>
                      <Text
                        fontSize="10.5px"
                        color="#56756D"
                        fontWeight="700"
                        letterSpacing="0.06em"
                        textTransform="uppercase"
                      >
                        Clinical Telehealth Ecosystem
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="11.5px" color="#718096" lineHeight="1.5" pt={1}>
                    Registered Healthcare Facilitation Desk · India<br />
                    Official Support: therapy@mlchealth.in
                  </Text>
                </VStack>

                <VStack align={{ base: "flex-start", sm: "flex-end" }} spacing={1}>
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
                    fontSize="20px"
                    fontWeight="600"
                    color="#263A33"
                    letterSpacing="-0.015em"
                    mt={1}
                  >
                    Session Tax Invoice
                  </Text>
                  <HStack spacing={2} fontSize="11.5px">
                    <Text color="#718096">Invoice Ref:</Text>
                    <Text color="#263A33" fontWeight="700" fontFamily="monospace">
                      {invoiceNo}
                    </Text>
                  </HStack>
                  <HStack spacing={2} fontSize="11.5px">
                    <Text color="#718096">Date Issued:</Text>
                    <Text color="#263A33" fontWeight="600">
                      {issueDateFormatted}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>

              {/* 2-Column Bento: Client & Clinician */}
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mb={6}>
                <Box
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid rgba(86, 117, 109, 0.12)"
                  borderRadius="xl"
                  p={4}
                >
                  <HStack spacing={1.5} mb={2}>
                    <Icon as={FiUser} color="#56756D" boxSize="13px" />
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      textTransform="uppercase"
                      color="#56756D"
                      letterSpacing="0.08em"
                    >
                      Billed To (Client)
                    </Text>
                  </HStack>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    {appointment.client_name || appointment.client_display_name || "Valued MLC Client"}
                  </Text>
                  <Text fontSize="12px" color="#5A6E65" mt={0.5}>
                    {appointment.client_email || "Registered Patient Portal Account"}
                  </Text>
                  <HStack spacing={2} mt={2} pt={2} borderTop="1px dashed rgba(86, 117, 109, 0.12)">
                    <Text fontSize="10.5px" color="#718096">Format:</Text>
                    <Badge
                      bg="white"
                      color="#263A33"
                      border="1px solid rgba(86, 117, 109, 0.18)"
                      fontSize="9.5px"
                      px={2}
                      borderRadius="full"
                    >
                      Secure Telehealth
                    </Badge>
                  </HStack>
                </Box>

                <Box
                  bg="rgba(250, 248, 245, 0.85)"
                  border="1px solid rgba(86, 117, 109, 0.12)"
                  borderRadius="xl"
                  p={4}
                >
                  <HStack spacing={1.5} mb={2}>
                    <Icon as={FiShield} color="#56756D" boxSize="13px" />
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      textTransform="uppercase"
                      color="#56756D"
                      letterSpacing="0.08em"
                    >
                      Clinical Provider
                    </Text>
                  </HStack>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#263A33"
                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                  >
                    {appointment.therapist_name || therapist?.name || "Licensed MLC Clinician"}
                  </Text>
                  <Text fontSize="12px" color="#5A6E65" mt={0.5}>
                    {therapist?.title || therapist?.qualifications || "Licensed Mental Health Practitioner"}
                  </Text>
                  <HStack spacing={2} mt={2} pt={2} borderTop="1px dashed rgba(86, 117, 109, 0.12)">
                    <Text fontSize="10.5px" color="#718096">Affiliation:</Text>
                    <Text fontSize="10.5px" color="#263A33" fontWeight="600">
                      MLC Clinical Collective
                    </Text>
                  </HStack>
                </Box>
              </Grid>

              {/* Itemized Services Table */}
              <Box
                border="1px solid rgba(86, 117, 109, 0.14)"
                borderRadius="xl"
                overflow="hidden"
                mb={6}
              >
                <Grid
                  templateColumns={{ base: "2.5fr 1.2fr 0.8fr 1fr", md: "3fr 1.5fr 0.8fr 1.2fr" }}
                  bg="rgba(250, 248, 245, 0.95)"
                  p={3}
                  px={4}
                  borderBottom="1px solid rgba(86, 117, 109, 0.12)"
                  gap={2}
                >
                  <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                    Service &amp; Modality
                  </Text>
                  <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">
                    Session Date
                  </Text>
                  <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" textAlign="center">
                    Qty
                  </Text>
                  <Text fontSize="10px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase" textAlign="right">
                    Amount (INR)
                  </Text>
                </Grid>

                <Grid
                  templateColumns={{ base: "2.5fr 1.2fr 0.8fr 1fr", md: "3fr 1.5fr 0.8fr 1.2fr" }}
                  p={3.5}
                  px={4}
                  alignItems="center"
                  gap={2}
                >
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="13px" fontWeight="600" color="#263A33">
                      {appointment.service_type || "Individual Clinical Psychotherapy"}
                    </Text>
                    <Text fontSize="11px" color="#718096">
                      Standard 50-Minute Clinical Telehealth Consultation
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={0}>
                    <HStack spacing={1.5}>
                      <Icon as={FiCalendar} color="#56756D" boxSize="11px" />
                      <Text fontSize="12px" color="#263A33" fontWeight="600">
                        {sessionDateFormatted}
                      </Text>
                    </HStack>
                    {sessionTimeFormatted && (
                      <Text fontSize="10.5px" color="#718096" pl={4}>
                        {sessionTimeFormatted}
                      </Text>
                    )}
                  </VStack>

                  <Text fontSize="12.5px" fontWeight="600" color="#263A33" textAlign="center">
                    1.0
                  </Text>

                  <Text fontSize="13px" fontWeight="700" color="#263A33" textAlign="right">
                    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Text>
                </Grid>
              </Box>

              {/* Financial Summary */}
              <Flex justify="flex-end" mb={6}>
                <VStack
                  align="stretch"
                  w={{ base: "full", sm: "300px" }}
                  spacing={2}
                  p={3.5}
                  bg="rgba(250, 248, 245, 0.7)"
                  border="1px solid rgba(86, 117, 109, 0.12)"
                  borderRadius="xl"
                >
                  <HStack justify="space-between" fontSize="12px">
                    <Text color="#5A6E65">Session Fee</Text>
                    <Text fontWeight="600" color="#263A33">
                      ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" fontSize="12px">
                    <Text color="#5A6E65">Encrypted Platform Care</Text>
                    <Text fontWeight="600" color="#059669">
                      Included (₹0.00)
                    </Text>
                  </HStack>
                  <HStack justify="space-between" fontSize="12px">
                    <Text color="#5A6E65">Healthcare GST</Text>
                    <Text fontWeight="600" color="#718096">
                      Exempt (Sec 66D)
                    </Text>
                  </HStack>
                  <Divider borderColor="rgba(86, 117, 109, 0.15)" my={0.5} />
                  <HStack justify="space-between">
                    <Text
                      fontSize="13.5px"
                      fontWeight="600"
                      color="#263A33"
                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    >
                      Total Settled
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight="700"
                      color="#263A33"
                      fontFamily="'Outfit', var(--font-outfit), sans-serif"
                    >
                      ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" pt={1}>
                    <HStack spacing={1.5} color="#059669" fontSize="10.5px" fontWeight="600">
                      <Icon as={FiCheckCircle} boxSize="11px" />
                      <Text>Settled &amp; Verified</Text>
                    </HStack>
                    <HStack spacing={1} color="#718096" fontSize="10.5px">
                      <Icon as={FiLock} boxSize="10px" />
                      <Text>Encrypted Payout</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Flex>

              {/* Regulatory Notice & Signoff */}
              <Box borderTop="1px solid rgba(86, 117, 109, 0.12)" pt={4}>
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  align="center"
                  gap={3}
                >
                  <HStack spacing={2}>
                    <Circle size="24px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                      <Icon as={FiShield} boxSize="12px" />
                    </Circle>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="11px" fontWeight="600" color="#263A33">
                        MLC Health &amp; Wellness Centre
                      </Text>
                      <Text fontSize="10px" color="#718096">
                        Digitally authenticated session receipt under DPDP Act protocols.
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="10px" color="#718096" textAlign={{ base: "center", sm: "right" }}>
                    Official Care Support: therapy@mlchealth.in
                  </Text>
                </Flex>
              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
