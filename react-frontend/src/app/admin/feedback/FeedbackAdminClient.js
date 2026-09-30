'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Stack,
  Badge,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Tag,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  useToast,
  Divider,
  Tooltip,
  Circle
} from "@chakra-ui/react";
import { 
  FiSearch, 
  FiChevronDown, 
  FiMessageSquare, 
  FiSettings, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiTrendingUp, 
  FiZap, 
  FiLayout,
  FiFilter
} from "react-icons/fi";
import { apiGet, apiPatch } from "../../../api";
import ModernSelect from "../../../components/ModernSelect";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "ui_ux", label: "UI / UX Design" },
  { value: "feature", label: "Feature Requests" },
  { value: "clinical", label: "Clinical Tools" },
  { value: "bug", label: "Bugs & Issues" },
  { value: "general", label: "General Feedback" }
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New (Unreviewed)" },
  { value: "reviewed", label: "Reviewed" },
  { value: "planned", label: "Planned" },
  { value: "implemented", label: "Implemented" },
  { value: "dismissed", label: "Dismissed" }
];

export default function FeedbackAdminClient() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [filterPath, setFilterPath] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await apiGet("feedback/");
      setFeedback(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      toast({ title: "Error", description: "Could not load feedback.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await apiPatch(`feedback/${id}/`, { status: newStatus });
      toast({ 
        title: "Status Updated", 
        description: `Feedback moved to ${newStatus}.`, 
        status: "success", 
        duration: 2000 
      });
      fetchFeedback();
    } catch (error) {
      toast({ title: "Update failed", description: "Could not change status.", status: "error" });
    }
  };

  const filteredFeedback = feedback.filter(f => {
    const matchesPath = !filterPath || (f.page_path || "").toLowerCase().includes(filterPath.toLowerCase());
    const matchesCategory = filterCategory === "all" || f.category === filterCategory;
    const matchesStatus = filterStatus === "all" || f.status === filterStatus;
    const matchesSearch = !searchQuery || f.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesCategory && matchesStatus && matchesSearch;
  });

  const stats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'new').length,
    implemented: feedback.filter(f => f.status === 'implemented').length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return { bg: "rgba(245, 158, 11, 0.12)", color: "#D97706", label: "NEW" };
      case 'reviewed':
        return { bg: "rgba(99, 102, 241, 0.12)", color: "#4F46E5", label: "REVIEWED" };
      case 'planned':
        return { bg: "rgba(49, 130, 206, 0.12)", color: "#3182CE", label: "PLANNED" };
      case 'implemented':
        return { bg: "rgba(16, 185, 129, 0.12)", color: "#059669", label: "IMPLEMENTED" };
      case 'dismissed':
      default:
        return { bg: "rgba(86, 117, 109, 0.12)", color: "#56756D", label: "DISMISSED" };
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      ui_ux: FiLayout,
      feature: FiZap,
      clinical: FiSettings,
      bug: FiXCircle,
      general: FiMessageSquare
    };
    return icons[cat] || FiMessageSquare;
  };

  if (loading && feedback.length === 0) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <VStack spacing={3}>
          <Spinner size="xl" thickness="3px" color="#56756D" />
          <Text fontSize="13px" color="#5A6E65">Loading Improvement Architect...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 UNIFIED HERO BANNER (Rule 8 & 10) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Identity & Space Title */}
          <HStack spacing={3.5} align="center">
            <Circle size="46px" bg="rgba(99, 102, 241, 0.12)" color="#4338CA" flexShrink={0}>
              <Icon as={FiTrendingUp} boxSize="22px" />
            </Circle>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2}>
                <Badge 
                  bg="rgba(99, 102, 241, 0.12)" 
                  color="#4338CA" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  Quality Engine • Feedback
                </Badge>
                {stats.new > 0 && (
                  <Badge 
                    bg="#FEF3C7" 
                    color="#92400E" 
                    fontSize="10px" 
                    fontWeight="700" 
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    ⚡ {stats.new} Awaiting Review
                  </Badge>
                )}
              </HStack>

              <Heading 
                as="h1" 
                fontSize={{ base: "21px", sm: "25px" }}
                fontFamily="'Outfit', var(--font-outfit), sans-serif"
                color="#263A33" 
                fontWeight="600" 
                lineHeight="1.25"
                letterSpacing="-0.015em"
              >
                Improvement Architect
              </Heading>
              <Text 
                fontSize="13px" 
                color="#5A6E65" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                lineHeight="1.4"
              >
                Analyze platform friction, prioritize feature requests, and bridge the gap between user experience and execution.
              </Text>
            </VStack>
          </HStack>

          {/* Compact Metric Strip (Rule 10: exactly 3 balanced nodes, no text wrapping) */}
          <Stack direction={{ base: "column", md: "row" }} spacing={3} align={{ base: "stretch", md: "center" }} w={{ base: "full", lg: "auto" }}>
            <HStack 
              spacing={{ base: 1.5, sm: 3 }} 
              p={1.5} 
              px={{ base: 2, sm: 2.5 }} 
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)" 
              border="1px solid rgba(86, 117, 109, 0.1)" 
              w={{ base: "full", md: "auto" }} 
              justify="space-between"
            >
              {/* Node 1: Total */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>
                  <Icon as={FiMessageSquare} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Total Suggestions
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {stats.total}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 2: Awaiting Review */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(245, 158, 11, 0.12)" color="#D97706" flexShrink={0}>
                  <Icon as={FiClock} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Awaiting Review
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {stats.new}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              {/* Node 3: Implemented */}
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(16, 185, 129, 0.12)" color="#059669" flexShrink={0}>
                  <Icon as={FiCheckCircle} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0}>
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
                    Implemented
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {stats.implemented}
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* 📊 DATA TABLE REPOSITORY CARD (Rule 12) */}
      <Box 
        bg="white" 
        p={6} 
        borderRadius="2xl" 
        border="1px solid rgba(86, 117, 109, 0.14)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        <VStack align="stretch" spacing={5}>
          {/* Filter Bar */}
          <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "center" }} gap={3}>
            <InputGroup maxW={{ base: "full", lg: "340px" }}>
              <InputLeftElement pointerEvents="none" h="40px">
                <Icon as={FiSearch} color="#718096" boxSize="15px" />
              </InputLeftElement>
              <Input 
                placeholder="Search suggestions..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="rgba(250, 248, 245, 0.85)"
                fontSize="13px"
                h="40px"
                _focus={{ borderColor: "#56756D", bg: "white" }}
              />
            </InputGroup>

            <HStack spacing={3} wrap="wrap">
              <Box w="190px">
                <ModernSelect
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  options={categoryOptions}
                  h="40px"
                  borderRadius="xl"
                />
              </Box>

              <Box w="190px">
                <ModernSelect
                  value={filterStatus}
                  onChange={(val) => setFilterStatus(val)}
                  options={statusOptions}
                  h="40px"
                  borderRadius="xl"
                />
              </Box>

              <Input 
                maxW="180px"
                placeholder="Filter by page..."
                value={filterPath}
                onChange={(e) => setFilterPath(e.target.value)}
                borderRadius="xl"
                borderColor="rgba(86, 117, 109, 0.2)"
                bg="rgba(250, 248, 245, 0.85)"
                fontSize="13px"
                h="40px"
                _focus={{ borderColor: "#56756D", bg: "white" }}
              />
            </HStack>
          </Flex>

          {/* Feedback Table */}
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr borderBottom="1px solid rgba(86, 117, 109, 0.12)">
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">USER / PATH</Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">FEEDBACK & CONTEXT</Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">CATEGORY</Th>
                  <Th fontSize="10.5px" fontWeight="700" color="#718096" letterSpacing="0.08em" textTransform="uppercase">STATUS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredFeedback.map((f) => {
                  const badge = getStatusBadge(f.status);
                  return (
                    <Tr 
                      key={f.id} 
                      borderBottom="1px solid rgba(86, 117, 109, 0.08)"
                      _hover={{ bg: "rgba(250, 248, 245, 0.6)" }} 
                      transition="background-color 0.15s ease"
                    >
                      <Td py={4} verticalAlign="top">
                        <VStack align="start" spacing={1}>
                          <Badge 
                            bg={f.user_type === 'therapist' ? "rgba(99, 102, 241, 0.12)" : "rgba(86, 117, 109, 0.12)"} 
                            color={f.user_type === 'therapist' ? "#4F46E5" : "#56756D"} 
                            borderRadius="full"
                            fontSize="9.5px"
                            fontWeight="700"
                            px={2}
                            py={0.5}
                            textTransform="uppercase"
                          >
                            {f.user_type || "Client"}
                          </Badge>
                          <Tooltip label={f.page_path}>
                            <Text fontSize="12px" color="#718096" fontWeight="500" noOfLines={1} maxW="160px">
                              {f.page_path || "/"}
                            </Text>
                          </Tooltip>
                        </VStack>
                      </Td>
                      <Td py={4} verticalAlign="top">
                        <Text fontSize="13px" fontWeight="500" color="#263A33" noOfLines={3} maxW="480px" lineHeight="1.5">
                          {f.content}
                        </Text>
                        <Text fontSize="11px" color="#718096" mt={1}>
                          {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </Td>
                      <Td py={4} verticalAlign="top">
                        <HStack spacing={1.5}>
                          <Circle size="22px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                            <Icon as={getCategoryIcon(f.category)} boxSize="11px" />
                          </Circle>
                          <Text fontSize="11.5px" fontWeight="600" color="#263A33" textTransform="uppercase">
                            {f.category?.replace("_", " ")}
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={4} verticalAlign="top">
                        <Menu placement="bottom-end">
                          <MenuButton 
                            as={Button} 
                            size="xs" 
                            bg={badge.bg}
                            color={badge.color}
                            borderRadius="full" 
                            fontSize="10.5px"
                            fontWeight="700"
                            px={3}
                            h="26px"
                            rightIcon={<Icon as={FiChevronDown} boxSize="12px" />}
                            _hover={{ opacity: 0.85 }}
                          >
                            {badge.label}
                          </MenuButton>
                          <MenuList 
                            borderRadius="xl" 
                            boxShadow="0 14px 34px -4px rgba(38, 58, 51, 0.16)" 
                            border="1px solid rgba(86, 117, 109, 0.15)"
                            p={1.5}
                          >
                            <MenuItem fontSize="12.5px" borderRadius="lg" onClick={() => updateStatus(f.id, 'new')}>
                              Mark as New
                            </MenuItem>
                            <MenuItem fontSize="12.5px" borderRadius="lg" onClick={() => updateStatus(f.id, 'reviewed')}>
                              Mark as Reviewed
                            </MenuItem>
                            <MenuItem fontSize="12.5px" borderRadius="lg" onClick={() => updateStatus(f.id, 'planned')}>
                              Move to Planned
                            </MenuItem>
                            <MenuItem fontSize="12.5px" borderRadius="lg" onClick={() => updateStatus(f.id, 'implemented')}>
                              Mark as Implemented
                            </MenuItem>
                            <MenuItem fontSize="12.5px" borderRadius="lg" onClick={() => updateStatus(f.id, 'dismissed')}>
                              Dismiss Feedback
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
                {filteredFeedback.length === 0 && (
                  <Tr>
                    <Td colSpan={4} py={16} textAlign="center">
                      <VStack spacing={3}>
                        <Circle size="42px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                          <Icon as={FiSearch} boxSize="18px" />
                        </Circle>
                        <Text fontSize="13.5px" color="#263A33" fontWeight="600">No suggestions match criteria</Text>
                        <Text fontSize="12px" color="#5A6E65">Try clearing filters or changing your search terms.</Text>
                      </VStack>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
