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
          // show loading for a moment then go login
          setTimeout(() => {
            router.replace("/login");
          }, 1000);
          return;
        }

        // validate the user
        await axios.get(`${API_BASE_URL}/auth/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // valid user → show loading then go to map
        setTimeout(() => {
          router.replace("/map");
        }, 1000);

      } catch (err) {
        // token invalid → go login
        setTimeout(() => {
          router.replace("/login");
        }, 1000);
      }
    };

    verify();
  }, []);

  return <LoadingScreen />;
}