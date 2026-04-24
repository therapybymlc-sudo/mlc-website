'use client'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  IconButton,
  Icon,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Divider,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiBell, FiCheckCircle, FiInfo, FiZap, FiTarget } from "react-icons/fi";
import { apiGet, apiPost } from "../api.js";

export default function NotificationCenter({ isAuthenticated, authLoading }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const toast = useToast();

  const fetchNotifications = async () => {
    if (!isAuthenticated || authLoading) return;
    try {
      setLoading(true);
      const res = await apiGet("notifications/?is_read=false");
      setNotifications(Array.isArray(res) ? res : res.results || []);
    } catch (err) {
      const status = err?.response?.status;
      // Auth bootstrap races can briefly yield 401/403; avoid noisy loops in console.
      if (status !== 401 && status !== 403) {
        console.warn("Could not fetch notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
        fetchNotifications();
    }
    // Poll every 5 minutes if authenticated
    const interval = setInterval(() => {
        if (isAuthenticated) fetchNotifications();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => apiPost(`notifications/${n.id}/mark_read/`, {})));
      setNotifications([]);
    } catch (err) {
      toast({ title: "Failed to mark as read", status: "error" });
    }
  };

  const getIcon = (type) => {
    if (type.includes('streak')) return FiZap;
    if (type.includes('appointment')) return FiCheckCircle;
    if (type.includes('goal')) return FiTarget;
    return FiInfo;
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" cursor="pointer">
          <IconButton
            icon={<Icon as={FiBell} />}
            variant="ghost"
            borderRadius="full"
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              bg="red.500"
              color="white"
              borderRadius="full"
              fontSize="10px"
              px={1.5}
              border="2px solid white"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent borderRadius="2xl" shadow="2xl" border="none" w="350px">
        <PopoverArrow />
        <PopoverHeader border="none" pt={4} px={4}>
          <HStack justify="space-between">
            <Text fontWeight="800" color="#2E2E2E">Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" colorScheme="teal" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0} maxH="400px" overflowY="auto">
          {loading && notifications.length === 0 ? (
            <VStack py={10}><Spinner color="#56756D" /></VStack>
          ) : notifications.length === 0 ? (
            <VStack py={10} spacing={2}>
              <Icon as={FiBell} color="gray.200" boxSize={8} />
              <Text color="gray.400" fontSize="sm">A calm space... no alerts.</Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider />}>
              {notifications.map(n => (
                <Box key={n.id} p={4} _hover={{ bg: 'gray.50' }} transition="0.2s">
                  <HStack align="start" spacing={3}>
                    <Box bg="#E9F2ED" p={2} borderRadius="xl">
                      <Icon as={getIcon(n.type)} color="#56756D" />
                    </Box>
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontWeight="700" fontSize="sm" color="#2E2E2E">{n.title}</Text>
                      <Text fontSize="xs" color="gray.500">{n.body}</Text>
                      <Text fontSize="10px" color="gray.300" mt={1}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
        <PopoverFooter border="none" pb={4}>
          <Button w="full" variant="outline" size="sm" borderRadius="full">
            View all history
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
