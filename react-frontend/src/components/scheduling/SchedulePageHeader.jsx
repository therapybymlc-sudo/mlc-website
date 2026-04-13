import { Box, Heading, Text, HStack } from "@chakra-ui/react";

export default function SchedulePageHeader({ title, subtitle, actions }) {
  return (
    <HStack align="flex-start" justify="space-between" spacing={4} w="100%" flexWrap="wrap">
      <Box>
        <Heading fontFamily="Playfair Display" size="lg">
          {title}
        </Heading>
        {subtitle ? (
          <Text color="gray.600" mt={2} maxW="2xl">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {actions ? <HStack spacing={2}>{actions}</HStack> : null}
    </HStack>
  );
}
