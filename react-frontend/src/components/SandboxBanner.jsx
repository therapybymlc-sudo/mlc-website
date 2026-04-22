import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Icon, CloseButton } from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";
import { apiGet } from "../api";

const SandboxBanner = () => {
  const [env, setEnv] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkEnv = async () => {
      try {
        const data = await apiGet("config/");
        setEnv(data.environment);
      } catch (error) {
        console.error("Failed to fetch environment config:", error);
      }
    };

    checkEnv();
  }, []);

  if (!isVisible || env !== "sandbox") {
    return null;
  }

  return (
    <Box
      bgGradient="linear(to-r, orange.400, red.400)"
      color="white"
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex={2000}
      boxShadow="0 2px 10px rgba(0,0,0,0.1)"
    >
      <Flex align="center" justify="center" maxW="container.xl" mx="auto">
        <Icon as={FiAlertTriangle} mr={3} w={5} h={5} />
        <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">
          SANDBOX ENVIRONMENT — DATA IS FOR TESTING PURPOSES ONLY
        </Text>
        <CloseButton 
          size="sm" 
          position="absolute" 
          right={4} 
          onClick={() => setIsVisible(false)} 
        />
      </Flex>
    </Box>
  );
};

export default SandboxBanner;
