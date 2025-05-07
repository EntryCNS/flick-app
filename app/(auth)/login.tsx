import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { COLORS } from "@/constants/colors";
import { API_URL } from "@/constants/api";

export default function LoginScreen(): React.ReactElement {
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<string>("");

  const passwordRef = useRef<TextInput>(null);
  const { setTokens, fetchUserProfile } = useAuthStore();

  const handleLogin = async (): Promise<void> => {
    if (!id || !password || isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        id,
        password,
      });
      await setTokens(response.data);
      await fetchUserProfile();
      router.replace("/(tabs)");
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.status === 401
          ? "아이디 또는 비밀번호가 올바르지 않습니다"
          : "로그인에 실패했습니다";

      Toast.show({
        type: "error",
        text1: errorMessage,
      });

      console.error(JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.logoSection}>
              <Image
                source={require("@/assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>로그인</Text>
              <Text style={styles.subtitle}>
                <Text style={styles.dodamText}>도담도담</Text> 계정 정보를
                입력해주세요
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === "id" && styles.inputFocused,
                  ]}
                  placeholder="아이디"
                  placeholderTextColor={COLORS.gray400}
                  value={id}
                  onChangeText={setId}
                  onFocus={() => setFocusedInput("id")}
                  onBlur={() => setFocusedInput("")}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.input,
                    focusedInput === "password" && styles.inputFocused,
                  ]}
                  placeholder="비밀번호"
                  placeholderTextColor={COLORS.gray400}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput("")}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!id || !password) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!id || !password || isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>로그인</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  dodamText: {
    color: COLORS.primary600,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 30,
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
  },
  inputFocused: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.primary600,
  },
  buttonSection: {
    marginBottom: Platform.OS === "ios" ? 16 : 24,
    width: "100%",
  },
  loginButton: {
    height: 52,
    backgroundColor: COLORS.primary600,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
