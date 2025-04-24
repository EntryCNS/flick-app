import React, { useRef, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
  Linking,
} from "react-native";
import styled from "@emotion/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function InfoGuideScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
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

  const noticeData = [
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

  const toggleFaq = (id) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  const contactPhoneNumber = "010-1234-5678";
  const emergencyNumber = "010-9876-5432";

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <Container style={{ paddingTop: insets.top }}>
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
          shadowColor: "#000000",
          backgroundColor: "white",
        }}
      >
        <Header>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#222222" />
          </BackButton>
          <HeaderTitle>안내</HeaderTitle>
          <IconButton>
            <Ionicons name="bookmark-outline" size={22} color="#222222" />
          </IconButton>
        </Header>
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
        <InfoSection>
          <SectionTitle>행사 정보</SectionTitle>

          <InfoCard>
            <InfoItem>
              <InfoIconContainer style={{ backgroundColor: "#EEF2FF" }}>
                <Ionicons name="calendar" size={20} color="#315DE7" />
              </InfoIconContainer>
              <InfoContent>
                <InfoLabel>행사 기간</InfoLabel>
                <InfoText>2025.04.20 ~ 2025.04.26</InfoText>
              </InfoContent>
            </InfoItem>

            <Separator />

            <InfoItem>
              <InfoIconContainer style={{ backgroundColor: "#F2F7F2" }}>
                <Ionicons name="time" size={20} color="#067A49" />
              </InfoIconContainer>
              <InfoContent>
                <InfoLabel>운영 시간</InfoLabel>
                <InfoText>10:00 ~ 20:00</InfoText>
              </InfoContent>
            </InfoItem>

            <Separator />

            <InfoItem>
              <InfoIconContainer style={{ backgroundColor: "#FFF3E8" }}>
                <Ionicons name="location" size={20} color="#FF571A" />
              </InfoIconContainer>
              <InfoContent>
                <InfoLabel>행사 장소</InfoLabel>
                <InfoText>서울시 강남구 영동대로 513</InfoText>
              </InfoContent>
            </InfoItem>

            <Separator />

            <InfoItem>
              <InfoIconContainer style={{ backgroundColor: "#F4F2FF" }}>
                <Ionicons name="people" size={20} color="#7F6BFF" />
              </InfoIconContainer>
              <InfoContent>
                <InfoLabel>주최/주관</InfoLabel>
                <InfoText>플릭 페스티벌 운영 위원회</InfoText>
              </InfoContent>
            </InfoItem>
          </InfoCard>
        </InfoSection>

        <ContactSection>
          <SectionTitle>연락처</SectionTitle>

          <ContactCard>
            <ContactItem onPress={() => handlePhoneCall(contactPhoneNumber)}>
              <ContactIconContainer style={{ backgroundColor: "#FFF3E8" }}>
                <Ionicons name="call" size={20} color="#FF571A" />
              </ContactIconContainer>
              <ContactInfo>
                <ContactLabel>안내 센터</ContactLabel>
                <ContactText>{contactPhoneNumber}</ContactText>
              </ContactInfo>
              <CallButton>
                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
              </CallButton>
            </ContactItem>

            <Separator />

            <ContactItem onPress={() => handlePhoneCall(emergencyNumber)}>
              <ContactIconContainer style={{ backgroundColor: "#FFF0F3" }}>
                <Ionicons name="medkit" size={20} color="#FF2D55" />
              </ContactIconContainer>
              <ContactInfo>
                <ContactLabel>응급 상황</ContactLabel>
                <ContactText>{emergencyNumber}</ContactText>
              </ContactInfo>
              <CallButton style={{ backgroundColor: "#FF2D55" }}>
                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
              </CallButton>
            </ContactItem>
          </ContactCard>
        </ContactSection>

        <NoticeSection>
          <SectionTitle>공지사항</SectionTitle>

          {noticeData.map((notice) => (
            <NoticeCard key={notice.id} important={notice.isImportant}>
              <NoticeHeader>
                <NoticeTitle important={notice.isImportant}>
                  {notice.title}
                </NoticeTitle>
                <NoticeDate>{notice.date}</NoticeDate>
              </NoticeHeader>
              <NoticeContent>{notice.content}</NoticeContent>
            </NoticeCard>
          ))}

          <ViewAllButton>
            <ViewAllText>전체 공지사항 보기</ViewAllText>
            <Ionicons name="chevron-forward" size={16} color="#666666" />
          </ViewAllButton>
        </NoticeSection>

        <FaqSection>
          <SectionTitle>자주 묻는 질문</SectionTitle>

          {faqData.map((faq) => (
            <FaqCard key={faq.id}>
              <FaqQuestionRow onPress={() => toggleFaq(faq.id)}>
                <QuestionIcon>
                  <QuestionText>Q</QuestionText>
                </QuestionIcon>
                <FaqQuestion>{faq.question}</FaqQuestion>
                <Ionicons
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#888888"
                />
              </FaqQuestionRow>

              {expandedFaq === faq.id && (
                <FaqAnswerContainer>
                  <AnswerIcon>
                    <AnswerText>A</AnswerText>
                  </AnswerIcon>
                  <FaqAnswer>{faq.answer}</FaqAnswer>
                </FaqAnswerContainer>
              )}
            </FaqCard>
          ))}

          <ViewAllButton>
            <ViewAllText>전체 FAQ 보기</ViewAllText>
            <Ionicons name="chevron-forward" size={16} color="#666666" />
          </ViewAllButton>
        </FaqSection>

        <MapSection>
          <SectionTitle>찾아오시는 길</SectionTitle>

          <MapCard>
            <MapPlaceholder>
              <Ionicons name="map" size={32} color="#888888" />
              <MapPlaceholderText>지도 영역</MapPlaceholderText>
            </MapPlaceholder>

            <DirectionsContainer>
              <DirectionItem>
                <DirectionIconContainer style={{ backgroundColor: "#EEF2FF" }}>
                  <Ionicons name="subway" size={18} color="#315DE7" />
                </DirectionIconContainer>
                <DirectionText>
                  <DirectionTitle>지하철</DirectionTitle>
                  <DirectionDetail>
                    2호선 강남역 4번 출구에서 도보 5분
                  </DirectionDetail>
                </DirectionText>
              </DirectionItem>

              <DirectionItem>
                <DirectionIconContainer style={{ backgroundColor: "#F2F7F2" }}>
                  <Ionicons name="bus" size={18} color="#067A49" />
                </DirectionIconContainer>
                <DirectionText>
                  <DirectionTitle>버스</DirectionTitle>
                  <DirectionDetail>
                    간선: 145, 341, 472 / 지선: 4312
                  </DirectionDetail>
                </DirectionText>
              </DirectionItem>

              <DirectionItem>
                <DirectionIconContainer style={{ backgroundColor: "#FFF3E8" }}>
                  <Ionicons name="car" size={18} color="#FF571A" />
                </DirectionIconContainer>
                <DirectionText>
                  <DirectionTitle>주차</DirectionTitle>
                  <DirectionDetail>
                    행사장 지하 주차장 이용 (3시간 무료)
                  </DirectionDetail>
                </DirectionText>
              </DirectionItem>
            </DirectionsContainer>
          </MapCard>
        </MapSection>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #fcfcfc;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #ffffff;
