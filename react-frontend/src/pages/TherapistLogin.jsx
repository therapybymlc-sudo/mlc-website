import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignIn } from "@clerk/clerk-react";

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
        <SignIn routing="path" path="/login/therapist" />
      </VStack>
    </Box>
  );
}

export default TherapistLogin;
