import React, { useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";

interface BoothLocation {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  isPopular: boolean;
  waitingTime: string;
  color: string;
  bgColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function BoothMapScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  const categories = ["전체", "푸드", "굿즈", "게임", "체험", "포토존"];

  const boothLocations: BoothLocation[] = [
    {
      id: "1",
      name: "가연's 페이스페인팅",
      category: "체험",
      location: "A구역 12번",
      description: "반짝이 페이스페인팅",
      isPopular: true,
      waitingTime: "15분",
      color: COLORS.info700,
      bgColor: COLORS.info50,
      icon: "brush",
    },
    {
      id: "2",
      name: "은관이의 꽃배달",
      category: "굿즈",
      location: "B구역 3번",
      description: "장미, 튤립, 해바라기",
      isPopular: true,
      waitingTime: "30분",
      color: COLORS.warning600,
      bgColor: COLORS.warning50,
      icon: "flower",
    },
    {
      id: "3",
      name: "성준's 타로점",
      category: "체험",
      location: "C구역 8번",
      description: "연애운, 취업운 타로",
      isPopular: true,
      waitingTime: "45분",
      color: COLORS.success600,
      bgColor: COLORS.success50,
      icon: "sparkles",
    },
    {
      id: "4",
      name: "민수's 디저트",
      category: "푸드",
      location: "A구역 5번",
      description: "마카롱, 쿠키, 케이크",
      isPopular: false,
      waitingTime: "10분",
      color: COLORS.primary600,
      bgColor: COLORS.primary50,
      icon: "cafe",
    },
    {
      id: "5",
      name: "지현's 포토부스",
      category: "포토존",
      location: "D구역 2번",
      description: "인생네컷, 폴라로이드",
      isPopular: false,
      waitingTime: "20분",
      color: COLORS.danger600,
      bgColor: COLORS.danger50,
      icon: "camera",
    },
    {
      id: "6",
      name: "현우's 보드게임",
      category: "게임",
      location: "B구역 9번",
      description: "다양한 보드게임 체험",
      isPopular: false,
      waitingTime: "5분",
      color: COLORS.warning500,
      bgColor: COLORS.warning50,
      icon: "game-controller",
    },
  ];

  const filteredBooths =
    activeCategory === "전체"
      ? boothLocations
      : boothLocations.filter((booth) => booth.category === activeCategory);

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
          <Text style={styles.headerTitle}>부스맵</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter" size={20} color={COLORS.text} />
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
        <View style={styles.searchSection}>
          <View
            style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
          >
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="부스 이름, 위치 검색"
              placeholderTextColor={COLORS.textSecondary}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </View>
        </View>

        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>축제 지도</Text>
          <View style={styles.mapCard}>
            <Image
              source={require("../assets/images/map-placeholder.png")}
              style={styles.mapImage}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.warning600 },
                    ]}
                  />
                  <Text style={styles.legendText}>A구역</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.success600 },
                    ]}
                  />
                  <Text style={styles.legendText}>B구역</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.primary600 },
                    ]}
                  />
                  <Text style={styles.legendText}>C구역</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.info700 },
                    ]}
                  />
                  <Text style={styles.legendText}>D구역</Text>
                </View>
              </View>
              <View style={styles.zoomArea}>
                <TouchableOpacity style={styles.zoomButton}>
                  <Ionicons name="add" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomButton}>
                  <Ionicons name="remove" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  activeCategory === item && styles.categoryButtonActive,
                ]}
                onPress={() => setActiveCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === item && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        <View style={styles.boothsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>부스 목록</Text>
            <Text style={styles.totalCount}>
              {filteredBooths.length}개의 부스
            </Text>
          </View>

          {filteredBooths.map((booth) => (
            <TouchableOpacity key={booth.id} style={styles.boothCard}>
              <View
                style={[
                  styles.boothIconContainer,
                  { backgroundColor: booth.bgColor },
                ]}
              >
                <Ionicons name={booth.icon} size={24} color={booth.color} />
              </View>
              <View style={styles.boothContent}>
                <View style={styles.boothHeader}>
                  <Text style={styles.boothName}>{booth.name}</Text>
                  {booth.isPopular && (
                    <Text style={styles.popularTag}>인기</Text>
                  )}
                </View>
                <View style={styles.boothLocation}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.locationText}>{booth.location}</Text>
                </View>
                <Text style={styles.boothDescription}>{booth.description}</Text>
              </View>
              <View style={styles.boothRightContent}>
                <View style={styles.waitingTimeContainer}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.waitingTimeText}>
                    {booth.waitingTime}
                  </Text>
                </View>
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
  searchSection: {
    padding: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 0,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 0,
  },
  searchBarFocused: {
    borderWidth: 1,
    borderColor: COLORS.primary600,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  mapSection: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginTop: 12,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  mapCard: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.gray100,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapLegend: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  zoomArea: {
    alignItems: "center",
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoriesSection: {
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    marginTop: 12,
  },
  categoryButton: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary600,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  boothsSection: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  totalCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  boothCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  boothIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  boothContent: {
    flex: 1,
    marginLeft: 16,
  },
  boothHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  boothName: {
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
  boothLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  boothDescription: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  boothRightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  waitingTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  waitingTimeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  navigateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary50,
    justifyContent: "center",
    alignItems: "center",
  },
});
