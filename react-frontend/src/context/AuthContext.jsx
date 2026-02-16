import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import Keycloak from "keycloak-js";

// --- Create ONE Keycloak instance at module scope (singleton)
let keycloakInstance = new Keycloak({
  url: "http://localhost:8080/",
  realm: "mlc-realm",
  clientId: "mlc-frontend",
});

// A shared promise prevents calling init twice (StrictMode-safe)
let initPromise = null;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- INIT (once)
  useEffect(() => {
    if (!initPromise) {
      initPromise = keycloakInstance.init({
        onLoad: "check-sso", // don't force login initially
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      });
    }

    initPromise
      .then(async (authenticated) => {
        setIsAuthenticated(authenticated);

        if (authenticated) {
          try {
            if (keycloakInstance.token) {
              localStorage.setItem("access_token", keycloakInstance.token);
              api.defaults.headers.Authorization = `Bearer ${keycloakInstance.token}`;
            }
            const profile = await keycloakInstance.loadUserProfile();
            setUser(profile);
          } catch (e) {
            console.error("Failed to load user profile", e);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("🔴 Keycloak init failed:", err);
        setLoading(false);
      });

    // Optional: background token refresh
    const refresh = setInterval(async () => {
      try {
        if (keycloakInstance && keycloakInstance.token) {
          const refreshed = await keycloakInstance.updateToken(60); // refresh if < 60s remaining
          if (refreshed && keycloakInstance.token) {
            localStorage.setItem("access_token", keycloakInstance.token);
            api.defaults.headers.Authorization = `Bearer ${keycloakInstance.token}`;
          }
        }
      } catch (e) {
        console.warn("Token refresh failed", e);
      }
    }, 30_000);

    return () => clearInterval(refresh);
  }, []);

  // --- Role extraction helper
  const getUserRoles = () => {
    if (!keycloakInstance?.tokenParsed?.realm_access) return [];
    return keycloakInstance.tokenParsed.realm_access.roles || [];
  };

  const roles = getUserRoles();
  const isAdmin = roles.includes("admin"); // your Keycloak admin role

  // ---- Auth API we expose to the app
  const login = () =>
    keycloakInstance.login({
      redirectUri: `${window.location.origin}/dashboard/therapist`,
    });

  const logout = () =>
    keycloakInstance.logout({
      redirectUri: window.location.origin,
    });

  const token = keycloakInstance.token ?? null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        token,
        roles,
        isAdmin,
        keycloak: keycloakInstance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
