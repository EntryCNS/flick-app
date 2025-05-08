import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { Redirect, Stack } from "expo-router";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as Device from "expo-device";
import { Platform, View, ActivityIndicator, StatusBar } from "react-native";
import { NotificationType } from "@/types/notification";
import { COLORS } from "@/constants/colors";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

if (!TaskManager.isTaskDefined(BACKGROUND_NOTIFICATION_TASK)) {
  TaskManager.defineTask(
    BACKGROUND_NOTIFICATION_TASK,
    async ({
      data,
    }: TaskManager.TaskManagerTaskBody<unknown>): Promise<void> => {
      if (!data) return;

      try {
        const payload = data as { data: Record<string, unknown> };
        const notifContent: {
          title: string;
          body: string;
          data: Record<string, unknown>;
        } = {
          title: "",
          body: "",
          data: payload.data,
        };

        switch (payload.data.type) {
          case NotificationType.PAYMENT_REQUEST:
            notifContent.title = "결제 요청";
            notifContent.body = "학번 결제 요청이 도착했습니다";
            break;
          case NotificationType.ORDER_COMPLETED:
            notifContent.title = "주문 완료";
            notifContent.body = "주문이 완료되었습니다";
            break;
          case NotificationType.POINT_CHARGED:
            notifContent.title = "포인트 충전";
            notifContent.body = "포인트가 충전되었습니다";
            break;
        }

        if (notifContent.title) {
          await Notifications.scheduleNotificationAsync({
            content: notifContent,
            trigger: null,
          });
        }
      } catch (error) {
        console.error("알림 처리 실패:", error);
      }
    }
  );
}

Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: Platform.OS === "ios",
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

export default function RootLayout() {
  const { isLoggedIn, checkAuth, getProfile } = useAuthStore();
  const { initialize, registerToken, listenForNotifications } =
    useNotificationStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkNotificationsPermission =
    useCallback(async (): Promise<boolean> => {
      if (Platform.OS !== "ios") return true;

      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          return status === "granted";
        }

        return true;
      } catch (error) {
        console.log("알림 권한 확인 실패:", error);
        return false;
      }
    }, []);

  const registerBackgroundTask = useCallback(async (): Promise<void> => {
    if (!Device.isDevice) return;

    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_NOTIFICATION_TASK
      );

      if (!isRegistered) {
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      }
    } catch (error) {
      console.log("백그라운드 작업 등록 실패:", error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(COLORS.white);
      StatusBar.setBarStyle("dark-content");
      StatusBar.setTranslucent(false);
    }
  }, []);

  useEffect(() => {
    const setup = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const authExists = await checkAuth();
        await initialize();

        if (authExists) {
          await getProfile();
          const hasPermission = await checkNotificationsPermission();

          if (hasPermission) {
            await registerToken();
            await registerBackgroundTask();
          }
        }
      } catch (error) {
        console.error("초기화 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, [
    checkAuth,
    getProfile,
    initialize,
    registerToken,
    checkNotificationsPermission,
    registerBackgroundTask,
  ]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let unsubscribe: (() => void) | undefined;

    const setupNotificationListener = async (): Promise<void> => {
      try {
        unsubscribe = listenForNotifications();
      } catch (error) {
        console.log("알림 리스너 설정 실패:", error);
      }
    };

    setupNotificationListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isLoggedIn, listenForNotifications]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary500} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={COLORS.white}
        barStyle="dark-content"
        translucent={false}
      />
      {isLoggedIn ? (
        <Redirect href="/(tabs)" />
      ) : (
        <Redirect href="/(auth)/login" />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: COLORS.white },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            gestureEnabled: false,
            navigationBarColor: COLORS.white,
            statusBarBackgroundColor: COLORS.white,
          }}
        />
        <Stack.Screen
          name="qr-scanner"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            navigationBarColor: COLORS.white,
          }}
        />
        <Stack.Screen
          name="payment"
          options={{
            presentation: "modal",
            gestureEnabled: false,
            navigationBarColor: COLORS.white,
          }}
        />
        <Stack.Screen
          name="transactions"
          options={{ navigationBarColor: COLORS.white }}
        />
        <Stack.Screen
          name="notifications"
          options={{ navigationBarColor: COLORS.white }}
        />
      </Stack>
      <Toast />
    </>
  );
}
