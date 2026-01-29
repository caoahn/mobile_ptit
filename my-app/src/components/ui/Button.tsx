import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const baseClasses = "flex-row items-center justify-center rounded-lg";

  const variants = {
    primary: "bg-primary active:bg-primary-dark",
    secondary: "bg-secondary active:opacity-80",
    danger: "bg-danger active:opacity-80",
    outline: "border border-gray-300 bg-transparent active:bg-gray-100",
  };

  const sizes = {
    sm: "py-2 px-3",
    md: "py-3 px-5",
    lg: "py-4 px-6",
  };

  const textClasses = {
    primary: "text-white font-bold",
    secondary: "text-white font-bold",
    danger: "text-white font-bold",
    outline: "text-text font-medium",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" ? "gray" : "white"} />
      ) : (
        <Text className={`${textClasses[variant]} ${textSizes[size]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
