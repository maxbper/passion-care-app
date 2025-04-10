import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SidebarNav() {
    const { t } = useTranslation();
    const pathname = usePathname();

    const navItems: { name: string; label: string; route: any; library: any }[] = [
        { name: "home", label: t("homescreen_title"), route: "/home", library: Entypo },
        { name: "tasks", label: t("tasksscreen_title"), route: "/tasks", library: FontAwesome5 },
        { name: "user", label: t("profilescreen_title"), route: "/profile", library: AntDesign },
        ];

  return (
    <View style={{ width: 80, backgroundColor: "#fff", height: "100%" , paddingTop: 20, justifyContent: "center"}}>
      {navItems.map((item, index) => {
              const IconComponent = item.library;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => router.push(item.route)}
                  style={{alignItems: "center", marginVertical: 20 }}
                  disabled={pathname === item.route}
                >
                  <IconComponent
                    name={item.name}
                    size={24}
                    color={pathname === item.route ? "#5A2A2A" : "grey"}
                  />
                  <Text style={{ fontSize: 12 , textAlign: "center"}}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
    </View>
  );
}
