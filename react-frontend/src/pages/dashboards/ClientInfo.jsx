import { useOutletContext } from "react-router-dom";
import { Heading, Text, SimpleGrid, Box } from "@chakra-ui/react";

export default function ClientInfo() {
  const { client } = useOutletContext();

  return (
    <Box>
      <Heading size="md" mb={4} fontFamily="Playfair Display">Client Details</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <InfoItem label="Name" value={client.name} />
        <InfoItem label="Email" value={client.email} />
        {client.therapist?.name && <InfoItem label="Therapist" value={client.therapist.name} />}
      </SimpleGrid>
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Text fontSize="sm" color="gray.500">{label}</Text>
      <Text fontWeight="medium">{value || "-"}</Text>
    </Box>
  );
}
