"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useSyncExternalStore } from "react";

const PRODUCTION_HOSTS = new Set(["mlchealth.in", "www.mlchealth.in"]);
const emptyProps = {};

function subscribe() {
  return () => {};
}

function getPreviewProxyProps() {
  if (typeof window === "undefined") {
    return emptyProps;
  }

  if (PRODUCTION_HOSTS.has(window.location.hostname)) {
    return emptyProps;
  }

  return { proxyUrl: "/__clerk" };
}

export default function ClerkProviderWrapper({ children, appearance }) {
  const clerkProps = useSyncExternalStore(
    subscribe,
    getPreviewProxyProps,
    () => emptyProps
  );

  return (
    <ClerkProvider {...clerkProps} appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
