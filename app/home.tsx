import { Alert, Button, Platform, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, logout, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { fetchIsSuspended, fetchXp, setIsSuspended } from "../services/dbService";
import { ProgressBar } from "react-native-paper";
import { useUserColor } from "../context/cancerColor";
import TasksModal from "../components/tasksModal";
import AdminModal from "../components/adminModal";
import { MaterialIcons } from "@expo/vector-icons";
import { refreshTokens } from "../components/wearable";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WeekModal from "../components/weekModal";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = useState(true);
    const [isMod, setIsMod] = useState(true);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const cancerColor = useUserColor();
    const [warningShown, setWarningShown] = useState(false);
    const insets = useSafeAreaInsets();
    const [changeMessage, setChangeMessage] = useState(true);

    const messages = [
        t("encouragement_messages.0"),
        t("encouragement_messages.1"),
        t("encouragement_messages.2"),
        t("encouragement_messages.3"),
        t("encouragement_messages.4"),
    ];
    const [message, setMessage] = useState(Math.floor(Math.random() * 5));

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
            isUserSuspended();
            if (admin !== "true" && mod !== "true" && !warningShown) {
                checkDailyWarning();
                setWarningShown(true);
            }
        };
        isAdminOrMod();

        const isUserSuspended = async () => {
            const isSuspended = await fetchIsSuspended();
            if (isSuspended) {
                router.replace("/dontExercise");
                return;
            }
        }

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
    }, []);
    
    useEffect(() => {

        const getXP = async () => {
            const userXP = await fetchXp();
            const calculatedLevel = Math.floor(userXP / 1000) + 1;
            setLevel(calculatedLevel);
            setProgress((userXP % 1000) / 1000 || 0);
        };

        if (!isAdmin && !isMod) {
            getXP();
            if(changeMessage) {
                setChangeMessage(false);
                const random = Math.floor(Math.random() * 5);
                setMessage(random);
                setTimeout(() => {
                    setChangeMessage(true);
                }, 300000);
            }
        }
        
    }, [isAdmin, isMod, message, changeMessage]);

    if (isAdmin && isMod) {
        return (
            <View style={{ padding: 10, flexDirection: "column", justifyContent: "center", marginTop: insets.top + 150, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 10 }}>
            </View>
        );
    } 


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
            <View style={[styles.container, {marginTop: insets.top + 50}]}>
                    <>
                    <View style={styles.card2}>
                    <WeekModal />
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.levelText}>{t("level")} {isNaN(level) ? 0 : level} 🏅</Text>
                        <ProgressBar progress={isNaN(progress) ? 0 : progress} color={cancerColor} style={styles.progressBar} />
                        <Text style={styles.xpText}>{Math.floor(progress * 1000)} / 1000 XP</Text>
                        <Text style={styles.encouragement}>{t(`encouragement_messages.${message}`)}</Text>
                    </View>
                    <TasksModal />

                    </>
            </View>
            </>
            )}
            </>
            ) : (
                <>
                <View style={{ padding: 10, flexDirection: "column", justifyContent: "center", marginTop: insets.top + 150, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 10 }}>
                    <Text style={[styles.levelText, {color: cancerColor}]}>PASSiON CARE</Text>
                    <Text style={[{fontSize: 18, color: cancerColor}]}>{t("admin_panel")}</Text>
                </View>
                <View style={[styles.container, {marginTop: insets.top + 200}]}>
                    <AdminModal />
                </View></>
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
        marginBottom: 20,
        borderColor: "grey",
        borderWidth: 0,
    },
    card2: {
        paddingVertical: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginBottom: 20,
        borderColor: "grey",
        borderWidth: 1,
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
    statsText: {
        flexDirection: "row", 
        fontSize: 18,
        marginBottom: 10,
        justifyContent: "space-evenly",
        width: '100%',
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
