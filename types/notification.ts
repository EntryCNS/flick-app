export enum NotificationType {
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  ORDER_COMPLETED = "ORDER_COMPLETED",
  POINT_CHARGED = "POINT_CHARGED",
  SYSTEM = "SYSTEM",
}

export interface BaseNotificationPayload {
  type: NotificationType;
  [key: string]: unknown;
}

export interface PaymentRequestPayload extends BaseNotificationPayload {
  type: NotificationType.PAYMENT_REQUEST;
  orderId: number;
  token: string;
}

export interface OrderCompletedPayload extends BaseNotificationPayload {
  type: NotificationType.ORDER_COMPLETED;
  orderId: number;
}

export interface PointChargedPayload extends BaseNotificationPayload {
  type: NotificationType.POINT_CHARGED;
  amount: number;
  balanceAfter: number;
}

export interface SystemNotificationPayload extends BaseNotificationPayload {
  type: NotificationType.SYSTEM;
  message: string;
}

export type NotificationPayload =
  | PaymentRequestPayload
  | OrderCompletedPayload
  | PointChargedPayload
  | SystemNotificationPayload;
