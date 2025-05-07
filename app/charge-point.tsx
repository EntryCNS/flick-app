import React, { useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
  View,
  Alert,
  Text,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";

interface ChargeLocation {
  id: string;
  name: string;
  location: string;
  hours: string;
  status: string;
  distance: string;
  isPopular: boolean;
}

interface ChargeHistoryItem {
  id: string;
  amount: string;
  time: string;
  location: string;
  method: string;
}

export default function ChargePointScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState<"locations" | "history">(
    "locations"
  );

  const chargeLocations: ChargeLocation[] = [
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

  const chargeHistory: ChargeHistoryItem[] = [
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

  const handleChargeRequest = (): void => {
    Alert.alert(
      "충전 안내",
      "포인트 충전은 행사장 내 충전소에서만 가능합니다. 가까운 충전소를 방문해주세요.",
      [{ text: "확인", style: "default" }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
          shadowColor: COLORS.black,
          backgroundColor: COLORS.white,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>포인트 충전</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
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
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>현재 포인트</Text>
          <Text style={styles.amountText}>
            32,000
            <Text style={styles.won}>P</Text>
          </Text>

          <TouchableOpacity
            style={styles.chargeButton}
            onPress={handleChargeRequest}
          >
            <Text style={styles.chargeButtonText}>충전소에서 충전하기</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.guideText}>
            * 포인트 충전은 행사장 내 충전소에서만 가능합니다
          </Text>
        </View>

        <View style={styles.tabSection}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "locations" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab("locations")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "locations" && styles.tabTextActive,
              ]}
            >
              충전소 위치
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "history" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "history" && styles.tabTextActive,
              ]}
            >
              충전 내역
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "locations" ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>충전소 위치</Text>
              <TouchableOpacity style={styles.viewMapButton}>
                <Text style={styles.viewMapText}>지도 보기</Text>
                <Ionicons
                  name="map-outline"
                  size={14}
                  color={COLORS.primary600}
                />
              </TouchableOpacity>
            </View>

            {chargeLocations.map((location) => (
              <TouchableOpacity key={location.id} style={styles.locationCard}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="card" size={24} color={COLORS.primary600} />
                </View>

                <View style={styles.locationContent}>
                  <View style={styles.locationHeader}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    {location.isPopular && (
                      <Text style={styles.popularTag}>인기</Text>
                    )}
                  </View>
                  <View style={styles.locationAddress}>
                    <Ionicons
                      name="location"
                      size={14}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.locationText}>{location.location}</Text>
                  </View>
                  <View style={styles.locationHours}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.locationText}>{location.hours}</Text>
                  </View>
                </View>

                <View style={styles.locationRightContent}>
                  <View
                    style={[
                      styles.statusContainer,
                      location.status === "운영중"
                        ? styles.statusContainerOpen
                        : styles.statusContainerClosed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        location.status === "운영중"
                          ? styles.statusTextOpen
                          : styles.statusTextClosed,
                      ]}
                    >
                      {location.status}
                    </Text>
                  </View>
                  <Text style={styles.distanceText}>{location.distance}</Text>
                  <TouchableOpacity style={styles.navigateButton}>
                    <Ionicons
                      name="navigate"
                      size={18}
                      color={COLORS.primary600}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.paymentMethodSection}>
              <Text style={styles.methodTitle}>결제 수단</Text>
              <View style={styles.methodRow}>
                <View style={styles.methodItem}>
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: COLORS.primary50 },
                    ]}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={COLORS.primary600}
                    />
                  </View>
                  <Text style={styles.methodLabel}>현금</Text>
                </View>
                <View style={styles.methodItem}>
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: COLORS.success50 },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={COLORS.success600}
                    />
                  </View>
                  <Text style={styles.methodLabel}>카드</Text>
                </View>
                <View style={styles.methodItem}>
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: COLORS.warning50 },
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color={COLORS.warning600}
                    />
                  </View>
                  <Text style={styles.methodLabel}>계좌이체</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>충전 내역</Text>
            </View>

            <View style={styles.historyCard}>
              {chargeHistory.map((history, index) => (
                <React.Fragment key={history.id}>
                  <View style={styles.historyItem}>
                    <View style={styles.historyIconContainer}>
                      <Ionicons
                        name="card"
                        size={20}
                        color={COLORS.primary600}
                      />
                    </View>

                    <View style={styles.historyContent}>
                      <Text style={styles.historyAmount}>
                        {history.amount}P
                      </Text>
                      <View style={styles.historyDetails}>
                        <Text style={styles.historyLocation}>
                          {history.location}
                        </Text>
                        <View style={styles.methodPill}>
                          <Text style={styles.methodPillText}>
                            {history.method}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.historyTime}>{history.time}</Text>
                    </View>
                  </View>

                  {index < chargeHistory.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>충전 안내</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet} />
            <Text style={styles.infoText}>
              포인트는 행사장 내 충전소에서만 충전 가능합니다.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet} />
            <Text style={styles.infoText}>
              충전 가능 금액: 5,000P, 10,000P, 30,000P, 50,000P
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet} />
            <Text style={styles.infoText}>
              미사용 포인트는 행사 종료 후 환불 가능합니다. (환불 장소: 메인
              충전소)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoBullet} />
            <Text style={styles.infoText}>
              환불 기간: 행사 종료일로부터 7일 이내
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceSection: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 34,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.7,
    marginBottom: 24,
  },
  won: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 2,
  },
  chargeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary600,
    borderRadius: 10,
    padding: 14,
    paddingHorizontal: 20,
    width: "80%",
    marginBottom: 16,
  },
  chargeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
    marginRight: 8,
  },
  guideText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  tabSection: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tabButton: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary600,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "400",
    color: COLORS.gray500,
  },
  tabTextActive: {
    fontWeight: "600",
    color: COLORS.primary600,
  },
  section: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary600,
    marginRight: 4,
  },
  locationCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
  },
  locationContent: {
    flex: 1,
    marginLeft: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 8,
  },
  popularTag: {
    fontSize: 10,
    fontWeight: "500",
    color: COLORS.warning600,
    backgroundColor: COLORS.warning50,
    padding: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  locationAddress: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  locationHours: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationRightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  statusContainer: {
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusContainerOpen: {
    backgroundColor: COLORS.success50,
  },
  statusContainerClosed: {
    backgroundColor: COLORS.warning50,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextOpen: {
    color: COLORS.success600,
  },
  statusTextClosed: {
    color: COLORS.warning600,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    margin: 4,
    marginVertical: 4,
  },
  navigateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentMethodSection: {
    marginTop: 24,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodItem: {
    alignItems: "center",
    width: "30%",
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  historyItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  historyContent: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary600,
    marginBottom: 4,
  },
  historyDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 14,
    color: COLORS.gray600,
    marginRight: 8,
  },
  methodPill: {
    backgroundColor: COLORS.gray100,
    padding: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  methodPillText: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  historyTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 70,
  },
  infoSection: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray600,
    marginTop: 6,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
});
