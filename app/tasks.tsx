import { Button, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { checkAuth } from "../services/authService";
import { fetchExercise, fetchWorkoutPlan } from "../services/dbService";

export default function TasksScreen() {
    const { t } = useTranslation();
    const [exerciseList, setExerciseList] = React.useState(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();
        
        const getWorkoutPlan = async () => {
            const wp = await fetchWorkoutPlan()

            const fetchedExercises = await Promise.all(
                wp.map(async (element) => {
                    const ex = await fetchExercise(element);
                    return ex;
                })
            );
        
            const filteredExercises = fetchedExercises.filter(Boolean);
            setExerciseList(filteredExercises);
        };
        getWorkoutPlan();

    } , []);

    return (
        <>
          <Stack.Screen options={{ headerTitle: t("tasksscreen_title") }} />
          <View style={styles.container}>
            {exerciseList && exerciseList.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{t("workout")}</Text>
                <View style={styles.grid}>
                  {exerciseList.map((exercise, index) => (
                    <TouchableOpacity key={index} style={styles.card}
                    onPress={() => router.push({
                        pathname: "/exercise",
                        params: {
                          exercise: JSON.stringify(exercise)
                        }
                      })}>
                      <Text style={styles.cardText}>{exercise.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color="#5A2A2A" />
            )}
          </View>
        </>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        marginTop: 50,
        alignItems: "center",
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      width: "38%",
      backgroundColor: "#FFF",
      padding: 20,
      borderRadius: 10,
      margin: 15,
      elevation: 3,
      alignItems: "center",
    },
    cardText: {
      fontSize: 16,
      color: "#333",
      fontWeight: "600",
      textAlign: "center",
    },
  });
  