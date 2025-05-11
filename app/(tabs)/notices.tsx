import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

const BACKGROUND_COLOR = "#F5F6F8";

const NoticeSkeletonLoader = memo(() => (
  <View style={styles.card}>
    <View style={styles.noticeHeader}>
      <Skeleton width={80} height={12} style={{ alignSelf: "flex-end" }} />
    </View>

    <Skeleton width="95%" height={16} style={{ marginBottom: 6 }} />
    <Skeleton width="60%" height={16} style={{ marginBottom: 12 }} />

    <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
    <Skeleton width="85%" height={14} />
  </View>
));

const PinnedNoticeSkeletonLoader = memo(() => (
  <View style={[styles.card, styles.pinnedNotice]}>
    <View style={styles.noticeHeader}>
      <View style={styles.pinnedIcon}>
        <Skeleton width={14} height={14} borderRadius={7} />
      </View>
      <Skeleton width={80} height={12} />
    </View>

    <Skeleton width="95%" height={16} style={{ marginBottom: 6 }} />
    <Skeleton width="70%" height={16} style={{ marginBottom: 12 }} />

    <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
    <Skeleton width="85%" height={14} />
  </View>
));

export default function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = useCallback(async (shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get<Notice[]>("/notices");

      const sortedNotices = [...data].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setNotices(sortedNotices);
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleRefresh = useCallback(() => {
    fetchNotices(true);
  }, [fetchNotices]);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    } catch (error) {
      return dateString;
    }
  }, []);

  const renderNoticeItem: ListRenderItem<Notice> = useCallback(
    ({ item }) => {
      return (
        <TouchableOpacity
          style={[styles.card, item.isPinned && styles.pinnedNotice]}
          activeOpacity={0.7}
          onPress={() => router.push(`/notices/${item.id}`)}
        >
          <View style={styles.noticeHeader}>
            {item.isPinned && (
              <View style={styles.pinnedIcon}>
                <Ionicons name="pin" size={14} color={COLORS.danger600} />
              </View>
            )}
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          <Text style={styles.noticeTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.noticeContent} numberOfLines={2}>
            {item.content}
          </Text>
        </TouchableOpacity>
      );
    },
    [formatDate]
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="notifications-outline"
          size={64}
          color={COLORS.gray300}
        />
        <Text style={styles.emptyText}>등록된 공지사항이 없습니다</Text>
      </View>
    );
  }, [loading]);

  const renderSkeletonList = () => (
    <View style={{ gap: 12 }}>
      <PinnedNoticeSkeletonLoader />
      <NoticeSkeletonLoader />
      <NoticeSkeletonLoader />
      <NoticeSkeletonLoader />
    </View>
  );

  const keyExtractor = useCallback((item: Notice) => item.id.toString(), []);

  const memoizedRefreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={COLORS.primary500}
        colors={[COLORS.primary500]}
      />
    ),
    [refreshing, handleRefresh]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.white} animated />

      <SafeAreaView style={styles.headerArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>공지사항</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="filter-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <View style={styles.contentContainer}>
          {loading && !refreshing ? (
            <View style={styles.scrollContent}>{renderSkeletonList()}</View>
          ) : (
            <FlatList
              data={notices}
              renderItem={renderNoticeItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={memoizedRefreshControl}
              ListEmptyComponent={renderEmpty}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerArea: {
    backgroundColor: COLORS.white,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
  },
  bgExtender: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1000,
    height: 1000,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedNotice: {
    backgroundColor: COLORS.danger50,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  pinnedIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  noticeContent: {
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
