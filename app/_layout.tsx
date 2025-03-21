import { Stack, useSegments } from "expo-router";
import { Platform, TouchableOpacity, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Entypo } from "@expo/vector-icons";
import BottomNav from "../components/bottomNav";
import Sidebar from "../components/sidebar";
import React from "react";

export default function RootLayout() {
  const { t, i18n } = useTranslation();
  const segments = useSegments();
  const isLoginPage = segments[0] === "login";

  return (
    <View style={{ flex: 1, flexDirection: Platform.OS === "web" ? "row" : "column" }}>
    {Platform.OS === "web" && !isLoginPage && <Sidebar />}
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#5A2A2A" }, headerTintColor: "#fff" ,
            headerRight: () => (
              <TouchableOpacity onPress={() => i18n.changeLanguage(i18n.language === "en" ? "pt" : "en")}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginRight: 15 }}>
                  {t("flag")}
                </Text>
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <Entypo name="awareness-ribbon" size={40} color="white" style={{ marginRight: 15 }} />
            ),
          }}
        />
        {Platform.OS !== "web" && !isLoginPage && <BottomNav />}
        </View>
  );
}
