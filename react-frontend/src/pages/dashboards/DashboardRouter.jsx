import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Center, Spinner, Box, Heading, Text, Button, VStack, useToast } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../api";

export default function DashboardRouter() {
  const { loading, isAuthenticated, isTherapist, isTherapistPreview } = useAuth();
  const [onboarding, setOnboarding] = useState(false);
  const [checkingProfiles, setCheckingProfiles] = useState(true);
  const [hasTherapistProfile, setHasTherapistProfile] = useState(false);
  const [hasClientProfile, setHasClientProfile] = useState(false);
  const toast = useToast();

  const savedRole = localStorage.getItem("mlc_signup_role") || localStorage.getItem("mlc_role_preview");
  useEffect(() => {
    let mounted = true;
    const checkProfiles = async () => {
      if (!isAuthenticated) {
        if (mounted) setCheckingProfiles(false);
        return;
      }
      setCheckingProfiles(true);
      try {
        const [therapistsRes, clientsRes] = await Promise.all([
          apiGet("/therapists/"),
          apiGet("/clients/"),
        ]);
        const therapistList = Array.isArray(therapistsRes)
          ? therapistsRes
          : therapistsRes?.results || [];
        const clientList = Array.isArray(clientsRes) ? clientsRes : clientsRes?.results || [];
        if (!mounted) return;
        setHasTherapistProfile(therapistList.length > 0);
        setHasClientProfile(clientList.length > 0);
      } catch {
        if (!mounted) return;
        setHasTherapistProfile(false);
        setHasClientProfile(false);
      } finally {
        if (mounted) setCheckingProfiles(false);
      }
    };
    checkProfiles();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const needsOnboarding = isAuthenticated && !checkingProfiles && !hasTherapistProfile && !hasClientProfile;

  const handleSelectRole = async (role) => {
    setOnboarding(true);
    try {
      await apiPost("/onboard/", { role });
      localStorage.setItem("mlc_signup_role", role);
      localStorage.setItem("mlc_role_preview", role);
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast({ status: "error", title: "Couldn't set role." });
      setOnboarding(false);
    }
  };

  if (loading || onboarding || checkingProfiles) {
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

  return isTherapist || isTherapistPreview || hasTherapistProfile || savedRole === "therapist" ? (
    <Navigate to="/dashboard/therapist" replace />
  ) : (
    <Navigate to="/dashboard/client" replace />
  );
}

