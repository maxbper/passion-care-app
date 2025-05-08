import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { checkAuth, logout } from "../services/authService";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { fetchUserData, setIsSuspended } from "../services/dbService";
import { useUserColor } from "../context/cancerColor";
import { CheckCircle2, Lock, Unlock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const { t } = useTranslation();
  const cancerColor = useUserColor();
  const { uid } = useLocalSearchParams();
  const userId = uid ? JSON.parse(uid as string) : false;
  const [showClinicalDetails, setShowClinicalDetails] = useState(false);
  const [isSuspended, setSuspended] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAuthentication = async () => {
        await checkAuth();
    };
    checkAuthentication();

    const getUserData = async () => {
      if (userId) {
        const data = await fetchUserData(userId);
        setUserData(data);
        setSuspended(data.suspended);
      }
      else {
        const data = await fetchUserData();
        setUserData(data);
        setSuspended(data.suspended);
      }
      
    }

    getUserData();
  }, [isSuspended]);

  const LockToggle = ({locked }) => {
    return (
      <Pressable style={styles.lockContainer} onPress={() => {
        setIsSuspended(!locked, userId);
        setSuspended(!locked);
        }}>
        {locked ? (
          <Lock size={24} color="#ef4444" />
        ) : (
          <Unlock size={24} color="#22c55e" />
        )}
      </Pressable>
    );
  };

  const ButtonBlock = ({
      onPress,
      add,
      close
    }: {
      onPress: () => void;
      add?: boolean;
      close?: boolean;
    }) => {
      let containerStyle = [styles.dateBox];
      if (add) {
        containerStyle.push(styles.dateBox, styles.addBox);
      }
      else if (close) {
        containerStyle.push(styles.dateBox, styles.closeBox);
      }
  
      return (
        <Pressable
          onPress={onPress}
          style={containerStyle}
        >
          {add ? (
            <AntDesign name="plus" size={24} color="#4ade80" />
          ) : close ? (
            <AntDesign name="close" size={24} color="#ef4444" />
          ) : null}
        </Pressable>
      );
    };

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
    <View style={[styles.container, {marginTop: insets.top + 80}]}>
      {userData ? (
        <>
        <View style={{ flexDirection: "row" }}>
        <Text style={{color: cancerColor, fontSize: 30, fontWeight: "bold", marginBottom: 20, marginRight: 10}}>{userData.name}</Text>
        <LockToggle locked={isSuspended} />
        </View>
          {!showClinicalDetails ? (
            <>
            <View style={styles.card}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
            <Text style={styles.label}>{t("age")}: </Text>
            <Text style={styles.value}>{userData.age}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.label}>{t("gender")}: </Text>
            <Text style={styles.value}>{t(`${userData.gender}`)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.label}>{t("email")}: </Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>
        <View style={{ flexDirection: "row"}}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
            <Text style={styles.label}>{t("height")}: </Text>
            <Text style={styles.value}>{userData.height}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.label}>{t("weight")}: </Text>
            <Text style={styles.value}>{userData.weight}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.label}>{t("workout")}: </Text>
          <Text style={styles.value}>{t(`workout_plans.${userData.workout_plan}`)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.label}>{t("cancer_type")}: </Text>
          <Text style={styles.value}>{t(`cancer.${userData.cancer_type}`)}</Text>
        </View>
        </View>
        <Block title={t("clinical_details")} onPress={() => {setShowClinicalDetails(!showClinicalDetails)}} />
        <Block title={t("clinical_registers")} onPress={() => router.push({pathname: "/history", params: { uid: JSON.stringify(userId), clinical: "true" }})} />
        <Block title={t("forms")} onPress={() => router.push({pathname: "/history", params: { uid: JSON.stringify(userId), forms: "true" }})} />
        <Block title={t("workouts")} onPress={() => router.push({pathname: "/history", params: { uid: JSON.stringify(userId), workouts: "true" }})} />
        </>
          ) : (
            <>
          <View style={[styles.card, {alignItems: "flex-start"}]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("previous_cipn_diagnosis")}: </Text>
          <Text style={styles.value}>{t(`${userData.previous_cipn_diagnosis}`)}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("neurotoxic_agents")}: </Text>
          <Text style={styles.value}>{userData.neurotoxic_agent}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("chemo_goal")}: </Text>
          <Text style={styles.value}>{userData.chemo_goal}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("chemo_protocol")}: </Text>
          <Text style={styles.value}>{userData.chemo_protocol}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("exercise_history")}: </Text>
          <Text style={styles.value}>{userData.exercise_history}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("exercise_preferences")}: </Text>
          <Text style={styles.value}>{userData.exercise_preferences}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("medical_history")}: </Text>
          <Text style={styles.value}>{userData.medical_history}</Text>
        </View>
        <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <Text style={styles.label}>{t("usual_medications")}: </Text>
          <Text style={styles.value}>{userData.usual_medication}</Text>
        </View>
        </View>
        <ButtonBlock
          onPress={() => setShowClinicalDetails(!showClinicalDetails)}
          close={true}
        />
        </>
          )}
          </>
      ) : (
        <>
        <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
        </>
      )}
      
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
      marginBottom: 20,
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
      marginTop: 12,
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
      lockContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      },
      radioContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      outerCircle: {
        height: 18,
        width: 18,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#333",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
      },
      innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 6,
        backgroundColor: "#333",
      },
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
      dateBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 30,
        height: 60,
        width: 60,
        marginHorizontal: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    addBox: {
      backgroundColor: "#DCFCE7",
      borderColor: "#4ADE80",
      borderWidth: 2,
    },
    closeBox: {
      backgroundColor: "#fee2e2",
      borderColor: "#ef4444",
      borderWidth: 2,
    },
  });