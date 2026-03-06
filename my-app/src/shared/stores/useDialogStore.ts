import { create } from "zustand";

interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showDialog: (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }) => void;
  hideDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: "",
  message: "",
  confirmText: "Xác nhận",
  cancelText: "Hủy",
  onConfirm: () => {},
  onCancel: undefined,
  showDialog: (params) =>
    set({
      visible: true,
      title: params.title,
      message: params.message,
      onConfirm: params.onConfirm,
      onCancel: params.onCancel,
      confirmText: params.confirmText || "Xác nhận",
      cancelText: params.cancelText || "Hủy",
    }),
  hideDialog: () => set({ visible: false }),
}));
