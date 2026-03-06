import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { useDialogStore } from '../../shared/stores/useDialogStore';

export const GlobalDialog = () => {
  const {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    hideDialog,
  } = useDialogStore();

  const handleConfirm = () => {
    onConfirm();
    hideDialog();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    hideDialog();
  };

  // Determine if this is a dangerous action based on confirmText or title
  const isDestructive = title.toLowerCase().includes('xóa') || confirmText.toLowerCase().includes('logout');

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleCancel}
        style={{ backgroundColor: 'white', borderRadius: 20 }}
      >
        <Dialog.Title className="text-xl font-bold text-gray-900 text-center mt-2">
          {title}
        </Dialog.Title>
        <Dialog.Content className="pb-6">
          <Text className="text-base text-gray-600 text-center leading-relaxed">
            {message}
          </Text>
        </Dialog.Content>
        <View className="flex-row border-t border-gray-200">
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 py-4 items-center border-r border-gray-200"
          >
            <Text className="text-base font-bold text-gray-500">{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            className="flex-1 py-4 items-center"
          >
            <Text className={`text-base font-bold ${isDestructive ? 'text-red-500' : 'text-[#29a38f]'}`}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog>
    </Portal>
  );
};
