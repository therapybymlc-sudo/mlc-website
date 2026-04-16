import { useEffect, useMemo, useState } from "react";
import { Badge, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { schedulingApi } from "../../../api/scheduling";
import SchedulePageHeader from "../../../components/scheduling/SchedulePageHeader";
import ScheduleSectionCard from "../../../components/scheduling/ScheduleSectionCard";
import ScheduleEmptyState from "../../../components/scheduling/ScheduleEmptyState";
import ScheduleLoadingState from "../../../components/scheduling/ScheduleLoadingState";
import ScheduleErrorState from "../../../components/scheduling/ScheduleErrorState";
import ScheduleActionBar from "../../../components/scheduling/ScheduleActionBar";
import { formatDateTime } from "../../../utils/scheduling";
import { getSchedulingErrorMessage } from "../../../utils/schedulingErrors";

export default function SchedulingNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = (() => {
    try { return useNavigate(); } catch (e) { return () => {}; }
  })();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await schedulingApi.listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to load notifications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.is_read),
    [notifications]
  );

  const readNotifications = useMemo(
    () => notifications.filter((item) => item.is_read),
    [notifications]
  );

  const handleMarkRead = async (notificationId) => {
    try {
      await schedulingApi.markNotificationRead(notificationId);
      await loadNotifications();
    } catch (err) {
      setError(getSchedulingErrorMessage(err, "Unable to mark as read."));
    }
  };

  const handleOpen = async (notification) => {
    if (!notification?.action_url) return;
    if (!notification.is_read) {
      await handleMarkRead(notification.id);
    }
    if (notification.action_url.startsWith("/")) {
      navigate(notification.action_url);
      return;
    }
    window.open(notification.action_url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <ScheduleLoadingState label="Loading notifications…" />;
  }

  if (error) {
    return <ScheduleErrorState description={error} onRetry={loadNotifications} />;
  }

  const renderList = (items) => {
    if (items.length === 0) {
      return (
        <ScheduleEmptyState
          title="No notifications"
          description="You’re all caught up for now."
        />
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {items.map((notification) => (
          <VStack key={notification.id} align="stretch" spacing={2}>
            <HStack justify="space-between" align="flex-start" flexWrap="wrap">
              <Text fontWeight="semibold">
                {notification.title || "Scheduling update"}
              </Text>
              <Badge
                colorScheme={notification.is_read ? "gray" : "purple"}
                borderRadius="full"
                px={3}
                py={1}
              >
                {notification.is_read ? "Read" : "Unread"}
              </Badge>
            </HStack>
            {notification.body ? (
              <Text fontSize="sm" color="gray.600">
                {notification.body}
              </Text>
            ) : null}
            <Text fontSize="xs" color="gray.500">
              {formatDateTime(notification.created_at)}
            </Text>
            <ScheduleActionBar>
              {notification.action_url ? (
                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="full"
                  onClick={() => handleOpen(notification)}
                >
                  Open
                </Button>
              ) : null}
              {!notification.is_read ? (
                <Button
                  size="sm"
                  borderRadius="full"
                  onClick={() => handleMarkRead(notification.id)}
                >
                  Mark as read
                </Button>
              ) : null}
            </ScheduleActionBar>
          </VStack>
        ))}
      </VStack>
    );
  };

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <SchedulePageHeader
        title="Notifications"
        subtitle="Scheduling and shared-resource updates for you."
      />
      <ScheduleSectionCard title="Unread" subtitle="New updates that need attention.">
        {renderList(unreadNotifications)}
      </ScheduleSectionCard>
      <ScheduleSectionCard title="Earlier" subtitle="Previously viewed updates.">
        {readNotifications.length === 0 ? (
          <ScheduleEmptyState
            title="No earlier notifications"
            description="Read updates will appear here."
          />
        ) : (
          renderList(readNotifications)
        )}
      </ScheduleSectionCard>
    </VStack>
  );
}
