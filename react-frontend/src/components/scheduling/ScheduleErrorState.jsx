import { Box, Text, Button, VStack } from "@chakra-ui/react";

export default function ScheduleErrorState({ description, onRetry }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid rgba(239, 68, 68, 0.2)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
      w="100%"
    >
      <VStack spacing={3} align="start">
        <Text 
          fontWeight="600" 
          color="#B91C1C" 
          fontSize="15px"
          fontFamily="'Outfit', var(--font-outfit), sans-serif"
        >
          Something went wrong
        </Text>
        <Text color="#5A6E65" fontSize="13px">
          {description || "We couldn’t load this scheduling data."}
        </Text>
        {onRetry ? (
          <Button 
            size="sm" 
            onClick={onRetry} 
            bg="#56756D" 
            color="white" 
            borderRadius="full" 
            fontSize="12.5px"
            fontWeight="600"
            _hover={{ bg: "#263A33" }}
          >
            Retry
          </Button>
        ) : null}
      </VStack>
    </Box>
  );
}
