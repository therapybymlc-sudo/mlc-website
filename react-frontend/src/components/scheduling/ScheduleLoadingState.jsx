import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";

export default function ScheduleLoadingState({ label }) {
  return (
    <Box bg="white" p={6} borderRadius="2xl" boxShadow="md" w="100%">
      {label ? <Skeleton height="18px" maxW="240px" mb={4} /> : null}
      <SkeletonText noOfLines={4} spacing={3} />
    </Box>
  );
}
