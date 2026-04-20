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

export default function CheckoutClient() {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const therapistId = searchParams.get('therapist');
  const slotId = searchParams.get('slot');

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [slot, setSlot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!therapistId || !slotId) return;

    const fetchData = async () => {
      try {
        // Fetch Profile
        const profileRes = await fetch(`https://api.mlchealth.in/api/therapists/${therapistId}/`);
        // Fetch All Slots (to find our specific one)
        const slotRes = await fetch(`https://api.mlchealth.in/api/availability-slots/public/?therapist=${therapistId}`);
        
        if (profileRes.ok && slotRes.ok) {
          const profileData = await profileRes.json();
          const slotsData = await slotRes.json();
          
          setProfile(profileData);
          // Find our specific slot from the list
          const foundSlot = (slotsData.results || slotsData).find(s => String(s.id).includes(slotId) || s.id == slotId);
          setSlot(foundSlot);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [therapistId, slotId]);

  const handlePayment = () => {
    if (!window.Razorpay) {
      toast({ title: "Payment system loading...", status: "info" });
      return;
    }
    
    setIsProcessing(true);

    const options = {
      key: "rzp_test_MLCPlaceholder", // 🛑 Replace with your real Key ID
      amount: (profile?.hourly_rate || 45) * 100, // Amount in paise
      currency: "INR",
      name: "MLC Health",
      description: `Session with ${profile?.name}`,
      image: "https://www.mlchealth.in/logo.png",
      handler: async function (response) {
        // SUCCESS: Handled after payment
        toast({
          title: "Payment Successful!",
          description: "Your session is confirmed. Check your email for details.",
          status: "success",
          duration: 8000
        });
        // Lead them back to a success page or dashboard
        setTimeout(() => window.location.href = "/dashboard/client/appointments", 2000);
      },
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      theme: {
        color: "#56756D" // MLC Green
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsProcessing(false);
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
                             <Text fontWeight="600">60-Minute Relational Therapy</Text>
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
                             <Text>KD {profile.hourly_rate || "45"}.00</Text>
                          </HStack>
                          <HStack justify="space-between" fontSize="sm" opacity={0.8}>
                             <Text>Administrative Fee</Text>
                             <Text>KD 0.00</Text>
                          </HStack>
                          <Divider borderColor="whiteAlpha.300" py={1} />
                          <HStack justify="space-between" fontSize="xl" fontWeight="800">
                             <Text>Total Payable</Text>
                             <Text>KD {profile.hourly_rate || "45"}.00</Text>
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
                       <Text fontSize="xs" color="gray.500">Your session invitation (Jitsi link) will be sent instantly after payment.</Text>
                    </HStack>
                 </Box>
              </VStack>
           </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
