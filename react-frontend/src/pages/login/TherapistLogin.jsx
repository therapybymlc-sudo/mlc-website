import { Box, Heading, VStack, Text, Button } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function TherapistLogin() {
  return (
    <Box textAlign="center" mt={20}>
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
        <Heading>Therapist Login</Heading>
        <Text>Secure access for therapists to manage clients and notes</Text>
        <SignIn routing="path" path="/login/therapist" afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
        <Text fontSize="sm" color="gray.500">
          Want to join as a therapist? Submit an application and we’ll review it.
        </Text>
        <Button as={Link} to="/therapist-apply" variant="outline" colorScheme="teal">
          Apply to be a therapist
        </Button>
      </VStack>
    </Box>
  );
}
