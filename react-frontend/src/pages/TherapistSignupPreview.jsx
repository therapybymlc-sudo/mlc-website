import { Box, Heading, Text, VStack, Tag } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignUp } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function TherapistSignupPreview() {
  useEffect(() => {
    localStorage.setItem("mlc_role_preview", "therapist");
    localStorage.setItem("mlc_signup_role", "therapist");
  }, []);

  return (
    <Box textAlign="center" py={20}>
      <Helmet>
        <title>Therapist Preview Sign Up | MLC Therapy</title>
        <meta
          name="description"
          content="Create a therapist preview account to explore the MLC therapist dashboard."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <VStack spacing={6}>
        <Tag colorScheme="purple" borderRadius="full">
          Therapist Preview
        </Tag>
        <Heading mb={2}>Create your therapist preview account</Heading>
        <Text color="gray.600" maxW="2xl">
          This gives you access to the basic therapist preview. Full access
          unlocks after your application is approved.
        </Text>
        <SignUp
          routing="path"
          path="/signup/therapist-preview"
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
        />
      </VStack>
    </Box>
  );
}
