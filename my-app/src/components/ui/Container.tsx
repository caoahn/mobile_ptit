import React from "react";
import { View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContainerProps extends ViewProps {
  safe?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  safe = false,
  className = "",
  ...props
}) => {
  const Wrapper = safe ? SafeAreaView : View;

  return (
    <Wrapper className={`flex-1 bg-background ${className}`} {...props}>
      {children}
    </Wrapper>
  );
};

export default Container;
