import React, { useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
  Linking,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";

// Type definitions
interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  content: string;
  isImportant: boolean;
}

interface DirectionIconProps {
  bgColor: string;
  iconColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export default function InfoGuideScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqData: FaqItem[] = [
    {
      id: "1",
      question: "포인트는 어떻게 충전하나요?",
      answer:
        "포인트는 행사장 내 충전소에서 충전 가능합니다. 현금, 카드, 계좌이체로 충전하실 수 있습니다.",
    },
    {
      id: "2",
      question: "남은 포인트는 환불 가능한가요?",
      answer:
        "네, 미사용 포인트는 행사 종료 후 환불 가능합니다. 환불은 메인 충전소에서 행사 종료일로부터 7일 이내에 가능합니다.",
    },
    {
      id: "3",
      question: "QR 결제는 어떻게 하나요?",
      answer:
        "앱 하단의 결제 버튼을 눌러 QR 스캐너를 실행한 후, 부스에 있는 QR 코드를 스캔하시면 됩니다. 금액 확인 후 결제를 완료하세요.",
    },
    {
      id: "4",
      question: "행사 시간은 어떻게 되나요?",
      answer:
        "행사는 오전 10시부터 오후 8시까지 운영됩니다. 부스에 따라 운영 시간이 다를 수 있으니 부스맵에서 확인해주세요.",
    },
    {
      id: "5",
      question: "분실물은 어디서 찾을 수 있나요?",
      answer:
        "분실물은 중앙광장 안내센터에서 접수 및 보관하고 있습니다. 습득하신 분실물도 안내센터로 가져다주시기 바랍니다.",
    },
  ];

  const noticeData: NoticeItem[] = [
    {
      id: "1",
      title: "[공지] 우천 시 행사 진행 안내",
      date: "2025.04.21",
      content:
        "비가 올 경우에도 행사는 정상적으로 진행됩니다. 단, 일부 야외 부스는 실내로 이동하거나 임시 휴무할 수 있습니다.",
      isImportant: true,
    },
    {
      id: "2",
      title: "[안내] 충전소 운영 시간 연장",
      date: "2025.04.20",
      content: "4월 22일부터 메인 충전소 운영 시간이 오후 9시까지 연장됩니다.",
      isImportant: false,
    },
    {
      id: "3",
      title: "[공지] 포토존 이벤트 안내",
      date: "2025.04.19",
      content:
        "D구역 포토존에서 인증샷을 찍고 SNS에 업로드하면 무료 음료를 드립니다.",
      isImportant: false,
    },
  ];

  const toggleFaq = (id: string): void => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  const contactPhoneNumber = "010-1234-5678";
  const emergencyNumber = "010-9876-5432";

