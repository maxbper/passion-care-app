import { Text, View, Button, Touchable, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { logout } from "../services/authService";

export default function HomeScreen() {
    const { t } = useTranslation();

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("profilescreen_title") }} />
        <View>
        <Text>{t("welcome")}</Text>
        <Button title={t("logout")} onPress={logout} />
        <TouchableOpacity onPress={logout}>
        <MaterialIcons name="logout" size={24} color="#5A2A2A"/>
        <Text>{t("logout")}</Text>
        </TouchableOpacity>
        </View>
        </>
        );
}