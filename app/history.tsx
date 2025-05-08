import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, FlatList, ScrollView, Dimensions, TextInput } from "react-native";
import { AntDesign, FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { checkAuth, logout } from "../services/authService";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { fetchClinicalRegister, fetchUserData, fetchWeeklyForms, fetchWorkouts, setIsSuspended, uploadClinicalRegister } from "../services/dbService";
import { useUserColor } from "../context/cancerColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const [userData, setUserData] = useState(null);
  const { t } = useTranslation();
  const cancerColor = useUserColor();
  const { uid, forms, workouts, clinical } = useLocalSearchParams();
  const userId = uid ? JSON.parse(uid as string) : false;
  const isFormsHistory = forms ? JSON.parse(forms as string) : false;
  const isWorkoutHistory = workouts ? JSON.parse(workouts as string) : false;
  const isClinicalHistory = clinical ? JSON.parse(clinical as string) : false;
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const [functionalOrHealth, setFunctionalOrHealth] = useState(true);
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [newClinicalText, setNewClinicalText] = useState("");
  const colors = ["#3BC300", "#D5D500", "#D58100", "#D50300"];

  useEffect(() => {
    const checkAuthentication = async () => {
        await checkAuth();
    };
    checkAuthentication();

    const getUserData = async () => {
      if (userId) {
        if(isFormsHistory) {
          const data = await fetchWeeklyForms(userId);
          if (data.length === 0) {
            setUserData(null);
          }
        else {
            setUserData(data);
            setCurrentIndex(data.length - 1);
          }
        }
        else if(isWorkoutHistory) {
          const data = await fetchWorkouts(userId);
          if (data.length !== 0) {
            setUserData(data);
            setCurrentIndex(data.length - 1);
          }
        }
        else if(isClinicalHistory) {
          const data = await fetchClinicalRegister(userId);
          setUserData(data);
          setCurrentIndex(data.length - 1);
        }
      }
    }

    getUserData();
  }, [showClinicalModal]);

  useEffect(() => {
    setFunctionalOrHealth(true);

  }, [currentIndex]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });
  };

  const parseMillisecondsToMinutes = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
      if (seconds > 0) {
        return `${minutes+1}m`;
      }
      else {
        return `${minutes}m`;
      }
    }

  const handleAddClinicalRegister = async () => {
    await uploadClinicalRegister(userId, newClinicalText);

    setShowClinicalModal(false);
    setNewClinicalText("");
  }
  
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
    if(isFormsHistory) {

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
    }
    else if(isWorkoutHistory) {
        return (
            <View style={[styles.card, { alignItems: "center"}]}>
            
            <Text style={{ fontSize: 20, fontWeight: "bold" , color: cancerColor}}>
            {t(`workout_plans.${userData[currentIndex].workout_plan}`)}
            </Text>
            <Text style={[styles.label, { textAlign: "center", fontWeight: "bold", fontSize: 18}]}>
            {t("total_time")} {parseMillisecondsToMinutes(userData[currentIndex].time)}
            </Text>
            <Text style={[styles.label, { textAlign: "center", fontSize: 16}]}>
            {t("time_hr")}
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 20, width: "100%", borderWidth: 1, borderColor: "grey", borderRadius: 10, paddingBottom: 15, padding: 5, alignContent: "center", justifyContent: "center"}}>
                {userData[currentIndex].heart_rate.map((item, index) => (
                    <View style={{ flex: 1, flexDirection: "column", alignItems: 'center' }} key={index}>
                    <Text style={[styles.label, { textAlign: "center", fontSize: 12, color: item.minutes > 0 ? colors[index] : "grey"}]}>
                        {item.max} bpm
                    </Text>
                    <Text style={[styles.label, { textAlign: "center", color: item.minutes > 0 ? colors[index] : "grey", fontSize: 16}]}>
                        {item.minutes}m
                    </Text>
                    <Text style={[styles.label, { textAlign: "center", fontSize: 12, color: item.minutes > 0 ? colors[index] : "grey"}]}>
                        {item.min} bpm
                    </Text>
                    </View>
                ))}
        </View>
        <Text style={{ fontSize: 14,}}>
        {t("feedback.title")}
            </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold" , color: cancerColor}}>
            {t(`feedback.${userData[currentIndex].feedback}`)}
            </Text>
        </View>
        );
    }
    else if(isClinicalHistory) {
        return (
        <View style={{ width: "100%", height: Dimensions.get("window").height - (insets.top + 250), marginBottom: 20, alignItems: "center"}}>
        {userData.map((item, index) => (
            <View style={[styles.card]} key={index}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {formatDate(item.date)}
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 8, width: "100%" }}>
                <Text style={[styles.label, { textAlign: "left"}]}>
                {item.text}
                </Text>
            </View>
        </View>
        ))}
        </View>
        );
    }
  };

 if(isFormsHistory) {
  return (
    <>
    <View style={[styles.container, { marginTop: insets.top + 100 }]}>
    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                {t("forms")}
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
        <View style={[styles.card, { alignItems: "center", justifyContent: "center", marginTop: 20}]}>
            <Text style={{ fontSize: 14, textAlign: "center" }}>
                {t("no_forms")}
            </Text>
        </View>
        </>
      )}
      
    </View>
    </>
  );
}

if(isWorkoutHistory) {
    return (
        <>
        <View style={[styles.container, { marginTop: insets.top + 100 }]}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                    {t("workouts")}
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

 if(isClinicalHistory) {
    return (
        <>
        <View style={[styles.container, { marginTop: insets.top + 100 }]}>
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
                    {t("clinical_registers")}
                </Text>
          {userData ? (
            <>
            <AnswersBlock/>
            <Pressable
            onPress={() => {setShowClinicalModal(true)}}
            style={{backgroundColor: "#DCFCE7",
                borderColor: "#4ADE80",
                borderWidth: 2,borderRadius: 30,
                height: 60,
                width: 60,
                marginHorizontal: 5,
                alignItems: "center",
                justifyContent: "center",}}
            >
                <AntDesign name="plus" size={24} color="#4ade80" />
            </Pressable>
            </>
              ) : (
            <>
            <ActivityIndicator size="large" color={cancerColor} style={styles.loader} />
            </>
          )}
        </View>
        {showClinicalModal && (
            <Pressable style={styles.modalContainer} onPress={() => {setShowClinicalModal(false); setNewClinicalText("")}}>
                <View style={styles.modalContent}>
                    <View style={styles.input}>
                    <TextInput
                            style={{}}
                            placeholder={t("new_clinical_register")}
                            value={newClinicalText}
                            onChangeText={(text) => {setNewClinicalText(text)}}
                            />
                        </View>
                </View>
                <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: cancerColor, borderRadius: 30 }]} onPress={handleAddClinicalRegister}>
                            <AntDesign name="plus" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
            </Pressable>
          )}
        </>
      );
}
}

const styles = StyleSheet.create({
container: {
    marginTop: 40,
    marginBottom: 50,
    alignItems: "center",
},
modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    zIndex: 949,
},
modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    paddingVertical: 20,
    zIndex: 950,
    marginBottom: 20,
},
button: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    margin: 5,
    height: 50,
    width: 50,
},
buttonContainer: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
},
buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    width: "80%",
    height: 100,
    justifyContent: "flex-start",
    zIndex: 951,
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
card2: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: "flex-start",
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