import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

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
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
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
      <View style={styles.container}>
        <View style={styles.statusBarFill} />
        <StatusBar style="dark" animated />

        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary500} />
            <Text style={styles.loadingText}>
              카메라 권한을 확인하는 중입니다...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!permission.granted) {
    const isBlocked = permission && !permission.canAskAgain;

    return (
      <View style={styles.container}>
        <View style={styles.statusBarFill} />
        <StatusBar style="dark" animated />

        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          <View style={styles.permissionContainer}>
            <Text style={styles.title}>
              결제 QR 코드 스캔을 위해{"\n"}카메라 접근 권한이 필요합니다
            </Text>

            {isBlocked ? (
              <TouchableOpacity
                style={styles.button}
                onPress={Linking.openSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>설정으로 이동</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={requestPermission}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>권한 허용하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent animated />
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        <SafeAreaView
          style={styles.scanAreaContainer}
          edges={["top", "bottom"]}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.scanFrame}>
            <Animated.View
              style={[
                styles.corner,
                styles.topLeft,
                {
                  borderColor: COLORS.primary500,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.topRight,
                {
                  borderColor: COLORS.primary500,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.bottomLeft,
                {
                  borderColor: COLORS.primary500,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.corner,
                styles.bottomRight,
                {
                  borderColor: COLORS.primary500,
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            />
          </View>

          <View style={styles.bottomContainer}>
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
          </View>
        </SafeAreaView>
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
    flex: 1,
    backgroundColor: COLORS.white,
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 40,
    lineHeight: 32,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 280,
    height: 52,
    backgroundColor: COLORS.primary500,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 260,
    height: 260,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 6,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
  bottomContainer: {
    padding: 24,
    alignItems: "center",
  },
  infoText: {
    fontSize: 15,
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 24,
  },
});
