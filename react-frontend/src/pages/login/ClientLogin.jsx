import { Box, Heading, VStack, Text, Button } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function ClientLogin() {
  return (
    <Box textAlign="center" mt={20} mb={20}>
      <Helmet>
        <title>Client Login | MLC Health & Wellness Centre</title>
        <meta
          name="description"
          content="Secure client portal login for your therapy dashboard."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <VStack spacing={6}>
        <Heading>Client Login</Heading>
        <Text>Secure access to your private dashboard</Text>
        <SignIn 
           routing="path" 
           path="/login/client" 
           signUpUrl="/signup/client"
           afterSignInUrl="/dashboard" 
           afterSignUpUrl="/dashboard" 
        />
      </VStack>
    </Box>
  );
}
