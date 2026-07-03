"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const PRODUCTION_HOSTS = new Set(["mlchealth.in", "www.mlchealth.in"]);

function getPreviewProxyProps() {
  if (typeof window === "undefined") {
    return {};
  }

  if (PRODUCTION_HOSTS.has(window.location.hostname)) {
    return {};
  }

  return { proxyUrl: "/__clerk" };
}

export default function ClerkProviderWrapper({ children, appearance }) {
  const [clerkProps, setClerkProps] = useState({});

  useEffect(() => {
    setClerkProps(getPreviewProxyProps());
  }, []);

  return (
    <ClerkProvider {...clerkProps} appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
