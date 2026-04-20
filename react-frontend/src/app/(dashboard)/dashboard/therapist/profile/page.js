import dynamic from 'next/dynamic';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

// Nuclear option for hydration errors: Disable SSR for the profile hub
const ProfileClient = dynamic(() => import('./ProfileClient'), { 
  ssr: false,
  loading: () => (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#FAFAFA">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" color="#56756D" />
        <Text color="gray.500" fontFamily="'Playfair Display', serif">Initializing Hub...</Text>
      </VStack>
    </Box>
  )
});

export const metadata = {
  title: 'Clinical Profile | MLC Health',
  description: 'Update your professional biography, qualifications, and public-facing clinical profile.',
};

export default function Page() {
  return <ProfileClient />;
}
