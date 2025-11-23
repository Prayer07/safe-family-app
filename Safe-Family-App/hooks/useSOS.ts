// hooks/useSOS.ts
import { useState } from "react";
import * as Location from "expo-location";
import axios from "axios";
import { Alert } from "react-native";
import { API_BASE_URL } from "../context/AuthContext";
import { getToken } from "../utils/secureStorage";

export const useSOS = () => {
  const [sending, setSending] = useState(false);

  const triggerSOS = async () => {
    if (sending) return;
    
    setSending(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is required for SOS");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const token = await getToken();

      await axios.post(
        `${API_BASE_URL}/sos/trigger`,
        { coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("✅ SOS Sent", "Your family has been notified!");
      return true;
    } catch (err) {
      console.error("SOS failed:", err);
      Alert.alert("Error", "Failed to send SOS alert");
      return false;
    } finally {
      setSending(false);
    }
  };

  return { triggerSOS, sending };
};