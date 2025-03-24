import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAdmin } from "../services/authService";

export default function HomeScreen() {
    const { t } = useTranslation();

    useEffect(() => {
        const fetchAdminStatus = async () => {
            const admin = await checkAdmin();
            if (admin) {
                console.log("Admin");
            } else {
                console.log("Not Admin");
            }
        };
        fetchAdminStatus();
      }, []);

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View>
        <Text>{t("welcome")}</Text>
        </View>
        </>
        );
}