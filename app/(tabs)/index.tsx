import React, { useRef } from "react";
import { ScrollView, StatusBar, Animated } from "react-native";
import styled from "@emotion/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const balance = "32,000";
  const transactions = [
    {
      id: "1",
      title: "은관이의 꽃배달",
      amount: "-4,000",
      time: "12:45",
      icon: "flower",
      menu: "장미 한 송이",
      iconBg: "#FFF3E8",
      iconColor: "#FF571A",
    },
    {
      id: "2",
      title: "성준's 타로점",
      amount: "-5,500",
      time: "12:30",
      icon: "sparkles",
      menu: "연애운 타로 1회",
      iconBg: "#F2F7F2",
      iconColor: "#067A49",
    },
    {
      id: "3",
      title: "충전소",
      amount: "+10,000",
      time: "11:15",
      icon: "card",
      menu: "포인트 충전",
      iconBg: "#EEF2FF",
      iconColor: "#315DE7",
    },
    {
      id: "4",
      title: "가연's 페이스페인팅",
      amount: "-3,500",
      time: "11:05",
      icon: "brush",
      menu: "반짝이 페이스페인팅",
      iconBg: "#F4F2FF",
      iconColor: "#7F6BFF",
    },
    {
      id: "5",
      title: "충전소",
      amount: "+30,000",
      time: "10:23",
      icon: "card",
      menu: "포인트 충전",
      iconBg: "#EEF2FF",
      iconColor: "#315DE7",
    },
  ];

  const formatAmount = (amount: string) => {
    const numericPart = amount.replace(/[^0-9]/g, "");
    const isPositive = amount.includes("+");
    const formattedNum = parseInt(numericPart).toLocaleString("ko-KR");
    return isPositive ? `+${formattedNum}` : `-${formattedNum}`;
  };

  return (
    <Container style={{ paddingTop: insets.top }}>
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
          shadowColor: "#000000",
          backgroundColor: "white",
        }}
      >
        <Header>
          <LogoContainer>
            <BrandName>
              <ColoredText>F</ColoredText>lick
            </BrandName>
          </LogoContainer>
          <IconButton>
            <Ionicons name="notifications-outline" size={22} color="#222222" />
            <NotificationDot />
          </IconButton>
        </Header>
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
        <BalanceSection>
          <BalanceLabel>남은 포인트</BalanceLabel>
          <AmountText>
            {balance}
            <Won>P</Won>
          </AmountText>

          <QuickAccessRow>
            <QuickButton
              style={{ backgroundColor: "#EEF2FF" }}
              onPress={() => router.push("/qr-scanner")}
            >
              <QuickButtonIcon color="#315DE7">
                <Ionicons name="qr-code" size={18} color="#315DE7" />
              </QuickButtonIcon>
              <QuickButtonText>QR결제</QuickButtonText>
            </QuickButton>

            <QuickButton
              style={{ backgroundColor: "#F2F7F2" }}
              onPress={() => router.push("/charge-point")}
            >
              <QuickButtonIcon color="#067A49">
                <Ionicons name="card" size={18} color="#067A49" />
              </QuickButtonIcon>
              <QuickButtonText>충전</QuickButtonText>
            </QuickButton>

            <QuickButton
              style={{ backgroundColor: "#FFF3E8" }}
              onPress={() => router.push("/booth-map")}
            >
              <QuickButtonIcon color="#FF571A">
                <Ionicons name="map" size={18} color="#FF571A" />
              </QuickButtonIcon>
              <QuickButtonText>부스맵</QuickButtonText>
            </QuickButton>

            <QuickButton
              style={{ backgroundColor: "#F4F2FF" }}
              onPress={() => router.push("/info-guide")}
            >
              <QuickButtonIcon color="#7F6BFF">
                <Ionicons name="information-circle" size={18} color="#7F6BFF" />
              </QuickButtonIcon>
              <QuickButtonText>안내</QuickButtonText>
            </QuickButton>
          </QuickAccessRow>
        </BalanceSection>

        <TransactionSection>
          <SectionHeaderRow>
            <SectionTitle>결제 내역</SectionTitle>
          </SectionHeaderRow>

          <TransactionsCard>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <TransactionItem>
                  <TransactionIcon
                    style={{ backgroundColor: transaction.iconBg }}
                  >
                    <Ionicons
                      name={transaction.icon as any}
                      size={18}
                      color={transaction.iconColor}
                    />
                  </TransactionIcon>

                  <TransactionContent>
                    <TransactionTitle>{transaction.title}</TransactionTitle>
                    <TransactionMenu>{transaction.menu}</TransactionMenu>
                  </TransactionContent>

                  <AmountView>
                    <TransactionAmount
                      isPositive={transaction.amount.includes("+")}
                    >
                      {formatAmount(transaction.amount)}P
                    </TransactionAmount>
                    <TransactionTime>{transaction.time}</TransactionTime>
                  </AmountView>
                </TransactionItem>

                {index < transactions.length - 1 && <Separator />}
              </React.Fragment>
            ))}

            <ShowMoreButton>
              <ShowMoreText>내역 더보기</ShowMoreText>
              <Ionicons name="chevron-down" size={14} color="#666666" />
            </ShowMoreButton>
          </TransactionsCard>
        </TransactionSection>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #fcfcfc;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #ffffff;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BrandName = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.4px;
`;

const ColoredText = styled.Text`
  color: #315de7;
`;

const IconButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const NotificationDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #ff3b30;
  position: absolute;
  top: 9px;
  right: 9px;
`;

const BalanceSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const BalanceLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #222222;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
`;

const AmountText = styled.Text`
  font-size: 34px;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.7px;
  margin-bottom: 24px;
`;

const Won = styled.Text`
  font-size: 22px;
  font-weight: 600;
  margin-left: 2px;
`;

const QuickAccessRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const QuickButton = styled.TouchableOpacity`
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  width: 22%;
`;

interface IconProps {
  color: string;
}

const QuickButtonIcon = styled.View<IconProps>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: white;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
  border-width: 1px;
  border-color: ${(props) => props.color + "20"};
`;

const QuickButtonText = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #333333;
`;

const TransactionSection = styled.View`
  padding: 0 20px;
  margin-bottom: 16px;
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.3px;
`;

const TransactionsCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
`;

const TransactionItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 18px;
  align-items: center;
`;

const TransactionIcon = styled.View`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const TransactionContent = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const TransactionTitle = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #222222;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
`;

const TransactionMenu = styled.Text`
  font-size: 13px;
  color: #888888;
`;

const AmountView = styled.View`
  align-items: flex-end;
`;

interface AmountProps {
  isPositive: boolean;
}

const TransactionAmount = styled.Text<AmountProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.isPositive ? "#315DE7" : "#222222")};
  letter-spacing: -0.2px;
  margin-bottom: 4px;
`;

const TransactionTime = styled.Text`
  font-size: 12px;
  color: #888888;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #f5f5f5;
  margin-left: 76px;
`;

const ShowMoreButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: #fafafa;
`;

const ShowMoreText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  margin-right: 4px;
`;
