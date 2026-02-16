import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

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
      <Heading mb={4}>Therapist Portal</Heading>
      <Text fontSize="lg" color="gray.600" mb={6}>
        Private login area for MLC Therapists.  
        Once integrated, this will connect to your Keycloak authentication.
      </Text>
      <Button colorScheme="blue" size="lg">Login</Button>
    </Box>
  );
}

export default TherapistLogin;
