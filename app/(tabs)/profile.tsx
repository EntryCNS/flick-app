import { router } from "expo-router";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Button onPress={() => router.push("/login")} title="로그인" />
    </SafeAreaView>
  );
}
