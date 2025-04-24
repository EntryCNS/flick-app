import { Link, Stack } from "expo-router";
import styled from "@emotion/native";
import { useTheme } from "@emotion/react";

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "찾을 수 없음" }} />
      <Container>
        <Title>페이지를 찾을 수 없습니다.</Title>
        <StyledLink href="/">
          <LinkText>홈으로 돌아가기</LinkText>
        </StyledLink>
      </Container>
    </>
  );
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: ${(props) => props.theme.colors.background.default};
`;

const Title = styled.Text`
  font-size: 20px;
  font-family: PretendardBold;
  color: ${(props) => props.theme.colors.text.primary};
`;

const StyledLink = styled(Link)`
  margin-top: 15px;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const LinkText = styled.Text`
  font-size: 14px;
  font-family: Pretendard;
  color: ${(props) => props.theme.colors.primary[500]};
`;
