// app/welcome.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import React from "react";

export default function Welcome() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Select One</ThemedText>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/createFamily")}
      >
        <Text style={styles.buttonText}>Create Family</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/joinFamily")}
      >
        <Text style={styles.buttonText}>Join Family</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  button: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { color: "#1E90FF", marginTop: 20 },
});