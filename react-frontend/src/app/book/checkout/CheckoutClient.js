'use client'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { 
  Box, Container, VStack, HStack, Heading, Text, Button, 
  Image, Badge, Divider, Icon, Spinner, Center, SimpleGrid,
  Link as ChakraLink, useToast
} from "@chakra-ui/react";
import { FiCheckCircle, FiClock, FiCalendar, FiShield, FiLock, FiArrowLeft } from "react-icons/fi";
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
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

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [slot, setSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingRequestId, setBookingRequestId] = useState(null);
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
            // Find our specific slot from the list
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
            // Release held slot if the user cancels payment.
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

  if (!isMounted) return <Box h="100vh" bg="#F9FBFA" />;

  if (isLoading) return <Center h="80vh"><VStack pb={10}><Spinner size="xl" color="mlc.green" /><Text>Preparing your secure checkout...</Text></VStack></Center>;

  if (!profile || !slot) return (
    <Container maxW="md" py={20} textAlign="center">
      <VStack spacing={6}>
        <Icon as={FiCalendar} boxSize={12} color="gray.300" />
        <Heading size="md">Session Information Expired</Heading>
        <Text color="gray.500">The selected time slot is no longer available or the link has expired.</Text>
        <Button as={Link} href="/therapists/discovery" w="full" bg="mlc.green" color="white" borderRadius="full">Return to Discovery</Button>
      </VStack>
    </Container>
  );

  const slotDate = new Date(slot.start_time);
  const dateStr = slotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <Box bg="#F9FBFA" minH="100vh" py={{ base: 10, md: 20 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <Container maxW="4xl">
        <HStack mb={8} spacing={4}>
           <ChakraLink as={Link} href={`/therapists/${profile.id}`}>
              <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm" borderRadius="full" color="gray.500">Back to Profile</Button>
           </ChakraLink>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={12}>
           {/* Left: Summary */}
           <Box gridColumn={{ md: "span 3" }}>
              <VStack align="stretch" spacing={8}>
                 <VStack align="start" spacing={2}>
                    <Badge colorScheme="teal" borderRadius="full" px={3}>CONFIRMATION</Badge>
                    <Heading size="xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">Secure Your Session</Heading>
                    <Text color="gray.500">Review your appointment details before proceeding to payment.</Text>
                 </VStack>

                 <Box bg="white" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="gray.100">
                    <VStack align="stretch" spacing={6}>
                       <HStack spacing={6}>
                          <Image src={profile.profile_image_url} boxSize="80px" borderRadius="2xl" objectFit="cover" />
                          <VStack align="start" spacing={0}>
                             <Text fontWeight="800" fontSize="lg">{profile.name}</Text>
                             <Text color="gray.500" fontSize="sm">{profile.title}</Text>
                          </VStack>
                       </HStack>

                       <Divider />

                       <VStack align="stretch" spacing={4}>
                          <HStack spacing={4}>
                             <Center bg="teal.50" boxSize={10} borderRadius="full" color="mlc.green"><Icon as={FiCalendar} /></Center>
                             <Text fontWeight="600">{dateStr}</Text>
                          </HStack>
                          <HStack spacing={4}>
                             <Center bg="teal.50" boxSize={10} borderRadius="full" color="mlc.green"><Icon as={FiClock} /></Center>
                             <Text fontWeight="600">{timeStr}</Text>
                          </HStack>
                          <HStack spacing={4}>
                             <Center bg="teal.50" boxSize={10} borderRadius="full" color="mlc.green"><Icon as={FiShield} /></Center>
                             <Text fontWeight="600">Therapy Session</Text>
                          </HStack>
                       </VStack>
                    </VStack>
                 </Box>
              </VStack>
           </Box>

           {/* Right: Payment */}
           <Box gridColumn={{ md: "span 2" }}>
              <VStack align="stretch" spacing={6} position="sticky" top="40px">
                 <Box bg="mlc.greenDark" color="white" p={8} borderRadius="3xl" shadow="2xl">
                    <VStack align="stretch" spacing={6}>
                       <Heading size="md" fontFamily="'Playfair Display', serif">Order Summary</Heading>
                       
                       <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" fontSize="sm" opacity={0.8}>
                             <Text>Clinical Consultation</Text>
                             <Text>INR {profile.hourly_rate || "45"}.00</Text>
                          </HStack>
                          <HStack justify="space-between" fontSize="sm" opacity={0.8}>
                             <Text>Administrative Fee</Text>
                             <Text>INR 0.00</Text>
                          </HStack>
                          <Divider borderColor="whiteAlpha.300" py={1} />
                          <HStack justify="space-between" fontSize="xl" fontWeight="800">
                             <Text>Total Payable</Text>
                             <Text>INR {profile.hourly_rate || "45"}.00</Text>
                          </HStack>
                       </VStack>

                       <Button 
                         w="full" h={16} bg="mlc.gold" color="white" borderRadius="full" fontSize="md" fontWeight="800"
                         leftIcon={<FiLock />}
                         isLoading={isProcessing}
                         loadingText="Connecting..."
                         _hover={{ bg: '#D4AF37', transform: 'scale(1.02)' }}
                         onClick={handlePayment}
                       >
                         Confirm & Pay
                       </Button>

                       <VStack spacing={2} pt={4}>
                          <HStack fontSize="2xs" opacity={0.6}>
                             <Icon as={FiShield} />
                             <Text>SECURE 256-BIT ENCRYPTION</Text>
                          </HStack>
                          <Text fontSize="2xs" opacity={0.5} textAlign="center">By paying, you agree to the MLC Clinical Terms & Cancellation Policy.</Text>
                       </VStack>
                    </VStack>
                 </Box>
                 
                 <Box p={6} borderRadius="2xl" border="1px dashed" borderColor="gray.300">
                    <HStack spacing={4}>
                       <Icon as={FiCheckCircle} color="mlc.green" boxSize={5} />
                       <Text fontSize="xs" color="gray.500">Your secure session invitation will be sent instantly after payment.</Text>
                    </HStack>
                 </Box>
              </VStack>
           </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
