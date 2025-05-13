import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { StatusBar } from "expo-status-bar";

export interface User {
  id: number;
  dodamId: string;
  grade?: number;
  room?: number;
  number?: number;
  name: string;
  profileImage: string;
  role: "STUDENT" | "TEACHER";
}

const BACKGROUND_COLOR = "#F5F6F8";

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!user && !isRedirecting) {
      setIsRedirecting(true);
      router.replace("/(auth)/login");
    }
  }, [user, isRedirecting]);

  const handleLogout = useCallback(async () => {
    setShowLogoutDialog(false);
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  }, [signOut]);

  const toggleLogoutDialog = useCallback((visible: boolean) => {
    setShowLogoutDialog(visible);
  }, []);

  const formatStudentInfo = useCallback(() => {
    if (!user) return null;
    if (user.grade && user.room && user.number) {
      return `${user.grade}학년 ${user.room}반 ${user.number}번`;
    }
    return null;
  }, [user]);

  const studentInfo = formatStudentInfo();

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary500} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBarFill} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>프로필</Text>
        </View>
      </SafeAreaView>

      <View style={styles.contentWrapper}>
        <View style={styles.bgExtender} />
        <View style={styles.contentContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.profileContainer}>
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={36} color={COLORS.gray400} />
                  </View>
                )}

                <View style={styles.profileInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.username}>{user.name}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>
                        {user.role === "TEACHER" ? "선생님" : "학생"}
                      </Text>
                    </View>
                  </View>
                  {studentInfo && (
                    <Text style={styles.studentInfo}>{studentInfo}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>지원</Text>
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push("/help")}
              >
                <Text style={styles.menuText}>도움말</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.gray500}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push("/service-info")}
              >
                <Text style={styles.menuText}>서비스 정보</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.gray500}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push("/inquiry")}
              >
                <Text style={styles.menuText}>문의하기</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.gray500}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => toggleLogoutDialog(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <Modal visible={showLogoutDialog} transparent={true} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => toggleLogoutDialog(false)}
        >
          <View style={styles.dialogContainer}>
            <Pressable
              style={{ width: "100%" }}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.dialog}>
                <Text style={styles.dialogTitle}>로그아웃</Text>
                <Text style={styles.dialogMessage}>
                  정말 로그아웃 하시겠습니까?
                </Text>

                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => toggleLogoutDialog(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.confirmButtonText}>로그아웃</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
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
  contentContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray200,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.text,
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.primary50,
    borderRadius: 4,
  },
  roleText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 11,
    color: COLORS.primary600,
  },
  studentInfo: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardTitle: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    color: COLORS.danger600,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialogContainer: {
    width: "80%",
    maxWidth: 320,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  dialogTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  dialogMessage: {
    fontFamily: "Pretendard-Medium",
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: COLORS.gray100,
  },
  cancelButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: COLORS.danger500,
  },
  confirmButtonText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
    color: COLORS.white,
  },
});
