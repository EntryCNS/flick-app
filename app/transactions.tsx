import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  SectionListRenderItem,
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

interface Transaction {
  id: number;
  type: "CHARGE" | "PAYMENT";
  amount: number;
  booth?: {
    name: string;
  };
  product?: {
    name: string;
  };
  memo?: string;
  createdAt: string;
}

interface TransactionSection {
  title: string;
  data: Transaction[];
}

const TransactionSkeletonItem = memo(() => (
  <View style={styles.transactionItem}>
    <View
      style={[styles.transactionIcon, { backgroundColor: COLORS.gray100 }]}
    />

    <View style={styles.transactionContent}>
      <View>
        <Skeleton width={120} height={15} style={{ marginBottom: 5 }} />
        <Skeleton width={100} height={13} />
      </View>

      <View style={styles.transactionRight}>
        <Skeleton width={80} height={16} style={{ marginBottom: 5 }} />
        <Skeleton width={40} height={12} />
      </View>
    </View>
  </View>
));

const TransactionSectionHeader = memo(({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
));

const TransactionSkeletonHeader = memo(() => (
  <View style={styles.sectionHeader}>
    <Skeleton width={60} height={14} />
  </View>
));

const TransactionsSkeleton = memo(() => (
  <>
    <TransactionSkeletonHeader />
    {Array.from({ length: 3 }, (_, index) => (
      <TransactionSkeletonItem key={`skeleton-1-${index}`} />
    ))}

    <TransactionSkeletonHeader />
    {Array.from({ length: 3 }, (_, index) => (
      <TransactionSkeletonItem key={`skeleton-2-${index}`} />
    ))}
  </>
));

export default function TransactionsScreen() {
  const [transactionSections, setTransactionSections] = useState<
    TransactionSection[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const groupTransactionsByDate = useCallback(
    (transactions: Transaction[]): TransactionSection[] => {
      const groups: { [key: string]: Transaction[] } = {};

      transactions.forEach((transaction) => {
        const date = dayjs(transaction.createdAt);
        const dateKey = date.format("YYYY.MM.DD");

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }

        groups[dateKey].push(transaction);
      });

      return Object.keys(groups)
        .sort((a, b) => dayjs(b).diff(dayjs(a)))
        .map((date) => {
          let title = date;
          const today = dayjs();
          const yesterday = today.subtract(1, "day");

          if (dayjs(date).isSame(today, "day")) {
            title = "오늘";
          } else if (dayjs(date).isSame(yesterday, "day")) {
            title = "어제";
          }

          return {
            title,
            data: groups[date].sort((a, b) =>
              dayjs(b.createdAt).diff(dayjs(a.createdAt))
            ),
          };
        });
    },
    []
  );

  const fetchTransactions = useCallback(
    async (pageNum = 1, shouldRefresh = false): Promise<void> => {
      try {
        if (shouldRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const { data } = await api.get<Transaction[]>(
          `/transactions/my?page=${pageNum}&limit=20`
        );

        if (data.length < 20) {
          setHasMore(false);
        }

        if (pageNum === 1) {
          setTransactionSections(groupTransactionsByDate(data));
        } else {
          const allTransactions = [
            ...transactionSections.flatMap((section) => section.data),
            ...data,
          ];
          setTransactionSections(groupTransactionsByDate(allTransactions));
        }
      } catch (error) {
        console.error("거래 내역 조회 실패:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [transactionSections, groupTransactionsByDate]
  );

  const handleRefresh = useCallback((): void => {
    setPage(1);
    setHasMore(true);
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  const handleLoadMore = useCallback((): void => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  }, [hasMore, loadingMore, page, fetchTransactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatAmount = useCallback((amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  }, []);

  const formatTime = useCallback((dateString: string): string => {
    return dayjs(dateString).format("HH:mm");
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <TransactionSectionHeader title={section.title} />
    ),
    []
  );

  const renderItem: SectionListRenderItem<Transaction, TransactionSection> =
    useCallback(
      ({ item }) => {
        const isCharge = item.type === "CHARGE";

        const iconName = isCharge ? "wallet-outline" : "cart-outline";
        const iconBg = isCharge ? COLORS.success50 : COLORS.primary50;
        const iconColor = isCharge ? COLORS.success600 : COLORS.primary600;

        return (
          <TouchableOpacity
            style={styles.transactionItem}
            activeOpacity={0.7}
            onPress={() => router.push(`/transactions/${item.id}`)}
          >
            <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName} size={20} color={iconColor} />
            </View>

            <View style={styles.transactionContent}>
              <View>
                <Text style={styles.transactionTitle} numberOfLines={1}>
                  {isCharge ? "포인트 충전" : item.product!.name}
                </Text>
                <Text style={styles.transactionSubtitle} numberOfLines={1}>
                  {isCharge ? item.memo || "" : item.booth!.name}
                </Text>
              </View>

              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    isCharge ? styles.amountPositive : styles.amountNegative,
                  ]}
                >
                  {formatAmount(item.amount, item.type)}원
                </Text>

                <Text style={styles.transactionDate}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      },
      [formatAmount, formatTime]
    );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <TransactionSkeletonItem />
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.gray300} />
        <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
      </View>
    );
  }, [loading]);

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
          <Text style={styles.headerTitle}>결제 내역</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        {loading && !refreshing ? (
          <View style={styles.listContent}>
            <TransactionsSkeleton />
          </View>
        ) : (
          <SectionList
            sections={transactionSections}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={memoizedRefreshControl}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            ItemSeparatorComponent={null}
            stickySectionHeadersEnabled={false}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
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
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  transactionItem: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    marginBottom: 2,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 14,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  amountPositive: {
    color: COLORS.success600,
  },
  amountNegative: {
    color: COLORS.danger600,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerLoader: {
    paddingVertical: 16,
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
