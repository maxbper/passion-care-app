import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Image, Pressable, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { checkAuth } from '../services/authService';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import LoopingImage from '../components/imageLoop';
import { refreshTokens } from '../components/wearable';
import { addXp, incrementExerciseAmount, uploadWorkout } from '../services/dbService';

const MAX_PAUSE_TIME = 10 * 60 * 1000; // 10 minutes in ms

export default function ExerciseScreen() {
  const { workoutPlan, warmup, workout, sex } = useLocalSearchParams();
  const parsedWorkoutPlan = workoutPlan ? JSON.parse(workoutPlan as string) : workoutPlan;
  const isWarmup = warmup ? JSON.parse(warmup as string) : false;
  const isWorkout = workout ? JSON.parse(workout as string) : false;
  const gender = sex ? JSON.parse(sex as string) : "male";
  const [currentIndex, setCurrentIndex] = useState(-3); // For 3-2-1 countdown
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pauseStart, setPauseStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [noTimer, setNoTimer] = useState(false);
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState<number | null>(null);
  const [endDate, setEndDate] = useState<number | null>(null);
  const [feedbackMood, setFeedbackMood] = useState<string | null>(null);
  const [skippedExercises, setSkippedExercises] = useState<string[]>([]);

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
      // Handle workout timers
      if(parsedWorkoutPlan[currentIndex].duration) {
        setTimeLeft(parsedWorkoutPlan[currentIndex].duration);
      } else {
        setNoTimer(true);
        setTimeLeft(parsedWorkoutPlan[currentIndex].reps);
      }
    }
  }, [currentIndex, hasStarted]);

  useEffect(() => {
    if (paused || timeLeft <= 0 || !hasStarted || transitioning) return;

    if (!noTimer) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    else {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 2000);
    }

    if (timeLeft === 1 && currentIndex >= 0) {
      if (!noTimer) {
        setTimeout(() => {
          setTransitioning(true);
          setNoTimer(false);
        }, 1000);
        setTimeout(() => {
          setTransitioning(false);
          setCurrentIndex((prev) => prev + 1)
        }, 2000);
      }
      else {
        setTimeout(() => {
          setTransitioning(true);
          setNoTimer(false);
        }, 2000);
        setTimeout(() => {
          setTransitioning(false);
          setCurrentIndex((prev) => prev + 1)
        }, 3000);
      }
    }
  }, [timeLeft, paused, hasStarted, transitioning]);

  const previous = () => {
    if(currentIndex <= 0) return;
    const temp = [...skippedExercises];
    if(temp.includes(parsedWorkoutPlan[currentIndex-1].exercise)) {
      const index = temp.indexOf(parsedWorkoutPlan[currentIndex-1].exercise);
      if (index > -1) {
        temp.splice(index, 1);
      }
    }
    setTransitioning(true);
    setSkippedExercises(temp);
    setCurrentIndex((prev) => prev - 1)
    setTimeout(() => {
      setTransitioning(false);
    }, 1000);
  }

  const next = () => {
    if(currentIndex >= parsedWorkoutPlan.length) return;
    const temp = [...skippedExercises];
    if(parsedWorkoutPlan[currentIndex].exercise !== "rest" && !temp.includes(parsedWorkoutPlan[currentIndex].exercise)) {
      temp.push(parsedWorkoutPlan[currentIndex].exercise);
    }
    setTransitioning(true);
    setSkippedExercises(temp);
    setCurrentIndex((prev) => prev + 1)
    setTimeout(() => {
      setTransitioning(false);
    }, 1000);
  }

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
            { cancelable: false }
        );
      } else {
        setPaused(false);
        setPauseStart(null);
      }
    }
  };

  const handleGoBack = async () => {
    if(isWarmup) {
      await ReactNativeAsyncStorage.setItem("warmupCompletedTime", Date.now().toString());
      await addXp(10);
    }
    else if(isWorkout) {
      let heartRateData = await fetchFitbitData();
      if (!heartRateData) {
        heartRateData = [];
      }
      const timeElapsed = endDate - startDate;

      let exercises = [];
      parsedWorkoutPlan.forEach((item) => {
        if(item.exercise !== "rest" && !exercises.includes(item.exercise)) {
          exercises.push(item.exercise);
        }
      }
      );
      skippedExercises.forEach((item) => {
        if(exercises.includes(item)) {
          const index = exercises.indexOf(item);
          if (index > -1) {
            exercises.splice(index, 1);
          }
        }
      }
      );

      if(exercises.length !== 0) {
        await uploadWorkout(timeElapsed, heartRateData, feedbackMood, exercises);
        await addXp(20);
      }
    }
    else {
      let exercises = [];
      parsedWorkoutPlan.forEach((item) => {
        if(item.exercise !== "rest" && !exercises.includes(item.exercise)) {
          exercises.push(item.exercise);
        }
      }
      );
      skippedExercises.forEach((item) => {
        if(exercises.includes(item)) {
          const index = exercises.indexOf(item);
          if (index > -1) {
            exercises.splice(index, 1);
          }
        }
      }
      );
      if(exercises.length !== 0) {
        await incrementExerciseAmount(parsedWorkoutPlan[0].exercise)
        await addXp(5);
      }
    }
    router.replace("/exercisePlan");
  };

  const handleStart = () => {
    setHasStarted(true);
    if(startTime === "") {
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
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTime = () => {
    const today = new Date();
    const hh = String(today.getHours()).padStart(2, '0');
    const mm = String(today.getMinutes()).padStart(2, '0');
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
      console.error('Error fetching Fitbit data:', error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (currentIndex >= parsedWorkoutPlan.length) {
    if(endTime === "") {
      const time = getTime();
      setEndTime(time);
      setEndDate(Date.now());
    }
    return (
      <View style={styles.container}>
        <Text style={styles.doneText}>{t("well_done")}</Text>

        {isWorkout ? (
          <>
        <Text style={{ fontSize: 18, marginVertical: 10 }}>{t("feel")}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '60%', marginBottom: 30 }}>
        <TouchableOpacity onPress={() => setFeedbackMood('sad')} style={feedbackMood==='sad' ? { backgroundColor: '#d1e7dd', borderWidth: 2, borderColor: '#0f5132', borderRadius: 30, height: 60, width: 60 } : {}}>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>😢</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFeedbackMood('neutral')} style={feedbackMood==='neutral' ? { backgroundColor: '#d1e7dd', borderWidth: 2, borderColor: '#0f5132', borderRadius: 30, height: 60, width: 60 } : {}}>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>😐</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFeedbackMood('happy')} style={feedbackMood==='happy' ? { backgroundColor: '#d1e7dd', borderWidth: 2, borderColor: '#0f5132', borderRadius: 30, height: 60, width: 60} : {}}>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>😊</Text>
        </TouchableOpacity>
      </View>
          </>
        ):null}

        <TouchableOpacity style={{ marginTop: 10, borderWidth: 2, borderColor: '#2E7D32', alignContent: 'center', justifyContent: 'center', borderRadius: 10, padding: 10 }} onPress={handleGoBack} >
          <Text style={{textAlign: 'center', alignSelf: 'center'}} >{t("submit")} </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if(!hasStarted) {
    return (
      <Pressable onPress={handleStart} style={styles.greenBackground}>
      <Text style={styles.initialText}>{t("tap")}</Text>
      </Pressable>
    );
  }


  return (
    <>
    <View style={[styles.container, { backgroundColor: transitioning ? "#845BB1" : '#F9FAFB' }]}>
      {currentIndex < 0 ? (
        <View style={styles.redBackground}>
        <Text style={styles.countdown}>{Math.abs(currentIndex)}</Text>
        </View>
      ) : (
        <>
          <LoopingImage key={currentIndex} gender={gender} exercise_name={parsedWorkoutPlan[currentIndex]?.exercise} />
          <Text style={styles.exerciseTitle}>{t(`exercises.${parsedWorkoutPlan[currentIndex]?.exercise}`)}</Text>
          {parsedWorkoutPlan[currentIndex]?.duration ? (
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          ) : (
            <Text style={styles.timer}>{timeLeft != 1 ? (`${timeLeft} reps`) : (`${timeLeft} rep`)}</Text>
          )}

          <Text style={styles.details}>
            {parsedWorkoutPlan[currentIndex]?.reps ? `${parsedWorkoutPlan[currentIndex].reps} ${t("reps")}` : ''} {parsedWorkoutPlan[currentIndex]?.sets ? (parsedWorkoutPlan[currentIndex]?.sets != 1 ? ` × ${parsedWorkoutPlan[currentIndex]?.sets} ${t("sets")}` : ` × ${parsedWorkoutPlan[currentIndex]?.sets} ${t("set")}`) : ''}
          </Text>

          <Text style={[styles.details, { marginTop: 20 }]}>
            {t(`description.${parsedWorkoutPlan[currentIndex]?.exercise}`)}
          </Text>

          <TouchableOpacity style={styles.previousButton} onPress={previous}>
            <Entypo name={"controller-fast-backward"} size={16} color="#845BB1"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <FontAwesome name={!paused ? "pause" : "play"} size={16} color="#845BB1"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={next}>
            <Entypo name={"controller-fast-forward"} size={16} color="#845BB1"/>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBackground: {
    alignItems: 'center',
    backgroundColor: "#845BB1",
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  greenBackground: {
    alignItems: 'center',
    backgroundColor: "#845BB1",
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingTop: 20,
    fontWeight: 'bold',
  },
  countdown: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseGif: {
    width: '100%',
    height: 200,
    marginBottom: 30,
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#845BB1',
  },
  details: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
  doneText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },
  pauseButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  previousButton: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  pauseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButton: {
    margin: 20,
  },
});