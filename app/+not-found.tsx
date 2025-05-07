import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link, Stack } from "expo-router";
import { COLORS } from "@/constants/colors";

export default function NotFoundScreen(): React.ReactElement {
  return (
    <>
      <Stack.Screen options={{ title: "찾을 수 없음" }} />
      <View style={styles.container}>
        <Text style={styles.title}>페이지를 찾을 수 없습니다.</Text>
        <Link href="/" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>홈으로 돌아가기</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontFamily: "PretendardBold",
    color: COLORS.text,
  },
  link: {
    marginTop: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Pretendard",
    color: COLORS.primary600,
  },
});
