import { Alert, Button, Platform, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, logout, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { fetchXp, setIsSuspended } from "../services/dbService";
import { ProgressBar } from "react-native-paper";
import { useUserColor } from "../context/cancerColor";
import TasksModal from "../components/tasksModal";
import AdminModal from "../components/adminModal";
import { MaterialIcons } from "@expo/vector-icons";
import { refreshTokens } from "../components/wearable";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = useState(true);
    const [isMod, setIsMod] = useState(true);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const cancerColor = useUserColor();
    const [warningShown, setWarningShown] = useState(false);
    const [steps, setSteps] = useState(-1);
    const [rhr, setRhr] = useState(-1);
    const [sleep, setSleep] = useState(-1);
    const [fetchData, setFetchData] = useState(false);
    const insets = useSafeAreaInsets();

    const messages = [
        t("encouragement_messages.0"),
        t("encouragement_messages.1"),
        t("encouragement_messages.2"),
        t("encouragement_messages.3"),
        t("encouragement_messages.4"),
    ];
    const [message, setMessage] = useState(messages[Math.floor(Math.random() * messages.length)]);

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

        const getXP = async () => {
            const userXP = await fetchXp();
            const calculatedLevel = Math.floor(userXP / 1000) + 1;
            setLevel(calculatedLevel);
            setProgress((userXP % 1000) / 1000);
        };

        if (!isAdmin && !isMod) {
            getXP();
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            setTimeout(() => {
                setMessage(randomMsg);
              }, 300000);
            
            setFetchData(true);
            fetchFitbitData();
        }
        
    }, [isAdmin, isMod, message, fetchData]);

    const getToken = async () => {
        const tokens = await ReactNativeAsyncStorage.getItem("tokens");
        if (!tokens) return null;

        const accessToken = JSON.parse(tokens).accessToken;
        const expiresIn = JSON.parse(tokens).expiresIn;
        const issuedAt = JSON.parse(tokens).issuedAt;

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + expiresIn;

        if (now < expiresAt - 60) return accessToken;

        const new_accessToken = await refreshTokens(tokens);
        if (!new_accessToken) return null;
        return new_accessToken;
    };

    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

    const fetchFitbitData = async () => {
        setTimeout(() => {
            setFetchData(false);
        }, 10000);

        if (steps !== -1 && rhr !== -1 && sleep !== -1) {
            return;
        }

        const token = await getToken();
        if (!token) {
            return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const today = getTodayDate();
        const stepsUrl = `https://api.fitbit.com/1/user/-/activities/date/${today}.json`;
      
        const stepsRes = await fetch(stepsUrl, { headers });
        const heartRateRes = await fetch('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', { headers });
        const sleepRes = await fetch('https://api.fitbit.com/1/user/-/sleep/date/today.json', { headers });
      
        const stepsData = await stepsRes.json();
        const heartRateData = await heartRateRes.json();
        const sleepData = await sleepRes.json();

        if (stepsData["summary"]["steps"] === undefined) {
            setSteps(-2);
        }
        else {
            setSteps(stepsData["summary"]["steps"]);
        }
        
        if (heartRateData["activities-heart"][0]["value"]["restingHeartRate"] === undefined) {
            setRhr(-2);
        }
        else {
            setRhr(heartRateData["activities-heart"][0]["value"]["restingHeartRate"]);
        }

        if (sleepData["summary"]["totalMinutesAsleep"] === undefined) {
            setSleep(-2);
        }
        else {
            setSleep(sleepData["summary"]["totalMinutesAsleep"]);
        }
    };

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
                        <Text style={styles.levelText}>{t("level")} {level} 🏅</Text>
                        <ProgressBar progress={progress} color={cancerColor} style={styles.progressBar} />
                        <Text style={styles.xpText}>{Math.floor(progress * 1000)} / 1000 XP</Text>
                        <Text style={styles.encouragement}>{message}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.levelText}> {t("fitbit_data")} 📈</Text>
                        <View style={styles.statsText}>
                        {(steps === -1 || rhr === -1 || sleep === -1) ? (
                            <Text>
                                <Feather name="watch" size={18} color={cancerColor} />
                                 {t("fitbit_not_connected")}
                            </Text>
                            ) : (
                            <>
                                <Text>👣 {steps === -2 ? t("not_available") : steps}</Text>
                                <Text>❤ {rhr === -2 ? t("not_available") : rhr}</Text>
                                <Text>💤 {sleep === -2 ? t("not_available") : sleep}</Text>
                            </>
                            )}
                        </View>
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
                <View style={styles.container}>
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
