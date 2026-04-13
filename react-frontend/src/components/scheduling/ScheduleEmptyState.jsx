import { Box, Text } from "@chakra-ui/react";

export default function ScheduleEmptyState({ title, description }) {
  return (
    <Box textAlign="center" py={6} color="gray.500">
      <Text fontWeight="semibold">{title}</Text>
      {description ? <Text fontSize="sm" mt={2}>{description}</Text> : null}
    </Box>
  );
}
