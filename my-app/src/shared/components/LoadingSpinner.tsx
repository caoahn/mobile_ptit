import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Đang tải...",
  className = "flex-1 items-center justify-center",
}) => (
  <View className={className}>
    <ActivityIndicator size="large" color="#29a38f" />
    {!!text && <Text className="mt-4 text-gray-500">{text}</Text>}
  </View>
);

export default LoadingSpinner;
