import { Alert, Button, Platform, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, logout, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { setIsSuspended } from "../services/dbService";
import { ProgressBar } from "react-native-paper";
import { useUserColor } from "../context/cancerColor";
import TasksModal from "../components/tasksModal";
import AdminModal from "../components/adminModal";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = useState(true);
    const [isMod, setIsMod] = useState(true);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const cancerColor = useUserColor();
    const [warningShown, setWarningShown] = useState(false);

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
                if (Platform.OS !== "web") {
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
        if (!isAdmin && !isMod && !warningShown) {
            checkDailyWarning();
            setWarningShown(true);
        }

        const fetchXP = async () => {
            const userXP = 1500;
            const calculatedLevel = Math.floor(userXP / 1000) + 1;
            setLevel(calculatedLevel);
            setProgress((userXP % 1000) / 1000);
        };

        if (!isAdmin && !isMod) {
            fetchXP();
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            setMessage(randomMsg);
        }
    }, [isAdmin, isMod]);

    return (
        <>
        {!isAdmin && !isMod ? (
            <>
            {Platform.OS === "web" ? (
                <View style={styles.card}>
                <Text style={styles.levelText}>{t("warning")}</Text>
                <Text style={styles.xpText}>{t("web_admin_message")}</Text>
                <TouchableOpacity style={styles.button} onPress={logout}>
                    <MaterialIcons name="logout" size={36} color={cancerColor}/>
                    <Text style={styles.text}>{t("logout")}</Text>
                </TouchableOpacity>
                </View>
            ) : (
            <>
            {warningShown && <WeeklyHealthAssessment />}
            <View style={styles.container}>
                    <>
                    <View style={styles.card}>
                        <Text style={styles.levelText}>Level {level} 🏅</Text>
                        <ProgressBar progress={progress} color={cancerColor} style={styles.progressBar} />
                        <Text style={styles.xpText}>{Math.floor(progress * 1000)} / 1000 XP</Text>
                        <Text style={styles.encouragement}>{message}</Text>
                    </View>
                    <TasksModal />
                    </>
            </View>
            </>
            )}
            </>
            ) : (
            <View style={styles.container}>
                <AdminModal />
            </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
    },
    card: {
        width: "90%",
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginBottom: 50,
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
    button: {
        backgroundColor: "#fff",
        borderRadius: 50,
        width: 100,
        height: 100,
        elevation: 3,
        alignItems: "center",
        justifyContent: "center",
      },
      text: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
      },
});
