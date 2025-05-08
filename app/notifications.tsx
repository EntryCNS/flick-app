import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";

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

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
  }, [fetchNotifications]);

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

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `오늘 ${hours}:${minutes}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "어제";
      } else {
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
      }
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return dateString;
    }
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
                {formatDate(item.createdAt)}
              </Text>
            </View>

            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      );
    },
    [getNotificationIcon, formatDate, markAsRead]
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

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary500} />
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
          ItemSeparatorComponent={renderSeparator}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  notificationItemRead: {
    opacity: 0.7,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    marginBottom: 6,
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
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary500,
    position: "absolute",
    top: 17,
    right: 0,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
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
