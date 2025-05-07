import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { usePaymentStore } from "@/stores/payment";
import api from "@/libs/api";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

export default function PaymentScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const {
    loading,
    confirming,
    error,
    paymentRequest,
    order,
    setLoading,
    setConfirming,
    setError,
    setPaymentRequest,
    setOrder,
    resetState,
  } = usePaymentStore();

  useEffect(() => {
    if (!token) {
      setError("결제 정보를 찾을 수 없습니다");
      return;
    }

    fetchPaymentRequest();

    return () => {
      resetState();
    };
  }, [token]);

  const fetchPaymentRequest = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/payments/requests?token=${token}`);
      setPaymentRequest(response.data);

      await fetchOrderDetails(response.data.orderId);
    } catch (err) {
      setError("결제 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError("주문 정보를 불러오는데 실패했습니다");
    }
  };

  const handleConfirmPayment = async () => {
    if (!token || confirming) return;

    try {
      setConfirming(true);
      await api.post("/payments/requests/confirm", { token });

      Alert.alert(
        "결제 완료",
        "결제가 성공적으로 완료되었습니다.",
        [{ text: "확인", onPress: () => router.push("/") }],
        { cancelable: false }
      );
    } catch (err) {
      Alert.alert(
        "결제 실패",
        "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary600} />
          <Text style={styles.loadingText}>
            결제 정보를 불러오는 중입니다...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order || !paymentRequest) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={scale(48)}
            color={COLORS.danger500}
          />
          <Text style={styles.errorText}>
            {error || "결제 정보를 불러올 수 없습니다"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결제 정보</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.boothContainer}>
          <View style={styles.boothHeader}>
            <View>
              <Text style={styles.boothLabel}>판매 부스</Text>
              <Text style={styles.boothName}>{order.booth.name}</Text>
            </View>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>주문번호</Text>
              <Text style={styles.orderId}>#{order.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>주문 상품</Text>

        <FlatList
          data={order.items}
          keyExtractor={(item, index) => `${item.product.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <View style={styles.productInfo}>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productPrice}>
                    {item.price.toLocaleString()}원
                  </Text>
                </View>
              </View>
              <View style={styles.quantityInfo}>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}개</Text>
                </View>
                <Text style={styles.itemTotalPrice}>
                  {(item.price * item.quantity).toLocaleString()}원
                </Text>
              </View>
            </View>
          )}
          style={styles.orderList}
          ListFooterComponent={
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>총 상품 수량</Text>
                <Text style={styles.summaryValue}>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}개
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>총 결제 금액</Text>
                <Text style={styles.totalAmount}>
                  {order.totalAmount.toLocaleString()}원
                </Text>
              </View>
            </View>
          }
        />

        <View style={styles.paymentMethodContainer}>
          <Text style={styles.paymentMethodLabel}>결제 방식</Text>
          <View style={styles.paymentMethodValue}>
            <Ionicons
              name={
                paymentRequest.method === "QR_CODE"
                  ? "qr-code-outline"
                  : "school-outline"
              }
              size={scale(16)}
              color={COLORS.primary600}
              style={styles.paymentMethodIcon}
            />
            <Text style={styles.paymentMethodText}>
              {paymentRequest.method === "QR_CODE"
                ? "QR 코드 결제"
                : "학번 결제"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            confirming && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPayment}
          disabled={confirming}
          activeOpacity={0.7}
        >
          {confirming ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>결제 완료하기</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerBackButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "600",
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: scale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(24),
  },
  loadingText: {
    fontSize: scale(16),
    marginTop: scale(16),
    color: COLORS.text,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(24),
  },
  errorText: {
    fontSize: scale(16),
    color: COLORS.danger500,
    marginTop: scale(16),
    marginBottom: scale(24),
    textAlign: "center",
  },
  backButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: scale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontWeight: "600",
  },
  boothContainer: {
    marginBottom: scale(15),
  },
  boothHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  boothLabel: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
    marginBottom: scale(4),
  },
  boothName: {
    fontSize: scale(22),
    fontWeight: "700",
    color: COLORS.text,
  },
  orderIdContainer: {
    alignItems: "flex-end",
  },
  orderIdLabel: {
    fontSize: scale(12),
    color: COLORS.textSecondary,
    marginBottom: scale(2),
  },
  orderId: {
    fontSize: scale(14),
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: scale(16),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: scale(16),
  },
  orderList: {
    marginBottom: scale(16),
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: scale(15),
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: scale(4),
  },
  productPrice: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
  },
  quantityInfo: {
    alignItems: "flex-end",
  },
  quantityBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(12),
    marginBottom: scale(4),
  },
  quantityText: {
    fontSize: scale(13),
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  itemTotalPrice: {
    fontSize: scale(15),
    fontWeight: "600",
    color: COLORS.text,
  },
  summaryContainer: {
    marginTop: scale(16),
    backgroundColor: COLORS.gray50,
    borderRadius: scale(8),
    padding: scale(16),
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scale(8),
  },
  summaryLabel: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: scale(14),
    fontWeight: "500",
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: scale(8),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    fontSize: scale(16),
    fontWeight: "600",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: scale(20),
    fontWeight: "700",
    color: COLORS.primary600,
  },
  paymentMethodContainer: {
    marginTop: scale(24),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.gray50,
    padding: scale(16),
    borderRadius: scale(8),
  },
  paymentMethodLabel: {
    fontSize: scale(15),
    color: COLORS.textSecondary,
  },
  paymentMethodValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodIcon: {
    marginRight: scale(8),
  },
  paymentMethodText: {
    fontSize: scale(15),
    fontWeight: "500",
    color: COLORS.text,
  },
  footer: {
    padding: scale(20),
    paddingBottom: scale(30),
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  confirmButton: {
    backgroundColor: COLORS.primary600,
    borderRadius: scale(8),
    height: scale(52),
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontWeight: "600",
  },
});
