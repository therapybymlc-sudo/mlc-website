import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";// ✅ if you’re using it
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPublishableKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : null) || 
                          (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY : null);

if (!clerkPublishableKey) {
  console.warn("Missing Clerk Publishable Key. Auth will not work.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
