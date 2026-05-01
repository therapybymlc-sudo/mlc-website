'use client'

import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

export default function SupervisorDirectoryLoading() {
  return (
    <Center minH="50vh" bg="#FDFBFA">
      <VStack spacing={4}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="teal.500" size="xl" />
        <Text fontWeight="600" color="gray.500">
          Loading supervisors…
        </Text>
      </VStack>
    </Center>
  )
}
