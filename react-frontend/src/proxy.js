import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const PRODUCTION_HOSTS = new Set(["mlchealth.in", "www.mlchealth.in"]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/conference(.*)",
  "/book/checkout(.*)",
]);

function shouldProxyClerkFrontendApi(url) {
  return !PRODUCTION_HOSTS.has(url.hostname);
}

export default clerkMiddleware(
  {
    frontendApiProxy: {
      enabled: shouldProxyClerkFrontendApi,
    },
  },
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
