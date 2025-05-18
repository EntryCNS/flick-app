import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { COLORS } from "@/constants/colors";
import { API_URL } from "@/constants/api";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const { saveTokens, getProfile, signOut } = useAuthStore();

  useEffect(() => {
    signOut();
  }, [signOut]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!id.trim() || !password || isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        id,
        password,
      });

      await saveTokens(response.data);
      await getProfile();
      router.replace("/(tabs)");
    } catch (err) {
      let errorMessage = "로그인에 실패했습니다";

      if (axios.isAxiosError(err) && err.response?.data) {
        const { code } = err.response.data;

        switch (code) {
          case "LOGIN_FAILED":
            errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다";
            break;
          case "TOKEN_EXCHANGE_FAILED":
            errorMessage = "인증 토큰 발급에 실패했습니다";
            break;
          case "USER_FETCH_FAILED":
            errorMessage = "사용자 정보를 가져오는데 실패했습니다";
            break;
          case "REFRESH_FAILED":
            errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요";
            break;
        }
      }

      Toast.show({
        type: "error",
        text1: errorMessage,
        position: Platform.OS === "ios" ? "top" : "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, password, isLoading, saveTokens, getProfile]);

  const handleIdSubmit = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const handleFocus = useCallback((input: string) => {
    setFocusedInput(input);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedInput("");
  }, []);

  const idInputStyle = useMemo(
    () => [styles.input, focusedInput === "id" && styles.inputFocused],
    [focusedInput]
  );

  const passwordInputStyle = useMemo(
    () => [
      styles.passwordInput,
      focusedInput === "password" && styles.inputFocused,
    ],
    [focusedInput]
  );

  const loginButtonStyle = useMemo(
    () => [
      styles.loginButton,
      (!id.trim() || !password) && styles.loginButtonDisabled,
    ],
    [id, password]
  );

  const eyeIconName = useMemo(
    () => (isPasswordVisible ? "eye-off-outline" : "eye-outline"),
    [isPasswordVisible]
  );

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.content}>
              <View style={styles.logoSection}>
                <Image
                  source={require("@/assets/images/logo.png")}
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
                    style={idInputStyle}
                    placeholder="아이디"
                    placeholderTextColor={COLORS.gray400}
                    value={id}
                    onChangeText={setId}
                    onFocus={() => handleFocus("id")}
                    onBlur={handleBlur}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={handleIdSubmit}
                    blurOnSubmit={false}
                    autoCorrect={false}
                    keyboardType="default"
                    textContentType="username"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={passwordRef}
                      style={passwordInputStyle}
                      placeholder="비밀번호"
                      placeholderTextColor={COLORS.gray400}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => handleFocus("password")}
                      onBlur={handleBlur}
                      secureTextEntry={!isPasswordVisible}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      textContentType="password"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.visibilityToggle}
                      onPress={togglePasswordVisibility}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={eyeIconName}
                        size={22}
                        color={COLORS.gray500}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.buttonSection}>
                <TouchableOpacity
                  style={loginButtonStyle}
                  onPress={handleLogin}
                  disabled={!id.trim() || !password || isLoading}
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
    flex: 1,
    backgroundColor: COLORS.white,
    zIndex: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
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
  passwordContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    height: 52,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
    borderRadius: 8,
  },
  visibilityToggle: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  inputFocused: {
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
