import { Box, Heading, Text, HStack } from "@chakra-ui/react";

export default function ScheduleSectionCard({ title, subtitle, rightSlot, children }) {
  return (
    <Box bg="white" p={{ base: 5, md: 6 }} borderRadius="2xl" boxShadow="md" w="100%">
      {(title || subtitle || rightSlot) && (
        <HStack justify="space-between" align="flex-start" mb={4} spacing={4} flexWrap="wrap">
          <Box>
            {title ? (
              <Heading size="md" fontFamily="Playfair Display">
                {title}
              </Heading>
            ) : null}
            {subtitle ? (
              <Text color="gray.600" mt={1} fontSize="sm">
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
