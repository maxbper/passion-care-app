import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { CheckCircle2, Lock } from "lucide-react-native";
import { router } from "expo-router";
import { checkAuth, getUid } from "../services/authService";
import {
    fetchLastWorkoutDate,
    fetchWorkoutPlan,
    fetchExercise,
    fetchWarmupPlan,
    fetchGender,
    fetchIsSuspended,
} from "../services/dbService";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import AppointmentModal from "./appointmentModal";

export default function TasksModal({ page = 0 }) {
    const [warmupCompleted, setWarmupCompleted] = useState(false);
    const [workoutCompleted, setWorkoutCompleted] = useState(false);
    const [lastDateChecked, setLastDateChecked] = useState(false);
    const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
    const [warmupPlan, setWarmupPlan] = useState<any[]>([]);
    const [gender, setGender] = useState<string | null>(null);
    const { t } = useTranslation();
    const [pageNumber, setPageNumber] = useState(page);

    const extraExercises = [
        "pinch",
        "walk_various_surfaces",
        "textures",
        "spiky_ball",
        "straight_line_walk",
        "ball_squeeze",
        "single_leg_stand",
        "stand_soft_surface",
        "side_weight_shift",
        "reach_fixed_support",
    ];
    const extraPlan = {
        pinch: [
            {
                exercise: "pinch",
                duration: 0,
                reps: 10,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 20,
            },
            {
                exercise: "pinch",
                duration: 0,
                reps: 10,
                sets: 1,
            },
        ],
        walk_various_surfaces: [
            {
                exercise: "walk_various_surfaces",
                duration: 600,
            },
        ],
        textures: [
            {
                exercise: "textures",
                duration: 300,
            },
        ],
        spiky_ball: [
            {
                exercise: "spiky_ball",
                duration: 180,
            },
        ],
        straight_line_walk: [
            {
                exercise: "straight_line_walk",
                duration: 0,
                reps: 10,
                sets: 2,
                interval: 3,
            },
            {
                exercise: "rest",
                duration: 3,
            },
            {
                exercise: "straight_line_walk",
                duration: 0,
                reps: 10,
                sets: 1,
            },
        ],
        ball_squeeze: [
            {
                exercise: "ball_squeeze",
                duration: 0,
                reps: 10,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 20,
            },
            {
                exercise: "ball_squeeze",
                duration: 0,
                reps: 10,
                sets: 1,
            },
        ],
        single_leg_stand: [
            {
                exercise: "single_leg_stand",
                duration: 30,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 20,
            },
            {
                exercise: "single_leg_stand",
                duration: 30,
                sets: 1,
            },
        ],
        stand_soft_surface: [
            {
                exercise: "stand_soft_surface",
                duration: 30,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 30,
            },
            {
                exercise: "stand_soft_surface",
                duration: 30,
                sets: 1,
            },
        ],
        side_weight_shift: [
            {
                exercise: "side_weight_shift",
                duration: 0,
                reps: 10,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 30,
            },
            {
                exercise: "side_weight_shift",
                duration: 0,
                reps: 10,
                sets: 1,
            },
        ],
        reach_fixed_support: [
            {
                exercise: "reach_fixed_support",
                duration: 0,
                reps: 8,
                sets: 2,
            },
            {
                exercise: "rest",
                duration: 30,
            },
            {
                exercise: "reach_fixed_support",
                duration: 0,
                reps: 8,
                sets: 1,
            },
        ],
    };
    const [index, setIndex] = useState(0);
    const [myUid, setMyUid] = useState("");
    const [suspended, setSuspended] = useState(false);

    const handleWarmup = () => {
        router.push({
            pathname: "/exercise",
            params: {
                workoutPlan: JSON.stringify(warmupPlan),
                warmup: "true",
                sex: JSON.stringify(gender),
            },
        });
    };

    const handleWorkout = () => {
        router.push({
            pathname: "/exercise",
            params: {
                workoutPlan: JSON.stringify(workoutPlan),
                workout: "true",
                sex: JSON.stringify(gender),
            },
        });
    };

    const handleExtra = (exercise: string) => {
        const extra = extraPlan[exercise];
        router.push({
            pathname: "/exercise",
            params: {
                workoutPlan: JSON.stringify(extra),
                sex: JSON.stringify(gender),
            },
        });
    };

    const getPlanNumber = (planString: string): string | null => {
        const match = planString.match(/\d+/);
        return match ? match[0] : null;
    };

    const handleIndexChange = () => {
        setIndex((prevIndex) => (prevIndex + 3) % extraExercises.length);
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
            const uid = getUid();
            if (uid) {
                setMyUid(uid);
            }
        };
        checkAuthentication();

        const isUserSuspended = async () => {
            const isSuspended = await fetchIsSuspended();
            if (isSuspended) {
                setSuspended(true);
            } else {
                setSuspended(false);
            }
        };
        isUserSuspended();

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
                if (now - parseInt(warmupCompetedTime, 10) <= 30 * 60 * 1000) {
                    // 30 minutes
                    setWarmupCompleted(true);
                } else {
                    setWarmupCompleted(false);
                }
            } else {
                setWarmupCompleted(false);
            }
        };

        const getWarmupPlan = async () => {
            const [_, plan] = await fetchWorkoutPlan();
            const warmupPlan = "warmup_" + getPlanNumber(plan);
            const wp = await fetchWarmupPlan(warmupPlan);

            const fetchedWarmupExercises = await Promise.all(
                wp.map(async (element) => {
                    if (element.substring(0, 4) === "rest") {
                        const rest_time = element.substring(5);
                        const rest = {
                            exercise: "rest",
                            duration: parseInt(rest_time),
                        };
                        return rest;
                    }
                    const [name, attr] = await fetchExercise(element, warmupPlan);
                    if (attr.sets && attr.sets > 1) {
                        const sets = attr.sets;
                        const exercises = [];
                        for (let i = 0; i < sets; i++) {
                            const exercise = {
                                exercise: name,
                                duration: attr.duration ? attr.duration : 0,
                                reps: attr.reps ? attr.reps : 0,
                                sets: attr.sets ? attr.sets - i : 0,
                            };
                            exercises.push(exercise);
                            if (exercise.sets > 1) {
                                const rest = {
                                    exercise: "rest",
                                    duration: parseInt(attr.interval),
                                };
                                exercises.push(rest);
                            }
                        }
                        return exercises;
                    } else {
                        const exercise = {
                            exercise: name,
                            duration: attr.duration ? attr.duration : 0,
                            reps: attr.reps ? attr.reps : 0,
                            sets: attr.sets ? attr.sets : 0,
                        };
                        return exercise;
                    }
                }),
            );
            setWarmupPlan(fetchedWarmupExercises.flat());
        };

        const getWorkoutPlan = async () => {
            const [wp, plan] = await fetchWorkoutPlan();

            const fetchedWorkoutExercises = await Promise.all(
                wp.map(async (element) => {
                    if (element.substring(0, 4) === "rest") {
                        const rest_time = element.substring(5);
                        const rest = {
                            exercise: "rest",
                            duration: parseInt(rest_time),
                        };
                        return rest;
                    }
                    const [name, attr] = await fetchExercise(element, plan);
                    if (attr.sets && attr.sets > 1) {
                        const sets = attr.sets;
                        const exercises = [];
                        for (let i = 0; i < sets; i++) {
                            const exercise = {
                                exercise: name,
                                duration: attr.duration ? attr.duration : 0,
                                reps: attr.reps ? attr.reps : 0,
                                sets: attr.sets ? attr.sets - i : 0,
                            };
                            exercises.push(exercise);
                            if (exercise.sets > 1) {
                                const rest = {
                                    exercise: "rest",
                                    duration: parseInt(attr.interval),
                                };
                                exercises.push(rest);
                            }
                        }
                        return exercises;
                    } else {
                        const exercise = {
                            exercise: name,
                            duration: attr.duration ? attr.duration : 0,
                            reps: attr.reps ? attr.reps : 0,
                            sets: attr.sets ? attr.sets : 0,
                        };
                        return exercise;
                    }
                }),
            );
            setWorkoutPlan(fetchedWorkoutExercises.flat());
        };
        if (!workoutPlan.length) {
            getWarmupPlan();
            getWorkoutPlan();
        }

        const getGender = async () => {
            const gender = await fetchGender();
            setGender(gender);
        };
        getGender();
    }, [lastDateChecked, workoutPlan, warmupPlan]);

    const suspendedWarning = () => {
        Alert.alert(t("workout_locked_title"), t("dont_exercise"), [{ text: t("ok"), onPress: () => {} }], {
            cancelable: false,
        });
    };

    const Block = ({
        title,
        onPress,
        disabled,
        completed,
        half,
        icon,
        onDisablePress,
        allowDisablePress,
    }: {
        title: string;
        onPress: () => void;
        disabled?: boolean;
        completed?: boolean;
        half?: boolean;
        icon?: string;
        onDisablePress?: () => void;
        allowDisablePress?: boolean;
    }) => {
        let containerStyle = [styles.block];
        if (completed) {
            containerStyle.push(styles.completed);
        } else if (disabled) {
            containerStyle.push(styles.disabled);
        }
        if (half) {
            //containerStyle.push({ width: "41%" });
            containerStyle.push({
                width: "41%",
                margin: 10,
                marginTop: 0,
                marginBottom: 3,
                marginLeft: 10,
                marginRight: 10,
            });
        } else {
            containerStyle.push({ width: "90%" });
        }

        return (
            <Pressable
                onPress={allowDisablePress ? onDisablePress : onPress}
                disabled={allowDisablePress ? completed : disabled || completed}
                style={containerStyle}
            >
                <Text style={styles.blockText}>{title}</Text>

                {completed ? (
                    <CheckCircle2 size={24} color="#22c55e" />
                ) : disabled && !half ? (
                    <Lock size={24} color="#6b7280" />
                ) : icon === "run" ? (
                    <FontAwesome6 name="person-running" size={26} color={"#845BB1"} />
                ) : icon === "history" ? (
                    <FontAwesome5 name="comment-medical" size={26} color={"#845BB1"} />
                ) : null}
            </Pressable>
        );
    };

    if (pageNumber === 0) {
        return (
            <>
                <Block
                    title={t("exercises_name")}
                    onPress={() => {
                        router.push("/exercisePlan");
                    }}
                    disabled={suspended}
                    allowDisablePress={suspended}
                    onDisablePress={suspendedWarning}
                    icon={"run"}
                />
                {/* <Block title={t("appointment_title")} onPress={() => {}}/> */}
                <AppointmentModal />
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        alignItems: "center",
                        marginBottom: 10,
                    }}
                >
                    <Block
                        title={t("forms")}
                        onPress={() => {
                            router.push({
                                pathname: "/history",
                                params: {
                                    uid: JSON.stringify(myUid),
                                    forms: "true",
                                },
                            });
                        }}
                        icon={"history"}
                    />
                </View>
                {/* <Block title={t("exercise_history")} onPress={() => {} } /> */}
            </>
        );
    }
    if (pageNumber === 1) {
        return (
            <>
                <Block
                    title={t("workout_plan")}
                    onPress={() => {
                        setPageNumber(2);
                    }}
                    disabled={suspended}
                    allowDisablePress={suspended}
                    onDisablePress={suspendedWarning}
                />
                <Block
                    title={t("extra_exercises")}
                    onPress={() => {
                        router.push("/sensori");
                    }}
                />
                <Block
                    title={t("back")}
                    onPress={() => {
                        router.push("/home");
                    }}
                />
            </>
        );
    }
    if (pageNumber === 2) {
        return (
            <>
                {warmupPlan.length > 0 && workoutPlan.length > 0 ? (
                    <>
                        <Block title={t("warmup")} onPress={handleWarmup} completed={warmupCompleted} />
                        <Block title={t("workout")} onPress={handleWorkout} completed={workoutCompleted} />
                        <Block
                            title={t("back")}
                            onPress={() => {
                                setPageNumber(1);
                            }}
                        />
                    </>
                ) : (
                    <ActivityIndicator size="large" color="#845BB1" style={{ marginBottom: 20 }} />
                )}
            </>
        );
    }
    if (pageNumber === 3) {
        return (
            <>
                {extraExercises.map((exercise, idx) => (
                    <Block
                        key={idx}
                        title={t(`exercises.${exercise}`)}
                        onPress={() => {
                            handleExtra(exercise);
                        }}
                    />
                ))}
                {/* <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>

          <Block
            title={t("previous_page")}
            onPress={() => setIndex((prevIndex) => Math.max(prevIndex - 2, 0))}
            disabled={index <= 0}
            half={true}
          />

          <Block
            title={t("next_page")}
            onPress={() => setIndex((prevIndex) => Math.min(prevIndex + 2, extraExercises.length))}
            disabled={index + 2 >= extraExercises.length}
            half={true}
          />
      </View> */}
            </>
        );
    }
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
        borderWidth: 1,
        borderColor: "#845BB1",
    },
    blockText: {
        fontSize: 18,
        fontWeight: "600",
    },
    completed: {
        backgroundColor: "#DCFCE7",
        borderWidth: 1,
        borderColor: "#4ADE80",
    },
    disabled: {
        backgroundColor: "#E5E7EB",
    },
});
