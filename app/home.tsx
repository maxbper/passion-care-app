import { Alert, Button, Platform, Text, View, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { checkAuth, getUid, logout, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { fetchIsSuspended, fetchName, fetchXp, setIsSuspended, setNeedsForm } from "../services/dbService";
import { ProgressBar } from "react-native-paper";
import { useUserColor } from "../context/cancerColor";
import TasksModal from "../components/tasksModal";
import AdminModal from "../components/adminModal";
import { AntDesign, FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import WearableComponent, { refreshTokens } from "../components/wearable";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WeekModal from "../components/weekModal";
import AppointmentModal from "../components/appointmentModal";
import { useProfileModal } from "../context/ProfileModalContext";
import i18n from "../constants/translations";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = useState(true);
    const [isMod, setIsMod] = useState(true);
    const [level, setLevel] = useState(1);
    const [progress, setProgress] = useState(0);
    const cancerColor = "#845BB1";
    const [warningShown, setWarningShown] = useState(false);
    const insets = useSafeAreaInsets();
    const [changeMessage, setChangeMessage] = useState(true);
    const [myUid, setMyUid] = useState("");
    const [name, setName] = useState("");
    const { showModal } = useProfileModal();
    const [wantsForm, setWantsForm]= useState(false);

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
            const uid = await getUid();
            if(uid) {
                setMyUid(uid);
            }
            const n = await fetchName();
            if(n) {
                setName(n);
            }
        };
        checkAuthentication();

        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");
            setIsAdmin(admin === "true");
            setIsMod(mod === "true");
            if (admin !== "true" && mod !== "true" && !warningShown) {
                checkDailyWarning();
            }
        };
        isAdminOrMod();

        const checkDailyWarning = async () => {
            const showWarning = await showDailyWarning();
            if (showWarning) {
                dailyWarning();
            }
            setWarningShown(true);
        };
    }, []);

    const dailyWarning = async () => {
        if (Platform.OS !== "web") {
            Alert.alert(
                t("warning"),
                t("daily_warning"),
                [
                    {
                        text: t("no"),
                        onPress: () => {
                            Alert.alert(
                                t("warning"),
                                t("are_you_sure"),
                                [
                                    {
                                        text: t("no"),
                                        onPress: () => dailyWarning(),
                                    },
                                    {
                                        text: t("yes"),
                                        onPress: () => {suspend()},
                                        style: "cancel",
                                    },
                                ],
                                { cancelable: false }
                            );
                        },
                        style: "cancel",
                    },
                    {
                        text: t("yes"),
                        onPress: () => {setWarningShown(true)},
                    },
                ],
                { cancelable: false }
            );
        }
    }

    const handleSymptomPress = async () => {
        if (Platform.OS !== "web") {
            Alert.alert(
                t("warning"),
                t("fill_new_assessment"),
                [
                    {
                        text: t("no"),
                        onPress: () => {},
                        style: "cancel",
                    },
                    {
                        text: t("yes"),
                        onPress: async () => {
                            await ReactNativeAsyncStorage.setItem("wantsForm", "true");
                            router.push({
                                pathname: "/exercisePlan",
                                params: { p: JSON.stringify(true) },
                            })
                        },
                    },
                ],
                { cancelable: false }
            );
        }
    }
    
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
            <View style={[styles.container, {marginTop: insets.top + 50}]}>
                    <>
                    <View style={{width: "90%", padding: 20}}>
                    <Text style={styles.levelText}>{t("hello")}{name}</Text>
                    </View>
                    {/* <View style={styles.card2}>
                    <WeekModal />
                    </View> */}
                    {/* <View style={styles.card}>
                        <Text style={styles.levelText}>{t("level")} {isNaN(level) ? 0 : level} 🏅</Text>
                        <ProgressBar progress={isNaN(progress) ? 0 : progress} color={cancerColor} style={styles.progressBar} />
                        <Text style={styles.xpText}>{Math.floor(progress * 1000)} / 1000 XP</Text>
                        <Text style={styles.encouragement}>{t(`encouragement_messages.${message}`)}</Text>
                    </View> */}
                    <View style={{flexDirection: "row", flex: 2, justifyContent: "space-between", width: "90%", alignContent: "center", alignSelf: "center"}}>
                    <Pressable style={styles.card} onPress={() => router.push("/exercisePlan")}>
                        <FontAwesome6 name="person-running" size={36} color={cancerColor}/>
                        <Text style={styles.xpText1}>{t("exercises_name")}</Text>
                    </Pressable>
                    <AppointmentModal />
                    </View>
                    <View style={{flexDirection: "row", flex: 2, justifyContent: "space-between", width: "90%", alignContent: "center", alignSelf: "center"}}>
                    <Pressable style={styles.card} onPress={() => router.push("/historyPage")}>
                        <FontAwesome5 name="history" size={36} color={cancerColor} />
                        <Text style={styles.xpText1}>{t("history")}</Text>
                    </Pressable>
                    <Pressable onPress={showModal} style={styles.card}>
                            <Feather name="watch" size={36} color={cancerColor}/>
                            <Text style={styles.xpText1}>{t("watch")}</Text>
                    </Pressable>
                    </View>
                    <Pressable style={styles.card1} onPress={handleSymptomPress}>
                        <Text style={styles.levelText}>{t("symptom_evaluation")}</Text>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                        <AntDesign name="warning" size={25} color="orange" style={{marginRight: 10}} />
                        <Text style={styles.xpText}>{t("how_you_feeling")}</Text>
                        </View>
                    </Pressable>
                    <View style={{flexDirection: "row", flex: 2, justifyContent: "space-between", width: "90%", alignContent: "center", alignSelf: "center"}}>
                    <Pressable style={styles.card} onPress={() => 
                        Alert.alert(
                                  t("logout"),
                                  t("are_you_sure_logout"),
                                  [
                                    {
                                      text: t("cancel"),
                                      style: "cancel",
                                    },
                                    {
                                      text: t("logout"),
                                      onPress: () => {
                                        logout();
                                      },
                                    },
                                  ],
                                  { cancelable: true }
                                )
                    }>
                    <MaterialIcons name="logout" size={34} color={cancerColor}/>
                        <Text style={styles.xpText1}>{t("logout")}</Text>
                    </Pressable>
                    <Pressable onPress={() => i18n.changeLanguage(i18n.language === "en" ? "pt" : "en")} style={styles.card}>
                        {i18n.language === "pt" ? (
                            <View style={{position: 'relative', width: '100%', height: '100%'}}>
                                <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 15, right: 25, zIndex:2 }}>🇵🇹</Text>
                                <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 5, right: 15, zIndex:1 }}>🇬🇧</Text>
                            </View>
                            ) : (
                            <View style={{position: 'relative', width: '100%', height: '100%'}}>
                                <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 15, right: 25, zIndex:2 }}>🇬🇧</Text>
                                <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 5, right: 15, zIndex:1 }}>🇵🇹</Text>
                            </View>
                            )}
                            <Text style={styles.xpText1}>{i18n.language === "pt" ? "PT" : "EN"}</Text>
                    </Pressable>
                    </View>
                    </>
            </View>
            </>
            )}
            </>
            ) : (
                <>
                <View style={{ padding: 10, flexDirection: "column", justifyContent: "center", marginTop: insets.top + 120, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 10 }}>
                    <Text style={[styles.levelText, {color: cancerColor}]}>PASSiON CARE</Text>
                    <Text style={[{fontSize: 18, color: cancerColor}]}>{t("admin_panel")}</Text>
                </View>
                <View style={[styles.container, {marginTop: insets.top + 200}]}>
                    <AdminModal />
                </View></>
            )}
            {/* <TouchableOpacity style={[styles.card2, {marginTop: 50, width: "50%"}]} onPress={logout}>
                <View style={{flexDirection: "row", justifyContent: "center", width: "90%", alignSelf: "center"}}>
                        <Text style={[styles.levelText, {color: cancerColor}]}>{t("logout")}</Text>
                        <MaterialIcons name="logout" size={30} color={cancerColor}/>
                </View>
                      </TouchableOpacity> */}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
        justifyContent: "center",
        backgroundColor: "#F9FAFB",
    },
    card: {
        width: "45%",
        height: 120,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginBottom: 20,
        borderColor: "#845BB1",
        borderWidth: 1,
    },
    card1: {
        width: "90%",
        backgroundColor: "rgba(255,191,0,0.2)",
        paddingTop: 10,
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        marginBottom: 20,
        borderColor: "#845BB1",
        borderWidth: 1,
    },
    card2: {
        width: "90%",
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
        borderColor: "#845BB1",
        borderWidth: 1,
    },
    levelText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#845BB1",
    },
    progressBar: {
        width: 250,
        height: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    xpText: {
        fontSize: 18,
        color: "orange",
        marginBottom: 10,
    },
    xpText1: {
        fontSize: 18,
        color: "#845BB1",
        fontWeight: "bold",
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
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
      },
      text: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
      },
});
