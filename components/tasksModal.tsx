import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { CheckCircle2, Lock } from "lucide-react-native";
import { router } from "expo-router";
import { checkAuth } from "../services/authService";
import { fetchLastWorkoutDate, fetchWorkoutPlan, fetchExercise } from "../services/dbService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function TasksModal() {
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [lastDateChecked, setLastDateChecked] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
  const { t } = useTranslation();

  const handleWarmup = () => {
    // redirect to exercise screen with warmup exercises
    router.push({
        pathname: "/exercise",
        params: { workoutPlan: JSON.stringify(workoutPlan), warmup: "true" },
    });
  };

  const handleWorkout = () => {
    router.push({
        pathname: "/exercise",
        params: { workoutPlan: JSON.stringify(workoutPlan) },
    });
  };

  useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();

        const checkLastWorkoutDate = async () => {
            const lastWorkoutDate = await fetchLastWorkoutDate();
            if (lastWorkoutDate) {
                const currentDate = new Date();
                const lastDate = new Date(lastWorkoutDate);
              
                const isDifferentDay =
                  currentDate.getFullYear() !== lastDate.getFullYear() ||
                  currentDate.getMonth() !== lastDate.getMonth() ||
                  currentDate.getDate() !== lastDate.getDate();
              
                if (isDifferentDay) {
                  isWarmupCompleted();
                  setWorkoutCompleted(false);
                } else {
                  setWarmupCompleted(true);
                  setWorkoutCompleted(true);
                }
            } else {
                isWarmupCompleted();
                setWorkoutCompleted(false);
            }
        };
        if (!lastDateChecked) {
            checkLastWorkoutDate();
            setLastDateChecked(true);
        }

        const isWarmupCompleted = async () => {
            const warmupCompetedTime = await ReactNativeAsyncStorage.getItem("warmupCompletedTime");
            if (warmupCompetedTime) {
                const now = Date.now();
                if(now - parseInt(warmupCompetedTime, 10) <= 30 * 60 * 1000){ // 30 minutes
                    setWarmupCompleted(true);
                }
                else {
                    setWarmupCompleted(false);
                }
            } else {
                setWarmupCompleted(false);
            }
        }

        const getWorkoutPlan = async () => {
            const [wp, plan] = await fetchWorkoutPlan();

            const fetchedExercises = await Promise.all(
                wp.map(async (element) => {
                    if (element.substring(0,4) === "rest") {
                        const rest_time = element.substring(5);
                        const rest = {
                            exercise: "rest",
                            duration: parseInt(rest_time)
                        };
                        return rest;
                    }
                    const [name, attr] = await fetchExercise(element, plan);
                    const exercise = {
                        exercise: name,
                        duration: attr.duration? attr.duration : 0,
                        reps: attr.reps? attr.reps : 0,
                        sets: attr.sets? attr.sets : 0,
                    };
                    return exercise;
                })
            );
            setWorkoutPlan(fetchedExercises);
        };
        if(!workoutPlan.length) {
            getWorkoutPlan();
        }
    }, [lastDateChecked, workoutPlan]);

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
          <Block title="Warmup" onPress={handleWarmup} completed={warmupCompleted} />
          <Block
              title="Workout"
              onPress={handleWorkout}
              disabled={!warmupCompleted}
              completed={workoutCompleted} />
          <Block title="Extra" onPress={() => { } } />
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
