import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Platform,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import api from "@/libs/api";

interface Booth {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
}

export default function BoothsScreen() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      params: { boothId: boothId },
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      alert(`'${searchQuery}' 검색 기능은 준비 중입니다.`);
    }
  }, [searchQuery]);

  const renderBoothCard: ListRenderItem<Booth> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.boothCard}
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
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
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

  const keyExtractor = useCallback((item: Booth) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>부스</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSearch}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/notifications")}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary500} />
        </View>
      ) : (
        <FlatList
          data={booths}
          renderItem={renderBoothCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContainer,
            booths.length === 0 && { flex: 1 },
          ]}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  boothCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    overflow: "hidden",
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
    backgroundColor: COLORS.gray100,
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
