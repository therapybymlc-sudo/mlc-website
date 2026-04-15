import { Box, Heading, Text, VStack, Button, HStack } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function TherapistLogin() {
  return (
    <Box textAlign="center" py={20}>
      <Helmet>
        <title>Therapist Login | MLC Health & Wellness Centre</title>
        <meta
          name="description"
          content="Secure therapist portal login for managing clients, notes, and appointments."
        />
        <meta name="robots" content="noindex,nofollow" />
              <meta property="og:image" content="https://mlchealth.in/logo_tra.png" />
        <meta name="twitter:image" content="https://mlchealth.in/logo_tra.png" />
      </Helmet>
      <VStack spacing={6}>
        <Heading mb={2}>Therapist Portal</Heading>
        <Text fontSize="lg" color="gray.600" mb={2}>
          Private login area for MLC Therapists.
        </Text>
        <SignIn routing="path" path="/login/therapist" afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
        <Text fontSize="sm" color="gray.500">
          Don’t have an account?
        </Text>
        <HStack spacing={3} flexWrap="wrap" justify="center">
          <Button as={Link} to="/therapist-apply" variant="outline" colorScheme="teal">
            Apply to be a therapist
          </Button>
          <Button as={Link} to="/signup/client" colorScheme="purple" variant="solid">
            Sign up as a client
          </Button>
        </HStack>
        <Button as={Link} to="/signup/therapist" variant="ghost">
          Sign up as a therapist
        </Button>
      </VStack>
    </Box>
  );
}

export default TherapistLogin;
