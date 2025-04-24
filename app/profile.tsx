import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { checkAuth, logout } from "../services/authService";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { fetchUserData } from "../services/dbService";
import { useUserColor } from "../context/cancerColor";

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const { t } = useTranslation();
  const cancerColor = useUserColor();

  useEffect(() => {
    const checkAuthentication = async () => {
        await checkAuth();
    };
    checkAuthentication();

    const getUserData = async () => {
      const data = await fetchUserData();
      setUserData(data);
    }

    getUserData();
  }, []);

  return (
    <>
    <Stack.Screen />
    <View style={styles.container}>
    <Stack.Screen options={{ headerTitle: t("profilescreen_title") }} />
      {userData ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t("name")}: </Text><Text style={styles.value}>{userData.name}</Text>
          <Text style={styles.label}>{t("age")}: </Text><Text style={styles.value}>{userData.age}</Text>
          <Text style={styles.label}>{t("email")}: </Text><Text style={styles.value}>{userData.email}</Text>
        </View>
      ) : (
        <>
        <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
        </>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialIcons name="logout" size={24} color={cancerColor}/>
        <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F9FAFB",
      padding: 20,
    },
    loader: {
      flex: 1,
      alignSelf: "center",
    },
    card: {
      width: "90%",
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 10,
      elevation: 5,
      alignItems: "center",
    },
    label: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
      marginTop: 10,
    },
    value: {
      fontSize: 16,
      color: "#555",
    },
    error: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
    },
    logoutButton: {
        marginTop: 60,
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        elevation: 3,
        alignItems: "center",
      },
      logoutText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "bold",
      },
  });