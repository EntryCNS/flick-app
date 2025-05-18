import React, { useCallback, memo } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "@/constants/colors";
import api from "@/libs/api";
import { StatusBar } from "expo-status-bar";
import { Skeleton } from "@/components/Skeleton";

interface Booth {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

const BACKGROUND_COLOR = "#F5F6F8";

const BoothSkeletonLoader = memo(() => (
  <View style={styles.card}>
    <View style={styles.boothImageContainer}>
      <Skeleton width={100} height={100} borderRadius={0} />
    </View>
    <View style={styles.boothContent}>
      <Skeleton width={140} height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="60%" height={14} />
    </View>
    <View style={styles.arrowContainer}>
      <Skeleton width={16} height={16} style={{ borderRadius: 8 }} />
    </View>
  </View>
));

const BoothCard = memo(
  ({ booth, onPress }: { booth: Booth; onPress: (id: number) => void }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress(booth.id)}
    >
      <View style={styles.boothImageContainer}>
        {booth.imageUrl ? (
          <Image
            source={{ uri: booth.imageUrl }}
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
          {booth.name}
        </Text>
        {booth.description && (
          <Text style={styles.boothDescription} numberOfLines={2}>
            {booth.description}
          </Text>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
      </View>
    </TouchableOpacity>
  )
);

const EmptyComponent = memo(
  ({ error, onRetry }: { error: string | null; onRetry: () => void }) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyText}>
        {error ? error : "등록된 부스가 없습니다"}
      </Text>
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.7}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  )
);

export default function BoothsScreen() {
  const fetchBooths = useCallback(async (): Promise<Booth[]> => {
    const { data } = await api.get<Booth[]>("/booths");
    return data;
  }, []);

  const {
    data: booths = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["booths"],
    queryFn: fetchBooths,
    staleTime: 60 * 1000, // 1분
  });

  const navigateToBoothDetail = useCallback((boothId: number) => {
    router.push({
      pathname: "/booths/[boothId]",
      params: { boothId },
    });
  }, []);

  const renderBoothItem: ListRenderItem<Booth> = useCallback(
    ({ item }) => <BoothCard booth={item} onPress={navigateToBoothDetail} />,
    [navigateToBoothDetail]
  );

  const keyExtractor = useCallback((item: Booth) => `booth-${item.id}`, []);

  const renderSkeletonList = useCallback(
    () => (
      <FlatList
        data={Array.from({ length: 5 }, (_, i) => i + 1)}
        renderItem={() => <BoothSkeletonLoader />}
        keyExtractor={(item) => `skeleton-${item}`}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    ),
    []
  );

  const errorMessage = isError ? "부스 정보를 불러오는데 실패했습니다" : null;

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>부스</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <View style={styles.contentContainer}>
          {isLoading && !isFetching ? (
            renderSkeletonList()
          ) : (
            <FlatList
              data={booths}
              renderItem={renderBoothItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isFetching && !isLoading}
                  onRefresh={refetch}
                  tintColor={COLORS.primary500}
                  colors={[COLORS.primary500]}
                />
              }
              ListEmptyComponent={
                <EmptyComponent error={errorMessage} onRetry={refetch} />
              }
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
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  boothName: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  boothDescription: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
    letterSpacing: -0.1,
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
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    color: COLORS.gray500,
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary500,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 14,
  },
});
