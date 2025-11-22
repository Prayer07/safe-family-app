import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Infinite rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  // Interpolate rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/icon6.png")} // ✅ path to your logo
        style={[styles.logo, { transform: [{ rotate: spin }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F242C", // change to match your brand
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
});