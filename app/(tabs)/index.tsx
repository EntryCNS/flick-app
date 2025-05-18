import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
  Platform,
  Animated as RNAnimated,
  StyleProp,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";
import { useBalanceStore } from "@/stores/balance";
import { Skeleton } from "@/components/Skeleton";

dayjs.locale("ko");

const BACKGROUND_COLOR = "#F5F6F8";

interface Transaction {
  id: number;
  type: "CHARGE" | "PAYMENT";
  amount: number;
  booth: {
    name: string;
    category?: string;
  };
  product: {
    name: string;
  };
  memo?: string;
  createdAt: string;
}

interface AnimatedBalanceDisplayProps {
  value: number | null;
  style: StyleProp<TextStyle>;
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (id: number) => void;
  formatAmount: (amount: number, type: string) => string;
  formatTime: (dateTime: string) => string;
  getTransactionIcon: (transaction: Transaction) => {
    name: string;
    color: string;
    bg: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
}

const AnimatedBalanceDisplay: React.FC<AnimatedBalanceDisplayProps> = ({
  value,
  style,
}) => {
  const animatedValue = useRef(new RNAnimated.Value(value || 0)).current;
  const [displayValue, setDisplayValue] = useState<number>(value || 0);

  useEffect(() => {
    if (value === null) return;

    RNAnimated.timing(animatedValue, {
      toValue: value,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  return <Text style={style}>{displayValue.toLocaleString()}</Text>;
};

const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({ transaction, onPress, formatAmount, formatTime, getTransactionIcon }) => {
    const icon = getTransactionIcon(transaction);
    const isCharge = transaction.type === "CHARGE";

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        activeOpacity={0.6}
        onPress={() => onPress(transaction.id)}
      >
        <View style={styles.transactionIconContainer}>
          <View style={[styles.iconBg, { backgroundColor: icon.bg }]}>
            <FontAwesome5 name={icon.name} size={15} color={icon.color} solid />
          </View>
        </View>
        <View style={styles.transactionContent}>
          <View>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {isCharge ? "포인트 충전" : transaction.product.name}
            </Text>
            <Text style={styles.transactionSubtitle} numberOfLines={1}>
              {isCharge ? transaction.memo || "" : transaction.booth.name}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text
              style={[
                styles.transactionAmount,
                isCharge ? styles.amountPositive : styles.amountNegative,
              ]}
            >
              {formatAmount(transaction.amount, transaction.type)}원
            </Text>
            <Text style={styles.transactionDate}>
              {formatTime(transaction.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const TransactionsList: React.FC<{
  transactions: Transaction[];
  isLoading: boolean;
  user: User | null;
  formatAmount: (amount: number, type: string) => string;
  formatTime: (dateTime: string) => string;
  getTransactionIcon: (transaction: Transaction) => {
    name: string;
    color: string;
    bg: string;
  };
  onItemPress: (id: number) => void;
}> = React.memo(
  ({
    transactions,
    isLoading,
    user,
    formatAmount,
    formatTime,
    getTransactionIcon,
    onItemPress,
  }) => {
    const renderTransactionSkeletons = useCallback(
      () => (
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={`skeleton-${index}`} style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                <Skeleton width={34} height={34} borderRadius={10} />
              </View>
              <View style={styles.transactionContent}>
                <View>
                  <Skeleton
                    width={120}
                    height={15}
                    style={{ marginBottom: 5 }}
                  />
                  <Skeleton width={100} height={13} />
                </View>
                <View style={styles.transactionRight}>
                  <Skeleton
                    width={80}
                    height={16}
                    style={{ marginBottom: 5 }}
                  />
                  <Skeleton width={40} height={12} />
                </View>
              </View>
            </View>
          ))}
        </>
      ),
      []
    );

    if (isLoading || !user) {
      return (
        <View style={styles.transactionsContent}>
          {renderTransactionSkeletons()}
        </View>
      );
    }

    if (transactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="receipt" size={20} color={COLORS.gray300} />
          <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionsContent}>
        {transactions.slice(0, 5).map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={onItemPress}
            formatAmount={formatAmount}
            formatTime={formatTime}
            getTransactionIcon={getTransactionIcon}
          />
        ))}
      </View>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!prevProps.user && nextProps.user) return false;
    if (prevProps.user && !nextProps.user) return false;

    if (prevProps.transactions.length !== nextProps.transactions.length)
      return false;

    if (
      prevProps.transactions.length > 0 &&
      nextProps.transactions.length > 0
    ) {
      if (prevProps.transactions[0].id !== nextProps.transactions[0].id)
        return false;
    }

    return true;
  }
);

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    balance,
    isLoading: isBalanceLoading,
    fetchBalance,
    refreshBalance,
  } = useBalanceStore();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const rotate = useSharedValue(0);

