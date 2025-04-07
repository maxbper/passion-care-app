import { Alert, Button, Platform, Text, View, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAdmin, checkAuth, showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";
import { fetchWorkoutPlan } from "../services/dbService";

export default function HomeScreen() {
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

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
        checkDailyWarning();
      }, []);


    return (
        <>
        <Stack.Screen options={{ headerTitle: t("homescreen_title") }} />
        <View style={styles.container}>
        {<WeeklyHealthAssessment />}
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