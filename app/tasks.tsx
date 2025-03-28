import { Button, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React from "react";

export default function TasksScreen() {
    const { t } = useTranslation();

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("tasksscreen_title") }} />
        <View>
        </View>
        </>
        );
}