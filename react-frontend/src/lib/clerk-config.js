const PRODUCTION_HOSTS = new Set(["mlchealth.in", "www.mlchealth.in"]);

function resolveHost() {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return vercelUrl.replace(/^https?:\/\//, "").split("/")[0];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      return "";
    }
  }

  return "";
}

export function getClerkProviderProps() {
  const domain = (process.env.NEXT_PUBLIC_CLERK_DOMAIN || "").trim();
  const host = resolveHost();
  const isProductionHost = PRODUCTION_HOSTS.has(host);

  if (isProductionHost && domain) {
    const signInUrl =
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "https://mlchealth.in/login";
    const signUpUrl =
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "https://mlchealth.in/signup";

    return {
      isSatellite: true,
      domain,
      signInUrl,
      signUpUrl,
    };
  }

  // Preview / local dev: Clerk must use the same-origin /__clerk proxy
  // (accounts.mlchealth.in blocks cross-origin requests from *.vercel.app).
  return {
    proxyUrl: "/__clerk",
  };
}
