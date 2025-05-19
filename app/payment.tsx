import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { usePaymentStore } from "@/stores/payment";
import { useBalanceStore } from "@/stores/balance";
import api from "@/libs/api";
import { StatusBar } from "expo-status-bar";
import * as LocalAuthentication from "expo-local-authentication";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { MotiView } from "moti";

const BACKGROUND_COLOR = "#F5F6F8";

function PaymentAlert({
  visible,
  isSuccess,
  message,
  onClose,
}: {
  visible: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 300 : 200,
    });
  }, [visible, opacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          opacity.value,
          [0, 1],
          [0.9, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  if (!visible) return null;

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.alertOverlay, overlayStyle]}>
        <Animated.View style={[styles.alertContainer, containerStyle]}>
          <View
            style={isSuccess ? styles.alertIconSuccess : styles.alertIconError}
          >
            <Ionicons
              name={isSuccess ? "checkmark" : "close"}
              size={36}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.alertTitle}>
            {isSuccess ? "결제 완료" : "결제 실패"}
          </Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.alertButtonText}>확인</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />
      <View style={styles.loadingContainer}>
        <MotiView
          from={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <ActivityIndicator size="large" color={COLORS.primary600} />
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 100 }}
        >
          <Text style={styles.loadingText}>결제 정보를 불러오는 중...</Text>
        </MotiView>
      </View>
    </View>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />
      <MotiView
        style={styles.errorContainer}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 300 }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.danger500}
        />
        <Text style={styles.errorText}>
          {error || "결제 정보를 불러올 수 없습니다"}
        </Text>
        <View style={styles.errorButtonContainer}>
          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    </View>
  );
}

