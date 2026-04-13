import { HStack } from "@chakra-ui/react";

export default function ScheduleActionBar({ children, ...props }) {
  return (
    <HStack spacing={3} flexWrap="wrap" {...props}>
      {children}
    </HStack>
  );
}
