import React, { useCallback, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Pressable, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import usePushNotification from "../../hooks/usePushNotification";
import axios from "axios";
import { API_BASE_URL } from "../../context/AuthContext";
import { getToken } from "../../utils/secureStorage";


interface MemberLocation {
  userId: string;
  name: string;
  lat: number;
  lng: number;
  lastActiveAt?: string | null;
}

export default function MapScreen() {

  usePushNotification()

  const [region, setRegion] = useState<Region>({
    latitude: 6.5244, // Lagos fallback
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<MemberLocation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
    const token = await getToken();
      const data = await axios.get(`${API_BASE_URL}/location/family/last`, {
        headers: {
            Authorization: `Bearer ${token}`
        },
      }).then(res => res.data as MemberLocation[]);

      // ✅ Filter invalid locations
      const validMembers = data.filter(
        (m) =>
          typeof m.lat === "number" &&
          !isNaN(m.lat) &&
          typeof m.lng === "number" &&
          !isNaN(m.lng)
      );

      setMembers(validMembers);

      // ✅ Auto-center to first valid member
      if (validMembers.length > 0) {
        const first = validMembers[0];
        setRegion((r) => ({
          ...r,
          latitude: first.lat,
          longitude: first.lng,
        }));
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
      Alert.alert("Error", "Failed to load family locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [members]);

  const centerOnMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is required");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setRegion((r) => ({
        ...r,
        latitude: lat,
        longitude: lng,
      }));

      // ✅ Post location to backend
      try {
        const token = await getToken();
        await axios.post(`${API_BASE_URL}/location`,
          { lat, lng },
          {
            headers: {
            Authorization: `Bearer ${token}`
          }
          }
        );
      } catch (e) {
        console.error("Failed to post location:", e);
      }
    } catch (err) {
      console.error("Center on me failed:", err);
      Alert.alert("Error", "Failed to get your location");
    }
  };

  const triggerSOS = async () => {
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

      const res = await axios.post(`${API_BASE_URL}/sos/trigger`, 
        {coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Response:', res);

      Alert.alert("✅ SOS Sent", "Your family has been notified!");
    } catch (err) {
      console.error("SOS failed:", err);
      Alert.alert("Error", "Failed to send SOS alert");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onRegionChangeComplete={(r) => setRegion(r)}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {members.map((m) => (
            <Marker
              key={m.userId}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              title={m.name}
              description={
                m.lastActiveAt
                  ? new Date(m.lastActiveAt).toLocaleString()
                  : "Location unavailable"
              }
            />
          ))}
        </MapView>

        {members.length === 0 && (
          <View style={styles.noDataBanner}>
            <Text style={styles.noDataText}>
              No family member locations available
            </Text>
          </View>
        )}

        <Pressable style={[styles.fab, { bottom: 120 }]} onPress={centerOnMe}>
          <Text style={styles.fabText}>ME</Text>
        </Pressable>

        <Pressable
          style={[styles.fab, { bottom: 40, backgroundColor: "#FF3B30" }]}
          onPress={triggerSOS}
        >
          <Text style={styles.fabText}>SOS</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  noDataBanner: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 8,
    elevation: 4,
  },
  noDataText: { textAlign: "center", color: "#666" },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E90FF",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});