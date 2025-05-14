import { View } from "react-native";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import "../constants/translations";
import React from "react";
import { checkAuth } from "../services/authService";
import { useUserColor } from "../context/cancerColor";

export default function Index() {
  const cancerColor = "#845BB1";

  useEffect(() => {
    const checkAuthentication = async () => {
      const isLoggedIn = await checkAuth();
      if (isLoggedIn) {
        router.replace("/home");
      }
    };
    checkAuthentication();
  }, []);

  return (
    <>
    <Stack.Screen options={{ headerTitle: "" }} />
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: cancerColor,
      }}
    >
    </View>
    </>
  );
}
