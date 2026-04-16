import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { Box, Flex } from '@chakra-ui/react'

export default function MarketingLayout({ children }) {
  return (
    <Flex direction="column" minH="100vh" bg="rgba(169, 203, 183, 0.12)">
      <Navbar />
      <Box as="main" flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  )
}
