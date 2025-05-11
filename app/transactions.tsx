import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

interface Transaction {
  id: number;
  type: "CHARGE" | "PAYMENT";
  amount: number;
  booth: {
    name: string;
  };
  product: {
    name: string;
  };
  memo?: string;
  createdAt: string;
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

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
          setTransactions(data);
        } else {
          setTransactions((prev) => [...prev, ...data]);
        }
      } catch (error) {
        console.error("거래 내역 조회 실패:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
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
  }, [fetchTransactions]);

  const formatAmount = useCallback((amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dateText = "";
      if (date.toDateString() === today.toDateString()) {
        dateText = "오늘";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateText = "어제";
      } else {
        dateText = `${date.getFullYear()}.${String(
          date.getMonth() + 1
        ).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
      }

      const timeText = date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return `${dateText} ${timeText}`;
    } catch (error) {
      console.error("날짜 포맷 오류:", error);
      return dateString;
    }
  }, []);

  const renderItem: ListRenderItem<Transaction> = useCallback(
    ({ item }) => {
      const isCharge = item.type === "CHARGE";

      const iconName = isCharge ? "wallet-outline" : "cart-outline";
      const iconBg = isCharge ? COLORS.success50 : COLORS.primary50;
      const iconColor = isCharge ? COLORS.success600 : COLORS.primary600;

      return (
        <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
          <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>

          <View style={styles.transactionContent}>
            <View>
              <Text style={styles.transactionTitle} numberOfLines={1}>
                {isCharge ? "포인트 충전" : item.product.name}
              </Text>
              <Text style={styles.transactionSubtitle} numberOfLines={1}>
                {isCharge ? item.memo || "" : item.booth.name}
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
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [formatAmount, formatDate]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary500} />
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

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const keyExtractor = useCallback(
    (item: Transaction) => item.id.toString(),
    []
  );

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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제 내역</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary500} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={memoizedRefreshControl}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    paddingVertical: 16,
    alignItems: "center",
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 16,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  transactionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: -0.1,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: 5,
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
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
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
