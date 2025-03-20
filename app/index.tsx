import { Text, View, Button } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedLogin = await ReactNativeAsyncStorage.getItem("isLoggedIn");
        if (!storedLogin) {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    await ReactNativeAsyncStorage.removeItem("isLoggedIn");
    console.log("Logged out");
    router.replace("/login");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
