import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Animated, Platform, View } from "react-native";
import styled from "@emotion/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const navigateToQRScanner = () => {
    router.push("/qr-scanner");
  };

  const tabBarHeight = 56;
  const bottomInset = Platform.OS === "ios" ? insets.bottom : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: tabBarHeight + bottomInset,
          paddingBottom: bottomInset,
          borderTopWidth: 1,
          borderTopColor: "#F2F2F7",
          backgroundColor: "#FFFFFF",
          ...Platform.select({
            ios: { shadowOpacity: 0 },
            android: { elevation: 0 },
          }),
        },
        tabBarActiveTintColor: "#315DE7",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : ("home-outline" as IconName)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="qr-tab"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => null,
          tabBarButton: () => <QRTabButton onPress={navigateToQRScanner} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "프로필",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person" : ("person-outline" as IconName)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

function QRTabButton({ onPress }: { onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 40,
    }).start();
  };

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#315DE7",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    android: {
      elevation: 8,
    },
  });

  return (
    <CenterContainer>
      <TabButton
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <AnimatedContent style={{ transform: [{ scale: scaleAnim }] }}>
          <QRCircle style={shadowStyle}>
            <Ionicons name={"qr-code" as IconName} size={24} color="white" />
          </QRCircle>
        </AnimatedContent>
      </TabButton>
      <QRLabel>결제하기</QRLabel>
    </CenterContainer>
  );
}

const CenterContainer = styled.View`
  flex: 1;
  align-items: center;
  height: 60px;
`;

const TabButton = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  margin-top: -30px;
`;

const AnimatedContent = styled(Animated.View)`
  align-items: center;
  justify-content: center;
`;

const QRCircle = styled.View`
  width: 52px;
  height: 52px;
  border-radius: 26px;
  background-color: #315de7;
  justify-content: center;
  align-items: center;
`;

const QRLabel = styled.Text`
  font-size: 11px;
  font-weight: 500;
  color: #315de7;
  margin-top: 2px;
`;
