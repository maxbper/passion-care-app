import { Button, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { checkAuth } from "../services/authService";
import { fetchExercise, fetchLastWorkoutDate, fetchWorkoutPlan } from "../services/dbService";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

const WORKOUT_DURATION = 45 * 60; // 45 minutes in seconds

export default function TasksScreen() {
    const { t } = useTranslation();
    const [exerciseList, setExerciseList] = useState(null);
    const [isWorkoutStartModalVisible, setIsWorkoutStartModalVisible] = useState(false);
    const [remainingTime, setRemainingTime] = useState(WORKOUT_DURATION);
    const [isRunning, setIsRunning] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const startWorkout = () => {
        setIsWorkoutStartModalVisible(false);
        setIsWorkoutActive(true);
        setIsRunning(true);
        setRemainingTime(WORKOUT_DURATION);

    };

    useEffect(() => {
        let interval = setInterval(() => {
            setRemainingTime(lastTimerCount => {
                if (isRunning) {
                    if (lastTimerCount == 0) {
                        stopWorkout();
                    } else {
                        lastTimerCount <= 1 && clearInterval(interval)
                        return lastTimerCount - 1
                    }
                }
                else {
                    return lastTimerCount
                }
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [isRunning]);

    const pauseWorkout = () => {
        setIsFinishing(false);
        if (isRunning) {
            setIsRunning(false);
        }
        else {
            setIsRunning(true);
        }
    };

    const finishingWorkout = () => {
        setIsFinishing(true);
        setIsRunning(false);
    }

    const stopWorkout = () => {
        setIsFinishing(false);
        setIsRunning(false);
        setIsWorkoutActive(false);
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        // uploadWorkout();
    };

    useFocusEffect(
        useCallback(() => {
            const checkAuthentication = async () => {
                await checkAuth();
            };
            checkAuthentication();

            const checkLastWorkoutDate = async () => {
                const lastWorkoutDate = await fetchLastWorkoutDate();
                if (lastWorkoutDate) {
                    const currentDate = new Date();
                    const timeDiff = Math.abs(currentDate.getTime() - new Date(lastWorkoutDate).getTime());
                    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (diffDays > 1) {
                        setIsWorkoutStartModalVisible(true);
                    } else {
                        setIsWorkoutStartModalVisible(false);
                        setIsWorkoutActive(false);
                    }
                } else {
                    setIsWorkoutStartModalVisible(true);
                }
            };
            checkLastWorkoutDate();

            const getWorkoutPlan = async () => {
                const wp = await fetchWorkoutPlan();

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

            return () => {
                // Cleanup function to clear the interval if the component unmounts
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };
        }, [])
    );

    return (
        <>
            <Stack.Screen options={{ headerTitle: t("tasksscreen_title") }} />

            <Modal visible={isWorkoutStartModalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{t("start_workout_message")}</Text>
                        <TouchableOpacity style={styles.playButton} onPress={startWorkout}>
                            <Text style={styles.playButtonText}>{t("start")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={isFinishing} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Are you sure you want to finish?</Text>
                        <TouchableOpacity style={styles.playButton} onPress={stopWorkout}>
                            <Text style={styles.playButtonText}>{t("yes")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playButton} onPress={pauseWorkout}>
                            <Text style={styles.playButtonText}>{t("no")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            
            <View style={styles.workoutControls}>
                {isWorkoutActive ? (
                <><Text style={styles.countdown}>{formatTime(remainingTime)}</Text><View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.controlButton} onPress={pauseWorkout}>
                            <FontAwesome name={isRunning ? "pause" : "play"} size={16} color="#5A2A2A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.controlButton} onPress={finishingWorkout}>
                            <FontAwesome name="stop" size={16} color="#5A2A2A" />
                        </TouchableOpacity>
                    </View></>
                ) : (
                    <>
                    <Text style={styles.countdown}>Workout of the day completed</Text>
                    <Text style={styles.countdown}>Great Job!</Text></>
                )}
            </View>

            <View style={[styles.container, !isRunning && styles.disabledContainer]}>
                {exerciseList && exerciseList.length > 0 ? (
                    <>
                        <View style={styles.grid}>
                            {exerciseList.map((exercise, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.card}
                                    onPress={() => router.push({
                                        pathname: "/exercise",
                                        params: {
                                            exercise: JSON.stringify(exercise),
                                            remainingTime: remainingTime,
                                            isRunning: String(isRunning),
                                        }
                                    })}
                                >
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
        justifyContent: "flex-start",
        alignItems: "center",
        margin: 20,
        marginBottom: 100,
        paddingTop: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    disabledContainer: {
        opacity: 0.5,
        pointerEvents: 'none',
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
        backgroundColor: "#ddd",
        padding: 20,
        borderRadius: 10,
        margin: 15,
        elevation: 3,
        alignItems: "center",
    },
    cardText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
        textAlign: "center",
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
        margin: 20,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    playButton: {
        backgroundColor: '#ddd',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    playButtonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    workoutControls: {
        padding: 15,
        marginTop: 100,
        alignItems: 'center',
    },
    countdown: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    controlButton: {
        backgroundColor: '#ddd',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
});