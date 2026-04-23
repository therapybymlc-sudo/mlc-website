import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignUp } from "@clerk/clerk-react";

export default function ClientSignup() {
  return (
    <Box textAlign="center" py={20}>
      <Helmet>
        <title>Client Sign Up | MLC Therapy</title>
        <meta
          name="description"
          content="Create your client account to access your MLC Therapy dashboard."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <VStack spacing={6}>
        <Heading mb={2}>Create your client account</Heading>
        <Text color="gray.600">
          Sign up to access your private dashboard, check-ins, and session prep resources.
        </Text>
        <SignUp
          routing="path"
          path="/signup/client"
          unsafeMetadata={{ role: "client" }}
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
        />
      </VStack>
    </Box>
  );
}
