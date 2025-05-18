import React, { useCallback, memo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeIn,
} from "react-native-reanimated";
import { MotiView } from "moti";

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
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Notice>);

const NoticeSkeletonLoader = memo(() => (
  <MotiView
    style={styles.card}
    from={{ opacity: 0.6 }}
    animate={{ opacity: 1 }}
    transition={{ type: "timing", duration: 1000, loop: true }}
  >
    <View style={styles.cardHeader}>
      <Skeleton width={80} height={12} />
    </View>
    <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
    <Skeleton width="85%" height={14} style={{ marginBottom: 4 }} />
    <Skeleton width="70%" height={14} />
  </MotiView>
));

const NoticeItem = memo(
  ({
    notice,
    formatDate,
    onPress,
  }: {
    notice: Notice;
    formatDate: (date: string) => string;
    onPress: (id: number) => void;
  }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onPress(notice.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{formatDate(notice.createdAt)}</Text>
          {notice.isPinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>고정</Text>
            </View>
          )}
        </View>
        <Text style={styles.noticeTitle} numberOfLines={2}>
          {notice.title}
        </Text>
        <Text style={styles.noticeContent} numberOfLines={2}>
          {notice.content}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
);

const EmptyNoticeList = memo(() => (
  <Animated.View style={styles.emptyContainer} entering={FadeIn.duration(400)}>
    <Ionicons name="notifications-outline" size={64} color={COLORS.gray300} />
    <Text style={styles.emptyText}>등록된 공지사항이 없습니다</Text>
  </Animated.View>
));

export default function NoticesScreen() {
  const scrollY = useSharedValue(0);
  const flashListRef = useRef(null);

  const fetchNotices = useCallback(async (): Promise<Notice[]> => {
    const { data } = await api.get<Notice[]>("/notices");
    return data.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, []);

  const {
    data: notices = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["notices"],
    queryFn: fetchNotices,
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    } catch {
      return dateString;
    }
  }, []);

  const handleNoticePress = useCallback((id: number): void => {
    router.push(`/notices/${id}`);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderNoticeItem = useCallback(
    ({ item }: { item: Notice; index: number }) => (
      <NoticeItem
        notice={item}
        formatDate={formatDate}
        onPress={handleNoticePress}
      />
    ),
    [formatDate, handleNoticePress]
  );

  const keyExtractor = useCallback(
    (item: Notice): string => `notice-${item.id}`,
    []
  );

  const itemSeparator = useCallback(() => <View style={{ height: 10 }} />, []);

  const renderSkeletonList = useCallback(
    () => (
      <FlashList<number>
        data={Array.from({ length: 5 }, (_, i) => i)}
        renderItem={() => <NoticeSkeletonLoader />}
        keyExtractor={(_, index) => `skeleton-${index}`}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={150}
        ItemSeparatorComponent={itemSeparator}
      />
    ),
    [itemSeparator]
  );

  const isInitialLoading = isLoading && !isFetching;
  const isRefreshing = isFetching && !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>공지사항</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <View style={styles.contentContainer}>
          {isInitialLoading ? (
            renderSkeletonList()
          ) : (
            <AnimatedFlashList
              ref={flashListRef}
              data={notices}
              renderItem={renderNoticeItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={150}
              onScroll={scrollHandler}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refetch}
                  tintColor={COLORS.primary500}
                  colors={[COLORS.primary500]}
                  progressBackgroundColor={COLORS.white}
                />
              }
              ListEmptyComponent={isLoading ? null : <EmptyNoticeList />}
              ItemSeparatorComponent={itemSeparator}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pinnedBadge: {
    backgroundColor: COLORS.primary50,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinnedText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 11,
    color: COLORS.primary600,
  },
  noticeTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  noticeContent: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: "Pretendard-Medium",
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray500,
  },
});
