// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

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

  return children;
}