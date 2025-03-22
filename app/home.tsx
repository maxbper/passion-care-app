import { Text, View, Button } from "react-native";
import { Stack, useRouter } from "expo-router";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import React from "react";
import { auth } from "../firebaseConfig";

export default function HomeScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const checkAdmin = async () => {
        const user = auth.currentUser;
        if (user) {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.role === "admin") {
            console.log("User is an admin");
          } else {
            console.log("User is not an admin");
          }
        }
    };

    checkAdmin();

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View>
        <Text>{t("welcome")}</Text>
        </View>
        </>
        );
}