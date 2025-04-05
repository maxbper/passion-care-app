import { Entypo } from "@expo/vector-icons";
import { Stack, usePathname } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import i18n from "../constants/translations";
import { useTranslation } from "react-i18next";
import React from "react";

export default function Header() {
    const { t } = useTranslation();
    const [color, setColor] = React.useState("#000");
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const isDontExercisePage = pathname === "/dontExercise";
    const awarenessRibbonColor = isLoginPage || isDontExercisePage;

    return (
        <Stack screenOptions={{ headerTransparent: true, headerTintColor: "#000",
            headerRight: () => (
              <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === "en" ? "pt" : "en")}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginRight: 15 }}>
                  {t("flag")}
                </Text>
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <Entypo name="awareness-ribbon" size={40} color={awarenessRibbonColor ? "white" : color} style={{ marginRight: 15 }} />
            ),
          }}
        />
    )
}