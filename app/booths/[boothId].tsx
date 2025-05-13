import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import api from "@/libs/api";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
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

const BoothSkeleton = () => (
  <View style={styles.contentWrapper}>
    <View style={styles.bgExtender} />
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
  </View>
);

export default function BoothDetailScreen() {
  const { boothId } = useLocalSearchParams<{ boothId: string }>();
  const [booth, setBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBoothDetail = useCallback(async () => {
    if (!boothId) {
      setError("부스 정보를 찾을 수 없습니다");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get<Booth>(`/booths/${boothId}`);
      setBooth(data);
      setError("");
    } catch (err) {
      setError("부스 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [boothId]);

  useEffect(() => {
    fetchBoothDetail();
  }, [fetchBoothDetail]);

  const renderErrorContent = useCallback(
    (errorMessage: string) => (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={COLORS.gray300}
        />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    ),
    []
  );

  const renderProductItem = useCallback(
    (product: Product) => (
      <View style={styles.productItem} key={product.id}>
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
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>부스 정보</Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <BoothSkeleton />
      ) : error || !booth ? (
        renderErrorContent(error || "부스 정보를 불러올 수 없습니다")
      ) : (
        <View style={styles.contentWrapper}>
          <View style={styles.bgExtender} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.boothImageContainer}>
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
            </View>

            <View style={styles.card}>
              <View style={styles.boothHeader}>
                <Text style={styles.boothName}>{booth.name}</Text>
                {booth.description && (
                  <Text style={styles.boothDescription}>
                    {booth.description}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>메뉴</Text>
              </View>
              <View style={styles.productsList}>
                {booth.products.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="fast-food-outline"
                      size={48}
                      color={COLORS.gray300}
                    />
                    <Text style={styles.emptyText}>등록된 상품이 없습니다</Text>
                  </View>
                ) : (
                  booth.products.map((product) => renderProductItem(product))
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
    lineHeight: 24,
  },
  backButton: {
    width: 24,
    height: 24,
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
  scrollView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 14,
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
    padding: 18,
  },
  boothName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  boothDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  productsList: {
    paddingVertical: 8,
  },
  productItem: {
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
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
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  productContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
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
    fontSize: 15,
    color: COLORS.gray500,
    marginTop: 12,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
});
