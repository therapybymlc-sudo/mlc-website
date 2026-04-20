import CheckoutClient from "./CheckoutClient";
import { Suspense } from "react";
import { Box, Spinner, Center } from "@chakra-ui/react";

export const metadata = {
  title: "Secure Checkout | MLC Health",
  description: "Confirm your session booking with our clinical specialists.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Center h="100vh"><Spinner size="xl" color="mlc.green" /></Center>}>
      <CheckoutClient />
    </Suspense>
  );
}
