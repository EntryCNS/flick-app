import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";

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
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary500} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          // onPress={() => router.push("/settings")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          // onPress={() => router.push("/profile-edit")}
        >
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
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>계정 관리</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            // onPress={() => router.push("/account-info")}
          >
            <Text style={styles.menuText}>계정 정보</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            // onPress={() => router.push("/notification-settings")}
          >
            <Text style={styles.menuText}>알림 설정</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>지원</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            // onPress={() => router.push("/help")}
          >
            <Text style={styles.menuText}>도움말</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            // onPress={() => router.push("/about")}
          >
            <Text style={styles.menuText}>서비스 정보</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.gray500} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  settingsButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
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
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary600,
  },
  studentInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  dialogMessage: {
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
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
});
