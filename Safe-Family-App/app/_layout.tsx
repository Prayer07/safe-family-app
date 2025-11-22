import React from "react";
import { StatusBar } from "react-native";
import { Slot } from "expo-router";
import AuthProvider from "../context/AuthContext";

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </>
  );
}