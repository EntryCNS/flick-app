import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

const { width } = Dimensions.get("window");
const scale = (size: number) => (width / 375) * size;

export default function QRScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    router.push({
      pathname: "/payment",
      params: { token: data },
    });
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary600} />
          <Text style={styles.loadingText}>
            카메라 권한을 확인하는 중입니다...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>
            결제 QR 코드 스캔을 위해{"\n"}카메라 접근 권한이 필요합니다.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>권한 허용하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.scanAreaContainer}>
            <View style={styles.scanFrame}>
              <Animated.View
                style={[
                  styles.corner,
                  styles.topLeft,
                  {
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [COLORS.primary500, COLORS.primary300],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.topRight,
                  {
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [COLORS.primary500, COLORS.primary300],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.bottomLeft,
                  {
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [COLORS.primary500, COLORS.primary300],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.corner,
                  styles.bottomRight,
                  {
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [COLORS.primary500, COLORS.primary300],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <SafeAreaView style={styles.bottomContainer}>
            <Text style={styles.infoText}>
              결제 QR 코드를 프레임 안에 위치시켜주세요
            </Text>
            {scanned && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setScanned(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>다시 스캔하기</Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(24),
  },
  title: {
    fontSize: scale(24),
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: scale(40),
    lineHeight: scale(34),
    textAlign: "center",
  },
  button: {
    width: "100%",
    height: scale(52),
    backgroundColor: COLORS.primary600,
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: "600",
    color: COLORS.white,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  headerContainer: {
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: scale(260),
    height: scale(260),
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: scale(30),
    height: scale(30),
    borderWidth: scale(6),
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: scale(6),
    borderLeftWidth: scale(6),
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: scale(6),
    borderRightWidth: scale(6),
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: scale(6),
    borderLeftWidth: scale(6),
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: scale(6),
    borderRightWidth: scale(6),
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  bottomContainer: {
    padding: scale(24),
    alignItems: "center",
  },
  infoText: {
    fontSize: scale(14),
    color: COLORS.white,
    textAlign: "center",
    marginBottom: scale(16),
  },
});
