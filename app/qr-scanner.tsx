import React, { useState, useEffect } from "react";
import { StatusBar, StyleSheet, Animated, Platform } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QRScannerScreen() {
  const theme = useTheme();
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanAnimation = React.useRef(new Animated.Value(0)).current;

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
      <SafeArea>
        <Container>
          <Title>카메라 권한을 확인하는 중입니다...</Title>
        </Container>
      </SafeArea>
    );
  }

  if (!permission.granted) {
    return (
      <SafeArea>
        <Container>
          <Title>
            결제 QR 코드 스캔을 위해{"\n"}카메라 접근 권한이 필요합니다.
          </Title>
          <SubmitButton onPress={requestPermission} isValid={true}>
            <ButtonText>권한 허용하기</ButtonText>
          </SubmitButton>
        </Container>
      </SafeArea>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScannerContainer>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <OverlayContainer>
            <SafeAreaView edges={["top"]}>
              <Header>
                <BackButton onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </BackButton>
              </Header>
            </SafeAreaView>

            <ScanArea>
              <ScanFrame>
                <AnimatedCorner
                  style={{
                    top: 0,
                    left: 0,
                    borderTopWidth: 6,
                    borderLeftWidth: 6,
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        theme.colors.primary[500],
                        theme.colors.primary[300],
                      ],
                    }),
                  }}
                />
                <AnimatedCorner
                  style={{
                    top: 0,
                    right: 0,
                    borderTopWidth: 6,
                    borderRightWidth: 6,
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        theme.colors.primary[500],
                        theme.colors.primary[300],
                      ],
                    }),
                  }}
                />
                <AnimatedCorner
                  style={{
                    bottom: 0,
                    left: 0,
                    borderBottomWidth: 6,
                    borderLeftWidth: 6,
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        theme.colors.primary[500],
                        theme.colors.primary[300],
                      ],
                    }),
                  }}
                />
                <AnimatedCorner
                  style={{
                    bottom: 0,
                    right: 0,
                    borderBottomWidth: 6,
                    borderRightWidth: 6,
                    borderColor: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        theme.colors.primary[500],
                        theme.colors.primary[300],
                      ],
                    }),
                  }}
                />
              </ScanFrame>
            </ScanArea>

            <SafeAreaView edges={["bottom"]}>
              <ButtonContainer>
                <InfoText>결제 QR 코드를 프레임 안에 위치시켜주세요</InfoText>
                {scanned && (
                  <SubmitButton
                    onPress={() => setScanned(false)}
                    isValid={true}
                  >
                    <ButtonText>다시 스캔하기</ButtonText>
                  </SubmitButton>
                )}
              </ButtonContainer>
            </SafeAreaView>
          </OverlayContainer>
        </CameraView>
      </ScannerContainer>
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});

// 로그인 페이지와 일관된 스타일링
const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: 16px 24px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 16px;
  margin-bottom: 48px;
  line-height: 34px;
  text-align: center;
`;

interface ButtonProps {
  isValid: boolean;
}

const SubmitButton = styled.TouchableOpacity<ButtonProps>`
  width: 100%;
  height: 52px;
  border-radius: 8px;
  background-color: ${({ isValid, theme }) =>
    isValid ? theme.colors.primary[500] : theme.colors.gray[200]};
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

const ScannerContainer = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const OverlayContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
`;

const Header = styled.View`
  padding: 16px 16px 0;
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: -8px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.3);
  align-items: center;
  justify-content: center;
`;

const ScanArea = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ScanFrame = styled.View`
  width: 260px;
  height: 260px;
  position: relative;
`;

const Corner = styled(Animated.View)`
  position: absolute;
  width: 30px;
  height: 30px;
`;

const AnimatedCorner = Animated.createAnimatedComponent(Corner);

const ButtonContainer = styled.View`
  padding: 16px 24px;
  align-items: center;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: white;
  text-align: center;
  margin-bottom: 16px;
`;
