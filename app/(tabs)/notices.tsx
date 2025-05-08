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

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

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
          style={[styles.noticeItem, item.isPinned && styles.pinnedNotice]}
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>공지사항</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary500} />
        </View>
      ) : (
        <FlatList
          data={notices}
          renderItem={renderNoticeItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  noticeItem: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: 12,
  },
  pinnedNotice: {
    borderColor: COLORS.danger100,
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
  separator: {
    height: 8,
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