`;

const BackButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  justify-content: center;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
`;

const IconButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  justify-content: center;
  align-items: center;
`;

const InfoSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const ContactSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const NoticeSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const FaqSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const MapSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #222222;
  letter-spacing: -0.3px;
  margin-bottom: 16px;
`;

const InfoCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
  padding: 8px 0;
`;

const InfoItem = styled.View`
  flex-direction: row;
  padding: 12px 16px;
  align-items: center;
`;

const InfoIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const InfoContent = styled.View`
  margin-left: 16px;
`;

const InfoLabel = styled.Text`
  font-size: 14px;
  color: #888888;
  margin-bottom: 4px;
`;

const InfoText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #222222;
`;

const Separator = styled.View`
  height: 1px;
  background-color: #f5f5f5;
  margin-left: 72px;
`;

const ContactCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
  padding: 8px 0;
`;

const ContactItem = styled.TouchableOpacity`
  flex-direction: row;
  padding: 12px 16px;
  align-items: center;
`;

const ContactIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const ContactInfo = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const ContactLabel = styled.Text`
  font-size: 14px;
  color: #888888;
  margin-bottom: 4px;
`;

const ContactText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #222222;
`;

const CallButton = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #315de7;
  justify-content: center;
  align-items: center;
`;

interface NoticeProps {
  important?: boolean;
}

const NoticeCard = styled.View<NoticeProps>`
  background-color: ${(props) => (props.important ? "#FFF8ED" : "#FFFFFF")};
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${(props) => (props.important ? "#FFE4C4" : "#F2F2F7")};
  padding: 16px;
  margin-bottom: 12px;
`;

const NoticeHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const NoticeTitle = styled.Text<NoticeProps>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => (props.important ? "#FF9500" : "#222222")};
`;

const NoticeDate = styled.Text`
  font-size: 12px;
  color: #888888;
`;

const NoticeContent = styled.Text`
  font-size: 14px;
  color: #444444;
  line-height: 20px;
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px;
  margin-top: 8px;
`;

const ViewAllText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  margin-right: 4px;
`;

const FaqCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
  margin-bottom: 12px;
`;

const FaqQuestionRow = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px;
  align-items: center;
`;

const QuestionIcon = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #315de7;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const QuestionText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const FaqQuestion = styled.Text`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #222222;
`;

const FaqAnswerContainer = styled.View`
  flex-direction: row;
  padding: 16px;
  padding-top: 0;
  background-color: #f9f9f9;
`;

const AnswerIcon = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #ff571a;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const AnswerText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const FaqAnswer = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #444444;
  line-height: 20px;
`;

const MapCard = styled.View`
  background-color: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f2f2f7;
`;

const MapPlaceholder = styled.View`
  height: 180px;
  background-color: #f5f5f7;
  justify-content: center;
  align-items: center;
`;

const MapPlaceholderText = styled.Text`
  font-size: 14px;
  color: #888888;
  margin-top: 8px;
`;

const DirectionsContainer = styled.View`
  padding: 16px;
`;

const DirectionItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const DirectionIconContainer = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const DirectionText = styled.View`
  flex: 1;
`;

const DirectionTitle = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 4px;
`;

const DirectionDetail = styled.Text`
  font-size: 14px;
  color: #666666;
  line-height: 20px;
`;
