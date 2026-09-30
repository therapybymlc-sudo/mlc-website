import { Box, Heading, Text, HStack } from "@chakra-ui/react";

export default function ScheduleSectionCard({ title, subtitle, rightSlot, children }) {
  return (
    <Box 
      bg="#FFFFFF" 
      p={{ base: 5, md: 6 }} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
      w="100%"
    >
      {(title || subtitle || rightSlot) && (
        <HStack justify="space-between" align="flex-start" mb={5} spacing={4} flexWrap="wrap">
          <Box>
            {title ? (
              <Heading 
                fontSize="16px" 
                fontWeight="600" 
                color="#263A33" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                letterSpacing="-0.01em"
              >
                {title}
              </Heading>
            ) : null}
            {subtitle ? (
              <Text color="#5A6E65" mt={1} fontSize="13px" fontWeight="400">
                {subtitle}
              </Text>
            ) : null}
          </Box>
          {rightSlot ? <Box>{rightSlot}</Box> : null}
        </HStack>
      )}
      {children}
    </Box>
  );
}
