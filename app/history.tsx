import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, FlatList } from "react-native";
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { checkAuth, logout } from "../services/authService";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { fetchUserData, fetchWeeklyForms, setIsSuspended } from "../services/dbService";
import { useUserColor } from "../context/cancerColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const [userData, setUserData] = useState(null);
  const { t } = useTranslation();
  const cancerColor = useUserColor();
  const { uid, forms, workouts } = useLocalSearchParams();
  const userId = uid ? JSON.parse(uid as string) : false;
  const isFormsHistory = forms ? JSON.parse(forms as string) : false;
  const isWorkoutHistory = workouts ? JSON.parse(workouts as string) : false;
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const [functionalOrHealth, setFunctionalOrHealth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
        await checkAuth();
    };
    checkAuthentication();

    const getUserData = async () => {
      if (userId) {
        if(isFormsHistory) {
          const data = await fetchWeeklyForms(userId);
          setUserData(data);
          setCurrentIndex(data.length - 1);
        }
        else if(isWorkoutHistory) {
          const data = null; //await fetchWorkouts(userId);
          setUserData(data);
        }
      }
    }

    getUserData();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });
  };
  
  const Block = ({
    title,
    onPress,
    completed,
    inactive,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    completed?: boolean;
    inactive?: boolean;
  }) => {
    let containerStyle = [styles.dateBox];
    if (completed) {
      containerStyle.push(styles.dateBox, styles.selectedBox);
    }
    else if (inactive) {
        containerStyle.push(styles.dateBox, styles.inactiveBox);
    }

    return (
      <Pressable
        onPress={onPress}
        disabled={completed || inactive}
        style={containerStyle}
      >
        <Text style={styles.blockText}>{title}</Text>
      </Pressable>
    );
  };

  const AnswersBlock = ({}: {}) => {

    if(!functionalOrHealth) {
        return (
            <View style={[styles.card, { alignItems: "center"}]}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {t("weekly_functional_assessment.title")}
            </Text>
            {userData[currentIndex].functional_answers.map((item, index) => (
            <View style={{ flexDirection: "row", marginBottom: 8, width: "100%" }} key={index}>
            <View style={{ flex: 9 }}>
            <Text style={[styles.label, { textAlign: "left"}]}>
                {t(`weekly_functional_assessment.questions.${index}`)}
            </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center", marginTop: 5 }}>
            {typeof item === "string" ? (
                <FontAwesome6 name={item} size={20} color={cancerColor} />
            ) : (
                <FontAwesome name={item ? "check-circle" : "times-circle"} size={20} color={item ? "#22c55e" : "#ef4444"} />
            )}
            </View>
        </View>
            ))}
        </View>
        );
    }
    else {
        return (
            <View style={[styles.card, { alignItems: "center"}]}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {t("weekly_health_assessment.title")}
            </Text>
            {userData[currentIndex].heatlh_answers.map((item, index) => (
            <View style={{ flexDirection: "row", marginBottom: 8, width: "100%" }} key={index}>
            <View style={{ flex: 9 }}>
            <Text style={[styles.label, { textAlign: "left"}]}>
                {t(`weekly_health_assessment.questions.${index}`)}
            </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center", marginTop: 5 }}>
                <FontAwesome name={item ? "check-circle" : "times-circle"} size={20} color={item ? "#22c55e" : "#ef4444"} />
            </View>
        </View>
            ))}
        </View>
        );
    }
  };


  return (
    <>
    <View style={[styles.container, { marginTop: insets.top + 100 }]}>
    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {isFormsHistory ? t("forms") : t("workouts")}
            </Text>
      {userData ? (
        <>
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
        {!userData[currentIndex + 1] && userData[currentIndex - 2] && (
            <TouchableOpacity onPress={() => setCurrentIndex(i => i - 2)}>
            <Text style={{ color: "gray", marginHorizontal: 10 }}>{formatDate(userData[currentIndex - 2].date)}</Text>
            </TouchableOpacity>
        )}

        {userData[currentIndex - 1] && (
            <TouchableOpacity onPress={() => setCurrentIndex(i => i - 1)}>
            <Text style={{ color: "gray", marginHorizontal: 10 }}>{formatDate(userData[currentIndex - 1].date)}</Text>
            </TouchableOpacity>
        )}
        
        <Text style={{ fontWeight: "bold", marginHorizontal: 10 }}>{formatDate(userData[currentIndex].date)}</Text>

        {userData[currentIndex + 1] && (
            <TouchableOpacity onPress={() => setCurrentIndex(i => i + 1)}>
            <Text style={{ color: "gray", marginHorizontal: 10 }}>{formatDate(userData[currentIndex + 1].date)}</Text>
            </TouchableOpacity>
        )}

        {!userData[currentIndex - 1] && userData[currentIndex + 2] && (
            <TouchableOpacity onPress={() => setCurrentIndex(i => i + 2)}>
            <Text style={{ color: "gray", marginHorizontal: 10 }}>{formatDate(userData[currentIndex + 2].date)}</Text>
            </TouchableOpacity>
        )}
        </View>
        <AnswersBlock/>
        <Text style={{marginBottom: 20, fontWeight: "bold", fontSize: 20, color: cancerColor}}>{t(`workout_plans.${userData[currentIndex].decision}`)}</Text>
        <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
            <View style={{ width: "50%" }}>
            <Block
              title={t("weekly_functional_assessment.type")}
              onPress={() => {setFunctionalOrHealth(false)}}
              completed={!functionalOrHealth}
              inactive={!userData[currentIndex].functional_answers}
            />
            </View>
            <View style={{ width: "50%" }}>
            <Block
              title={t("weekly_health_assessment.type")}
              onPress={() => {setFunctionalOrHealth(true)}}
              completed={functionalOrHealth}
              inactive={!userData[currentIndex].heatlh_answers}
            />
            </View>
        </View>
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
    marginTop: 40,
    alignItems: "center",
},
loader: {
    flex: 1,
    alignSelf: "center",
},
label: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#555",
    marginTop: 12,
  },
card: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: "flex-start",
    marginBottom: 20,
},
list: {
    paddingHorizontal: 10,
},
dateBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: "center",
},
selectedBox: {
    borderColor: "#4CAF50",
},
dateText: {
    color: "#888",
    fontWeight: "bold",
},
selectedText: {
    color: "#000",
},
underline: {
    height: 4,
    backgroundColor: "#4CAF50",
    width: "100%",
    marginTop: 4,
    borderRadius: 2,
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
    fontSize: 14,
    fontWeight: "600",
  },
  completed: {
    backgroundColor: "#DCFCE7",
    borderWidth: 2,
    borderColor: "#4ADE80",
  },
  inactiveBox: {
    backgroundColor: "#E5E7EB",
  },
});