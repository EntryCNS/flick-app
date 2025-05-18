import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

const BACKGROUND_COLOR = "#F5F6F8";

interface InfoSection {
  title: string;
  items: InfoItem[];
}

interface InfoItem {
  label: string;
  value: string;
  isLink?: boolean;
}

export default function ServiceInfoScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error("링크를 열 수 없습니다:", err);
    });
  };

  const infoSections: InfoSection[] = [
    {
      title: "앱 정보",
      items: [
        { label: "앱 버전", value: "1.0.1" },
        { label: "업데이트 날짜", value: "2025.05.14" },
        { label: "최소 요구 사항", value: "iOS 13.0 / Android 8.0 이상" },
      ],
    },
    {
      title: "서비스 정보",
      items: [
        { label: "서비스명", value: "Flick Core" },
        { label: "주최", value: "대구소프트웨어마이스터고등학교" },
        { label: "서비스 기간", value: "2025.05.20" },
      ],
    },
    {
      title: "운영 정보",
      items: [
        { label: "운영 시간", value: "하루" },
        { label: "고객센터", value: "proxiakr@gmail.com" },
        { label: "개발 및 운영", value: "동아리 CNS" },
      ],
    },
    // {
    //   title: "법적 정보",
    //   items: [
    //     {
    //       label: "개인정보처리방침",
    //       value: "바로가기",
    //       isLink: true,
    //     },
    //     {
    //       label: "이용약관",
    //       value: "바로가기",
    //       isLink: true,
    //     },
    //     {
    //       label: "오픈소스 라이선스",
    //       value: "바로가기",
    //       isLink: true,
    //     },
    //   ],
    // },
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
          <Text style={styles.headerTitle}>서비스 정보</Text>
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
          {infoSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.card}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.infoRow,
                    itemIndex < section.items.length - 1 && styles.rowBorder,
                  ]}
                >
                  <Text style={styles.infoLabel}>{item.label}</Text>

                  {item.isLink ? (
                    <TouchableOpacity
                      onPress={() =>
                        openLink(`https://example.com/${item.label}`)
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.infoLink}>{item.value}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoValue}>{item.value}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>
              © 2025 CNS. All rights reserved.
            </Text>
          </View>
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
  sectionTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLabel: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.text,
  },
  infoValue: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoLink: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.primary500,
  },
  copyrightContainer: {
    padding: 10,
    alignItems: "center",
  },
  copyrightText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: "center",
  },
});
