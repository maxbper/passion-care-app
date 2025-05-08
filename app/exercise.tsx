import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Image, Pressable, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { checkAuth } from '../services/authService';
import { FontAwesome } from '@expo/vector-icons';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import LoopingImage from '../components/imageLoop';
import { refreshTokens } from '../components/wearable';
import { uploadWorkout } from '../services/dbService';
import { en } from '../constants/translations/lang';

const MAX_PAUSE_TIME = 10 * 60 * 1000; // 10 minutes in ms

export default function ExerciseScreen() {
  const { workoutPlan, warmup, workout, sex } = useLocalSearchParams();
  const parsedWorkoutPlan = workoutPlan ? JSON.parse(workoutPlan as string) : workoutPlan;
  const isWarmup = warmup ? JSON.parse(warmup as string) : "false";
  const isWorkout = workout ? JSON.parse(workout as string) : "false";
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
  const [startDate, setStartDate] = useState<number | null>(null);;
  const [endDate, setEndDate] = useState<number | null>(null);;

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
                    onPress: () => router.replace("/home"),
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
    }
    if(isWorkout) {
      const heartRateData = await fetchFitbitData();
      const timeElapsed = endDate - startDate;
      await uploadWorkout(timeElapsed, heartRateData);
    }
    router.replace("/home");
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
        <Text style={styles.doneText}>Well Done!</Text>
        <Button title="Back" onPress={handleGoBack} />
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
    <View style={[styles.container, { backgroundColor: transitioning ? '#00FF00' : '#F9FAFB' }]}>
      {currentIndex < 0 ? (
        <View style={styles.redBackground}>
        <Text style={styles.countdown}>{Math.abs(currentIndex)}</Text>
        </View>
      ) : (
        <>
          <Image
            source={require(`../assets/images/image1.png`)}
            style={styles.exerciseGif}
            resizeMode="contain" />

          {/* <LoopingImage /> */}

          <Text style={styles.exerciseTitle}>{parsedWorkoutPlan[currentIndex]?.exercise}</Text>
          {parsedWorkoutPlan[currentIndex]?.duration ? (
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          ) : (
            <Text style={styles.timer}>{timeLeft} reps</Text>
          )}

          <Text style={styles.details}>
            {parsedWorkoutPlan[currentIndex]?.reps ? `${parsedWorkoutPlan[currentIndex].reps} reps` : ''} {parsedWorkoutPlan[currentIndex]?.sets ? ` × ${parsedWorkoutPlan[currentIndex]?.sets} sets` : ''}
          </Text>

          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <FontAwesome name={!paused ? "pause" : "play"} size={16} color="#5A2A2A" />
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
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  greenBackground: {
    alignItems: 'center',
    backgroundColor: '#00FF00',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 16,
    color: '#000',
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
    color: '#E15E3C',
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