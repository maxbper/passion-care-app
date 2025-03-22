import { Entypo } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import i18n from "../constants/translations";
import { useTranslation } from "react-i18next";

export default function Header() {
    const { t } = useTranslation();

    return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: "#5A2A2A" }, headerTintColor: "#fff",
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
    )
}