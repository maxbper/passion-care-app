import { Alert, Button, Platform, Text, View, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { setIsSuspended } from "../services/dbService";
import { ProgressBar } from "react-native-paper";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = useState(true);
    const [isMod, setIsMod] = useState(true);
    const [xp, setXP] = useState(0);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");

    const messages = [
        "You're doing great! Keep it up!",
        "Every step counts. You're on the right track!",
        "Your dedication is inspiring!",
        "Stay strong, you're improving every day!",
        "Great work! Believe in your journey."
    ];

    const suspend = async () => {
        await setIsSuspended(true);
        router.replace("/dontExercise");
    }

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");
            setIsAdmin(admin === "true");
            setIsMod(mod === "true");
        };
        isAdminOrMod();

        const checkDailyWarning = async () => {
            const showWarning = await showDailyWarning();
            if (showWarning) {
                if (Platform.OS === "web") {
                    alert(t("warning") + ":\n" + t("daily_warning"));
                } else {
                    Alert.alert(
                        t("warning"),
                        t("daily_warning"),
                        [
                            {
                                text: t("no"),
                                onPress: () => suspend(),
                                style: "cancel",
                            },
                            {
                                text: t("yes"),
                                onPress: () => {},
                            },
                        ],
                        { cancelable: false }
                    );
                }
            }
        };

        const fetchXP = async () => {
            const userXP = 1500; // Replace with actual user fetch
            setXP(userXP);
            const calculatedLevel = Math.floor(userXP / 1000) + 1;
            setLevel(calculatedLevel);
            setProgress((userXP % 1000) / 1000);
        };

        if (!isAdmin && !isMod) {
            checkDailyWarning();
            fetchXP();
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            setMessage(randomMsg);
        }
    }, [isAdmin, isMod]);

    return (
        <>
            <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
            <View style={styles.container}>
                {!isAdmin && !isMod && (
                    <>
                    <View style={styles.card}>
                        <Text style={styles.levelText}>Level {level} 🏅</Text>
                        <ProgressBar progress={progress} color="green" style={styles.progressBar} />
                        <Text style={styles.xpText}>{Math.floor(progress * 1000)} / 1000 XP</Text>
                        <Text style={styles.encouragement}>{message}</Text>
                        <WeeklyHealthAssessment />
                    </View>
                    </>
                )}
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
    },
    card: {
        width: "90%",
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    levelText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    progressBar: {
        width: 250,
        height: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    xpText: {
        fontSize: 14,
        marginBottom: 20,
    },
    encouragement: {
        fontStyle: "italic",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        paddingHorizontal: 20,
    },
});
