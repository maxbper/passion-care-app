import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";

export default function SidebarNav() {
  return (
    <View style={{ width: 80, backgroundColor: "#fff", height: "100%", paddingTop: 20 }}>
      {[
        { name: "home", label: "Home" },
        { name: "star", label: "Activity" },
        { name: "account", label: "Profile" },
      ].map((item) => (
        <TouchableOpacity key={item.name} style={{ alignItems: "center", marginVertical: 20 }}>
          <AntDesign name={item.name} size={30} color="#5A2A2A" />
          <Text style={{ fontSize: 12 }}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
