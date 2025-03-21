import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Entypo } from "@expo/vector-icons";

export default function BottomNav() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/home")} style={styles.button}>
        <Entypo name="home" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/home")} style={styles.button}>
        <Entypo name="user" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    flexDirection: "row",
    transform: [{ translateX: -60 }],
    backgroundColor: "#5A2A2A",
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
