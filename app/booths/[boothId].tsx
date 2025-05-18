import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";

import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { Skeleton } from "@/components/Skeleton";

const BACKGROUND_COLOR = "#F5F6F8";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isSoldOut: boolean;
}

interface Booth {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  products: Product[];
}

function BoothSkeleton() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.boothImageContainer}>
        <Skeleton width="100%" height={200} />
      </View>

      <View style={styles.card}>
        <View style={styles.boothHeader}>
          <Skeleton width={150} height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={14} style={{ marginBottom: 4 }} />
          <Skeleton width="80%" height={14} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Skeleton width={120} height={18} />
        </View>
        <View style={styles.productsList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={`product-skeleton-${index}`} style={styles.productItem}>
              <View style={styles.productImageContainer}>
                <Skeleton width={80} height={80} borderRadius={12} />
              </View>
              <View style={styles.productContent}>
                <Skeleton width={120} height={16} style={{ marginBottom: 6 }} />
                <Skeleton width={80} height={14} style={{ marginBottom: 12 }} />
                <Skeleton width={70} height={16} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ErrorContent({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <MotiView
      style={styles.errorContainer}
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity
        style={styles.errorBackButton}
        onPress={onBack}
        activeOpacity={0.85}
      >
        <Text style={styles.backButtonText}>돌아가기</Text>
      </TouchableOpacity>
    </MotiView>
  );
}

function ProductItem({ product }: { product: Product }) {
  return (
    <MotiView
      style={styles.productItem}
      from={{ opacity: 0, translateY: 5 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 200 }}
    >
      <View style={styles.productImageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons
              name="fast-food-outline"
              size={32}
              color={COLORS.gray400}
            />
          </View>
        )}
        {product.isSoldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>품절</Text>
          </View>
        )}
      </View>

      <View style={styles.productContent}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        {product.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        <Text style={styles.productPrice}>
          {product.price.toLocaleString()}원
        </Text>
      </View>
    </MotiView>
  );
}

export default function BoothDetailScreen() {
  const { boothId } = useLocalSearchParams<{ boothId: string }>();

  const {
    data: booth,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["booth", boothId],
    queryFn: async () => {
      if (!boothId) throw new Error("부스 정보를 찾을 수 없습니다");
      const { data } = await api.get<Booth>(`/booths/${boothId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : "부스 정보를 불러오는데 실패했습니다";

  const handleBack = useCallback(() => router.back(), []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const isPullToRefreshing = isFetching && !isLoading;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.fixedHeaderContainer}>
        <View style={styles.statusBarFill} />
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>부스 정보</Text>
            <View style={styles.rightButtonContainer}>
              {!isLoading && !error && booth && (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefresh}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
              {(isLoading || error || !booth) && (
                <View style={styles.placeholderButton} />
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />

        {isLoading ? (
          <BoothSkeleton />
        ) : error || !booth ? (
          <ErrorContent message={errorMessage} onBack={handleBack} />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isPullToRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary500}
                colors={[COLORS.primary500]}
                progressBackgroundColor={COLORS.white}
              />
            }
          >
            <MotiView
              style={styles.boothImageContainer}
              from={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300 }}
            >
              {booth.imageUrl ? (
                <Image
                  source={{ uri: booth.imageUrl }}
                  style={styles.boothImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.boothImagePlaceholder}>
                  <Ionicons
                    name="storefront-outline"
                    size={64}
                    color={COLORS.gray300}
                  />
                </View>
              )}
            </MotiView>

            <MotiView
              style={styles.card}
              from={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 250, delay: 50 }}
            >
              <View style={styles.boothHeader}>
                <Text style={styles.boothName}>{booth.name}</Text>
                {booth.description && (
                  <Text style={styles.boothDescription}>
                    {booth.description}
                  </Text>
                )}
              </View>
            </MotiView>

            <MotiView
              style={styles.card}
              from={{ opacity: 0, translateY: 5 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 250, delay: 100 }}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>메뉴</Text>
              </View>
              <View style={styles.productsList}>
                {booth.products.length === 0 ? (
                  <MotiView
                    style={styles.emptyContainer}
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "timing", duration: 250 }}
                  >
                    <Ionicons
                      name="fast-food-outline"
                      size={48}
                      color={COLORS.gray300}
                    />
                    <Text style={styles.emptyText}>등록된 상품이 없습니다</Text>
                  </MotiView>
                ) : (
                  booth.products.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                )}
              </View>
            </MotiView>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fixedHeaderContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  statusBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: COLORS.white,
    zIndex: 11,
  },
  safeArea: {
    backgroundColor: COLORS.white,
    zIndex: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 24,
    flex: 1,
  },
  rightButtonContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderButton: {
    width: 24,
    height: 24,
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
  scrollView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 10,
  },
  boothImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.gray100,
  },
  boothImage: {
    width: "100%",
    height: "100%",
  },
  boothImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: Platform.OS === "ios" ? 0 : 0.1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  boothHeader: {
    padding: 16,
    justifyContent: "center",
  },
  boothName: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 8,
  },
  boothDescription: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    color: COLORS.text,
  },
  sectionTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
  },
  productsList: {
    paddingVertical: 6,
  },
  productItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.gray100,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  soldOutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  soldOutText: {
    fontFamily: "Pretendard-Bold",
    color: COLORS.white,
    fontSize: 14,
  },
  productContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  productName: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  productDescription: {
    fontFamily: "Pretendard-Medium",
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: COLORS.primary600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  emptyText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.gray500,
    marginTop: 12,
  },
  errorText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  errorBackButton: {
    backgroundColor: COLORS.primary600,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  backButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
});
