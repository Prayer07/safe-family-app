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
import { useSOS } from "../../hooks/useSOS";


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

  const centerOnMe = useCallback(async () => {
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

      // Post location to backend
      const token = await getToken();
      await axios.post(
        `${API_BASE_URL}/location`,
        { lat, lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Center on me failed:", err);
      Alert.alert("Error", "Failed to get your location");
    }
  }, []);

  // In map.tsx
  const { triggerSOS, sending } = useSOS();

    const load = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await axios.get(`${API_BASE_URL}/location/family/last`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.data as MemberLocation[]);

      const validMembers = data.filter(
        (m) => typeof m.lat === "number" && !isNaN(m.lat) && 
              typeof m.lng === "number" && !isNaN(m.lng)
      );

      setMembers(validMembers);

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
  }, []); // ✅ No dependencies - stable reference

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    await centerOnMe();
    setRefreshing(false);
  }, [load, centerOnMe]); // ✅ Now stable

  useEffect(() => {
    load();
    centerOnMe();

    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      load();
    }, 30000); // 30 seconds

  return () => clearInterval(interval);
  }, [load]); // ✅ Proper dependencies

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

        <Pressable style={[styles.fab, { bottom: 120 }]}
          onPress={centerOnMe}
          disabled={sending}
        >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.fabText}>Me</Text>
        )}
        </Pressable>

        <Pressable
          style={[styles.fab, { bottom: 40, backgroundColor: "#FF3B30" }]}
          onPress={async () => {
            const success = await triggerSOS();
            if (success) centerOnMe();
          }}
          disabled={sending}
        >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.fabIcon}>🚨</Text>
        )}
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
  fabIcon: { fontSize: 24 },
});