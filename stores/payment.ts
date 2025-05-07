import { create } from 'zustand';

export interface PaymentRequestResponse {
  id: number;
  orderId: number;
  method: "QR_CODE" | "STUDENT_ID";
}

export interface OrderBoothResponse {
  id: number;
  name: string;
}

export interface OrderItemProductResponse {
  id: number;
  name: string;
}

export interface OrderItemResponse {
  product: OrderItemProductResponse;
  price: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  booth: OrderBoothResponse;
  items: OrderItemResponse[];
  totalAmount: number;
}

interface PaymentState {
  loading: boolean;
  confirming: boolean;
  error: string;
  paymentRequest: PaymentRequestResponse | null;
  order: OrderResponse | null;
  
  setLoading: (loading: boolean) => void;
  setConfirming: (confirming: boolean) => void;
  setError: (error: string) => void;
  setPaymentRequest: (paymentRequest: PaymentRequestResponse | null) => void;
  setOrder: (order: OrderResponse | null) => void;
  resetState: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  loading: false,
  confirming: false,
  error: '',
  paymentRequest: null,
  order: null,
  
  setLoading: (loading) => set({ loading }),
  setConfirming: (confirming) => set({ confirming }),
  setError: (error) => set({ error }),
  setPaymentRequest: (paymentRequest) => set({ paymentRequest }),
  setOrder: (order) => set({ order }),
  resetState: () => set({
    loading: false,
    confirming: false,
    error: '',
    paymentRequest: null,
    order: null
  })
}));