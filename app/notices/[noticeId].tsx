import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import dayjs from "dayjs";
import Markdown from "react-native-markdown-display";
import "dayjs/locale/ko";

import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { Skeleton } from "@/components/Skeleton";

dayjs.locale("ko");

const BACKGROUND_COLOR = "#F5F6F8";

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

function NoticeSkeleton() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Skeleton width={80} height={12} />
          <Skeleton width={30} height={12} />
        </View>
        <Skeleton width="90%" height={18} style={{ marginBottom: 16 }} />
        <View style={styles.divider} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="95%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="97%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="85%" height={16} style={{ marginBottom: 8 }} />
      </View>
    </ScrollView>
  );
}

function ErrorContent({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <MotiView
      style={styles.errorContainer}
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity
        style={styles.errorBackButton}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <Text style={styles.backButtonText}>돌아가기</Text>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function NoticeDetailScreen() {
  const { noticeId } = useLocalSearchParams<{ noticeId: string }>();

  const {
    data: notice,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: async () => {
      if (!noticeId) throw new Error("공지사항을 찾을 수 없습니다");
      const { data } = await api.get<Notice>(`/notices/${noticeId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : "공지사항을 불러오는데 실패했습니다";

  const handleBack = useCallback(() => router.back(), []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatDate = useCallback((dateString: string): string => {
    return dayjs(dateString).format("YYYY.MM.DD");
  }, []);

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: COLORS.text,
        fontFamily: "Pretendard-Medium",
        fontSize: 15,
      },
      paragraph: {
        marginBottom: 16,
        lineHeight: 22,
        letterSpacing: -0.1,
      },
      heading1: {
        fontFamily: "Pretendard-Bold",
        fontSize: 20,
        marginTop: 16,
        marginBottom: 8,
        color: COLORS.text,
      },
      heading2: {
        fontFamily: "Pretendard-Bold",
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
        color: COLORS.text,
      },
      heading3: {
        fontFamily: "Pretendard-SemiBold",
        fontSize: 16,
        marginTop: 14,
        marginBottom: 8,
        color: COLORS.text,
      },
      link: {
        color: COLORS.primary600,
      },
      blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.gray300,
        paddingLeft: 12,
        marginLeft: 0,
        marginRight: 0,
      },
      code_block: {
        fontFamily: "monospace",
        backgroundColor: COLORS.gray100,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      },
      bullet_list: {
        marginBottom: 16,
      },
      ordered_list: {
        marginBottom: 16,
      },
    }),
    []
  );

  const isPullToRefreshing = isFetching && !isLoading;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Fixed header that won't disappear or move */}
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.statusBarFill} />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>공지사항</Text>
            <View style={styles.rightButtonContainer}>
              {!isLoading && !error && notice && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
              {(isLoading || error || !notice) && (
                <View style={styles.placeholderButton} />
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />

        {isLoading ? (
          <NoticeSkeleton />
        ) : error || !notice ? (
          <ErrorContent message={errorMessage} onBack={handleBack} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isPullToRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary500}
                colors={[COLORS.primary500]}
                progressBackgroundColor={COLORS.white}
              />
            }
          >
            <MotiView
              style={styles.card}
              from={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 250 }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>
                  {formatDate(notice.createdAt)}
                </Text>
                {notice.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Text style={styles.pinnedText}>고정</Text>
                  </View>
                )}
              </View>

              <Text style={styles.noticeTitle}>{notice.title}</Text>

              <View style={styles.divider} />

              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 300, delay: 100 }}
              >
                <Markdown style={markdownStyles}>{notice.content}</Markdown>
              </MotiView>
            </MotiView>
          </ScrollView>
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
  fixedHeaderContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  statusBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: COLORS.white,
    zIndex: 11,
  },
  safeArea: {
    backgroundColor: COLORS.white,
    zIndex: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  rightButtonContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderButton: {
    width: 24,
    height: 24,
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
  scrollView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
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
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  errorText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  errorBackButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  backButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
});
