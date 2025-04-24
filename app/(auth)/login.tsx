import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  StatusBar,
  View,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import styled from "@emotion/native";
import { useTheme } from "@emotion/react";
import { api } from "@/lib/axios";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const loginSchema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { setTokens, fetchUserProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 애니메이션 값
  const idLabelAnim = useRef(new Animated.Value(0)).current;
  const passwordLabelAnim = useRef(new Animated.Value(0)).current;
  const buttonPositionAnim = useRef(new Animated.Value(0)).current;

  const idInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { control, handleSubmit, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const idValue = watch("id");
  const passwordValue = watch("password");
  const isFormValid = idValue.length > 0 && passwordValue.length > 0;

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(buttonPositionAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(buttonPositionAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // 레이블 애니메이션
  useEffect(() => {
    Animated.timing(idLabelAnim, {
      toValue: focusedField === "id" || idValue.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusedField, idValue]);

  useEffect(() => {
    Animated.timing(passwordLabelAnim, {
      toValue: focusedField === "password" || passwordValue.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusedField, passwordValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", data);
      const { accessToken, refreshToken } = response.data;

      await setTokens({ accessToken, refreshToken });
      await fetchUserProfile();

      router.replace("/(tabs)");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        } else {
          setError("로그인 중 오류가 발생했습니다.");
        }
      } else {
        setError("네트워크 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 버튼에 적용할 패딩값 계산
  const buttonPaddingBottom = buttonPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24 + insets.bottom, 16],
  });

  return (
    <SafeArea>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 20}
          >
            <StatusBar barStyle="dark-content" />

            <Header>
              <BackButton onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </BackButton>
            </Header>

            <Content>
              <Title>어떤 계정으로{"\n"}로그인할까요?</Title>

              <InputGroup>
                <Controller
                  control={control}
                  name="id"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error: fieldError },
                  }) => (
                    <InputField>
                      <InputWrapper>
                        <AnimatedLabel
                          style={{
                            opacity: idLabelAnim,
                            transform: [
                              {
                                translateY: idLabelAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [10, 0],
                                }),
                              },
                            ],
                          }}
                          isFocused={focusedField === "id"}
                        >
                          아이디
                        </AnimatedLabel>
                        <InputControl>
                          <StyledInput
                            value={value}
                            onChangeText={onChange}
                            onFocus={() => setFocusedField("id")}
                            onBlur={() => {
                              onBlur();
                              setFocusedField(null);
                            }}
                            placeholder={
                              focusedField === "id" || value
                                ? ""
                                : "아이디 입력"
                            }
                            placeholderTextColor={theme.colors.text.tertiary}
                            ref={idInputRef}
                            returnKeyType="next"
                            onSubmitEditing={() =>
                              passwordInputRef.current?.focus()
                            }
                          />
                        </InputControl>
                      </InputWrapper>
                      <AnimatedBorder
                        style={{
                          backgroundColor: idLabelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              theme.colors.border.light,
                              theme.colors.primary[500],
                            ],
                          }),
                        }}
                      />
                      {fieldError && (
                        <ErrorText>{fieldError.message}</ErrorText>
                      )}
                    </InputField>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error: fieldError },
                  }) => (
                    <InputField>
                      <InputWrapper>
                        <AnimatedLabel
                          style={{
                            opacity: passwordLabelAnim,
                            transform: [
                              {
                                translateY: passwordLabelAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [10, 0],
                                }),
                              },
                            ],
                          }}
                          isFocused={focusedField === "password"}
                        >
                          비밀번호
                        </AnimatedLabel>
                        <InputControl>
                          <StyledInput
                            value={value}
                            onChangeText={onChange}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => {
                              onBlur();
                              setFocusedField(null);
                            }}
                            placeholder={
                              focusedField === "password" || value
                                ? ""
                                : "비밀번호 입력"
                            }
                            placeholderTextColor={theme.colors.text.tertiary}
                            secureTextEntry
                            ref={passwordInputRef}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit(onSubmit)}
                          />
                        </InputControl>
                      </InputWrapper>
                      <AnimatedBorder
                        style={{
                          backgroundColor: passwordLabelAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              theme.colors.border.light,
                              theme.colors.primary[500],
                            ],
                          }),
                        }}
                      />
                      {fieldError && (
                        <ErrorText>{fieldError.message}</ErrorText>
                      )}
                    </InputField>
                  )}
                />
              </InputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
            </Content>

            <AnimatedButtonContainer
              style={{
                paddingBottom: buttonPaddingBottom,
              }}
            >
              <AnimatedButton
                onPress={handleSubmit(onSubmit)}
                disabled={!isFormValid || isLoading}
                isValid={isFormValid}
                style={{
                  transform: [
                    {
                      translateY: buttonPositionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <ButtonText>확인</ButtonText>
                )}
              </AnimatedButton>
            </AnimatedButtonContainer>
          </KeyboardAvoidingView>
        </Container>
      </TouchableWithoutFeedback>
    </SafeArea>
  );
}

const SafeArea = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const Header = styled.View`
  padding: 16px 16px 0;
  flex-direction: row;
  align-items: center;
`;

const BackButton = styled.TouchableOpacity`
  padding: 8px;
  margin-left: -8px;
`;

const Content = styled.View`
  flex: 1;
  padding: 16px 24px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 16px;
  margin-bottom: 48px;
  line-height: 34px;
`;

const InputGroup = styled.View`
  margin-bottom: 16px;
`;

const InputField = styled.View`
  margin-bottom: 36px;
`;

const InputWrapper = styled.View`
  min-height: 58px;
  position: relative;
  justify-content: flex-end;
`;

const InputControl = styled.View`
  height: 34px;
  justify-content: center;
`;

interface FocusProps {
  isFocused: boolean;
}

const InputLabel = styled.Text<FocusProps>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ isFocused, theme }) =>
    isFocused ? theme.colors.primary[500] : theme.colors.text.tertiary};
  margin-bottom: 6px;
`;

const AnimatedLabel = Animated.createAnimatedComponent(InputLabel);

const StyledInput = styled.TextInput`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0;
`;

const InputBorder = styled.View<FocusProps>`
  height: 1px;
  width: 100%;
  background-color: ${({ isFocused, theme }) =>
    isFocused ? theme.colors.primary[500] : theme.colors.border.light};
`;

const AnimatedBorder = Animated.createAnimatedComponent(styled.View`
  height: 1px;
  width: 100%;
`);

const ErrorText = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.semantic.error};
  margin-top: 8px;
`;

const ErrorMessage = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.semantic.error};
  text-align: center;
  margin-top: 8px;
`;

const ButtonContainer = styled.View`
  padding: 16px 24px;
`;

const AnimatedButtonContainer = Animated.createAnimatedComponent(styled.View`
  padding: 16px 24px;
  padding-top: 8px;
`);

interface ButtonProps {
  isValid: boolean;
}

const SubmitButton = styled.TouchableOpacity<ButtonProps>`
  width: 100%;
  height: 52px;
  border-radius: 8px;
  background-color: ${({ isValid, theme }) =>
    isValid ? theme.colors.primary[500] : theme.colors.gray[200]};
  justify-content: center;
  align-items: center;
`;

const AnimatedButton = Animated.createAnimatedComponent(SubmitButton);

const ButtonText = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.inverse};
`;
