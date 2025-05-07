import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";

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

export default function HomeScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const generateIcon = (): keyof typeof Ionicons.glyphMap => {
    const icons: (keyof typeof Ionicons.glyphMap)[] = [
      "card-outline",
      "bag-outline",
      "person-outline",
      "wallet-outline",
      "cart-outline",
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  const generateIconBackground = (type: string): string => {
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    const s = 60 + (Math.abs(hash) % 20);
    const l = 80 + (Math.abs(hash) % 10);

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const fetchBalance = async (): Promise<void> => {
    try {
      const { data } = await api.get("/users/me/balance");
      setBalance(data);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchTransactions = async (): Promise<void> => {
    try {
      const { data } = await api.get("/transactions/my");
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const formatAmount = (amount: number, type: string): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  };

  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={{
          shadowOpacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 0.1],
            extrapolate: "clamp",
          }),
          zIndex: 10,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          shadowColor: COLORS.black,
          backgroundColor: COLORS.white,
        }}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.brandName}>
              <Text style={styles.coloredText}>F</Text>lick
            </Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.text}
            />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>남은 포인트</Text>
          <Text style={styles.amountText}>
            {balance}
            <Text style={styles.won}>P</Text>
          </Text>

          <View style={styles.quickAccessRow}>
            <TouchableOpacity
              style={[
                styles.quickButton,
                { backgroundColor: COLORS.primary50 },
              ]}
              onPress={() => router.push("/qr-scanner")}
            >
              <View
                style={[
                  styles.quickButtonIcon,
                  { borderColor: COLORS.primary600 + "20" },
                ]}
              >
                <Ionicons name="qr-code" size={18} color={COLORS.primary600} />
              </View>
              <Text style={styles.quickButtonText}>QR결제</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickButton,
                { backgroundColor: COLORS.success50 },
              ]}
              onPress={() => router.push("/charge-point")}
            >
              <View
                style={[
                  styles.quickButtonIcon,
                  { borderColor: COLORS.success600 + "20" },
                ]}
              >
                <Ionicons name="card" size={18} color={COLORS.success600} />
              </View>
              <Text style={styles.quickButtonText}>충전</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickButton,
                { backgroundColor: COLORS.warning50 },
              ]}
              onPress={() => router.push("/booth-map")}
            >
              <View
                style={[
                  styles.quickButtonIcon,
                  { borderColor: COLORS.warning600 + "20" },
                ]}
              >
                <Ionicons name="map" size={18} color={COLORS.warning600} />
              </View>
              <Text style={styles.quickButtonText}>부스맵</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: COLORS.info50 }]}
              onPress={() => router.push("/info-guide")}
            >
              <View
                style={[
                  styles.quickButtonIcon,
                  { borderColor: COLORS.info600 + "20" },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={COLORS.info600}
                />
              </View>
              <Text style={styles.quickButtonText}>안내</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.transactionSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>결제 내역</Text>
          </View>

          <View style={styles.transactionsCard}>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <TouchableOpacity style={styles.transactionItem}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: generateIconBackground(
                          transaction.type
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={generateIcon()}
                      size={18}
                      color={COLORS.white}
                    />
                  </View>

                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type === "PAYMENT"
                        ? transaction.product.name
                        : "충전"}
                    </Text>
                    <Text style={styles.transactionMenu}>
                      {transaction.type === "PAYMENT"
                        ? transaction.booth.name
                        : transaction.memo || ""}
                    </Text>
                  </View>

                  <View style={styles.amountView}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === "CHARGE" &&
                          styles.transactionAmountPositive,
                      ]}
                    >
                      {formatAmount(transaction.amount, transaction.type)}P
                    </Text>
                    <Text style={styles.transactionTime}>
                      {formatTime(transaction.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {index < transactions.length - 1 && (
                  <View style={styles.separator} />
                )}
              </React.Fragment>
            ))}

            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>내역 더보기</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  coloredText: {
    color: COLORS.primary600,
  },
  iconButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger500,
    position: "absolute",
    top: 9,
    right: 9,
  },
  balanceSection: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 34,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.7,
    marginBottom: 24,
  },
  won: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 2,
  },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    width: "22%",
  },
  quickButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
  },
  transactionSection: {
    padding: 0,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  transactionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  transactionItem: {
    flexDirection: "row",
    padding: 18,
    alignItems: "center",
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionContent: {
    flex: 1,
    marginLeft: 16,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  transactionMenu: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  amountView: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  transactionAmountPositive: {
    color: COLORS.primary600,
  },
  transactionTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 76,
  },
  showMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.gray50,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray600,
    marginRight: 4,
  },
});
