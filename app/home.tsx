import { Alert, Button, Platform, Text, View, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
    const { t } = useTranslation();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isMod, setIsMod] = React.useState(false);

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
            if (await showDailyWarning()) {
                if (Platform.OS === "web") {
                    alert(t("warning") + ": " + t("daily_warning"));
                } else {
                    Alert.alert(
                        t("warning"),
                        t("daily_warning"),
                        [
                            {
                            text: t("no"),
                            onPress: () => router.replace("/dontExercise"),
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
        if (isAdmin || isMod) {
            checkDailyWarning();
        }
      }, []);


    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View style={styles.container}>
        {!isAdmin && !isMod && <WeeklyHealthAssessment />}
        <Text>Level of the user, step count, some progress bar, and some message of encouragement</Text>
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