import { Alert, Button, Platform, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { DailyWellBeingForm } from "../components/feedbackModal";
import { showDailyWarning } from "../services/authService";
import WeeklyHealthAssessment from "../components/weeklyForm";

export default function HomeScreen() {
    const { t } = useTranslation();

    useEffect(() => {
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
        <View>
        {<WeeklyHealthAssessment />}
        </View>
        </>
        );
}