import { View, TouchableOpacity, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Entypo, AntDesign, FontAwesome5 } from "@expo/vector-icons";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems : { name: string; route: any; library: any }[] = [
    { name: "tasks", route: "/profile", library: FontAwesome5 },
    { name: "home", route: "/home", library: Entypo },
    { name: "user", route: "/profile", library: AntDesign },
  ];

  return (
    <View style={[styles.container]}>
        {navItems.map((item, index) => {
        const IconComponent = item.library;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(item.route)}
            style={styles.button}
          >
            <IconComponent
              name={item.name}
              size={24}
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
