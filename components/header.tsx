import { Entypo } from "@expo/vector-icons";
import { router, Stack, usePathname } from "expo-router";
import { TouchableOpacity, Text, Button, View, Platform, Alert } from "react-native";
import i18n from "../constants/translations";
import { useTranslation } from "react-i18next";
import React from "react";
import { useProfileModal } from "../context/ProfileModalContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserColor } from "../context/cancerColor";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet } from "react-native";
import { logout } from "../services/authService";

export default function Header() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const isDontExercisePage = pathname === "/dontExercise";
    const isExercisePage = pathname === "/exercise";
    const isHomePage = pathname === "/home";
    const awarenessRibbonColor = isLoginPage || isDontExercisePage;
    const dontShowModal = isLoginPage || isDontExercisePage || isExercisePage || Platform.OS === "web";
    const { showModal } = useProfileModal();
    const insets = useSafeAreaInsets();
    const cancerColor = useUserColor();

    const handleHomeButtonPress = async () => {
      if (isLoginPage || isDontExercisePage) {
        return;
      }
      const isAdmin = await ReactNativeAsyncStorage.getItem("isAdmin");
      const isMod = await ReactNativeAsyncStorage.getItem("isMod");

    if (!isHomePage) {
        router.push("/home");
      }

      if (isAdmin === "true" || isMod === "true") {
        if (isHomePage) {
          logout();
        }
      }
    };


    const changeLanguage = () => {
      i18n.changeLanguage(i18n.language === "en" ? "pt" : "en");
    };

    return (
      <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", marginTop: insets.top, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 60, zIndex: 10 }}>
      <TouchableOpacity onPress={() => handleHomeButtonPress()}>
      <Entypo name="awareness-ribbon" size={40} color={awarenessRibbonColor ? "white" : (cancerColor === "#000000" ? "white" : cancerColor)} style={{ marginRight: 15, textShadowColor:'black', textShadowOffset: { width: 0.01, height: 0.01 }, textShadowRadius: 1, }} />
      </TouchableOpacity>
       {/* {!dontShowModal && (
        <TouchableOpacity onPress={showModal}>
        <Entypo name="dots-three-vertical" size={20} color="black" style={{ marginRight: 15 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={changeLanguage} style={[styles.button, { borderTopLeftRadius: 50, borderTopRightRadius: 0 }]}>
        {i18n.language === "pt" ? (
          <View style={{position: 'relative', width: '100%', height: '100%'}}>
              <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 35, right: 25, zIndex:2 }}>🇵🇹</Text>
              <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 25, right: 15, zIndex:1 }}>🇬🇧</Text>
          </View>
          ) : (
            <View style={{position: 'relative', width: '100%', height: '100%'}}>
              <Text style={{position: 'absolute', fontSize: 35, opacity: 1, top: 35, right: 25, zIndex:2 }}>🇬🇧</Text>
              <Text style={{position: 'absolute', fontSize: 25, opacity: 0.3, top: 25, right: 15, zIndex:1 }}>🇵🇹</Text>
          </View>
          )}
      </TouchableOpacity>
      )} */}
    </View>
    )
}


const styles = StyleSheet.create({
  button: {
    marginVertical: -1,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});