  const handlePhoneCall = (phoneNumber: string): void => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Helper function for info section icons
  const renderInfoIcon = ({
    bgColor,
    iconColor,
    iconName,
  }: DirectionIconProps): React.ReactElement => (
    <View style={[styles.infoIconContainer, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName} size={20} color={iconColor} />
    </View>
  );

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
          <Text style={styles.headerTitle}>안내</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={22} color={COLORS.text} />
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>행사 정보</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              {renderInfoIcon({
                bgColor: COLORS.primary50,
                iconColor: COLORS.primary600,
                iconName: "calendar",
              })}
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>행사 기간</Text>
                <Text style={styles.infoText}>2025.04.20 ~ 2025.04.26</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              {renderInfoIcon({
                bgColor: COLORS.success50,
                iconColor: COLORS.success600,
                iconName: "time",
              })}
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>운영 시간</Text>
                <Text style={styles.infoText}>10:00 ~ 20:00</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              {renderInfoIcon({
                bgColor: COLORS.warning50,
                iconColor: COLORS.warning600,
                iconName: "location",
              })}
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>행사 장소</Text>
                <Text style={styles.infoText}>서울시 강남구 영동대로 513</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoItem}>
              {renderInfoIcon({
                bgColor: COLORS.info50,
                iconColor: COLORS.info600,
                iconName: "people",
              })}
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>주최/주관</Text>
                <Text style={styles.infoText}>플릭 페스티벌 운영 위원회</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연락처</Text>

          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall(contactPhoneNumber)}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: COLORS.warning50 },
                ]}
              >
                <Ionicons name="call" size={20} color={COLORS.warning600} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>안내 센터</Text>
                <Text style={styles.contactText}>{contactPhoneNumber}</Text>
              </View>
              <View style={styles.callButton}>
                <Ionicons name="call-outline" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhoneCall(emergencyNumber)}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: COLORS.danger50 },
                ]}
              >
                <Ionicons name="medkit" size={20} color={COLORS.danger600} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>응급 상황</Text>
                <Text style={styles.contactText}>{emergencyNumber}</Text>
              </View>
              <View
                style={[
                  styles.callButton,
                  { backgroundColor: COLORS.danger600 },
                ]}
              >
                <Ionicons name="call-outline" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공지사항</Text>

          {noticeData.map((notice) => (
            <View
              key={notice.id}
              style={[
                styles.noticeCard,
                notice.isImportant && styles.noticeCardImportant,
              ]}
            >
              <View style={styles.noticeHeader}>
                <Text
                  style={[
                    styles.noticeTitle,
                    notice.isImportant && styles.noticeTitleImportant,
                  ]}
                >
                  {notice.title}
                </Text>
                <Text style={styles.noticeDate}>{notice.date}</Text>
              </View>
              <Text style={styles.noticeContent}>{notice.content}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>전체 공지사항 보기</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>

          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity
                style={styles.faqQuestionRow}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.questionIcon}>
                  <Text style={styles.questionText}>Q</Text>
                </View>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>

              {expandedFaq === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <View style={styles.answerIcon}>
                    <Text style={styles.answerText}>A</Text>
                  </View>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>전체 FAQ 보기</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>찾아오시는 길</Text>

          <View style={styles.mapCard}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={32} color={COLORS.gray400} />
              <Text style={styles.mapPlaceholderText}>지도 영역</Text>
            </View>

            <View style={styles.directionsContainer}>
              <View style={styles.directionItem}>
                <View
                  style={[
                    styles.directionIconContainer,
                    { backgroundColor: COLORS.primary50 },
                  ]}
                >
                  <Ionicons name="subway" size={18} color={COLORS.primary600} />
                </View>
                <View style={styles.directionText}>
                  <Text style={styles.directionTitle}>지하철</Text>
                  <Text style={styles.directionDetail}>
                    2호선 강남역 4번 출구에서 도보 5분
                  </Text>
                </View>
              </View>

              <View style={styles.directionItem}>
                <View
                  style={[
                    styles.directionIconContainer,
                    { backgroundColor: COLORS.success50 },
                  ]}
                >
                  <Ionicons name="bus" size={18} color={COLORS.success600} />
                </View>
                <View style={styles.directionText}>
                  <Text style={styles.directionTitle}>버스</Text>
                  <Text style={styles.directionDetail}>
                    간선: 145, 341, 472 / 지선: 4312
                  </Text>
                </View>
              </View>

              <View style={styles.directionItem}>
                <View
                  style={[
                    styles.directionIconContainer,
                    { backgroundColor: COLORS.warning50 },
                  ]}
                >
                  <Ionicons name="car" size={18} color={COLORS.warning600} />
                </View>
                <View style={styles.directionText}>
                  <Text style={styles.directionTitle}>주차</Text>
                  <Text style={styles.directionDetail}>
                    행사장 지하 주차장 이용 (3시간 무료)
                  </Text>
                </View>
              </View>
            </View>
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
  section: {
    padding: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 72,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary600,
    justifyContent: "center",
    alignItems: "center",
  },
  noticeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: 16,
    marginBottom: 12,
  },
  noticeCardImportant: {
    backgroundColor: COLORS.warning50,
    borderColor: COLORS.warning200,
  },
  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  noticeTitleImportant: {
    color: COLORS.warning600,
  },
  noticeDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noticeContent: {
    fontSize: 14,
    color: COLORS.textTertiary,
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray500,
    marginRight: 4,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginBottom: 12,
  },
  faqQuestionRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  questionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary600,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  faqAnswerContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    backgroundColor: COLORS.gray50,
  },
  answerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning600,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  answerText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  faqAnswer: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  mapCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  directionsContainer: {
    padding: 16,
  },
  directionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  directionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  directionText: {
    flex: 1,
  },
  directionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  directionDetail: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
  },
});
