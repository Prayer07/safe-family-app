import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../context/AuthContext";
import { useState } from "react";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedView from "../../components/ThemedView";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { getToken } from "../../utils/secureStorage";

export default function CreateFamilyScreen() {
  const router = useRouter();
  const { handleSubmit, setValue } = useForm<{ name: string }>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { name: string }) => {
    setLoading(true);

    const token = await getToken();
    try {
      await axios.post(
        `${API_BASE_URL}/family/create`,
        { name: data.name },
        {
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      );

      router.replace("/");
    } catch (err: any) {
      console.error("Create family failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Create Family</ThemedText>

      <ThemedTextInput
        placeholder="Family Name"
        style={styles.input}
        onChangeText={(text) => setValue("name", text)}
      />

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>
          {loading? "Creating Family....." : "Create Family"}
        </Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});