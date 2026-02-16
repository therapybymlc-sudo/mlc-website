import { Box, Button, Heading, VStack, Text } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";

export default function TherapistLogin() {
  const { login } = useAuth();

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
        <Button
          bg="#A9CBB7"
          color="black"
          borderRadius="full"
          _hover={{ bg: "#C9A960", color: "white" }}
          onClick={login}
        >
          Login with Keycloak
        </Button>
      </VStack>
    </Box>
  );
}
