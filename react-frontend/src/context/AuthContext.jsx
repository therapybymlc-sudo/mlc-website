import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/clerk-react";
import api from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const tokenTemplate = import.meta.env.VITE_CLERK_JWT_TEMPLATE;

  const roles = useMemo(() => {
    const metaRoles = user?.publicMetadata?.roles;
    if (Array.isArray(metaRoles)) return metaRoles;
    if (user?.publicMetadata?.role) return [user.publicMetadata.role];
    return [];
  }, [user]);

  const premiumPreviewEnabled = import.meta.env.VITE_PREMIUM_PREVIEW === "true";
  const isAdmin = roles.includes("admin");
  const isTherapist = isAdmin || roles.includes("therapist");
  const isClient = !isTherapist;
  const isPremium = premiumPreviewEnabled || isAdmin || roles.includes("premium");

  useEffect(() => {
    let isMounted = true;
    const syncToken = async () => {
      try {
        if (!isLoaded) return;
        if (!isSignedIn) {
          if (isMounted) {
            localStorage.removeItem("access_token");
            delete api.defaults.headers.Authorization;
          }
          return;
        }
        const token = await getToken(
          tokenTemplate ? { template: tokenTemplate } : undefined
        );
        if (isMounted) {
          if (token) {
            localStorage.setItem("access_token", token);
            api.defaults.headers.Authorization = `Bearer ${token}`;
          } else {
            localStorage.removeItem("access_token");
            delete api.defaults.headers.Authorization;
          }
        }
      } catch (e) {
        console.warn("Clerk token sync failed", e);
      }
    };
    syncToken();
    return () => {
      isMounted = false;
    };
  }, [getToken, isLoaded, isSignedIn, tokenTemplate]);

  const login = () =>
    clerk.redirectToSignIn({
      redirectUrl: `${window.location.origin}/dashboard`,
    });

  const logout = () =>
    clerk.signOut({
      redirectUrl: window.location.origin,
    });

  const token = localStorage.getItem("access_token");

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!isSignedIn,
        user,
        loading: !isLoaded,
        login,
        logout,
        token,
        roles,
        isAdmin,
        isTherapist,
        isClient,
        isPremium,
        clerk,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
