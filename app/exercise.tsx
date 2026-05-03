import { Audio } from "expo-av";
import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Pressable,
    Alert,
    Dimensions,
    ScrollView,
} from "react-native";
import { router, Stack, useLocalSearchParams, useNavigation } from "expo-router";
import { checkAuth } from "../services/authService";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import LoopingImage from "../components/imageLoop";
import { refreshTokens } from "../components/wearable";
import { addXp, incrementExerciseAmount, updateRepMultiplierFromFeedback, uploadWorkout } from "../services/dbService";

const MAX_PAUSE_TIME = 10 * 60 * 1000; // 10 minutes in ms

export default function ExerciseScreen() {
    const beepSound = require("../assets/sound/beep.mp3");
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    useEffect(() => {
        // Load sound once
        async function loadSound() {
            const { sound } = await Audio.Sound.createAsync(beepSound);
            setSound(sound);
        }
        loadSound();
        return () => {
            if (sound) sound.unloadAsync();
        };
    }, []);

    const { workoutPlan, warmup, workout, sex } = useLocalSearchParams();

    const parseSearchParam = <T,>(param: string | string[] | undefined, fallback: T): T => {
        if (!param) return fallback;

        const rawValue = Array.isArray(param) ? param[0] : param;
        if (!rawValue) return fallback;

        try {
            const parsed = JSON.parse(rawValue);
            return (parsed ?? fallback) as T;
        } catch {
            return fallback;
        }
    };

    const workoutPlanParam = parseSearchParam<unknown>(workoutPlan, []);
    const parsedWorkoutPlan = Array.isArray(workoutPlanParam) ? workoutPlanParam : [];
    const isWarmup = parseSearchParam<boolean>(warmup, false);
    const isWorkout = parseSearchParam<boolean>(workout, false);
    const gender = parseSearchParam<string>(sex, "male");
    const [currentIndex, setCurrentIndex] = useState(-3); // For 3-2-1 countdown
    const [timeLeft, setTimeLeft] = useState(0);
    const [paused, setPaused] = useState(false);
    const [pauseStart, setPauseStart] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const [noTimer, setNoTimer] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const { t } = useTranslation();
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [startDate, setStartDate] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<number | null>(null);
    const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
    const [skippedExercises, setSkippedExercises] = useState<string[]>([]);
    const [clocking, setClocking] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            await checkAuth();
        };
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (paused || !hasStarted) return;

        if (currentIndex === -3 || currentIndex === -2 || currentIndex === -1) {
            // Handle 3-2-1 countdown
            setTimeLeft(Math.abs(currentIndex));
            timerRef.current = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
            }, 1000);
        } else if (currentIndex >= 0 && currentIndex < parsedWorkoutPlan.length) {
            // Only set timer for duration-based exercises
            if (parsedWorkoutPlan[currentIndex].duration) {
                setNoTimer(false);
                setTimeLeft(parsedWorkoutPlan[currentIndex].duration);
            } else {
                setNoTimer(true);
                setTimeLeft(0); // No timer for rep-based exercises
            }
        }
    }, [currentIndex, hasStarted]);

    useEffect(() => {
        // Only run timer logic for duration-based exercises
        if (paused || !hasStarted || transitioning || clocking) return;
        if (noTimer) return; // Don't run timer for rep-based exercises
        if (timeLeft <= 0) return;
        setClocking(true);

        // Play sound when timer is 3, 2, or 1
        if (timeLeft == 3 && sound) {
            sound.replayAsync();
        }

        if (timeLeft === 1 && currentIndex >= 0) {
            setTimeout(() => {
                setTransitioning(true);
                setNoTimer(false);
            }, 1000);
            setTimeout(() => {
                setTransitioning(false);
                setCurrentIndex((prev) => prev + 1);
            }, 2000);
            setTimeout(() => {
                setClocking(false);
            }, 3000);
        } else {
            timerRef.current = setTimeout(() => {
                setTimeLeft((prev) => prev - 1);
                setClocking(false);
            }, 1000);
        }
    }, [timeLeft, paused, hasStarted, transitioning, clocking]);

    const previous = () => {
        if (transitioning || currentIndex <= 0) return;
        const temp = [...skippedExercises];
        if (temp.includes(parsedWorkoutPlan[currentIndex - 1].exercise)) {
            const index = temp.indexOf(parsedWorkoutPlan[currentIndex - 1].exercise);
            if (index > -1) {
                temp.splice(index, 1);
            }
        }
        setTransitioning(true);
        setSkippedExercises(temp);
        setCurrentIndex((prev) => prev - 1);
        setTimeout(() => {
            setTransitioning(false);
        }, 1000);
    };

    const next = () => {
        if (transitioning || currentIndex >= parsedWorkoutPlan.length) return;
        const temp = [...skippedExercises];
        if (
            parsedWorkoutPlan[currentIndex].exercise !== "rest" &&
            !temp.includes(parsedWorkoutPlan[currentIndex].exercise)
        ) {
            temp.push(parsedWorkoutPlan[currentIndex].exercise);
        }
        setTransitioning(true);
        setSkippedExercises(temp);
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => {
            setTransitioning(false);
        }, 1000);
    };

    const handlePause = async () => {
        if (!paused) {
            setPaused(true);
            setPauseStart(Date.now());
            if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            if (pauseStart && Date.now() - pauseStart > MAX_PAUSE_TIME) {
                Alert.alert(
                    t("warning"),
                    t("pause_warning"),
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/exercisePlan"),
                        },
                    ],
                    { cancelable: false },
                );
            } else {
                setPaused(false);
                setClocking(false);
                setPauseStart(null);
            }
        }
    };

    const handleGoBack = async () => {
        if (isWarmup) {
            await ReactNativeAsyncStorage.setItem("warmupCompletedTime", Date.now().toString());
            await addXp(10);
        } else if (isWorkout) {
            if (feedbackScore === null) {
                Alert.alert(
                    t("warning"),
                    t("feedback_warning"),
                    [
                        {
                            text: "OK",
                        },
                    ],
                    { cancelable: false },
                );
                return;
            }
            let heartRateData = await fetchFitbitData();
            if (!heartRateData) {
                heartRateData = [];
            }
            const timeElapsed = endDate - startDate;

            let exercises = [];
            parsedWorkoutPlan.forEach((item) => {
                if (item.exercise !== "rest" && !exercises.includes(item.exercise)) {
                    exercises.push(item.exercise);
                }
            });
            skippedExercises.forEach((item) => {
                if (exercises.includes(item)) {
                    const index = exercises.indexOf(item);
                    if (index > -1) {
                        exercises.splice(index, 1);
                    }
                }
            });

            if (exercises.length !== 0) {
                await uploadWorkout(timeElapsed, heartRateData, String(feedbackScore), exercises);
                await updateRepMultiplierFromFeedback(feedbackScore);
                await addXp(20);
            }
        } else {
            let exercises = [];
            parsedWorkoutPlan.forEach((item) => {
                if (item.exercise !== "rest" && !exercises.includes(item.exercise)) {
                    exercises.push(item.exercise);
                }
            });
            skippedExercises.forEach((item) => {
                if (exercises.includes(item)) {
                    const index = exercises.indexOf(item);
                    if (index > -1) {
                        exercises.splice(index, 1);
                    }
                }
            });
            if (exercises.length !== 0) {
                await incrementExerciseAmount(parsedWorkoutPlan[0].exercise);
                await addXp(5);
            }
        }
        router.replace({
            pathname: "/exercisePlan",
            params: {
                p: JSON.stringify(true),
            },
        });
    };

    const handleStart = () => {
        setHasStarted(true);
        if (startTime === "") {
            const time = getTime();
            setStartTime(time);
            setStartDate(Date.now());
        }
    };

    const getToken = async () => {
        const tokens = await ReactNativeAsyncStorage.getItem("tokens");
        if (!tokens) return null;

        const accessToken = JSON.parse(tokens).accessToken;
        const expiresIn = JSON.parse(tokens).expiresIn;
        const issuedAt = JSON.parse(tokens).issuedAt;

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = issuedAt + expiresIn;

        if (now < expiresAt - 60) return accessToken;

        const new_accessToken = await refreshTokens(tokens);
        if (!new_accessToken) return null;
        return new_accessToken;
    };

    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const getTime = () => {
        const today = new Date();
        const hh = String(today.getHours()).padStart(2, "0");
        const mm = String(today.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    const fetchFitbitData = async () => {
        const token = await getToken();
        if (!token) {
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };
        const date = getTodayDate();

        try {
            const url = `https://api.fitbit.com//1/user/-/activities/heart/date/${date}/1d/1min/time/${startTime}/${endTime}.json`; // /1min/time/${startTime}/${endTime}
            const response = await fetch(url, { headers });
            const data = await response.json();

            return data["activities-heart"][0].heartRateZones;
        } catch (error) {
            console.error("Error fetching Fitbit data:", error);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const getExerciseImageName = (exerciseName?: string) => {
        if (!exerciseName) return exerciseName;

        // Map names like "march_place_1" to "march_place" for image lookup.
        if (exerciseName.length >= 2 && exerciseName.charAt(exerciseName.length - 2) === "_") {
            return exerciseName.slice(0, -2);
        }

        return exerciseName;
    };

    if (currentIndex >= parsedWorkoutPlan.length) {
        if (endTime === "") {
            const time = getTime();
            setEndTime(time);
            setEndDate(Date.now());
        }
        return (
            <View style={[styles.container, { height: Dimensions.get("window").height }]}>
                {/* <Text style={styles.doneText}>{t("well_done")}</Text> */}

                {isWorkout ? (
                    <>
                        <Text style={{ fontSize: 18, marginVertical: 10 }}>{t("feel")}</Text>
                        <View
                            style={{
                                alignItems: "stretch",
                                width: "90%",
                                marginBottom: 30,
                            }}
                        >
                            <Text style={{ textAlign: "center", fontSize: 16, marginBottom: 12 }}>
                                {feedbackScore === null
                                    ? t("feedback.choose")
                                    : `${feedbackScore} - ${t(`feedback.${feedbackScore}`)}`}
                            </Text>
                            <Slider
                                minimumValue={0}
                                maximumValue={10}
                                step={1}
                                value={feedbackScore ?? 5}
                                onValueChange={(value) => setFeedbackScore(value)}
                                minimumTrackTintColor="#27d430"
                                maximumTrackTintColor="#ec1b1b"
                                thumbTintColor="#845BB1"
                            />
                            <View
                                style={{
                                    width: "95%",
                                    alignSelf: "center",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text>😐</Text>
                                <Text>🙂</Text>
                                <Text>🙂</Text>
                                <Text>🙂</Text>
                                <Text>😅</Text>
                                <Text>😅</Text>
                                <Text>😮‍💨</Text>
                                <Text>😮‍💨</Text>
                                <Text>😣</Text>
                                <Text>😫</Text>
                                <Text>😵</Text>
                            </View>
                        </View>
                    </>
                ) : null}

                <TouchableOpacity
                    style={{
                        marginTop: 10,
                        borderWidth: 2,
                        borderColor: "#2E7D32",
                        alignContent: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        padding: 10,
                    }}
                    onPress={handleGoBack}
                >
                    <Text style={{ textAlign: "center", alignSelf: "center" }}>{t("submit")} </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!hasStarted) {
        if (showPreview) {
            return (
                <View style={[styles.container, { backgroundColor: "#fff", height: Dimensions.get("window").height }]}>
                    <Text
                        style={{
                            fontSize: 24,
                            fontWeight: "bold",
                            marginBottom: 20,
                            marginTop: 20,
                            textAlign: "center",
                        }}
                    >
                        {t("workout_plan")}
                    </Text>
                    <View style={{ flex: 1, width: "90%", paddingTop: 50 }}>
                        <ScrollView>
                            {parsedWorkoutPlan && parsedWorkoutPlan.length > 0 ? (
                                parsedWorkoutPlan.map((exercise, idx) =>
                                    exercise.exercise === "rest" ||
                                    (idx > 0 &&
                                        parsedWorkoutPlan[idx - 1].exercise === parsedWorkoutPlan[idx].exercise) ||
                                    (idx > 1 &&
                                        parsedWorkoutPlan[idx - 1].exercise === "rest" &&
                                        parsedWorkoutPlan[idx - 2].exercise ===
                                            parsedWorkoutPlan[idx].exercise) ? null : (
                                        <View
                                            key={idx}
                                            style={{
                                                marginBottom: 16,
                                                padding: 12,
                                                backgroundColor: "#f2f2f2",
                                                borderRadius: 8,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>
                                                {t(`exercises.${exercise.exercise}`)}
                                            </Text>
                                            {exercise.reps ? (
                                                <Text>
                                                    {t("reps")} : {exercise.reps}
                                                </Text>
                                            ) : null}
                                            {exercise.duration ? (
                                                <Text>
                                                    {t("duration")} : {exercise.duration}s
                                                </Text>
                                            ) : null}
                                            {exercise.sets ? (
                                                <Text>
                                                    {t("sets")} : {exercise.sets}
                                                </Text>
                                            ) : null}
                                        </View>
                                    ),
                                )
                            ) : (
                                <Text>{t("no_workouts")}</Text>
                            )}
                        </ScrollView>
                    </View>
                    <Button
                        title={t("start") || "Start Workout"}
                        onPress={() => {
                            setShowPreview(false);
                            handleStart();
                        }}
                        color="#845BB1"
                    />
                </View>
            );
        } else {
            return (
                <Pressable
                    onPress={handleStart}
                    style={[styles.greenBackground, { height: Dimensions.get("window").height }]}
                >
                    <Text style={styles.initialText}>{t("tap")}</Text>
                </Pressable>
            );
        }
    }

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: transitioning ? "#845BB1" : "#F9FAFB", height: Dimensions.get("window").height },
                ]}
            >
                {currentIndex < 0 ? (
                    <View style={styles.redBackground}>
                        <Text style={styles.countdown}>{Math.abs(currentIndex)}</Text>
                    </View>
                ) : (
                    <>
                        <LoopingImage
                            key={currentIndex}
                            gender={gender}
                            exercise_name={getExerciseImageName(parsedWorkoutPlan[currentIndex]?.exercise)}
                        />
                        <Text style={styles.exerciseTitle}>
                            {t(`exercises.${parsedWorkoutPlan[currentIndex]?.exercise}`)}
                        </Text>
                        {parsedWorkoutPlan[currentIndex]?.duration ? (
                            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
                        ) : (
                            <Text style={styles.timer}>
                                {parsedWorkoutPlan[currentIndex]?.reps}
                                {` ${t("reps")}`}
                            </Text>
                        )}

                        <Text style={[styles.details, { marginTop: 20 }]}>
                            {t(`description.${parsedWorkoutPlan[currentIndex]?.exercise}`)}
                        </Text>

                        <TouchableOpacity style={styles.previousButton} onPress={previous}>
                            <Entypo name={"controller-fast-backward"} size={16} color="#845BB1" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextButton} onPress={next}>
                            <Entypo name={"controller-fast-forward"} size={16} color="#845BB1" />
                        </TouchableOpacity>
                        {/* Show Done button at the bottom for rep-based exercises */}
                        {parsedWorkoutPlan[currentIndex]?.duration ? (
                            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                                <FontAwesome name={!paused ? "pause" : "play"} size={16} color="#845BB1" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.doneButton}>
                                <Button
                                    title={t("done") || "Done"}
                                    onPress={() => setCurrentIndex((prev) => prev + 1)}
                                    color="#845BB1"
                                />
                            </View>
                        )}
                    </>
                )}

                <Modal visible={paused} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                            <FontAwesome name={!paused ? "pause" : "play"} size={16} color="#5A2A2A" />
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    redBackground: {
        alignItems: "center",
        backgroundColor: "#845BB1",
        height: "100%",
        width: "100%",
        justifyContent: "center",
    },
    greenBackground: {
        alignItems: "center",
        backgroundColor: "#845BB1",
        width: "100%",
        justifyContent: "center",
    },
    initialText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
        paddingTop: 20,
        fontWeight: "bold",
    },
    countdown: {
        fontSize: 80,
        fontWeight: "bold",
        color: "#fff",
    },
    exerciseGif: {
        width: "100%",
        height: 200,
        marginBottom: 30,
    },
    exerciseTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    timer: {
        fontSize: 48,
        marginVertical: 20,
        fontWeight: "bold",
        color: "#845BB1",
    },
    details: {
        fontSize: 20,
        color: "#333",
        textAlign: "center",
    },
    doneButton: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    doneText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#2E7D32",
        marginBottom: 20,
    },
    pauseButton: {
        position: "absolute",
        bottom: 40,
        backgroundColor: "#F9FAFB",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
    },
    nextButton: {
        position: "absolute",
        bottom: 40,
        right: 10,
        backgroundColor: "#F9FAFB",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
    },
    previousButton: {
        position: "absolute",
        bottom: 40,
        left: 10,
        backgroundColor: "#F9FAFB",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
    },
    pauseText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
    },
    modalButton: {
        margin: 20,
    },
});
