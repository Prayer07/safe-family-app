// app/(tabs)/members.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { API_BASE_URL } from "../../context/AuthContext";
import { getToken, removeToken } from "../../utils/secureStorage";
import { useRouter } from "expo-router";

interface Member {
  _id: string;
  fullname: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  lastActiveAt?: string | null;
  isOwner?: boolean;
}

interface FamilyResponse {
  _id: string;
  name: string;
  inviteCode: string;
  members: Member[];
  owner: string;
}

export default function MembersScreen() {
  const [familyData, setFamilyData] = useState<FamilyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter()

  // Load family data
  const loadFamily = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/family`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data as FamilyResponse;
      setFamilyData(data);
      
      // Get current user ID from token (you might need to decode it)
      setCurrentUserId(data.members[0]?._id || ""); // Adjust based on your auth
    } catch (err: any) {
      console.error("Failed to fetch family:", err);
      
      if (err.response?.status === 404) {
        // No family yet - show create/join options
        setFamilyData(null);
      } else {
        Alert.alert("Error", "Failed to load family members");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFamily();
    setRefreshing(false);
  }, [loadFamily]);

  // Copy invite code
  const copyInviteCode = async () => {
    if (familyData?.inviteCode) {
      await Clipboard.setStringAsync(familyData.inviteCode);
      Alert.alert("✅ Copied", "Invite code copied to clipboard!");
    }
  };

  // Share invite code
  const shareInviteCode = () => {
    if (familyData?.inviteCode) {
      Alert.alert(
        "Invite Code",
        `Share this code with family members:\n\n${familyData.inviteCode}`,
        [
          { text: "Copy", onPress: copyInviteCode },
          { text: "Close", style: "cancel" },
        ]
      );
    }
  };

  // Open member details
  const viewMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setModalVisible(true);
  };

  // Remove member (owner only)
  const removeMember = async (memberId: string) => {
    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${API_BASE_URL}/family/member/${memberId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              Alert.alert("✅ Success", "Member removed");
              await loadFamily();
            } catch (err) {
              console.error("Remove member failed:", err);
              Alert.alert("Error", "Failed to remove member");
            }
          },
        },
      ]
    );
  };
  

const leaveFamily = async () => {
  Alert.alert(
    "Leave Family",
    "Are you sure you want to leave this family?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            // Get auth token
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            // Call backend to leave family
            await axios.post(
              `${API_BASE_URL}/family/leave`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Remove local token
            await removeToken();

            // Clear local family data just in case (good practice)
            setFamilyData(null);

            // Navigate to login
            router.replace("/login");

            // Show confirmation (optional after navigation)
            Alert.alert("Success", "You have left the family");
          } catch (err: any) {
            console.error("Leave family failed:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to leave family");
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};


  // Filter members by search query
  const filteredMembers = familyData?.members.filter((m) =>
    m.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check online status (within last 5 minutes)
  const isOnline = (lastActiveAt?: string | null) => {
    if (!lastActiveAt) return false;
    return Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000;
  };

  // Check if current user is owner
  const isOwner = familyData?.owner === currentUserId;

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading family...</Text>
      </View>
    );
  }

  // No family state
  if (!familyData) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No Family Yet</Text>
        <Text style={styles.emptyText}>Create a family or join one with an invite code</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Family Header */}
      <View style={styles.header}>
        <Text style={styles.familyName}>{familyData.name}</Text>
        <Text style={styles.memberCount}>
          {familyData.members.length} {familyData.members.length === 1 ? "member" : "members"}
        </Text>
      </View>

      {/* Invite Code Card */}
      <View style={styles.inviteCard}>
        <Text style={styles.inviteLabel}>Family Invite Code</Text>
        <Pressable style={styles.inviteCodeContainer} onPress={copyInviteCode}>
          <Text style={styles.inviteCode}>{familyData.inviteCode}</Text>
          <Text style={styles.tapToCopy}>Tap to copy</Text>
        </Pressable>
        <Pressable style={styles.shareButton} onPress={shareInviteCode}>
          <Text style={styles.shareButtonText}>📤 Share Invite</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      {familyData.members.length > 3 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const online = isOnline(item.lastActiveAt);
          const isFamilyOwner = familyData.owner === item._id;

          return (
            <Pressable
              style={styles.memberCard}
              onPress={() => viewMemberDetails(item)}
            >
              {/* Avatar */}
              <View style={[styles.avatar, online && styles.avatarOnline]}>
                <Text style={styles.avatarText}>
                  {item.fullname.charAt(0).toUpperCase()}
                </Text>
                {online && <View style={styles.onlineDot} />}
              </View>

              {/* Member Info */}
              <View style={styles.memberInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{item.fullname}</Text>
                  {isFamilyOwner && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerBadgeText}>👑 Owner</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberDetail}>
                  {item.phone || item.email || "No contact info"}
                </Text>
                <Text style={[styles.status, online && styles.statusOnline]}>
                  {online ? "🟢 Online" : "⚪ Offline"}
                </Text>
              </View>

              {/* Actions */}
              {isOwner && !isFamilyOwner && (
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeMember(item._id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        }
      />

      {/* Leave Family Button */}
      <Pressable style={styles.leaveButton} onPress={leaveFamily}>
        <Text style={styles.leaveButtonText}>Leave Family</Text>
      </Pressable>

      {/* Member Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Member Details</Text>
            
            {selectedMember && (
              <>
                <Text style={styles.modalLabel}>Name</Text>
                <Text style={styles.modalValue}>{selectedMember.fullname}</Text>

                <Text style={styles.modalLabel}>Email</Text>
                <Text style={styles.modalValue}>
                  {selectedMember.email || "Not provided"}
                </Text>

                <Text style={styles.modalLabel}>Phone</Text>
                <Text style={styles.modalValue}>
                  {selectedMember.phone || "Not provided"}
                </Text>

                <Text style={styles.modalLabel}>Status</Text>
                <Text style={styles.modalValue}>
                  {isOnline(selectedMember.lastActiveAt) ? "🟢 Online" : "⚪ Offline"}
                </Text>

                {selectedMember.lastActiveAt && (
                  <>
                    <Text style={styles.modalLabel}>Last Active</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedMember.lastActiveAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </>
            )}

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  header: {
    backgroundColor: "#1E90FF",
    padding: 20,
    paddingTop: 5,
  },
  familyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  memberCount: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  inviteCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inviteLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  inviteCodeContainer: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1E90FF",
    borderStyle: "dashed",
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#1E90FF",
  },
  tapToCopy: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  shareButton: {
    backgroundColor: "#1E90FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  listContainer: { padding: 16, paddingBottom: 100 },
  memberCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarOnline: {
    borderWidth: 3,
    borderColor: "#34C759",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  ownerBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  memberDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  status: { fontSize: 12, color: "#999" },
  statusOnline: { color: "#34C759" },
  removeButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  leaveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
  },
  modalCloseButton: {
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});