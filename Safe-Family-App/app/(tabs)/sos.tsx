// app/(tabs)/sos.tsx
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { getToken } from "../../utils/secureStorage";
import { API_BASE_URL } from "../../context/AuthContext";
import usePushNotification from "../../hooks/usePushNotification";
import * as Location from "expo-location";

export default function SosScreen() {

  usePushNotification()

  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("")

  const openConfirm = () => setConfirmVisible(true);
  const closeConfirm = () => setConfirmVisible(false);

  const sendSOS = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission required for SOS");
        setLoading(false);
        return;
      }
      
      const pos = await Location.getCurrentPositionAsync({});

      const token = await getToken();

      await axios.post(`${API_BASE_URL}/sos/trigger`, 
        {coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // console.log('SOS Response:', res);
      Alert.alert("✅ SOS Alert Sent", "Your family has been notified!");
      closeConfirm();
    } catch (err) {
      // Handle network or API errors properly
      if (axios.isAxiosError(err)) {
        console.log("Axios error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Login failed")
      } else {
        console.log("Unexpected error:", err);
      }
      Alert.alert("❌ Failed to send SOS", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={openConfirm} style={styles.sosButton}>
        <Text style={styles.sosText}>🚨 SOS</Text>
      </Pressable>

      <Modal visible={confirmVisible} transparent animationType="slide">
        <View style={styles.modalBack}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Send Emergency Alert?</Text>
            <Text style={styles.modalSubtitle}>This will notify all family members</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#FF3B30" />
            ) : (
              <>
                <Pressable style={[styles.modalBtn, { backgroundColor: "#FF3B30" }]} onPress={sendSOS}>
                  <Text style={styles.modalBtnText}>🚨 Send SOS</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={closeConfirm}>
                  <Text style={[styles.modalBtnText, { color: "#000" }]}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  sosButton: {
    backgroundColor: "#FF3B30",
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sosText: { color: "#fff", fontSize: 40, fontWeight: "700" },
  modalBack: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 24, borderRadius: 12, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  modalBtn: { padding: 14, borderRadius: 8, marginTop: 12, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});