import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { Skeleton } from "@/components/Skeleton";

dayjs.locale("ko");

const BACKGROUND_COLOR = "#F5F6F8";

type TransactionType = "CHARGE" | "PAYMENT";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Booth {
  id: number;
  name: string;
}

interface OrderItem {
  id: number;
  product: Product;
  price: number;
  quantity: number;
}

interface TransactionDetail {
  id: number;
  type: TransactionType;
  amount: number;
  memo?: string;
  createdAt: string;
  booth?: Booth;
  items?: OrderItem[];
}

function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

  const {
    data: transaction,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error("거래 정보를 찾을 수 없습니다");
      const { data } = await api.get<TransactionDetail>(
        `/transactions/${transactionId}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : "거래 정보를 불러오는데 실패했습니다";

  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("YYYY년 M월 D일 HH:mm");
  };

  const formatAmount = (amount: number, type: TransactionType): string => {
    const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
    return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
  };

  const isCharge = transaction?.type === "CHARGE";

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>거래 내역</Text>

          {!isLoading && !error && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => refetch()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />

        {isLoading ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.skeletonAmountCard}>
              <View style={styles.skeletonAmountContent}>
                <Skeleton
                  width={120}
                  height={18}
                  style={{ marginBottom: 10 }}
                />
                <Skeleton width={180} height={36} style={{ marginBottom: 8 }} />
                <Skeleton width={100} height={12} />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Skeleton width={80} height={16} />
              </View>
              <View style={styles.infoGroup}>
                {[...Array(4)].map((_, i) => (
                  <View key={`info-${i}`} style={styles.infoItem}>
                    <Skeleton width={70} height={14} />
                    <Skeleton width={120} height={14} />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Skeleton width={80} height={16} />
              </View>
              {[...Array(2)].map((_, i) => (
                <View
                  key={`product-${i}`}
                  style={[
                    styles.productItem,
                    i < 1 && styles.productItemBorder,
                  ]}
                >
                  <View style={styles.productInfo}>
                    <Skeleton
                      width={120}
                      height={16}
                      style={{ marginBottom: 4 }}
                    />
                    <Skeleton width={80} height={14} />
                  </View>
                  <Skeleton width={70} height={16} />
                </View>
              ))}
              <View style={styles.totalSection}>
                <Skeleton width={80} height={16} />
                <Skeleton width={90} height={18} />
              </View>
            </View>
          </ScrollView>
        ) : error || !transaction ? (
          <View style={styles.errorContainer}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={64}
                color={COLORS.gray300}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.errorButtonText}>돌아가기</Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <MotiView
              style={styles.amountCard}
              from={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
            >
              <View style={styles.amountCardHeader}>
                <View style={styles.amountCardHeaderLeft}>
                  <View
                    style={[
                      styles.transactionTypeIcon,
                      {
                        backgroundColor: isCharge
                          ? COLORS.success50
                          : COLORS.primary50,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isCharge ? "wallet-outline" : "cart-outline"}
                      size={20}
                      color={isCharge ? COLORS.success600 : COLORS.primary600}
                    />
                  </View>
                  <Text style={styles.transactionTypeText}>
                    {isCharge ? "포인트 충전" : "결제"}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>

              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amountText,
                    isCharge ? styles.amountPositive : styles.amountNegative,
                  ]}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                  <Text style={styles.wonText}>원</Text>
                </Text>

                {!isCharge && transaction.booth && (
                  <Text style={styles.boothName}>{transaction.booth.name}</Text>
                )}
              </View>
            </MotiView>

            <MotiView
              style={styles.card}
              from={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 100 }}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>거래 정보</Text>
              </View>

              <View style={styles.infoGroup}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>거래 번호</Text>
                  <Text style={styles.infoValue}>#{transaction.id}</Text>
                </View>

                {isCharge && transaction.memo && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>메모</Text>
                    <Text style={styles.infoValue}>{transaction.memo}</Text>
                  </View>
                )}
              </View>
            </MotiView>

            {!isCharge && transaction.items && transaction.items.length > 0 && (
              <MotiView
                style={styles.card}
                from={{ opacity: 0, translateY: 5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 300, delay: 150 }}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>상품 정보</Text>
                </View>

                {transaction.items.map((item, index) => (
                  <View
                    key={item.id || index}
                    style={[
                      styles.productItem,
                      index < transaction.items!.length - 1 &&
                        styles.productItemBorder,
                    ]}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.productQuantity}>
                        {item.price.toLocaleString()}원
                        {item.quantity > 1 ? ` × ${item.quantity}개` : ""}
                      </Text>
                    </View>
                    <Text style={styles.productTotal}>
                      {(item.price * item.quantity).toLocaleString()}원
                    </Text>
                  </View>
                ))}

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>총 결제금액</Text>
                  <Text style={styles.totalAmount}>
                    {transaction.amount.toLocaleString()}원
                  </Text>
                </View>
              </MotiView>
            )}
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
    flex: 1,
    marginLeft: 8,
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
    gap: 10,
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  skeletonAmountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  skeletonAmountContent: {
    alignItems: "center",
    width: "100%",
  },
  amountCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  amountCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  transactionTypeText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  dateText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    alignItems: "center",
  },
  amountText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 28,
    marginBottom: 4,
  },
  amountPositive: {
    color: COLORS.success600,
  },
  amountNegative: {
    color: COLORS.danger600,
  },
  wonText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 22,
  },
  boothName: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  infoGroup: {
    paddingVertical: 6,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: COLORS.text,
    textAlign: "right",
    maxWidth: "65%",
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  productQuantity: {
    fontFamily: "Pretendard-Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  productTotal: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.gray50,
  },
  totalLabel: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: COLORS.primary600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  errorButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
});

export default TransactionDetailScreen;
