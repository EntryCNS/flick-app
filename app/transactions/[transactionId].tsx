import React, { useEffect, useState, useCallback, memo } from "react";
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
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import dayjs from "dayjs";
import { Skeleton } from "@/components/Skeleton";
import "dayjs/locale/ko";

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

interface AmountCardSkeletonProps {}
const AmountCardSkeleton = memo<AmountCardSkeletonProps>(() => (
  <View style={styles.amountCard}>
    <View style={styles.transactionTypeContainer}>
      <View
        style={[styles.transactionIcon, { backgroundColor: COLORS.gray100 }]}
      >
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
      <Skeleton width={100} height={14} />
    </View>
    <Skeleton width={180} height={34} style={{ marginVertical: 5 }} />
  </View>
));

interface InfoItemSkeletonProps {}
const InfoItemSkeleton = memo<InfoItemSkeletonProps>(() => (
  <View style={styles.infoItem}>
    <Skeleton width={80} height={14} />
    <Skeleton width={120} height={14} />
  </View>
));

interface ProductItemSkeletonProps {}
const ProductItemSkeleton = memo<ProductItemSkeletonProps>(() => (
  <View style={[styles.productItem, styles.productItemWithBorder]}>
    <View style={styles.productInfo}>
      <Skeleton width={120} height={14} style={{ marginBottom: 5 }} />
      <Skeleton width={80} height={13} />
    </View>
    <Skeleton width={70} height={14} />
  </View>
));

export default function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchTransactionDetail = useCallback(async () => {
    if (!transactionId) {
      setError("거래 정보를 찾을 수 없습니다");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get<TransactionDetail>(
        `/transactions/${transactionId}`
      );
      setTransaction(data);
      setError("");
    } catch (err) {
      setError("거래 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchTransactionDetail();
  }, [fetchTransactionDetail]);

  const formatDate = useCallback((dateString: string): string => {
    return dayjs(dateString).format("YYYY년 M월 D일 HH:mm");
  }, []);

  const formatAmount = useCallback(
    (amount: number, type: TransactionType): string => {
      const formattedNum = Math.abs(amount).toLocaleString("ko-KR");
      return type === "CHARGE" ? `+${formattedNum}` : `-${formattedNum}`;
    },
    []
  );

  const renderSkeletonContent = useCallback(
    () => (
      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AmountCardSkeleton />

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Skeleton width={100} height={15} />
            </View>
            <InfoItemSkeleton />
            <InfoItemSkeleton />
            <InfoItemSkeleton />
            <InfoItemSkeleton />
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Skeleton width={100} height={15} />
            </View>
            <ProductItemSkeleton />
            <ProductItemSkeleton />

            <View style={styles.totalSection}>
              <Skeleton width={80} height={14} />
              <Skeleton width={100} height={16} />
            </View>
          </View>
        </ScrollView>
      </View>
    ),
    []
  );

  const renderErrorContent = useCallback(
    (errorMessage: string) => (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={COLORS.gray300}
        />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    ),
    []
  );

  const renderTransactionContent = useCallback(
    (transactionData: TransactionDetail) => {
      const isCharge = transactionData.type === "CHARGE";

      return (
        <View style={styles.contentWrapper}>
          <View style={styles.bgExtender} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.amountCard}>
              <View style={styles.transactionTypeContainer}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: isCharge
                        ? COLORS.success50
                        : COLORS.primary50,
                    },
                  ]}
                >
                  <Ionicons
                    name={isCharge ? "wallet-outline" : "cart-outline"}
                    size={24}
                    color={isCharge ? COLORS.success600 : COLORS.primary600}
                  />
                </View>
                <Text style={styles.transactionType}>
                  {isCharge
                    ? "포인트 충전"
                    : transactionData.booth?.name || "결제"}
                </Text>
              </View>

              <Text
                style={[
                  styles.amount,
                  isCharge ? styles.amountPositive : styles.amountNegative,
                ]}
              >
                {formatAmount(transactionData.amount, transactionData.type)}
                <Text style={styles.wonText}>원</Text>
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>거래 정보</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>거래 번호</Text>
                <Text style={styles.infoValue}>#{transactionData.id}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>거래 유형</Text>
                <Text style={styles.infoValue}>
                  {isCharge ? "포인트 충전" : "결제"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>거래 일시</Text>
                <Text style={styles.infoValue}>
                  {formatDate(transactionData.createdAt)}
                </Text>
              </View>

              {!isCharge && transactionData.booth && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>부스</Text>
                  <Text style={styles.infoValue}>
                    {transactionData.booth.name}
                  </Text>
                </View>
              )}

              {isCharge && transactionData.memo && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>메모</Text>
                  <Text style={styles.infoValue}>{transactionData.memo}</Text>
                </View>
              )}
            </View>

            {!isCharge &&
              transactionData.items &&
              transactionData.items.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>상품 정보</Text>
                  </View>

                  {transactionData.items.map((item, index) => (
                    <View
                      key={item.id || index}
                      style={[
                        styles.productItem,
                        index < transactionData.items!.length - 1 &&
                          styles.productItemWithBorder,
                      ]}
                    >
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.productPrice}>
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
                      {transactionData.amount.toLocaleString()}원
                    </Text>
                  </View>
                </View>
              )}
          </ScrollView>
        </View>
      );
    },
    [formatAmount, formatDate]
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
          <Text style={styles.headerTitle}>상세내역</Text>
        </View>
      </SafeAreaView>

      {loading
        ? renderSkeletonContent()
        : error || !transaction
        ? renderErrorContent(error || "거래 정보를 불러올 수 없습니다")
        : renderTransactionContent(transaction)}
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
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 24,
    marginLeft: 8,
  },
  backButton: {
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
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 20,
    alignItems: "center",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 19,
  },
  amount: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
  },
  amountPositive: {
    color: COLORS.success600,
  },
  amountNegative: {
    color: COLORS.danger600,
  },
  wonText: {
    fontSize: 20,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 19,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray50,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    lineHeight: 18,
    textAlign: "right",
    maxWidth: "65%",
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  productItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 19,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 19,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.gray50,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 19,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary600,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
    lineHeight: 20,
  },
});
