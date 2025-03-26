import { Button, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React from "react";
import { DailyWellBeingForm } from "../components/feedbackModal";
import { checkAdmin } from "../services/authService";

export default function HomeScreen() {
    const { t } = useTranslation();

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View>
        <Text>{t("welcome")}</Text>
        {<DailyWellBeingForm />}
        </View>
        </>
        );
}