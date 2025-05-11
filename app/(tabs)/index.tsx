import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";

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

interface TransactionItemProps {
  transaction: Transaction;
  formatAmount: (amount: number, type: string) => string;
  formatTime: (dateTimeString: string) => string;
}

interface TransactionSkeletonProps {
  index: number;
}

const BACKGROUND_COLOR = "#F5F6F8";

const AccountSkeletonLoader = memo(() => (
  <View style={styles.accountContainer}>
    <View
      style={[styles.accountLogoContainer, { backgroundColor: "transparent" }]}
    >
      <Skeleton width={40} height={40} borderRadius={20} />
    </View>
    <View style={styles.accountDetails}>
      <Skeleton width={80} height={14} style={{ marginBottom: 8 }} />
      <Skeleton width={140} height={22} />
    </View>
  </View>
));

const TransactionSkeletonLoader = memo(
  ({ index }: TransactionSkeletonProps) => {
    const nameWidth = [160, 140, 150][index % 3] as number;
    const amountWidth = [80, 70, 75][index % 3] as number;
    const dateWidth = [70, 65, 75][index % 3] as number;
    const placeWidth = [90, 110, 100][index % 3] as number;

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionRow}>
          <Skeleton width={nameWidth} height={16} style={{ marginRight: 8 }} />
          <Skeleton width={amountWidth} height={16} />
        </View>
        <View style={[styles.transactionMetaRow, { marginTop: 8 }]}>
          <Skeleton width={dateWidth} height={12} />
          <Skeleton width={placeWidth} height={12} />
        </View>
      </View>
    );
  }
);

const TransactionItem = memo(
  ({ transaction, formatAmount, formatTime }: TransactionItemProps) => {
    const isCharge = transaction.type === "CHARGE";

    const formatDate = (dateString: string): string => {
      const today = new Date();
      const date = new Date(dateString);

      if (today.toDateString() === date.toDateString()) {
        return "오늘";
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (yesterday.toDateString() === date.toDateString()) {
        return "어제";
      }

      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        activeOpacity={0.6}
        onPress={() => router.push(`/transactions/${transaction.id}`)}
      >
        <View style={styles.transactionRow}>
          <Text style={styles.transactionName} numberOfLines={1}>
            {isCharge ? "포인트 충전" : transaction.product.name}
          </Text>
          <Text
            style={[
              styles.transactionAmount,
              isCharge ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {formatAmount(transaction.amount, transaction.type)}원
          </Text>
        </View>

        <View style={styles.transactionMetaRow}>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}{" "}
            {formatTime(transaction.createdAt)}
          </Text>
          <Text style={styles.transactionPlace} numberOfLines={1}>
            {isCharge ? transaction.memo || "" : transaction.booth.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollY = useRef(new Animated.Value(0)).current;
  const refreshAnim = useRef(new Animated.Value(0)).current;

  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [BACKGROUND_COLOR, COLORS.white],
    extrapolate: "clamp",
  });

  const spin = refreshAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const formatAmount = useCallback((amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  }, []);

  const formatTime = useCallback((dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setRefreshing(true);

      Animated.timing(refreshAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      const [balanceResponse, transactionsResponse] = await Promise.all([
        api.get<number>("/users/me/balance"),
        api.get<Transaction[]>("/transactions/my"),
      ]);

      setBalance(balanceResponse.data);
      setTransactions(transactionsResponse.data);

      refreshAnim.setValue(0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshAnim]);

  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      fetchData();
    }
  }, [refreshing, fetchData]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const renderTransactionSkeletons = () => (
    <>
      {[0, 1, 2].map((index) => (
        <TransactionSkeletonLoader key={`skeleton-${index}`} index={index} />
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar animated style="light" backgroundColor={BACKGROUND_COLOR} />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Animated.View
          style={[styles.header, { backgroundColor: headerBackgroundColor }]}
        >
          <Text style={styles.logoText}>
            <Text style={styles.highlightText}>F</Text>lick
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
              disabled={refreshing || loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={
                    refreshing || loading ? COLORS.primary500 : COLORS.text
                  }
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/notifications")}
              disabled={loading && !user}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color={COLORS.text}
              />
              {!loading && user && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary500}
            colors={[COLORS.primary500]}
            progressBackgroundColor={COLORS.white}
            progressViewOffset={20}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.extender} />

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/qr-scanner")}
          disabled={loading && !user}
        >
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>결제하기</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>계좌</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </View>

          {loading || !user || balance === null ? (
            <AccountSkeletonLoader />
          ) : (
            <TouchableOpacity
              style={styles.accountContainer}
              activeOpacity={0.7}
            >
              <View style={styles.accountLogoContainer}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.accountLogo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{user.name}님의 통장</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.accountBalance}>
                    {balance.toLocaleString()}
                  </Text>
                  <Text style={styles.wonText}>원</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => user && router.push("/transactions")}
          disabled={loading && !user}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>결제 내역</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </View>

          <View style={styles.transactionsList}>
            {loading || !user ? (
              <View style={styles.transactionsContent}>
                {renderTransactionSkeletons()}
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color={COLORS.gray300}
                />
                <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
              </View>
            ) : (
              <View style={styles.transactionsContent}>
                {transactions.slice(0, 3).map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    formatAmount={formatAmount}
                    formatTime={formatTime}
                  />
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  safeArea: {
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 2,
  },
  extender: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1000,
    height: 1000,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: -1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    zIndex: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  highlightText: {
    color: COLORS.primary600,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger500,
  },
  scrollView: {
    flex: 1,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  accountLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  accountLogo: {
    width: 28,
    height: 28,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 3,
    fontWeight: "400",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  wonText: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.text,
    marginLeft: 2,
    marginBottom: 0,
  },
  transactionsList: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  transactionsContent: {
    gap: 10,
  },
  emptyContainer: {
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.gray500,
  },
  transactionItem: {
    paddingVertical: 10,
    marginBottom: 2,
    backgroundColor: "white",
    borderRadius: 8,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  transactionPlace: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "400",
    textAlign: "right",
    maxWidth: 140,
  },
  amountPositive: {
    color: COLORS.success600,
  },
  amountNegative: {
    color: COLORS.danger600,
  },
});
