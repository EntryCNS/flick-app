import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";
import dayjs from "dayjs";

import "dayjs/locale/ko";
dayjs.locale("ko");

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
  onPress: (id: number) => void;
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

const TransactionSkeletonLoader = memo(() => (
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

const TransactionItem = memo(
  ({
    transaction,
    formatAmount,
    formatTime,
    onPress,
  }: TransactionItemProps) => {
    const isCharge = transaction.type === "CHARGE";
    const iconName = isCharge ? "wallet" : "shopping-cart";
    const iconBg = isCharge ? COLORS.success50 : COLORS.primary50;
    const iconColor = isCharge ? COLORS.success600 : COLORS.primary600;

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        activeOpacity={0.6}
        onPress={() => onPress(transaction.id)}
      >
        <View style={[styles.transactionIcon, { backgroundColor: iconBg }]}>
          <FontAwesome5 name={iconName} size={16} color={iconColor} solid />
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

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const refreshAnim = useRef(new Animated.Value(0)).current;

  const spin = refreshAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const formatAmount = useCallback((amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  }, []);

  const formatTime = useCallback((dateTimeString: string): string => {
    return dayjs(dateTimeString).format("HH:mm");
  }, []);

  const fetchData = useCallback(async (): Promise<void> => {
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

  const handleRefresh = useCallback((): void => {
    if (!refreshing) {
      fetchData();
    }
  }, [refreshing, fetchData]);

  const navigateToTransactionDetail = useCallback((id: number): void => {
    router.push(`/transactions/${id}`);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const renderTransactionSkeletons = useCallback(
    () => (
      <>
        {Array.from({ length: 5 }, (_, index) => (
          <TransactionSkeletonLoader key={`skeleton-${index}`} />
        ))}
      </>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={BACKGROUND_COLOR} />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
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
                <FontAwesome5
                  name="sync-alt"
                  size={15}
                  color={
                    refreshing || loading ? COLORS.primary500 : COLORS.gray500
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
              <FontAwesome5 name="bell" size={15} color={COLORS.gray500} />
              {!loading && user && <View style={styles.notificationBadge} />}
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
            refreshing={refreshing}
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
          disabled={loading && !user}
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
            <FontAwesome5
              name="chevron-right"
              size={12}
              color={COLORS.gray300}
              style={styles.chevronIcon}
            />
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
            <Text style={styles.cardTitle}>거래 내역</Text>
            <FontAwesome5
              name="chevron-right"
              size={12}
              color={COLORS.gray300}
              style={styles.chevronIcon}
            />
          </View>
          <View style={styles.transactionsList}>
            {loading || !user ? (
              <View style={styles.transactionsContent}>
                {renderTransactionSkeletons()}
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="receipt" size={20} color={COLORS.gray300} />
                <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
              </View>
            ) : (
              <View style={styles.transactionsContent}>
                {transactions.slice(0, 5).map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    formatAmount={formatAmount}
                    formatTime={formatTime}
                    onPress={navigateToTransactionDetail}
                  />
                ))}
              </View>
            )}
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
    gap: 6,
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
    paddingVertical: 12,
    paddingHorizontal: 2,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
