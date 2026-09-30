import { Box, Heading, Text, Flex, HStack, VStack, Badge, Circle, Icon } from "@chakra-ui/react";
import { FiBookOpen } from "react-icons/fi";

export default function SchedulePageHeader({ title, subtitle, badge = "Clinical Resources", icon = FiBookOpen, actions }) {
  return (
    <Box
      bg="white"
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      border="1px solid"
      borderColor="rgba(86, 117, 109, 0.14)"
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
      mb={1}
      w="100%"
    >
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'start', md: 'center' }} 
        gap={4}
      >
        {/* Identity & Title */}
        <HStack spacing={3.5} align="center">
          <Box position="relative" flexShrink={0}>
            <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
              <Icon as={icon} boxSize="22px" />
            </Circle>
            <Circle 
              size="11px" 
              bg="#10B981" 
              border="2px solid white" 
              position="absolute" 
              bottom="0" 
              right="0" 
            />
          </Box>

          <VStack align="start" spacing={0.5}>
            {badge && (
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(86, 117, 109, 0.12)" 
                  color="#56756D" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  textTransform="uppercase" 
                  letterSpacing="0.08em"
                >
                  {badge}
                </Badge>
              </HStack>
            )}
            <Heading 
              as="h1"
              fontSize={{ base: "21px", sm: "25px" }} 
              fontWeight="600" 
              color="#263A33" 
              letterSpacing="-0.015em"
              fontFamily="'Outfit', var(--font-outfit), sans-serif"
              lineHeight="1.25"
            >
              {title}
            </Heading>
            {subtitle ? (
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                {subtitle}
              </Text>
            ) : null}
          </VStack>
        </HStack>
        {actions ? <HStack spacing={2} flexShrink={0}>{actions}</HStack> : null}
      </Flex>
    </Box>
  );
}
