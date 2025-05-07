import { View, TouchableOpacity, StyleSheet, Pressable, Text } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Entypo, AntDesign, FontAwesome5, Feather } from "@expo/vector-icons";
import { t } from "i18next";
import React, { useEffect } from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useUserColor } from "../context/cancerColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNav() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isMod, setIsMod] = React.useState(false);

    useEffect(() => {
        const isAdminOrMod = async () => {
            const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
            const mod = await ReactNativeAsyncStorage.getItem("isMod");
            setIsAdmin(admin === "true");
            setIsMod(mod === "true");
        };
        isAdminOrMod();
  
      }, []);

    if (!isAdmin && !isMod) {
        return null;
    }
    
  return (
    <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", marginTop: insets.top + 50, alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, height: 80, zIndex: 995 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
                    <Text style={{ fontSize: 20 }}>{"<"}</Text>
                  </Pressable>
    </View>
  );
}

