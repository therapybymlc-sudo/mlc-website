import { Box, Text, Button, VStack } from "@chakra-ui/react";

export default function ScheduleErrorState({ description, onRetry }) {
  return (
    <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
      <VStack spacing={3} align="start">
        <Text fontWeight="semibold" color="red.600">
          Something went wrong
        </Text>
        <Text color="gray.600" fontSize="sm">
          {description || "We couldn’t load this scheduling data."}
        </Text>
        {onRetry ? (
          <Button size="sm" onClick={onRetry} colorScheme="purple" borderRadius="full">
            Retry
          </Button>
        ) : null}
      </VStack>
    </Box>
  );
}
