import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { formatDateRange } from "../../utils/scheduling";

export default function ScheduleDateTimeCard({ title, start, end, rightSlot, description }) {
  return (
    <Box
      p={4}
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.100"
      bg="gray.50"
    >
      <HStack justify="space-between" align="flex-start" spacing={4} flexWrap="wrap">
        <VStack align="start" spacing={1} flex={1} minW="200px">
          <Text fontWeight="semibold">{title}</Text>
          <Text color="gray.600" fontSize="sm">
            {formatDateRange(start, end)}
          </Text>
          {description ? (
            <Text color="gray.500" fontSize="sm">
              {description}
            </Text>
          ) : null}
        </VStack>
        {rightSlot ? <Box>{rightSlot}</Box> : null}
      </HStack>
    </Box>
  );
}
