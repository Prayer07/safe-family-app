import { Stack, Tabs } from 'expo-router'
import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'react-native';


export default function _layout() {
  return (
    <>
    <StatusBar barStyle="light-content" backgroundColor="#1F242C" />
    <Tabs
      screenOptions={{
        // headerShown: false,
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#1F242C", borderTopColor: "#1F242C" },
        // headerStyle: { backgroundColor: "#1F242C" },
        // headerTitleStyle: { color: "#fff" },
      }}
    >
        <Tabs.Screen
          name='map' 
          options={{
            title: "Map", 
            animation: "shift",
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
          }}/>

        <Tabs.Screen
          name='members' 
          options={{
            title: "Members", 
            animation: "shift",
            tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          }}/>

        <Tabs.Screen
          name='sos' 
          options={{
            title: "SOS", 
            animation: "shift",
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle-outline" size={size} color={color} />,
          }}/>

        <Tabs.Screen
          name='history' 
          options={{
            title: "History", 
            animation: "shift",
            // headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
          }}/>

        <Tabs.Screen
          name='settings' 
          options={{
            title: "Settings", 
            animation: "shift",
            tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          }}/>
    </Tabs>
    </>
  )
}
