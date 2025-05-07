import { create } from "zustand";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "@/libs/api";
import { router } from "expo-router";
import { NotificationType } from "@/types/notification";

interface NotificationState {
  expoPushToken: string | null;
  isInitialized: boolean;
}

interface NotificationActions {
  initialize: () => Promise<void>;
  registerToken: () => Promise<void>;
  unregisterToken: () => Promise<void>;
  listenForNotifications: () => () => void;
}

export const useNotificationStore = create<
  NotificationState & NotificationActions
>((set, get) => ({
  expoPushToken: null,
  isInitialized: false,

  initialize: async (): Promise<void> => {
    if (!Device.isDevice || get().isInitialized) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "기본",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });

      await Notifications.setNotificationChannelAsync("payments", {
        name: "결제 알림",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4D96FF",
      });

      await Notifications.setNotificationChannelAsync("orders", {
        name: "주문 알림",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4CAF50",
      });

      await Notifications.setNotificationChannelAsync("points", {
        name: "포인트 알림",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFC107",
      });
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      set({ expoPushToken: token, isInitialized: true });
    } catch (error) {
      console.error("푸시 토큰 가져오기 실패", error);
    }
  },

  registerToken: async (): Promise<void> => {
    const token = get().expoPushToken;
    if (!token) return;

    try {
      await api.post("/users/me/push-token", {
        token,
      });
    } catch (error) {
      console.error("푸시 토큰 등록 실패", error);
    }
  },

  unregisterToken: async (): Promise<void> => {
    const token = get().expoPushToken;
    if (!token) return;

    try {
      await api.delete("/users/me/push-token");
      set({ expoPushToken: null });
    } catch (error) {
      console.error("푸시 토큰 등록 해제 실패", error);
    }
  },

  listenForNotifications: (): (() => void) => {
    const notificationReceivedListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data;
      });

    const responseReceivedListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const data = response.notification.request.content.data;
          const type = data.type as NotificationType;

          switch (type) {
            case NotificationType.PAYMENT_REQUEST:
              if (data.token) {
                router.navigate({
                  pathname: "/payment",
                  params: { token: data.token as string },
                });
              }
              break;

            case NotificationType.ORDER_COMPLETED:
              router.navigate("/(tabs)");
              break;

            case NotificationType.POINT_CHARGED:
              router.navigate("/charge-point");
              break;

            default:
              break;
          }
        } catch (error) {
          console.error("알림 응답 처리 실패", error);
        }
      });

    return (): void => {
      notificationReceivedListener.remove();
      responseReceivedListener.remove();
    };
  },
}));
