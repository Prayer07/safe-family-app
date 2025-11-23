import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { getToken } from "../utils/secureStorage";
import { API_BASE_URL } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setTimeout(() => router.replace("/login"), 500);
          return;
        }

        await axios.get(`${API_BASE_URL}/auth/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTimeout(() => router.replace("/map"), 500);
      } catch (err) {
        setTimeout(() => router.replace("/login"), 500);
      }
    };

    verify();
  }, []);

  return <LoadingScreen />;
}