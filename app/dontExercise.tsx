import { Alert, Button, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";

export default function DontExerciseScreen() {
    const { t } = useTranslation();

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
        <Text style={{color: "white", padding: 20, fontSize: 30, textAlign: "center"}}>{t("dont_exercise")}</Text>
        </View>
        </>
        );
}