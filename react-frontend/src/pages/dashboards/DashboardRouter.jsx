import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Center, Spinner, Box, Heading, Text, Button, VStack, useToast } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { apiPost } from "../../api";

export default function DashboardRouter() {
  const { loading, isAuthenticated, isTherapist, roles } = useAuth();
  const [onboarding, setOnboarding] = useState(false);
  const toast = useToast();

  const hasExplicitRole = Array.isArray(roles) && roles.length > 0;
  const needsOnboarding = isAuthenticated && !hasExplicitRole;

  const handleSelectRole = async (role) => {
    setOnboarding(true);
    try {
      await apiPost("/onboard/", { role });
      localStorage.setItem("mlc_signup_role", role);
      localStorage.removeItem("mlc_role_preview");
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't set role." });
      setOnboarding(false);
    }
  };

  if (loading || onboarding) {
    return (
      <Center py={24}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/therapist" replace />;
  }

  if (needsOnboarding) {
    return (
      <Center py={24} h="100vh" bg="gray.50">
        <Box bg="white" p={8} borderRadius="xl" boxShadow="lg" maxW="md" textAlign="center">
          <Heading size="lg" mb={4}>Select your Path</Heading>
          <Text color="gray.600" mb={8}>
            Are you joining therapy by MLC as a practitioner or a client?
          </Text>
          <VStack spacing={4}>
            <Button w="100%" size="lg" colorScheme="teal" onClick={() => handleSelectRole("client")}>
              Client
            </Button>
            <Button w="100%" size="lg" variant="outline" colorScheme="teal" onClick={() => handleSelectRole("therapist")}>
              Practitioner
            </Button>
          </VStack>
        </Box>
      </Center>
    );
  }

  return isTherapist ? (
    <Navigate to="/dashboard/therapist" replace />
  ) : (
    <Navigate to="/dashboard/client" replace />
  );
}

