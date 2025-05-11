import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import api from "@/libs/api";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";

interface Booth {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
}

const BACKGROUND_COLOR = COLORS.secondary50;

const BoothSkeletonLoader = memo(() => (
  <View style={styles.card}>
    <View style={styles.boothImageContainer}>
      <Skeleton width={100} height={100} borderRadius={0} />
    </View>
    <View style={styles.boothContent}>
      <Skeleton width={140} height={16} style={{ marginBottom: 8 }} />

      <Skeleton
        width={70}
        height={20}
        style={{ marginBottom: 8, borderRadius: 4 }}
      />

      <Skeleton width="90%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />

      <View style={styles.locationContainer}>
        <Skeleton width={10} height={10} style={{ borderRadius: 5 }} />
        <Skeleton width={90} height={12} style={{ marginLeft: 4 }} />
      </View>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
    </View>
  </View>
));

export default function BoothsScreen() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooths = useCallback(
    async (shouldRefresh = false): Promise<void> => {
      try {
        if (shouldRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const { data } = await api.get<Booth[]>("/booths");
        setBooths(data);
        setError(null);
      } catch (error) {
        console.error("부스 목록 조회 실패:", error);
        setError("부스 정보를 불러오는데 실패했습니다");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const handleRefresh = useCallback(() => {
    fetchBooths(true);
  }, [fetchBooths]);

  useEffect(() => {
    fetchBooths();
  }, [fetchBooths]);

  const navigateToBoothDetail = useCallback((boothId: number) => {
    router.push({
      pathname: "/booths/[boothId]",
      params: { boothId },
    });
  }, []);

  const renderBoothCard: ListRenderItem<Booth> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigateToBoothDetail(item.id)}
      >
        <View style={styles.boothImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.boothImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.boothImage, styles.boothImagePlaceholder]}>
              <Ionicons
                name="storefront-outline"
                size={32}
                color={COLORS.gray400}
              />
            </View>
          )}
        </View>
        <View style={styles.boothContent}>
          <Text style={styles.boothName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          {item.description && (
            <Text style={styles.boothDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.location && (
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
        </View>
      </TouchableOpacity>
    ),
    [navigateToBoothDetail]
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="storefront-outline" size={64} color={COLORS.gray300} />
        <Text style={styles.emptyText}>
          {error ? error : "등록된 부스가 없습니다"}
        </Text>
        {error && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBooths()}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    [error, fetchBooths]
  );

  const renderSkeletonList = () => (
    <FlatList
      data={Array.from({ length: 5 }, (_, i) => i + 1)}
      renderItem={() => <BoothSkeletonLoader />}
      keyExtractor={(item) => `skeleton-${item}`}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const keyExtractor = useCallback((item: Booth) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <StatusBar animated style="dark" backgroundColor={COLORS.white} />

      <SafeAreaView style={styles.headerArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>부스</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="search-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => router.push("/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <View style={styles.contentContainer}>
          {loading && !refreshing ? (
            renderSkeletonList()
          ) : (
            <FlatList
              data={booths}
              renderItem={renderBoothCard}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary500}
                  colors={[COLORS.primary500]}
                />
              }
              ListEmptyComponent={renderEmptyComponent}
              initialNumToRender={8}
              maxToRenderPerBatch={5}
              windowSize={10}
              removeClippedSubviews={Platform.OS === "android"}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerArea: {
    backgroundColor: COLORS.white,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingsButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
  },
  bgExtender: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1000,
    height: 1000,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 1,
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
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  boothImageContainer: {
    width: 100,
    height: 100,
    overflow: "hidden",
  },
  boothImage: {
    width: 100,
    height: 100,
  },
  boothImagePlaceholder: {
    backgroundColor: COLORS.gray200,
    alignItems: "center",
    justifyContent: "center",
  },
  boothContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  boothName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryContainer: {
    backgroundColor: COLORS.primary50,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary700,
    fontWeight: "500",
  },
  boothDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  arrowContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray500,
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: COLORS.primary500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
