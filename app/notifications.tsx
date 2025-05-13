import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItem,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Notification {
  id: number;
  title: string;
  body: string;
  type: "SYSTEM" | "PAYMENT" | "EVENT";
  isRead: boolean;
  createdAt: string;
}

interface NotificationIcon {
  name: string;
  color: string;
  bg: string;
}

const NotificationSkeletonItem = memo(() => (
  <View style={styles.notificationItem}>
    <View
      style={[styles.notificationIcon, { backgroundColor: COLORS.gray100 }]}
    />

    <View style={styles.notificationContent}>
      <View style={styles.notificationHeader}>
        <Skeleton width={140} height={15} />
        <Skeleton width={50} height={12} />
      </View>
      <Skeleton width="95%" height={14} style={{ marginTop: 4 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 3 }} />
    </View>
  </View>
));

const NotificationsSkeletonList = memo(() => (
  <>
    {Array.from({ length: 10 }, (_, index) => (
      <NotificationSkeletonItem key={`skeleton-${index}`} />
    ))}
  </>
));

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getNotificationIcon = useCallback((type: string): NotificationIcon => {
    switch (type) {
      case "SYSTEM":
        return {
          name: "alert-circle-outline",
          color: COLORS.info600,
          bg: COLORS.info50,
        };
      case "PAYMENT":
        return {
          name: "wallet-outline",
          color: COLORS.success600,
          bg: COLORS.success50,
        };
      case "EVENT":
        return {
          name: "calendar-outline",
          color: COLORS.warning600,
          bg: COLORS.warning50,
        };
      default:
        return {
          name: "notifications-outline",
          color: COLORS.primary600,
          bg: COLORS.primary50,
        };
    }
  }, []);

  const fetchNotifications = useCallback(
    async (shouldRefresh = false): Promise<void> => {
      try {
        if (shouldRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const { data } = await api.get<Notification[]>("/notifications/my");
        setNotifications(data);
      } catch (error) {
        console.error("알림 목록 조회 실패:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const handleRefresh = useCallback((): void => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = useCallback(async (id: number): Promise<void> => {
    try {
      await api.post(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  }, []);

  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = dayjs(dateString);
    const now = dayjs();

    if (now.diff(date, "hour") < 48) {
      return date.fromNow();
    }

    if (date.year() === now.year()) {
      return date.format("M월 D일");
    }

    return date.format("YYYY년 M월 D일");
  }, []);

  const renderItem: ListRenderItem<Notification> = useCallback(
    ({ item }) => {
      const icon = getNotificationIcon(item.type);

      return (
        <TouchableOpacity
          style={[
            styles.notificationItem,
            item.isRead && styles.notificationItemRead,
          ]}
          activeOpacity={0.7}
          onPress={() => markAsRead(item.id)}
        >
          <View style={[styles.notificationIcon, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name as any} size={18} color={icon.color} />
          </View>

          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.notificationDate}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>

            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [getNotificationIcon, formatRelativeTime, markAsRead]
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="notifications-off-outline"
          size={64}
          color={COLORS.gray300}
        />
        <Text style={styles.emptyText}>알림이 없습니다</Text>
      </View>
    );
  }, [loading]);

  const keyExtractor = useCallback(
    (item: Notification): string => item.id.toString(),
    []
  );

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={COLORS.primary500}
        colors={[COLORS.primary500]}
        progressBackgroundColor={COLORS.white}
      />
    ),
    [refreshing, handleRefresh]
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>알림</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        {loading && !refreshing ? (
          <View style={styles.listContent}>
            <NotificationsSkeletonList />
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && { flex: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={memoizedRefreshControl}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={null}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            removeClippedSubviews={Platform.OS === "android"}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  statusBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
  safeArea: {
    backgroundColor: COLORS.white,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    marginBottom: 1,
  },
  notificationItemRead: {
    backgroundColor: COLORS.gray50,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  notificationBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.gray500,
  },
});