  const {
    data: transactions = [],
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
    refetch: refetchTransactions,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get<Transaction[]>("/transactions/my");
      return response.data;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user, fetchBalance]);

  useEffect(() => {
    const prevBalance = queryClient.getQueryData<number>(["balance", "prev"]);
    const currentBalance = balance;

    if (
      prevBalance !== undefined &&
      currentBalance !== null &&
      prevBalance !== currentBalance
    ) {
      refetchTransactions();
    }

    if (currentBalance !== null) {
      queryClient.setQueryData(["balance", "prev"], currentBalance);
    }
  }, [balance, queryClient, refetchTransactions]);

  const isLoadingInitial = isBalanceLoading && isTransactionsLoading;
  const isRefreshing = isTransactionsFetching && !isLoadingInitial;

  const getTransactionIcon = useCallback((transaction: Transaction) => {
    if (transaction.type === "CHARGE") {
      return {
        name: "wallet",
        color: "#16A34A",
        bg: "#F0FDF4",
      };
    }

    const category = transaction.booth?.category || "";

    switch (category) {
      case "FOOD":
        return {
          name: "utensils",
          color: "#D97706",
          bg: "#FFFBEB",
        };
      case "DRINK":
        return {
          name: "coffee",
          color: "#2563EB",
          bg: "#EFF6FF",
        };
      case "GAME":
        return {
          name: "gamepad",
          color: "#7C3AED",
          bg: "#F5F3FF",
        };
      case "GOODS":
        return {
          name: "shopping-bag",
          color: "#4F46E5",
          bg: "#EEF2FF",
        };
      default:
        return {
          name: "store",
          color: "#4F46E5",
          bg: "#EEF2FF",
        };
    }
  }, []);

  const formatAmount = useCallback((amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  }, []);

  const formatTime = useCallback((dateTimeString: string): string => {
    return dayjs(dateTimeString).format("HH:mm");
  }, []);

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!refreshing && user) {
      setRefreshing(true);
      rotate.value = 0;
      rotate.value = withTiming(360, { duration: 600 });

      try {
        await Promise.all([refreshBalance(), refetchTransactions()]);
      } catch (error) {
        console.error("Refresh error:", error);
      }

      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  }, [refreshing, user, refreshBalance, refetchTransactions, rotate]);

  const navigateToTransactionDetail = useCallback((id: number): void => {
    router.push(`/transactions/${id}`);
  }, []);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.logoText}>
            <Text style={styles.highlightText}>F</Text>lick
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleRefresh}
              disabled={refreshing || isLoadingInitial}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View style={rotateStyle}>
                <Ionicons name="refresh" size={22} color={COLORS.text} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/notifications")}
              disabled={isLoadingInitial && !user}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={COLORS.text}
              />
              {!isLoadingInitial && user && (
                <View style={styles.notificationBadge} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary500}
            colors={[COLORS.primary500]}
            progressBackgroundColor={COLORS.white}
          />
        }
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push("/qr-scanner")}
          disabled={isLoadingInitial && !user}
        >
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>결제하기</Text>
            <FontAwesome5
              name="chevron-right"
              size={12}
              color={COLORS.gray300}
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>계좌</Text>
          </View>

          {isLoadingInitial || !user ? (
            <View style={styles.accountContainer}>
              <View
                style={[
                  styles.accountLogoContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Skeleton width={34} height={34} borderRadius={17} />
              </View>
              <View style={styles.accountDetails}>
                <Skeleton width={80} height={14} style={{ marginBottom: 8 }} />
                <Skeleton width={140} height={22} />
              </View>
            </View>
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
                  <AnimatedBalanceDisplay
                    value={balance}
                    style={styles.accountBalance}
                  />
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
          disabled={isLoadingInitial && !user}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>거래 내역</Text>
            <FontAwesome5
              name="chevron-right"
              size={12}
              color={COLORS.gray300}
              style={styles.chevronIcon}
            />
          </View>

          <View style={styles.transactionsList}>
            <TransactionsList
              transactions={transactions}
              isLoading={isLoadingInitial}
              user={user}
              formatAmount={formatAmount}
              formatTime={formatTime}
              getTransactionIcon={getTransactionIcon}
              onItemPress={navigateToTransactionDetail}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  statusBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 1,
  },
  safeArea: {
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: BACKGROUND_COLOR,
  },
  logoText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  highlightText: {
    color: COLORS.primary600,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
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
    backgroundColor: BACKGROUND_COLOR,
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
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  chevronIcon: {
    opacity: 0.7,
    marginRight: 2,
  },
  cardTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 21,
    color: COLORS.text,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  accountContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  accountLogoContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  accountLogo: {
    width: 24,
    height: 24,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontFamily: "Pretendard-Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  accountBalance: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  wonText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 1,
    letterSpacing: -0.3,
  },
  transactionsList: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  transactionsContent: {
    gap: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  emptyText: {
    fontFamily: "Pretendard-Medium",
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray500,
  },
  transactionItem: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: COLORS.white,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  transactionIconContainer: {
    marginRight: 10,
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  transactionSubtitle: {
    fontFamily: "Pretendard-Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontFamily: "Pretendard-Bold",
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  transactionDate: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  amountPositive: {
    color: COLORS.success600,
  },
  amountNegative: {
    color: COLORS.danger600,
  },
});
