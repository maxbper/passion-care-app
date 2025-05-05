import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useUserColor } from "../context/cancerColor";

export default function SidebarNav() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isMod, setIsMod] = React.useState(false);
    const cancerColor = useUserColor();

    const navItemsUser: { name: string; label: string; route: any; library: any }[] = [];

    const navItemsAdmin: { name: string; label: string; route: any; library: any }[] = [
        { name: "home", label: t("homescreen_title"), route: "/home", library: Entypo },
        { name: "adduser", label: t("registerscreen_title"), route: "/register", library: AntDesign },
        { name: "users", label: "Dashboard", route: "/dashboard", library: Feather },
    ];

    let navItems = isAdmin || isMod ? navItemsAdmin : navItemsUser;

    useEffect(() => {
      const isAdminOrMod = async () => {
          const admin = await ReactNativeAsyncStorage.getItem("isAdmin");
          const mod = await ReactNativeAsyncStorage.getItem("isMod");
          setIsAdmin(admin === "true");
          setIsMod(mod === "true");
      };
      isAdminOrMod();

      navItems = isAdmin || isMod ? navItemsAdmin : navItemsUser;
    }, []);


  return (
    <View style={{ width: 80, backgroundColor: "#fff", height: "100%" , paddingTop: 20, justifyContent: "center"}}>
      {navItems.map((item, index) => {
              const IconComponent = item.library;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(item.route)}
                  style={{alignItems: "center", marginVertical: 20 }}
                >
                  <IconComponent
                    name={item.name}
                    size={24}
                    color={pathname === item.route ? cancerColor : "grey"}
                  />
                  <Text style={{ fontSize: 12 , textAlign: "center"}}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
    </View>
  );
}
