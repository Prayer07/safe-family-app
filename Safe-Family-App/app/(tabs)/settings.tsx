// app/(tabs)/settings.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { getToken, removeToken } from "../../utils/secureStorage";
import axios from "axios";
import { API_BASE_URL } from "../../context/AuthContext";

interface User {
  fullname: string;
  email: string;
  // Add other user properties as needed
}

export default function SettingsScreen() {

  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await removeToken()
    router.replace("/login");
  };

    const fetchUser = async () => {
    try {
      const token = await getToken();

      const res = await axios.get(`${API_BASE_URL}/auth/get-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error: any) {
      console.log("Error fetching user:", error.response?.data || error.message);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>
      <Text style={styles.text}>Signed in as: {user?.fullname || "Guest"}</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  text: { marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: "#FF3B30", padding: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});