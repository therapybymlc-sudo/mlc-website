'use client'

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  useToast,
  Icon,
  Divider,
  Flex,
  Badge,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiCalendar, 
  FiArrowUpRight, 
  FiPieChart,
  FiFileText,
  FiDownload
} from "react-icons/fi";
import { apiGet } from "../../../../../api.js";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';

const dummyData = [
  { name: 'Jan', earnings: 4500, sessions: 12 },
  { name: 'Feb', earnings: 5200, sessions: 15 },
  { name: 'Mar', earnings: 4800, sessions: 14 },
  { name: 'Apr', earnings: 6100, sessions: 18 },
  { name: 'May', earnings: 5900, sessions: 17 },
  { name: 'Jun', earnings: 7200, sessions: 21 },
];

export default function EarningsClient() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("monthly"); // monthly, quarterly, yearly
  const [earningsData, setEarningsData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch based on timeframe
        // const res = await apiGet(`earnings/?timeframe=${timeframe}`);
        
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEarningsData(dummyData);
        setRecentTransactions([
          { id: '1', date: '2026-04-24', client: 'Sarah Johnson', amount: 450, status: 'Settled' },
          { id: '2', date: '2026-04-23', client: 'Michael Chen', amount: 450, status: 'Settled' },
          { id: '3', date: '2026-04-22', client: 'Emma Wilson', amount: 600, status: 'Processing' },
          { id: '4', date: '2026-04-21', client: 'David Smith', amount: 450, status: 'Settled' },
        ]);
      } catch (err) {
        toast({ title: "Failed to sync financial data", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeframe]);

  const totalRevenue = useMemo(() => earningsData.reduce((acc, curr) => acc + curr.earnings, 0), [earningsData]);
  const totalSessions = useMemo(() => earningsData.reduce((acc, curr) => acc + curr.sessions, 0), [earningsData]);

  if (loading) {
    return (
      <Center h="70vh">
        <VStack spacing={4}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#56756D" size="xl" />
          <Text color="gray.500" fontWeight="600">Calculating your practice growth...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box position="relative" pb={20}>
      <Container maxW="container.xl" p={0}>
        {/* 🏔️ Header & Filters */}
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={10} gap={6}>
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="#2E2E2E" fontFamily="'Playfair Display', serif">Earnings Overview</Heading>
            <Text color="gray.500">Track your clinical revenue and session metrics.</Text>
          </VStack>
          
          <HStack spacing={3}>
            <Select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)} 
              borderRadius="full" 
              bg="white" 
              shadow="sm" 
              w="160px"
              fontSize="sm"
              fontWeight="600"
            >
              <option value="monthly">This Month</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
            <Button leftIcon={<FiDownload />} variant="outline" borderRadius="full" px={6}>Generate Report</Button>
          </HStack>
        </Flex>

        {/* 📊 Stat Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={12}>
          <StatCard 
            label="Total Revenue" 
            value={`INR ${totalRevenue.toLocaleString()}`} 
            help="+12.5% from last period" 
            icon={FiDollarSign} 
            color="teal.500" 
            isIncrease 
          />
          <StatCard 
            label="Total Sessions" 
            value={totalSessions} 
            help="+3 from last period" 
            icon={FiCalendar} 
            color="orange.400" 
            isIncrease 
          />
          <StatCard 
            label="Avg. Session Value" 
            value="INR 480" 
            help="Based on current rate" 
            icon={FiTrendingUp} 
            color="blue.400" 
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={10} mb={12}>
          {/* 📈 Main Earnings Chart */}
          <Box gridColumn={{ lg: "span 2" }} bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={8}>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color="#2E2E2E">Revenue Trends</Heading>
                <Text fontSize="xs" color="gray.500">Practice growth over time</Text>
              </VStack>
              <Icon as={FiArrowUpRight} color="teal.500" />
            </HStack>
            <Box h="300px" w="100%">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#56756D" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#56756D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#56756D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* 🥧 Sessions Breakdown */}
          <Box gridColumn={{ lg: "span 1" }} bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" mb={8}>
              <Heading size="sm" color="#2E2E2E">Sessions Distribution</Heading>
              <Icon as={FiPieChart} color="orange.400" />
            </HStack>
            <Box h="300px" w="100%">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="sessions" fill="#C9A960" radius={[10, 10, 10, 10]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </SimpleGrid>

        {/* 📜 Recent Transactions */}
        <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
          <HStack justify="space-between" mb={8}>
            <Heading size="sm" color="#2E2E2E">Recent Settlements</Heading>
            <Button variant="link" size="sm" color="teal.500">View All</Button>
          </HStack>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="gray.400" fontSize="2xs" letterSpacing="widest">DATE</Th>
                <Th color="gray.400" fontSize="2xs" letterSpacing="widest">CLIENT</Th>
                <Th color="gray.400" fontSize="2xs" letterSpacing="widest">AMOUNT</Th>
                <Th color="gray.400" fontSize="2xs" letterSpacing="widest">STATUS</Th>
                <Th color="gray.400" fontSize="2xs" letterSpacing="widest" textAlign="right">ACTION</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentTransactions.map((tx) => (
                <Tr key={tx.id} _hover={{ bg: "gray.50" }} transition="0.2s">
                  <Td fontSize="sm" fontWeight="600">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Td>
                  <Td fontSize="sm">{tx.client}</Td>
                  <Td fontSize="sm" fontWeight="700">INR {tx.amount}</Td>
                  <Td>
                    <Badge 
                      colorScheme={tx.status === 'Settled' ? 'green' : 'orange'} 
                      variant="subtle" 
                      borderRadius="full" 
                      px={3}
                      fontSize="2xs"
                    >
                      {tx.status}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <Button size="xs" variant="ghost" leftIcon={<FiFileText />}>Invoice</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </Box>
  );
}

function StatCard({ label, value, help, icon, color, isIncrease }) {
  return (
    <Box bg="white" p={8} borderRadius="3xl" shadow="sm" border="1px solid" borderColor="gray.100">
      <VStack align="start" spacing={4}>
        <Circle size="40px" bg={`${color.split('.')[0]}.50`} color={color}>
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" spacing={1}>
          <Text color="gray.500" fontSize="xs" fontWeight="800" letterSpacing="wider" textTransform="uppercase">{label}</Text>
          <Heading size="lg" color="#2E2E2E">{value}</Heading>
        </VStack>
        <Divider />
        <StatHelpText m={0}>
          {isIncrease !== undefined && <StatArrow type={isIncrease ? "increase" : "decrease"} />}
          {help}
        </StatHelpText>
      </VStack>
    </Box>
  );
}

const Circle = ({ children, size, bg, color, ...props }) => (
  <Flex 
    w={size} 
    h={size} 
    borderRadius="full" 
    bg={bg} 
    color={color} 
    align="center" 
    justify="center" 
    {...props}
  >
    {children}
  </Flex>
);
// sync
