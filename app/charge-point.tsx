import React, { useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import styled from "@emotion/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ChargePointScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState("locations");

  const chargeLocations = [
    {
      id: "1",
      name: "메인 충전소",
      location: "중앙광장 옆",
      hours: "10:00 - 20:00",
      status: "운영중",
      distance: "50m",
      isPopular: true,
    },
    {
      id: "2",
      name: "A구역 충전소",
      location: "A구역 입구",
      hours: "10:00 - 19:00",
      status: "운영중",
      distance: "120m",
      isPopular: false,
    },
    {
      id: "3",
      name: "C구역 충전소",
      location: "C구역 중앙",
      hours: "10:00 - 18:00",
      status: "운영중",
      distance: "200m",
      isPopular: false,
    },
  ];

  const chargeHistory = [
    {
      id: "1",
      amount: "+30,000",
      time: "2025.04.22 10:23",
      location: "메인 충전소",
      method: "현금",
    },
    {
      id: "2",
      amount: "+10,000",
      time: "2025.04.22 11:15",
      location: "A구역 충전소",
      method: "카드",
    },
    {
      id: "3",
      amount: "+50,000",
      time: "2025.04.21 15:42",
      location: "메인 충전소",
      method: "계좌이체",
    },
    {
      id: "4",
      amount: "+20,000",
      time: "2025.04.21 12:10",
      location: "C구역 충전소",
      method: "카드",
    },
  ];

  const handleChargeRequest = () => {
    Alert.alert(
      "충전 안내",
      "포인트 충전은 행사장 내 충전소에서만 가능합니다. 가까운 충전소를 방문해주세요.",
      [{ text: "확인", style: "default" }]
    );
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
          <BackButton onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#222222" />
          </BackButton>
          <HeaderTitle>포인트 충전</HeaderTitle>
          <IconButton>
            <Ionicons name="help-circle-outline" size={22} color="#222222" />
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
          <BalanceLabel>현재 포인트</BalanceLabel>
          <AmountText>
            32,000
            <Won>P</Won>
          </AmountText>

          <ChargeButton onPress={handleChargeRequest}>
            <ChargeButtonText>충전소에서 충전하기</ChargeButtonText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </ChargeButton>

          <GuideText>
            * 포인트 충전은 행사장 내 충전소에서만 가능합니다
          </GuideText>
        </BalanceSection>

        <TabSection>
          <TabButton
            active={selectedTab === "locations"}
            onPress={() => setSelectedTab("locations")}
          >
            <TabText active={selectedTab === "locations"}>충전소 위치</TabText>
          </TabButton>
          <TabButton
            active={selectedTab === "history"}
            onPress={() => setSelectedTab("history")}
          >
            <TabText active={selectedTab === "history"}>충전 내역</TabText>
          </TabButton>
        </TabSection>

        {selectedTab === "locations" ? (
          <LocationsSection>
            <SectionHeaderRow>
              <SectionTitle>충전소 위치</SectionTitle>
              <ViewMapButton>
                <ViewMapText>지도 보기</ViewMapText>
                <Ionicons name="map-outline" size={14} color="#315DE7" />
              </ViewMapButton>
            </SectionHeaderRow>

            {chargeLocations.map((location) => (
              <LocationCard key={location.id}>
                <LocationIconContainer>
                  <Ionicons name="card" size={24} color="#315DE7" />
                </LocationIconContainer>

                <LocationContent>
                  <LocationHeader>
                    <LocationName>{location.name}</LocationName>
                    {location.isPopular && <PopularTag>인기</PopularTag>}
                  </LocationHeader>
                  <LocationAddress>
                    <Ionicons name="location" size={14} color="#888888" />
                    <LocationText>{location.location}</LocationText>
                  </LocationAddress>
                  <LocationHours>
                    <Ionicons name="time-outline" size={14} color="#888888" />
                    <LocationText>{location.hours}</LocationText>
                  </LocationHours>
                </LocationContent>

                <LocationRightContent>
                  <StatusContainer status={location.status === "운영중"}>
                    <StatusText status={location.status}>
                      {location.status}
                    </StatusText>
                  </StatusContainer>
                  <DistanceText>{location.distance}</DistanceText>
                  <NavigateButton>
                    <Ionicons name="navigate" size={18} color="#315DE7" />
                  </NavigateButton>
                </LocationRightContent>
              </LocationCard>
            ))}

            <PaymentMethodSection>
              <MethodTitle>결제 수단</MethodTitle>
              <MethodRow>
                <MethodItem>
                  <MethodIcon style={{ backgroundColor: "#EEF2FF" }}>
                    <Ionicons name="cash-outline" size={18} color="#315DE7" />
                  </MethodIcon>
                  <MethodLabel>현금</MethodLabel>
                </MethodItem>
                <MethodItem>
                  <MethodIcon style={{ backgroundColor: "#F2F7F2" }}>
                    <Ionicons name="card-outline" size={18} color="#067A49" />
                  </MethodIcon>
                  <MethodLabel>카드</MethodLabel>
                </MethodItem>
                <MethodItem>
                  <MethodIcon style={{ backgroundColor: "#FFF3E8" }}>
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color="#FF571A"
                    />
                  </MethodIcon>
                  <MethodLabel>계좌이체</MethodLabel>
                </MethodItem>
              </MethodRow>
            </PaymentMethodSection>
          </LocationsSection>
        ) : (
          <HistorySection>
            <SectionHeaderRow>
              <SectionTitle>충전 내역</SectionTitle>
            </SectionHeaderRow>

            <HistoryCard>
              {chargeHistory.map((history, index) => (
                <React.Fragment key={history.id}>
                  <HistoryItem>
                    <HistoryIconContainer>
                      <Ionicons name="card" size={20} color="#315DE7" />
                    </HistoryIconContainer>

                    <HistoryContent>
                      <HistoryAmount>{history.amount}P</HistoryAmount>
                      <HistoryDetails>
                        <HistoryLocation>{history.location}</HistoryLocation>
                        <MethodPill>
                          <MethodPillText>{history.method}</MethodPillText>
                        </MethodPill>
                      </HistoryDetails>
                      <HistoryTime>{history.time}</HistoryTime>
                    </HistoryContent>
                  </HistoryItem>

                  {index < chargeHistory.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </HistoryCard>
          </HistorySection>
        )}

        <InfoSection>
          <InfoTitle>충전 안내</InfoTitle>
          <InfoItem>
            <InfoBullet />
            <InfoText>
              포인트는 행사장 내 충전소에서만 충전 가능합니다.
            </InfoText>
          </InfoItem>
          <InfoItem>
            <InfoBullet />
            <InfoText>
              충전 가능 금액: 5,000P, 10,000P, 30,000P, 50,000P
            </InfoText>
          </InfoItem>
          <InfoItem>
            <InfoBullet />
            <InfoText>
              미사용 포인트는 행사 종료 후 환불 가능합니다. (환불 장소: 메인
              충전소)
            </InfoText>
          </InfoItem>
          <InfoItem>
            <InfoBullet />
            <InfoText>환불 기간: 행사 종료일로부터 7일 이내</InfoText>
          </InfoItem>
        </InfoSection>
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

const BackButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
`;

const IconButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  justify-content: center;
  align-items: center;
`;

const BalanceSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
  align-items: center;
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

const ChargeButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #315de7;
  border-radius: 10px;
  padding: 14px 20px;
  width: 80%;
  margin-bottom: 16px;
`;

const ChargeButtonText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-right: 8px;
`;

const GuideText = styled.Text`
  font-size: 13px;
  color: #888888;
  text-align: center;
`;

const TabSection = styled.View`
  flex-direction: row;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #f2f2f7;
`;

interface TabProps {
  active: boolean;
}

const TabButton = styled.TouchableOpacity<TabProps>`
  flex: 1;
  padding: 14px 0;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) => (props.active ? "#315DE7" : "transparent")};
`;

const TabText = styled.Text<TabProps>`
  font-size: 15px;
  font-weight: ${(props) => (props.active ? "600" : "400")};
  color: ${(props) => (props.active ? "#315DE7" : "#666666")};
`;

const LocationsSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const HistorySection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.3px;
`;

const ViewMapButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const ViewMapText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #315de7;
  margin-right: 4px;
`;

const LocationCard = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #f2f2f7;
`;

const LocationIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #eef2ff;
  justify-content: center;
  align-items: center;
`;

const LocationContent = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const LocationHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const LocationName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin-right: 8px;
`;

const PopularTag = styled.Text`
  font-size: 10px;
  font-weight: 500;
  color: #ff571a;
  background-color: #fff3e8;
  padding: 2px 6px;
  border-radius: 4px;
`;

const LocationAddress = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const LocationText = styled.Text`
  font-size: 13px;
  color: #888888;
  margin-left: 4px;
`;

const LocationHours = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LocationRightContent = styled.View`
  align-items: flex-end;
  justify-content: space-between;
`;

interface StatusProps {
  status: boolean;
}

const StatusContainer = styled.View<StatusProps>`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${(props) => (props.status ? "#F2F7F2" : "#FFF3E8")};
`;

const StatusText = styled.Text<{ status: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${(props) => (props.status ? "#067A49" : "#FF571A")};
`;

const DistanceText = styled.Text`
  font-size: 13px;
  color: #888888;
  margin: 4px 0;
`;

const NavigateButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #eef2ff;
  justify-content: center;
  align-items: center;
`;

const PaymentMethodSection = styled.View`
  margin-top: 24px;
`;

const MethodTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 16px;
`;

const MethodRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const MethodItem = styled.View`
  align-items: center;
  width: 30%;
`;

const MethodIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const MethodLabel = styled.Text`
  font-size: 14px;
  color: #444444;
`;

const HistoryCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
`;

const HistoryItem = styled.View`
  flex-direction: row;
  padding: 16px;
  align-items: center;
`;

const HistoryIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #eef2ff;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
`;

const HistoryContent = styled.View`
  flex: 1;
`;

const HistoryAmount = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #315de7;
  margin-bottom: 4px;
`;

const HistoryDetails = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const HistoryLocation = styled.Text`
  font-size: 14px;
  color: #444444;
  margin-right: 8px;
`;

const MethodPill = styled.View`
  background-color: #f5f5f7;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MethodPillText = styled.Text`
  font-size: 11px;
  color: #666666;
`;

const HistoryTime = styled.Text`
  font-size: 12px;
  color: #888888;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #f5f5f5;
  margin-left: 70px;
`;

const InfoSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const InfoTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 16px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  margin-bottom: 10px;
`;

const InfoBullet = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #666666;
  margin-top: 6px;
  margin-right: 10px;
`;

const InfoText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #666666;
  line-height: 20px;
`;
