import { Button, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth } from "../services/authService";

export default function TasksScreen() {
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();
            }
    , []);

    return (
        <>
        <Stack.Screen options={{ headerTitle: t("tasksscreen_title") }} />
        <View>
        </View>
        </>
        );
}