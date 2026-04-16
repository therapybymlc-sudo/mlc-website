import { Box, Heading, VStack, Text, Button, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function RoleSelectionLogin() {
  return (
    <Box textAlign="center" mt={20} mb={20}>
      <Helmet>
        <title>Sign In | MLC Health & Wellness Centre</title>
      </Helmet>
      <VStack spacing={8}>
        <Heading>Welcome Back</Heading>
        <Text>Please select your account type to sign in.</Text>
        <Flex gap={6} flexWrap="wrap" justify="center" px={4} w="full" maxW="800px" mx="auto">
          <Box p={8} borderWidth={1} borderRadius="lg" bg="white" shadow="md" _hover={{ shadow: "xl", borderColor: "teal.400" }} transition="all 0.2s" flex="1" minW="280px">
            <Heading size="md" mb={4}>Client</Heading>
            <Text color="gray.600" mb={6}>Access your secure therapy dashboard, upcoming appointments, and session notes.</Text>
            <Button as={Link} to="/login/client" bg="#A9CBB7" color="#2E2E2E" _hover={{ bg: "#56756D", color: "white" }} size="lg" w="full">
              Sign in as Client
            </Button>
          </Box>
          <Box p={8} borderWidth={1} borderRadius="lg" bg="white" shadow="md" _hover={{ shadow: "xl", borderColor: "purple.400" }} transition="all 0.2s" flex="1" minW="280px">
            <Heading size="md" mb={4}>Therapist</Heading>
            <Text color="gray.600" mb={6}>Manage your practice, client information, schedules, and more.</Text>
            <Button as={Link} to="/login/therapist" bg="#C9A960" color="white" _hover={{ bg: "#56756D", color: "white" }} size="lg" w="full">
              Sign in as Therapist
            </Button>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
}
