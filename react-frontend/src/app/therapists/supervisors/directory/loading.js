'use client'

import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

export default function SupervisorDirectoryLoading() {
  return (
    <Center minH="50vh" bg="#FDFBFA">
      <VStack spacing={4}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.100" color="#6B8B7B" size="xl" />
        <Text fontWeight="600" color="rgba(46,46,46,0.6)">
          Loading supervisors…
        </Text>
      </VStack>
    </Center>
  )
}
