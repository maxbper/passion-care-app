import { View, TouchableOpacity, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Entypo, AntDesign, FontAwesome5, Feather } from "@expo/vector-icons";
import { t } from "i18next";
import React, { useEffect } from "react";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isMod, setIsMod] = React.useState(false);

  const navItemsUser : { name: string; route: any; library: any }[] = [
    { name: "tasks", route: "/tasks", library: FontAwesome5 },
    { name: "home", route: "/home", library: Entypo },
    { name: "user", route: "/profile", library: AntDesign },
  ];

  const navItemsAdmin: { name: string; label: string; route: any; library: any }[] = [
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


    if (pathname === "/exercise") {
        return null;
    }
    
  return (
    <View style={[styles.container]}>
        {navItems.map((item, index) => {
        const IconComponent = item.library;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.route)}
            style={styles.button}
            disabled={pathname === item.route}
          >
            <IconComponent
              name={item.name}
              size={pathname === item.route ? 29 : 24}
              color={pathname === item.route ? "#5A2A2A" : "grey"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  button: {
    marginHorizontal: 10,
  },
});
