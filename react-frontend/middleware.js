import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/about(.*)",
  "/meettheteam(.*)",
  "/careers(.*)",
  "/therapist-apply(.*)",
  "/services(.*)",
  "/contactus(.*)",
  "/individual-therapy(.*)",
  "/couples-therapy(.*)",
  "/adolescent-therapy(.*)",
  "/supervision(.*)",
  "/workshops(.*)",
  "/therapists(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/book(.*)",
  "/api(.*)",
  "/ecosystem(.*)",
  "/blog(.*)",
  "/feelings-wheel(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
