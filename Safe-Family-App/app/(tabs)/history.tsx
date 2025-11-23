// app/(tabs)/history.tsx
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  Pressable,
  Alert
} from "react-native";
import { API_BASE_URL } from "../../context/AuthContext";
import { getToken } from "../../utils/secureStorage";

type SOSItem = {
  _id: string;
  triggeredBy: string;
  coords?: { lat: number; lng: number };
  status: "triggered" | "acknowledged" | "resolved";
  timestamp: string;
  resolvedBy?: string;
  resolvedAt?: string;
};

type FilterType = "all" | "unresolved" | "resolved";

export default function HistoryScreen() {
  const [sosList, setSosList] = useState<SOSItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await axios.get(`${API_BASE_URL}/history/sos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(res => res.data) as SOSItem[];
      
      setSosList(data);
    } catch (err) {
      console.error("Failed to load SOS history:", (err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const resolveSOS = async (sosId: string) => {
    try {
      setResolvingId(sosId);
      const token = await getToken();
      
      await axios.post(
        `${API_BASE_URL}/sos/resolve/${sosId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("✅ Success", "SOS marked as resolved");
      load(); // Reload the list
    } catch (err) {
      console.error("Failed to resolve SOS:", err);
      Alert.alert("❌ Error", "Failed to resolve SOS");
    } finally {
      setResolvingId(null);
    }
  };

  const confirmResolve = (sosId: string, triggeredBy: string) => {
    Alert.alert(
      "Resolve SOS",
      `Mark ${triggeredBy}'s SOS as resolved?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Resolve", 
          style: "default",
          onPress: () => resolveSOS(sosId)
        },
      ]
    );
  };

  // Filter SOS based on selected filter
  const filteredSOS = sosList.filter(item => {
    if (filter === "unresolved") {
      return item.status === "triggered" || item.status === "acknowledged";
    }
    if (filter === "resolved") {
      return item.status === "resolved";
    }
    return true; // "all"
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            All ({sosList.length})
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterTab, filter === "unresolved" && styles.filterTabActive]}
          onPress={() => setFilter("unresolved")}
        >
          <Text style={[styles.filterText, filter === "unresolved" && styles.filterTextActive]}>
            Unresolved ({sosList.filter(s => s.status !== "resolved").length})
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterTab, filter === "resolved" && styles.filterTabActive]}
          onPress={() => setFilter("resolved")}
        >
          <Text style={[styles.filterText, filter === "resolved" && styles.filterTextActive]}>
            Resolved ({sosList.filter(s => s.status === "resolved").length})
          </Text>
        </Pressable>
      </View>

      {/* SOS List */}
      {filteredSOS.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {filter === "all" 
              ? "No SOS alerts yet" 
              : filter === "unresolved"
              ? "No unresolved SOS alerts"
              : "No resolved SOS alerts"}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={filteredSOS}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={[
              styles.card,
              item.status === "resolved" ? styles.cardResolved : styles.cardUnresolved
            ]}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>🚨 SOS Alert</Text>
                <View style={[
                  styles.statusBadge,
                  item.status === "resolved" ? styles.statusResolved : styles.statusUnresolved
                ]}>
                  <Text style={styles.statusText}>
                    {item.status === "resolved" ? "✓ Resolved" : "⚠ Unresolved"}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>
                Triggered by: <Text style={styles.value}>{item.triggeredBy}</Text>
              </Text>

              {item.coords ? (
                <Text style={styles.label}>
                  Location: <Text style={styles.value}>
                    {item.coords.lat.toFixed(4)}, {item.coords.lng.toFixed(4)}
                  </Text>
                </Text>
              ) : (
                <Text style={styles.noLocation}>📍 Location unavailable</Text>
              )}

              <Text style={styles.label}>
                Time: <Text style={styles.value}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </Text>

              {item.status === "resolved" && item.resolvedBy && (
                <>
                  <Text style={styles.label}>
                    Resolved by: <Text style={styles.value}>{item.resolvedBy}</Text>
                  </Text>
                  {item.resolvedAt && (
                    <Text style={styles.label}>
                      Resolved at: <Text style={styles.value}>
                        {new Date(item.resolvedAt).toLocaleString()}
                      </Text>
                    </Text>
                  )}
                </>
              )}

              {/* Resolve Button - Only show for unresolved SOS */}
              {item.status !== "resolved" && (
                <Pressable
                  style={[
                    styles.resolveButton,
                    resolvingId === item._id && styles.resolveButtonDisabled
                  ]}
                  onPress={() => confirmResolve(item._id, item.triggeredBy)}
                  disabled={resolvingId === item._id}
                >
                  {resolvingId === item._id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.resolveButtonText}>✓ Mark as Resolved</Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#FF3B30",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardUnresolved: {
    backgroundColor: "#FFF5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  cardResolved: {
    backgroundColor: "#F0FFF4",
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusUnresolved: {
    backgroundColor: "#FF3B30",
  },
  statusResolved: {
    backgroundColor: "#34C759",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  value: {
    fontWeight: "600",
    color: "#000",
  },
  noLocation: {
    color: "#999",
    fontStyle: "italic",
    fontSize: 14,
    marginBottom: 6,
  },
  resolveButton: {
    backgroundColor: "#34C759",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  resolveButtonDisabled: {
    opacity: 0.6,
  },
  resolveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});