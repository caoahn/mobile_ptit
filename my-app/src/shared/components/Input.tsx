import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName = "",
  className = "",
  ...props
}) => {
  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-text focus:border-primary focus:border-2 ${error ? "border-danger" : ""
          } ${className}`}
        {...props}
      />
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default Input;
