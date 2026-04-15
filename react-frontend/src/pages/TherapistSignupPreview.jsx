import { Box, Heading, Text, VStack, Tag } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";
import { SignUp } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function TherapistSignupPreview() {
  useEffect(() => {
    localStorage.setItem("mlc_signup_role", "therapist");
    localStorage.removeItem("mlc_role_preview");
  }, []);

  return (
    <Box textAlign="center" py={20}>
      <Helmet>
        <title>Therapist Sign Up | MLC Therapy</title>
        <meta
          name="description"
          content="Create your therapist account for the MLC therapist dashboard."
        />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <VStack spacing={6}>
        <Tag colorScheme="purple" borderRadius="full">Therapist</Tag>
        <Heading mb={2}>Create your therapist account</Heading>
        <Text color="gray.600" maxW="2xl">
          After sign up, your therapist role is stamped and your dashboard opens
          in verification mode until your provider status is approved.
        </Text>
        <SignUp
          routing="path"
          path="/signup/therapist"
          unsafeMetadata={{ role: "therapist" }}
          afterSignUpUrl="/dashboard"
          afterSignInUrl="/dashboard"
        />
      </VStack>
    </Box>
  );
}
