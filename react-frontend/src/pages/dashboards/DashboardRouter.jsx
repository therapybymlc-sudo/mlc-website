import { Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

export default function DashboardRouter() {
  const { loading, isAuthenticated, isTherapist, isTherapistPreview } = useAuth();

  if (loading) {
    return (
      <Center py={24}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/therapist" replace />;
  }

  return isTherapist || isTherapistPreview ? (
    <Navigate to="/dashboard/therapist" replace />
  ) : (
    <Navigate to="/dashboard/client" replace />
  );
}
