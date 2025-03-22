import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import "../constants/translations";
import React from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedLogin = await ReactNativeAsyncStorage.getItem("isLoggedIn");
        if (!storedLogin) {
          router.replace("/login");
        }
        else {
          router.replace("/home");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  return (
    <>
    <Stack.Screen options={{ headerTitle: "" }} />
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#5A2A2A",
      }}
    >
    </View>
    </>
  );
}
