import React, { useRef, useState } from "react";
import { ScrollView, StatusBar, Animated, FlatList } from "react-native";
import styled from "@emotion/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function BoothMapScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchFocused, setSearchFocused] = useState(false);

  const categories = ["전체", "푸드", "굿즈", "게임", "체험", "포토존"];

  const boothLocations = [
    {
      id: "1",
      name: "가연's 페이스페인팅",
      category: "체험",
      location: "A구역 12번",
      description: "반짝이 페이스페인팅",
      isPopular: true,
      waitingTime: "15분",
      color: "#7F6BFF",
      bgColor: "#F4F2FF",
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
      color: "#FF571A",
      bgColor: "#FFF3E8",
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
      color: "#067A49",
      bgColor: "#F2F7F2",
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
      color: "#315DE7",
      bgColor: "#EEF2FF",
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
      color: "#FF2D55",
      bgColor: "#FFF0F3",
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
      color: "#FF9500",
      bgColor: "#FFF8ED",
      icon: "game-controller",
    },
  ];

  const filteredBooths =
    activeCategory === "전체"
      ? boothLocations
      : boothLocations.filter((booth) => booth.category === activeCategory);

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
          <HeaderTitle>부스맵</HeaderTitle>
          <IconButton>
            <Ionicons name="filter" size={20} color="#222222" />
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
        <SearchSection>
          <SearchBar focused={searchFocused}>
            <Ionicons name="search" size={18} color="#888888" />
            <SearchInput
              placeholder="부스 이름, 위치 검색"
              placeholderTextColor="#888888"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </SearchBar>
        </SearchSection>

        <MapSection>
          <MapTitle>축제 지도</MapTitle>
          <MapCard>
            <MapImage
              source={require("../assets/images/map-placeholder.png")}
            />
            <MapOverlay>
              <MapLegend>
                <LegendItem>
                  <LegendDot style={{ backgroundColor: "#FF571A" }} />
                  <LegendText>A구역</LegendText>
                </LegendItem>
                <LegendItem>
                  <LegendDot style={{ backgroundColor: "#067A49" }} />
                  <LegendText>B구역</LegendText>
                </LegendItem>
                <LegendItem>
                  <LegendDot style={{ backgroundColor: "#315DE7" }} />
                  <LegendText>C구역</LegendText>
                </LegendItem>
                <LegendItem>
                  <LegendDot style={{ backgroundColor: "#7F6BFF" }} />
                  <LegendText>D구역</LegendText>
                </LegendItem>
              </MapLegend>
              <ZoomArea>
                <ZoomButton>
                  <Ionicons name="add" size={20} color="#222222" />
                </ZoomButton>
                <ZoomButton>
                  <Ionicons name="remove" size={20} color="#222222" />
                </ZoomButton>
              </ZoomArea>
            </MapOverlay>
          </MapCard>
        </MapSection>

        <CategoriesSection>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <CategoryButton
                active={activeCategory === item}
                onPress={() => setActiveCategory(item)}
              >
                <CategoryText active={activeCategory === item}>
                  {item}
                </CategoryText>
              </CategoryButton>
            )}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </CategoriesSection>

        <BoothsSection>
          <SectionHeader>
            <SectionTitle>부스 목록</SectionTitle>
            <TotalCount>{filteredBooths.length}개의 부스</TotalCount>
          </SectionHeader>

          {filteredBooths.map((booth) => (
            <BoothCard key={booth.id}>
              <BoothIconContainer style={{ backgroundColor: booth.bgColor }}>
                <Ionicons
                  name={booth.icon as any}
                  size={24}
                  color={booth.color}
                />
              </BoothIconContainer>
              <BoothContent>
                <BoothHeader>
                  <BoothName>{booth.name}</BoothName>
                  {booth.isPopular && <PopularTag>인기</PopularTag>}
                </BoothHeader>
                <BoothLocation>
                  <Ionicons name="location" size={14} color="#888888" />
                  <LocationText>{booth.location}</LocationText>
                </BoothLocation>
                <BoothDescription>{booth.description}</BoothDescription>
              </BoothContent>
              <BoothRightContent>
                <WaitingTimeContainer>
                  <Ionicons name="time-outline" size={14} color="#888888" />
                  <WaitingTimeText>{booth.waitingTime}</WaitingTimeText>
                </WaitingTimeContainer>
                <NavigateButton>
                  <Ionicons name="navigate" size={18} color="#315DE7" />
                </NavigateButton>
              </BoothRightContent>
            </BoothCard>
          ))}
        </BoothsSection>
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

const SearchSection = styled.View`
  padding: 12px 20px;
  background-color: #ffffff;
`;

interface SearchBarProps {
  focused: boolean;
}

const SearchBar = styled.View<SearchBarProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => (props.focused ? "#F2F2F7" : "#F2F2F7")};
  border-radius: 10px;
  padding: 0 12px;
  height: 44px;
  border-width: ${(props) => (props.focused ? "1px" : "0px")};
  border-color: #315de7;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 8px;
  font-size: 15px;
  color: #222222;
`;

const MapSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-top: 12px;
`;

const MapTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 16px;
`;

const MapCard = styled.View`
  width: 100%;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
`;

const MapImage = styled.Image`
  width: 100%;
  height: 100%;
  background-color: #f5f5f7;
`;

const MapOverlay = styled.View`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  flex-direction: row;
  justify-content: space-between;
`;

const MapLegend = styled.View`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 10px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const LegendDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  margin-right: 6px;
`;

const LegendText = styled.Text`
  font-size: 12px;
  color: #555555;
`;

const ZoomArea = styled.View`
  align-items: center;
`;

const ZoomButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const CategoriesSection = styled.View`
  padding-vertical: 16px;
  background-color: #ffffff;
  margin-top: 12px;
`;

interface CategoryProps {
  active: boolean;
}

const CategoryButton = styled.TouchableOpacity<CategoryProps>`
  padding: 8px 16px;
  background-color: ${(props) => (props.active ? "#315DE7" : "#F2F2F7")};
  border-radius: 20px;
  margin-right: 10px;
`;

const CategoryText = styled.Text<CategoryProps>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.active ? "#FFFFFF" : "#666666")};
`;

const BoothsSection = styled.View`
  padding: 24px 20px;
  background-color: #ffffff;
  margin-top: 12px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
`;

const TotalCount = styled.Text`
  font-size: 14px;
  color: #888888;
`;

const BoothCard = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #ffffff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #f2f2f7;
`;

const BoothIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
`;

const BoothContent = styled.View`
  flex: 1;
  margin-left: 16px;
`;

const BoothHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const BoothName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin-right: 8px;
`;

const PopularTag = styled.Text`
  font-size: 10px;
  font-weight: 500;
  color: #ff571a;
  background-color: #fff3e8;
  padding: 2px 6px;
  border-radius: 4px;
`;

const BoothLocation = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const LocationText = styled.Text`
  font-size: 13px;
  color: #888888;
  margin-left: 4px;
`;

const BoothDescription = styled.Text`
  font-size: 14px;
  color: #444444;
`;

const BoothRightContent = styled.View`
  align-items: flex-end;
  justify-content: space-between;
`;

const WaitingTimeContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const WaitingTimeText = styled.Text`
  font-size: 13px;
  color: #888888;
  margin-left: 4px;
`;

const NavigateButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #eef2ff;
  justify-content: center;
  align-items: center;
`;
