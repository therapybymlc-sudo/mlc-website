import { Box, Container, Heading, VStack, SimpleGrid, Button, Text, Icon } from "@chakra-ui/react";
import { FiUser, FiHeart } from "react-icons/fi";
import NextLink from 'next/link';

export const metadata = {
  title: 'Login | MLC Health & Wellness Centre',
}

export default function LoginPage() {
  return (
    <Box bg="rgba(169, 203, 183, 0.12)" minH="100vh" py={20}>
      <Container maxW="4xl">
        <VStack spacing={10} textAlign="center">
          <VStack spacing={4}>
            <Heading size="2xl" color="mlc.greenDark" fontFamily="'Playfair Display', serif">
              Welcome to the MLC Portal
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Please select your account type to continue to your dashboard.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="100%">
            {/* Client Portal */}
            <Box
              as={NextLink}
              href="/login/client"
              bg="white"
              p={10}
              borderRadius="3xl"
              shadow="xl"
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
              textAlign="center"
            >
              <VStack spacing={6}>
                <Box bg="mlc.peachHighlight" p={5} borderRadius="full">
                  <Icon as={FiHeart} w={10} h={10} color="mlc.gold" />
                </Box>
                <VStack spacing={2}>
                  <Heading size="lg" color="mlc.greenDark">Client Portal</Heading>
                  <Text color="gray.500">Access your sessions, resources, and progress tools.</Text>
                </VStack>
                <Button bg="mlc.green" color="white" w="100%" borderRadius="full">
                  Client Login
                </Button>
              </VStack>
            </Box>

            {/* Therapist Portal */}
            <Box
                as={NextLink}
                href="/login/therapist"
                bg="white"
                p={10}
                borderRadius="3xl"
                shadow="xl"
                transition="all 0.3s ease"
                _hover={{ transform: "translateY(-8px)", shadow: "2xl" }}
                textAlign="center"
            >
              <VStack spacing={6}>
                <Box bg="#E9F2ED" p={5} borderRadius="full">
                  <Icon as={FiUser} w={10} h={10} color="mlc.green" />
                </Box>
                <VStack spacing={2}>
                  <Heading size="lg" color="mlc.greenDark">Therapist Portal</Heading>
                  <Text color="gray.500">Manage your clients, schedule, and clinical notes.</Text>
                </VStack>
                <Button variant="outline" borderColor="mlc.green" color="mlc.green" w="100%" borderRadius="full">
                    Therapist Login
                </Button>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
