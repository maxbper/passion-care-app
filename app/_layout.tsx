import { Slot, usePathname } from "expo-router";
import { Platform, ScrollView, View } from "react-native";
import BottomNav from "../components/bottomNav";
import Sidebar from "../components/sidebar";
import React from "react";
import Header from "../components/header";
import ProfileModal from "../components/profileModal";
import { ProfileModalProvider, useProfileModal } from "../context/ProfileModalContext";
import UserBasedDetailColorProvider from "../context/cancerColorProvider";

function LayoutContent() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDontExercisePage = pathname === "/dontExercise";
  const isHomePage = pathname === "/home";
  const isExercisePage = pathname === "/exercise";
  const page = isLoginPage || isDontExercisePage || isHomePage || isExercisePage;
  const { isVisible, hideModal } = useProfileModal();

  return (
    <>
    <View style={{ flex: 1, flexDirection: Platform.OS === "web" ? "row" : "column", backgroundColor: "#F9FAFB" }}>
      <Header />
      {Platform.OS !== "web" && !isLoginPage && !isDontExercisePage && !isHomePage && <BottomNav />}
      {Platform.OS === "web" && !isLoginPage && <Sidebar />}
      {!page ? (
      <ScrollView>
      <Slot />
      </ScrollView>
      ) : (
        <Slot />
      )}
    </View>
    {Platform.OS !== "web" && <ProfileModal visible={isVisible} onClose={hideModal} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <UserBasedDetailColorProvider>
    <ProfileModalProvider>
      <LayoutContent />
    </ProfileModalProvider>
    </UserBasedDetailColorProvider>
  );
}