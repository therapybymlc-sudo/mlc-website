'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { 
  Box, Container, VStack, HStack, Heading, Text, Button, 
  Avatar, Badge, Divider, Icon, Spinner, Center, SimpleGrid,
  useToast, Circle
} from "@chakra-ui/react";
import { 
  FiCheckCircle, FiClock, FiCalendar, FiShield, FiLock, 
  FiArrowLeft, FiVideo, FiUser, FiInfo, FiCheck, FiZap
} from "react-icons/fi";
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { useAuth } from "../../../context/AuthContext";
import { apiPost } from "../../../api.js";

export default function CheckoutClient() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, user } = useUser();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const therapistId = searchParams.get('therapist');
  const slotId = searchParams.get('slot');
  const sessionType = searchParams.get('type') === 'supervision' ? 'supervision' : 'individual';
  const isSupervision = sessionType === 'supervision';

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [slot, setSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [_bookingRequestId, setBookingRequestId] = useState(null);
  const [simulatedSuccessData, setSimulatedSuccessData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!therapistId || !slotId) return;

    const fetchData = async () => {
      try {
        const base = (
          (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) ||
          (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE : null) ||
          "http://127.0.0.1:8000/api"
        ).replace(/\/+$/, "");

        const isDynamicSlot = typeof slotId === "string" && slotId.startsWith("dyn-");

        // Fetch Profile
        const profileRes = await fetch(`${base}/therapists/${therapistId}/`);
        // Fetch all slots only for non-dynamic slot ids
        const slotRes = isDynamicSlot
          ? null
          : await fetch(`${base}/availability-slots/public/?therapist=${therapistId}`);

        if (profileRes.ok && (isDynamicSlot || slotRes?.ok)) {
          const profileData = await profileRes.json();
          setProfile(profileData);

          if (isDynamicSlot) {
            const ts = Number(String(slotId).replace("dyn-", ""));
            const startTime = Number.isFinite(ts) ? new Date(ts * 1000) : null;
            const endTime = startTime ? new Date(startTime.getTime() + 60 * 60 * 1000) : null;
            setSlot(
              startTime && endTime
                ? {
                    id: slotId,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    therapist: Number(therapistId),
                  }
                : null
            );
          } else {
            const slotsData = await slotRes.json();
            const foundSlot = (slotsData.results || slotsData).find((s) => String(s.id).includes(slotId) || s.id == slotId);
            setSlot(foundSlot);
          }
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [therapistId, slotId]);

  const handlePayment = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      toast({ title: "Please sign in to continue.", status: "info" });
      const returnUrl = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/book/checkout";
      window.location.href = `/login/client?redirect_url=${encodeURIComponent(returnUrl)}`;
      return;
    }
    if (!window.Razorpay) {
      toast({ title: "Payment system loading...", status: "info" });
      return;
    }
    
    try {
      setIsProcessing(true);

      const order = await apiPost("payments/razorpay/create-order", {
        therapist_id: therapistId,
        slot_id: slotId,
        session_type: sessionType,
      });

      setBookingRequestId(order.booking_request_id);

      const fullName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
      const email = user?.primaryEmailAddress?.emailAddress || "";

      const options = {
        key: order.key_id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "MLC Health",
        description: `Session with ${order.therapist_name || profile?.name || "Therapist"}`,
        image: "https://www.mlchealth.in/logo.png",
        handler: async function (response) {
          try {
            await apiPost("payments/razorpay/verify", {
              booking_request_id: order.booking_request_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast({
              title: "Payment Successful!",
              description: "Your session is confirmed. Check your dashboard for details.",
              status: "success",
              duration: 8000
            });
            setTimeout(() => window.location.href = "/dashboard/client/appointments", 1500);
          } catch (e) {
            console.error(e);
            toast({
              title: "Payment verification failed",
              description: "We received your payment but couldn't confirm your booking yet. Please contact support.",
              status: "error",
              duration: 10000
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              if (order.booking_request_id) {
                await apiPost(`booking-requests/${order.booking_request_id}/cancel`, {
                  message_from_client: "Payment cancelled",
                });
              }
            } catch (e) {
              console.warn("Failed to cancel pending booking request", e);
            } finally {
              setIsProcessing(false);
            }
          }
        },
        prefill: {
          name: fullName || "",
          email: email || "",
          contact: ""
        },
        theme: {
          color: "#56756D"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      toast({
        title: "Checkout error",
        description: e?.response?.data?.detail || "Could not start checkout. Please try again.",
        status: "error",
        duration: 8000
      });
      setIsProcessing(false);
    }
  };

  const auth = useAuth();
  const isAuthDummyClient = auth?.isDummyClient;
  const userEmail = (user?.primaryEmailAddress?.emailAddress || "").toLowerCase();
  const userName = (user?.fullName || "").toLowerCase();
  const isDummyClient = Boolean(
    isAuthDummyClient ||
    userEmail.includes("dummy") ||
    userEmail.includes("test") ||
    userName.includes("dummy")
  );

  const isLocalhost = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );

  const therapistEmail = (profile?.email || "").toLowerCase();
  const therapistName = (profile?.name || "").toLowerCase();
  const isDummyTherapist = Boolean(
    profile && (
      profile.id === 8 ||
      therapistEmail.includes("dummy") ||
      therapistEmail.includes("test") ||
      therapistName.includes("dummy") ||
      therapistName.includes("maya")
    )
  );

  // Strictly localhost AND dummy client account AND dummy therapist account
  const canSimulatePayment = Boolean(isLocalhost && isDummyClient && isDummyTherapist);

  const handleSimulatePayment = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      toast({ title: "Please sign in as a dummy client to continue.", status: "info" });
      const returnUrl = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/book/checkout";
      window.location.href = `/login/client?redirect_url=${encodeURIComponent(returnUrl)}`;
      return;
    }

    try {
      setIsProcessing(true);
      const res = await apiPost("payments/simulate-booking", {
        therapist_id: therapistId,
        slot_id: slotId,
        session_type: sessionType,
        message_from_client: isSupervision ? "Local dev test clinical supervision" : "Local dev test booking",
      });

      const meetingLink = res.meeting_link || `/conference/MLC_${res.appointment_id || res.booking_request_id}`;
      if (res.booking_request_id) {
        setBookingRequestId(res.booking_request_id);
      }
      setSimulatedSuccessData({
        bookingRequestId: res.booking_request_id,
        appointmentId: res.appointment_id,
        meetingLink,
      });

      toast({
        title: "⚡ Payment Simulated Successfully!",
        description: "Session confirmed & Jitsi room created. Meeting link is ready below.",
        status: "success",
        duration: 8000,
      });
    } catch (e) {
      console.error("Simulation error", e);
      const is404 = e?.response?.status === 404;
      const detailMsg = is404
        ? "Backend endpoint '/api/payments/simulate-booking/' returned 404 on https://api.mlchealth.in. The new backend code needs to be committed and pushed to GitHub main so Render can deploy it."
        : (e?.response?.data?.detail || e.message || "Failed to simulate booking payment.");
      toast({
        title: is404 ? "Backend Route Not Deployed Yet" : "Simulation Failed",
        description: detailMsg,
        status: "warning",
        duration: 9000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return <Box h="100vh" bg="#FDFBFA" />;

  if (simulatedSuccessData) {
    return (
      <Box minH="100vh" bg="#FAF8F5" py={{ base: 10, md: 16 }} fontFamily="'Inter', var(--font-inter), sans-serif">
        <Container maxW="600px">
          <Box
            bg="white"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            border="1px solid rgba(86, 117, 109, 0.16)"
            boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"
            textAlign="center"
          >
            <Circle size="64px" bg="rgba(16, 185, 129, 0.12)" color="#059669" mx="auto" mb={4}>
              <Icon as={FiCheck} boxSize="30px" />
            </Circle>

            <Badge
              bg="rgba(16, 185, 129, 0.12)"
              color="#047857"
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              borderRadius="full"
              px={3}
              py={1}
              mb={3}
            >
              Session Confirmed · Simulated Payment
            </Badge>

            <Heading
              as="h1"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              fontWeight="600"
              fontSize="24px"
              color="#263A33"
              mb={2}
            >
              Session Booked Successfully!
            </Heading>

            <Text fontSize="13.5px" color="#5A6E65" mb={6} lineHeight="1.6">
              Your test booking has been confirmed without Razorpay charges. All database records and session rooms are live.
            </Text>

            <Box
              bg="rgba(250, 248, 245, 0.9)"
              borderRadius="xl"
              p={4}
              border="1px solid rgba(86, 117, 109, 0.12)"
              textAlign="left"
              mb={6}
            >
              <VStack align="stretch" spacing={2.5} fontSize="13px">
                <HStack justify="space-between">
                  <Text color="#718096">Therapist</Text>
                  <Text fontWeight="600" color="#263A33">{profile?.name || "Therapist"}</Text>
                </HStack>
                <Divider borderColor="rgba(86, 117, 109, 0.1)" />
                <HStack justify="space-between">
                  <Text color="#718096">Date & Time</Text>
                  <Text fontWeight="600" color="#263A33">{formattedDate} · {formattedTime}</Text>
                </HStack>
                <Divider borderColor="rgba(86, 117, 109, 0.1)" />
                <HStack justify="space-between">
                  <Text color="#718096">Session Type</Text>
                  <Text fontWeight="600" color="#263A33">{isSupervision ? "Clinical Supervision" : "Individual Therapy"}</Text>
                </HStack>
                <Divider borderColor="rgba(86, 117, 109, 0.1)" />
                <VStack align="start" spacing={1} pt={1}>
                  <Text color="#718096">Direct Video Room Link</Text>
                  <Text
                    as={Link}
                    href={simulatedSuccessData.meetingLink}
                    color="#56756D"
                    fontWeight="600"
                    fontSize="12.5px"
                    wordBreak="break-all"
                    textDecoration="underline"
                  >
                    {typeof window !== "undefined" ? `${window.location.origin}${simulatedSuccessData.meetingLink}` : simulatedSuccessData.meetingLink}
                  </Text>
                </VStack>
              </VStack>
            </Box>

            <VStack spacing={3} align="stretch">
              <Button
                as={Link}
                href={simulatedSuccessData.meetingLink}
                bg="#56756D"
                color="white"
                borderRadius="full"
                height="42px"
                fontSize="13.5px"
                fontWeight="600"
                leftIcon={<Icon as={FiVideo} color="#A9CBB7" />}
                _hover={{ bg: "#263A33", transform: "translateY(-1px)" }}
                boxShadow="0 4px 12px rgba(86, 117, 109, 0.25)"
              >
                Join Video Session Room Now
              </Button>

              <Button
                as={Link}
                href="/dashboard/client/appointments"
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                height="40px"
                fontSize="13px"
                fontWeight="600"
                _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
              >
                View in Client Appointments
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Center h="80vh" bg="#FDFBFA">
        <VStack spacing={4}>
          <Spinner size="xl" color="#56756D" thickness="3.5px" />
          <Text fontSize="14.5px" color="#263A33" fontWeight="600">
            Preparing your secure checkout...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (!profile || !slot) {
    return (
      <Box minH="100vh" bg="#FDFBFA" py={24}>
        <Container maxW="md" textAlign="center">
          <VStack spacing={6} p={8} bg="white" borderRadius="3xl" border="1px solid" borderColor="gray.200" shadow="sm">
            <Circle size="60px" bg="#FFF5F5" color="#C53030">
              <Icon as={FiCalendar} boxSize={7} />
            </Circle>
            <VStack spacing={2}>
              <Heading size="md" fontFamily="'Playfair Display', serif" color="#263A33">
                Session Slot Unavailable
              </Heading>
              <Text color="rgba(46,46,46,0.68)" fontSize="14px" lineHeight="1.6">
                The selected time slot is no longer available or your reservation window has expired.
              </Text>
            </VStack>
            <Button as={Link} href="/therapists/discovery" w="full" bg="#56756D" color="white" borderRadius="full" _hover={{ bg: "#425C55" }}>
              Return to Therapist Discovery
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  const slotDate = new Date(slot.start_time);
  const dateStr = slotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const slotEndDate = slot.end_time ? new Date(slot.end_time) : new Date(slotDate.getTime() + 50 * 60 * 1000);
  const endTimeStr = slotEndDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Robust currency calculation based on session type
  const rateNumber = parseFloat(
    isSupervision
      ? (profile.supervision_hourly_rate || profile.hourly_rate || 1500)
      : (profile.hourly_rate || 1200)
  );
  const formattedAmount = isNaN(rateNumber) ? (isSupervision ? "₹1,500" : "₹1,200") : `₹${rateNumber.toLocaleString('en-IN')}`;

  const clientName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Registered Client";
  const clientEmail = user?.primaryEmailAddress?.emailAddress || "";

  return (
    <Box bg="#FDFBFA" minH="100vh" py={{ base: 8, md: 14 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <Container maxW="5xl">
        {/* Navigation & Security Banner */}
        <HStack justify="space-between" align="center" mb={{ base: 6, md: 8 }} flexWrap="wrap" gap={3}>
          <Button
            as={Link}
            href={`/therapists/${profile.id}`}
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
            borderRadius="full"
            color="#56756D"
            fontWeight="600"
            fontSize="13px"
            _hover={{ bg: "#EAF2EE", color: "#263A33" }}
          >
            Back to {profile.name}'s Profile
          </Button>
          
          <HStack spacing={2} bg="#EAF2EE" px={3.5} py={1.5} borderRadius="full">
            <Icon as={FiShield} color="#56756D" boxSize={3.5} />
            <Text fontSize="11.5px" fontWeight="700" color="#56756D" letterSpacing="0.04em" textTransform="uppercase">
              256-Bit Encrypted Clinical Gateway
            </Text>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 10 }} alignItems="start">
          {/* ═══════════════ LEFT: APPOINTMENT DETAILS (7 COLS) ═══════════════ */}
          <Box gridColumn={{ lg: "span 7" }}>
            <VStack align="stretch" spacing={6}>
              {/* Header Titles */}
              <VStack align="start" spacing={2}>
                <Badge
                  bg={isSupervision ? "rgba(140, 110, 45, 0.15)" : "rgba(86, 117, 109, 0.12)"}
                  color={isSupervision ? "#8C6E2D" : "#56756D"}
                  border={isSupervision ? "1px solid rgba(140, 110, 45, 0.3)" : "1px solid rgba(86, 117, 109, 0.25)"}
                  px={3}
                  py={0.8}
                  borderRadius="full"
                  fontSize="11px"
                  fontWeight="800"
                  letterSpacing="0.08em"
                  textTransform="uppercase"
                >
                  Step 2 of 2 • {isSupervision ? "Clinical Supervision Confirmation" : "Appointment Confirmation"}
                </Badge>
                <Heading
                  fontSize={{ base: "24px", md: "32px" }}
                  color="#263A33"
                  fontFamily="'Playfair Display', var(--font-playfair), serif"
                  fontWeight="600"
                  lineHeight="1.2"
                >
                  Secure Your Clinical Session
                </Heading>
                <Text color="rgba(46,46,46,0.72)" fontSize="14px" lineHeight="1.6">
                  Review your consultation details before proceeding to the secure payment portal.
                </Text>
              </VStack>

              {/* Main Appointment Card */}
              <Box
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="3xl"
                border="1px solid"
                borderColor="rgba(86, 117, 109, 0.14)"
                boxShadow="0 4px 25px rgba(38, 58, 51, 0.04)"
              >
                <VStack align="stretch" spacing={6}>
                  {/* Practitioner Overview */}
                  <HStack spacing={4} align="center">
                    <Avatar
                      size="lg"
                      name={profile.name}
                      src={profile.profile_image_url}
                      borderRadius="2xl"
                      border="2px solid"
                      borderColor="#A9CBB7"
                      bg="#EAF2EE"
                      color="#56756D"
                      boxShadow="0 2px 10px rgba(86, 117, 109, 0.12)"
                    />
                    <VStack align="start" spacing={0.5}>
                      <HStack spacing={2}>
                        <Text fontWeight="700" fontSize="17.5px" color="#263A33">
                          {profile.name}
                        </Text>
                        <Circle size="18px" bg="#EAF2EE" color="#56756D">
                          <Icon as={FiCheck} boxSize="11px" />
                        </Circle>
                      </HStack>
                      <Text color="#56756D" fontSize="13px" fontWeight="600">
                        {profile.title || "Licensed Mental Health Practitioner"}
                      </Text>
                      {profile.qualifications && (
                        <Text color="rgba(46,46,46,0.55)" fontSize="12px">
                          {profile.qualifications}
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  <Divider borderColor="rgba(86, 117, 109, 0.12)" />

                  {/* Booking Specifics Matrix */}
                  <VStack align="stretch" spacing={3.5}>
                    {/* Date & Time */}
                    <Box p={3.5} bg="#FAF8F5" borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.08)">
                      <HStack spacing={3.5}>
                        <Circle size="38px" bg="white" color="#56756D" shadow="xs" flexShrink={0}>
                          <Icon as={FiCalendar} boxSize={4.5} />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em">
                            Session Date & Time
                          </Text>
                          <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                            {dateStr}
                          </Text>
                          <Text fontSize="12.5px" color="rgba(46,46,46,0.65)" fontWeight="500">
                            {timeStr} – {endTimeStr} (50 Mins)
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Format & Mode */}
                    <Box p={3.5} bg="#FAF8F5" borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.08)">
                      <HStack spacing={3.5}>
                        <Circle size="38px" bg="white" color="#56756D" shadow="xs" flexShrink={0}>
                          <Icon as={FiVideo} boxSize={4.5} />
                        </Circle>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em">
                            Modality & Privacy
                          </Text>
                          <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                            {isSupervision ? "Clinical Supervision & Mentorship" : "Online 1-on-1 Video Consultation"}
                          </Text>
                          <Text fontSize="12px" color="rgba(46,46,46,0.65)">
                            Private, peer-to-peer encrypted room (No software download required)
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Client Information */}
                    {isSignedIn && (
                      <Box p={3.5} bg="#FAF8F5" borderRadius="2xl" border="1px solid rgba(86, 117, 109, 0.08)">
                        <HStack spacing={3.5}>
                          <Circle size="38px" bg="white" color="#56756D" shadow="xs" flexShrink={0}>
                            <Icon as={FiUser} boxSize={4.5} />
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="11px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.06em">
                              Client Account
                            </Text>
                            <Text fontSize="13.5px" fontWeight="700" color="#263A33">
                              {clientName}
                            </Text>
                            {clientEmail && (
                              <Text fontSize="12px" color="rgba(46,46,46,0.65)">
                                Confirmation & link will be sent to: {clientEmail}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    )}
                  </VStack>

                  {/* Reassurance Checkpoints */}
                  <Box pt={2}>
                    <VStack align="start" spacing={2} fontSize="12.5px" color="rgba(46, 46, 46, 0.8)">
                      <HStack align="center" spacing={2}>
                        <Icon as={FiCheckCircle} color="#56756D" />
                        <Text><Text as="span" fontWeight="600">Instant Access:</Text> Video room credentials appear in your dashboard upon payment.</Text>
                      </HStack>
                      <HStack align="center" spacing={2}>
                        <Icon as={FiCheckCircle} color="#56756D" />
                        <Text><Text as="span" fontWeight="600">24-Hour Reschedule:</Text> Easily modify session time up to 24 hours in advance.</Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* ═══════════════ RIGHT: PAYMENT & ORDER SUMMARY (5 COLS) ═══════════════ */}
          <Box gridColumn={{ lg: "span 5" }} position={{ lg: "sticky" }} top="100px">
            <VStack align="stretch" spacing={5}>
              {/* Order Card */}
              <Box
                bg="linear-gradient(145deg, #1C2B26 0%, #263A33 60%, #1F302A 100%)"
                color="white"
                p={{ base: 6, md: 8 }}
                borderRadius="3xl"
                border="1px solid rgba(255, 255, 255, 0.12)"
                boxShadow="0 16px 40px rgba(20, 36, 32, 0.25)"
              >
                <VStack align="stretch" spacing={5}>
                  {/* Top Title & Badge */}
                  <HStack justify="space-between" align="center">
                    <Heading fontSize="20px" fontFamily="'Playfair Display', serif" color="white" fontWeight="600">
                      Order Summary
                    </Heading>
                    <Badge
                      bg="rgba(201, 169, 96, 0.2)"
                      color="#F0D591"
                      border="1px solid rgba(201, 169, 96, 0.35)"
                      px={2.5}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10.5px"
                      fontWeight="700"
                    >
                      MLC Direct
                    </Badge>
                  </HStack>

                  {/* Breakdown Table */}
                  <VStack align="stretch" spacing={3} pt={1}>
                    <HStack justify="space-between" fontSize="13.5px" color="whiteAlpha.850">
                      <Text>{isSupervision ? "Clinical Supervision (60m)" : "Clinical Consultation (50m)"}</Text>
                      <Text fontWeight="600" color="white">{formattedAmount}</Text>
                    </HStack>

                    <HStack justify="space-between" fontSize="13px" color="whiteAlpha.700">
                      <Text>Telehealth & Encryption Fee</Text>
                      <Badge bg="whiteAlpha.200" color="#A9CBB7" px={2} py={0.5} borderRadius="full" fontSize="10.5px">
                        Waived
                      </Badge>
                    </HStack>

                    <HStack justify="space-between" fontSize="13px" color="whiteAlpha.700">
                      <Text>Applicable Taxes (GST)</Text>
                      <Text fontSize="12px" color="whiteAlpha.700">Included</Text>
                    </HStack>

                    <Divider borderColor="rgba(255, 255, 255, 0.15)" my={1} />

                    {/* Total Row */}
                    <HStack justify="space-between" align="baseline" pt={1}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="14px" fontWeight="700" color="white">
                          Total Payable
                        </Text>
                        <Text fontSize="11px" color="whiteAlpha.600">
                          One-time session payment
                        </Text>
                      </VStack>
                      <Text fontSize="24px" fontWeight="800" color="#F0D591" letterSpacing="-0.02em">
                        {formattedAmount}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Payment Button */}
                  <Button
                    w="full"
                    h="52px"
                    bg="#C9A960"
                    color="#141918"
                    borderRadius="full"
                    fontSize="15px"
                    fontWeight="800"
                    leftIcon={<FiLock />}
                    isLoading={isProcessing}
                    loadingText="Connecting to Bank..."
                    _hover={{
                      bg: "#E0BF73",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 20px rgba(201, 169, 96, 0.35)",
                    }}
                    transition="all 0.2s ease"
                    onClick={handlePayment}
                  >
                    Confirm & Pay {formattedAmount}
                  </Button>

                  {/* ⚡ Localhost Dev Only: Simulate Payment for Dummy Client -> Dummy Therapist */}
                  {canSimulatePayment && (
                    <Box
                      p={3.5}
                      borderRadius="xl"
                      bg="rgba(16, 185, 129, 0.12)"
                      border="1px dashed rgba(110, 231, 183, 0.5)"
                      w="full"
                    >
                      <VStack spacing={2.5} align="stretch">
                        <HStack justify="space-between">
                          <Badge 
                            bg="#10B981" 
                            color="#064E3B" 
                            borderRadius="full" 
                            px={2.5} 
                            py={0.5} 
                            fontSize="9.5px"
                            fontWeight="800"
                            letterSpacing="0.05em"
                            textTransform="uppercase"
                          >
                            Localhost Dev Mode
                          </Badge>
                          <Text fontSize="11px" color="#6EE7B7" fontWeight="700">
                            Dummy Client ➔ Dummy Therapist
                          </Text>
                        </HStack>

                        <Button
                          w="full"
                          h="44px"
                          bg="#10B981"
                          color="#064E3B"
                          borderRadius="full"
                          fontSize="13px"
                          fontWeight="800"
                          leftIcon={<Icon as={FiZap} boxSize="15px" />}
                          isLoading={isProcessing}
                          loadingText="Simulating Payment..."
                          _hover={{ bg: "#34D399", transform: "translateY(-1px)" }}
                          transition="all 0.15s ease"
                          onClick={handleSimulatePayment}
                          boxShadow="0 4px 14px rgba(16, 185, 129, 0.3)"
                        >
                          Simulate Payment (Bypass Gateway)
                        </Button>

                        <Text fontSize="11px" color="#D1FAE5" textAlign="center" lineHeight="1.5" fontWeight="500">
                          Bypasses Razorpay, generates dummy payment details, creates appointment & triggers Jitsi video link + confirmation emails.
                        </Text>
                      </VStack>
                    </Box>
                  )}

                  {/* Security Footnote */}
                  <VStack spacing={2} pt={2} textAlign="center">
                    <HStack fontSize="11px" color="whiteAlpha.700" spacing={1.5} justify="center">
                      <Icon as={FiShield} color="#F0D591" />
                      <Text fontWeight="600">Razorpay 256-Bit SSL Encryption</Text>
                    </HStack>
                    <Text fontSize="11px" color="whiteAlpha.500" lineHeight="1.5">
                      Supports UPI (GPay, PhonePe, Paytm), Cards, and NetBanking.
                    </Text>
                    <Text fontSize="10.5px" color="whiteAlpha.450" lineHeight="1.4" pt={1}>
                      By continuing, you agree to the MLC Clinical Terms & 24-hr Cancellation Policy.
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              {/* Guarantees Box */}
              <Box p={4} borderRadius="2xl" bg="white" border="1px solid" borderColor="rgba(86, 117, 109, 0.15)">
                <HStack spacing={3} align="start">
                  <Icon as={FiCheckCircle} color="#56756D" boxSize={4.5} mt={0.5} flexShrink={0} />
                  <VStack align="start" spacing={0.5}>
                    <Text fontSize="12.5px" fontWeight="700" color="#263A33">
                      Safe & Confidential Session
                    </Text>
                    <Text fontSize="11.5px" color="rgba(46, 46, 46, 0.65)" lineHeight="1.5">
                      Your video consultation takes place in a HIPAA-compliant, number-free private room with full clinical isolation.
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
