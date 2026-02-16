import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

function Reviews() {
  return (
    <Box textAlign="center" py={20}>
      <Helmet>
        <title>Client Reviews | MLC Health & Wellness Centre</title>
        <meta
          name="description"
          content="Read client experiences with MLC’s structured, ethical online therapy and clinician-led care."
        />
              <meta property="og:image" content="https://mlchealth.in/service3_new.jpg" />
        <meta name="twitter:image" content="https://mlchealth.in/service3_new.jpg" />
      </Helmet>
      <Heading mb={4}>Client Reviews</Heading>
      <VStack spacing={4}>
        <Text fontStyle="italic">“A truly healing experience.”</Text>
        <Text fontStyle="italic">“The therapists at MLC made me feel heard and understood.”</Text>
      </VStack>
    </Box>
  );
}

export default Reviews;
