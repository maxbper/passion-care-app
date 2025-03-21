import { Text, View, Button } from "react-native";
import { Stack, useRouter } from "expo-router";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import React from "react";

export default function HomeScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        await ReactNativeAsyncStorage.removeItem("isLoggedIn");
        console.log("Logged out");
        router.replace("/login");
    };

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View>
        <Text>{t("welcome")}</Text>
        <Button title={t("logout")} onPress={handleLogout} />
        </View>
        </>
        );
}