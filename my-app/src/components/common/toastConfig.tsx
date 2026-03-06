import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import { MaterialIcons } from "@expo/vector-icons";

const CustomToast = ({
  text1,
  text2,
  iconName,
  iconColor,
  iconBgColor
}: {
  text1?: string,
  text2?: string,
  iconName: any,
  iconColor: string,
  iconBgColor: string
}) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  }}>
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: iconBgColor
    }}>
      <MaterialIcons name={iconName} size={22} color={iconColor} />
    </View>
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {text1 ? <Text style={{ fontSize: 15, fontWeight: '800', color: '#121716', marginBottom: text2 ? 2 : 0 }}>{text1}</Text> : null}
      {text2 ? <Text style={{ fontSize: 13, color: '#67837f', fontWeight: '500', lineHeight: 18 }}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <CustomToast text1={text1} text2={text2} iconName="check-circle" iconColor="#29a38f" iconBgColor="#e8f5f3" />
  ),
  error: ({ text1, text2 }) => (
    <CustomToast text1={text1} text2={text2} iconName="error" iconColor="#ef4444" iconBgColor="#fee2e2" />
  ),
  info: ({ text1, text2 }) => (
    <CustomToast text1={text1} text2={text2} iconName="info" iconColor="#3b82f6" iconBgColor="#dbeafe" />
  ),
};
