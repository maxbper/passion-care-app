import { usePathname } from "expo-router";
import { Platform, View } from "react-native";
import BottomNav from "../components/bottomNav";
import Sidebar from "../components/sidebar";
import React from "react";
import Header from "../components/header";

export default function RootLayout() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <View style={{ flex: 1, flexDirection: Platform.OS === "web" ? "row" : "column" , backgroundColor: "#fff" }}>
    {Platform.OS === "web" && !isLoginPage && <Sidebar />}
      {<Header />}
        {Platform.OS !== "web" && !isLoginPage && <BottomNav/>}
        </View>
  );
}
