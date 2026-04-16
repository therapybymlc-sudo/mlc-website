'use client'

import { Button } from "@chakra-ui/react";
import NextLink from "next/link";

export default function LinkButton({ href, children, ...props }) {
  return (
    <Button as={NextLink} href={href} {...props}>
      {children}
    </Button>
  );
}
