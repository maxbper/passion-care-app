import { Alert, Button, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth } from "../services/authService";
import { fetchIsSuspended } from "../services/dbService";

export default function DontExerciseScreen() {
    const { t } = useTranslation();

    useEffect(() => {
            const checkAuthentication = async () => {
                await checkAuth();
            };
            checkAuthentication();

            const checkIsSuspended = async () => {
                const isSuspended = await fetchIsSuspended();
                if (!isSuspended) {
                    router.replace("/home");
                }
            }
            checkIsSuspended();
        const interval = setInterval(checkIsSuspended, 60000);
        return () => clearInterval(interval);
        }
    , []);

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
        <Text style={{color: "white", padding: 20, fontSize: 20, textAlign: "center"}}>{t("dont_exercise")}</Text>
        </View>
        </>
        );
}