'use client'

import {
  Box, Heading, Text, VStack, HStack, Stack, Button, useToast,
  Icon, Divider, Flex, Badge, Table, Thead, Tbody,
  Tr, Th, Td, Spinner, Center, Grid, Circle, Menu,
  MenuButton, MenuList, MenuItem, SimpleGrid
} from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { 
  FiTrendingUp, FiCalendar, FiArrowUpRight, FiPieChart,
  FiFileText, FiDownload, FiDollarSign, FiCheck, FiChevronDown,
  FiCreditCard, FiShield, FiClock
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';

/* =========================================
   Modern Select Dropdown Component
========================================= */
function ModernSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  isDisabled = false,
  minW = "140px",
  size = "md"
}) {
  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const isSm = size === "sm";

  return (
    <Menu placement="bottom-end" autoSelect={false}>
      {({ isOpen }) => (
        <Box>
          <MenuButton
            as={Button}
            isDisabled={isDisabled}
            h={isSm ? "34px" : "38px"}
            px={3.5}
            borderRadius="full"
            bg={isOpen ? "white" : "rgba(250, 248, 245, 0.9)"}
            border="1px solid"
            borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}
            boxShadow={isOpen ? "0 0 0 1px #56756D" : "none"}
            _hover={{ bg: "white", borderColor: "#56756D" }}
            _active={{ bg: "white" }}
            fontSize="12.5px"
            fontWeight="600"
            color="#263A33"
            rightIcon={
              <Icon
                as={FiChevronDown}
                transition="transform 0.2s"
                transform={isOpen ? "rotate(180deg)" : "none"}
                color="#56756D"
                boxSize="13px"
              />
            }
          >
            {displayText}
          </MenuButton>
          <MenuList
            bg="white"
            borderRadius="xl"
            p={1.5}
            border="1px solid rgba(86, 117, 109, 0.15)"
            boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"
            zIndex={1400}
            minW={minW}
          >
            {options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <MenuItem
                  key={opt.value}
                  borderRadius="lg"
                  px={3}
                  py={2}
                  fontSize="12.5px"
                  fontFamily="'Inter', var(--font-inter), sans-serif"
                  fontWeight={active ? "600" : "500"}
                  color={active ? "#263A33" : "#5A6E65"}
                  bg={active ? "rgba(86, 117, 109, 0.08)" : "transparent"}
                  _hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}
                  onClick={() => onChange(opt.value)}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text as="span">{opt.label}</Text>
                  {active && <Icon as={FiCheck} color="#56756D" boxSize="13px" />}
                </MenuItem>
              );
            })}
          </MenuList>
        </Box>
      )}
    </Menu>
  );
}

import { useAuth } from "../../../../../context/AuthContext";
import { apiGet } from "../../../../../api.js";

const DUMMY_MONTHLY_DATA = [
  { name: 'Jan', earnings: 45000, sessions: 18 },
  { name: 'Feb', earnings: 52000, sessions: 21 },
  { name: 'Mar', earnings: 48000, sessions: 19 },
  { name: 'Apr', earnings: 61000, sessions: 24 },
  { name: 'May', earnings: 59000, sessions: 23 },
  { name: 'Jun', earnings: 74000, sessions: 29 },
];

const DUMMY_QUARTERLY_DATA = [
  { name: 'Q1', earnings: 145000, sessions: 58 },
  { name: 'Q2', earnings: 194000, sessions: 76 },
  { name: 'Q3', earnings: 182000, sessions: 71 },
  { name: 'Q4', earnings: 215000, sessions: 84 },
];

const DUMMY_YEARLY_DATA = [
  { name: '2024', earnings: 580000, sessions: 230 },
  { name: '2025', earnings: 710000, sessions: 280 },
  { name: '2026', earnings: 840000, sessions: 330 },
];

