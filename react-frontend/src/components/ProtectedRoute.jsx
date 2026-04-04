// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowRoles, allowPreviewRole }) {
  const { loading, isAuthenticated, roles } = useAuth();

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

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    const hasRole = roles?.some((role) => allowRoles.includes(role));
    const previewRole = localStorage.getItem("mlc_role_preview");
    const allowPreview =
      allowPreviewRole && previewRole && previewRole === allowPreviewRole;
    if (!hasRole && !allowPreview) {
      return <Navigate to="/dashboard/client" replace />;
    }
  }

  return children;
}
