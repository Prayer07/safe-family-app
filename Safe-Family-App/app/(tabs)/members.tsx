// app/(tabs)/members.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";  // 👈 import clipboard
import axios from "axios";
import { API_BASE_URL } from "../../context/AuthContext";
import { getToken } from "../../utils/secureStorage";

interface Member {
  _id: string;
  fullname: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  lastActiveAt?: string | null;
  lastKnownLat?: number | null;
  lastKnownLng?: number | null;
}

interface FamilyResponse{
  inviteCode: string;
  members: Member[]
}


export default function MembersScreen() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
      try {
        const data = await axios.get(`${API_BASE_URL}/family`, {
            headers: {
              Authorization: `Bearer ${await getToken()}`
            }
        }).then(res => res.data as FamilyResponse);
        setMembers(data.members);
        setInviteCode(data.inviteCode);
      } catch (err) {
        console.error("Failed to fetch members:", (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      load()
    }, [])

    const onRefresh = useCallback(async () => {
      setRefreshing(true)
      await load()
      setRefreshing(false)
    }, [])

    const copyInviteCode = async () => {
      if (inviteCode) {
        await Clipboard.setStringAsync(inviteCode);
        Alert.alert("Copied ✅", "Invite code copied to clipboard!");
      }
    };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!members || members.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No members yet. Create or join a family.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={members}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => {
        const isOnline = item.lastActiveAt ? Date.now() - new Date(item.lastActiveAt).getTime() < 5 * 60 * 1000 : false;
        return (
          <View style={styles.card}>
            <Text style={styles.name}>{item.fullname}</Text>
            <Text style={styles.detail}>{item.phone ?? item.email ?? ""}</Text>
            {/* <Text style={styles.detail}>Invite Code: {inviteCode ?? "***"}</Text> */}
            <Text style={styles.detail}>
              <TouchableOpacity onPress={copyInviteCode}>
                <Text style={{color: "#1E90FF", fontWeight: "condensedBold"}}>{inviteCode} {"    "}</Text>
              </TouchableOpacity>
                tap to copy
            </Text>
            <Text style={{ color: isOnline ? "green" : "gray" }}>{isOnline ? "Online" : "Offline"}</Text>
          </View>
        );
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
      }
      ListEmptyComponent={<Text>No members found.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F2FAFF",
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  detail: { color: "#6B7280" },
  inviteCode: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  copyText: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
  },
  copyButton: {
    alignItems: "center",
  },
});