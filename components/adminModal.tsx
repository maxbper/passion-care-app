import React, { useEffect, useState } from "react";
import { Text, Pressable, StyleSheet, Platform } from "react-native";
import { CheckCircle2, Lock } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { logout } from "../services/authService";
import i18n from "../constants/translations";

export default function AdminModal() {
  const { t } = useTranslation();

const Block = ({
    title,
    onPress,
    disabled,
    completed,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    completed?: boolean;
  }) => {
    let containerStyle = [styles.block];
    if (completed) {
      containerStyle.push(styles.completed);
    } else if (disabled) {
      containerStyle.push(styles.disabled);
    }

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || completed}
        style={containerStyle}
      >
        <Text style={styles.blockText}>{title}</Text>
        {completed ? (
          <CheckCircle2 size={28} color="#22c55e" />
        ) : disabled ? (
          <Lock size={24} color="#6b7280" />
        ) : null}
      </Pressable>
    );
  };


  return (
    <>
        <Block title={t("register")} onPress={() => router.push("/register")} />
        <Block title="Dashboard" onPress={() => router.push("/dashboard")} />
        {Platform.OS === "web" && (
        <>
        <Block title={t("change_language") + " " + t("flag")} onPress={() => i18n.changeLanguage(i18n.language === "en" ? "pt" : "en")} />
        <Block title={t("logout")} onPress={logout} />
        </>
        )}
    </>
  );

}

  const styles = StyleSheet.create({
    block: {
      alignSelf: "center",
      padding: 20,
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      width: "90%",
    },
    blockText: {
      fontSize: 18,
      fontWeight: "600",
    },
    completed: {
      backgroundColor: "#DCFCE7",
      borderWidth: 2,
      borderColor: "#4ADE80",
    },
    disabled: {
      backgroundColor: "#E5E7EB",
    },
  });
  