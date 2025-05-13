import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";
import api from "@/libs/api";

const BACKGROUND_COLOR = "#F5F6F8";

const CATEGORIES = [
  { id: "ACCOUNT", label: "계정 문의" },
  { id: "PAYMENT", label: "결제 문의" },
  { id: "SYSTEM", label: "시스템 오류" },
  { id: "OTHER", label: "기타 문의" },
];

export default function InquiryScreen() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(
    () =>
      category !== "" && title.trim().length > 0 && content.trim().length > 10,
    [category, title, content]
  );

  const submitButtonStyle = useMemo(
    () => [styles.submitButton, !isFormValid && styles.submitButtonDisabled],
    [isFormValid]
  );

  const handleCategorySelect = useCallback((selectedCategory: string) => {
    setCategory(selectedCategory);
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await api.post("/inquiries", {
        category,
        title,
        content,
      });

      Alert.alert(
        "문의가 접수되었습니다",
        "빠른 시일 내에 답변 드리겠습니다.",
        [{ text: "확인", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        "문의 접수 실패",
        "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [category, title, content, isFormValid, isSubmitting]);

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
          <Text style={styles.headerTitle}>문의하기</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.bgExtender} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={styles.formContainer}>
                <View style={styles.card}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>문의 유형</Text>
                    <View style={styles.categoryContainer}>
                      {CATEGORIES.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.categoryButton,
                            category === item.id && styles.categoryButtonActive,
                          ]}
                          onPress={() => handleCategorySelect(item.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              category === item.id && styles.categoryTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>문의 제목</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="문의 제목을 입력해주세요"
                      placeholderTextColor={COLORS.gray400}
                      value={title}
                      onChangeText={setTitle}
                      maxLength={50}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>문의 내용</Text>
                    <TextInput
                      style={styles.textArea}
                      placeholder="문의 내용을 자세히 입력해주세요 (10자 이상)"
                      placeholderTextColor={COLORS.gray400}
                      value={content}
                      onChangeText={setContent}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    <Text style={styles.charCount}>
                      {content.length} / 500자
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={submitButtonStyle}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>문의 접수하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex1: {
    flex: 1,
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
    paddingBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary600,
  },
  categoryText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    fontFamily: "Pretendard-Medium",
    color: COLORS.white,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    fontFamily: "Pretendard-Medium",
    color: COLORS.text,
  },
  charCount: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: COLORS.textSecondary,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  submitButton: {
    height: 50,
    backgroundColor: COLORS.primary600,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonText: {
    fontFamily: "Pretendard-SemiBold",
    color: COLORS.white,
    fontSize: 16,
  },
});
