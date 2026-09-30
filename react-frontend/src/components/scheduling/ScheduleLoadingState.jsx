import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";

export default function ScheduleLoadingState({ label }) {
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid rgba(86, 117, 109, 0.14)" 
      boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)" 
      w="100%"
    >
      {label ? <Skeleton height="18px" maxW="240px" mb={4} borderRadius="md" /> : null}
      <SkeletonText noOfLines={4} spacing={3} skeletonHeight="14px" />
    </Box>
  );
}
