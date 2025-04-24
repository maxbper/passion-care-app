import { Entypo } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import { TouchableOpacity, Text, Button, View } from "react-native";
import i18n from "../constants/translations";
import { useTranslation } from "react-i18next";
import React from "react";
import { useProfileModal } from "../context/ProfileModalContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
    const { t } = useTranslation();
    const [color, setColor] = React.useState("#000");
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const isDontExercisePage = pathname === "/dontExercise";
    const awarenessRibbonColor = isLoginPage || isDontExercisePage;
    const { showModal } = useProfileModal();
    const insets = useSafeAreaInsets();

    return (
      <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", marginTop: insets.top, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 10 }}>
      <Entypo name="awareness-ribbon" size={40} color={awarenessRibbonColor ? "white" : color} style={{ marginRight: 15 }} />
      <TouchableOpacity onPress={showModal}>
      <Entypo name="dots-three-vertical" size={20} color="black" style={{ marginRight: 15 }} />
      </TouchableOpacity>
    </View>
    )
}

{/* <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === "en" ? "pt" : "en")}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginRight: 15 }}>
                  {t("flag")}
                </Text>
              </TouchableOpacity> */}