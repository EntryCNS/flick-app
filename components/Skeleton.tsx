import React, { useEffect, useRef, memo } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { COLORS } from "@/constants/colors";

interface SkeletonProps {
  width: number | "auto" | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = memo(
  ({ width, height, borderRadius = 4, style }: SkeletonProps) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      animation.start();

      return () => animation.stop();
    }, [pulseAnim]);

    const backgroundColor = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.gray100, COLORS.gray200],
    });

    return (
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor,
          },
          style,
        ]}
      />
    );
  }
);
