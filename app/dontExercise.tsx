import { Alert, Button, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth } from "../services/authService";
import { fetchIsSuspended } from "../services/dbService";
import { useUserColor } from "../context/cancerColor";

export default function DontExerciseScreen() {
    const { t } = useTranslation();
    const cancerColor = "#845BB1";

    useEffect(() => {
            const checkAuthentication = async () => {
                await checkAuth();
            };
            checkAuthentication();

            const checkIsSuspended = async () => {
                const isSuspended = await fetchIsSuspended();
                if (!isSuspended) {
                    router.replace("/home");
                }
            }
            checkIsSuspended();
        const interval = setInterval(checkIsSuspended, 60000);
        return () => clearInterval(interval);
        }
    , []);

    return (
        <>
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#845BB1",
            }}
        >
        <Text style={{color: "white", padding: 20, fontSize: 20, textAlign: "center"}}>{t("dont_exercise")}</Text>
        <Button
            title={t("back")}
            onPress={() => {
                router.replace("/home");
            }
            }
        />
        </View>
        </>
        );
}