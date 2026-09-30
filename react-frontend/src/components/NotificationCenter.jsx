'use client'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
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
  Circle
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

  const getIconMeta = (type) => {
    if (type.includes('streak')) return { icon: FiZap, color: '#D97706', bg: 'rgba(245, 158, 11, 0.14)' };
    if (type.includes('appointment')) return { icon: FiCheckCircle, color: '#059669', bg: 'rgba(16, 185, 129, 0.14)' };
    if (type.includes('goal')) return { icon: FiTarget, color: '#3182CE', bg: 'rgba(49, 130, 206, 0.14)' };
    return { icon: FiInfo, color: '#56756D', bg: 'rgba(86, 117, 109, 0.14)' };
  };

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative" cursor="pointer">
          <IconButton
            icon={<Icon as={FiBell} boxSize="16px" />}
            variant="ghost"
            borderRadius="full"
            aria-label="Notifications"
            size="sm"
            color="#56756D"
            _hover={{ bg: "rgba(169, 203, 183, 0.12)", color: "#263A33" }}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              bg="#E53E3E"
              color="white"
              borderRadius="full"
              fontSize="9px"
              fontWeight="700"
              px={1.5}
              py={0}
              border="2px solid white"
            >
              {unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent 
        borderRadius="2xl" 
        boxShadow="0 12px 32px -4px rgba(38, 58, 51, 0.12)" 
        border="1px solid" 
        borderColor="rgba(86, 117, 109, 0.16)" 
        w="340px"
        bg="white"
        fontFamily="'Inter', var(--font-inter), sans-serif"
        _focus={{ outline: "none" }}
      >
        <PopoverArrow />
        <PopoverHeader borderBottom="1px solid" borderColor="rgba(86, 117, 109, 0.1)" py={3.5} px={4}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text fontWeight="600" fontSize="14px" color="#263A33">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge bg="rgba(86, 117, 109, 0.14)" color="#56756D" borderRadius="full" fontSize="10px" px={2}>
                  {unreadCount} new
                </Badge>
              )}
            </HStack>
            {unreadCount > 0 && (
              <Button 
                size="xs" 
                variant="ghost" 
                color="#56756D" 
                fontSize="11px"
                fontWeight="600"
                onClick={markAllAsRead}
                _hover={{ color: "#263A33", bg: "rgba(169, 203, 183, 0.1)" }}
              >
                Mark all read
              </Button>
            )}
          </HStack>
        </PopoverHeader>

        <PopoverBody p={0} maxH="360px" overflowY="auto">
          {loading && notifications.length === 0 ? (
            <VStack py={8}><Spinner size="sm" color="#56756D" /></VStack>
          ) : notifications.length === 0 ? (
            <VStack py={8} spacing={2.5}>
              <Circle size="38px" bg="rgba(169, 203, 183, 0.14)" color="#56756D">
                <Icon as={FiBell} boxSize="17px" />
              </Circle>
              <Text color="#5A6E65" fontSize="13px" fontWeight="400">
                A calm space... no new alerts.
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={0} divider={<Divider borderColor="rgba(86, 117, 109, 0.08)" />}>
              {notifications.map(n => {
                const meta = getIconMeta(n.type);
                return (
                  <Box 
                    key={n.id} 
                    p={3.5} 
                    _hover={{ bg: 'rgba(250, 248, 245, 0.9)' }} 
                    transition="background 0.15s ease"
                  >
                    <HStack align="start" spacing={3}>
                      <Circle size="28px" bg={meta.bg} color={meta.color} flexShrink={0} mt={0.5}>
                        <Icon as={meta.icon} boxSize="13px" />
                      </Circle>
                      <VStack align="start" spacing={0.5} flex="1">
                        <Text fontWeight="600" fontSize="13px" color="#263A33" lineHeight="1.3">
                          {n.title}
                        </Text>
                        <Text fontSize="12px" color="#5A6E65" lineHeight="1.4">
                          {n.body}
                        </Text>
                        <Text fontSize="10.5px" color="#8C9B95" pt={0.5}>
                          {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}
        </PopoverBody>

        <PopoverFooter borderTop="1px solid" borderColor="rgba(86, 117, 109, 0.1)" p={3}>
          <Button 
            w="full" 
            variant="outline" 
            size="sm" 
            height="34px"
            borderRadius="full"
            borderColor="rgba(86, 117, 109, 0.2)"
            color="#263A33"
            fontSize="12.5px"
            fontWeight="600"
            _hover={{ bg: "rgba(169, 203, 183, 0.1)", borderColor: "#56756D" }}
          >
            Notification Settings
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
