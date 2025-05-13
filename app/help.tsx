import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

const BACKGROUND_COLOR = "#F5F6F8";

interface HelpItem {
  title: string;
  content: string;
}

export default function HelpScreen() {
  const helpItems: HelpItem[] = [
    {
      title: "앱 기본 사용법",
      content:
        "앱 하단 네비게이션 바를 통해 홈, 부스, 공지사항, 프로필 화면으로 이동할 수 있습니다.",
    },
    {
      title: "부스 이용하기",
      content:
        "부스 화면에서는 현재 운영 중인 부스 목록을 확인할 수 있습니다. 부스를 선택하면 상세 정보와 위치를 볼 수 있습니다.",
    },
    {
      title: "포인트 사용법",
      content:
        "홈 화면에서 현재 포인트 잔액을 확인할 수 있습니다. QR 스캔으로 부스에서 결제합니다. 거래 내역도 확인 가능합니다.",
    },
    {
      title: "공지사항 확인",
      content:
        "공지사항 화면에서 행사 관련 정보와 업데이트를 확인하세요. 중요 공지는 상단에 고정되어 있습니다.",
    },
    {
      title: "자주 묻는 질문",
      content:
        "Q: 포인트는 어떻게 충전하나요?\nA: 행사 부스에서 현금으로 충전이 가능합니다.\n\nQ: 앱에 오류가 있어요.\nA: 프로필 > 지원 > 문의하기를 통해 알려주세요.",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>도움말</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {helpItems.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemContent}>{item.content}</Text>
            </View>
          ))}
        </ScrollView>
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  itemTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  itemContent: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});
