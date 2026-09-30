import { Box, Text, VStack, Circle, Icon } from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";

export default function ScheduleEmptyState({ icon, title, description }) {
  return (
    <VStack 
      spacing={3} 
      py={{ base: 7, md: 8 }} 
      px={6} 
      textAlign="center" 
      bg="rgba(86, 117, 109, 0.025)" 
      borderRadius="xl" 
      border="1px dashed rgba(86, 117, 109, 0.2)"
    >
      <Circle size="46px" bg="rgba(86, 117, 109, 0.08)">
        <Icon as={icon || FiFolder} color="#56756D" boxSize="18px" />
      </Circle>
      <Text 
        fontSize="15px" 
        fontWeight="600" 
        color="#263A33" 
        fontFamily="'Outfit', var(--font-outfit), sans-serif"
      >
        {title}
      </Text>
      {description ? (
        <Text fontSize="13px" color="#5A6E65" maxW="380px" lineHeight="1.5">
          {description}
        </Text>
      ) : null}
    </VStack>
  );
}