export default function PaymentScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "결제 처리 중 오류가 발생했습니다."
  );
  const [authenticating, setAuthenticating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    balance: userBalance,
    isLoading: isBalanceLoading,
    fetchBalance,
    refreshBalance,
  } = useBalanceStore();

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

  const isInsufficientBalance = useMemo(() => {
    if (!order || userBalance === null) return true;
    return userBalance < order.totalAmount;
  }, [order, userBalance]);

  const fetchOrderDetails = useCallback(
    async (orderId: number) => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch {
        setError("주문 정보를 불러오는데 실패했습니다");
      }
    },
    [setOrder, setError]
  );

  const fetchPaymentRequest = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/payments/requests?token=${token}`);
      setPaymentRequest(response.data);

      await fetchOrderDetails(response.data.orderId);
      await fetchBalance();
    } catch {
      setError("결제 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [
    token,
    setLoading,
    setError,
    setPaymentRequest,
    fetchBalance,
    fetchOrderDetails,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPaymentRequest(), refreshBalance()]);
    } catch {
      setError("결제 정보를 갱신하는데 실패했습니다");
    } finally {
      setRefreshing(false);
    }
  }, [fetchPaymentRequest, refreshBalance, setError]);

  const showAlert = useCallback((isSuccess: boolean, message: string) => {
    if (isSuccess) {
      setShowSuccessAlert(true);
    } else {
      setErrorMessage(message);
      setShowErrorAlert(true);
    }
  }, []);

  const handleConfirmPayment = useCallback(async () => {
    if (!token || confirming || !order || userBalance === null) return;

    try {
      if (isInsufficientBalance) {
        showAlert(false, "잔액이 부족합니다.");
        return;
      }

      setConfirming(true);
      await api.post("/payments/requests/confirm", { token });
      await refreshBalance();
      showAlert(true, "결제가 성공적으로 완료되었습니다.");
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { code?: string } } };
      const errorCode = errorResponse.response?.data?.code;
      let message = "결제 처리 중 오류가 발생했습니다.";

      if (errorCode === "INSUFFICIENT_BALANCE") {
        message = "잔액이 부족합니다.";
        refreshBalance();
      } else if (errorCode === "ORDER_NOT_PENDING") {
        message = "이미 처리된 주문입니다.";
      }

      showAlert(false, message);
    } finally {
      setConfirming(false);
      setAuthenticating(false);
    }
  }, [
    token,
    confirming,
    order,
    userBalance,
    isInsufficientBalance,
    showAlert,
    setConfirming,
    refreshBalance,
  ]);

  const confirmWithoutBiometrics = useCallback(() => {
    Alert.alert(
      "결제 확인",
      "결제를 진행하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
          onPress: () => setAuthenticating(false),
        },
        {
          text: "확인",
          onPress: handleConfirmPayment,
        },
      ],
      { cancelable: false }
    );
  }, [handleConfirmPayment]);

  const handlePaymentButtonPress = useCallback(async () => {
    if (isInsufficientBalance || confirming) return;

    setAuthenticating(true);

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "결제를 위한 생체인증",
            cancelLabel: "취소",
            disableDeviceFallback: false,
          });

          if (result.success) {
            handleConfirmPayment();
          } else {
            setAuthenticating(false);
            if (result.error !== "user_cancel") {
              Alert.alert("인증 실패", "생체 인증에 실패했습니다.");
            }
          }
        } else {
          confirmWithoutBiometrics();
        }
      } else {
        confirmWithoutBiometrics();
      }
    } catch {
      setAuthenticating(false);
      Alert.alert("오류", "인증 과정에서 오류가 발생했습니다.");
    }
  }, [
    isInsufficientBalance,
    confirming,
    handleConfirmPayment,
    confirmWithoutBiometrics,
  ]);

  useEffect(() => {
    if (!token) {
      setError("결제 정보를 찾을 수 없습니다");
      return;
    }

    fetchPaymentRequest();
    const balanceRefreshInterval = setInterval(refreshBalance, 30000);

    return () => {
      clearInterval(balanceRefreshInterval);
      resetState();
    };
  }, [token, fetchPaymentRequest, resetState, setError, refreshBalance]);

  const isLoading = loading || isBalanceLoading;

  if (isLoading && !refreshing) {
    return <LoadingState />;
  }

  if (error || !order || !paymentRequest || userBalance === null) {
    return <ErrorState error={error} onRetry={fetchPaymentRequest} />;
  }

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
          <Text style={styles.headerTitle}>결제</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary600]}
              tintColor={COLORS.primary600}
            />
          }
        >
          <MotiView
            style={styles.card}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <View style={styles.boothSection}>
              <Text style={styles.boothName}>{order.booth.name}</Text>
              <Text style={styles.orderNumber}>#{order.id}</Text>
            </View>
          </MotiView>

          <MotiView
            style={styles.card}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 100 }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>주문 내역</Text>
            </View>

            {order.items.map((item, index) => (
              <View key={`item-${index}`} style={styles.orderItem}>
                <View style={styles.orderItemMain}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemPrice}>
                    {(item.price * item.quantity).toLocaleString()}원
                  </Text>
                </View>
                <Text style={styles.itemSubtext}>
                  {item.price.toLocaleString()}원 × {item.quantity}개
                </Text>
              </View>
            ))}
          </MotiView>

          <MotiView
            style={styles.card}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 200 }}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>결제 정보</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>결제 방식</Text>
              <Text style={styles.infoValue}>
                {paymentRequest.method === "QR_CODE" ? "QR 코드" : "학번"} 결제
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>결제 금액</Text>
              <Text style={styles.totalAmount}>
                {order.totalAmount.toLocaleString()}원
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>내 잔액</Text>
              <Text
                style={[
                  styles.totalAmount,
                  isInsufficientBalance && styles.insufficientBalance,
                ]}
              >
                {userBalance.toLocaleString()}원
              </Text>
            </View>
          </MotiView>
        </ScrollView>

        <MotiView
          style={styles.footer}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 300 }}
        >
          <TouchableOpacity
            style={[
              styles.paymentButton,
              (isInsufficientBalance || confirming || authenticating) &&
                styles.paymentButtonDisabled,
            ]}
            onPress={handlePaymentButtonPress}
            disabled={isInsufficientBalance || confirming || authenticating}
            activeOpacity={0.8}
          >
            {confirming || authenticating ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                {isInsufficientBalance ? (
                  <Ionicons
                    name="close"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                ) : (
                  <Ionicons
                    name="finger-print"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                )}
                <Text style={styles.paymentButtonText}>
                  {isInsufficientBalance
                    ? "잔액이 부족합니다"
                    : "생체인증으로 결제하기"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>

      <PaymentAlert
        visible={showSuccessAlert}
        isSuccess={true}
        message="결제가 성공적으로 완료되었습니다."
        onClose={() => {
          setShowSuccessAlert(false);
          router.push("/");
        }}
      />

      <PaymentAlert
        visible={showErrorAlert}
        isSuccess={false}
        message={errorMessage}
        onClose={() => {
          setShowErrorAlert(false);
          setAuthenticating(false);
        }}
      />
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
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 24,
  },
  contentWrapper: {
    flex: 1,
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
  },
  boothSection: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boothName: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  orderNumber: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    padding: 18,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  orderItem: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  orderItemMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  itemSubtext: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  infoLabel: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.text,
  },
  totalAmount: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.primary600,
  },
  insufficientBalance: {
    color: COLORS.danger500,
  },
  footer: {
    padding: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
  },
  paymentButton: {
    backgroundColor: COLORS.primary600,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentButtonDisabled: {
    opacity: 0.7,
    backgroundColor: COLORS.gray400,
  },
  paymentButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    marginTop: 16,
    color: COLORS.text,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    color: COLORS.danger500,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  errorButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  errorBackButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary600,
  },
  retryButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.primary600,
    fontSize: 16,
  },
  backButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  alertIconSuccess: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.success500,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertIconError: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.danger500,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  alertMessage: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  alertButton: {
    width: "100%",
    backgroundColor: COLORS.primary600,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  alertButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
});
