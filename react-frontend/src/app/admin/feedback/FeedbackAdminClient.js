'use client'

import React, { useState, useEffect } from "react";
import {
  Box, Container, Heading, Text, VStack, HStack, SimpleGrid, Select, Badge, Icon, Table, Thead, Tbody, Tr, Th, Td, IconButton, Menu, MenuButton, MenuList, MenuItem, Button, Tag, Input, InputGroup, InputLeftElement, Flex, Spinner, useToast, Divider, Textarea, Tooltip
} from "@chakra-ui/react";
import { FiSearch, FiFilter, FiMoreVertical, FiChevronRight, FiMessageSquare, FiSettings, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp, FiZap, FiLayout } from "react-icons/fi";
import { apiGet, apiPatch } from "../../../api";

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
      toast({ title: "Status Updated", status: "success", duration: 2000 });
      fetchFeedback();
    } catch (error) {
      toast({ title: "Update failed", status: "error" });
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

  const getStatusColor = (status) => {
    const colors = {
      new: "blue",
      reviewed: "purple",
      planned: "orange",
      implemented: "green",
      dismissed: "gray"
    };
    return colors[status] || "gray";
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
      <Center h="100vh">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#F7F9F9" pb={20}>
      <Box bg="#56756D" color="white" pt={20} pb={32}>
        <Container maxW="1400px">
          <VStack align="start" spacing={4}>
            <HStack spacing={4}>
              <Icon as={FiTrendingUp} boxSize={8} />
              <Heading size="xl" fontFamily="'Playfair Display', serif" fontWeight="900">Improvement Architect</Heading>
            </HStack>
            <Text opacity="0.9" maxW="2xl" fontSize="lg">
              Analyze platform friction, prioritize feature requests, and bridge the gap between user experience and execution.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="1400px" mt="-60px">
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Box bg="white" p={6} borderRadius="2xl" shadow="xl" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Total Suggestions</Text>
                <Heading size="lg">{stats.total}</Heading>
              </VStack>
              <Icon as={FiMessageSquare} color="teal.400" boxSize={8} />
            </HStack>
          </Box>
          <Box bg="white" p={6} borderRadius="2xl" shadow="xl" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Awaiting Review</Text>
                <Heading size="lg" color="blue.500">{stats.new}</Heading>
              </VStack>
              <Icon as={FiClock} color="blue.400" boxSize={8} />
            </HStack>
          </Box>
          <Box bg="white" p={6} borderRadius="2xl" shadow="xl" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Implemented</Text>
                <Heading size="lg" color="green.500">{stats.implemented}</Heading>
              </VStack>
              <Icon as={FiCheckCircle} color="green.400" boxSize={8} />
            </HStack>
          </Box>
        </SimpleGrid>

        <Box bg="white" p={8} borderRadius="3xl" shadow="2xl" border="1px solid" borderColor="gray.100">
          <VStack align="stretch" spacing={8}>
            <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "center" }} gap={4}>
              <Heading size="md" color="teal.900">Feedback Repository</Heading>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement children={<FiSearch color="gray.300" />} />
                  <Input 
                    placeholder="Search content..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="xl"
                  />
                </InputGroup>
                <Select 
                  maxW="200px" 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  borderRadius="xl"
                >
                  <option value="all">All Categories</option>
                  <option value="ui_ux">UI/UX</option>
                  <option value="feature">Features</option>
                  <option value="clinical">Clinical Tools</option>
                  <option value="bug">Bugs</option>
                </Select>
                <Select 
                  maxW="200px" 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  borderRadius="xl"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="planned">Planned</option>
                  <option value="implemented">Implemented</option>
                </Select>
                <Input 
                   maxW="200px"
                   placeholder="Filter by Page..."
                   value={filterPath}
                   onChange={(e) => setFilterPath(e.target.value)}
                   borderRadius="xl"
                />
              </HStack>
            </Flex>

            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>User / Path</Th>
                    <Th>Suggestion</Th>
                    <Th>Category</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredFeedback.map((f) => (
                    <Tr key={f.id} _hover={{ bg: "gray.50" }} transition="all 0.2s">
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Badge variant="subtle" colorScheme={f.user_type === 'therapist' ? 'teal' : 'orange'} borderRadius="full">
                            {f.user_type}
                          </Badge>
                          <Tooltip label={f.page_path}>
                            <Text fontSize="xs" color="gray.500" fontWeight="bold" noOfLines={1} maxW="150px">
                              {f.page_path || "/"}
                            </Text>
                          </Tooltip>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="500" noOfLines={2} maxW="400px">
                          {f.content}
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={1}>
                          {new Date(f.created_at).toLocaleDateString()}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={getCategoryIcon(f.category)} color="gray.400" />
                          <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                            {f.category?.replace("_", " ")}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton as={Button} size="xs" variant="outline" colorScheme={getStatusColor(f.status)} borderRadius="full" rightIcon={<FiChevronRight />}>
                            {f.status}
                          </MenuButton>
                          <MenuList borderRadius="xl" shadow="2xl">
                            <MenuItem onClick={() => updateStatus(f.id, 'reviewed')}>Mark Reviewed</MenuItem>
                            <MenuItem onClick={() => updateStatus(f.id, 'planned')}>Move to Planned</MenuItem>
                            <MenuItem onClick={() => updateStatus(f.id, 'implemented')}>Mark Implemented</MenuItem>
                            <MenuItem onClick={() => updateStatus(f.id, 'dismissed')}>Dismiss</MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                      <Td>
                        <IconButton icon={<FiMoreVertical />} variant="ghost" size="sm" borderRadius="full" />
                      </Td>
                    </Tr>
                  ))}
                  {filteredFeedback.length === 0 && (
                    <Tr>
                      <Td colSpan={5} py={20} textAlign="center">
                        <VStack spacing={4}>
                           <Icon as={FiSearch} boxSize={10} color="gray.200" />
                           <Text color="gray.400">No suggestions found matching these filters.</Text>
                        </VStack>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

function Center({ children, ...props }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" {...props}>
      {children}
    </Box>
  );
}
