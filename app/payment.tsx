import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { usePaymentStore } from "@/stores/payment";
import api from "@/libs/api";
import { StatusBar } from "expo-status-bar";

const BACKGROUND_COLOR = "#F5F6F8";
const SLIDER_THUMB_SIZE = 52;

export default function PaymentScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const alertOpacity = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get("window").width;

  const slideAnimation = useRef(new Animated.Value(0)).current;
  const [sliding, setSliding] = useState(false);
  const [slideCompleted, setSlideCompleted] = useState(false);

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

  const slideMaxWidth = useMemo(
    () => windowWidth - 28 * 2 - SLIDER_THUMB_SIZE,
    [windowWidth]
  );

  const fetchPaymentRequest = useCallback(async () => {
    if (!token) return;

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
  }, [token, setLoading, setError, setPaymentRequest]);

  const fetchOrderDetails = useCallback(
    async (orderId: number) => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError("주문 정보를 불러오는데 실패했습니다");
      }
    },
    [setOrder, setError]
  );

  const handleConfirmPayment = useCallback(async () => {
    if (!token || confirming) return;

    try {
      setConfirming(true);
      await api.post("/payments/requests/confirm", { token });
      showSuccess();
    } catch (err) {
      showError();
    } finally {
      setConfirming(false);
    }
  }, [token, confirming, setConfirming]);

  const showSuccess = useCallback(() => {
    setShowSuccessAlert(true);
    Animated.timing(alertOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [alertOpacity]);

  const showError = useCallback(() => {
    setShowErrorAlert(true);
    Animated.timing(alertOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [alertOpacity]);

  const closeSuccessAlert = useCallback(() => {
    Animated.timing(alertOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessAlert(false);
      router.push("/");
    });
  }, [alertOpacity]);

  const closeErrorAlert = useCallback(() => {
    Animated.timing(alertOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowErrorAlert(false);
      setSlideCompleted(false);
      slideAnimation.setValue(0);
      setSliding(false);
    });
  }, [alertOpacity, slideAnimation]);

  const slideProgress = useMemo(
    () =>
      slideAnimation.interpolate({
        inputRange: [0, slideMaxWidth],
        outputRange: [0, 1],
        extrapolate: "clamp",
      }),
    [slideAnimation, slideMaxWidth]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => !confirming && !slideCompleted,
        onPanResponderGrant: () => {
          setSliding(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const { dx } = gestureState;

          if (dx > 0 && dx <= slideMaxWidth) {
            slideAnimation.setValue(dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;

          if (dx >= slideMaxWidth * 0.8) {
            Animated.timing(slideAnimation, {
              toValue: slideMaxWidth,
              duration: 100,
              useNativeDriver: true,
            }).start(() => {
              setSlideCompleted(true);
              handleConfirmPayment();
            });
          } else {
            Animated.timing(slideAnimation, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setSliding(false);
            });
          }
        },
      }),
    [
      slideAnimation,
      slideMaxWidth,
      confirming,
      slideCompleted,
      handleConfirmPayment,
    ]
  );

  useEffect(() => {
    if (!token) {
      setError("결제 정보를 찾을 수 없습니다");
      return;
    }

    fetchPaymentRequest();

    return () => {
      resetState();
    };
  }, [token, fetchPaymentRequest, resetState, setError]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBarFill} />
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary600} />
          <Text style={styles.loadingText}>결제 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error || !order || !paymentRequest) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBarFill} />
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.danger500}
          />
          <Text style={styles.errorText}>
            {error || "결제 정보를 불러올 수 없습니다"}
          </Text>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
        >
          <View style={styles.card}>
            <View style={styles.boothSection}>
              <Text style={styles.boothName}>{order.booth.name}</Text>
              <Text style={styles.orderNumber}>#{order.id}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>주문 내역</Text>
            </View>

            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
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
          </View>

          <View style={styles.card}>
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {slideCompleted || confirming ? (
            <View
              style={[
                styles.confirmButton,
                confirming && styles.confirmButtonDisabled,
              ]}
            >
              <ActivityIndicator color={COLORS.white} size="small" />
            </View>
          ) : (
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <Animated.View
                  style={[
                    styles.sliderProgress,
                    {
                      transform: [
                        { translateX: -slideMaxWidth / 2 },
                        { scaleX: slideProgress },
                        { translateX: slideMaxWidth / 2 },
                      ],
                    },
                  ]}
                />
                <Text style={styles.sliderText}>
                  오른쪽으로 밀어서 결제하기
                </Text>
              </View>

              <Animated.View
                style={[
                  styles.sliderThumb,
                  {
                    transform: [{ translateX: slideAnimation }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
              </Animated.View>
            </View>
          )}
        </View>
      </View>

      <Modal visible={showSuccessAlert} transparent={true} animationType="none">
        <Animated.View style={[styles.alertOverlay, { opacity: alertOpacity }]}>
          <View style={styles.alertContainer}>
            <View style={styles.alertIconSuccess}>
              <Ionicons name="checkmark" size={36} color={COLORS.white} />
            </View>
            <Text style={styles.alertTitle}>결제 완료</Text>
            <Text style={styles.alertMessage}>
              결제가 성공적으로 완료되었습니다.
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={closeSuccessAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      <Modal visible={showErrorAlert} transparent={true} animationType="none">
        <Animated.View style={[styles.alertOverlay, { opacity: alertOpacity }]}>
          <View style={styles.alertContainer}>
            <View style={styles.alertIconError}>
              <Ionicons name="close" size={36} color={COLORS.white} />
            </View>
            <Text style={styles.alertTitle}>결제 실패</Text>
            <Text style={styles.alertMessage}>
              결제 처리 중 오류가 발생했습니다.
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={closeErrorAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
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
    fontSize: 18,
    fontWeight: "600",
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
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  orderNumber: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    padding: 18,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  itemSubtext: {
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
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary600,
  },
  footer: {
    padding: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
  },
  confirmButton: {
    backgroundColor: COLORS.primary600,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  sliderContainer: {
    position: "relative",
    height: 52,
  },
  sliderTrack: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  sliderProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#D1DBF9",
    transformOrigin: "left",
    zIndex: 1,
  },
  sliderThumb: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SLIDER_THUMB_SIZE,
    height: SLIDER_THUMB_SIZE,
    borderRadius: 16,
    backgroundColor: COLORS.primary600,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  sliderText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
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
    fontSize: 16,
    color: COLORS.danger500,
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  errorBackButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  alertMessage: {
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
