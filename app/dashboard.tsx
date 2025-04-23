import { Alert, Button, Platform, Text, View, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { setIsSuspended } from "../services/dbService";

export default function DashboardScreen() {
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");

            const isAdminOrMod = admin === "true" || mod === "true";
            if (!isAdminOrMod) {
                router.replace("/home");
            }
        };
        isAdminOrMod();
    }, []);

        


    return (
        <>
        <Stack.Screen options={{ headerTitle: "Dashboard" }} />
        <View style={styles.container}>
        <Text>get list of users of this admin</Text>
        <Text>display blocks with the name of the users</Text>
        <Text>then have a display page for each user, maybe reuse the profile page?</Text>
        </View>
        </>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        marginTop: 50,
        alignItems: "center",
    }
}
);