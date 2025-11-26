import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../../context/AuthContext";
import { useState } from "react";
import React from "react";
import { Pressable, StyleSheet, View, Text, TextInput } from "react-native";
import { getToken } from "../../utils/secureStorage";

export default function JoinFamilyScreen() {
  const router = useRouter();
  const { handleSubmit, setValue } = useForm<{ inviteCode: string }>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: { inviteCode: string }) => {
    setLoading(true);

    const token = await getToken()    

    try {
      await axios.post(`${API_BASE_URL}/family/join`, {
        inviteCode: data.inviteCode,
      }, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      }    
    );

      router.replace("/");
    } catch (err: any) {
      console.error("Join family failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

   return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Family</Text>

      <TextInput
         placeholder="Enter Invite Code"
         style={styles.input}
         onChangeText={(text) => setValue("inviteCode", text)} />

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>
          {loading? "Joining Family....." : "Join Family"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#1F242C" },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20, color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: "#fff",
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