import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { logout } from "../services/authService";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No user data found!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <View style={styles.container}>
    <Stack.Screen options={{ headerTitle: t("profilescreen_title") }} />
      {userData ? (
        <View style={styles.card}>
          <Text style={styles.label}>{t("name")}: </Text><Text style={styles.value}>{userData.name}</Text>
          <Text style={styles.label}>{t("age")}: </Text><Text style={styles.value}>{userData.age}</Text>
          <Text style={styles.label}>{t("email")}: </Text><Text style={styles.value}>{userData.email}</Text>
          <Text style={styles.label}>{t("cancerType")}: </Text><Text style={styles.value}>{userData.cancerType}</Text>
        </View>
      ) : (
        <Text>{t("loading_user_data")}.</Text>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <MaterialIcons name="logout" size={24} color="#5A2A2A"/>
        <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F5F5F5",
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