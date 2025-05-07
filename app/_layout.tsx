import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { Redirect, Stack } from "expo-router";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { NotificationType } from "@/types/notification";

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data }: TaskManager.TaskManagerTaskBody<unknown>): Promise<void> => {
    if (!data) return;

    try {
      const payload = data as { data: Record<string, unknown> };

      if (payload.data.type === NotificationType.PAYMENT_REQUEST) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "결제 요청",
            body: "학번 결제 요청이 도착했습니다",
            data: payload.data,
          },
          trigger: null,
        });
      } else if (payload.data.type === NotificationType.ORDER_COMPLETED) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "주문 완료",
            body: "주문이 완료되었습니다",
            data: payload.data,
          },
          trigger: null,
        });
      } else if (payload.data.type === NotificationType.POINT_CHARGED) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "포인트 충전",
            body: "포인트가 충전되었습니다",
            data: payload.data,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error("백그라운드 알림 처리 실패:", error);
    }
  }
);

export default function RootLayout(): React.ReactNode {
  const { isAuthenticated } = useAuthStore();
  const { initialize, registerToken, listenForNotifications } =
    useNotificationStore();

  useEffect(() => {
    async function setupNotifications(): Promise<void> {
      await initialize();

      if (isAuthenticated) {
        await registerToken();
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      }
    }

    setupNotifications();

    const unsubscribe = listenForNotifications();

    return () => {
      unsubscribe();
      if (isAuthenticated) {
        Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(
          (error) => console.error("Failed to unregister task:", error)
        );
      }
    };
  }, [isAuthenticated, initialize, registerToken, listenForNotifications]);

  return (
    <>
      {isAuthenticated ? (
        <Redirect href="/(tabs)" />
      ) : (
        <Redirect href="/(auth)/login" />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="qr-scanner" options={{ presentation: "modal" }} />
        <Stack.Screen name="payment" options={{ presentation: "modal" }} />
        <Stack.Screen name="booth-map" />
        <Stack.Screen name="charge-point" />
        <Stack.Screen name="info-guide" />
      </Stack>
      <Toast />
    </>
  );
}