const DUMMY_TRANSACTIONS = [
  { id: 'TX-8921', date: '2026-06-28', client: 'Sarah Johnson', sessionType: 'Individual Therapy (60m)', amount: 2500, status: 'Settled' },
  { id: 'TX-8920', date: '2026-06-26', client: 'Michael Chen', sessionType: 'Cognitive Assessment', amount: 3500, status: 'Settled' },
  { id: 'TX-8919', date: '2026-06-24', client: 'Emma Wilson', sessionType: 'Couples Consultation', amount: 3000, status: 'Processing' },
  { id: 'TX-8918', date: '2026-06-22', client: 'David Smith', sessionType: 'Follow-up Session (45m)', amount: 2000, status: 'Settled' },
  { id: 'TX-8917', date: '2026-06-19', client: 'Priya Sharma', sessionType: 'Anxiety Intake Evaluation', amount: 3200, status: 'Settled' },
];

export default function EarningsClient() {
  const { isDummyTherapist } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("monthly");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [realTransactions, setRealTransactions] = useState([]);
  const [backendChartData, setBackendChartData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadEarningsData() {
      try {
        setLoading(true);
        // Try dedicated earnings endpoint or derive from real appointments
        const [earningsRes, apptsRes] = await Promise.allSettled([
          apiGet("therapist/earnings/"),
          apiGet("appointments/")
        ]);

        if (!isMounted) return;

        let txList = [];
        if (earningsRes.status === "fulfilled" && earningsRes.value?.transactions) {
          txList = earningsRes.value.transactions;
          setBackendChartData(earningsRes.value.chart_data || null);
        } else if (apptsRes.status === "fulfilled") {
          const appts = Array.isArray(apptsRes.value) ? apptsRes.value : (apptsRes.value?.results || []);
          txList = appts.map((a) => {
            const rawDate = a.date || a.start_time || new Date().toISOString();
            const fee = a.fee || (a.is_first_session_free ? 0 : 2500);
            return {
              id: `TX-${a.id}`,
              date: rawDate.split("T")[0],
              client: a.client_name || (typeof a.client === "object" ? a.client?.name : "Client Session"),
              sessionType: a.service_name || "Individual Therapy (60m)",
              amount: fee,
              status: ["completed", "attended"].includes(a.status?.toLowerCase()) ? "Settled" : "Processing"
            };
          });
        }

        setRealTransactions(txList);
      } catch (err) {
        console.warn("Failed to load real earnings data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEarningsData();
    return () => { isMounted = false; };
  }, []);

  // Frontend dummy data ONLY for dummy therapist account; all other accounts strictly use real backend data
  const activeTransactions = useMemo(() => {
    if (isDummyTherapist) return DUMMY_TRANSACTIONS;
    return realTransactions;
  }, [realTransactions, isDummyTherapist]);

  const chartData = useMemo(() => {
    if (isDummyTherapist) {
      if (timeframe === "quarterly") return DUMMY_QUARTERLY_DATA;
      if (timeframe === "yearly") return DUMMY_YEARLY_DATA;
      return DUMMY_MONTHLY_DATA;
    }

    if (backendChartData && backendChartData[timeframe]) {
      return backendChartData[timeframe];
    }

    // Dynamic aggregation from real transactions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Helper to extract numeric amount from any backend or mock transaction
    const getTxAmount = (t) => {
      if (typeof t.amount === "number") return t.amount;
      if (typeof t.raw_net === "number") return t.raw_net;
      const parsed = parseFloat(String(t.amount || t.net || t.gross || "").replace(/[^\d.]/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    };

    if (timeframe === "monthly") {
      const grouped = {};
      months.forEach(m => { grouped[m] = { name: m, earnings: 0, sessions: 0 }; });
      activeTransactions.forEach(t => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const mName = months[d.getMonth()];
          grouped[mName].earnings += getTxAmount(t);
          grouped[mName].sessions += 1;
        }
      });
      return months.slice(0, 6).map(m => grouped[m]);
    }

    if (timeframe === "quarterly") {
      const q = [
        { name: 'Q1', earnings: 0, sessions: 0 },
        { name: 'Q2', earnings: 0, sessions: 0 },
        { name: 'Q3', earnings: 0, sessions: 0 },
        { name: 'Q4', earnings: 0, sessions: 0 },
      ];
      activeTransactions.forEach(t => {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const idx = Math.floor(d.getMonth() / 3);
          if (q[idx]) {
            q[idx].earnings += getTxAmount(t);
            q[idx].sessions += 1;
          }
        }
      });
      return q;
    }

    // Yearly
    const y = [
      { name: String(currentYear - 2), earnings: 0, sessions: 0 },
      { name: String(currentYear - 1), earnings: 0, sessions: 0 },
      { name: String(currentYear), earnings: 0, sessions: 0 },
    ];
    activeTransactions.forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        const row = y.find(item => item.name === String(d.getFullYear()));
        if (row) {
          row.earnings += getTxAmount(t);
          row.sessions += 1;
        }
      }
    });
    return y;
  }, [backendChartData, timeframe, realTransactions.length, isDummyTherapist, activeTransactions]);

  const totalRevenue = useMemo(() => chartData.reduce((acc, curr) => acc + curr.earnings, 0), [chartData]);
  const totalSessions = useMemo(() => chartData.reduce((acc, curr) => acc + curr.sessions, 0), [chartData]);
  const avgSessionValue = useMemo(() => Math.round(totalRevenue / (totalSessions || 1)), [totalRevenue, totalSessions]);

  const filteredTransactions = useMemo(() => {
    if (statusFilter === "ALL") return activeTransactions;
    return activeTransactions.filter((tx) => tx.status.toUpperCase() === statusFilter);
  }, [statusFilter, activeTransactions]);

  const handleDownloadInvoice = (tx) => {
    const rawApptId = String(tx.id || '').replace(/^TX-/, '');
    const isAppt = Boolean(rawApptId && !isNaN(Number(rawApptId)));

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        render: () => (
          <Box p={3} px={4} bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)" border="1px solid rgba(245, 158, 11, 0.3)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
            <Text fontSize="13px" fontWeight="600" color="#92400E">Pop-up Blocked</Text>
            <Text fontSize="12px" color="#B45309">Please allow pop-ups to open and print your settlement receipt.</Text>
          </Box>
        ),
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }

    const isSettled = String(tx.status).toLowerCase() === 'settled';
    const amountNum = typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount || 0).replace(/[^\d.]/g, '')) || 0;
    const therapistPayout = Math.round(amountNum * 0.85);
    const platformFee = Math.round(amountNum * 0.15);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settlement Receipt - ${tx.id} | Therapy by MLC</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #FAF8F5;
      color: #263A33;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .receipt-container {
      max-width: 680px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid rgba(86, 117, 109, 0.16);
      border-radius: 20px;
      box-shadow: 0 10px 30px -4px rgba(38, 58, 51, 0.06);
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(86, 117, 109, 0.14);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 22px;
      color: #263A33;
      letter-spacing: -0.015em;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #5A6E65;
      margin-top: 3px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: ${isSettled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'};
      color: ${isSettled ? '#059669' : '#D97706'};
      border: 1px solid ${isSettled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'};
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
      background: rgba(250, 248, 245, 0.85);
      border: 1px solid rgba(86, 117, 109, 0.1);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .meta-item .label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #718096;
      margin-bottom: 4px;
    }
    .meta-item .value {
      font-size: 13.5px;
      font-weight: 600;
      color: #263A33;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #718096;
      border-bottom: 1px solid rgba(86, 117, 109, 0.14);
      padding: 10px 12px;
      text-align: left;
    }
    td {
      font-size: 13px;
      padding: 12px;
      border-bottom: 1px solid rgba(86, 117, 109, 0.08);
      color: #263A33;
    }
    .total-box {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .total-card {
      width: 290px;
      background: #FAF8F5;
      border: 1px solid rgba(86, 117, 109, 0.14);
      border-radius: 12px;
      padding: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #5A6E65;
      margin-bottom: 8px;
    }
    .total-row.grand {
      font-size: 14.5px;
      font-weight: 700;
      color: #263A33;
      border-top: 1px solid rgba(86, 117, 109, 0.16);
      padding-top: 8px;
      margin-top: 8px;
      margin-bottom: 0;
    }
    .footer-note {
      font-size: 11px;
      color: #718096;
      line-height: 1.6;
      border-top: 1px solid rgba(86, 117, 109, 0.12);
      padding-top: 20px;
      text-align: center;
    }
    .action-bar {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn {
      padding: 9px 20px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary {
      background: #56756D;
      color: white;
      box-shadow: 0 2px 6px rgba(86, 117, 109, 0.22);
    }
    .btn-primary:hover { background: #263A33; }
    .btn-outline {
      background: white;
      border: 1px solid rgba(86, 117, 109, 0.25);
      color: #263A33;
    }
    .btn-outline:hover { background: rgba(86, 117, 109, 0.06); }
    @media print {
      body { background: white; padding: 0; }
      .receipt-container { box-shadow: none; border: none; padding: 0; }
      .action-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-primary" onclick="window.print()">Print Receipt</button>
    ${isAppt ? `<button class="btn btn-outline" onclick="if (window.opener) { window.opener.dispatchEvent(new CustomEvent('mlc:open-invoice', { detail: { appointmentId: '${rawApptId}' } })); window.opener.focus(); } else { window.open('/dashboard/client/invoice/${rawApptId}', '_blank'); }">View Session Invoice</button>` : ''}
    <button class="btn btn-outline" onclick="window.close()">Close</button>
  </div>
  <div class="receipt-container">
    <div class="header">
      <div>
        <div class="brand-title">Therapy by MLC</div>
        <div class="brand-subtitle">Clinical Care Practice • Practitioner Settlement Statement</div>
      </div>
      <span class="badge">${tx.status}</span>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="label">Settlement Reference</div>
        <div class="value">${tx.id}</div>
      </div>
      <div class="meta-item">
        <div class="label">Date Recorded</div>
        <div class="value">${new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
      <div class="meta-item">
        <div class="label">Client Dossier</div>
        <div class="value">${tx.client}</div>
      </div>
      <div class="meta-item">
        <div class="label">Clinical Service</div>
        <div class="value">${tx.sessionType}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Gross Fee</th>
          <th style="text-align: right;">Practitioner Share</th>
          <th style="text-align: right;">Net Payout</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${tx.sessionType}</strong><br>
            <span style="font-size: 11.5px; color: #5A6E65;">Ref: ${tx.id} • Confirmed Session</span>
          </td>
          <td style="text-align: right;">₹${amountNum.toLocaleString()}</td>
          <td style="text-align: right;">85%</td>
          <td style="text-align: right; font-weight: 700; color: #065F46;">₹${therapistPayout.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-card">
        <div class="total-row">
          <span>Session Gross</span>
          <span>₹${amountNum.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Platform Support (15%)</span>
          <span>-₹${platformFee.toLocaleString()}</span>
        </div>
        <div class="total-row grand">
          <span>Therapist Net</span>
          <span style="color: #065F46;">₹${therapistPayout.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      This document constitutes an electronic practitioner settlement statement issued under Therapy by MLC clinical operational protocols. All clinical and financial transaction records are strictly confidential and encrypted in compliance with Digital Personal Data Protection (DPDP) guidelines.
    </div>
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast({
      render: () => (
        <Box p={3} px={4} bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
          <Text fontSize="13px" fontWeight="600" color="#065F46">Settlement Receipt Ready</Text>
          <Text fontSize="12px" color="#047857">Receipt window opened for printing.</Text>
        </Box>
      ),
      duration: 3500,
      isClosable: true,
      position: "bottom-right",
    });
  };

  const handleGenerateReport = () => {
    const reportData = `MLC HEALTHCARE - EARNINGS STATEMENT (${timeframe.toUpperCase()})\n` +
      `Total Revenue: INR ${totalRevenue.toLocaleString()}\n` +
      `Completed Sessions: ${totalSessions}\n` +
      `Average Session Value: INR ${avgSessionValue.toLocaleString()}\n\n` +
      `Period Breakdown:\n` +
      chartData.map((d) => `${d.name}: INR ${d.earnings.toLocaleString()} (${d.sessions} sessions)`).join("\n") +
      `\n\nTherapy by MLC • Certified Practice Financials`;

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MLC_Earnings_Report_${timeframe}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      render: () => (
        <Box p={3} px={4} bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)" border="1px solid rgba(16, 185, 129, 0.35)" borderRadius="2xl" boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16)">
          <Text fontSize="13px" fontWeight="600" color="#065F46">Financial Report Generated</Text>
          <Text fontSize="12px" color="#047857">Statement for {timeframe} downloaded successfully.</Text>
        </Box>
      ),
      duration: 3500,
      isClosable: true,
      position: "bottom-right",
    });
  };

  if (loading) {
    return (
      <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" py={20}>
        <Center>
          <VStack spacing={3}>
            <Spinner thickness="3px" speed="0.65s" emptyColor="rgba(86, 117, 109, 0.15)" color="#56756D" size="lg" />
            <Text fontSize="13.5px" color="#5A6E65">Calculating clinical revenue & settlement records...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
      {/* 🌿 1. UNIFIED HERO BANNER CARD (Golden Benchmark) */}
      <Box 
        bg="white"
        p={{ base: 4, md: 5 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.14)"
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"
        mb={6}
      >
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="space-between" 
          align={{ base: 'flex-start', lg: 'center' }}
          gap={4}
        >
          {/* Left: Identity Badge + H1 + Subtitle */}
          <HStack spacing={3.5} align="center">
            <Box position="relative" flexShrink={0}>
              <Circle size="48px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiTrendingUp} boxSize="22px" />
              </Circle>
              <Circle 
                size="11px" 
                bg="#10B981" 
                border="2px solid white" 
                position="absolute" 
                bottom="0" 
                right="0" 
              />
            </Box>

            <VStack align="start" spacing={0.5}>
              <HStack spacing={2} wrap="wrap">
                <Badge 
                  bg="rgba(86, 117, 109, 0.1)" 
                  color="#263A33" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  letterSpacing="0.06em"
                  textTransform="uppercase"
                >
                  Clinical Practice · Finance
                </Badge>
                <Badge 
                  bg="#ECFDF5" 
                  color="#065F46" 
                  fontSize="10px" 
                  fontWeight="700" 
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  Active Payouts
                </Badge>
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
                Earnings Overview
              </Heading>

              <Text 
                fontSize="13px" 
                color="#5A6E65"
                fontWeight="400"
              >
                Track clinical revenue trends, session volumes, and settlement payouts.
              </Text>
            </VStack>
          </HStack>

          {/* Right: Metric Strip + Actions */}
          <Stack 
            direction={{ base: "column", xl: "row" }}
            spacing={3} 
            align={{ base: "stretch", xl: "center" }} 
            w={{ base: "full", lg: "auto" }}
            flexShrink={0}
          >
            <HStack 
              spacing={{ base: 1.5, sm: 3 }} 
              p={1.5} 
              px={{ base: 2, sm: 2.5 }}
              borderRadius="xl" 
              bg="rgba(250, 248, 245, 0.9)"
              border="1px solid"
              borderColor="rgba(86, 117, 109, 0.1)"
              w={{ base: "full", md: "auto" }}
              justify="space-between"
            >
              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
                  <Icon as={FaRupeeSign} boxSize="11px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    REVENUE
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    ₹{totalRevenue.toLocaleString()}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
                  <Icon as={FiCalendar} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    SESSIONS
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    {totalSessions}
                  </Text>
                </VStack>
              </HStack>

              <Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />

              <HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">
                <Circle size="28px" bg="rgba(86, 117, 109, 0.1)" color="#56756D" flexShrink={0}>
                  <Icon as={FiTrendingUp} boxSize="13px" />
                </Circle>
                <VStack align="start" spacing={0} minW="max-content">
                  <Text fontSize="9.5px" fontWeight="700" color="#718096" letterSpacing="0.06em" textTransform="uppercase" whiteSpace="nowrap">
                    AVG VALUE
                  </Text>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33" whiteSpace="nowrap">
                    ₹{avgSessionValue.toLocaleString()}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            <HStack spacing={2.5} w={{ base: "full", sm: "auto" }} justify={{ base: "flex-start", sm: "flex-end" }} flexShrink={0}>
              <ModernSelect
                value={timeframe}
                onChange={(val) => setTimeframe(val)}
                options={[
                  { label: "This Month", value: "monthly" },
                  { label: "Quarterly", value: "quarterly" },
                  { label: "Yearly", value: "yearly" },
                ]}
                size="sm"
              />

              <Button
                leftIcon={<FiDownload />}
                variant="outline"
                borderColor="rgba(86, 117, 109, 0.25)"
                color="#263A33"
                borderRadius="full"
                h="38px"
                fontSize="12.5px"
                fontWeight="600"
                px={4}
                whiteSpace="nowrap"
                onClick={handleGenerateReport}
                _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
              >
                Statement
              </Button>
            </HStack>
          </Stack>
        </Flex>
      </Box>

      {/* 📊 2. BALANCED BENTO GRID (7:5 Ratio) */}
      <Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start" mb={6}>
        {/* Left: Revenue Trends Chart */}
        <Box 
          bg="white" 
          p={5} 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="rgba(86, 117, 109, 0.14)" 
          boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
        >
          <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={2}>
            <VStack align="start" spacing={0.5}>
              <Heading 
                as="h2" 
                fontSize="15px" 
                fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                fontWeight="600" 
                color="#263A33"
              >
                Revenue Trends
              </Heading>
              <Text fontSize="12.5px" color="#5A6E65">
                Clinical earnings progression over selected period
              </Text>
            </VStack>
            <Badge 
              bg="#ECFDF5" 
              color="#065F46" 
              borderRadius="full" 
              px={2.5} 
              py={0.5} 
              fontSize="11px" 
              fontWeight="600"
            >
              +14.2% vs previous period
            </Badge>
          </Flex>

          <Box h="280px" w="100%" minW="0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="sageEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#56756D" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#56756D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(86, 117, 109, 0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#718096', fontFamily: 'Inter' }} 
                  dy={8} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#718096', fontFamily: 'Inter' }} 
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '14px', 
                    border: '1px solid rgba(86, 117, 109, 0.15)', 
                    boxShadow: '0 10px 25px -4px rgba(38, 58, 51, 0.12)',
                    fontFamily: 'Inter',
                    fontSize: '13px'
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Earnings']}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#56756D" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#sageEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Right: Sessions Distribution & Settlement Stats */}
        <VStack align="stretch" spacing={5}>
          <Box 
            bg="white" 
            p={5} 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.14)" 
            boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
          >
            <Flex justify="space-between" align="center" mb={5}>
              <VStack align="start" spacing={0.5}>
                <Heading 
                  as="h2" 
                  fontSize="15px" 
                  fontFamily="'Outfit', var(--font-outfit), sans-serif" 
                  fontWeight="600" 
                  color="#263A33"
                >
                  Session Volume
                </Heading>
                <Text fontSize="12.5px" color="#5A6E65">
                  Completed consultations by month
                </Text>
              </VStack>
              <Circle size="32px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiPieChart} boxSize="15px" />
              </Circle>
            </Flex>

            <Box h="170px" w="100%" minW="0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={150}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(86, 117, 109, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#718096', fontFamily: 'Inter' }} 
                    dy={5} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#718096', fontFamily: 'Inter' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(86, 117, 109, 0.05)' }} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid rgba(86, 117, 109, 0.15)', 
                      boxShadow: '0 8px 20px -2px rgba(38, 58, 51, 0.1)',
                      fontFamily: 'Inter',
                      fontSize: '12.5px'
                    }} 
                    formatter={(value) => [`${value} Sessions`, 'Volume']}
                  />
                  <Bar dataKey="sessions" fill="#56756D" radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Quick Payout Summary Tile */}
          <Box 
            p={4} 
            borderRadius="2xl" 
            bg="rgba(250, 248, 245, 0.85)" 
            border="1px solid rgba(86, 117, 109, 0.12)"
          >
            <HStack justify="space-between" mb={3}>
              <HStack spacing={2.5}>
                <Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D">
                  <Icon as={FiCreditCard} boxSize="13px" />
                </Circle>
                <Text fontSize="13px" fontWeight="600" color="#263A33">
                  Settlement Account
                </Text>
              </HStack>
              <Badge bg="#ECFDF5" color="#065F46" fontSize="10px" fontWeight="700" borderRadius="full">
                VERIFIED
              </Badge>
            </HStack>

            <SimpleGrid columns={2} spacing={3} pt={1}>
              <Box p={2.5} borderRadius="xl" bg="white" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="10.5px" color="#718096" fontWeight="600" textTransform="uppercase">
                  Next Payout
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#263A33" pt={0.5}>
                  ₹{(totalRevenue * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </Box>
              <Box p={2.5} borderRadius="xl" bg="white" border="1px solid rgba(86, 117, 109, 0.08)">
                <Text fontSize="10.5px" color="#718096" fontWeight="600" textTransform="uppercase">
                  Disbursement
                </Text>
                <Text fontSize="14px" fontWeight="700" color="#56756D" pt={0.5}>
                  Weekly (Mon)
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </VStack>
      </Grid>

      {/* 📜 3. RECENT SETTLEMENTS & TRANSACTIONS TABLE */}
      <Box 
        bg="white" 
        p={5} 
        borderRadius="2xl" 
        border="1px solid" 
        borderColor="rgba(86, 117, 109, 0.14)" 
        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
      >
        <Flex justify="space-between" align={{ base: "start", sm: "center" }} mb={5} wrap="wrap" gap={3}>
          <HStack spacing={3}>
            <Heading 
              as="h2" 
              fontSize="16px" 
              fontFamily="'Outfit', var(--font-outfit), sans-serif" 
              fontWeight="600" 
              color="#263A33"
            >
              Recent Settlements
            </Heading>
            <Badge 
              bg="rgba(86, 117, 109, 0.1)" 
              color="#263A33" 
              borderRadius="full" 
              px={2.5} 
              py={0.5} 
              fontSize="10.5px" 
              fontWeight="700"
            >
              {filteredTransactions.length} Records
            </Badge>
          </HStack>

          {/* Filter Pills */}
          <HStack spacing={1.5}>
            {["ALL", "SETTLED", "PROCESSING"].map((filter) => {
              const active = statusFilter === filter;
              return (
                <Button
                  key={filter}
                  size="xs"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="11px"
                  fontWeight="600"
                  bg={active ? "#56756D" : "rgba(250, 248, 245, 0.9)"}
                  color={active ? "white" : "#5A6E65"}
                  border="1px solid"
                  borderColor={active ? "#56756D" : "rgba(86, 117, 109, 0.14)"}
                  _hover={{ bg: active ? "#263A33" : "rgba(86, 117, 109, 0.08)" }}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </Button>
              );
            })}
          </HStack>
        </Flex>

        {/* Desktop Table View */}
        <Box display={{ base: "none", md: "block" }} overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="rgba(86, 117, 109, 0.06)">
              <Tr>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>REF ID</Th>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>DATE</Th>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>CLIENT & SERVICE</Th>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>AMOUNT</Th>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3}>STATUS</Th>
                <Th color="#263A33" fontSize="11px" fontWeight="700" letterSpacing="0.05em" textTransform="uppercase" py={3} textAlign="right">RECEIPT</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredTransactions.map((tx) => (
                <Tr key={tx.id} _hover={{ bg: "rgba(86, 117, 109, 0.03)" }} transition="0.15s">
                  <Td fontSize="12.5px" fontWeight="600" color="#718096">{tx.id}</Td>
                  <Td fontSize="13px" color="#5A6E65">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="13px" fontWeight="600" color="#263A33">{tx.client}</Text>
                      <Text fontSize="11.5px" color="#718096">{tx.sessionType}</Text>
                    </VStack>
                  </Td>
                  <Td fontSize="13px" fontWeight="700" color="#263A33">₹{tx.amount.toLocaleString()}</Td>
                  <Td>
                    <Badge 
                      bg={tx.status === 'Settled' ? '#ECFDF5' : '#FFFBEB'} 
                      color={tx.status === 'Settled' ? '#065F46' : '#92400E'} 
                      border="1px solid"
                      borderColor={tx.status === 'Settled' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}
                      borderRadius="full" 
                      px={2.5} 
                      py={0.5} 
                      fontSize="11px" 
                      fontWeight="600"
                    >
                      {tx.status}
                    </Badge>
                  </Td>
                  <Td textAlign="right">
                    <Button 
                      size="xs" 
                      variant="outline" 
                      borderColor="rgba(86, 117, 109, 0.2)"
                      color="#263A33"
                      borderRadius="full"
                      px={3}
                      leftIcon={<FiDownload />}
                      _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                      onClick={() => handleDownloadInvoice(tx)}
                    >
                      Receipt
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {filteredTransactions.length === 0 && (
            <VStack py={10} spacing={2} justify="center">
              <Circle size="38px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCreditCard} boxSize="18px" />
              </Circle>
              <Text fontSize="13px" fontWeight="600" color="#263A33">
                No transactions recorded yet
              </Text>
              <Text fontSize="12px" color="#718096" textAlign="center" maxW="340px">
                When appointments are completed, your session payouts and receipts will appear here automatically.
              </Text>
            </VStack>
          )}
        </Box>

        {/* Mobile Card List View */}
        <VStack display={{ base: "flex", md: "none" }} spacing={3} align="stretch">
          {filteredTransactions.length === 0 && (
            <VStack py={8} spacing={2} justify="center">
              <Circle size="36px" bg="rgba(86, 117, 109, 0.1)" color="#56756D">
                <Icon as={FiCreditCard} boxSize="16px" />
              </Circle>
              <Text fontSize="12.5px" fontWeight="600" color="#263A33">
                No transactions recorded yet
              </Text>
            </VStack>
          )}
          {filteredTransactions.map((tx) => (
            <Box 
              key={tx.id} 
              p={3.5} 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="rgba(86, 117, 109, 0.12)" 
              bg="rgba(250, 248, 245, 0.85)"
            >
              <Flex justify="space-between" align="start" mb={2}>
                <VStack align="start" spacing={0.5}>
                  <Text fontSize="13px" fontWeight="600" color="#263A33">{tx.client}</Text>
                  <Text fontSize="11.5px" color="#718096">{tx.sessionType}</Text>
                </VStack>
                <Badge 
                  bg={tx.status === 'Settled' ? '#ECFDF5' : '#FFFBEB'} 
                  color={tx.status === 'Settled' ? '#065F46' : '#92400E'} 
                  borderRadius="full" 
                  px={2.5} 
                  py={0.5} 
                  fontSize="10.5px"
                  fontWeight="600"
                >
                  {tx.status}
                </Badge>
              </Flex>
              <Flex justify="space-between" align="center" pt={2} borderTop="1px solid rgba(86, 117, 109, 0.1)">
                <HStack spacing={1}>
                  <Text fontSize="13.5px" fontWeight="700" color="#263A33">₹{tx.amount.toLocaleString()}</Text>
                  <Text fontSize="11px" color="#718096">• {tx.date}</Text>
                </HStack>
                <Button 
                  size="xs" 
                  variant="outline" 
                  borderColor="rgba(86, 117, 109, 0.25)"
                  color="#263A33"
                  borderRadius="full" 
                  leftIcon={<FiDownload />}
                  onClick={() => handleDownloadInvoice(tx)}
                >
                  Receipt
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

